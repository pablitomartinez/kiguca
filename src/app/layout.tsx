// app/layout.tsx
import "./globals.css";
import type { ReactNode } from "react";
import BottomNavigation from "../components/navigation/BottomNavigation";
import OfflineBanner from "../components/pwa/OfflineBanner";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className="dark">
      <head>
        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
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
