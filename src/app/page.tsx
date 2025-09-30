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
import { onDataUpdated } from "@/lib/utils/events";

type CombustibleRow = import("@/types").Combustible & {
  // compat con datos viejos que quedaron en localStorage
  litros?: number; // antes: cantidad
  costo_total?: number; // antes: monto
  km?: number; // antes: odometro
};

// ULTIMA CARGA
type UltimaCarga = {
  fecha: string;
  cantidad: number;
  unidad: "L" | "m3";
  monto: number;
  odometro: number;
  precioUnidad: number | null;
};

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
  const [gastoCombMes, setGastoCombMes] = useState(0);
  const [ultimaCarga, setUltimaCarga] = useState<UltimaCarga | null>(null);

  // ACTUALIZACION LUEGO DE EDITAR BORRAR AGREGAR
  useEffect(() => {
    const off = onDataUpdated(load);
    return off;
  }, []);

  async function load() {
    const s = getStorage();

    // límites del mes actual
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // INGRESOS
    const allIng = await s.ingresos.list();
    const inMonthIng = allIng.filter((i: any) => {
      const t = new Date(i.fecha).getTime();
      return t >= start.getTime() && t <= end.getTime();
    });

    const neto = inMonthIng.reduce((acc: number, i: any) => {
      const n =
        typeof i.neto === "number"
          ? i.neto
          : (Number(i.bruto) || 0) +
            (Number(i.promos) || 0) +
            (Number(i.propinas) || 0) -
            ((Number(i.peajes) || 0) + (Number(i.otros_costos) || 0));
      return acc + n;
    }, 0);
    const horas = inMonthIng.reduce(
      (acc: number, i: any) => acc + Number(i.horas || 0),
      0
    );
    setNetoMes(neto);
    setHorasMes(horas);

    // COMBUSTIBLE
    const allFuel = (await s.combustible.list()) as CombustibleRow[]; // gasto del mes
    const inMonthFuel = allFuel.filter((c: any) => {
      const t = new Date(c.fecha).getTime();
      return t >= start.getTime() && t <= end.getTime();
    });
    const totalMonto = inMonthFuel.reduce(
      (acc: number, c: any) => acc + Number(c.monto || c.costo_total || 0),
      0
    );
    setGastoCombMes(totalMonto);

    // última carga (por fecha)
    if (allFuel.length === 0) {
      setUltimaCarga(null);
    } else {
      const sorted = [...allFuel].sort(
        (a: any, b: any) =>
          new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      );
      const last = sorted[0];

      // 👇 corregimos fallbacks a nombres “legacy”
      const cantidad = Number(last.cantidad ?? last.litros ?? 0);
      const monto = Number(last.monto ?? last.costo_total ?? 0);
      const unidad = (last.unidad ?? (last.litros != null ? "L" : "m3")) as
        | "L"
        | "m3";
      const odometro = Number(last.odometro ?? last.km ?? 0);

      const precioUnidad =
        cantidad > 0 ? Math.round((monto / cantidad) * 100) / 100 : null;

      setUltimaCarga({
        fecha: last.fecha,
        cantidad,
        unidad,
        monto,
        odometro,
        precioUnidad,
      });
    }
  }

  useEffect(() => {
    load();
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

      {/* ULIMA CARGA  */}
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
              {formatCurrency(gastoCombMes)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Suma de cargas del mes
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-2">
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
                      ? formatCurrency(ultimaCarga.precioUnidad)
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
