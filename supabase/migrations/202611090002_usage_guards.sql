CREATE TABLE IF NOT EXISTS public.upload_reservations (
 id text PRIMARY KEY,
 bytes bigint NOT NULL CHECK(bytes>0),
 expires_at timestamptz NOT NULL DEFAULT now()+interval '10 minutes'
);
CREATE INDEX IF NOT EXISTS upload_reservations_expiry_idx ON public.upload_reservations(expires_at);
CREATE TABLE IF NOT EXISTS public.app_rate_limits (
 key text PRIMARY KEY,
 attempts integer NOT NULL,
 expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS app_rate_limits_expiry_idx ON public.app_rate_limits(expires_at);
ALTER TABLE public.upload_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.upload_reservations,public.app_rate_limits FROM anon,authenticated;
CREATE INDEX IF NOT EXISTS news_public_category_page_idx ON public.news(status,category,created_at DESC,id);
