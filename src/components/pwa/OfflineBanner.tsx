"use client";
import { useEffect, useState } from "react";

export default function OfflineBanner() {
  const [online, setOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  if (online) return null;
  return (
    <div className="fixed top-0 inset-x-0 z-50 bg-amber-500 text-black text-center text-sm py-1">
      Sin conexión — tus registros se guardarán cuando vuelva internet
    </div>
  );
}
