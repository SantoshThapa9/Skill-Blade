import crypto from "crypto";
import type { Role } from "@/models/User";
import { User } from "@/models/User";

const TOKEN_NAME = "skillToken";
const PUBLIC_USER_NAME = "skillUser";
const SECRET = process.env.JWT_SECRET || "dev-secret";
const MAX_AGE = 60 * 60 * 24 * 7;

function base64UrlEncode(value: string) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(value: string) {
  const text = value.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(text, "base64").toString("utf8");
}

function signToken(payload: object) {
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(`${header}.${body}`)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `${header}.${body}.${signature}`;
}

function verifyToken(token: string) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, body, signature] = parts;
  const expected = crypto
    .createHmac("sha256", SECRET)
    .update(`${header}.${body}`)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  if (signature !== expected) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(body));
    return payload;
  } catch {
    return null;
  }
}

function parseCookies(header: string | null) {
  if (!header) return {} as Record<string, string>;
  return Object.fromEntries(
    header.split(";").map((cookie) => {
      const [name, ...rest] = cookie.trim().split("=");
      return [name, rest.join("=")];
    }),
  );
}

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export function createSessionCookies(user: SessionUser) {
  const token = signToken({
    ...user,
    exp: Math.floor(Date.now() / 1000) + MAX_AGE,
  });
  const publicUser = encodeURIComponent(
    JSON.stringify({ name: user.name, role: user.role }),
  );

  return [
    `${TOKEN_NAME}=${token}; Path=/; Max-Age=${MAX_AGE}; SameSite=Lax`,
    `${PUBLIC_USER_NAME}=${publicUser}; Path=/; Max-Age=${MAX_AGE}; SameSite=Lax`,
  ];
}

export function getSession(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  const cookies = parseCookies(cookieHeader);
  const token = cookies[TOKEN_NAME];
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload || typeof payload !== "object") return null;
  const user = payload as SessionUser & { exp?: number };
  if (user.exp && Date.now() / 1000 > user.exp) return null;
  return user;
}

export async function requireAuth(request: Request, role?: Role) {
  const session = getSession(request);
  if (!session) {
    throw new Response(JSON.stringify({ error: "Authentication required." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (role && session.role !== role) {
    throw new Response(JSON.stringify({ error: "Admin access required." }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  return session;
}
