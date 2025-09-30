// src/hooks/use-toast.ts
"use client";

import * as React from "react";
import { toast as sToast } from "sonner";

export type ToastActionElement = React.ReactElement;

export type ToastProps = {
  id?: string | number;
  title?: string;
  description?: string;
  action?: ToastActionElement;
  duration?: number;
};

export function useToast() {
  const toast = ({ title, description, action, duration }: ToastProps) =>
    sToast(title ?? "", { description, action, duration });

  // por si tu código llama dismiss()
  const dismiss = (id?: string | number) => sToast.dismiss(id);

  return { toast, dismiss };
}

// (opcional) si en algún lugar importás `toast` directo:
export const toast = (
  title: string,
  opts?: { description?: string; duration?: number }
) => sToast(title, opts);
