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
    import: async (dump: any) => {
      const errors: string[] = [];
      let created = 0;
      let updated = 0; // para ahora no hacemos upsert, solo insert; dejamos el contador por compat

      // helpers
      const safe = <T extends object>(o: any, pick: (keyof T)[]) => {
        const out: any = {};
        for (const k of pick)
          if (o[k as string] !== undefined) out[k as string] = o[k as string];
        return out;
      };
      const arr = (x: any) => (Array.isArray(x) ? x : []);

      // 1) INGRESOS
      try {
        const raw = arr(dump.ingresos);
        if (raw.length) {
          const rows = raw.map((r: any) =>
            safe<{
              fecha: string;
              plataforma: "uber" | "didi";
              horas: number;
              viajes: number;
              bruto: number;
              promos: number;
              propinas: number;
              peajes: number;
              otros_costos: number;
              notas?: string;
            }>(r, [
              "fecha",
              "plataforma",
              "horas",
              "viajes",
              "bruto",
              "promos",
              "propinas",
              "peajes",
              "otros_costos",
              "notas",
            ])
          );
          if (rows.length) {
            const { error, count } = await supabase
              .from("ingresos")
              .insert(rows, { count: "exact" });
            if (error) throw error;
            created += count ?? rows.length;
          }
        }
      } catch (e: any) {
        errors.push(`ingresos: ${e.message ?? e}`);
      }

      // 2) COMBUSTIBLE (normaliza formatos viejos)
      try {
        const raw = arr(dump.combustible);
        if (raw.length) {
          const rows = raw.map((r: any) => {
            // Soporte legacy: {litros, costo_total, km}
            if (
              r.litros !== undefined ||
              r.costo_total !== undefined ||
              r.km !== undefined
            ) {
              return {
                fecha: r.fecha,
                tipo: r.tipo ?? "nafta",
                cantidad: Number(r.litros ?? r.cantidad ?? 0),
                unidad: r.unidad ?? "L",
                monto: Number(r.costo_total ?? r.monto ?? 0),
                odometro: Number(r.km ?? r.odometro ?? 0),
                estacion: r.estacion ?? null,
                notas: r.notas ?? null,
              };
            }
            // formato actual
            return safe<{
              fecha: string;
              tipo: "nafta" | "gnc";
              cantidad: number;
              unidad: "L" | "m3";
              monto: number;
              odometro: number;
              estacion?: string;
              notas?: string;
            }>(r, [
              "fecha",
              "tipo",
              "cantidad",
              "unidad",
              "monto",
              "odometro",
              "estacion",
              "notas",
            ]);
          });
          const clean = rows.filter(
            (x: any) => x.fecha && x.monto !== undefined && x.odometro
          );
          if (clean.length) {
            const { error, count } = await supabase
              .from("combustible")
              .insert(clean, { count: "exact" });
            if (error) throw error;
            created += count ?? clean.length;
          }
        }
      } catch (e: any) {
        errors.push(`combustible: ${e.message ?? e}`);
      }

      // 3) MANTENIMIENTO (normaliza km→odometro)
      try {
        const raw = arr(dump.mantenimiento);
        if (raw.length) {
          const rows = raw.map((r: any) => ({
            fecha: r.fecha,
            categoria: r.categoria,
            detalle: r.detalle ?? r.notas ?? "-", // si venía solo "notas"
            odometro: Number(r.odometro ?? r.km ?? 0),
            costo: Number(r.costo ?? 0),
            adjunto_url: r.adjunto_url ?? null,
          }));
          const clean = rows.filter(
            (x: any) =>
              x.fecha && x.categoria && x.detalle && x.costo !== undefined
          );
          if (clean.length) {
            const { error, count } = await supabase
              .from("mantenimiento")
              .insert(clean, { count: "exact" });
            if (error) throw error;
            created += count ?? clean.length;
          }
        }
      } catch (e: any) {
        errors.push(`mantenimiento: ${e.message ?? e}`);
      }

      // 4) OBJETIVOS (ahora incluye `notas`)
      try {
        const raw = arr(dump.objetivos);
        if (raw.length) {
          const rows = raw.map((r: any) => ({
            nombre: r.nombre ?? "Objetivo del período",
            monto: Number(r.monto ?? 0),
            periodo: r.periodo, // "semanal" | "mensual"
            fecha_inicio: r.fecha_inicio,
            fecha_fin: r.fecha_fin,
            estado: r.estado ?? "activo",
            notas: r.notas ?? null,
          }));
          const clean = rows.filter(
            (x: any) =>
              x.monto > 0 && x.periodo && x.fecha_inicio && x.fecha_fin
          );
          if (clean.length) {
            const { error, count } = await supabase
              .from("objetivos")
              .insert(clean, { count: "exact" });
            if (error) throw error;
            created += count ?? clean.length;
          }
        }
      } catch (e: any) {
        errors.push(`objetivos: ${e.message ?? e}`);
      }

      return { created, updated, errors };
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
