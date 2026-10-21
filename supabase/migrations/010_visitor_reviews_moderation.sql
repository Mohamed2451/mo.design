-- Visitor testimonials: keep the existing admin-managed testimonials table and data unchanged.
-- Public visitors may insert only feedback content. Verification/publication remain admin-only.
-- Apply once in the connected Supabase SQL Editor, after checking project is the Mo Design live project.
BEGIN;
REVOKE INSERT ON public.testimonials FROM anon;
GRANT INSERT (author_ar,author_en,job_ar,job_en,quote_ar,quote_en,rating)
ON public.testimonials TO anon;
DROP POLICY IF EXISTS "site visitors submit pending testimonials" ON public.testimonials;
CREATE POLICY "site visitors submit pending testimonials"
ON public.testimonials FOR INSERT TO anon
WITH CHECK (
  is_published = false AND is_verified = false
  AND rating BETWEEN 1 AND 5
  AND char_length(author_ar) BETWEEN 2 AND 70
  AND char_length(quote_ar) BETWEEN 12 AND 1200
  AND author_ar = author_en
  AND quote_ar = quote_en
  AND job_ar IN ('عميل · من الموقع','متدرب · من الموقع')
  AND job_en IN ('Client review · submitted','Learner review · submitted')
);
COMMIT;
