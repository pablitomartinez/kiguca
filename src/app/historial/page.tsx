"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getStorage } from "@/lib/storage";
import { formatCurrency } from "@/lib/utils/format";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";


import type {
  Ingreso as IngresoBase,
  Combustible as CombustibleBase,
  Mantenimiento as MantenimientoBase,
} from "@/types";

type Ingreso = IngresoBase & { id: string };
type Combustible = CombustibleBase & { id: string };
type Mantenimiento = MantenimientoBase & { id: string };

type PlataformaFilter = "all" | "uber" | "didi";
type Tab = "ingresos" | "combustible" | "mantenimiento";

export default function HistorialPage() {
  const [tab, setTab] = useState<Tab>("ingresos");

  // Ingresos
  const [ingresos, setIngresos] = useState<Ingreso[]>([]);
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const searchParams = useSearchParams();
  const [plataforma, setPlataforma] = useState<PlataformaFilter>("all");


  useEffect(() => {
    const qsFrom = searchParams.get("from");
    const qsTo = searchParams.get("to");

    // Validación básica YYYY-MM-DD
    const isDate = (s: string | null) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);

    setFrom((prev) => (isDate(qsFrom) ? qsFrom! : prev));
    setTo((prev) => (isDate(qsTo) ? qsTo! : prev));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  
  // Combustible
  const [fuel, setFuel] = useState<Combustible[]>([]);
  // Mantenimiento
  const [mant, setMant] = useState<Mantenimiento[]>([]);

  useEffect(() => {
    const load = async () => {
      const s = getStorage();

      const li = await s.ingresos.list();
      setIngresos(li.filter((x): x is Ingreso => typeof x.id === "string"));

      const lc = await s.combustible.list();
      setFuel(lc.filter((x): x is Combustible => typeof x.id === "string"));

      const lm = await s.mantenimiento.list();
      setMant(lm.filter((x): x is Mantenimiento => typeof x.id === "string"));
    };
    load();
  }, []);

  // Filtros de ingresos
  const filteredIngresos = useMemo(() => {
    const fromT = from ? new Date(from).getTime() : -Infinity;
    const toT = to ? new Date(to).getTime() : Infinity;
    return ingresos.filter((i) => {
      const t = new Date(i.fecha).getTime();
      const okDate = t >= fromT && t <= toT;
      const okPlat = plataforma === "all" ? true : i.plataforma === plataforma;
      return okDate && okPlat;
    });
  }, [ingresos, from, to, plataforma]);

  const totals = useMemo(() => {
    const bruto = filteredIngresos.reduce((acc, i) => acc + (i.bruto || 0), 0);
    const neto = filteredIngresos.reduce((acc, i) => acc + (i.neto || 0), 0);
    const horas = filteredIngresos.reduce((acc, i) => acc + (i.horas || 0), 0);
    const viajes = filteredIngresos.reduce(
      (acc, i) => acc + (i.viajes || 0),
      0
    );
    return { bruto, neto, horas, viajes };
  }, [filteredIngresos]);

  // Helpers export
  function fileName(base: string, ext: "csv" | "json") {
    const now = new Date().toISOString().slice(0, 10);
    return `${base}_${now}.${ext}`;
  }
  function csvEscape(v: string | number) {
    const s = String(v ?? "");
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  }
  function exportJSON(data: any[], base: string) {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fileName(base, "json");
    a.click();
    URL.revokeObjectURL(a.href);
  }
  function exportCSVFromArrayOfObjects(data: any[], base: string) {
    if (data.length === 0) return;
    const headers = Array.from(
      data.reduce<Set<string>>((set, row) => {
        Object.keys(row).forEach((k) => set.add(k));
        return set;
      }, new Set())
    );
    const rows = data.map((row) =>
      headers.map((h) => csvEscape((row as any)[h] ?? ""))
    );
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fileName(base, "csv");
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function handleDelete(
    kind: "ingresos" | "combustible" | "mantenimiento",
    id: string
  ) {
    if (!confirm("¿Eliminar este registro?")) return;
    const s = getStorage();
    try {
      let ok = false;
      if (kind === "ingresos") ok = await s.ingresos.remove(id);
      if (kind === "combustible") ok = await s.combustible.remove(id);
      if (kind === "mantenimiento") ok = await s.mantenimiento.remove(id);

      if (!ok) {
        toast.error("No se pudo eliminar.");
        return;
      }

      // refrescar listas en memoria
      if (kind === "ingresos")
        setIngresos((prev) => prev.filter((i) => i.id !== id));
      if (kind === "combustible")
        setFuel((prev) => prev.filter((c) => c.id !== id));
      if (kind === "mantenimiento")
        setMant((prev) => prev.filter((m) => m.id !== id));

      toast.success("Eliminado.");
    } catch (e) {
      console.error(e);
      toast.error("Error al eliminar.");
    }
  }

  // UI
  return (
    <div className="p-4 space-y-4">
      {/* Header + conmutador */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Historial</h1>
        <div className="flex gap-2">
          <Button
            variant={tab === "ingresos" ? "default" : "outline"}
            onClick={() => setTab("ingresos")}
          >
            Ingresos
          </Button>
          <Button
            variant={tab === "combustible" ? "default" : "outline"}
            onClick={() => setTab("combustible")}
          >
            Combustible
          </Button>
          <Button
            variant={tab === "mantenimiento" ? "default" : "outline"}
            onClick={() => setTab("mantenimiento")}
          >
            Mantenimiento
          </Button>
        </div>
      </div>

      {/* Acciones según tab */}
      {tab === "ingresos" && (
        <>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/ingresos/new">Nuevo ingreso</Link>
            </Button>
            <Button
              variant="secondary"
              onClick={() => exportJSON(filteredIngresos, "ingresos")}
            >
              Export JSON
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                exportCSVFromArrayOfObjects(filteredIngresos, "ingresos")
              }
            >
              Export CSV
            </Button>
          </div>

          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div>
                  <Label>Desde</Label>
                  <Input
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Hasta</Label>
                  <Input
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Plataforma</Label>
                  <select
                    className="w-full rounded border bg-background p-2"
                    value={plataforma}
                    onChange={(e) =>
                      setPlataforma(e.target.value as PlataformaFilter)
                    }
                  >
                    <option value="all">Todas</option>
                    <option value="uber">Uber</option>
                    <option value="didi">DiDi</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setFrom("");
                      setTo("");
                      setPlataforma("all");
                    }}
                  >
                    Limpiar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Totales + lista */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Ingresos</CardTitle>
              <div className="text-sm text-muted-foreground">
                Neto:{" "}
                <span className="font-semibold">
                  {formatCurrency(totals.neto)}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {filteredIngresos.length === 0 && (
                <p className="text-muted-foreground">Sin registros.</p>
              )}
              <ul className="divide-y rounded border">
                {filteredIngresos.map((i) => (
                  <li
                    key={i.id}
                    className="p-3 grid grid-cols-2 md:grid-cols-4 gap-2"
                  >
                    <div className="text-sm">
                      <div className="font-medium">{i.fecha}</div>
                      <div className="text-muted-foreground capitalize">
                        {i.plataforma}
                      </div>
                    </div>
                    <div className="text-sm">
                      <div>
                        Bruto:{" "}
                        <span className="font-medium">
                          {formatCurrency(i.bruto)}
                        </span>
                      </div>
                      <div className="text-muted-foreground">
                        Promos {formatCurrency(i.promos)} · Tip{" "}
                        {formatCurrency(i.propinas)}
                      </div>
                    </div>
                    <div className="text-sm">
                      <div>
                        Costos:{" "}
                        <span className="font-medium">
                          {formatCurrency(i.peajes + i.otros_costos)}
                        </span>
                      </div>
                      <div className="text-muted-foreground">
                        Viajes {i.viajes} · Horas {i.horas}
                      </div>
                    </div>
                    <div className="text-right md:text-left">
                      <div className="text-xs text-muted-foreground">Neto</div>
                      <div className="text-lg font-bold">
                        {formatCurrency(i.neto)}
                      </div>
                    </div>
                    {/* BOTONOES INGRESO  */}
                    <div className="flex items-center gap-2 justify-end md:justify-start">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/ingresos/${i.id}/edit`}>Editar</Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete("ingresos", i.id!)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}

      {tab === "combustible" && (
        <>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/combustible/new">Nueva carga</Link>
            </Button>
            <Button
              variant="secondary"
              onClick={() => exportJSON(fuel, "combustible")}
            >
              Export JSON
            </Button>
            <Button
              variant="secondary"
              onClick={() => exportCSVFromArrayOfObjects(fuel, "combustible")}
            >
              Export CSV
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Combustible</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {fuel.length === 0 && (
                <p className="text-muted-foreground">Sin registros.</p>
              )}
              <ul className="divide-y rounded border">
                {fuel.map((c) => (
                  <li
                    key={c.id}
                    className="p-3 grid grid-cols-2 md:grid-cols-4 gap-2"
                  >
                    <div className="text-sm">
                      <div className="font-medium">{(c as any).fecha}</div>
                      <div className="text-muted-foreground">
                        {c.cantidad} {c.unidad}
                      </div>
                    </div>
                    <div className="text-sm">
                      <div>
                        Total:{" "}
                        <span className="font-semibold">
                          {formatCurrency(c.monto)}
                        </span>
                      </div>
                      <div className="text-muted-foreground">
                        KM: {c.odometro ?? "-"}
                      </div>
                    </div>
                    <div className="md:col-span-2 text-sm text-muted-foreground">
                      {(c as any).notas ?? ""}
                    </div>
                    {/* BOTONOES COMBUSTIBLE  */}
                    <div className="flex items-center gap-2 justify-end md:justify-start">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/combustible/${c.id}/edit`}>Editar</Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete("combustible", c.id!)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}

      {tab === "mantenimiento" && (
        <>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/mantenimiento/new">Nuevo mantenimiento</Link>
            </Button>
            <Button
              variant="secondary"
              onClick={() => exportJSON(mant, "mantenimiento")}
            >
              Export JSON
            </Button>
            <Button
              variant="secondary"
              onClick={() => exportCSVFromArrayOfObjects(mant, "mantenimiento")}
            >
              Export CSV
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Mantenimiento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {mant.length === 0 && (
                <p className="text-muted-foreground">Sin registros.</p>
              )}
              <ul className="divide-y rounded border">
                {mant.map((m) => (
                  <li
                    key={m.id}
                    className="p-3 grid grid-cols-2 md:grid-cols-4 gap-2"
                  >
                    <div className="text-sm">
                      <div className="font-medium">{(m as any).fecha}</div>
                      <div className="text-muted-foreground">
                        {m.categoria}
                      </div>
                    </div>
                    <div className="text-sm">
                      <div>
                        Costo:{" "}
                        <span className="font-semibold">
                          {formatCurrency(
                            Number((m as any).costo ?? (m as any).monto ?? 0)
                          )}
                        </span>
                      </div>
                      <div className="text-muted-foreground">
                        KM: {m.odometro}
                      </div>
                    </div>
                    <div className="md:col-span-2 text-sm text-muted-foreground">
                      {m.detalle ?? ""}
                    </div>
                    <div className="flex items-center gap-2 justify-end md:justify-start">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/mantenimiento/${m.id}/edit`}>Editar</Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete("mantenimiento", m.id!)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
