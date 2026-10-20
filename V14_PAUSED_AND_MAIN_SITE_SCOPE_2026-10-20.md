# Mo Design — Handoff — 20 October 2026

## Owner decision
**STOP all development of V14** until specifically requested again. Do not merge mo-design-v14-dev or deploy the experiment to the live website. The branch remains available for later review.

## V14 experimental work
- Redesigned experimental homepage/Hero, motion chapter, color/typography iterations, fixes for blank sections and image placeholders.
- Isolated browser-local dashboard for stats, fictional team members, videos, course catalogue, promo codes, learner works, student reviews and academy.
- Simulated purchasing, fake manual transfer, approval, sample courses/lessons, progress, assignments, student review.
- **No real user authentication, real payment, shared database or paid content protection.**
- Preview: https://mo-design-v14-dev.mo-design-v13-preview.pages.dev/
- None of V14 was merged to main. Design did not meet the owner's expectations.

## New approved scope — original production site
- Restore stronger project/gallery appearance without text overlaps.
- Team section: add/edit/remove/order/show/hide members, name and role AR/EN, image upload, link, CMS controls.
- General video section for homepage AND free academy, individual show/hide and destination switches, title/description AR/EN, thumbnail, YouTube or MP4/WebM, optional uploads. No autoplay or eager downloads.
- Keep existing Mo Design brand, personal portrait, logo, mobile experience, Arabic/English, Light/Dark.
- Do NOT build paid academy, account, payment functionality now.

## Safe delivery strategy
- Starting main commit: 520964249238a09e12774e0d09ceaa6b8cbb19bb
- Isolated branch: mo-design-main-team-media-20261020 (from main, not V14).
- Original CMS and existing Supabase site_settings.content_ar are reused. New key: mo_studio_sections_v1. No migrations or real database writes during GitHub edits.
- Team/video sections hidden by default until enabled in CMS.
- QA needed: CI tests, CMS operations, playback and mobile/light/dark/AR/EN, production release only after approval.

## Pending launch
Finish tests, review original-site result, get owner approval before merging into protected main, then verify the deployed live site.
