"use client";
import {useActionState,useEffect,useRef,useState} from "react";
import {changePasswordAction,updateProfileAction,saveAccountAction,deleteAccountAction} from "@/actions/accounts";
import {FormMessage,SubmitButton} from "@/components/ui";
import {roleLabel,type Account} from "@/lib/account-types";

export function MyAccountForms({name,mustChange}:{name:string;mustChange:boolean}){
 const [profile,profileAction]=useActionState(updateProfileAction,{});
 const [password,passwordAction]=useActionState(changePasswordAction,{});
 const ref=useRef<HTMLFormElement>(null);
 useEffect(()=>{if(password.ok)ref.current?.reset()},[password]);
 return <div className="grid items-start gap-6 lg:grid-cols-2">
  <form action={profileAction} className="card space-y-4 p-6"><h2 className="text-lg font-bold text-navy-900">Nama penulis</h2><p className="text-sm leading-6 text-slate-500">Nama ini tampil pada berita yang diunggah melalui akun Anda.</p><div><label htmlFor="my-display-name" className="label">Nama tampilan *</label><input id="my-display-name" name="displayName" defaultValue={name} required maxLength={120} className="input" /></div><FormMessage state={profile} success="Nama penulis berhasil diperbarui." /><SubmitButton>Simpan nama</SubmitButton></form>
  <form ref={ref} action={passwordAction} className="card space-y-4 p-6"><h2 className="text-lg font-bold text-navy-900">{mustChange?"Atur password pribadi":"Ganti password"}</h2><p className="text-sm leading-6 text-slate-500">Gunakan 12–128 karakter. Mengganti password mengakhiri sesi lama pada perangkat lain.</p><div><label htmlFor="current-password" className="label">Password saat ini *</label><input id="current-password" name="currentPassword" type="password" autoComplete="current-password" required maxLength={128} className="input" /></div><div><label htmlFor="new-password" className="label">Password baru *</label><input id="new-password" name="newPassword" type="password" autoComplete="new-password" required minLength={12} maxLength={128} className="input" /></div><div><label htmlFor="confirm-password" className="label">Ulangi password baru *</label><input id="confirm-password" name="confirmPassword" type="password" autoComplete="new-password" required minLength={12} maxLength={128} className="input" /></div><FormMessage state={password} success="Password berhasil diganti. Akun sudah siap digunakan." /><SubmitButton>Simpan password baru</SubmitButton></form>
 </div>;
}

const empty={id:"",username:"",displayName:"",role:"contributor",active:true};
export function AccountsManager({accounts,currentId}:{accounts:Account[];currentId:string}){
 const [editing,setEditing]=useState(empty);
 const [state,action]=useActionState(saveAccountAction,{});
 const ref=useRef<HTMLFormElement>(null);
 useEffect(()=>{if(state.ok)ref.current?.reset()},[state]);
 return <div className="grid items-start gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
  <form ref={ref} action={action} className="card scroll-mt-24 space-y-4 p-5" id="user-form"><h2 className="text-lg font-bold text-navy-900">{editing.id?"Edit akun":"Tambah akun redaksi"}</h2><input type="hidden" name="id" value={editing.id} />
   <div><label htmlFor="user-username" className="label">Username *</label><input id="user-username" name="username" value={editing.username} onChange={e=>setEditing({...editing,username:e.target.value})} required minLength={3} maxLength={40} autoComplete="off" className="input" /></div>
   <div><label htmlFor="user-name" className="label">Nama penulis / narator *</label><input id="user-name" name="displayName" value={editing.displayName} onChange={e=>setEditing({...editing,displayName:e.target.value})} required maxLength={120} className="input" /></div>
   <div><label htmlFor="user-role" className="label">Peran *</label><select id="user-role" name="role" value={editing.role} onChange={e=>setEditing({...editing,role:e.target.value})} className="input"><option value="contributor">Kontributor / Operator</option><option value="admin">Administrator (akses penuh)</option></select><p className="mt-2 text-xs leading-5 text-slate-500">Kontributor hanya mengelola berita, foto, dan video miliknya. Administrator dapat mengelola seluruh konten, akun, pesan, menu, serta pengaturan.</p></div>
   <div><label htmlFor="user-password" className="label">{editing.id?"Reset password (opsional)":"Password awal *"}</label><input key={editing.id} id="user-password" name="password" type="password" autoComplete="new-password" required={!editing.id} minLength={12} maxLength={128} className="input" /><p className="mt-2 text-xs leading-5 text-slate-500">12–128 karakter. Password baru wajib diganti pemilik akun saat masuk. Kosongkan saat edit jika tidak mereset password.</p></div>
   <label className="flex items-center gap-2 text-sm text-slate-600"><input name="active" type="checkbox" checked={editing.active} onChange={e=>setEditing({...editing,active:e.target.checked})} /> Akun aktif</label>
   <FormMessage state={state} success="Akun berhasil disimpan. Bagikan password awal secara pribadi kepada pemilik akun." />
   <div className="flex flex-wrap gap-2"><SubmitButton>{editing.id?"Simpan akun":"Tambah akun"}</SubmitButton><button type="button" onClick={()=>setEditing({...empty})} className="btn-ghost">Akun baru</button></div>
  </form>
  <section className="card min-w-0 p-5"><h2 className="text-lg font-bold text-navy-900">Akun redaksi ({accounts.length})</h2><div className="mt-4 divide-y divide-slate-100">{accounts.map(account=><article key={account.id} className="py-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-bold text-navy-900">{account.displayName} {account.id===currentId&&<span className="text-xs font-normal text-slate-400">(Anda)</span>}</h3><p className="mt-1 text-xs text-slate-500">@{account.username} · {roleLabel(account.role)}</p><p className="mt-2 text-xs text-slate-500">{account.active?"Aktif":"Nonaktif"}{account.mustChangePassword?" · Wajib ganti password":""}</p></div><div className="flex items-start gap-2"><button type="button" onClick={()=>{setEditing({id:account.id,username:account.username,displayName:account.displayName,role:account.role,active:account.active});document.getElementById("user-form")?.scrollIntoView({behavior:"smooth",block:"start"})}} className="btn-ghost px-3 py-1.5" aria-label={"Edit akun "+account.username}>Edit</button>{account.id!==currentId&&<AccountDelete id={account.id} username={account.username} />}</div></div></article>)}</div></section>
 </div>;
}
function AccountDelete({id,username}:{id:string;username:string}){
 const [state,action]=useActionState(deleteAccountAction,{});
 return <form action={action} onSubmit={e=>{if(!confirm("Hapus akun "+username+"? Berita dan dokumentasi tetap tersimpan dengan nama penulisnya."))e.preventDefault()}}><input type="hidden" name="id" value={id} /><SubmitButton className="btn-danger px-3 py-1.5" pendingText="Menghapus...">Hapus</SubmitButton><FormMessage state={state} /></form>;
}
