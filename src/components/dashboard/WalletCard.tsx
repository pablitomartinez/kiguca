"use client";

import Link from "next/link";
import { DollarSign, Fuel, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/format";

interface WalletCardProps {
  netoMes: number;
  gastoCombMes: number;
}

export default function WalletCard({ netoMes, gastoCombMes }: WalletCardProps) {
  const gananciaReal = Math.max(netoMes - gastoCombMes, 0);

  return (
    <div className="rounded-2xl p-5 bg-gradient-to-br from-blue-600 to-purple-700 text-white shadow-lg">
      <div className="flex flex-col items-center text-center space-y-1">
        <span className="text-sm opacity-90">Tu saldo actual</span>
        <span className="text-4xl font-bold tracking-tight">
          {formatCurrency(netoMes)}
        </span>
        <span className="text-xs text-purple-200 mt-1">
          Ganancia real después de combustible
        </span>
        <span className="text-lg font-semibold text-purple-200">
          {formatCurrency(gananciaReal)}
        </span>
      </div>

      {/* Accesos rápidos */}
      <div className="mt-5 grid grid-cols-3 gap-2">
        <Button
          asChild
          variant="secondary"
          className="bg-white/20 hover:bg-white/30 text-white text-xs py-2 rounded-xl"
        >
          <Link href="/ingresos/new" className="flex flex-col items-center">
            <DollarSign className="h-4 w-4 mb-1" />
            Ingreso
          </Link>
        </Button>
        <Button
          asChild
          variant="secondary"
          className="bg-white/20 hover:bg-white/30 text-white text-xs py-2 rounded-xl"
        >
          <Link href="/combustible/new" className="flex flex-col items-center">
            <Fuel className="h-4 w-4 mb-1" />
            Carga
          </Link>
        </Button>
        <Button
          asChild
          variant="secondary"
          className="bg-white/20 hover:bg-white/30 text-white text-xs py-2 rounded-xl"
        >
          <Link href="/objetivo" className="flex flex-col items-center">
            <Target className="h-4 w-4 mb-1" />
            Objetivo
          </Link>
        </Button>
      </div>
    </div>
  );
}
