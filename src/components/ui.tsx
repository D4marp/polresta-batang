"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import type { FormState } from "@/actions/auth";

export function SubmitButton({
  children,
  className = "btn-primary",
  pendingText = "Menyimpan...",
}: {
  children: React.ReactNode;
  className?: string;
  pendingText?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending && <Loader2 className="size-4 animate-spin" />}
      {pending ? pendingText : children}
    </button>
  );
}

export function FormMessage({ state, success }: { state: FormState; success?: string }) {
  if (state.error)
    return (
      <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
        {state.error}
      </p>
    );
  if (state.ok && success)
    return (
      <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
        {success}
      </p>
    );
  return null;
}
