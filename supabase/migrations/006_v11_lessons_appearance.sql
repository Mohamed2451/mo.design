-- Mo Design V11: additional lesson resource links and configurable section appearance.
-- Run once after migration 005. This is additive: does not reset projects, messages or content.
BEGIN;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS section_design jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.learning_items ADD COLUMN IF NOT EXISTS resource_links text NOT NULL DEFAULT '';
COMMIT;
