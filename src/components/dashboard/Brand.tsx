import { Img } from "@/components/Img";

export function DashboardBrand({ name, compact = false }: { name: string; compact?: boolean }) {
  return <div className="flex min-w-0 items-center gap-3">
    <span className={`flex shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/5 shadow-inner ${compact ? "size-11 p-2" : "h-16 w-14 p-2.5"}`}>
      <Img src="/logo.png" alt="Lambang Polda Jawa Tengah" priority className="size-full object-contain" />
    </span>
    <div className="min-w-0"><p className={`${compact ? "text-sm" : "text-base"} font-extrabold leading-snug tracking-tight text-white`}>{name}</p><p className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-navy-200">Polda Jawa Tengah</p></div>
  </div>;
}
