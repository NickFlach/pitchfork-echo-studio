CREATE TABLE public.forum_posts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 thread_id uuid REFERENCES public.forum_posts(id) ON DELETE CASCADE,
 wallet_address text NOT NULL,
 title text,
 body text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT forum_post_content CHECK (length(body) BETWEEN 1 AND 10000 AND ((thread_id IS NULL AND length(title) BETWEEN 3 AND 200) OR (thread_id IS NOT NULL AND title IS NULL)))
);
GRANT ALL ON public.forum_posts TO service_role;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
CREATE INDEX forum_posts_thread_created ON public.forum_posts(thread_id, created_at);
CREATE TABLE public.forum_upvotes (
 post_id uuid NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
 wallet_address text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY (post_id, wallet_address)
);
GRANT ALL ON public.forum_upvotes TO service_role;
ALTER TABLE public.forum_upvotes ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.forum_wallet_challenges (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 wallet_address text NOT NULL,
 action text NOT NULL,
 payload_hash text NOT NULL,
 expires_at timestamptz NOT NULL DEFAULT (now() + interval '5 minutes')
);
GRANT ALL ON public.forum_wallet_challenges TO service_role;
ALTER TABLE public.forum_wallet_challenges ENABLE ROW LEVEL SECURITY;
CREATE VIEW public.forum_post_summaries WITH (security_invoker = true) AS
 SELECT p.*, (SELECT count(*)::integer FROM public.forum_upvotes u WHERE u.post_id=p.id) AS upvotes,
 (SELECT count(*)::integer FROM public.forum_posts r WHERE r.thread_id=p.id) AS reply_count
 FROM public.forum_posts p;
GRANT SELECT ON public.forum_post_summaries TO service_role;