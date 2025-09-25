"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { DollarSign, Fuel, Wrench, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/format";
import { getStorage } from "@/lib/storage";
import GoalCard from "@/components/dashboard/GoalCard";



// Charts (SSR off)
const DashboardCharts = dynamic(
  () => import("../components/dashboard/DashboardCharts"),
  {
    ssr: false,
  }
);



export default function Page() {
  const [netoMes, setNetoMes] = useState(0);
  const [horasMes, setHorasMes] = useState(0);

  useEffect(() => {
    (async () => {
      const s = getStorage();
      const all = await s.ingresos.list();

      // límites del mes actual
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const inMonth = all.filter((i: any) => {
        const t = new Date(i.fecha).getTime();
        return t >= start.getTime() && t <= end.getTime();
      });

      const neto = inMonth.reduce((acc: number, i: any) => {
        const n =
          typeof i.neto === "number"
            ? i.neto
            : (Number(i.bruto) || 0) +
              (Number(i.promos) || 0) +
              (Number(i.propinas) || 0) -
              ((Number(i.peajes) || 0) + (Number(i.otros_costos) || 0));
        return acc + n;
      }, 0);

      const horas = inMonth.reduce(
        (acc: number, i: any) => acc + Number(i.horas || 0),
        0
      );

      setNetoMes(neto);
      setHorasMes(horas);
    })();
  }, []);


  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Resumen de tu actividad</p>
      </div>

      {/* Accesos rápidos (mobile-first) */}
      <div className="grid grid-cols-1 gap-3">
        <Button asChild className="w-full py-3 rounded-xl">
          <Link
            href="/ingresos/new"
            className="flex items-center justify-center gap-2"
          >
            <DollarSign className="h-5 w-5" />
            Nuevo ingreso
          </Link>
        </Button>
        <Button asChild variant="secondary" className="w-full py-3 rounded-xl">
          <Link
            href="/combustible/new"
            className="flex items-center justify-center gap-2"
          >
            <Fuel className="h-5 w-5" />
            Nueva carga
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full py-3 rounded-xl">
          <Link
            href="/mantenimiento/new"
            className="flex items-center justify-center gap-2"
          >
            <Wrench className="h-5 w-5" />
            Nuevo mantenimiento
          </Link>
        </Button>
      </div>

      {/* Métricas rápidas (placeholder por ahora) */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-success" />
              Neto del Mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {formatCurrency(netoMes)}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Horas trabajadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {horasMes.toFixed(1)}h
            </div>
            {/* <p className="text-xs text-muted-foreground mt-1">Este mes</p> */}
          </CardContent>
        </Card>
      </div>

      {/* Objetivo activo (mejorado en el paso 2) */}
      <GoalCard />

      {/* Gráfico placeholder / charts reales si hay datos */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Evolución de Ingresos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Si tus charts requieren datos, este componente maneja estados vacíos */}
          <DashboardCharts />
        </CardContent>
      </Card>
    </div>
  );
}
