import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login", "/register", "/favicon.ico", "/_next", "/logo_estudo_aprovado.svg"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route)
  );

  if (isPublic) return NextResponse.next();

  const authCookie = request.cookies.get("estudo-aprovado-auth");
  let isAuthenticated = false;

  if (authCookie) {
    try {
      const data = JSON.parse(decodeURIComponent(authCookie.value));
      isAuthenticated = data.state?.isAuthenticated === true;
    } catch {
      // ignore parse error
    }
  }

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo_estudo_aprovado.svg).*)"],
};
