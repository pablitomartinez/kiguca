// src/components/ui/toast.tsx
"use client";

import * as React from "react";
import { Toaster as SonnerToaster } from "sonner";

export type ToastActionElement = React.ReactElement;

export type ToastProps = {
  id?: string | number;
  title?: string;
  description?: string;
  action?: ToastActionElement;
  duration?: number;
};

// Un simple "proxy" del Toaster de Sonner
export function Toaster() {
  return <SonnerToaster richColors closeButton />;
}
