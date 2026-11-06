"use client";

import { useActionState } from "react";
import { loginAction } from "@/actions/auth";
import { FormMessage, SubmitButton } from "@/components/ui";

export function LoginForm() {
  const [state, action] = useActionState(loginAction, {});
  return (
    <form action={action} className="space-y-5">
      <div>
        <label className="label" htmlFor="username">Username</label>
        <input id="username" name="username" autoComplete="username" required autoFocus className="input" />
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="input" />
      </div>
      <FormMessage state={state} />
      <SubmitButton className="btn-primary w-full" pendingText="Memeriksa...">Masuk</SubmitButton>
    </form>
  );
}
