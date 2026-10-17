-- Mo Design: gated contact submissions, apply only AFTER a verified database backup.
-- Stage 1: deploy function + browser Turnstile, test thoroughly.
-- Stage 2 (LAST): run this migration to close anonymous REST bypass.
-- Never apply before the new form is fully working.
BEGIN;
CREATE TABLE IF NOT EXISTS public.inquiry_rate_limits (
 fingerprint text NOT NULL CHECK (char_length(fingerprint) BETWEEN 6 AND 100),
 window_start timestamptz NOT NULL,
 hits integer NOT NULL DEFAULT 0 CHECK (hits >= 0),
 PRIMARY KEY (fingerprint, window_start)
);
ALTER TABLE public.inquiry_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.inquiry_rate_limits FROM PUBLIC, anon, authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.inquiry_rate_limits TO service_role;

CREATE OR REPLACE FUNCTION public.reserve_inquiry_rate_slot(p_fingerprint text, p_max_hits integer)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE v_hits integer;
BEGIN
  IF p_fingerprint IS NULL OR length(p_fingerprint) < 6 OR length(p_fingerprint) > 100
    OR p_max_hits < 1 OR p_max_hits > 30 THEN RETURN false; END IF;
  INSERT INTO public.inquiry_rate_limits(fingerprint,window_start,hits)
  VALUES (p_fingerprint, date_trunc('hour', now()), 1)
  ON CONFLICT (fingerprint,window_start)
  DO UPDATE SET hits = public.inquiry_rate_limits.hits + 1
    WHERE public.inquiry_rate_limits.hits < p_max_hits
  RETURNING hits INTO v_hits;
  RETURN v_hits IS NOT NULL;
END $$;
REVOKE ALL ON FUNCTION public.reserve_inquiry_rate_slot(text,integer)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_inquiry_rate_slot(text,integer) TO service_role;

-- Deny anonymous and ordinary logged-in direct submissions. Service-role
-- Edge Function remains allowed, as do admin inbox reads/updates.
REVOKE INSERT ON public.inquiries FROM anon, authenticated;
DROP POLICY IF EXISTS "public submits inquiries" ON public.inquiries;
-- Preserve RLS enabled, the admin inbox policies, and all existing records.
COMMIT;

-- Future maintenance: delete rate-limit rows older than 7 days under service role.
