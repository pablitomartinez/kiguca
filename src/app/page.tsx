"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import {
  DollarSign,
  Fuel,
  Wrench,
  TrendingUp,
  Clock,
  Target,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/format";

// Charts (SSR off)
const DashboardCharts = dynamic(
  () => import("../components/dashboard/DashboardCharts"),
  {
    ssr: false,
  }
);

// Goal card
import GoalCard from "@/components/dashboard/GoalCard";

export default function Page() {
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
              {formatCurrency(0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Sin registros aún
            </p>
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
            <div className="text-2xl font-bold text-foreground">0h</div>
            <p className="text-xs text-muted-foreground mt-1">Este mes</p>
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
