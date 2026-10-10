-- MO DESIGN V5: additive migration. Run after schema.sql (and 002_testimonials.sql only on older installs).
-- Never paste private service-role keys into browser config.
BEGIN;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS stats_projects integer NOT NULL DEFAULT 100;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS stats_years integer NOT NULL DEFAULT 3;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS stats_satisfaction integer NOT NULL DEFAULT 100;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS stats_verified boolean NOT NULL DEFAULT false;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS video_url text NOT NULL DEFAULT '';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS gallery_urls text NOT NULL DEFAULT '';

ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS objective_ar text NOT NULL DEFAULT '';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS objective_en text NOT NULL DEFAULT '';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS tools_used text NOT NULL DEFAULT '';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS project_type text NOT NULL DEFAULT 'concept';
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_project_type_check;
ALTER TABLE public.projects ADD CONSTRAINT projects_project_type_check CHECK (project_type IN ('concept','personal','client'));
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS company text NOT NULL DEFAULT '';
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS budget text NOT NULL DEFAULT '';
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS desired_timeline text NOT NULL DEFAULT '';
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS reference_url text NOT NULL DEFAULT '';
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS internal_notes text NOT NULL DEFAULT '';
ALTER TABLE public.inquiries DROP CONSTRAINT IF EXISTS inquiries_status_check;
ALTER TABLE public.inquiries ADD CONSTRAINT inquiries_status_check CHECK (status IN ('new','read','reviewing','contacted','proposal_sent','accepted','completed','archived'));
-- Column-specific public insertion avoids granting write access to status/notes/private metadata.
GRANT INSERT (sender_name,sender_email,service_type,message,company,budget,desired_timeline,reference_url) ON public.inquiries TO anon, authenticated;
GRANT UPDATE (status,internal_notes) ON public.inquiries TO authenticated;
CREATE INDEX IF NOT EXISTS idx_inquiries_status_date ON public.inquiries(status,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_published_order ON public.projects(is_published,sort_order);
CREATE OR REPLACE FUNCTION public.set_portfolio_project_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$ BEGIN NEW.updated_at=now(); RETURN NEW; END; $$;
DROP TRIGGER IF EXISTS trigger_project_updated_at ON public.projects;
CREATE TRIGGER trigger_project_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.set_portfolio_project_updated_at();
COMMIT;

-- Optional public image bucket. Anonymous clients may read, ONLY approved admins may upload/edit/remove.
-- Verify the Storage service and these policies exist in your project after migration.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('portfolio-media','portfolio-media',true,8388608,ARRAY['image/jpeg','image/png','image/webp','image/avif'])
ON CONFLICT (id) DO UPDATE SET public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

CREATE POLICY "public can view portfolio media v5" ON storage.objects
FOR SELECT TO anon,authenticated USING (bucket_id='portfolio-media');
CREATE POLICY "admin can upload portfolio media v5" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id='portfolio-media' AND public.is_portfolio_admin());
CREATE POLICY "admin can update portfolio media v5" ON storage.objects
FOR UPDATE TO authenticated USING (bucket_id='portfolio-media' AND public.is_portfolio_admin()) WITH CHECK (bucket_id='portfolio-media' AND public.is_portfolio_admin());
CREATE POLICY "admin can delete portfolio media v5" ON storage.objects
FOR DELETE TO authenticated USING (bucket_id='portfolio-media' AND public.is_portfolio_admin());
