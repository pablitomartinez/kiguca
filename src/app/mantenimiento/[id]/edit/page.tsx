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
type MantUpdate = Parameters<Storage["mantenimiento"]["update"]>[1];

const schema = z.object({
  fecha: z.string().min(1),
  categoria: z.string().min(1),
  costo: z.coerce.number().min(0),
  km: z.coerce.number().int().min(1, "Odómetro > 0"),
  notas: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function EditMantenimientoPage() {
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
      const rec = await s.mantenimiento.get(id);
      if (!rec) {
        toast.error("Mantenimiento no encontrado");
        router.replace("/historial");
        return;
      }
      reset({
        fecha: rec.fecha,
        categoria: rec.categoria,
        costo: rec.costo,
        km: rec.odometro,
        notas: rec.detalle ?? "",
      });
    })();
  }, [id, reset, router]);

  const onSubmit = async (data: FormValues) => {
    try {
      const s = getStorage();
      const patch: MantUpdate = {
        fecha: data.fecha,
        categoria: data.categoria,
        costo: data.costo,
        odometro: data.km,
        detalle: (data.notas ?? "").trim() || data.categoria, // ✅ textarea → detalle
      };

      await s.mantenimiento.update(id, patch);
      toast.success("Mantenimiento actualizado");
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
          <CardTitle>Editar mantenimiento</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>Fecha</Label>
                <Input type="date" {...register("fecha")} />
              </div>
              <div>
                <Label>Categoría</Label>
                <Input {...register("categoria")} />
              </div>
              <div>
                <Label>Costo (ARS)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  {...register("costo")}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>Odómetro (km)</Label>
                <Input type="number" min={1} {...register("km")} />
              </div>
              <div className="sm:col-span-2">
                <Label>Detalle / Notas</Label>
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
