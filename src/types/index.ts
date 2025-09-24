// Tipos de datos para Kiguca PWA
// Todos los importes en ARS (enteros)

// ✅ añade este alias de tipo de creación SIN `neto`
export type IngresoCreate = Omit<Ingreso, "id" | "neto" | "created_at" | "updated_at">;

export interface Ingreso {
  id?: string;
  fecha: string; // ISO YYYY-MM-DD
  plataforma: "uber" | "didi";
  horas: number; // >= 0
  viajes: number; // int >= 0
  bruto: number; // int >= 0 (ARS)
  promos: number; // int >= 0 (ARS)
  propinas: number; // int >= 0 (ARS)
  peajes: number; // int >= 0 (ARS)
  otros_costos: number; // int >= 0 (ARS)
  notas?: string;
  neto: number; // calculado: bruto + promos + propinas - (peajes + otros_costos)
  created_at?: string; // ISO timestamp
  updated_at?: string;
}

export interface Combustible {
  id?: string;
  fecha: string; // ISO YYYY-MM-DD
  tipo: "nafta" | "gnc";
  cantidad: number; // > 0, litros o m³
  unidad: "L" | "m3";
  monto: number; // int >= 0 (ARS)
  odometro: number; // int > 0 (km)
  estacion?: string;
  notas?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Mantenimiento {
  id?: string;
  fecha: string; // ISO YYYY-MM-DD
  categoria: string; // "frenos", "aceite", "correas", "neumáticos", "suspensión", etc.
  detalle: string;
  odometro: number; // int > 0 (km)
  costo: number; // int >= 0 (ARS)
  adjunto_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Objetivo {
  id?: string;
  nombre: string;
  monto: number; // int > 0 (ARS)
  periodo: "semanal" | "mensual";
  fecha_inicio: string; // ISO YYYY-MM-DD
  fecha_fin: string; // ISO YYYY-MM-DD
  estado: "activo" | "cerrado";
  created_at?: string;
  updated_at?: string;
}

// Tipos para métricas calculadas
export interface MetricasCombustible {
  costo_por_unidad: number;
  km_desde_ultima: number;
  consumo_100km: number;
  costo_por_km: number;
}

export interface MetricasIngresos {
  neto_por_hora: number;
  neto_por_viaje: number;
  porcentaje_promos: number; // promos/bruto * 100
  porcentaje_costos: number; // (peajes + otros_costos)/bruto * 100
}

export interface ResumenPeriodo {
  fecha_inicio: string;
  fecha_fin: string;
  total_neto: number;
  total_horas: number;
  total_viajes: number;
  total_combustible: number;
  total_mantenimiento: number;
  neto_por_hora: number;
  neto_por_viaje: number;
}

// Tipos para charts
export interface DatoChart {
  fecha: string;
  valor: number;
  label?: string;
}

export interface DatoChartPorPlataforma {
  plataforma: string;
  valor: number;
  porcentaje: number;
}

// Tipos para storage engine
export type StorageEngineType = "local" | "supabase";

export interface StorageEngine {
  // CRUD operations para cada entidad
  ingresos: {
    list(): Promise<Ingreso[]>;
    get(id: string): Promise<Ingreso | null>;
    create(data: IngresoCreate): Promise<Ingreso>;
    update(id: string, data: Partial<Ingreso>): Promise<Ingreso>;
    remove(id: string): Promise<boolean>;
  };
  combustible: {
    list(): Promise<Combustible[]>;
    get(id: string): Promise<Combustible | null>;
    create(
      data: Omit<Combustible, "id" | "created_at" | "updated_at">
    ): Promise<Combustible>;
    update(id: string, data: Partial<Combustible>): Promise<Combustible>;
    remove(id: string): Promise<boolean>;
  };
  mantenimiento: {
    list(): Promise<Mantenimiento[]>;
    get(id: string): Promise<Mantenimiento | null>;
    create(
      data: Omit<Mantenimiento, "id" | "created_at" | "updated_at">
    ): Promise<Mantenimiento>;
    update(id: string, data: Partial<Mantenimiento>): Promise<Mantenimiento>;
    remove(id: string): Promise<boolean>;
  };
  objetivos: {
    list(): Promise<Objetivo[]>;
    get(id: string): Promise<Objetivo | null>;
    create(
      data: Omit<Objetivo, "id" | "created_at" | "updated_at">
    ): Promise<Objetivo>;
    update(id: string, data: Partial<Objetivo>): Promise<Objetivo>;
    remove(id: string): Promise<boolean>;
  };
  // Export/Import
  export(): Promise<{
    ingresos: Ingreso[];
    combustible: Combustible[];
    mantenimiento: Mantenimiento[];
    objetivos: Objetivo[];
  }>;
  import(data: any): Promise<{
    created: number;
    updated: number;
    errors: string[];
  }>;
}

// Estados para sync (preparado para Supabase)
export interface SyncQueueItem {
  id: string;
  entity: "ingresos" | "combustible" | "mantenimiento" | "objetivos";
  operation: "create" | "update" | "delete";
  data: any;
  status: "queued" | "syncing" | "synced" | "error";
  attempts: number;
  created_at: string;
  error_message?: string;
}

export interface AppConfig {
  storage_engine: StorageEngineType;
  supabase_url?: string;
  supabase_anon_key?: string;
  version: string;
}
