import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { siteConfig } from "@/config/site";
import {
  ADMIN_PATH_PREFIXES,
  COOKIE_ACCESS,
  COOKIE_REFRESH,
  PROTECTED_PATH_PREFIXES,
} from "@/constants";
import { applySecurityHeaders } from "@/lib/security/helmet-headers";
import { verifyAccessTokenEdge } from "@/lib/auth/jwt-edge";

const intlMiddleware = createMiddleware({
  locales: [...siteConfig.locales],
  defaultLocale: siteConfig.defaultLocale,
  localePrefix: "always",
});

function stripLocale(pathname: string): string {
  const parts = pathname.split("/");
  const maybeLocale = parts[1];
  if (siteConfig.locales.includes(maybeLocale as (typeof siteConfig.locales)[number])) {
    const rest = parts.slice(2).join("/");
    return rest ? `/${rest}` : "/";
  }
  return pathname;
}

function isProtected(path: string): boolean {
  return PROTECTED_PATH_PREFIXES.some(
    (p) => path === p || path.startsWith(`${p}/`),
  );
}

function isAdminPath(path: string): boolean {
  return ADMIN_PATH_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    const res = NextResponse.next();
    return applySecurityHeaders(res);
  }

  const response = intlMiddleware(req);
  applySecurityHeaders(response);

  const pathWithoutLocale = stripLocale(pathname);
  const access = req.cookies.get(COOKIE_ACCESS)?.value;
  const refresh = req.cookies.get(COOKIE_REFRESH)?.value;

  if (isProtected(pathWithoutLocale)) {
    const token = access ?? refresh;
    if (!token) {
      const locale = pathname.split("/")[1] || siteConfig.defaultLocale;
      const loginUrl = new URL(`/${locale}/login`, req.url);
      loginUrl.searchParams.set("next", pathname);
      return applySecurityHeaders(NextResponse.redirect(loginUrl));
    }

    try {
      // Access and refresh share the same claim shape; refresh uses a different secret,
      // so only verify with the access secret when we have an access cookie.
      if (access) {
        const payload = await verifyAccessTokenEdge(access);
        if (isAdminPath(pathWithoutLocale) && payload.role !== "admin") {
          const locale = pathname.split("/")[1] || siteConfig.defaultLocale;
          return applySecurityHeaders(
            NextResponse.redirect(new URL(`/${locale}`, req.url)),
          );
        }
      } else if (refresh) {
        // Soft-allow when only refresh is present; /api/auth/refresh will rotate cookies.
        // Decode payload without access-secret verify for role check only when needed.
        if (isAdminPath(pathWithoutLocale)) {
          const locale = pathname.split("/")[1] || siteConfig.defaultLocale;
          const loginUrl = new URL(`/${locale}/login`, req.url);
          loginUrl.searchParams.set("next", pathname);
          return applySecurityHeaders(NextResponse.redirect(loginUrl));
        }
      }
    } catch {
      if (!refresh) {
        const locale = pathname.split("/")[1] || siteConfig.defaultLocale;
        const loginUrl = new URL(`/${locale}/login`, req.url);
        loginUrl.searchParams.set("next", pathname);
        return applySecurityHeaders(NextResponse.redirect(loginUrl));
      }
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
