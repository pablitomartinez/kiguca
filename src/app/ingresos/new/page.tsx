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
  fecha: z.string().min(1, "Requerido"), // YYYY-MM-DD
  plataforma: z.union([z.literal("uber"), z.literal("didi")]),
  horas: z.coerce.number().min(0, "≥ 0"),
  viajes: z.coerce.number().int().min(0, "≥ 0"),
  bruto: z.coerce.number().int().min(0, "≥ 0"),
  promos: z.coerce.number().int().min(0, "≥ 0").default(0),
  propinas: z.coerce.number().int().min(0, "≥ 0").default(0),
  peajes: z.coerce.number().int().min(0, "≥ 0").default(0),
  otros_costos: z.coerce.number().int().min(0, "≥ 0").default(0),
  notas: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function NewIngresoPage() {
  const router = useRouter();

   const form = useForm<FormValues>({
     resolver: zodResolver(schema) as Resolver<FormValues>, // 👈 fix
     defaultValues: {
       fecha: new Date().toISOString().slice(0, 10),
       plataforma: undefined as unknown as "uber" | "didi",
       horas: 0,
       viajes: 0,
       bruto: 0,
       promos: 0,
       propinas: 0,
       peajes: 0,
       otros_costos: 0,
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

  const values = watch();
  const neto = useMemo(() => {
    const b = values.bruto || 0;
    const pr = values.promos || 0;
    const pp = values.propinas || 0;
    const pe = values.peajes || 0;
    const oc = values.otros_costos || 0;
    return b + pr + pp - (pe + oc);
  }, [values]);

//   async function onSubmit(data: FormValues) {
//     try {
//       const payload = {
//         ...data,
//         neto,
//         // si tu StorageEngine necesita un id, descomentá:
//         // id: crypto.randomUUID(),
//       };

//       const storage = getStorage(); // o usa `storage` si ese es tu export
//       // asumo que la API es create("ingresos", payload)
//       await storage.create("ingresos", payload);

//       toast.success("Ingreso guardado");
//       router.push("/"); // volver al dashboard
//     } catch (e) {
//       console.error(e);
//       toast.error("No se pudo guardar el ingreso");
//     }
//   }

 const onSubmit = async (data: FormValues) => {
   try {
     const payload = { ...data, neto };
     const storage = getStorage();
     await storage.ingresos.create(payload); // 👈 colección ingresos

     toast.success("Ingreso guardado");
     router.push("/");
   } catch (e) {
     console.error(e);
     toast.error("No se pudo guardar el ingreso");
   }
 };

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Registrar Ingreso</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Fecha</Label>
                <Input type="date" {...register("fecha")} />
                {errors.fecha && (
                  <p className="text-sm text-red-500">{errors.fecha.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label>Plataforma</Label>
                <Select
                  onValueChange={(v: "uber" | "didi") =>
                    setValue("plataforma", v, { shouldValidate: true })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Elegí" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="uber">Uber</SelectItem>
                    <SelectItem value="didi">DiDi</SelectItem>
                  </SelectContent>
                </Select>
                {errors.plataforma && (
                  <p className="text-sm text-red-500">
                    {errors.plataforma.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Horas</Label>
                <Input
                  type="number"
                  step="0.1"
                  min={0}
                  {...register("horas")}
                />
                {errors.horas && (
                  <p className="text-sm text-red-500">{errors.horas.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label>Viajes</Label>
                <Input type="number" min={0} {...register("viajes")} />
                {errors.viajes && (
                  <p className="text-sm text-red-500">
                    {errors.viajes.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Bruto (ARS)</Label>
                <Input type="number" min={0} {...register("bruto")} />
                {errors.bruto && (
                  <p className="text-sm text-red-500">{errors.bruto.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label>Promos (ARS)</Label>
                <Input type="number" min={0} {...register("promos")} />
              </div>

              <div className="space-y-1">
                <Label>Propinas (ARS)</Label>
                <Input type="number" min={0} {...register("propinas")} />
              </div>

              <div className="space-y-1">
                <Label>Peajes (ARS)</Label>
                <Input type="number" min={0} {...register("peajes")} />
              </div>

              <div className="space-y-1">
                <Label>Otros costos (ARS)</Label>
                <Input type="number" min={0} {...register("otros_costos")} />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Notas</Label>
              <Textarea rows={3} {...register("notas")} />
            </div>

            <div className="p-3 rounded-lg border">
              <p className="text-sm text-muted-foreground">Neto estimado</p>
              <p className="text-2xl font-bold">{formatCurrency(neto)}</p>
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
  );
}
