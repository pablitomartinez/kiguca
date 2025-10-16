// src/lib/periods.ts
export type PeriodType =
  | "diario"
  | "semanal"
  | "mensual-calendario"
  | "mensual-anclado"
  | "personalizado";

export type DateRange = { start: Date; end: Date };

function atStartOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function atEndOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export function getMensualAncladoRange(
  today = new Date(),
  anchorDay = 10
): DateRange {
  const y = today.getFullYear();
  const m = today.getMonth();
  const day = today.getDate();

  // si hoy es antes del anclaje, el ciclo empezó el mes pasado
  const startMonth = day >= anchorDay ? m : m - 1;
  const startYear = startMonth < 0 ? y - 1 : y;
  const realStartMonth = (startMonth + 12) % 12;

  const start = new Date(startYear, realStartMonth, anchorDay);
  // fin = día anterior al próximo anchor
  const nextAnchorMonth = realStartMonth + 1;
  const nextAnchorYear = nextAnchorMonth > 11 ? startYear + 1 : startYear;
  const realNextMonth = nextAnchorMonth % 12;

  const nextAnchor = new Date(nextAnchorYear, realNextMonth, anchorDay);
  const end = new Date(nextAnchor.getTime() - 1); // 09 23:59:59.999

  return { start: atStartOfDay(start), end: atEndOfDay(end) };
}

export function getMensualCalendarioRange(today = new Date()): DateRange {
  const y = today.getFullYear();
  const m = today.getMonth();
  const start = new Date(y, m, 1);
  const end = new Date(y, m + 1, 0);
  return { start: atStartOfDay(start), end: atEndOfDay(end) };
}

export function isInRange(dateISO: string, range: DateRange) {
  const t = new Date(dateISO).getTime();
  return t >= range.start.getTime() && t <= range.end.getTime();
}

export function remainingDays(range: DateRange, today = new Date()) {
  const t0 = atStartOfDay(today).getTime();
  const t1 = atStartOfDay(range.end).getTime();
  const ms = t1 - t0;
  return ms < 0 ? 0 : Math.floor(ms / (1000 * 60 * 60 * 24)) + 1; // incluye hoy
}
