// lib/analytics/ingresos.ts
import { getStorage } from "@/lib/storage";
import type { Ingreso as IngresoBase, Objetivo as ObjetivoBase } from "@/types";

export type Ingreso = IngresoBase & { id: string };
export type Objetivo = ObjetivoBase & { id: string };

function toISO(d: Date) {
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
    .toISOString()
    .slice(0, 10);
}

export async function getActiveObjetivo(): Promise<Objetivo | null> {
  const storage = getStorage();
  const list = await storage.objetivos.list();
  const withId = (list as ObjetivoBase[])
    .filter((o): o is Objetivo => typeof o.id === "string")
    .sort(
      (a, b) =>
        new Date(b.created_at ?? 0).getTime() -
        new Date(a.created_at ?? 0).getTime()
    );
  return withId[0] ?? null;
}

export async function getIngresosWithinObjetivo(): Promise<{
  objetivo: Objetivo | null;
  ingresos: Ingreso[];
}> {
  const storage = getStorage();
  const obj = await getActiveObjetivo();

  const ingresosAll = await storage.ingresos.list();
  const ingresos = (ingresosAll as IngresoBase[]).filter(
    (i): i is Ingreso => typeof i.id === "string"
  );

  if (!obj) return { objetivo: null, ingresos: [] };

  const start = new Date(obj.fecha_inicio + "T00:00:00");
  const end = new Date(obj.fecha_fin + "T23:59:59");

  const filtered = ingresos.filter((i) => {
    const t = new Date(i.fecha + "T12:00:00").getTime();
    return t >= start.getTime() && t <= end.getTime();
  });

  return { objetivo: obj, ingresos: filtered };
}

export function groupByDay(ingresos: Ingreso[]) {
  const map = new Map<string, number>();
  for (const i of ingresos) {
    const key = i.fecha; // ya viene YYYY-MM-DD
    map.set(key, (map.get(key) ?? 0) + (i.neto ?? 0));
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, neto]) => ({ date, neto }));
}

function mondayOf(date: Date) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // 0=Mon ... 6=Sun
  d.setDate(d.getDate() - day);
  return d;
}

export function groupByWeek(ingresos: Ingreso[]) {
  const map = new Map<string, number>();
  for (const i of ingresos) {
    const d = new Date(i.fecha + "T12:00:00");
    const monday = toISO(mondayOf(d));
    map.set(monday, (map.get(monday) ?? 0) + (i.neto ?? 0));
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([weekStart, neto]) => ({ weekStart, neto }));
}

export function sumByPlatform(ingresos: Ingreso[]) {
  let uber = 0,
    didi = 0;
  for (const i of ingresos) {
    if (i.plataforma === "uber") uber += i.neto ?? 0;
    if (i.plataforma === "didi") didi += i.neto ?? 0;
  }
  return { uber, didi, total: uber + didi };
}
