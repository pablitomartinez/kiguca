// /hooks/useIngresos.ts
"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Ingreso = {
  id: string;
  fecha: string; // date
  plataforma: string; // text
  horas: number; // numeric
  viajes: number; // integer
  bruto: number; // integer
  promos: number; // integer
  propinas: number; // integer
  peajes: number; // integer
  otros_costos: number; // integer
  neto: number | null; // integer nullable
  notas?: string | null;
  owner_id: string;
  created_at?: string;
  updated_at?: string;
};

export function useIngresos() {
  const [data, setData] = useState<Ingreso[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data: ures, error: uerr } = await supabase.auth.getUser();
    if (uerr || !ures.user) {
      setError("No hay sesión");
      setLoading(false);
      return;
    }
    const uid = ures.user.id;

    const { data: rows, error: qerr } = await supabase
      .from("ingresos")
      .select("*")
      .eq("owner_id", uid) // optimiza índice + RLS por si acaso
      .order("fecha", { ascending: false });

    if (qerr) setError(qerr.message);
    else setData(rows as Ingreso[]);
    setLoading(false);
  }, []);

  const add = useCallback(
    async (
      payload: Omit<Ingreso, "id" | "owner_id" | "created_at" | "updated_at">
    ) => {
      // No mandamos owner_id: lo pone DEFAULT auth.uid()
      const { error } = await supabase.from("ingresos").insert([payload]);
      if (error) throw error;
      await fetchAll();
    },
    [fetchAll]
  );

  const update = useCallback(
    async (id: string, patch: Partial<Ingreso>) => {
      const { error } = await supabase
        .from("ingresos")
        .update(patch)
        .eq("id", id);
      if (error) throw error;
      await fetchAll();
    },
    [fetchAll]
  );

  const remove = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("ingresos").delete().eq("id", id);
      if (error) throw error;
      await fetchAll();
    },
    [fetchAll]
  );

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);
  return { data, loading, error, fetchAll, add, update, remove };
}
