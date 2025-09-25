"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LogoutButton from "@/components/auth/LogoutButton";
import { getStorage } from "@/lib/storage";
import { supabase } from "@/lib/supabase/client";

const UL = "kiguca_supabase_url";
const AK = "kiguca_supabase_key";
const ENG = "kiguca_storage_engine";

export default function SupabaseSettingsPage() {
  const [url, setUrl] = useState("");
  const [key, setKey] = useState("");
  const [engine, setEngine] = useState<"local" | "supabase">("local");
  const [status, setStatus] = useState<"idle" | "ok" | "error" | "checking">(
    "idle"
  );
  const [statusMsg, setStatusMsg] = useState<string>("");

  // cargar preferencias guardadas (dev override por localStorage)
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
    alert(
      "Guardado. En dev, la app leerá estas credenciales desde localStorage."
    );
  }

  function applyEngine(next: "local" | "supabase") {
    if (typeof window === "undefined") return;
    if (next === "supabase" && (!url.trim() || !key.trim())) {
      alert("Completá URL y Anon Key antes de cambiar a Supabase.");
      return;
    }
    localStorage.setItem(ENG, next);
    setEngine(next);
    alert(`Adapter cambiado a: ${next}. Recargá la página si no ves cambios.`);
  }

  async function testConnection() {
    try {
      setStatus("checking");
      setStatusMsg("Probando conexión…");
      // prueba simple: contar 1 fila de ingresos
      const { error } = await supabase
        .from("ingresos")
        .select("id", { count: "exact", head: true })
        .limit(1);
      if (error) throw error;
      setStatus("ok");
      setStatusMsg("Conexión OK");
    } catch (e: any) {
      console.error(e);
      setStatus("error");
      setStatusMsg(e?.message ?? "Error de conexión");
    }
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

  async function importToSupabase(file: File) {
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      // llamamos a la importación del adapter
      const s = await import("@/lib/storage");
      const storage = s.getStorage?.() ?? s.storage;
      const res = await storage.import?.(json);
      alert(
        `Importación terminada.\nCreados: ${res?.created ?? 0}\nActualizados: ${
          res?.updated ?? 0
        }\nErrores: ${res?.errors?.length ?? 0}`
      );
    } catch (err) {
      console.error(err);
      alert("No se pudo importar el archivo. Ver consola.");
    }
  }

  const envSnippet = [
    `NEXT_PUBLIC_STORAGE_ENGINE=${engine}`,
    `NEXT_PUBLIC_SUPABASE_URL=${url || "<tu-url>"}`,
    `NEXT_PUBLIC_SUPABASE_ANON_KEY=${key || "<tu-anon-key>"}`,
  ].join("\n");

  return (
    <div className="p-4 space-y-6">
      {/* Estado actual */}
      <Card>
        <CardHeader>
          <CardTitle>Estado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm">
            <div>
              <b>Adapter actual:</b> {engine}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Button size="sm" onClick={testConnection} variant="outline">
                Probar conexión
              </Button>
              {status !== "idle" && (
                <span
                  className={
                    status === "ok"
                      ? "text-green-500 text-sm"
                      : status === "checking"
                      ? "text-muted-foreground text-sm"
                      : "text-red-500 text-sm"
                  }
                >
                  {statusMsg}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credenciales Supabase */}
      <Card>
        <CardHeader>
          <CardTitle>Supabase – Credenciales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
          <div className="flex gap-2">
            <Button onClick={save}>Guardar</Button>
            <Button variant="secondary" onClick={testConnection}>
              Probar conexión
            </Button>
          </div>

          <div className="space-y-2">
            <Label>.env.local (sugerido para prod)</Label>
            <pre className="rounded bg-muted/20 p-3 text-xs whitespace-pre-wrap">
              {envSnippet}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Elegir adapter */}
      <Card>
        <CardHeader>
          <CardTitle>Adapter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2">
            <Button
              variant={engine === "local" ? "default" : "outline"}
              onClick={() => applyEngine("local")}
            >
              LocalStorage
            </Button>
            <Button
              variant={engine === "supabase" ? "default" : "outline"}
              onClick={() => applyEngine("supabase")}
            >
              Supabase (beta)
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            En desarrollo, la app usa estas preferencias desde localStorage. En
            producción, definilas en <code>.env.local</code>.
          </p>
        </CardContent>
      </Card>

      {/* Datos */}
      <Card>
        <CardHeader>
          <CardTitle>Datos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Button variant="secondary" onClick={exportLocal}>
              Exportar datos locales (JSON)
            </Button>

            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) await importToSupabase(file);
                  e.currentTarget.value = "";
                }}
              />
              <span className="rounded border px-3 py-2">
                Importar JSON → Supabase
              </span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Sesión */}
      <Card>
        <CardHeader>
          <CardTitle>Sesión</CardTitle>
        </CardHeader>
        <CardContent>
          <LogoutButton />
        </CardContent>
      </Card>
    </div>
  );
}
