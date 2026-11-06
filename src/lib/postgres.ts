import "server-only";
import { Pool } from "pg";
import { readFileSync } from "node:fs";
import path from "node:path";

const state = globalThis as unknown as { __postgresPool?: Pool };
export type Param = string | number | boolean | Date | null;
function getPool() {
  if (!state.__postgresPool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString?.startsWith("postgres")) throw new Error("DATABASE_URL Supabase PostgreSQL belum diatur.");
    state.__postgresPool = new Pool({ connectionString, max: 3, connectionTimeoutMillis: 10000, idleTimeoutMillis: 30000, ssl: { rejectUnauthorized: true, ca: readFileSync(path.join(process.cwd(), "certificates/supabase-ca.crt"), "utf8") } });
    state.__postgresPool.on("error", () => { console.error("Koneksi PostgreSQL terputus; koneksi berikutnya akan dicoba kembali."); });
  }
  return state.__postgresPool;
}
export async function query<T = Record<string, unknown>>(text: string, params: Param[] = []): Promise<T[]> {
  // Parameter lama tetap terikat; tidak pernah diinterpolasikan menjadi SQL.
  const statement = text.replace(/@v(\d+)/g, (_, index: string) => `$${Number(index) + 1}`);
  return (await getPool().query(statement, params)).rows as T[];
}
