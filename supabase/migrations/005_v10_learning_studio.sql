-- Mo Design V10: Educational studio & lesson publishing.
-- Run once AFTER 004_v9_cms.sql in your existing Supabase SQL Editor.
-- Does not remove or reset any existing data.
BEGIN;
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS education_mode text NOT NULL DEFAULT 'coming_soon';
-- Preserve sections hidden in V9, so upgrading doesn't unexpectedly publish them.
UPDATE public.site_settings SET education_mode = 'hidden' WHERE section_visibility->>'learn' = 'false' AND education_mode = 'coming_soon';
-- State is also validated in the admin. Available states: hidden, coming_soon, live.
CREATE TABLE IF NOT EXISTS public.learning_items (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 content_type text NOT NULL DEFAULT 'video' CHECK (content_type IN ('video','article')),
 title_ar text NOT NULL CHECK (char_length(title_ar) BETWEEN 2 AND 200),
 title_en text NOT NULL DEFAULT '',
 summary_ar text NOT NULL DEFAULT '',
 summary_en text NOT NULL DEFAULT '',
 body_ar text NOT NULL DEFAULT '',
 body_en text NOT NULL DEFAULT '',
 youtube_url text NOT NULL DEFAULT '',
 video_url text NOT NULL DEFAULT '',
 thumbnail_url text NOT NULL DEFAULT '',
 is_published boolean NOT NULL DEFAULT false,
 sort_order integer NOT NULL DEFAULT 0,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.learning_items ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.learning_items FROM anon, authenticated;
GRANT SELECT ON public.learning_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.learning_items TO authenticated;
DROP POLICY IF EXISTS "learning public published" ON public.learning_items;
DROP POLICY IF EXISTS "learning admin select" ON public.learning_items;
DROP POLICY IF EXISTS "learning admin insert" ON public.learning_items;
DROP POLICY IF EXISTS "learning admin update" ON public.learning_items;
DROP POLICY IF EXISTS "learning admin delete" ON public.learning_items;
CREATE POLICY "learning public published" ON public.learning_items
 FOR SELECT TO anon,authenticated USING (is_published = true);
CREATE POLICY "learning admin select" ON public.learning_items
 FOR SELECT TO authenticated USING (public.is_portfolio_admin());
CREATE POLICY "learning admin insert" ON public.learning_items
 FOR INSERT TO authenticated WITH CHECK (public.is_portfolio_admin());
CREATE POLICY "learning admin update" ON public.learning_items
 FOR UPDATE TO authenticated USING (public.is_portfolio_admin()) WITH CHECK (public.is_portfolio_admin());
CREATE POLICY "learning admin delete" ON public.learning_items
 FOR DELETE TO authenticated USING (public.is_portfolio_admin());
COMMIT;

-- Separate public video storage. The 45 MB per-file cap stays below the free-tier 50 MB upload limit.
-- Total storage and bandwidth are subject to your Supabase plan; large videos are best hosted on YouTube.
INSERT INTO storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
VALUES ('portfolio-video','portfolio-video',true,47185920,ARRAY['video/mp4','video/webm'])
ON CONFLICT (id) DO UPDATE SET public=EXCLUDED.public,file_size_limit=EXCLUDED.file_size_limit,allowed_mime_types=EXCLUDED.allowed_mime_types;
DROP POLICY IF EXISTS "portfolio video public view v10" ON storage.objects;
DROP POLICY IF EXISTS "portfolio video admin upload v10" ON storage.objects;
DROP POLICY IF EXISTS "portfolio video admin delete v10" ON storage.objects;
CREATE POLICY "portfolio video public view v10" ON storage.objects FOR SELECT TO anon,authenticated USING (bucket_id='portfolio-video');
CREATE POLICY "portfolio video admin upload v10" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id='portfolio-video' AND public.is_portfolio_admin());
CREATE POLICY "portfolio video admin delete v10" ON storage.objects FOR DELETE TO authenticated USING (bucket_id='portfolio-video' AND public.is_portfolio_admin());
