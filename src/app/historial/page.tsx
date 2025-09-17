"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getStorage } from "@/lib/storage";
import { formatCurrency } from "@/lib/utils/format";
import type { Ingreso as IngresoBase } from "@/types";

type Ingreso = IngresoBase & { id: string };

export default function HistorialPage() {
  const [items, setItems] = useState<Ingreso[]>([]);
  const totalNeto = items.reduce((acc, i) => acc + (i.neto || 0), 0);

  useEffect(() => {
    const load = async () => {
      const storage = getStorage();
      const list = await storage.ingresos.list();
      const withId = list.filter((i): i is Ingreso => typeof i.id === "string");
      setItems(withId);
    };
    load();
  }, []);

  function exportJson() {
    const data = JSON.stringify(items, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ingresos.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Historial</h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/ingresos/new">Nuevo ingreso</Link>
          </Button>
          <Button variant="secondary" onClick={exportJson}>
            Exportar JSON
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Ingresos</CardTitle>
          <div className="text-sm text-muted-foreground">
            Total neto:{" "}
            <span className="font-semibold">{formatCurrency(totalNeto)}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {items.length === 0 && (
            <p className="text-muted-foreground">
              Sin registros. Probá crear uno en “Nuevo ingreso”.
            </p>
          )}

          <ul className="divide-y divide-border rounded-lg border">
            {items.map((i) => (
              <li
                key={i.id}
                className="p-3 grid grid-cols-2 md:grid-cols-4 gap-2"
              >
                <div className="text-sm">
                  <div className="font-medium">{i.fecha}</div>
                  <div className="text-muted-foreground capitalize">
                    {i.plataforma}
                  </div>
                </div>
                <div className="text-sm">
                  <div>
                    Bruto:{" "}
                    <span className="font-medium">
                      {formatCurrency(i.bruto)}
                    </span>
                  </div>
                  <div className="text-muted-foreground">
                    Promos: {formatCurrency(i.promos)} · Tip:{" "}
                    {formatCurrency(i.propinas)}
                  </div>
                </div>
                <div className="text-sm">
                  <div>
                    Costos:{" "}
                    <span className="font-medium">
                      {formatCurrency(i.peajes + i.otros_costos)}
                    </span>
                  </div>
                  <div className="text-muted-foreground">
                    Viajes: {i.viajes} · Horas: {i.horas}
                  </div>
                </div>
                <div className="text-right md:text-left">
                  <div className="text-xs text-muted-foreground">Neto</div>
                  <div className="text-lg font-bold">
                    {formatCurrency(i.neto)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
