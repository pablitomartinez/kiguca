"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm, type Resolver, type DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { getStorage } from "@/lib/storage";
import type { Objetivo as ObjetivoBase } from "@/types";
import AuthGate from "@/components/AuthGate";

// Tomamos el tipo global y lo “estrechamos” a objetos con id:string para edición
type Objetivo = ObjetivoBase & { id: string };

const schema = z.object({
  monto: z.coerce.number().min(1, "Ingresá un monto mayor a 0"),
  periodo: z.union([z.literal("semanal"), z.literal("mensual")]),
  fecha_inicio: z.string().min(1, "Requerido"), // YYYY-MM-DD
  fecha_fin: z.string().min(1, "Requerido"), // YYYY-MM-DD (auto)
  notas: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

function addDays(isoDate: string, days: number) {
  const d = new Date(isoDate + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
function computeFechaFin(fecha_inicio: string, periodo: "semanal" | "mensual") {
  if (!fecha_inicio) return "";
  return periodo === "semanal"
    ? addDays(fecha_inicio, 6)
    : addDays(fecha_inicio, 29);
}

export default function ObjetivoPage() {
  const router = useRouter();
  const [existing, setExisting] = useState<Objetivo | null>(null);

  // Cargar objetivo “activo” (tomamos el más reciente si hay varios)
  useEffect(() => {
    const load = async () => {
      const storage = getStorage();
      const list = await storage.objetivos.list(); // ObjetivoBase[]
      // quedarnos con el más reciente que tenga id:string
      const withId = (list as ObjetivoBase[])
        .filter((o): o is Objetivo => typeof o.id === "string")
        .sort(
          (a, b) =>
            new Date(b.created_at ?? 0).getTime() -
            new Date(a.created_at ?? 0).getTime()
        );
      setExisting(withId[0] ?? null);
    };
    load();
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      monto: 700000, // valor por defecto
      periodo: "mensual",
      fecha_inicio: new Date().toISOString().slice(0, 10),
      fecha_fin: "", // lo completamos en useEffect según periodo/fecha_inicio
      notas: "",
    } satisfies DefaultValues<FormValues>,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = form;

  // Prefill si ya hay objetivo existente
  useEffect(() => {
    if (!existing) return;
    setValue("monto", Number((existing as any).monto ?? 0));
    setValue(
      "periodo",
      ((existing as any).periodo ?? "mensual") as "semanal" | "mensual"
    );
    setValue(
      "fecha_inicio",
      String(
        (existing as any).fecha_inicio ?? new Date().toISOString().slice(0, 10)
      )
    );
    setValue("fecha_fin", String((existing as any).fecha_fin ?? ""));
    setValue("notas", String((existing as any).notas ?? ""));
  }, [existing, setValue]);

  const { periodo, fecha_inicio } = watch();

  // Autocalcular fecha_fin cuando cambie periodo o fecha_inicio
  useEffect(() => {
    const fin = computeFechaFin(fecha_inicio, periodo);
    if (fin) setValue("fecha_fin", fin, { shouldValidate: true });
  }, [periodo, fecha_inicio, setValue]);

  const title = useMemo(
    () => (existing ? "Editar objetivo" : "Crear objetivo"),
    [existing]
  );

  const onSubmit = async (data: FormValues) => {
    try {
      const payload = {
        monto: data.monto,
        periodo: data.periodo, // "semanal" | "mensual"
        fecha_inicio: data.fecha_inicio, // YYYY-MM-DD
        fecha_fin: data.fecha_fin, // YYYY-MM-DD
        notas: data.notas ?? "",
      };

      const storage = getStorage();
      if (existing?.id) {
        // OK: update acepta Partial<Objetivo>
        await storage.objetivos.update(existing.id, payload);
        toast.success("Objetivo actualizado");
      } else {
        // ⬇️ AQUI agregamos los campos que faltan para "create"
        const payloadCreate: Omit<
          Objetivo,
          "id" | "created_at" | "updated_at"
        > = {
          ...payload,
          nombre: "Meta activa", // valor por defecto
          estado: "activo", // usa el valor válido según tu union
        };
        await storage.objetivos.create(payloadCreate);
        toast.success("Objetivo creado");
      }

      router.push("/");
    } catch (e) {
      console.error(e);
      toast.error("No se pudo guardar el objetivo");
    }
  };

  return (
    <AuthGate>
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label>Monto objetivo (ARS)</Label>
                  <Input type="number" min={1} {...register("monto")} />
                  {errors.monto && (
                    <p className="text-sm text-red-500">
                      {errors.monto.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label>Período</Label>
                  <Select
                    value={periodo}
                    onValueChange={(v: "semanal" | "mensual") =>
                      setValue("periodo", v, { shouldValidate: true })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Elegí" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semanal">Semanal</SelectItem>
                      <SelectItem value="mensual">Mensual</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.periodo && (
                    <p className="text-sm text-red-500">
                      {errors.periodo.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label>Inicio</Label>
                  <Input type="date" {...register("fecha_inicio")} />
                  {errors.fecha_inicio && (
                    <p className="text-sm text-red-500">
                      {errors.fecha_inicio.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Fin (auto)</Label>
                  <Input type="date" {...register("fecha_fin")} readOnly />
                  {errors.fecha_fin && (
                    <p className="text-sm text-red-500">
                      {errors.fecha_fin.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label>Notas</Label>
                  <Textarea
                    rows={3}
                    placeholder="Opcional..."
                    {...register("notas")}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  Guardar
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.push("/")}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AuthGate>
  );
}
