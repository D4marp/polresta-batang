ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS description varchar(5000) NOT NULL DEFAULT '';
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS thumbnail varchar(2048) NOT NULL DEFAULT '';
