import "server-only";
import {unstable_cache} from "next/cache";
import * as db from "./db";
import {query} from "./postgres";
import {canonicalNewsCategory} from "./categories";
import {visibleMenuItems} from "./navigation";
import {PUBLIC_CACHE_TAG} from "./cache-policy";

const policy={revalidate:300,tags:[PUBLIC_CACHE_TAG]};
export const getPublicSettings=unstable_cache(db.getSettings,["public-settings-v1"],policy);
export const getPublicMenuItems=unstable_cache(async()=>visibleMenuItems(await db.listMenuItems()),["public-menu-v1"],policy);
type FeedOptions={category?:string;q?:string;limit?:number;offset?:number};
const feed=(options:FeedOptions)=>db.listNews({...options,summaryOnly:true,includeDrafts:false,ownerId:undefined,limit:options.limit??40});
const cachedFeed=unstable_cache(feed,["public-news-summary-v1"],policy);
export const getPublicNews=(options:FeedOptions={})=>options.q?feed(options):cachedFeed(options);
const cachedCount=unstable_cache((category?:string)=>db.countNews({category}),["public-news-count-v1"],policy);
export async function getPublicNewsPage(q:string|undefined,requestedCategory:string|undefined,page:number){
 const category=requestedCategory?canonicalNewsCategory(requestedCategory):undefined;
 const search=q?.trim().slice(0,160)||undefined;
 if(requestedCategory&&!category)return {items:[],total:0,pages:1,current:1};
 const total=search?await db.countNews({q:search,category}):await cachedCount(category);
 const pages=Math.max(1,Math.ceil(total/9)),current=Math.min(Math.max(Math.floor(page)||1,1),pages);
 const items=await getPublicNews({q:search,category,limit:9,offset:(current-1)*9});
 return {items,total,pages,current};
}
export const getPublicNewsBySlug=unstable_cache(db.getNewsBySlug,["public-news-detail-v1"],policy);
export const getPublicGallery=unstable_cache((limit=12,offset=0)=>db.listGallery({limit,offset}),["public-gallery-v1"],policy);
export const getPublicVideos=unstable_cache((limit=9,offset=0)=>db.listVideos({limit,offset}),["public-videos-v1"],policy);
export const getPublicMediaCount=unstable_cache(db.countMedia,["public-media-count-v1"],policy);
export const getPublicVideoById=unstable_cache(db.getVideoById,["public-video-detail-v1"],policy);
export const getPublicDocuments=unstable_cache(db.listDocuments,["public-documents-v1"],policy);
export const getPublicSitemapEntries=unstable_cache(async()=>{
 const [news,videos]=await Promise.all([query<{slug:string;updated_at:Date}>("SELECT slug,updated_at FROM news WHERE status='published' ORDER BY created_at DESC LIMIT 40000"),query<{id:string}>("SELECT id FROM videos ORDER BY created_at DESC LIMIT 9000")]);
 return {news:news.map(n=>({slug:n.slug,updatedAt:new Date(n.updated_at).toISOString()})),videos};
},["public-sitemap-v1"],policy);
