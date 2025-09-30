// components/settings/AdapterStatus.tsx
"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

export default function AdapterStatus() {
  const [engine, setEngine] = useState<string>("supabase");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    setEngine(
      (process.env.NEXT_PUBLIC_STORAGE_ENGINE || "supabase").toLowerCase()
    );
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    supabase.auth
      .getUser()
      .then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  return (
    <div className="rounded-lg border p-4 space-y-2">
      <p>
        <strong>Motor de datos:</strong>{" "}
        {engine === "supabase" ? "Supabase (sincronizado)" : "LocalStorage"}
      </p>
      <p>
        <strong>Usuario:</strong> {email ?? "No logueado"}
      </p>
    </div>
  );
}
