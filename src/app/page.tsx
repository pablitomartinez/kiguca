"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/format";
import { TrendingUp, DollarSign, Clock, Target } from "lucide-react";
import dynamic from "next/dynamic";

const DashboardCharts = dynamic(
  () => import("../components/dashboard/DashboardCharts"),
  { ssr: false }
);

export default function Page() {
  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Resumen de tu actividad</p>
      </div>

      {/* Métricas principales */}
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
              Horas Trabajadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">0h</div>
            <p className="text-xs text-muted-foreground mt-1">Este mes</p>
          </CardContent>
        </Card>
      </div>

      {/* Objetivo activo */}
      <Card className="shadow-card border-accent/20">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5 text-accent" />
            Objetivo Activo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              No tienes objetivos activos
            </p>
            <button className="px-4 py-2 bg-accent text-accent-foreground rounded-lg font-medium">
              Crear Objetivo
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico placeholder */}
{/*       
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Evolución de Ingresos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 bg-muted/20 rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">
              Gráficos disponibles cuando tengas datos
            </p>
          </div>
        </CardContent>
      </Card> */}
      <DashboardCharts />
      {/* Acceso rápido */}
      <div className="text-center space-y-4">
        <h3 className="text-lg font-medium">Comenzar Registrando</h3>
        <div className="grid grid-cols-1 gap-3">
          <Link
            href="/ingresos/new"
            className="flex items-center justify-center gap-3 p-4 bg-success/10 border border-success/20 rounded-xl transition-smooth hover:bg-success/20"
          >
            <DollarSign className="h-5 w-5 text-success" />
            <span className="font-medium text-success">Registrar Ingreso</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
