"use server";

import { redirect } from "next/navigation";
import { checkCredentials, createSession, destroySession } from "@/lib/auth";

export interface FormState {
  error?: string;
  ok?: boolean;
}

export async function loginAction(_: FormState, fd: FormData): Promise<FormState> {
  const username = String(fd.get("username") ?? "");
  const password = String(fd.get("password") ?? "");
  // jeda kecil untuk memperlambat brute force
  await new Promise((r) => setTimeout(r, 600));
  const account=await checkCredentials(username,password);
  if (!account) {
    return { error: "Username atau password salah." };
  }
  await createSession(account);
  redirect(account.mustChangePassword ? "/dashboard/akun" : "/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
