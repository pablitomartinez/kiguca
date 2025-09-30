"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import LogoutButton from "@/components/auth/LogoutButton";
import { getStorage } from "@/lib/storage";
import { createClient } from "@supabase/supabase-js";

export default function SupabaseSettingsPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "ok" | "error" | "checking">(
    "idle"
  );
  const [statusMsg, setStatusMsg] = useState<string>("");

  // Cliente de supabase leyendo ENV (prod/dev)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = useMemo(
    () => createClient(supabaseUrl, supabaseAnon),
    [supabaseUrl, supabaseAnon]
  );

  useEffect(() => {
    supabase.auth
      .getUser()
      .then(({ data }) => setEmail(data.user?.email ?? null));
  }, [supabase]);

  async function testConnection() {
    try {
      setStatus("checking");
      setStatusMsg("Probando conexión…");
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

  async function exportData() {
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
      const s = getStorage();
      const res = await s.import?.(json);
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

  return (
    <div className="p-4 space-y-6">
      {/* Estado */}
      <Card>
        <CardHeader>
          <CardTitle>Estado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-1">
            <div>
              <b>Motor de datos:</b> Supabase (sincronizado)
            </div>
            <div>
              <b>Usuario:</b> {email ?? "No logueado"}
            </div>
          </div>
          <div className="flex items-center gap-2">
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
        </CardContent>
      </Card>

      {/* Variables de entorno (solo referencia) */}
      <Card>
        <CardHeader>
          <CardTitle>Entorno</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>
            <b>NEXT_PUBLIC_STORAGE_ENGINE:</b> <code>supabase</code>
          </div>
          <div className="text-muted-foreground">
            Las credenciales se toman de <code>.env.local</code> (dev) o de las
            Environment Variables en Vercel (prod).
          </div>
        </CardContent>
      </Card>

      {/* Datos */}
      <Card>
        <CardHeader>
          <CardTitle>Datos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Button variant="secondary" onClick={exportData}>
              Exportar datos (JSON)
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
        <CardContent className="space-y-2">
          <LogoutButton />
          <div className="text-xs text-muted-foreground">
            Si no ves tu sesión, iniciá desde la pantalla de Login con Magic
            Link.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
