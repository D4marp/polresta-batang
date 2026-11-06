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
  if (!checkCredentials(username, password)) {
    return { error: "Username atau password salah." };
  }
  await createSession(username);
  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
