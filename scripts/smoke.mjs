import { createHmac } from 'node:crypto';
const base='http://localhost:3000';
const routes=['/','/profil','/layanan','/berita','/galeri','/unduhan','/pengaduan','/login','/robots.txt','/sitemap.xml','/layanan/skck','/layanan/sim','/layanan/stnk-bpkb','/layanan/spkt','/berita/polresta-batang-gelar-apel-pagi-kesiapan-operasi'];
let fail=0;
for(const route of routes){const r=await fetch(base+route);const t=await r.text();const ok=r.status===200&&!t.includes('NEXT_HTTP_ERROR_FALLBACK;500')&&!t.includes('Internal Server Error');if(!ok)fail++;console.log(`${ok?'PASS':'FAIL'} ${route} (${r.status})`);}
for(const route of ['/dashboard','/dashboard/berita','/dashboard/berita/baru','/dashboard/berita/invalid','/dashboard/galeri','/dashboard/dokumen','/dashboard/pesan','/dashboard/pengaturan']){const r=await fetch(base+route,{redirect:'manual'});const body=await r.text();const ok=([303,307].includes(r.status)&&r.headers.get('location')?.includes('/login') || body.includes('NEXT_REDIRECT;replace;/login;307;')) && !body.includes('Kesiapan Konten Publikasi') && !body.includes('Simpan Pengaturan');if(!ok)fail++;console.log(`${ok?'PASS':'FAIL'} protected ${route}`);}
const payload=Buffer.from(JSON.stringify({u:process.env.ADMIN_USERNAME,exp:Date.now()+60000})).toString('base64url');
const signature=createHmac('sha256',process.env.AUTH_SECRET).update(payload).digest('base64url');
for(const route of ['/dashboard','/dashboard/berita','/dashboard/berita/baru','/dashboard/galeri','/dashboard/dokumen','/dashboard/pesan','/dashboard/pengaturan']){const r=await fetch(base+route,{headers:{cookie:`pb_session=${payload}.${signature}`},redirect:'manual'});const t=await r.text();const ok=r.status===200&&!t.includes('Internal Server Error');if(!ok)fail++;console.log(`${ok?'PASS':'FAIL'} admin ${route} (${r.status})`);}
for(const route of ['/layanan/tidak-ada','/berita/tidak-ada','/uploads/invalid.exe']){const r=await fetch(base+route);const body=await r.text();const ok=r.status===404 || (body.includes('NEXT_HTTP_ERROR_FALLBACK;404') && body.includes('noindex'));if(!ok)fail++;console.log(`${ok?'PASS':'FAIL'} 404 ${route}`);}
for(const route of ['/logo.png','/images/pelayanan-batang.jpg']){const r=await fetch(base+route);const ok=r.ok&&r.headers.get('content-type')?.startsWith('image/');if(!ok)fail++;console.log(`${ok?'PASS':'FAIL'} image ${route}`);}
process.exitCode=fail?1:0;
