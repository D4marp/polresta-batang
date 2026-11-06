import "server-only";
import type { ConnectionPool } from "mssql";

// Dua format DATABASE_URL didukung:
// 1) Windows Auth (lokal, tanpa TCP/login SQL), format ODBC:
//    Driver={ODBC Driver 18 for SQL Server};Server=localhost;Database=polresta_batang;Trusted_Connection=yes;TrustServerCertificate=yes
// 2) SQL login via TCP (server/produksi):
//    Server=host,1433;Database=polresta_batang;User Id=app;Password=***;Encrypt=true;TrustServerCertificate=true
const g = globalThis as unknown as { __pool?: Promise<ConnectionPool> };

async function connect(): Promise<ConnectionPool> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL belum diatur.");
  if (/^\s*driver=/i.test(url)) {
    const sql = (await import("mssql/msnodesqlv8")).default;
    return new sql.ConnectionPool({ connectionString: url } as never).connect();
  }
  const sql = (await import("mssql")).default;
  return new sql.ConnectionPool(url).connect();
}

function getPool() {
  if (!g.__pool) {
    g.__pool = connect().catch((e) => {
      g.__pool = undefined; // izinkan retry
      throw e;
    });
  }
  return g.__pool;
}

export type Param = string | number | boolean | Date | null;

/** Menjalankan query berparameter. Gunakan @v0, @v1, ... di SQL. */
export async function query<T = Record<string, unknown>>(
  text: string,
  params: Param[] = [],
): Promise<T[]> {
  const req = (await getPool()).request();
  params.forEach((v, i) => req.input(`v${i}`, v));
  const res = await req.query(text);
  return (res.recordset ?? []) as T[];
}
