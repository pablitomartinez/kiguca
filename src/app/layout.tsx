// app/layout.tsx
import "./globals.css";
import type { ReactNode } from "react";
import BottomNavigation from "../components/navigation/BottomNavigation";
import OfflineBanner from "../components/pwa/OfflineBanner";
import { Toaster } from "@/components/ui/sonner";
import { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: {
    default: "Kiguca — Gestión para Conductores",
    template: "%s · Kiguca",
  },
  description:
    "Registra ingresos, combustible y mantenimiento para Uber y DiDi. Metas y gráficos, pensado mobile-first.",
  // themeColor: "#0a0a0a",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className="dark">
      <head>
        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />

        <meta name="theme-color" content="#4f46e5" />
      </head>
      <body className="min-h-screen bg-background text-foreground pb-16">
        <OfflineBanner />
        <main className="pb-20 min-h-screen">{children}</main>
        <BottomNavigation />
        <Toaster richColors position="bottom-center" />
      </body>
    </html>
  );
}
