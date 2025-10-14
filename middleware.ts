// /middleware.ts  (en la RAÍZ del repo)
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

// Patrón: bloquear TODO excepto estas rutas públicas
const PUBLIC_PREFIXES = [
  "/login",
  "/auth/callback",
  "/_next",
  "/icons",
  "/api",
];
const PUBLIC_EXACT = [
  "/favicon.ico",
  "/manifest.json",
  "/robots.txt",
  "/sitemap.xml",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Permitir rutas públicas
  if (
    PUBLIC_PREFIXES.some((p) => pathname.startsWith(p)) ||
    PUBLIC_EXACT.includes(pathname)
  ) {
    return NextResponse.next();
  }

  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          res.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return res;
}

// 🔒 Bloquea todo salvo lo público (negative lookahead)
export const config = {
  matcher: [
    // todo lo que NO empiece por estos prefijos/archivos será interceptado
    "/((?!_next|icons|api|favicon.ico|manifest.json|robots.txt|sitemap.xml|auth/callback|login).*)",
  ],
};
