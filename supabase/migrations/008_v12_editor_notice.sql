-- Mo Design V12. Additive migration after 007. No existing content is deleted.
BEGIN;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS site_notice jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS text_style jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.learning_items ADD COLUMN IF NOT EXISTS text_style jsonb NOT NULL DEFAULT '{}'::jsonb;
COMMIT;
