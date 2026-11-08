import assert from 'node:assert/strict';
import { createHmac,randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { Pool } from 'pg';
import { menuTree,validParent,validMenuHref } from '../src/lib/navigation.ts';
const base=process.env.TEST_BASE_URL||'http://localhost:3006';
const marker='MENU-TEST-'+randomUUID();
const p=Buffer.from(JSON.stringify({u:process.env.ADMIN_USERNAME,exp:Date.now()+3600000})).toString('base64url');
const cookie=`pb_session=${p}.${createHmac('sha256',process.env.AUTH_SECRET).update(p).digest('base64url')}`;
const url=new URL(process.env.DATABASE_URL);for(const key of ['sslmode','sslrootcert','sslcert','sslkey'])url.searchParams.delete(key);
const pool=new Pool({connectionString:url.toString(),ssl:{rejectUnauthorized:true,ca:await readFile('certificates/supabase-ca.crt','utf8')},max:1});
const decode=s=>s.replace(/&quot;/g,'"').replace(/&#x27;/g,"'").replace(/&amp;/g,'&');
async function submit(field,values,auth=true){
 const html=await(await fetch(base+'/dashboard/menu',{headers:{cookie}})).text();
 const forms=[...html.matchAll(/<form\b[^>]*>[\s\S]*?<\/form>/g)].map(m=>m[0]);
 const form=field==='delete'?forms.find(f=>f.includes('name="id"')&&!f.includes('name="label"')&&!f.includes('name="direction"')):forms.find(f=>f.includes(`name="${field}"`));assert.ok(form,'action form exists');
 const fd=new FormData();for(const match of form.matchAll(/<input\b[^>]*>/g)){const name=match[0].match(/name="([^"]+)"/);if(name&&decode(name[1]).startsWith('$ACTION_'))fd.append(decode(name[1]),decode(match[0].match(/value="([^"]*)"/)?.[1]??''));}
 for(const [k,v]of Object.entries(values))fd.set(k,String(v));
 const r=await fetch(base+'/dashboard/menu',{method:'POST',headers:{origin:base,...(auth?{cookie}:{})},body:fd,redirect:'manual'});
 assert.ok(r.status<500,'menu action succeeded');return await r.text()+(r.headers.get('location')??'');
}
async function get(label){return(await pool.query('SELECT * FROM navigation WHERE label=$1',[label])).rows[0];}
const values=(name,parentId='',position=10)=>({label:marker+name,href:'/berita',parentId,position,enabled:'on'});
try{
 for(const url of ['javascript:alert(1)','//evil.test','/\\evil.test','http://example.com'])assert.equal(validMenuHref(url),false);
 for(const url of ['/berita?kategori=Kriminal','https://example.com/path','#'])assert.ok(validMenuHref(url));
 const nodes=[{id:'a',parentId:null,label:'a',position:0},{id:'b',parentId:'a',label:'b',position:0},{id:'c',parentId:'b',label:'c',position:0}];
 assert.equal(validParent(nodes,'a','c'),false);assert.equal(menuTree(nodes)[0].children[0].children[0].id,'c');console.log('PASS URL validation and recursive tree');
 let result=await submit('label',values('-root'),false);assert.match(result,/login/);assert.equal(await get(marker+'-root'),undefined);console.log('PASS unauthenticated menu creation rejected');
 for(const href of ['javascript:alert(1)','//evil.test']){result=await submit('label',{...values('-bad'),href});assert.match(result,/Gunakan alamat/);assert.equal(await get(marker+'-bad'),undefined);}
 await submit('label',values('-root','',9999));const root=await get(marker+'-root');assert.ok(root);
 await submit('label',values('-a',root.id,10));const a=await get(marker+'-a');
 await submit('label',values('-b',root.id,20));const b=await get(marker+'-b');
 await submit('label',values('-grandchild',a.id,10));const child=await get(marker+'-grandchild');
 let html=await(await fetch(base)).text();assert.ok(html.includes(marker+'-grandchild'));console.log('PASS root, child and grandchild creation visible publicly');
 result=await submit('label',{...values('-root'),id:root.id,parentId:child.id});assert.match(result,/Menu induk tidak valid/);assert.equal((await get(marker+'-root')).parent_id,null);console.log('PASS cyclic parenting rejected');
 result=await submit('label',{...values('-a'),id:a.id,parentId:randomUUID()});assert.match(result,/Menu induk tidak valid/);
 await submit('direction',{id:b.id,direction:'up'});const order=(await pool.query('SELECT id FROM navigation WHERE parent_id=$1 ORDER BY position,label',[root.id])).rows;assert.equal(order[0].id,b.id);console.log('PASS sibling reorder');
 const hidden={...values('-root'),id:root.id,href:'/galeri',position:9999};delete hidden.enabled;await submit('label',hidden);
 html=await(await fetch(base)).text();const nav=html.match(/<nav id="website-navigation"[\s\S]*?<\/nav>/)?.[0];assert.ok(nav);assert.ok(!nav.includes(marker));console.log('PASS hidden parent hides entire subtree');
 await submit('label',{...values('-root'),id:root.id,href:'/galeri',position:9999});assert.equal((await get(marker+'-root')).href,'/galeri');
 html=await(await fetch(base)).text();assert.ok(html.includes(marker+'-root'));console.log('PASS edit and restore visibility');
 await submit('delete',{id:a.id});
 assert.equal(await get(marker+'-a'),undefined);assert.equal((await get(marker+'-grandchild')).parent_id,null);console.log('PASS deletion preserves child menu by promoting to root');
 for(const category of ['Kegiatan Polresta Batang','Kriminal','Himbauan','Polsek Jajaran']){const r=await fetch(base+'/berita?kategori='+encodeURIComponent(category));assert.equal(r.status,200);assert.ok((await r.text()).includes(category));}
 const all=await(await fetch(base)).text();assert.ok(all.includes('Berita utama dari seluruh kategori'));for(const category of ['Kegiatan Polresta Batang','Kriminal','Himbauan','Polsek Jajaran'])assert.ok(all.includes(`aria-label="${category}"`));console.log('PASS combined news homepage and four category sections');
}finally{await pool.query('DELETE FROM navigation WHERE label LIKE $1',[marker+'%']);await pool.end();console.log('Temporary navigation records cleaned.');}
