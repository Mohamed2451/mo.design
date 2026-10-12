# Mo Design V10 — Creative Portfolio + CMS

موقع محمد محمود، صفحة Portfolio احترافية بالعربية المصرية والإنجليزية، Dark/Light، ولوحة تحكم عربية مدعومة بـ Supabase.

**روابط:** [الموقع](https://mohamed2451.github.io/mo.design/) · [المستودع](https://github.com/Mohamed2451/mo.design) · [لوحة الإدارة](https://mohamed2451.github.io/mo.design/admin.html)

## V10 highlights

- New branded admin dashboard with meaningful, real CMS counts and actions.
- Homepage headline/description editable directly from the content editor.
- Education section with hidden / coming soon / publishing modes.
- Editable Arabic & English copy for both education launch stages.
- Education library: drafts, published videos, YouTube Shorts, local MP4/WebM upload, articles, ordering.
- Entirely redesigned CMS shell, Arabic navigation, desktop/mobile layout, dark/light control.
- Supabase `learning_items` table protected with RLS; public visitors only see published content.
- Separate public `portfolio-video` storage bucket limited to 45 MiB per file.
- Existing projects, image storage, services, inquiry tracking, testimonials and bilingual views retained.

## Deploy / migration

**Start with [ابدأ-هنا-V10.md](./ابدأ-هنا-V10.md).** Apply the additive migration `supabase/migrations/005_v10_learning_studio.sql` to your existing Supabase project before publishing the V10 site files. Do not rerun old schema files on an existing database.

Run locally with `python -m http.server 8000` then navigate to `/admin.html` and `/`.

Existing Supabase browser config uses a **publishable/public** key, never a secret/service_role key. Use `admin_users` + RLS for write authorization.

## Limitations

- No payment system, paid course gating or subscriber accounts are provided in V10.
- Direct video upload is constrained to 45 MiB **and by Supabase quota**; use YouTube for lengthy videos.
- Design/layout code changes still require GitHub deployment. Editing existing text, media, content and publish states does not.
- This package is prepared for upload; the live database and deployed GitHub Pages site were not modified by creating the ZIP.
