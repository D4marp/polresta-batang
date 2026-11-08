-- Consolidate labels without removing articles, drafts, or their images.
UPDATE public.news SET category=CASE
 WHEN category='Kegiatan Polresta Batang' THEN 'Kegiatan Polresta Batang'
 WHEN category IN ('Berita Kriminal','Kriminal','Reskrim') THEN 'Berita Kriminal'
 WHEN category IN ('Kegiatan Polsek Jajaran','Polsek Jajaran') THEN 'Kegiatan Polsek Jajaran'
 WHEN category IN ('Himbauan Kamtibmas','Himbauan','Imbauan','Kamtibmas','Pengumuman') THEN 'Himbauan Kamtibmas'
 WHEN title ~* '\mpolsek\M' THEN 'Kegiatan Polsek Jajaran'
 ELSE 'Kegiatan Polresta Batang'
 END;

-- Remove only the original, unrenamed extra Kapolresta category shortcut.
UPDATE public.navigation SET parent_id='nav-activities'
 WHERE parent_id IN (SELECT id FROM public.navigation WHERE id='nav-leader' AND label='Kapolresta' AND href='/berita?kategori=Kapolresta')
 AND EXISTS (SELECT 1 FROM public.navigation WHERE id='nav-activities');
DELETE FROM public.navigation WHERE id='nav-leader' AND label='Kapolresta' AND href='/berita?kategori=Kapolresta';

UPDATE public.navigation SET
 label=CASE label
 WHEN 'Kriminal' THEN 'Berita Kriminal' WHEN 'Reskrim' THEN 'Berita Kriminal'
 WHEN 'Himbauan' THEN 'Himbauan Kamtibmas' WHEN 'Imbauan' THEN 'Himbauan Kamtibmas'
 WHEN 'Polsek Jajaran' THEN 'Kegiatan Polsek Jajaran'
 WHEN 'Kegiatan' THEN 'Kegiatan Polresta Batang'
 ELSE label END,
 href=CASE
 WHEN href IN ('/berita?kategori=Kriminal','/berita?kategori=Reskrim') THEN '/berita?kategori=Berita%20Kriminal'
 WHEN href IN ('/berita?kategori=Himbauan','/berita?kategori=Imbauan','/berita?kategori=Kamtibmas','/berita?kategori=Pengumuman') THEN '/berita?kategori=Himbauan%20Kamtibmas'
 WHEN href='/berita?kategori=Polsek%20Jajaran' THEN '/berita?kategori=Kegiatan%20Polsek%20Jajaran'
 WHEN href IN ('/berita?kategori=Kegiatan','/berita?kategori=Kapolresta','/berita?kategori=Humas','/berita?kategori=Binmas','/berita?kategori=Lalu%20Lintas') THEN '/berita?kategori=Kegiatan%20Polresta%20Batang'
 ELSE href END;
UPDATE public.navigation SET position=CASE id WHEN 'nav-activities' THEN 10 WHEN 'nav-stations' THEN 20 WHEN 'nav-crime' THEN 30 WHEN 'nav-advice' THEN 40 END
 WHERE id IN ('nav-activities','nav-stations','nav-crime','nav-advice') AND parent_id='nav-news';
