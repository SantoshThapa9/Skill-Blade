import bcrypt from "bcryptjs";
import type { AuthOptions, User as NextAuthUser } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { loginSchema } from "@/lib/validation";

export type Role = "user" | "admin";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

type AuthorizedUser = NextAuthUser & {
  role: Role;
};

export const authOptions: AuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const input = loginSchema.parse(credentials);
        await connectToDatabase();
        const user = await User.findOne({ email: input.email }).select("+password");

        if (!user || !(await bcrypt.compare(input.password, user.password))) {
          return null;
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        } satisfies AuthorizedUser;
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as AuthorizedUser).role;
        token.name = user.name;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role as Role;
        session.user.name = token.name;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET ?? process.env.JWT_SECRET,
};

export async function getSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  return {
    id: session.user.id,
    name: session.user.name ?? "",
    email: session.user.email,
    role: session.user.role,
  } satisfies SessionUser;
}

export async function requireSession(role?: Role) {
  const session = await getSession();
  if (!session) {
    throw new Response(JSON.stringify({ error: "Authentication required" }), {
      status: 401,
    });
  }
  if (role && session.role !== role) {
    throw new Response(JSON.stringify({ error: "Admin access required" }), {
      status: 403,
    });
  }
  return session;
}
