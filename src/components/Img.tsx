"use client";
/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
// Gambar upload dilayani dari /uploads (runtime), jadi memakai <img> biasa.
export function Img({
  src,
  alt,
  className,
  priority = false,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const [failedSrc, setFailedSrc] = useState<string>();
  if (!src || failedSrc === src) {
    return (
      <div
        aria-hidden
        className={`image-placeholder ${className ?? ""}`}
      ><span className="image-placeholder-label">POLRESTA BATANG<span>Informasi & pelayanan masyarakat</span></span></div>
    );
  }
  return <img src={src} alt={alt} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} decoding="async" onError={() => setFailedSrc(src)} className={className} />;
}
