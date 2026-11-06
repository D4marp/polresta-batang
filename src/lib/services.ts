export interface Service {
  slug: string;
  title: string;
  icon: "car" | "shield" | "file" | "alert" | "users" | "badge" | "pill" | "scale";
  summary: string;
  requirements: string[];
  steps: string[];
  note?: string;
}

export const services: Service[] = [
  {
    slug: "skck",
    title: "SKCK",
    icon: "badge",
    summary: "Surat Keterangan Catatan Kepolisian untuk keperluan melamar kerja, pendidikan, dan lainnya.",
    requirements: [
      "Fotokopi KTP dan Kartu Keluarga",
      "Fotokopi Akta Kelahiran / Ijazah terakhir",
      "Pas foto 4x6 berlatar merah (sesuai ketentuan)",
      "Surat pengantar dari RT/RW/Kelurahan (bila diminta)",
    ],
    steps: [
      "Datang ke loket pelayanan SKCK Polresta Batang",
      "Isi formulir dan serahkan berkas persyaratan",
      "Pengambilan sidik jari dan foto",
      "Cetak dan terima SKCK",
    ],
    note: "Persyaratan dapat berubah sewaktu-waktu; konfirmasi ke petugas pelayanan.",
  },
  {
    slug: "sim",
    title: "SIM",
    icon: "car",
    summary: "Penerbitan dan perpanjangan Surat Izin Mengemudi melalui Satuan Lalu Lintas.",
    requirements: [
      "KTP asli dan fotokopi",
      "Surat keterangan sehat dari dokter/klinik",
      "Lulus tes psikologi (untuk SIM baru/golongan tertentu)",
      "SIM lama (untuk perpanjangan)",
    ],
    steps: [
      "Daftar dan lengkapi persyaratan administrasi",
      "Ikuti ujian teori dan praktik (SIM baru)",
      "Pembayaran PNBP resmi",
      "Foto, sidik jari, dan penerbitan SIM",
    ],
  },
  {
    slug: "stnk-bpkb",
    title: "STNK & BPKB",
    icon: "file",
    summary: "Layanan administrasi kendaraan bermotor: registrasi, mutasi, dan pengesahan.",
    requirements: [
      "KTP pemilik",
      "BPKB dan STNK asli",
      "Bukti pembayaran pajak kendaraan",
      "Hasil cek fisik kendaraan",
    ],
    steps: [
      "Lakukan cek fisik kendaraan",
      "Ajukan berkas di loket Samsat",
      "Pembayaran pajak dan PNBP",
      "Penerimaan STNK/BPKB",
    ],
  },
  {
    slug: "spkt",
    title: "SPKT / Laporan Polisi",
    icon: "alert",
    summary: "Sentra Pelayanan Kepolisian Terpadu melayani laporan dan pengaduan masyarakat 24 jam.",
    requirements: [
      "Identitas diri (KTP)",
      "Kronologi kejadian",
      "Barang bukti / saksi bila ada",
    ],
    steps: [
      "Datang ke SPKT Polresta Batang",
      "Sampaikan laporan kepada petugas",
      "Laporan dituangkan dalam Laporan Polisi",
      "Terima Surat Tanda Terima Laporan (STTLP)",
    ],
    note: "Untuk keadaan darurat hubungi 110.",
  },
  {
    slug: "surat-bebas-narkoba",
    title: "Surat Keterangan Bebas Narkoba",
    icon: "pill",
    summary: "Surat keterangan hasil tes narkoba untuk keperluan administrasi tertentu.",
    requirements: ["KTP asli dan fotokopi", "Pas foto", "Surat permohonan / pengantar instansi"],
    steps: [
      "Ajukan permohonan di Satuan Resnarkoba",
      "Pelaksanaan tes",
      "Penerbitan surat keterangan",
    ],
  },
  {
    slug: "pengawalan",
    title: "Pengawalan Sabhara",
    icon: "shield",
    summary: "Permohonan pengawalan dan pengamanan kegiatan oleh Satuan Samapta.",
    requirements: ["Surat permohonan resmi", "Rincian kegiatan, rute, dan waktu"],
    steps: ["Ajukan surat ke Polresta Batang", "Verifikasi oleh Satuan Samapta", "Penugasan personel pengawalan"],
  },
  {
    slug: "penerimaan-polri",
    title: "Penerimaan Polri",
    icon: "users",
    summary: "Informasi seleksi penerimaan anggota Polri (Akpol, Bintara, Tamtama).",
    requirements: ["Sesuai pengumuman resmi seleksi Polri tahun berjalan"],
    steps: ["Pantau pengumuman resmi", "Daftar secara online", "Ikuti tahapan seleksi"],
    note: "Seleksi Polri tidak dipungut biaya apa pun.",
  },
  {
    slug: "pengaduan",
    title: "Pengaduan Masyarakat",
    icon: "scale",
    summary: "Sampaikan pengaduan atau saran terkait pelayanan dan perilaku anggota Polri.",
    requirements: ["Identitas pelapor", "Uraian pengaduan", "Bukti pendukung"],
    steps: ["Isi formulir pengaduan pada halaman Kontak", "Pengaduan diverifikasi", "Tindak lanjut oleh unit terkait"],
  },
];

export const getService = (slug: string) => services.find((s) => s.slug === slug);
