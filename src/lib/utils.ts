import { clsx, type ClassValue } from "clsx";
import { UseFormSetError } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { EntityError } from "./http";
import { toast } from "sonner";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type ErrorDetail = { field: string; message: string };

function getDetails(error: any): ErrorDetail[] | undefined {
  // 1) Error được wrap bởi EntityError (custom FE error), ưu tiên lấy details từ payload
  if (error instanceof EntityError) {
    const detail = error.payload.data.details;
    if (Array.isArray(detail)) {
      return detail as ErrorDetail[];
    }
  }
  // 2) Error trả về trực tiếp từ API (chưa wrap), kiểm tra payload.data.details
  const candidates = [error.payload.data.details];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate as ErrorDetail[];
    }
  }

  return undefined;
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
  const details = getDetails(error);

  if (setError && Array.isArray(details) && details.length > 0) {
    details.forEach((detail: any) => {
      if (detail?.field) {
        setError(detail.field, { message: detail.message });
      }
    });
    return;
  }

  const message =
    error?.message ||
    error?.payload?.message ||
    error?.data?.message ||
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
};
