export const DATA_UPDATED_EVENT = "kiguca:data-updated";

export function emitDataUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(DATA_UPDATED_EVENT));
  }
}

export function onDataUpdated(fn: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => fn();
  window.addEventListener(DATA_UPDATED_EVENT, handler);
  return () => window.removeEventListener(DATA_UPDATED_EVENT, handler);
}
