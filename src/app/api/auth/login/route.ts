import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { createSessionCookies } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = String(body?.email ?? "")
    .trim()
    .toLowerCase();
  const password = String(body?.password ?? "");

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 },
    );
  }

  await connectToDatabase();
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 },
    );
  }

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
