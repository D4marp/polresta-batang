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

export const NEWS_CATEGORIES = [
  "Kegiatan",
  "Kamtibmas",
  "Lalu Lintas",
  "Reskrim",
  "Binmas",
  "Humas",
  "Pengumuman",
] as const;
