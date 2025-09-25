"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getIngresosWithinObjetivo } from "@/lib/analitycs/ingresos";
import { formatCurrency } from "@/lib/utils/format";

function fmtRange(start?: string, end?: string) {
  if (!start || !end) return "—";
  try {
    const f = new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "short",
    });
    return `${f.format(new Date(start))} → ${f.format(new Date(end))}`;
  } catch {
    return `${start} → ${end}`;
  }
}

export default function GoalCard() {
  const [loading, setLoading] = useState(true);
  const [goal, setGoal] = useState<number>(0);
  const [period, setPeriod] = useState<{ start?: string; end?: string }>();
  const [total, setTotal] = useState<number>(0);
  const [hasGoal, setHasGoal] = useState(false);

  useEffect(() => {
    const run = async () => {
      const { objetivo, ingresos } = await getIngresosWithinObjetivo();
      setHasGoal(Boolean(objetivo));
      if (!objetivo) {
        setLoading(false);
        return;
      }
      setGoal(Number((objetivo as any).monto ?? 0));
      setPeriod({ start: objetivo.fecha_inicio, end: objetivo.fecha_fin });
      const sum = ingresos.reduce((acc, i) => acc + (i.neto ?? 0), 0);
      setTotal(sum);
      setLoading(false);
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <Card className="shadow-card border-accent/20">
        <CardHeader>
          <CardTitle>Objetivo activo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-12 animate-pulse rounded bg-muted/30" />
        </CardContent>
      </Card>
    );
  }

  if (!hasGoal) {
    return (
      <Card className="shadow-card border-accent/20">
        <CardHeader>
          <CardTitle>Objetivo activo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              No tenés objetivos activos
            </p>
            <Button asChild>
              <Link href="/objetivo">Crear objetivo</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const progress =
    goal > 0 ? Math.min(100, Math.round((total / goal) * 100)) : 0;
  const remaining = Math.max(0, goal - total);
  const rangeLabel = fmtRange(period?.start, period?.end);

  const emptyPeriod = total === 0; // UX: sin ingresos en el periodo

  return (
    <Card className="shadow-card border-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Objetivo activo</span>
          <span className="text-sm text-muted-foreground">{rangeLabel}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span>Progreso</span>
          <span className="font-medium">{progress}%</span>
        </div>

        {/* barra de progreso simple */}
        <div className="h-3 w-full rounded bg-muted/30 overflow-hidden">
          <div
            className="h-full bg-accent transition-all"
            style={{ width: `${progress}%` }}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            role="progressbar"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Meta</div>
            <div className="font-semibold">{formatCurrency(goal)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Acumulado</div>
            <div className="font-semibold">{formatCurrency(total)}</div>
          </div>
          <div className="col-span-2">
            <div className="text-muted-foreground">Restante</div>
            <div className="font-semibold">{formatCurrency(remaining)}</div>
          </div>
        </div>

        {/* Acciones */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
          <Button asChild variant="secondary" className="w-full">
            <Link
              href={`/historial?from=${period?.start ?? ""}&to=${
                period?.end ?? ""
              }`}
            >
              Ver período en Historial
            </Link>
          </Button>

          <Button asChild className="w-full">
            <Link href="/ingresos/new">
              {emptyPeriod ? "Registrar primer ingreso" : "Registrar ingreso"}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
