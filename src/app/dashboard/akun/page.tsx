import Link from "next/link";
import type{Metadata}from"next";
import {requireUser}from"@/lib/auth";
import {roleLabel}from"@/lib/account-types";
import {PageHeader}from"@/components/dashboard/parts";
import {MyAccountForms}from"@/components/dashboard/AccountForms";
export const metadata:Metadata={title:"Akun saya"};
export default async function MyAccount(){const user=await requireUser();return <><PageHeader title="Akun saya" desc={`@${user.username} · ${roleLabel(user.role)}`} />{user.mustChangePassword&&<div role="status" className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">Sebelum menggunakan panel redaksi, ganti password awal dengan password pribadi melalui formulir di bawah.</div>}<MyAccountForms name={user.displayName} mustChange={user.mustChangePassword} />{!user.mustChangePassword&&<Link href="/dashboard" className="btn-primary mt-6">Kembali ke meja redaksi</Link>}</>;}
