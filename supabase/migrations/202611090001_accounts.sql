CREATE TABLE IF NOT EXISTS public.app_users (
 id text PRIMARY KEY,
 username varchar(40) NOT NULL UNIQUE CHECK (username=lower(username)),
 display_name varchar(120) NOT NULL,
 password_hash text NOT NULL,
 role text NOT NULL CHECK (role IN ('admin','contributor')),
 active boolean NOT NULL DEFAULT true,
 session_version integer NOT NULL DEFAULT 1,
 must_change_password boolean NOT NULL DEFAULT true,
 created_at timestamptz NOT NULL DEFAULT now(),
 last_login timestamptz
);
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.app_users FROM anon,authenticated;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS created_by text REFERENCES public.app_users(id) ON DELETE SET NULL;
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS created_by text REFERENCES public.app_users(id) ON DELETE SET NULL;
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS uploaded_by_name varchar(120) NOT NULL DEFAULT 'Arsip redaksi';
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS created_by text REFERENCES public.app_users(id) ON DELETE SET NULL;
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS uploaded_by_name varchar(120) NOT NULL DEFAULT 'Arsip redaksi';
CREATE INDEX IF NOT EXISTS news_created_by_idx ON public.news(created_by);
CREATE INDEX IF NOT EXISTS gallery_created_by_idx ON public.gallery(created_by);
CREATE INDEX IF NOT EXISTS videos_created_by_idx ON public.videos(created_by);
