CREATE TABLE IF NOT EXISTS public.videos (
 id text PRIMARY KEY, title varchar(300) NOT NULL, url varchar(2048) NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS videos_created_idx ON public.videos(created_at DESC);
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.videos FROM anon, authenticated;
