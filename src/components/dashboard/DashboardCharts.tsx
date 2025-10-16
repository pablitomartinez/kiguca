"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getIngresosWithinObjetivo,
  groupByDay,
  groupByWeek,
  sumByPlatform,
} from "../../lib/analitycs/ingresos";
import { formatCurrency, toYMDLocal } from "@/lib/utils/format";
import { onDataUpdated } from "@/lib/utils/events";

const COLORS = ["var(--chart-1)", "var(--chart-2)"];

const fmtDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
  });

const fmtMoneyTick = (v: number) =>
  new Intl.NumberFormat("es-AR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(v);

export default function DashboardCharts() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<{ start?: string; end?: string }>();
  const [daily, setDaily] = useState<{ date: string; neto: number }[]>([]);
  const [weekly, setWeekly] = useState<{ weekStart: string; neto: number }[]>(
    []
  );
  const [pie, setPie] = useState<{ name: "Uber" | "DiDi"; value: number }[]>(
    []
  );
  const [hasObjetivo, setHasObjetivo] = useState<boolean>(false);
  const [goal, setGoal] = useState<number>(0);

  // useEffect(() => {
  //   const run = async () => {
  //     const { objetivo, ingresos, range } = await getIngresosWithinObjetivo();
  //     setHasObjetivo(Boolean(objetivo));
  //     if (!objetivo || !range) {
  //       setLoading(false);
  //       return;
  //     }
  //     setPeriod({
  //       start: range.start.toISOString().slice(0, 10),
  //       end: range.end.toISOString().slice(0, 10),
  //     });
  //     setGoal(Number((objetivo as any).monto ?? 0));

  //     if (ingresos.length === 0) {
  //       setDaily([]);
  //       setWeekly([]);
  //       setPie([]);
  //       setLoading(false);
  //       return;
  //     }

  //     setDaily(groupByDay(ingresos));
  //     setWeekly(groupByWeek(ingresos));
  //     const p = sumByPlatform(ingresos);
  //     setPie([
  //       { name: "Uber", value: p.uber },
  //       { name: "DiDi", value: p.didi },
  //     ]);
  //     setLoading(false);
  //   };
  //   run();
  // }, []);
useEffect(() => {
  const load = async () => {
    const { objetivo, ingresos, range } = await getIngresosWithinObjetivo();
    setHasObjetivo(Boolean(objetivo));
    if (!objetivo || !range) {
      setLoading(false);
      return;
    }

    setPeriod({ start: toYMDLocal(range.start), end: toYMDLocal(range.end) });
    setGoal(Number((objetivo as any).monto ?? 0));

    if (ingresos.length === 0) {
      setDaily([]);
      setWeekly([]);
      setPie([]);
      setLoading(false);
      return;
    }

    setDaily(groupByDay(ingresos));
    setWeekly(groupByWeek(ingresos));
    const p = sumByPlatform(ingresos);
    setPie([
      { name: "Uber", value: p.uber },
      { name: "DiDi", value: p.didi },
    ]);
    setLoading(false);
  };

  const off = onDataUpdated(load);
  load();
  return off;
}, []);

  const totalNetoPeriodo = useMemo(
    () => daily.reduce((acc, d) => acc + d.neto, 0),
    [daily]
  );
  const avance = useMemo(
    () =>
      goal > 0 ? Math.min(100, Math.round((totalNetoPeriodo / goal) * 100)) : 0,
    [goal, totalNetoPeriodo]
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cargando gráficos…</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 animate-pulse rounded bg-muted/30" />
        </CardContent>
      </Card>
    );
  }

  if (!hasObjetivo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gráficos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Creá un objetivo para ver los gráficos del período activo.
          </p>
        </CardContent>
      </Card>
    );
  }

  const subtitle =
    period?.start && period?.end
      ? `Período: ${fmtDate(period.start)} – ${fmtDate(
          period.end
        )} · Neto: ${formatCurrency(totalNetoPeriodo)}${
          goal ? ` · Meta: ${formatCurrency(goal)} (${avance}%)` : ""
        }`
      : undefined;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Línea: Neto por día */}
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col">
            <span>Neto por día</span>
            {subtitle && (
              <span className="text-xs font-normal text-muted-foreground mt-1">
                {subtitle}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={daily} margin={{ left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickFormatter={fmtDate} />
                <YAxis tickFormatter={fmtMoneyTick} />
                <Tooltip
                  formatter={(v: any) => formatCurrency(Number(v))}
                  labelFormatter={(l: any) => `Día: ${fmtDate(String(l))}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="neto"
                  name="Neto"
                  dot={false}
                  stroke="var(--chart-1)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Barras: Neto por semana */}
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col">
            <span>Neto por semana</span>
            {subtitle && (
              <span className="text-xs font-normal text-muted-foreground mt-1">
                {subtitle}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekly} margin={{ left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="weekStart" tickFormatter={fmtDate} />
                <YAxis tickFormatter={fmtMoneyTick} />
                <Tooltip
                  formatter={(v: any) => formatCurrency(Number(v))}
                  labelFormatter={(l: any) =>
                    `Semana que inicia: ${fmtDate(String(l))}`
                  }
                />
                <Legend />
                <Bar
                  dataKey="neto"
                  name="Neto semanal"
                  radius={[6, 6, 0, 0]}
                  barSize={28}
                  fill="var(--chart-2)" // 👈 evita el bloque negro
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Torta: Uber vs DiDi */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex flex-col">
            <span>Uber vs DiDi</span>
            {subtitle && (
              <span className="text-xs font-normal text-muted-foreground mt-1">
                {subtitle}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip formatter={(v: any) => formatCurrency(Number(v))} />
                <Legend />
                <Pie
                  data={pie}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={100}
                  label={({ name, value }) =>
                    `${name} – ${Math.round(
                      (Number(value) / (pie[0]?.value + pie[1]?.value || 1)) *
                        100
                    )}%`
                  }
                >
                  {pie.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
