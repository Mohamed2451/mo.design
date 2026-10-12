-- Mo Design V9 — apply ONCE after 003_v5_portfolio.sql.
-- Additive only. Does not delete projects, members, or customer enquiries.
BEGIN;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS content_ar jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS content_en jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS section_visibility jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS profile_image_url text NOT NULL DEFAULT '';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS youtube_url text NOT NULL DEFAULT '';
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS sender_phone text NOT NULL DEFAULT '';
GRANT INSERT (sender_phone) ON public.inquiries TO anon,authenticated;
-- Correct the original starter records only; custom edits remain untouched.
UPDATE public.services SET title_ar='مونتاج الفيديو والريلز والبودكاست', title_en='Video Editing for Reels & Podcasts',
 description_ar='مونتاج احترافي للريلز والفيديوهات والبودكاست المصوّر باستخدام Premiere Pro وDaVinci Resolve وCapCut.',
 description_en='Professional reels, video and podcast editing with Premiere Pro, DaVinci Resolve and CapCut.'
 WHERE title_ar='مونتاج الفيديو والموشن جرافيكس' AND title_en='Video Editing & Motion Graphics';
UPDATE public.site_settings SET
 role_ar='مصمم جرافيك ومونتير | إعلانات • فيديوهات AI • برومبتات',
 role_en='Graphic Designer & Video Editor | Ads • AI Video • Prompt Design'
 WHERE id=1 AND role_ar='مصمم جرافيك ومونتير فيديو | إعلانات سوشيال • موشن • AI Visuals';
COMMIT;
-- Keeps existing RLS policies from schema.sql / migration 003 in place.
-- Never add service_role / secret keys to the public config.js.
