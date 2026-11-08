"use client";
import { useActionState, useState } from "react";
import { ArrowDown, ArrowUp, CornerDownRight, Pencil, Plus } from "lucide-react";
import { saveMenuAction, deleteMenuAction, moveMenuAction } from "@/actions/navigation";
import { menuTree, validParent, type MenuItem, type MenuNode } from "@/lib/navigation";
import { NEWS_CATEGORIES } from "@/lib/types";
import { FormMessage, SubmitButton } from "@/components/ui";
import { DeleteButton } from "./parts";

const blank={id:"",label:"",href:"/berita",parentId:"",position:10,enabled:true};
const pages=[{label:"Semua berita",href:"/berita"},{label:"Profil & Kapolresta",href:"/profil"},{label:"Galeri foto",href:"/galeri#foto"},{label:"Galeri video",href:"/galeri#video"},{label:"Layanan publik",href:"/layanan"},{label:"Unduhan",href:"/unduhan"},{label:"Kontak & pengaduan",href:"/pengaduan"},...NEWS_CATEGORIES.map(label=>({label:"Kategori: "+label,href:"/berita?kategori="+encodeURIComponent(label)}))];
export function MenuEditor({items}:{items:MenuItem[]}){
 const [form,setForm]=useState(blank);
 const [state,action]=useActionState(saveMenuAction,{});
 const update=(patch:Partial<typeof blank>)=>setForm(current=>({...current,...patch}));
 const edit=(item:MenuItem)=>{setForm({...item,parentId:item.parentId??""});document.getElementById("menu-editor-form")?.scrollIntoView({behavior:"smooth",block:"start"});};
 const addChild=(item:MenuItem)=>{setForm({...blank,href:"#",parentId:item.id,position:Math.min(9999,Math.max(0,...items.filter(i=>i.parentId===item.id).map(i=>i.position))+10)});document.getElementById("menu-editor-form")?.scrollIntoView({behavior:"smooth",block:"start"});};
 const render=(nodes:MenuNode[],depth=0):React.ReactNode=>nodes.map(item=><div key={item.id}>
  <div className={"flex flex-wrap items-center gap-2 border-b border-slate-100 py-3 "+(!item.enabled?"opacity-60":"")} style={{paddingLeft:Math.min(depth,6)*16}}>
   {depth>0&&<CornerDownRight className="size-4 shrink-0 text-slate-400" />}
   <div className="min-w-0 flex-1"><p className="text-sm font-bold text-navy-900">{item.label}{!item.enabled&&<span className="ml-2 text-[10px] font-normal text-slate-400">Disembunyikan</span>}</p><p className="mt-1 break-all text-[10px] text-slate-500">{item.href}</p></div>
   <div className="flex flex-wrap items-center gap-1">
    {[-1,1].map(direction=><form key={direction} action={moveMenuAction}><input type="hidden" name="id" value={item.id} /><input type="hidden" name="direction" value={direction<0?"up":"down"} /><button className="grid size-8 place-items-center rounded border border-slate-200 text-slate-500 hover:bg-slate-50" aria-label={(direction<0?"Naikkan ":"Turunkan ")+item.label}>{direction<0?<ArrowUp className="size-3.5" />:<ArrowDown className="size-3.5" />}</button></form>)}
    <button type="button" onClick={()=>edit(item)} aria-label={"Edit menu "+item.label} className="btn-ghost px-2 py-2 text-xs"><Pencil className="size-3.5" />Edit</button>
    <button type="button" onClick={()=>addChild(item)} aria-label={"Tambah submenu "+item.label} className="btn-ghost px-2 py-2 text-xs"><Plus className="size-3.5" />Submenu</button>
    <DeleteButton action={deleteMenuAction} id={item.id} label="Hapus" confirmText="Hapus menu ini? Submenu langsung di bawahnya akan dipindahkan ke menu utama. Halaman dan berita tidak ikut dihapus." />
   </div>
  </div>{render(item.children,depth+1)}
 </div>);
 return <div className="grid items-start gap-6 xl:grid-cols-[minmax(300px,380px)_minmax(0,1fr)]">
  <form id="menu-editor-form" action={action} className="card scroll-mt-24 space-y-4 p-5">
   <h2 className="text-lg font-bold text-navy-900">{form.id?"Edit menu":"Tambah menu"}</h2>
   <input type="hidden" name="id" value={form.id} />
   <div><label htmlFor="menu-label" className="label">Nama menu *</label><input id="menu-label" name="label" value={form.label} onChange={e=>update({label:e.target.value})} required maxLength={80} className="input" /></div>
   <div><label htmlFor="menu-page" className="label">Pilih tujuan</label><select id="menu-page" value={pages.some(p=>p.href===form.href)?form.href:"custom"} onChange={e=>update({href:e.target.value==="custom"?"#":e.target.value})} className="input">{pages.map(p=><option value={p.href} key={p.href}>{p.label}</option>)}<option value="custom">Tautan khusus / induk menu</option></select></div>
   <div><label htmlFor="menu-href" className="label">Alamat tujuan *</label><input id="menu-href" name="href" value={form.href} onChange={e=>update({href:e.target.value})} required maxLength={2048} className="input" /><p className="mt-2 text-xs leading-5 text-slate-500">Gunakan /profil, tautan berita, URL HTTPS, atau # untuk induk tanpa halaman.</p></div>
   <div><label htmlFor="menu-parent" className="label">Menu induk</label><select id="menu-parent" name="parentId" value={form.parentId} onChange={e=>update({parentId:e.target.value})} className="input"><option value="">Tanpa induk (menu utama)</option>{items.filter(item=>validParent(items,form.id,item.id)).map(item=><option key={item.id} value={item.id}>{item.label}</option>)}</select></div>
   <div><label htmlFor="menu-position" className="label">Urutan</label><input id="menu-position" name="position" type="number" min={0} max={9999} value={form.position} onChange={e=>update({position:Number(e.target.value)})} className="input" /><p className="mt-1 text-xs text-slate-500">Angka kecil tampil lebih dulu. Bisa juga memakai tombol panah.</p></div>
   <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" name="enabled" checked={form.enabled} onChange={e=>update({enabled:e.target.checked})} /> Tampilkan menu beserta submenunya</label>
   <FormMessage state={state} success="Menu berhasil disimpan. Navigasi website sudah diperbarui." />
   <div className="flex flex-wrap gap-2"><SubmitButton>{form.id?"Simpan perubahan":"Tambah menu"}</SubmitButton><button type="button" onClick={()=>setForm({...blank})} className="btn-ghost">{form.id?"Menu baru":"Kosongkan"}</button></div>
  </form>
  <section className="card min-w-0 p-5"><h2 className="text-lg font-bold text-navy-900">Struktur menu website</h2><p className="mb-4 mt-2 text-xs leading-6 text-slate-500">Susun menu utama dan submenu bertingkat. Menghapus menu tidak menghapus konten halamannya. Menu yang disembunyikan beserta turunannya tidak tampil di website.</p>{render(menuTree(items))}{!items.length&&<p className="py-8 text-sm text-slate-500">Belum ada menu. Tambahkan menu pertama melalui formulir.</p>}</section>
 </div>;
}
