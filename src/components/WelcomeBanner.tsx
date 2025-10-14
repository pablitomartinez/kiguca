"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type UserInfo = {
  name: string | null;
  email: string | null;
  picture: string | null;
};

function saludoDelDia() {
  const h = new Date().getHours();
  if (h < 12) return "¡Buenos días";
  if (h < 19) return "¡Buenas tardes";
  return "¡Buenas noches";
}

export default function WelcomeBanner() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (!u) { setUser(null); setLoading(false); return; }
      const meta = u.user_metadata || {};
      const name =
        meta.full_name || meta.name || meta.given_name || meta.user_name || null;
      const picture = meta.avatar_url || meta.picture || null;
      setUser({
        name: name ?? null,
        email: u.email ?? null,
        picture: picture ?? null,
      });
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border p-4 bg-muted/30 animate-pulse">
        <div className="h-4 w-28 rounded bg-foreground/10 mb-2" />
        <div className="h-5 w-40 rounded bg-foreground/10" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-xl border p-4 bg-muted/30">
        <p className="text-sm text-muted-foreground">
          Bienvenido a Kiguca. Iniciá sesión para ver tu panel personal.
        </p>
      </div>
    );
  }

  const nombre = user.name ?? user.email ?? "Conductor";
  const inicial = (user.name || user.email || "?").slice(0, 1).toUpperCase();

  return (
    <section className="rounded-xl border bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-4">
      <div className="flex items-center gap-3">
        {/* Avatar reducido */}
        {user.picture ? (
          <img
            src={user.picture}
            alt={nombre}
            className="h-10 w-10 rounded-full object-cover border"
          />
        ) : (
          <div className="h-10 w-10 rounded-full border flex items-center justify-center text-base font-semibold">
            {inicial}
          </div>
        )}

        {/* Texto más compacto */}
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground leading-none">
            {saludoDelDia()},
          </p>
          <h2 className="text-lg font-semibold truncate">{nombre}! 👋</h2>
          <p className="text-xs text-muted-foreground">
            Gestioná ingresos, combustible y
          mantenimiento desde acá.
          </p>
        </div>

        {/* Acciones: botones discretos */}
        {/* <div className="ml-auto flex-shrink-0 flex gap-2">
          <a
            href="/historial"
            className="rounded-lg border px-3 py-1.5 text-xs hover:bg-accent"
          >
            Historial
          </a>
          <a
            href="/ingresos/new"
            className="rounded-lg border px-3 py-1.5 text-xs hover:bg-accent"
          >
            Ingreso
          </a>
        </div> */}
      </div>
    </section>
  );
}
