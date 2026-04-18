import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { createSessionCookies } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  const email = String(body?.email ?? "")
    .trim()
    .toLowerCase();
  const password = String(body?.password ?? "");
  const role = String(body?.role ?? "user") as "user" | "admin";
  const adminPasscode = String(body?.adminPasscode ?? "");

  if (!name || !email || password.length < 6) {
    return NextResponse.json(
      { error: "Name, email, and password are required." },
      { status: 400 },
    );
  }

  await connectToDatabase();
  const existing = await User.findOne({ email });
  if (existing) {
    return NextResponse.json(
      { error: "Email already exists." },
      { status: 409 },
    );
  }

  if (role === "admin") {
    const passcode = process.env.ADMIN_SIGNUP_PASSCODE ?? "";
    if (!passcode || adminPasscode !== passcode) {
      return NextResponse.json(
        { error: "Invalid admin passcode." },
        { status: 403 },
      );
    }
  }

  const user = await User.create({
    name,
    email,
    password: await bcrypt.hash(password, 10),
    role,
  });

  const sessionUser = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const response = NextResponse.json({ user: sessionUser });
  const cookies = createSessionCookies(sessionUser);
  response.headers.append("Set-Cookie", cookies[0]);
  response.headers.append("Set-Cookie", cookies[1]);
  return response;
}
