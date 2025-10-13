// app/(app-layout)/_components/UserMenu.tsx
"use client";
import { supabase } from "@/lib/supabase/client";

export function UserMenu() {
  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <button onClick={signOut} className="text-sm">
      Cerrar sesión
    </button>
  );
}
