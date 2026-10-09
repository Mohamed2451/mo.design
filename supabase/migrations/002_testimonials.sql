-- Run in Supabase SQL Editor ONLY if you installed an older MO Design database.
-- This migration adds the new reviews management section; only verified reviews appear publicly.
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  author_ar text not null, author_en text not null,
  job_ar text not null default '', job_en text not null default '',
  quote_ar text not null, quote_en text not null,
  rating integer not null default 0 check (rating between 0 and 5),
  is_verified boolean not null default false, is_published boolean not null default false,
  sort_order integer not null default 0, created_at timestamptz not null default now()
);
alter table public.testimonials enable row level security;
revoke all on public.testimonials from anon,authenticated;
grant select on public.testimonials to anon,authenticated;
grant insert,update,delete on public.testimonials to authenticated;
create policy "public verified published testimonials" on public.testimonials
  for select to anon,authenticated using (is_published = true and is_verified = true);
create policy "admin sees all testimonials" on public.testimonials
  for select to authenticated using (public.is_portfolio_admin());
create policy "admin inserts testimonials" on public.testimonials
  for insert to authenticated with check (public.is_portfolio_admin());
create policy "admin updates testimonials" on public.testimonials
  for update to authenticated using (public.is_portfolio_admin()) with check (public.is_portfolio_admin());
create policy "admin deletes testimonials" on public.testimonials
  for delete to authenticated using (public.is_portfolio_admin());
update public.site_settings set whatsapp_url='https://wa.me/201097865616' where id=1;
