import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
// Client publik SSR. Bukan client berhak admin; RLS tetap berlaku.
export async function createClient() {
  const jar = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll(values) {
        try { values.forEach(({ name, value, options }) => jar.set(name, value, options)); }
        catch { /* Server Components tidak menulis cookie; gunakan Server Action/Route Handler. */ }
      },
    },
  });
}
