import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "pb_session";
const MAX_AGE = 60 * 60 * 8; // 8 jam

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) throw new Error("AUTH_SECRET belum diatur (min. 16 karakter).");
  return s;
}

const sign = (payload: string) =>
  createHmac("sha256", secret()).update(payload).digest("base64url");

function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function checkCredentials(username: string, password: string) {
  const u = process.env.ADMIN_USERNAME ?? "";
  const p = process.env.ADMIN_PASSWORD ?? "";
  if (!u || !p) return false;
  // evaluasi keduanya agar waktu respons konstan
  const okU = safeEqual(username, u);
  const okP = safeEqual(password, p);
  return okU && okP;
}

export async function createSession(username: string) {
  const payload = Buffer.from(
    JSON.stringify({ u: username, exp: Date.now() + MAX_AGE * 1000 }),
  ).toString("base64url");
  const jar = await cookies();
  jar.set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function getSession(): Promise<{ username: string } | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig || !safeEqual(sig, sign(payload))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof data.exp !== "number" || data.exp < Date.now()) return null;
    return { username: String(data.u) };
  } catch {
    return null;
  }
}

/** Gunakan di halaman & server action dashboard. */
export async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}
