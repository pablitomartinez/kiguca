"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function DebugAuth() {
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);
  return (
    <pre className="p-4 text-sm">
      {JSON.stringify(user, null, 2) || "Sin sesión"}
    </pre>
  );
}
