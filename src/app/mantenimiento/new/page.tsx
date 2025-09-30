"use client";

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
type MantenimientoCreate = Parameters<Storage["mantenimiento"]["create"]>[0];

const schema = z.object({
  fecha: z.string().min(1, "Requerido"),
  categoria: z.string().min(1, "Requerido"),
  costo: z.coerce.number().min(0, "≥ 0"),
  km: z.coerce.number().int().min(1, "Odómetro > 0"), // ← requerido
  notas: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function MantenimientoNewPage() {
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      fecha: new Date().toISOString().slice(0, 10),
      categoria: "service",
      costo: 0,
      km: undefined,
      notas: "",
    } satisfies DefaultValues<FormValues>,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

const onSubmit = async (data: FormValues) => {
  try {
    const storage = getStorage();

    const payload: MantenimientoCreate = {
      fecha: data.fecha,
      categoria: data.categoria,
      detalle: data.notas?.trim() || data.categoria, // detalle es requerido
      odometro: data.km, // requerido por el tipo
      costo: data.costo
      // adjunto_url: "..."  // si lo agregás a futuro
    };

    await storage.mantenimiento.create(payload);
    emitDataUpdated();
    toast.success("Mantenimiento guardado");
    router.push("/historial");
  } catch (e) {
    console.error(e);
    toast.error("No se pudo guardar");
  }
};

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Registrar mantenimiento</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>Fecha</Label>
                <Input type="date" {...register("fecha")} />
                {errors.fecha && (
                  <p className="text-sm text-red-500">{errors.fecha.message}</p>
                )}
              </div>
              <div>
                <Label>Categoría</Label>
                <Input
                  placeholder="aceite, frenos, neumáticos…"
                  {...register("categoria")}
                />
                {errors.categoria && (
                  <p className="text-sm text-red-500">
                    {errors.categoria.message}
                  </p>
                )}
              </div>
              <div>
                <Label>Costo (ARS)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  {...register("costo")}
                />
                {errors.costo && (
                  <p className="text-sm text-red-500">{errors.costo.message}</p>
                )}
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

            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>
                Guardar
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
