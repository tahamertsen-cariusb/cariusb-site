"use client";
import { Toast } from "@/components/Toast";

/**
 * Toaster - Toast container component
 * Renders toast notifications
 */
export function Toaster({
  toast,
  onClose,
}: {
  toast: { message: string; type: "success" | "error" } | null;
  onClose: () => void;
}) {
  if (!toast) return null;

  return (
    <Toast
      message={toast.message}
      type={toast.type}
      onClose={onClose}
    />
  );
}


