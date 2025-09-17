import type { StorageEngine, StorageEngineType } from "../../types";
import LocalStorageEngine from "./localStorage";
import SupabaseEngine from "./supabase";

let _storage: StorageEngine | null = null;

function createStorageEngine(): StorageEngine {
  const engineType =
    (process.env.NEXT_PUBLIC_STORAGE_ENGINE as StorageEngineType) || "local";

  if (engineType === "supabase") {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key) return new SupabaseEngine(url, key);
    if (typeof window !== "undefined") {
      console.warn(
        "Faltan NEXT_PUBLIC_SUPABASE_URL/ANON_KEY. Fallback a local."
      );
    }
  }

  // Si estoy en server, todavía no hay window/localStorage.
  // No instancio nada hasta que estemos en cliente.
  if (typeof window === "undefined") {
    // Devuelvo un “proxy” que falla si alguien lo usa en server.
    return {
      list: () => {
        throw new Error("Storage sólo disponible en cliente");
      },
      get: () => {
        throw new Error("Storage sólo disponible en cliente");
      },
      create: () => {
        throw new Error("Storage sólo disponible en cliente");
      },
      update: () => {
        throw new Error("Storage sólo disponible en cliente");
      },
      remove: () => {
        throw new Error("Storage sólo disponible en cliente");
      },
      export: () => {
        throw new Error("Storage sólo disponible en cliente");
      },
      import: () => {
        throw new Error("Storage sólo disponible en cliente");
      },
    } as unknown as StorageEngine;
  }

  return new LocalStorageEngine();
}

export function getStorage(): StorageEngine {
  if (!_storage) _storage = createStorageEngine();
  return _storage;
}

// Helpers
export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function getCurrentStorageType(): StorageEngineType {
  const type =
    (process.env.NEXT_PUBLIC_STORAGE_ENGINE as StorageEngineType) || "local";
  return type === "supabase" && !isSupabaseConfigured() ? "local" : type;
}
