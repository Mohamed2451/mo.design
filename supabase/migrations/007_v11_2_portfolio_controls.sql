-- Mo Design V11.2 — additive upgrade after 006.
-- Preserves your existing data and RLS policies.
BEGIN;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS logo_dark_url text NOT NULL DEFAULT '';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS logo_light_url text NOT NULL DEFAULT '';
ALTER TABLE public.learning_items ADD COLUMN IF NOT EXISTS image_urls text NOT NULL DEFAULT '';
COMMIT;
