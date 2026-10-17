# Mo Design — Final launch gate (2026-10-17)

## Verified from user tests
- Academy mobile loading fixed and user-confirmed.
- Social-media, video/motion, AI-creative service pages and Quake Burger project open on mobile.
- Admin draft creation, image and description saving, update and persistence after refresh verified; draft does not appear publicly.
- GitHub Actions deployment of current main succeeded.
- Current content projects are deliberately **tests**; do not delete or alter them until the user approves replacement.

## Code checks added
- `tests/prelaunch-audit.mjs` validates the contact form schema, consent, honeypot, admin checks, RLS declarations and crawler rules.
- Run via `.github/workflows/v13-tests.yml` on PRs and dev branch.

## Blocking acceptance tests before final launch
1. **Real contact submission:** send one clearly labeled test lead using non-sensitive sample data via the public homepage, verify success, verify arrival in admin inbox, update status, verify after reload. Remove only the test lead *after confirmation*.
2. **All contact links:** check WhatsApp target, email and socials from real phone. Placeholder/incorrect accounts must be replaced by user through dashboard.
3. **Legal/privacy:** read published privacy, terms and copyright content, check linked policy from consent form.
4. **RLS verification against LIVE Supabase:** read-only inspect active policies and grants; repository migrations are not proof they were applied. Anonymous users must not SELECT inquiries or drafts; do not execute destructive migrations without backup and approval.
5. **Spam:** current hidden form honeypot is client-side only. Add server-side rate limiting/CAPTCHA through a reliable backend before a public high-traffic launch.
6. **Backups:** GitHub clone is code-only; take verified private backup of Supabase data and stored media, plus restore instructions. Avoid storing secrets in GitHub or public handoffs.
7. **Performance and accessibility:** mobile slow-data smoke test, full PageSpeed/Lighthouse on main, focus/keyboards, image sizes, network errors.
8. **Google:** follow up delayed sitemap processing in Search Console; indexing is Google-controlled. Remove or unpublish test content *only* when the owner replaces it with real projects.
9. **Finish:** user approves real portfolio, links and service copy; verify final deployment, repository protections and handoff.

## Safe workflow
Develop in `mo-design-v13-dev`, run checks, review PR, merge to `main` only after user approval. Publishing project content via CMS requires no manual merge. SEO page generation runs hourly on `main`; indexing is not immediate or guaranteed.

## Useful links
- Production: https://mohamed2451.github.io/mo.design/
- Admin: https://mohamed2451.github.io/mo.design/admin.html
- Dev preview: https://mo-design-v13-preview.pages.dev/
- Repository: https://github.com/Mohamed2451/mo.design
- Search Console: https://search.google.com/search-console
