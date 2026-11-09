import "server-only";
import {updateTag,revalidatePath} from "next/cache";
import {PUBLIC_CACHE_TAG} from "./cache-policy";
export function invalidatePublicContent(){updateTag(PUBLIC_CACHE_TAG);revalidatePath("/","layout");}
