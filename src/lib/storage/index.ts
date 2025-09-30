// src/lib/storage/index.ts
import type { StorageEngine } from "@/types";
import SupabaseEngine from "./supabase";

/** Siempre Supabase */
export function getStorage(): StorageEngine {
  return new SupabaseEngine();
}

/** Para mostrar en UI si hace falta */
export function getCurrentStorageType(): "supabase" {
  return "supabase";
}
