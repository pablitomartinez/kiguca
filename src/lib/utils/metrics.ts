// src/lib/utils/metrics.ts
import type { Combustible } from "@/types";

// Limites del mes actual (local)
export function getMonthBounds(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );
  return { start, end };
}

function inRangeISO(isoDate: string, start: Date, end: Date) {
  const t = new Date(isoDate).getTime();
  return t >= start.getTime() && t <= end.getTime();
}

// Calcula km recorridos sumando los deltas positivos de odómetro ordenado por fecha
function kmRecorridos(entries: Pick<Combustible, "fecha" | "odometro">[]) {
  const sorted = [...entries].sort(
    (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  );
  let km = 0;
  for (let i = 1; i < sorted.length; i++) {
    const d = sorted[i].odometro - sorted[i - 1].odometro;
    if (d > 0) km += d;
  }
  return km;
}

// Stats de combustible del mes actual
export function fuelStatsForMonth(fuel: Combustible[], when = new Date()) {
  const { start, end } = getMonthBounds(when);
  const monthFuel = fuel.filter((f) => inRangeISO(f.fecha, start, end));

  const totalMonto = monthFuel.reduce((acc, f) => acc + (f.monto || 0), 0);
  const km = kmRecorridos(
    monthFuel.map((f) => ({ fecha: f.fecha, odometro: f.odometro || 0 }))
  );
  const costoPorKm = km > 0 ? totalMonto / km : null;

  return { totalMonto, km, costoPorKm };
}



// --- NUEVO: última carga
export function lastFuelInfo(fuel: Combustible[]) {
  if (!fuel.length) return null;
  const last = [...fuel].sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  )[0];
  const precioUnidad = last.cantidad > 0 ? last.monto / last.cantidad : null;
  return { last, precioUnidad };
}