import { useState } from "react";

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

export function useToast() {
  return {
    toast: (props: Omit<Toast, "id">) => {},
    toasts: [] as Toast[],
    dismiss: (id?: string) => {},
  };
}

export function toast(props: Omit<Toast, "id">) {}

export type { Toast };
