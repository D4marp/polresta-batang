import { createClient } from '@supabase/supabase-js';
export const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'website-media';
export const mime = {
 jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp',gif:'image/gif',pdf:'application/pdf',
 doc:'application/msword',docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
 xls:'application/vnd.ms-excel',xlsx:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
 ppt:'application/vnd.ms-powerpoint',pptx:'application/vnd.openxmlformats-officedocument.presentationml.presentation',
};
export function storageClient() {
 const key=process.env.SUPABASE_STORAGE_SECRET_KEY||process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY;
 const url=process.env.SUPABASE_STORAGE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL;
 if(!key||!url) throw new Error('Kunci server Storage belum diatur.');
 return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}
