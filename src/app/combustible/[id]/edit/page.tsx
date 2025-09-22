"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { z } from "zod";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getStorage } from "@/lib/storage";

type Storage = ReturnType<typeof getStorage>;
type CombustibleUpdate = Parameters<Storage["combustible"]["update"]>[1];

const schema = z.object({
  fecha: z.string().min(1),
  litros: z.coerce.number().min(0),
  costo_total: z.coerce.number().min(0),
  km: z.coerce.number().int().min(1, "Odómetro > 0"),
  notas: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function EditCombustiblePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  useEffect(() => {
    (async () => {
      const s = getStorage();
      const rec = await s.combustible.get(id);
      if (!rec) {
        toast.error("Carga no encontrada");
        router.replace("/historial");
        return;
      }
      // mapear dominio -> form
      reset({
        fecha: rec.fecha,
        litros: rec.cantidad,
        costo_total: rec.monto,
        km: rec.odometro,
        notas: rec.notas ?? "",
      });
    })();
  }, [id, reset, router]);

  const onSubmit = async (data: FormValues) => {
    try {
      const s = getStorage();
      // mapear form -> dominio (Partial para update)
      const patch: CombustibleUpdate = {
        fecha: data.fecha,
        cantidad: data.litros,
        monto: data.costo_total,
        odometro: data.km,
        notas: data.notas,
        // tipo/unidad si querés también permitir editarlos:
        // tipo: "nafta", unidad: "L",
      };
      await s.combustible.update(id, patch);
      toast.success("Carga actualizada");
      router.push("/historial");
    } catch (e) {
      console.error(e);
      toast.error("No se pudo actualizar");
    }
  };

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Editar combustible</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>Fecha</Label>
                <Input type="date" {...register("fecha")} />
              </div>
              <div>
                <Label>Litros</Label>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  {...register("litros")}
                />
              </div>
              <div>
                <Label>Costo total</Label>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  {...register("costo_total")}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>Odómetro (km)</Label>
                <Input type="number" min={1} {...register("km")} />
              </div>
              <div className="sm:col-span-2">
                <Label>Notas</Label>
                <Textarea rows={3} {...register("notas")} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>
                Guardar cambios
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push("/historial")}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
