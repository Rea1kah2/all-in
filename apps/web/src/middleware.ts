import { type NextRequest, NextResponse } from "next/server";

const SESSION_COOKIES = ["laravel_session", "mock_session"];

const protectedPrefixes = ["/home", "/analysis", "/companies", "/watchlist", "/settings"];

const guestOnlyPaths = ["/login", "/register"];

function hasSession(request: NextRequest) {
  return SESSION_COOKIES.some((name) => request.cookies.has(name));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authenticated = hasSession(request);

  const isProtected = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (isProtected && !authenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (guestOnlyPaths.includes(pathname) && authenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
