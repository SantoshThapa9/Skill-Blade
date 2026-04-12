import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { created, handleApiError } from "@/lib/api";
import { signupSchema } from "@/lib/validation";
import { User } from "@/models/User";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const input = signupSchema.parse(await request.json());
    const existing = await User.findOne({ email: input.email });
    if (existing) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }

    const wantsAdmin = input.role === "admin";
    const adminInviteCode = process.env.ADMIN_INVITE_CODE;
    const role =
      wantsAdmin && adminInviteCode && input.adminCode === adminInviteCode
        ? "admin"
        : "user";

    const user = await User.create({
      name: input.name,
      email: input.email,
      password: await bcrypt.hash(input.password, 12),
      role,
    });

    return created({
      user: { id: user._id.toString(), name: user.name, email: user.email, role },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
