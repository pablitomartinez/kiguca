"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/format";
import { getStorage } from "@/lib/storage";
import {
  fuelStatsForMonth,
  getMonthBounds,
  lastFuelInfo,
} from "@/lib/utils/metrics";
import GoalCard from "@/components/dashboard/GoalCard";
import { TrendingUp, DollarSign, Clock, Fuel } from "lucide-react";

// Tus gráficos ya existentes
const DashboardCharts = dynamic(
  () => import("@/components/dashboard/DashboardCharts"),
  { ssr: false }
);

type Ingreso = {
  fecha: string;
  plataforma: "uber" | "didi";
  horas: number;
  viajes: number;
  bruto: number;
  promos: number;
  propinas: number;
  peajes: number;
  otros_costos: number;
  neto: number;
};

type Combustible = {
  fecha: string;
  tipo: "nafta" | "gnc";
  cantidad: number;
  unidad: "L" | "m3";
  monto: number;
  odometro: number;
  notas?: string;
};

export default function Page() {
  const [netoMes, setNetoMes] = useState(0);
  const [horasMes, setHorasMes] = useState(0);
  const [gastoCombustibleMes, setGastoCombustibleMes] = useState(0);
  const [costoPorKmMes, setCostoPorKmMes] = useState<null | number>(null);
  const [ultimaCarga, setUltimaCarga] = useState<null | {
    fecha: string;
    cantidad: number;
    unidad: "L" | "m3";
    monto: number;
    odometro: number;
    precioUnidad: number | null;
  }>(null);

  useEffect(() => {
    (async () => {
      const s = getStorage();
      const { start, end } = getMonthBounds(new Date());

      // INGRESOS (mes)
      const ingresos = (await s.ingresos.list()) as Ingreso[];
      const ingMes = ingresos.filter((i) => {
        const t = new Date(i.fecha).getTime();
        return t >= start.getTime() && t <= end.getTime();
      });
      setNetoMes(ingMes.reduce((acc, i) => acc + (i.neto || 0), 0));
      setHorasMes(ingMes.reduce((acc, i) => acc + (i.horas || 0), 0));

      // COMBUSTIBLE
      const fuel = (await s.combustible.list()) as Combustible[];
      const stats = fuelStatsForMonth(fuel);
      setGastoCombustibleMes(stats.totalMonto);
      setCostoPorKmMes(stats.costoPorKm);

      const last = lastFuelInfo(fuel);
      setUltimaCarga(
        last
          ? {
              fecha: last.last.fecha,
              cantidad: last.last.cantidad,
              unidad: last.last.unidad,
              monto: last.last.monto,
              odometro: last.last.odometro,
              precioUnidad: last.precioUnidad,
            }
          : null
      );
    })();
  }, []);

  return (
    <div className="p-4 space-y-6">
      {/* Accesos rápidos (mobile-first) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Button asChild className="w-full">
          <Link href="/ingresos/new" className="justify-center">
            + Nuevo ingreso
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href="/combustible/new" className="justify-center">
            + Nueva carga
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Resumen del mes</p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-success" />
              Neto del mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {formatCurrency(netoMes)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Con tus registros
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
            <div className="text-2xl font-bold text-foreground">
              {horasMes.toFixed(1)}h
            </div>
            <p className="text-xs text-muted-foreground mt-1">Este mes</p>
          </CardContent>
        </Card>
      </div>

      {/* Combustible: gasto + costo/km */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Fuel className="h-4 w-4" />
              Gasto combustible (mes)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(gastoCombustibleMes)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Suma de cargas</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Costo por km (mes)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {costoPorKmMes != null
                ? costoPorKmMes.toLocaleString("es-AR", {
                    style: "currency",
                    currency: "ARS",
                  })
                : "—"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Combustible / km recorridos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Última carga */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Fuel className="h-4 w-4" />
            Última carga
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {!ultimaCarga ? (
            <p className="text-muted-foreground">
              Aún no registraste combustible.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-muted-foreground">Fecha</div>
                <div className="font-medium">{ultimaCarga.fecha}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Cantidad</div>
                <div className="font-medium">
                  {ultimaCarga.cantidad} {ultimaCarga.unidad}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Monto</div>
                <div className="font-medium">
                  {formatCurrency(ultimaCarga.monto)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">
                  Precio / {ultimaCarga.unidad}
                </div>
                <div className="font-medium">
                  {ultimaCarga.precioUnidad != null
                    ? ultimaCarga.precioUnidad.toLocaleString("es-AR", {
                        style: "currency",
                        currency: "ARS",
                      })
                    : "—"}
                </div>
              </div>
              <div className="col-span-2">
                <div className="text-muted-foreground">Odómetro</div>
                <div className="font-medium">{ultimaCarga.odometro} km</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Objetivo activo: tu componente autogestionado */}
      <GoalCard />

      {/* Gráficos */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Evolución de ingresos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DashboardCharts />
        </CardContent>
      </Card>
    </div>
  );
}
