import { storageClient, bucket, mime } from './storage-client.mjs';
const client=storageClient();
const {data:existing,error:lookup}=await client.storage.getBucket(bucket);
if(existing){
 if(existing.public||Number(existing.file_size_limit)!==10*1024*1024) throw new Error('Bucket sudah ada dengan konfigurasi berbeda. Tidak diubah otomatis.');
 console.log('Bucket private sudah tersedia: '+bucket);
}else{
 if(lookup&&!['400','404'].includes(String(lookup.statusCode)))throw new Error('Tidak dapat memeriksa bucket Storage.');
 const {error}=await client.storage.createBucket(bucket,{public:false,fileSizeLimit:10*1024*1024,allowedMimeTypes:[...new Set(Object.values(mime))]});
 if(error)throw new Error('Gagal membuat bucket Storage: '+error.message);
 console.log('Bucket private dibuat: '+bucket+'; maksimal 10 MB; akses unggah/hapus hanya melalui server.');
}
