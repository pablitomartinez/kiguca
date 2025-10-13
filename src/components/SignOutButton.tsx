"use client";
import { supabase } from "@/lib/supabase/client";

export default function SignOutButton() {
  const onClick = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };
  return <button onClick={onClick}>Cerrar sesión</button>;
}