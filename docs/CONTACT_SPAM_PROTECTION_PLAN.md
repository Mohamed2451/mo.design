# Mo Design — Spam protection implementation plan (NOT ACTIVATED)

The live contact form currently writes to Supabase `inquiries` via the public browser SDK. Its honeypot is **not sufficient** to prevent API bypass or bot spam.

## Preparation only
- A **staged SQL migration** is stored at `supabase/migrations/010_contact_turnstile_gate.sql`.
- **DO NOT RUN** that migration now. It revokes direct anonymous INSERT and would break today's contact form without a deployed, tested replacement.
- The repository addition does **not** change the live database. No user content is touched.

## Required sequence (after verified backups)
1. Create a Cloudflare Turnstile widget, store the SITE key in public config and the SECRET key as a Supabase Edge Function secret (never GitHub or HTML).
2. Build and deploy a Supabase Edge Function to accept validated inquiry fields; verify Turnstile token with Cloudflare `siteverify` server-side, rejecting missing/expired/invalid tokens.
3. Apply strict server-side length/field validation, origin/CORS checks (not a security boundary alone), and privacy-conscious request fingerprint hashing.
4. Provision rate-limit storage and atomic reservation logic. Prefer small hourly cap per fingerprint plus shorter burst throttling. Ensure the endpoint rejects excess requests.
5. Deploy a form update to call the Edge Function, show retryable errors, and handle token renewal. **Test via the official live form and admin inbox**, including duplicate, expired and invalid token cases, before closing direct inserts.
6. ONLY THEN apply the migration (or equivalent SQL to grant the function exclusive insert capability); ensure non-admin anonymous `inquiries` SELECT is forbidden. Verify direct REST INSERT is rejected after migration.
7. Retest on desktop and mobile, ensure inbox operations work; document a rollback plan, including restoration of prior column grants and INSERT RLS policy, if needed.

## Security / limitations
- Do not expose database service-role key, Turnstile secret, connection passwords, real client messages or backups in public GitHub.
- Supabase Free does not include scheduled database backups; PostgreSQL rows and Storage files require separate backups.
- Admin RLS policies in GitHub indicate intended settings, but their live state has not been independently inspected.
- Cloudflare Pages/R2 do not provide database recovery automatically.
- **Deployment is blocked pending backup, server endpoint implementation, and user approval.** This migration is deliberately not run.
