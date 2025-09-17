"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, History, Target, Settings } from "lucide-react";

const items = [
  { href: "/", label: "Inicio", Icon: Home },
  { href: "/ingresos/new", label: "Registrar", Icon: PlusCircle },
  { href: "/historial", label: "Historial", Icon: History },
  { href: "/objetivo", label: "Objetivo", Icon: Target },
  { href: "/ajustes/supabase", label: "Ajustes", Icon: Settings },
];

export default function BottomNavigation() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-neutral-800 bg-neutral-950/90 backdrop-blur">
      <ul className="grid grid-cols-5">
        {items.map(({ href, label, Icon }) => {
          const active =
            pathname === href || (href !== "/" && pathname?.startsWith(href));
          return (
            <li key={href} className="text-center">
              <Link
                href={href}
                className={`flex flex-col items-center gap-1 py-2 text-xs ${
                  active ? "text-white" : "text-neutral-400"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
