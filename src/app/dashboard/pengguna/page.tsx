import type{Metadata}from"next";
import {requireAdmin}from"@/lib/auth";
import {listAccounts}from"@/lib/accounts";
import {PageHeader}from"@/components/dashboard/parts";
import {AccountsManager}from"@/components/dashboard/AccountForms";
export const metadata:Metadata={title:"Akun redaksi"};
export default async function UsersPage(){const user=await requireAdmin();return <><PageHeader title="Akun redaksi" desc="Tambah administrator dan kontributor/operator, atur nama penulis, peran, serta password." /><AccountsManager currentId={user.id} accounts={await listAccounts()} /></>;}
