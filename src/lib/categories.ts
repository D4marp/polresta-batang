export const NEWS_CATEGORIES = [
  "Kegiatan Polresta Batang",
  "Kegiatan Polsek Jajaran",
  "Berita Kriminal",
  "Himbauan Kamtibmas",
] as const;

const aliases:Record<string,string> = {
  Kegiatan:"Kegiatan Polresta Batang", Kapolresta:"Kegiatan Polresta Batang",
  Humas:"Kegiatan Polresta Batang", Binmas:"Kegiatan Polresta Batang", "Lalu Lintas":"Kegiatan Polresta Batang",
  "Polsek Jajaran":"Kegiatan Polsek Jajaran", Kriminal:"Berita Kriminal", Reskrim:"Berita Kriminal",
  Himbauan:"Himbauan Kamtibmas", Imbauan:"Himbauan Kamtibmas", Kamtibmas:"Himbauan Kamtibmas", Pengumuman:"Himbauan Kamtibmas",
};
export function canonicalNewsCategory(category:string):string|undefined {
  return NEWS_CATEGORIES.find(item=>item===category) ?? (Object.hasOwn(aliases,category)?aliases[category]:undefined);
}
