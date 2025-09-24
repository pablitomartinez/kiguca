"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getStorage } from "../../../lib/storage";
import LogoutButton from "@/components/auth/LogoutButton";

const UL = "kiguca_supabase_url";
const AK = "kiguca_supabase_key";
const ENG = "kiguca_storage_engine";

export default function SupabaseSettingsPage() {
  const [url, setUrl] = useState("");
  const [key, setKey] = useState("");
  const [engine, setEngine] = useState<"local" | "supabase">("local");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setUrl(localStorage.getItem(UL) ?? "");
    setKey(localStorage.getItem(AK) ?? "");
    setEngine((localStorage.getItem(ENG) as any) ?? "local");
  }, []);

  function save() {
    if (typeof window === "undefined") return;
    localStorage.setItem(UL, url.trim());
    localStorage.setItem(AK, key.trim());
    localStorage.setItem(ENG, engine);
    alert("Guardado. En dev tomamos estos valores desde localStorage.");
  }

  async function exportLocal() {
    const s = getStorage();
    const data = await s.export?.();
    const json = JSON.stringify(data ?? {}, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "kiguca_export.json";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const envSnippet = [
    `NEXT_PUBLIC_STORAGE_ENGINE=${engine}`,
    `NEXT_PUBLIC_SUPABASE_URL=${url || "<tu-url>"}`,
    `NEXT_PUBLIC_SUPABASE_ANON_KEY=${key || "<tu-anon-key>"}`,
  ].join("\n");

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Supabase – Configuración</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <LogoutButton />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Project URL</Label>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xyz.supabase.co"
              />
            </div>
            <div className="space-y-1">
              <Label>Anon Key</Label>
              <Input
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="eyJhbGciOi..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Adapter</Label>
            <div className="flex gap-2">
              <Button
                variant={engine === "local" ? "default" : "outline"}
                onClick={() => setEngine("local")}
              >
                LocalStorage
              </Button>
              <Button
                variant={engine === "supabase" ? "default" : "outline"}
                onClick={() => setEngine("supabase")}
              >
                Supabase (beta)
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              En dev, la app leerá estas preferencias desde localStorage. Para
              prod, copiá el snippet en tu <code>.env.local</code>.
            </p>
          </div>

          <div className="space-y-2">
            <Label>.env.local (sugerido)</Label>
            <pre className="rounded bg-muted/20 p-3 text-xs whitespace-pre-wrap">
              {envSnippet}
            </pre>
          </div>

          <div className="flex gap-2">
            <Button onClick={save}>Guardar</Button>
            <Button variant="secondary" onClick={exportLocal}>
              Exportar datos locales (JSON)
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pasos en Supabase</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              Creá un proyecto en{" "}
              <a
                className="underline"
                href="https://supabase.com"
                target="_blank"
              >
                Supabase
              </a>
              .
            </li>
            <li>
              En la consola SQL, ejecutá los archivos de <code>/sql</code>:{" "}
              <code>create_tables.sql</code>, <code>views.sql</code> y{" "}
              <code>policies.sql</code>.
            </li>
            <li>
              En <em>Project Settings → API</em>, copiá <strong>URL</strong> y{" "}
              <strong>anon key</strong>.
            </li>
            <li>Volvé acá, pegá URL y Anon Key, y elegí “Supabase (beta)”.</li>
          </ol>
          <p className="text-xs text-muted-foreground">
            Nota: el adapter Supabase puede estar stub. Cuando lo activemos, la
            app usará lectura/escritura real en Postgres.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
