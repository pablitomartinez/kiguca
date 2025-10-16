// lib/analytics/ingresos.ts
import { getStorage } from "@/lib/storage";
import type { Ingreso as IngresoBase, Objetivo as ObjetivoBase } from "@/types";
import {
  getMensualAncladoRange,
  isInRange,
  type DateRange,
} from "../periodos";

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

// ingresos DENTRO del objetivo activo (si hay)
//nuevo: rango dinámico basado en el día de fecha_inicio (anclaje)
export async function getIngresosWithinObjetivo(): Promise<{
  objetivo: Objetivo | null;
  ingresos: Ingreso[];
  range: DateRange | null;
}> {
  const storage = getStorage();
  const obj = await getActiveObjetivo();

  const ingresosAll = await storage.ingresos.list();
  const ingresos = (ingresosAll as IngresoBase[]).filter(
    (i): i is Ingreso => typeof i.id === "string"
  );

  if (!obj) return { objetivo: null, ingresos: [], range: null };

  // ⚓ anclaje: tomamos el día de fecha_inicio (si falla, 10)
  const anchorDay = (() => {
    try { return new Date(obj.fecha_inicio + "T00:00:00").getDate(); }
    catch { return 10; }
  })();

  // 🔁 rango dinámico del ciclo vigente (ej: 10/10 → 09/11)
  const range = getMensualAncladoRange(new Date(), anchorDay);

  const filtered = ingresos.filter((i) => isInRange(i.fecha, range));

  return { objetivo: obj, ingresos: filtered, range };
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
