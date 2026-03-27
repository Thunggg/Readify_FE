import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const AUTH_ROUTES = new Set([
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
]);

// Public pages (do not require login)
const PUBLIC_ROUTES = new Set([
  "/",
  "/products",
  "/discover",
  "/blog",
  "/about",
  "/contact",
  "/promotions",
]);

const PUBLIC_PREFIXES = ["/category/", "/book/", "/blog/"];

const ADMIN_PREFIX = "/admin";
const ADMIN_ALLOWED_ROLES = new Set([1, 2, 3]);

function isPublicPath(pathname: string) {
  if (PUBLIC_ROUTES.has(pathname)) return true;
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}

function base64UrlToString(input: string) {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  return atob(padded);
}

function decodeJwtPayload(token?: string) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const json = base64UrlToString(parts[1]);
    return JSON.parse(json) as any;
  } catch {
    return null;
  }
}

function getSafeNext(path: string | null) {
  if (!path) return null;
  if (!path.startsWith("/")) return null;
  if (path.startsWith("//")) return null;
  return path;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip Next.js internals, static files, and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("accessToken")?.value;
  const isAuthed = typeof accessToken === "string" && accessToken.length > 0;

  // Auth pages: if already logged in -> redirect away
  if (AUTH_ROUTES.has(pathname)) {
    if (!isAuthed) return NextResponse.next();

    const payload = decodeJwtPayload(accessToken);
    const role = typeof payload?.role === "number" ? payload.role : undefined;
    const nextFromQuery = getSafeNext(request.nextUrl.searchParams.get("next"));
    const redirectTo =
      nextFromQuery ??
      (role && ADMIN_ALLOWED_ROLES.has(role) ? "/admin/income" : "/");

    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  // Public pages: always allow
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Protected pages: require login
  if (!isAuthed) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin pages: also require admin-like role (best-effort, no signature verify)
  if (pathname.startsWith(ADMIN_PREFIX)) {
    const payload = decodeJwtPayload(accessToken);
    const role = typeof payload?.role === "number" ? payload.role : undefined;
    if (role == null || !ADMIN_ALLOWED_ROLES.has(role)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

