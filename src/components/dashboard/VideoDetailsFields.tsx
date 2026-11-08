"use client";
import {useState,useEffect,useRef} from "react";
import {parseVideoUrl} from "@/lib/video";
import {VideoCard} from "@/components/site/VideoCard";
export function VideoDetailsFields({url="",description="",thumbnail=""}:{url?:string;description?:string;thumbnail?:string}){
 const inputRef=useRef<HTMLInputElement>(null);
 const [link,setLink]=useState(url);const [cover,setCover]=useState(thumbnail);const [narrative,setNarrative]=useState(description);
 useEffect(()=>{const form=inputRef.current?.form;const reset=()=>{setLink(url);setCover(thumbnail);setNarrative(description)};form?.addEventListener("reset",reset);return ()=>form?.removeEventListener("reset",reset)},[url,thumbnail,description]);
 return <>
 <div><label htmlFor="video-url" className="label">URL video *</label><input ref={inputRef} id="video-url" name="url" type="url" value={link} onChange={e=>setLink(e.target.value)} required maxLength={2048} placeholder="https://www.youtube.com/watch?v=..." aria-describedby="video-hint" className="input" /><p id="video-hint" className="mt-2 text-xs leading-5 text-slate-500">YouTube dan Vimeo dapat ditonton di sini. Tautan posting publik Instagram, TikTok, dan Facebook juga mendukung pemutar, sesuai izin platform. Untuk tautan pendek yang belum menampilkan pemutar, gunakan URL lengkap posting video.</p></div>
 <div><label htmlFor="video-description" className="label">Narasi / deskripsi video</label><textarea id="video-description" name="description" value={narrative} onChange={e=>setNarrative(e.target.value)} maxLength={5000} rows={5} className="input" placeholder="Ceritakan kegiatan, lokasi, dan informasi penting dalam video..." /><p className="mt-2 text-xs text-slate-500">Opsional, maksimal 5000 karakter. Tampil bersama video pada website.</p></div>
 <div><label htmlFor="video-thumbnail" className="label">URL thumbnail khusus (opsional)</label><input id="video-thumbnail" name="thumbnail" type="url" value={cover} onChange={e=>setCover(e.target.value)} maxLength={2048} className="input" placeholder="https://.../gambar.jpg" /><p className="mt-2 text-xs leading-5 text-slate-500">Kosongkan untuk menggunakan thumbnail otomatis YouTube. Untuk platform lain, tempel URL gambar publik HTTPS. Tidak perlu mengunggah file.</p></div>
 {parseVideoUrl(link)&&<div className="max-w-lg"><p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Pratinjau tampilan</p><VideoCard title="Pratinjau video" url={link} description={narrative} thumbnail={cover} /></div>}
 </>;
}
