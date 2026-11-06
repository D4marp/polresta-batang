"use client";

import { useEffect, useRef, useState } from "react";
import { Trash2 } from "lucide-react";

export function PageHeader({
  title,
  desc,
  action,
}: {
  title: string;
  desc?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">{title}</h1>
        {desc && <p className="mt-1 text-sm text-slate-500">{desc}</p>}
      </div>
      {action}
    </div>
  );
}

/** Input file dengan pratinjau gambar. */
export function FileField({
  name,
  label,
  current,
  accept = ".jpg,.jpeg,.png,.webp,.gif",
  multiple = false,
  removeName,
  hint,
  required = false,
}: {
  name: string;
  label: string;
  current?: string;
  accept?: string;
  multiple?: boolean;
  removeName?: string;
  hint?: string;
  required?: boolean;
}) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [selection, setSelection] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const isImage = accept.includes(".jpg") || accept.startsWith("image");
  useEffect(() => () => previews.forEach(URL.revokeObjectURL), [previews]);
  useEffect(() => {
    const form = inputRef.current?.form;
    const reset = () => { setPreviews([]); setSelection(""); inputRef.current?.setCustomValidity(""); };
    form?.addEventListener("reset", reset);
    return () => form?.removeEventListener("reset", reset);
  }, []);
  return (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      {current && isImage && previews.length === 0 && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={current} alt="" className="mb-3 h-32 rounded-xl object-cover ring-1 ring-slate-200" />
      )}
      {previews.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {previews.map((p) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={p} src={p} alt="" className="h-32 rounded-xl object-cover ring-1 ring-slate-200" />
          ))}
        </div>
      )}
      <input
        id={name}
        name={name}
        type="file"
        ref={inputRef}
        required={required}
        aria-describedby={hint ? `${name}-hint` : undefined}
        accept={accept}
        multiple={multiple}
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          const allowed = accept.split(",").map(v => v.trim().toLowerCase());
          const invalid = files.some(f => !allowed.includes(`.${f.name.split(".").pop()?.toLowerCase()}`));
          const total = files.reduce((sum, f) => sum + f.size, 0);
          const error = invalid ? "Format file tidak didukung. Pilih format sesuai keterangan." : files.some(f => !f.size) ? "File kosong tidak dapat diunggah." : total > 10 * 1024 * 1024 || files.length > 10 ? "Maksimal 10 file dengan total ukuran 10 MB." : "";
          e.target.setCustomValidity(error);
          if (error) e.target.reportValidity();
          setSelection(files.length ? `${files.length} file dipilih · ${(total / 1024 / 1024).toFixed(2)} MB` : "");
          setPreviews(!error && isImage ? files.map(f => URL.createObjectURL(f)) : []);
        }}
        className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-navy-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-navy-700 hover:file:bg-navy-100"
      />
      {selection && <p role="status" className="mt-2 text-xs font-medium text-navy-700">{selection}</p>}
      {hint && <p id={`${name}-hint`} className="mt-1.5 text-xs text-slate-500">{hint}</p>}
      {current && removeName && (
        <label className="mt-2 flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" name={removeName} /> Hapus file saat ini
        </label>
      )}
    </div>
  );
}

/** Tombol hapus dengan konfirmasi. */
export function DeleteButton({
  action,
  id,
  label = "Hapus",
  confirmText = "Yakin ingin menghapus? Tindakan ini tidak dapat dibatalkan.",
}: {
  action: (fd: FormData) => void | Promise<void>;
  id: string;
  label?: string;
  confirmText?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmText)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button aria-label={label || "Hapus foto"} className="btn-danger px-3 py-1.5">
        <Trash2 className="size-4" /> {label}
      </button>
    </form>
  );
}
