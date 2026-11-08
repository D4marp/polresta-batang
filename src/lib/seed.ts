import type { News, Settings } from "./types";

const now = Date.now();
const daysAgo = (d: number) => new Date(now - d * 86400000).toISOString();

export const seedSettings: Settings = {
  name: "Polresta Batang",
  tagline: "Kepolisian Resor Kota Batang — Polda Jawa Tengah",
  address: "Jl. Jend. Sudirman, Batang, Jawa Tengah",
  phone: "(0285) 000000",
  email: "humas@polrestabatang.id",
  hotline: "110",
  heroTitle: "Melayani, Melindungi, dan Mengayomi Masyarakat Batang",
  heroSubtitle:
    "Informasi resmi, layanan publik, dan berita kegiatan Polresta Batang — Polri yang PRESISI: Prediktif, Responsibilitas, dan Transparansi Berkeadilan.",
  leaderName: "Kapolresta Batang",
  leaderTitle: "Kepala Kepolisian Resor Kota Batang",
  leaderMessage:
    "Selamat datang di website resmi Polresta Batang. Kami berkomitmen menghadirkan pelayanan kepolisian yang cepat, transparan, dan humanis bagi seluruh masyarakat Kabupaten Batang. Melalui kanal ini, kami berharap informasi dan layanan Polri dapat diakses dengan mudah oleh masyarakat.",
  visi: "Terwujudnya Polresta Batang yang PRESISI dalam mewujudkan keamanan dan ketertiban masyarakat yang kondusif guna mendukung Batang yang maju, aman, dan sejahtera.",
  misi: [
    "Memberikan pelayanan prima, cepat, dan transparan kepada masyarakat.",
    "Memelihara keamanan, ketertiban, dan kelancaran lalu lintas.",
    "Menegakkan hukum secara profesional, adil, dan berkeadilan.",
    "Memperkuat kemitraan dengan masyarakat dan instansi terkait.",
    "Meningkatkan profesionalisme dan integritas personel Polri.",
  ],
  sejarah:
    "Polresta Batang bertugas menjaga keamanan dan ketertiban masyarakat serta menegakkan hukum di wilayah Kabupaten Batang, Jawa Tengah. Konten sejarah dapat diperbarui melalui dashboard admin pada menu Pengaturan.",
  instagram: "https://instagram.com/",
  facebook: "https://facebook.com/",
  youtube: "https://youtube.com/",
  mapsEmbed: "",
};

const lorem = (t: string) =>
  `${t}\n\nBerita ini adalah contoh konten awal. Silakan ubah atau hapus melalui dashboard admin, lalu unggah berita resmi Polresta Batang lengkap dengan foto kegiatan.\n\nPolresta Batang terus berkomitmen memberikan pelayanan terbaik kepada masyarakat dan menjaga situasi kamtibmas yang kondusif di wilayah hukum Kabupaten Batang.`;

export const seedNews: News[] = [
  {
    id: "seed-1",
    slug: "polresta-batang-gelar-apel-pagi-kesiapan-operasi",
    title: "Polresta Batang Gelar Apel Pagi Kesiapan Operasi Kepolisian",
    excerpt:
      "Seluruh personel melaksanakan apel pagi untuk memastikan kesiapan pengamanan dan pelayanan kepada masyarakat.",
    content: lorem(
      "Polresta Batang menggelar apel pagi yang diikuti seluruh personel untuk mengecek kesiapan pasukan dan sarana prasarana.",
    ),
    category: "Kegiatan Polresta Batang",
    status: "published",
    author: "Humas Polresta Batang",
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
  {
    id: "seed-2",
    slug: "sosialisasi-keselamatan-berlalu-lintas-pelajar",
    title: "Satlantas Gelar Sosialisasi Keselamatan Berlalu Lintas untuk Pelajar",
    excerpt:
      "Kegiatan bertujuan menumbuhkan budaya tertib berlalu lintas sejak usia dini di lingkungan sekolah.",
    content: lorem(
      "Satuan Lalu Lintas Polresta Batang memberikan edukasi keselamatan berlalu lintas kepada para pelajar.",
    ),
    category: "Kegiatan Polresta Batang",
    status: "published",
    author: "Humas Polresta Batang",
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
  },
  {
    id: "seed-3",
    slug: "bhabinkamtibmas-sambangi-warga-jaga-kamtibmas",
    title: "Bhabinkamtibmas Sambangi Warga, Ajak Jaga Kamtibmas Bersama",
    excerpt:
      "Sambang dan dialogisasi dilakukan untuk menyerap aspirasi serta mempererat sinergi polisi dan masyarakat.",
    content: lorem(
      "Bhabinkamtibmas melaksanakan kegiatan sambang kepada warga desa binaan untuk menjaga situasi kamtibmas.",
    ),
    category: "Kegiatan Polresta Batang",
    status: "published",
    author: "Humas Polresta Batang",
    createdAt: daysAgo(5),
    updatedAt: daysAgo(5),
  },
  {
    id: "seed-4",
    slug: "layanan-skck-online-polresta-batang",
    title: "Pengumuman: Layanan SKCK dan SIM Dibuka Setiap Hari Kerja",
    excerpt:
      "Masyarakat dapat memanfaatkan layanan pembuatan SKCK dan SIM di Polresta Batang pada hari dan jam kerja.",
    content: lorem(
      "Polresta Batang mengingatkan masyarakat bahwa layanan SKCK dan SIM tersedia setiap hari kerja.",
    ),
    category: "Himbauan Kamtibmas",
    status: "published",
    author: "Humas Polresta Batang",
    createdAt: daysAgo(7),
    updatedAt: daysAgo(7),
  },
];
