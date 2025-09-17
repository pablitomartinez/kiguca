import type {
  StorageEngine,
  Ingreso,
  Combustible,
  Mantenimiento,
  Objetivo,
} from "../../types";

// Supabase Engine - Stub para v0.1, preparado para activación futura
class SupabaseEngine implements StorageEngine {
  private supabaseUrl?: string;
  private supabaseKey?: string;

  constructor(url?: string, key?: string) {
    this.supabaseUrl = url;
    this.supabaseKey = key;
  }

  private notImplemented(): Promise<never> {
    return Promise.reject(
      new Error(
        "Supabase no está configurado. Usa localStorage o configura Supabase en /ajustes/supabase"
      )
    );
  }

  private validateConnection(): boolean {
    return Boolean(this.supabaseUrl && this.supabaseKey);
  }

  // Ingresos - Stubs
  ingresos = {
    list: (): Promise<Ingreso[]> => {
      if (!this.validateConnection()) return this.notImplemented();
      // TODO: Implementar con Supabase client
      return Promise.resolve([]);
    },

    get: (id: string): Promise<Ingreso | null> => {
      if (!this.validateConnection()) return this.notImplemented();
      // TODO: Implementar con Supabase client
      return Promise.resolve(null);
    },

    create: (
      data: Omit<Ingreso, "id" | "created_at" | "updated_at">
    ): Promise<Ingreso> => {
      if (!this.validateConnection()) return this.notImplemented();
      // TODO: Implementar con Supabase client
      // Calcular neto antes de enviar a BD
      const neto =
        data.bruto +
        data.promos +
        data.propinas -
        (data.peajes + data.otros_costos);
      const newData = { ...data, neto };
      return this.notImplemented();
    },

    update: (id: string, data: Partial<Ingreso>): Promise<Ingreso> => {
      if (!this.validateConnection()) return this.notImplemented();
      // TODO: Implementar con Supabase client
      return this.notImplemented();
    },

    remove: (id: string): Promise<boolean> => {
      if (!this.validateConnection()) return this.notImplemented();
      // TODO: Implementar con Supabase client
      return Promise.resolve(false);
    },
  };

  // Combustible - Stubs
  combustible = {
    list: (): Promise<Combustible[]> => {
      if (!this.validateConnection()) return this.notImplemented();
      return Promise.resolve([]);
    },

    get: (id: string): Promise<Combustible | null> => {
      if (!this.validateConnection()) return this.notImplemented();
      return Promise.resolve(null);
    },

    create: (
      data: Omit<Combustible, "id" | "created_at" | "updated_at">
    ): Promise<Combustible> => {
      if (!this.validateConnection()) return this.notImplemented();
      return this.notImplemented();
    },

    update: (id: string, data: Partial<Combustible>): Promise<Combustible> => {
      if (!this.validateConnection()) return this.notImplemented();
      return this.notImplemented();
    },

    remove: (id: string): Promise<boolean> => {
      if (!this.validateConnection()) return this.notImplemented();
      return Promise.resolve(false);
    },
  };

  // Mantenimiento - Stubs
  mantenimiento = {
    list: (): Promise<Mantenimiento[]> => {
      if (!this.validateConnection()) return this.notImplemented();
      return Promise.resolve([]);
    },

    get: (id: string): Promise<Mantenimiento | null> => {
      if (!this.validateConnection()) return this.notImplemented();
      return Promise.resolve(null);
    },

    create: (
      data: Omit<Mantenimiento, "id" | "created_at" | "updated_at">
    ): Promise<Mantenimiento> => {
      if (!this.validateConnection()) return this.notImplemented();
      return this.notImplemented();
    },

    update: (
      id: string,
      data: Partial<Mantenimiento>
    ): Promise<Mantenimiento> => {
      if (!this.validateConnection()) return this.notImplemented();
      return this.notImplemented();
    },

    remove: (id: string): Promise<boolean> => {
      if (!this.validateConnection()) return this.notImplemented();
      return Promise.resolve(false);
    },
  };

  // Objetivos - Stubs
  objetivos = {
    list: (): Promise<Objetivo[]> => {
      if (!this.validateConnection()) return this.notImplemented();
      return Promise.resolve([]);
    },

    get: (id: string): Promise<Objetivo | null> => {
      if (!this.validateConnection()) return this.notImplemented();
      return Promise.resolve(null);
    },

    create: (
      data: Omit<Objetivo, "id" | "created_at" | "updated_at">
    ): Promise<Objetivo> => {
      if (!this.validateConnection()) return this.notImplemented();
      return this.notImplemented();
    },

    update: (id: string, data: Partial<Objetivo>): Promise<Objetivo> => {
      if (!this.validateConnection()) return this.notImplemented();
      return this.notImplemented();
    },

    remove: (id: string): Promise<boolean> => {
      if (!this.validateConnection()) return this.notImplemented();
      return Promise.resolve(false);
    },
  };

  // Export/Import - Stubs
  export = () => {
    if (!this.validateConnection()) return this.notImplemented();
    return Promise.resolve({
      ingresos: [] as Ingreso[],
      combustible: [] as Combustible[],
      mantenimiento: [] as Mantenimiento[],
      objetivos: [] as Objetivo[],
    });
  };

  import = (data: any) => {
    if (!this.validateConnection()) return this.notImplemented();
    return Promise.resolve({
      created: 0,
      updated: 0,
      errors: ["Supabase no configurado"],
    });
  };

  // Métodos específicos para Supabase
  async testConnection(): Promise<boolean> {
    if (!this.validateConnection()) return false;

    try {
      // TODO: Implementar test real con Supabase client
      // const { data, error } = await supabase.from('ingresos').select('count').limit(1);
      // return !error;
      return false;
    } catch (error) {
      return false;
    }
  }

  async syncFromLocal(
    localData: any
  ): Promise<{ success: boolean; message: string }> {
    if (!this.validateConnection()) {
      return { success: false, message: "Supabase no configurado" };
    }

    try {
      // TODO: Implementar migración real desde localStorage a Supabase
      return { success: false, message: "Función no implementada aún" };
    } catch (error) {
      return { success: false, message: `Error: ${error}` };
    }
  }
}

export default SupabaseEngine;
