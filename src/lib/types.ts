export type NewsStatus = "published" | "draft";

export interface News {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image?: string;
  status: NewsStatus;
  author: string;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  image: string;
  createdAt: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  file: string;
  size: number;
  createdAt: string;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Settings {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  hotline: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage?: string;
  leaderName: string;
  leaderTitle: string;
  leaderPhoto?: string;
  leaderMessage: string;
  visi: string;
  misi: string[];
  sejarah: string;
  instagram: string;
  facebook: string;
  youtube: string;
  mapsEmbed: string;
}

export const PRIMARY_NEWS_CATEGORIES = ["Kegiatan Polresta Batang", "Kriminal", "Himbauan", "Polsek Jajaran"] as const;
export const NEWS_CATEGORIES = [
  ...PRIMARY_NEWS_CATEGORIES,
  "Kapolresta",
  "Kamtibmas",
  "Lalu Lintas",
  "Binmas",
  "Humas",
  "Pengumuman",
] as const;
