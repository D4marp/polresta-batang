CREATE TABLE IF NOT EXISTS public.navigation (
 id text PRIMARY KEY,
 label varchar(80) NOT NULL,
 href varchar(2048) NOT NULL,
 parent_id text REFERENCES public.navigation(id) ON DELETE SET NULL,
 position integer NOT NULL DEFAULT 0 CHECK (position BETWEEN 0 AND 9999),
 enabled boolean NOT NULL DEFAULT true,
 CHECK (parent_id IS DISTINCT FROM id)
);
CREATE INDEX IF NOT EXISTS navigation_parent_position_idx ON public.navigation(parent_id,position);
ALTER TABLE public.navigation ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.navigation FROM anon, authenticated;
DO $$ BEGIN
IF NOT EXISTS (SELECT 1 FROM public.settings WHERE key='navigation_initialized') THEN
INSERT INTO public.navigation(id,label,href,parent_id,position) VALUES
 ('nav-news','Semua berita','/berita',NULL,10),
 ('nav-profile','Profil & Kapolresta','/profil',NULL,20),
 ('nav-gallery','Galeri','/galeri',NULL,30),
 ('nav-services','Layanan publik','/layanan',NULL,40),
 ('nav-downloads','Unduhan','/unduhan',NULL,50),
 ('nav-contact','Kontak & pengaduan','/pengaduan',NULL,60),
 ('nav-activities','Kegiatan Polresta Batang','/berita?kategori=Kegiatan%20Polresta%20Batang','nav-news',10),
 ('nav-crime','Kriminal','/berita?kategori=Kriminal','nav-news',20),
 ('nav-advice','Himbauan','/berita?kategori=Himbauan','nav-news',30),
 ('nav-stations','Polsek Jajaran','/berita?kategori=Polsek%20Jajaran','nav-news',40),
 ('nav-leader','Kapolresta','/berita?kategori=Kapolresta','nav-news',50),
 ('nav-photos','Galeri foto','/galeri#foto','nav-gallery',10),
 ('nav-videos','Galeri video','/galeri#video','nav-gallery',20),
 ('nav-skck','SKCK','/layanan/skck','nav-services',10),
 ('nav-sim','SIM','/layanan/sim','nav-services',20)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.settings(key,value) VALUES ('navigation_initialized','true'::jsonb);
END IF;
END $$;
UPDATE public.news SET category='Kegiatan Polresta Batang' WHERE category='Kegiatan';
UPDATE public.news SET category='Kriminal' WHERE category='Reskrim';
