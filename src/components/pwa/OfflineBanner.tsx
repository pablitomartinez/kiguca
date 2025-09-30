// components/pwa/OfflineBanner.tsx
"use client";
import { useEffect, useState } from "react";

function useOnline() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update(); // estado inicial correcto
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  return online;
}

export default function OfflineBanner() {
  const online = useOnline();
  if (online) return null;
  return (
    <div className="w-full bg-amber-500 text-black px-3 py-2 text-center text-sm">
      Sin conexión — tus registros se guardarán cuando vuelva internet
    </div>
  );
}
