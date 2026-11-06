-- Konten hanya diakses server aplikasi melalui DATABASE_URL.
-- RLS aktif; publishable key tidak dapat membaca pesan atau mengubah konten.
CREATE TABLE IF NOT EXISTS public.settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL
);
CREATE TABLE IF NOT EXISTS public.news (
  id text PRIMARY KEY,
  slug varchar(200) NOT NULL UNIQUE,
  title varchar(300) NOT NULL,
  excerpt varchar(500) NOT NULL,
  content text NOT NULL,
  category varchar(60) NOT NULL,
  image text,
  status text NOT NULL CHECK (status IN ('draft','published')),
  author varchar(120) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.gallery (
  id text PRIMARY KEY, title varchar(300) NOT NULL, image text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.documents (
  id text PRIMARY KEY, title varchar(300) NOT NULL, file text NOT NULL,
  size bigint NOT NULL CHECK (size >= 0), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.messages (
  id text PRIMARY KEY, name varchar(120) NOT NULL, email varchar(160) NOT NULL,
  phone varchar(40) NOT NULL, subject varchar(160) NOT NULL, message text NOT NULL,
  "read" boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS news_status_created_idx ON public.news(status, created_at DESC);
CREATE INDEX IF NOT EXISTS gallery_created_idx ON public.gallery(created_at DESC);
CREATE INDEX IF NOT EXISTS documents_created_idx ON public.documents(created_at DESC);
CREATE INDEX IF NOT EXISTS messages_created_idx ON public.messages(created_at DESC);
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.settings, public.news, public.gallery, public.documents, public.messages FROM anon, authenticated;
