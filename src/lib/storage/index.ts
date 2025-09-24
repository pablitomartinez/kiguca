// src/lib/storage/index.ts
import type { StorageEngine, StorageEngineType } from "@/types";
import LocalStorageEngine from "./localStorage";
import SupabaseEngine from "./supabase";

function createStorageEngine(): StorageEngine {
  const type =
    (process.env.NEXT_PUBLIC_STORAGE_ENGINE as StorageEngineType) || "local";
  return type === "supabase" ? new SupabaseEngine() : new LocalStorageEngine();
}

export const storage = createStorageEngine();

export function getStorage() {
  return storage;
}

export function getCurrentStorageType(): StorageEngineType {
  return (
    (process.env.NEXT_PUBLIC_STORAGE_ENGINE as StorageEngineType) || "local"
  );
}
