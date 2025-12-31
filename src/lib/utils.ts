import { clsx, type ClassValue } from "clsx";
import { UseFormSetError } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { EntityError, HttpError } from "./http";
import { toast } from "sonner";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const handleErrorApi = ({
  error,
  setError,
  duration,
}: {
  error: any;
  setError?: UseFormSetError<any>;
  duration?: number;
}) => {
  if (error instanceof EntityError && setError) {
    error.payload.details?.forEach((detail) => {
      if (detail.field) {
        setError(detail.field, {
          message: detail.message,
        });
      }
    });
  } else {
    const message = 
      error?.payload?.message || 
      error?.message || 
      "An unexpected error occurred";
    
    toast.error(message, {
      style: {
        "--normal-bg": "light-dark(var(--color-red-600), var(--color-red-400))",
        "--normal-text": "var(--color-white)",
        "--normal-border":
          "light-dark(var(--color-red-600), var(--color-red-400))",
      } as React.CSSProperties,
      duration: duration || 5000,
    });
  }
};
