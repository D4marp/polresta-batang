"use client";
import { useActionState, useEffect, useRef } from "react";
import { addVideoAction } from "@/actions/content";
import { VideoDetailsFields } from "./VideoDetailsFields";
import { FormMessage, SubmitButton } from "@/components/ui";
export function VideoForm() {
 const [state,action]=useActionState(addVideoAction,{});
 const ref=useRef<HTMLFormElement>(null);
 useEffect(()=>{if(state.ok)ref.current?.reset()},[state]);
 return <form ref={ref} action={action} className="card mb-8 space-y-4 p-6">
 <h2 className="font-bold text-navy-900">Tambah video melalui URL</h2>
 <p className="text-sm leading-6 text-slate-500">Tempel tautan video publik. Tambahkan judul, narasi, dan thumbnail, tanpa mengunggah file video.</p>
 <div><label htmlFor="video-title" className="label">Judul video *</label><input id="video-title" name="title" required maxLength={300} className="input" /></div>
 <VideoDetailsFields />
 <FormMessage state={state} success="Video berhasil ditambahkan ke galeri." /><SubmitButton pendingText="Menyimpan...">Tambah video</SubmitButton>
 </form>;
}
