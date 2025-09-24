"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    setLoading(false);
    if (error) {
      setErr(error.message);
      return;
    }
    router.push("/"); // a Home
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-3">
        <h1 className="text-2xl font-bold">Ingresá</h1>
        <input
          className="w-full rounded border p-2 bg-background"
          placeholder="tu@email.com"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full rounded border p-2 bg-background"
          placeholder="••••••••"
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          required
        />
        {err && <p className="text-red-500 text-sm">{err}</p>}
        <button
          className="w-full rounded bg-primary text-primary-foreground p-2"
          disabled={loading}
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
