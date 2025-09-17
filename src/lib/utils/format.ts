// Utilidades de formato para es-AR (moneda ARS, fechas DD/MM/AAAA)

// Formato de moneda argentina
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Formato compacto para números grandes (ej: 15K, 1.2M)
export function formatCurrencyCompact(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  }
  return formatCurrency(amount);
}

// Formato de fecha para UI (DD/MM/AAAA)
export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// Formato de fecha y hora para UI
export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Formato de fecha relativa (ej: "Hoy", "Ayer", "3 días atrás")
export function formatRelativeDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffTime = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30)
    return `Hace ${Math.floor(diffDays / 7)} semana${
      Math.floor(diffDays / 7) > 1 ? "s" : ""
    }`;
  if (diffDays < 365)
    return `Hace ${Math.floor(diffDays / 30)} mes${
      Math.floor(diffDays / 30) > 1 ? "es" : ""
    }`;

  return formatDate(d);
}

// Convertir fecha de DD/MM/AAAA a ISO (YYYY-MM-DD)
export function parseDate(dateStr: string): string {
  if (!dateStr) return "";

  // Si ya está en formato ISO, retornar tal como está
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateStr;
  }

  // Si está en formato DD/MM/AAAA, convertir
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  return "";
}

// Formatear horas con decimales
export function formatHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);

  if (m === 0) {
    return `${h}h`;
  }

  return `${h}h ${m}m`;
}

// Formatear porcentaje
export function formatPercentage(value: number, decimals: 1 | 2 = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// Formatear números sin decimales
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("es-AR").format(value);
}

// Formatear consumo de combustible
export function formatConsumption(
  value: number,
  unit: "L" | "m3" = "L"
): string {
  const unitLabel = unit === "L" ? "L/100km" : "m³/100km";
  return `${value.toFixed(2)} ${unitLabel}`;
}

// Formatear velocidad/rendimiento
export function formatEfficiency(netoPorHora: number): string {
  return `${formatCurrency(netoPorHora)}/h`;
}

// Formatear odómetro
export function formatKilometers(km: number): string {
  return `${formatNumber(km)} km`;
}

// Obtener fecha de hoy en formato ISO
export function getTodayISO(): string {
  return new Date().toISOString().split("T")[0];
}

// Obtener rango de fechas para períodos
export function getDateRange(
  periodo: "semanal" | "mensual",
  fecha?: string
): { inicio: string; fin: string } {
  const base = fecha ? new Date(fecha) : new Date();

  if (periodo === "semanal") {
    // Lunes a domingo
    const dayOfWeek = base.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const monday = new Date(base);
    monday.setDate(base.getDate() + mondayOffset);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return {
      inicio: monday.toISOString().split("T")[0],
      fin: sunday.toISOString().split("T")[0],
    };
  } else {
    // Primer y último día del mes
    const year = base.getFullYear();
    const month = base.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    return {
      inicio: firstDay.toISOString().split("T")[0],
      fin: lastDay.toISOString().split("T")[0],
    };
  }
}

// Obtener etiqueta para semana (ej: "Semana 42/2024")
export function getWeekLabel(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const year = d.getFullYear();

  // Calcular número de semana ISO
  const firstDayOfYear = new Date(year, 0, 1);
  const pastDaysOfYear = (d.getTime() - firstDayOfYear.getTime()) / 86400000;
  const weekNumber = Math.ceil(
    (pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7
  );

  return `Semana ${weekNumber}/${year}`;
}
