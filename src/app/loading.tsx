export default function Loading() {
  return <div className="container-x py-16" role="status" aria-label="Memuat halaman"><div className="max-w-3xl space-y-5 motion-safe:animate-pulse"><div className="h-4 w-32 rounded bg-slate-200" /><div className="h-10 w-3/4 rounded-lg bg-slate-200" /><div className="h-5 w-full rounded bg-slate-200" /><div className="h-64 rounded-2xl bg-slate-200" /></div><span className="sr-only">Sedang memuat informasi…</span></div>;
}
