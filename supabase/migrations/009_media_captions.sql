-- Mo Design: optional bilingual captions per image. Non-destructive migration.
BEGIN;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS gallery_captions jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.learning_items ADD COLUMN IF NOT EXISTS image_captions jsonb NOT NULL DEFAULT '{}'::jsonb;
COMMIT;
