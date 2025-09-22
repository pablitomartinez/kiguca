"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { z } from "zod";
import { useForm, type Resolver } from "react-hook-form";
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

import { formatCurrency } from "@/lib/utils/format";
import { getStorage } from "@/lib/storage";

const schema = z.object({
  fecha: z.string().min(1),
  plataforma: z.enum(["uber", "didi"]),
  horas: z.coerce.number().min(0),
  viajes: z.coerce.number().int().min(0),
  bruto: z.coerce.number().int().min(0),
  promos: z.coerce.number().int().min(0).default(0),
  propinas: z.coerce.number().int().min(0).default(0),
  peajes: z.coerce.number().int().min(0).default(0),
  otros_costos: z.coerce.number().int().min(0).default(0),
  notas: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function EditIngresoPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
  });
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  useEffect(() => {
    (async () => {
      const s = getStorage();
      const rec = await s.ingresos.get(id);
      if (!rec) {
        toast.error("Ingreso no encontrado");
        router.replace("/historial");
        return;
      }
      reset({
        fecha: rec.fecha,
        plataforma: rec.plataforma,
        horas: rec.horas,
        viajes: rec.viajes,
        bruto: rec.bruto,
        promos: rec.promos,
        propinas: rec.propinas,
        peajes: rec.peajes,
        otros_costos: rec.otros_costos,
        notas: rec.notas ?? "",
      });
    })();
  }, [id, reset, router]);

  const values = watch();
  const neto = useMemo(() => {
    const b = values.bruto || 0;
    const pr = values.promos || 0;
    const pp = values.propinas || 0;
    const pe = values.peajes || 0;
    const oc = values.otros_costos || 0;
    return b + pr + pp - (pe + oc);
  }, [values]);

  const onSubmit = async (data: FormValues) => {
    try {
      const s = getStorage();
      await s.ingresos.update(id, { ...data, neto });
      toast.success("Ingreso actualizado");
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
          <CardTitle>Editar ingreso</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Igual al form de "nuevo" */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Fecha</Label>
                <Input type="date" {...register("fecha")} />
              </div>
              <div>
                <Label>Plataforma</Label>
                <Select
                  onValueChange={(v: "uber" | "didi") =>
                    setValue("plataforma", v, { shouldValidate: true })
                  }
                  defaultValue={values.plataforma}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Elegí" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="uber">Uber</SelectItem>
                    <SelectItem value="didi">DiDi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Horas</Label>
                <Input
                  type="number"
                  step="0.1"
                  min={0}
                  {...register("horas")}
                />
              </div>
              <div>
                <Label>Viajes</Label>
                <Input type="number" min={0} {...register("viajes")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Bruto</Label>
                <Input type="number" min={0} {...register("bruto")} />
              </div>
              <div>
                <Label>Promos</Label>
                <Input type="number" min={0} {...register("promos")} />
              </div>
              <div>
                <Label>Propinas</Label>
                <Input type="number" min={0} {...register("propinas")} />
              </div>
              <div>
                <Label>Peajes</Label>
                <Input type="number" min={0} {...register("peajes")} />
              </div>
              <div>
                <Label>Otros costos</Label>
                <Input type="number" min={0} {...register("otros_costos")} />
              </div>
            </div>

            <div>
              <Label>Notas</Label>
              <Textarea rows={3} {...register("notas")} />
            </div>

            <div className="p-3 rounded border">
              <p className="text-sm text-muted-foreground">Neto estimado</p>
              <p className="text-2xl font-bold">{formatCurrency(neto)}</p>
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
