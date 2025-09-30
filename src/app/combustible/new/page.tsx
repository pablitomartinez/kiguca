"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm, type Resolver, type DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getStorage } from "@/lib/storage";
import { emitDataUpdated } from "@/lib/utils/events";

type Storage = ReturnType<typeof getStorage>;
type CombustibleCreate = Parameters<Storage["combustible"]["create"]>[0];

const schema = z.object({
  fecha: z.string().min(1, "Requerido"),
  litros: z.coerce.number().min(0, "≥ 0"),
  costo_total: z.coerce.number().min(0, "≥ 0"),
  km: z.coerce.number().int().min(1, "Odómetro > 0"), // ← requerido
  notas: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function CombustibleNewPage() {
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      fecha: new Date().toISOString().slice(0, 10),
      litros: 0,
      costo_total: 0,
      km: undefined,
      notas: "",
    } satisfies DefaultValues<FormValues>,
  });

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = form;

  const values = watch();
  const precioXLitro = useMemo(() => {
    const l = Number(values.litros || 0);
    const c = Number(values.costo_total || 0);
    return l > 0 ? c / l : 0;
  }, [values]);

  const onSubmit = async (data: FormValues) => {
    try {
      const storage = getStorage();

      const payload: CombustibleCreate = {
        fecha: data.fecha,
        tipo: "nafta", // default (cambiá a "gnc" si corresponde)
        cantidad: data.litros,
        unidad: "L", // tus types aceptan "L" | "m3"
        monto: data.costo_total,
        odometro: data.km, // requerido por el tipo
        notas: data.notas,
        // estacion: "AXION"   // opcional, si algún día sumás el campo
      };

      await storage.combustible.create(payload);
      emitDataUpdated();
      toast.success("Carga de combustible guardada");
      router.push("/historial");
    } catch (e) {
      console.error(e);
      toast.error("No se pudo guardar");
    }
  };


  return (
    <div className="p-4">
      <Card>
        <CardHeader><CardTitle>Registrar combustible</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>Fecha</Label>
                <Input type="date" {...register("fecha")} />
                {errors.fecha && <p className="text-sm text-red-500">{errors.fecha.message}</p>}
              </div>
              <div>
                <Label>Litros</Label>
                <Input type="number" step="0.01" min={0} {...register("litros")} />
                {errors.litros && <p className="text-sm text-red-500">{errors.litros.message}</p>}
              </div>
              <div>
                <Label>Costo total (ARS)</Label>
                <Input type="number" step="0.01" min={0} {...register("costo_total")} />
                {errors.costo_total && <p className="text-sm text-red-500">{errors.costo_total.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>KM (odómetro)</Label>
                <Input type="number" min={0} {...register("km")} />
              </div>
              <div className="sm:col-span-2">
                <Label>Notas</Label>
                <Textarea rows={3} {...register("notas")} />
              </div>
            </div>

            <div className="rounded border p-3 text-sm">
              <span className="text-muted-foreground">Precio por litro aprox: </span>
              <span className="font-semibold">
                {precioXLitro.toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
              </span>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>Guardar</Button>
              <Button type="button" variant="secondary" onClick={() => router.push("/historial")}>Cancelar</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
