"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const sub = supabase.auth.onAuthStateChange((_e, session) => {
      setSignedIn(!!session?.user);
      setReady(true);
    }).data.subscription;

    supabase.auth.getUser().then(({ data }) => {
      setSignedIn(!!data.user);
      setReady(true);
    });

    return () => sub?.unsubscribe();
  }, []);

  if (!ready) return <div className="p-6">Cargando…</div>;
  if (!signedIn) {
    router.push("/login");
    return null;
  }
  return <>{children}</>;
}
