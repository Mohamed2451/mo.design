# Mo Design V5 — Creative Portfolio + Client Enquiries

**Owner:** Mohamed Mahmoud  
**Production URL:** https://mohamed2451.github.io/mo.design/  
**Source:** https://github.com/Mohamed2451/mo.design

## What's new

- Dark-first, Arabic-first visual direction preserving Mohamed's original portrait and white/black logos.
- A new campaign-editorial section, more expressive projects grid, Why Mo Design and FAQ.
- **12 original speculative concept posters** (8 V4 + 4 V5). None should be represented as commissioned work.
- **12 shareable, static project case-study URLs**, designed for GitHub Pages, plus a dynamic details fallback (`project.html?slug=...`) for future CMS projects.
- **4 service detail pages** with direct WhatsApp service CTAs.
- A more structured contact brief (company, scope, timeline, optional URL), privacy notice and WhatsApp fallback.
- Additional Supabase migration for portfolio project metadata, contact pipeline, optional project gallery URLs, media storage bucket and verified editable statistics.
- Verified testimonials only. Unverified figures and testimonials are hidden publicly.
- `sitemap.xml`, `robots.txt`, Open Graph preview image, canonical metadata, privacy/404 pages.
- Preserved switchers: Arabic/English and Dark/Light, with responsive layouts.

## Quick start

```bash
python -m http.server 8000
```

Open `http://localhost:8000/`. Modules are loaded over HTTP, not `file://`. The site remains a static frontend.

## Deploy to GitHub Pages

1. Commit **the contents of this folder**, including `.github/workflows/deploy.yml` and hidden files, to a **development branch** of `Mohamed2451/mo.design`.
2. Test locally and review the branch/PR. Merge into `main` only when approved.
3. Confirm repository **Settings → Pages → Build and deployment → GitHub Actions**.
4. The workflow publishes homepage, dynamic detail, all generated case studies/service pages, admin, assets, SEO and privacy files.

The production website has **not** been modified by this ZIP creation.

## Backend setup (important)

`config.js` intentionally has blank placeholders. **Admin changes are demo-only and browser-local until Supabase is connected.**

For a new Supabase project:
1. In SQL Editor, run `supabase/schema.sql` **once**.
2. Run `supabase/migrations/003_v5_portfolio.sql` **once**.
3. Under Authentication, create a real account for the owner and grant it membership: `insert into public.admin_users(user_id) values ('ACTUAL_UUID');`
4. Put the **public** Supabase URL and publishable/anon key into `config.js`. Never use a service-role key.
5. Visit `/admin.html` to sign in. Confirm CRUD and Storage RLS with a normal client and a separate unauthenticated browser.
6. Add published projects through Admin and test contact persistence using a real submission; add anti-spam controls (verified CAPTCHA or Edge-function rate limiting) before a high-traffic launch.

For an existing V4 Supabase instance: only apply migration 002 **if not previously run**, then run 003. Do not rerun initial schema blindly, since existing data and policies may conflict.

### Limits to disclose

- This build **does not configure or operate** an actual Supabase project. Storage uploads and inquiry saving are implemented against the migration but **not end-to-end tested** with live credentials.
- The local admin is an explicitly labeled **demo** and not production-secured; it persists in localStorage of only that browser.
- Static generated case pages describe provided spec content. New projects added through CMS use a dynamic `project.html?slug=...` route; these pages will need a future prerender/build step for individual metadata/OG images.
- Video previews work with supplied **direct HTTPS MP4/WebM URLs** in dynamic project pages. The current static demo posters are **not videos**.
- The V5 Storage feature uploads a cover image (8 MB max). A complete multi-file asset library with video storage, crop variants, drag sorting and safe deletion remains a subsequent phase.
- Public inquiry insertion currently requires an additional verified anti-spam control/rate limiter before high traffic.
- All achievement figures (+100 / +3 / 100%) are **hidden by default** until the owner confirms accuracy. They are editable in Admin after migration.
- Testimonials are hidden publicly until published with the owner's documented permission and verification.
- Courses, user/student accounts and paid content are planned but **not implemented**.
- No claims of conversion rates, speed scores, production deploy tests or customer reviews are made without evidence.

See [`START_HERE_AR.md`](START_HERE_AR.md), [`QA_REPORT_AR.md`](QA_REPORT_AR.md), and [`DESIGN_DIRECTION_AR.md`](DESIGN_DIRECTION_AR.md).
