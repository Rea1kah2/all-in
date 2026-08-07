import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

// Fallback dari era mock/Laravel, dijaga selama keduanya masih bisa dipakai
// lewat NEXT_PUBLIC_ENABLE_MOCK_API atau backend Laravel partner.
const LEGACY_SESSION_COOKIES = ["laravel_session", "mock_session"];

const protectedPrefixes = [
  "/home",
  "/analysis",
  "/history",
  "/companies",
  "/watchlist",
  "/profile",
  "/settings",
  "/news",
];

const guestOnlyPaths = ["/login", "/register"];

/**
 * `getSessionCookie` hanya membaca keberadaan cookie, tidak memvalidasinya ke
 * database. Cukup untuk gerbang di middleware (edge, tidak boleh menyentuh
 * Postgres), validasi sungguhan tetap terjadi di tiap Route Handler lewat
 * `getAuth().api.getSession()`.
 */
function hasSession(request: NextRequest) {
  if (getSessionCookie(request)) return true;
  return LEGACY_SESSION_COOKIES.some((name) => request.cookies.has(name));
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
