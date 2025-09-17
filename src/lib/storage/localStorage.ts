import type {
  StorageEngine,
  Ingreso,
  Combustible,
  Mantenimiento,
  Objetivo,
} from "../../types";

// LocalStorage Engine - Implementación activa para v0.1
class LocalStorageEngine implements StorageEngine {
  private readonly VERSION = "v1";
  private readonly PREFIX = "kiguca";

  private getKey(entity: string): string {
    return `${this.PREFIX}_${this.VERSION}_${entity}`;
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getList<T>(entity: string): T[] {
    try {
      const data = localStorage.getItem(this.getKey(entity));
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error reading ${entity} from localStorage:`, error);
      return [];
    }
  }

  private setList<T>(entity: string, data: T[]): void {
    try {
      localStorage.setItem(this.getKey(entity), JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${entity} to localStorage:`, error);
      throw error;
    }
  }

  private addTimestamps<T>(
    data: T
  ): T & { created_at: string; updated_at: string } {
    const now = new Date().toISOString();
    return {
      ...data,
      created_at: now,
      updated_at: now,
    };
  }

  // Ingresos
  ingresos = {
    list: async (): Promise<Ingreso[]> => {
      return this.getList<Ingreso>("ingresos").sort(
        (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      );
    },

    get: async (id: string): Promise<Ingreso | null> => {
      const ingresos = this.getList<Ingreso>("ingresos");
      return ingresos.find((item) => item.id === id) || null;
    },

    create: async (
      data: Omit<Ingreso, "id" | "created_at" | "updated_at">
    ): Promise<Ingreso> => {
      const ingresos = this.getList<Ingreso>("ingresos");
      const newIngreso: Ingreso = {
        ...this.addTimestamps(data),
        id: this.generateId(),
        // Calcular neto
        neto:
          data.bruto +
          data.promos +
          data.propinas -
          (data.peajes + data.otros_costos),
      };

      ingresos.push(newIngreso);
      this.setList("ingresos", ingresos);
      return newIngreso;
    },

    update: async (id: string, data: Partial<Ingreso>): Promise<Ingreso> => {
      const ingresos = this.getList<Ingreso>("ingresos");
      const index = ingresos.findIndex((item) => item.id === id);

      if (index === -1) {
        throw new Error(`Ingreso ${id} no encontrado`);
      }

      const updated = {
        ...ingresos[index],
        ...data,
        updated_at: new Date().toISOString(),
      };

      // Recalcular neto si cambió algún campo relevante
      if (
        "bruto" in data ||
        "promos" in data ||
        "propinas" in data ||
        "peajes" in data ||
        "otros_costos" in data
      ) {
        updated.neto =
          updated.bruto +
          updated.promos +
          updated.propinas -
          (updated.peajes + updated.otros_costos);
      }

      ingresos[index] = updated;
      this.setList("ingresos", ingresos);
      return updated;
    },

    remove: async (id: string): Promise<boolean> => {
      const ingresos = this.getList<Ingreso>("ingresos");
      const filtered = ingresos.filter((item) => item.id !== id);

      if (filtered.length === ingresos.length) {
        return false; // No se encontró el elemento
      }

      this.setList("ingresos", filtered);
      return true;
    },
  };

  // Combustible
  combustible = {
    list: async (): Promise<Combustible[]> => {
      return this.getList<Combustible>("combustible").sort(
        (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      );
    },

    get: async (id: string): Promise<Combustible | null> => {
      const combustible = this.getList<Combustible>("combustible");
      return combustible.find((item) => item.id === id) || null;
    },

    create: async (
      data: Omit<Combustible, "id" | "created_at" | "updated_at">
    ): Promise<Combustible> => {
      const combustible = this.getList<Combustible>("combustible");
      const newCombustible: Combustible = {
        ...this.addTimestamps(data),
        id: this.generateId(),
      };

      combustible.push(newCombustible);
      this.setList("combustible", combustible);
      return newCombustible;
    },

    update: async (
      id: string,
      data: Partial<Combustible>
    ): Promise<Combustible> => {
      const combustible = this.getList<Combustible>("combustible");
      const index = combustible.findIndex((item) => item.id === id);

      if (index === -1) {
        throw new Error(`Combustible ${id} no encontrado`);
      }

      const updated = {
        ...combustible[index],
        ...data,
        updated_at: new Date().toISOString(),
      };

      combustible[index] = updated;
      this.setList("combustible", combustible);
      return updated;
    },

    remove: async (id: string): Promise<boolean> => {
      const combustible = this.getList<Combustible>("combustible");
      const filtered = combustible.filter((item) => item.id !== id);

      if (filtered.length === combustible.length) {
        return false;
      }

      this.setList("combustible", filtered);
      return true;
    },
  };

  // Mantenimiento
  mantenimiento = {
    list: async (): Promise<Mantenimiento[]> => {
      return this.getList<Mantenimiento>("mantenimiento").sort(
        (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      );
    },

    get: async (id: string): Promise<Mantenimiento | null> => {
      const mantenimiento = this.getList<Mantenimiento>("mantenimiento");
      return mantenimiento.find((item) => item.id === id) || null;
    },

    create: async (
      data: Omit<Mantenimiento, "id" | "created_at" | "updated_at">
    ): Promise<Mantenimiento> => {
      const mantenimiento = this.getList<Mantenimiento>("mantenimiento");
      const newMantenimiento: Mantenimiento = {
        ...this.addTimestamps(data),
        id: this.generateId(),
      };

      mantenimiento.push(newMantenimiento);
      this.setList("mantenimiento", mantenimiento);
      return newMantenimiento;
    },

    update: async (
      id: string,
      data: Partial<Mantenimiento>
    ): Promise<Mantenimiento> => {
      const mantenimiento = this.getList<Mantenimiento>("mantenimiento");
      const index = mantenimiento.findIndex((item) => item.id === id);

      if (index === -1) {
        throw new Error(`Mantenimiento ${id} no encontrado`);
      }

      const updated = {
        ...mantenimiento[index],
        ...data,
        updated_at: new Date().toISOString(),
      };

      mantenimiento[index] = updated;
      this.setList("mantenimiento", mantenimiento);
      return updated;
    },

    remove: async (id: string): Promise<boolean> => {
      const mantenimiento = this.getList<Mantenimiento>("mantenimiento");
      const filtered = mantenimiento.filter((item) => item.id !== id);

      if (filtered.length === mantenimiento.length) {
        return false;
      }

      this.setList("mantenimiento", filtered);
      return true;
    },
  };

  // Objetivos
  objetivos = {
    list: async (): Promise<Objetivo[]> => {
      return this.getList<Objetivo>("objetivos").sort(
        (a, b) =>
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime()
      );
    },

    get: async (id: string): Promise<Objetivo | null> => {
      const objetivos = this.getList<Objetivo>("objetivos");
      return objetivos.find((item) => item.id === id) || null;
    },

    create: async (
      data: Omit<Objetivo, "id" | "created_at" | "updated_at">
    ): Promise<Objetivo> => {
      const objetivos = this.getList<Objetivo>("objetivos");
      const newObjetivo: Objetivo = {
        ...this.addTimestamps(data),
        id: this.generateId(),
      };

      objetivos.push(newObjetivo);
      this.setList("objetivos", objetivos);
      return newObjetivo;
    },

    update: async (id: string, data: Partial<Objetivo>): Promise<Objetivo> => {
      const objetivos = this.getList<Objetivo>("objetivos");
      const index = objetivos.findIndex((item) => item.id === id);

      if (index === -1) {
        throw new Error(`Objetivo ${id} no encontrado`);
      }

      const updated = {
        ...objetivos[index],
        ...data,
        updated_at: new Date().toISOString(),
      };

      objetivos[index] = updated;
      this.setList("objetivos", objetivos);
      return updated;
    },

    remove: async (id: string): Promise<boolean> => {
      const objetivos = this.getList<Objetivo>("objetivos");
      const filtered = objetivos.filter((item) => item.id !== id);

      if (filtered.length === objetivos.length) {
        return false;
      }

      this.setList("objetivos", filtered);
      return true;
    },
  };

  // Export/Import
  export = async () => {
    return {
      ingresos: await this.ingresos.list(),
      combustible: await this.combustible.list(),
      mantenimiento: await this.mantenimiento.list(),
      objetivos: await this.objetivos.list(),
    };
  };

  import = async (data: any) => {
    let created = 0;
    let updated = 0;
    const errors: string[] = [];

    try {
      // Importar cada entidad
      for (const [entity, items] of Object.entries(data)) {
        if (!Array.isArray(items)) continue;

        for (const item of items as any[]) {
          try {
            if (item.id) {
              // Intentar actualizar primero
              const existing = await (this as any)[entity].get(item.id);
              if (existing) {
                await (this as any)[entity].update(item.id, item);
                updated++;
              } else {
                // Si no existe, crear con el ID existente
                const { id, created_at, updated_at, ...createData } = item;
                await (this as any)[entity].create(createData);
                created++;
              }
            } else {
              // Crear nuevo
              const { id, created_at, updated_at, ...createData } = item;
              await (this as any)[entity].create(createData);
              created++;
            }
          } catch (error) {
            errors.push(`Error en ${entity}: ${error}`);
          }
        }
      }
    } catch (error) {
      errors.push(`Error general: ${error}`);
    }

    return { created, updated, errors };
  };
}

export default LocalStorageEngine;
