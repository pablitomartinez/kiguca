// /app/auth/callback/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  // Al volver de Google, Supabase completa el flujo y setea la sesión en cookies.
  // Redirigimos a tu área logueada (cámbialo si querés).
  return NextResponse.redirect(
    new URL("/", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000")
  );
}
