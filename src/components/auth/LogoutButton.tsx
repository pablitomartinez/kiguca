"use client";
import { supabase } from "@/lib/supabase/client";

export default function LogoutButton() {
  return (
    <button
      className="rounded border px-3 py-2"
      onClick={async () => {
        await supabase.auth.signOut();
        location.href = "/login";
      }}
    >
      Cerrar sesión
    </button>
  );
}
