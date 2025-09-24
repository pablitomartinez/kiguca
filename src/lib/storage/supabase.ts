import { supabase } from "@/lib/supabase/client";
import type { Ingreso,IngresoCreate, Combustible, Mantenimiento, Objetivo } from "@/types";

class SupabaseEngine {
  // ---------- Ingresos ----------
  ingresos = {
    list: async (): Promise<Ingreso[]> => {
      const { data, error } = await supabase
        .from("ingresos")
        .select("*")
        .order("fecha", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    get: async (id: string): Promise<Ingreso | null> => {
      const { data, error } = await supabase
        .from("ingresos")
        .select("*")
        .eq("id", id)
        .single();
      if (error) return null;
      return data;
    },
    create: async (data: IngresoCreate): Promise<Ingreso> => {
      // 🛡️ filtramos por si acaso
      const { id, neto, created_at, updated_at, owner_id, ...row } =
        data as any;
      const { data: inserted, error } = await supabase
        .from("ingresos")
        .insert([row])
        .select("*")
        .single();
      if (error) throw error;
      return inserted!;
    },
    update: async (id: string, partial: Partial<Ingreso>): Promise<Ingreso> => {
      // si viene neto, ignoralo (lo calcula la DB)
      const { neto, ...rest } = partial as any;
      const { data, error } = await supabase
        .from("ingresos")
        .update(rest)
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw error;
      return data!;
    },
    remove: async (id: string): Promise<boolean> => {
      const { error } = await supabase.from("ingresos").delete().eq("id", id);
      if (error) throw error;
      return true;
    },
  };

  // ---------- Combustible ----------
  combustible = {
    list: async (): Promise<Combustible[]> => {
      const { data, error } = await supabase
        .from("combustible")
        .select("*")
        .order("fecha", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    get: async (id: string): Promise<Combustible | null> => {
      const { data, error } = await supabase
        .from("combustible")
        .select("*")
        .eq("id", id)
        .single();
      if (error) return null;
      return data;
    },
    create: async (
      data: Omit<Combustible, "id" | "created_at" | "updated_at">
    ): Promise<Combustible> => {
      const { data: inserted, error } = await supabase
        .from("combustible")
        .insert([data])
        .select("*")
        .single();
      if (error) throw error;
      return inserted!;
    },
    update: async (
      id: string,
      partial: Partial<Combustible>
    ): Promise<Combustible> => {
      const { data, error } = await supabase
        .from("combustible")
        .update(partial)
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw error;
      return data!;
    },
    remove: async (id: string): Promise<boolean> => {
      const { error } = await supabase
        .from("combustible")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return true;
    },
  };

  // ---------- Mantenimiento ----------
  mantenimiento = {
    list: async (): Promise<Mantenimiento[]> => {
      const { data, error } = await supabase
        .from("mantenimiento")
        .select("*")
        .order("fecha", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    get: async (id: string): Promise<Mantenimiento | null> => {
      const { data, error } = await supabase
        .from("mantenimiento")
        .select("*")
        .eq("id", id)
        .single();
      if (error) return null;
      return data;
    },
    create: async (
      data: Omit<Mantenimiento, "id" | "created_at" | "updated_at">
    ): Promise<Mantenimiento> => {
      const { data: inserted, error } = await supabase
        .from("mantenimiento")
        .insert([data])
        .select("*")
        .single();
      if (error) throw error;
      return inserted!;
    },
    update: async (
      id: string,
      partial: Partial<Mantenimiento>
    ): Promise<Mantenimiento> => {
      const { data, error } = await supabase
        .from("mantenimiento")
        .update(partial)
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw error;
      return data!;
    },
    remove: async (id: string): Promise<boolean> => {
      const { error } = await supabase
        .from("mantenimiento")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return true;
    },
  };

  // ---------- Objetivos ----------
  objetivos = {
    list: async (): Promise<Objetivo[]> => {
      const { data, error } = await supabase
        .from("objetivos")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    get: async (id: string): Promise<Objetivo | null> => {
      const { data, error } = await supabase
        .from("objetivos")
        .select("*")
        .eq("id", id)
        .single();
      if (error) return null;
      return data;
    },
    create: async (
      data: Omit<Objetivo, "id" | "created_at" | "updated_at">
    ): Promise<Objetivo> => {
      const { data: inserted, error } = await supabase
        .from("objetivos")
        .insert([data])
        .select("*")
        .single();
      if (error) throw error;
      return inserted!;
    },
    update: async (
      id: string,
      partial: Partial<Objetivo>
    ): Promise<Objetivo> => {
      const { data, error } = await supabase
        .from("objetivos")
        .update(partial)
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw error;
      return data!;
    },
    remove: async (id: string): Promise<boolean> => {
      const { error } = await supabase.from("objetivos").delete().eq("id", id);
      if (error) throw error;
      return true;
    },
  };

  // ---------- Export/Import ----------
  export = async () => {
    const [ing, comb, mant, obj] = await Promise.all([
      this.ingresos.list(),
      this.combustible.list(),
      this.mantenimiento.list(),
      this.objetivos.list(),
    ]);
    return {
      ingresos: ing,
      combustible: comb,
      mantenimiento: mant,
      objetivos: obj,
    };
  };

  import = async (data: any) => {
    // Import sencillo por colecciones. Usa upsert por id si viene.
    // Requiere sesión (RLS).
    let created = 0;
    let updated = 0;
    const errors: string[] = [];

    async function upsert(table: string, rows: any[]) {
      if (!Array.isArray(rows) || rows.length === 0) return;
      // upsert por id (si no tiene id, inserta)
      const { data: res, error } = await supabase
        .from(table)
        .upsert(rows, { onConflict: "id" })
        .select("id");
      if (error) throw error;
      // estimación naive: contamos como created si no existía id
      rows.forEach((r) => (r.id ? (updated += 1) : (created += 1)));
      return res;
    }

    try {
      if (data.ingresos) await upsert("ingresos", data.ingresos);
      if (data.combustible) await upsert("combustible", data.combustible);
      if (data.mantenimiento) await upsert("mantenimiento", data.mantenimiento);
      if (data.objetivos) await upsert("objetivos", data.objetivos);
    } catch (e: any) {
      errors.push(String(e?.message ?? e));
    }

    return { created, updated, errors };
  };
}

export default SupabaseEngine;
