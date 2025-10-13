// /lib/supabase/server.ts
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export const createSupabaseServer = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(_name: string, _value: string, _options: CookieOptions) {
          // En Server Components, cookies() es de solo lectura,
          // así que normalmente seteamos cookies en route handlers o middleware.
          // Este set acá es no-op a propósito (patrón recomendado por Supabase).
        },
        remove(_name: string, _options: CookieOptions) {
          // Igual que set: manejar en route handlers / middleware cuando haga falta.
        },
      },
    }
  );
};
