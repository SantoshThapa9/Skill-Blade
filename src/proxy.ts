import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const protectedPagePaths = ["/dashboard", "/admin"];

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtected =
    protectedPagePaths.some((prefix) => path.startsWith(prefix)) ||
    /^\/courses\/[^/]+\/learn/.test(path);
  if (!isProtected) return NextResponse.next();

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET ?? process.env.JWT_SECRET,
  });

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (path.startsWith("/admin") && token.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/courses/:courseId/learn/:path*"],
};
