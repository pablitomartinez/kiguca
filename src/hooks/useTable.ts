"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export function useTable<T extends { id: string }>(
  table: "ingresos" | "combustible" | "mantenimiento" | "objetivos",
  orderBy?: { column: string; ascending?: boolean }
) {
  const [data, setData] = useState<T[]>([]);
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

    let q = supabase.from(table).select("*").eq("owner_id", uid);
    if (orderBy)
      q = q.order(orderBy.column, { ascending: orderBy.ascending ?? false });

    const { data: rows, error: qerr } = await q;
    if (qerr) setError(qerr.message);
    else setData((rows ?? []) as T[]);
    setLoading(false);
  }, [table, orderBy]);

  const add = useCallback(
    async (payload: Omit<T, "id" | "owner_id">) => {
      const { error } = await supabase.from(table).insert([payload as any]); // owner_id lo completa DEFAULT auth.uid()
      if (error) throw error;
      await fetchAll();
    },
    [table, fetchAll]
  );

  const update = useCallback(
    async (id: string, patch: Partial<T>) => {
      const { error } = await supabase.from(table).update(patch).eq("id", id);
      if (error) throw error;
      await fetchAll();
    },
    [table, fetchAll]
  );

  const remove = useCallback(
    async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
      await fetchAll();
    },
    [table, fetchAll]
  );

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);
  return { data, loading, error, fetchAll, add, update, remove };
}
