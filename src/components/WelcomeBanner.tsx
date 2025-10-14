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
      if (!u) {
        setUser(null);
        setLoading(false);
        return;
      }
      const meta = u.user_metadata || {};
      const name =
        meta.full_name ||
        meta.name ||
        meta.given_name ||
        meta.user_name ||
        null;
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
      <div className="rounded-2xl border p-5 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 animate-pulse">
        <div className="h-6 w-36 rounded bg-foreground/10 mb-2" />
        <div className="h-4 w-64 rounded bg-foreground/10" />
      </div>
    );
  }

  // Si no hay sesión, muestra un banner genérico
  if (!user) {
    return (
      <div className="rounded-2xl border p-5 bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
        <h2 className="text-xl font-semibold">Bienvenido a Kiguca</h2>
        <p className="text-sm text-muted-foreground">
          Iniciá sesión para ver tu panel personal.
        </p>
      </div>
    );
  }

  const nombre = user.name ?? user.email ?? "Conductor";
  const inicial = (user.name || user.email || "?").slice(0, 1).toUpperCase();

  return (
    <div className="rounded-2xl border p-5 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center gap-4">
      {/* Avatar */}
      {user.picture ? (
        <img
          src={user.picture}
          alt={nombre}
          className="h-14 w-14 rounded-full object-cover border"
        />
      ) : (
        <div className="h-14 w-14 rounded-full border flex items-center justify-center text-xl font-bold">
          {inicial}
        </div>
      )}

      {/* Texto */}
      <div className="flex-1">
        <div className="text-sm text-muted-foreground">{saludoDelDia()},</div>
        <div className="text-2xl font-bold leading-tight">{nombre}! 👋</div>
        <p className="text-sm text-muted-foreground">
          Estás en tu inicio de sesión. Gestioná ingresos, combustible y
          mantenimiento desde acá.
        </p>
      </div>

      {/* Acciones rápidas (opcionales) */}
      <div className="flex flex-col gap-2">
        <a
          href="/historial"
          className="rounded-xl border px-3 py-2 text-sm hover:bg-accent"
        >
          Ver historial
        </a>
        <a
          href="/ingresos/new"
          className="rounded-xl border px-3 py-2 text-sm hover:bg-accent"
        >
          Nuevo ingreso
        </a>
      </div>
    </div>
  );
}
