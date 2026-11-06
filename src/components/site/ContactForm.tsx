"use client";

import { useActionState } from "react";
import { sendMessageAction } from "@/actions/content";
import { FormMessage, SubmitButton } from "@/components/ui";

export function ContactForm() {
  const [state, action] = useActionState(sendMessageAction, {});
  return (
    <form action={action} className="card space-y-4 p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="name">Nama lengkap *</label>
          <input id="name" name="name" required maxLength={120} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="phone">No. telepon / WhatsApp</label>
          <input id="phone" name="phone" inputMode="tel" maxLength={40} className="input" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" maxLength={160} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="subject">Perihal</label>
          <input id="subject" name="subject" maxLength={160} className="input" />
        </div>
      </div>
      {/* honeypot */}
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div>
        <label className="label" htmlFor="message">Pesan / pengaduan *</label>
        <textarea id="message" name="message" required rows={6} maxLength={3000} className="input" />
      </div>
      <FormMessage state={state} success="Terima kasih, pesan Anda telah kami terima." />
      <SubmitButton pendingText="Mengirim...">Kirim Pesan</SubmitButton>
      <p className="text-xs text-slate-500">
        Untuk keadaan darurat, jangan gunakan formulir ini — segera hubungi 110.
      </p>
    </form>
  );
}
