// components/UserProfileCard.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type UserInfo = {
  id: string;
  email: string | null;
  name: string | null;
  picture: string | null;
};

export default function UserProfileCard() {
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      const u = data.user;
      if (!u) return setUser(null);

      const meta = u.user_metadata || {};
      const name =
        meta.full_name ||
        meta.name ||
        meta.given_name ||
        meta.user_name ||
        null;
      const picture = meta.avatar_url || meta.picture || null;

      setUser({
        id: u.id,
        email: u.email || null,
        name,
        picture,
      });
    };
    load();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (!user) {
    return (
      <div className="rounded-2xl border p-4">
        <div className="text-sm text-muted-foreground">Cargando perfil…</div>
      </div>
    );
  }

  const initial = (user.name || user.email || "?").slice(0, 1).toUpperCase();

  return (
    <div className="rounded-2xl border p-4 flex items-center gap-4">
      {/* Avatar */}
      {user.picture ? (
        <img
          src={user.picture}
          alt={user.name ?? "Usuario"}
          className="h-14 w-14 rounded-full object-cover border"
        />
      ) : (
        <div className="h-14 w-14 rounded-full border flex items-center justify-center text-xl font-bold">
          {initial}
        </div>
      )}

      {/* Info */}
      <div className="flex-1">
        <div className="text-sm text-muted-foreground">Hola</div>
        <div className="text-lg font-semibold">{user.name ?? "Usuario"}</div>
        <div className="text-sm text-muted-foreground">{user.email}</div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <button
          onClick={signOut}
          className="rounded-xl border px-3 py-2 text-sm hover:bg-accent"
        >
          Cerrar sesión
        </button>

        {/* Placeholder para “Cambiar foto” (necesita Storage si querés implementarlo) */}
        {/* <button className="rounded-xl border px-3 py-2 text-sm hover:bg-accent">
          Cambiar foto
        </button> */}
      </div>
    </div>
  );
}
