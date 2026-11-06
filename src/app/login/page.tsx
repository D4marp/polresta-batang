import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Shield } from "lucide-react";
import { LoginForm } from "@/components/dashboard/LoginForm";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Masuk Admin", robots: { index: false } };

export default async function LoginPage() {
  if (await getSession()) redirect("/dashboard");
  return (
    <div className="grid min-h-screen place-items-center bg-navy-950 bg-[radial-gradient(60%_60%_at_80%_0%,rgba(212,167,44,0.25),transparent_60%)] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center text-white">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-gold-500 text-navy-950">
            <Shield className="size-7" />
          </span>
          <h1 className="mt-4 text-2xl font-extrabold">Dashboard Admin</h1>
          <p className="text-sm text-navy-200">Polresta Batang</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
