-- MO DESIGN / PHASE 1 — Supabase SQL Editor
-- Run once in a new Supabase project. No private credential is stored in the repo.
-- Security: browser uses ONLY a publishable key; RLS enforces privileged writes.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id smallint primary key default 1 check (id=1),
  brand_ar text not null default 'Mo Design',
  brand_en text not null default 'Mo Design',
  personal_name text not null default 'Mohamed Mahmoud',
  role_ar text not null default 'مصمم جرافيك ومونتير فيديو | إعلانات سوشيال • موشن • AI Visuals',
  role_en text not null default 'Graphic Designer & Video Editor | Social Ads • Motion • AI Visuals',
  headline_ar text not null default E'الخيال يتصمّم.\nوالأفكار تتحرّك.',
  headline_en text not null default E'MAKE IT BOLD.\nMAKE IT MOVE.',
  subheadline_ar text not null default 'أنا محمد محمود، مصمم جرافيك ومونتير. بساعد البراندات تحوّل أفكارها لإعلانات وتصاميم وفيديوهات إبداعية بتلفت الانتباه وتخدم أهدافها.',
  subheadline_en text not null default 'I’m Mohamed Mahmoud, a graphic designer and video editor crafting scroll-stopping campaigns, motion and AI-powered visuals that help brands stand out.',
  bio_ar text not null default 'مصمم جرافيك ومونتير شغوف بدمج الإبداع البصري مع أحدث أدوات الذكاء الاصطناعي التوليدي. أساعد العلامات التجارية وأصحاب الأعمال على ابتكار هويات وحملات إعلانية بصرية تترك أثرًا وتهدف لزيادة التفاعل والمبيعات.',
  bio_en text not null default 'I’m a graphic designer and video editor passionate about blending visual creativity with generative AI. I help brands create distinctive identities and campaigns designed to make an impact.',
  contact_email text not null default '',
  whatsapp_url text not null default 'https://wa.me/201015000036',
  community_url text not null default 'https://chat.whatsapp.com/HvJGMrahSBFBmCxRMxD2Z5',
  tiktok_url text not null default 'https://www.tiktok.com/@mohamedmahmoud30',
  facebook_url text not null default 'https://www.facebook.com/Mohame.Mahmoud11',
  instagram_url text not null default 'https://www.instagram.com/mo.design.official',
  behance_url text not null default 'https://www.behance.net/mode5',
  linkedin_url text not null default 'https://www.linkedin.com/in/mohamed-mahmoud-97638a211/',
  availability boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_ar text not null,
  title_en text not null,
  category_ar text not null,
  category_en text not null,
  summary_ar text not null default '',
  summary_en text not null default '',
  cover_style text not null default 'aurora' check (cover_style in ('aurora','type','orbit','pop')),
  image_url text not null default '',
  external_url text not null default '',
  featured boolean not null default false,
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  title_ar text not null,
  title_en text not null,
  description_ar text not null default '',
  description_en text not null default '',
  icon text not null default 'sparkles',
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  sender_name text not null check (char_length(sender_name) between 2 and 120),
  sender_email text not null check (char_length(sender_email) between 5 and 200),
  service_type text not null check (char_length(service_type) between 1 and 200),
  message text not null check (char_length(message) between 10 and 4000),
  status text not null default 'new' check (status in ('new','read')),
  created_at timestamptz not null default now()
);

insert into public.site_settings (id) values (1) on conflict (id) do nothing;

-- Default genuine service offerings. No example work is passed off as a real client campaign.
insert into public.services (title_ar,title_en,description_ar,description_en,icon,sort_order,is_published) values
('إعلانات السوشيال ميديا','Social Media & High-Converting Ads','بوستات وتصاميم وحملات بصرية جذّابة، مصممة عشان تلفت الانتباه وتساعد في رفع التحويلات.','Attention-grabbing posts and campaigns designed to stop the scroll and support conversions.','target',1,true),
('مونتاج الفيديو والموشن جرافيكس','Video Editing & Motion Graphics','ريلز وإعلانات وموشن جرافيكس باستخدام Premiere Pro وDaVinci Resolve وAfter Effects.','Reels, ads and motion graphics crafted with Premiere Pro, DaVinci Resolve and After Effects.','play',2,true),
('تصميم وإنتاج بالذكاء الاصطناعي','AI-Powered Creative Production','صور وفيديوهات ومفاهيم إعلانية جديدة بأدوات الذكاء الاصطناعي التوليدي مع إشراف فني مدروس.','AI-powered campaign visuals, videos and concepts with thoughtful art direction.','sparkles',3,true),
('هوية بصرية وحملات متكاملة','Branding & Campaign Art Direction','إدارة الشكل البصري للحملة من الفكرة والاتجاه الفني لحد الملفات النهائية الجاهزة للنشر.','Visual direction for campaigns from concept to production-ready assets.','diamond',4,true);

-- Portfolio intentionally starts EMPTY in the live database; upload original work from dashboard.
-- The CSS preview cards are only included in offline demo mode.


-- RLS applied to EVERY table reachable via the browser API.
alter table public.admin_users enable row level security;
alter table public.site_settings enable row level security;
alter table public.projects enable row level security;
alter table public.services enable row level security;
alter table public.inquiries enable row level security;

-- Admin membership is created ONLY in the SQL Editor (not by client users).
revoke all on public.admin_users from anon,authenticated;
grant select on public.admin_users to authenticated;
create policy "users see own admin membership" on public.admin_users
  for select to authenticated using ((select auth.uid()) = user_id);

create or replace function public.is_portfolio_admin()
returns boolean
language sql stable security definer
set search_path = ''
as $$ select exists (select 1 from public.admin_users where user_id = (select auth.uid())); $$;
revoke all on function public.is_portfolio_admin() from public;
grant execute on function public.is_portfolio_admin() to authenticated;

-- Public reads only public-facing settings and published projects/services.
revoke all on public.site_settings,public.projects,public.services from anon,authenticated;
grant select on public.site_settings,public.projects,public.services to anon,authenticated;
grant update on public.site_settings to authenticated;
grant insert,update,delete on public.projects,public.services to authenticated;

create policy "public settings" on public.site_settings
  for select to anon,authenticated using (true);
create policy "admin changes settings" on public.site_settings
  for update to authenticated using (public.is_portfolio_admin()) with check (public.is_portfolio_admin());

create policy "public published projects" on public.projects
  for select to anon,authenticated using (is_published = true);
create policy "admin sees all projects" on public.projects
  for select to authenticated using (public.is_portfolio_admin());
create policy "admin inserts projects" on public.projects
  for insert to authenticated with check (public.is_portfolio_admin());
create policy "admin updates projects" on public.projects
  for update to authenticated using (public.is_portfolio_admin()) with check (public.is_portfolio_admin());
create policy "admin deletes projects" on public.projects
  for delete to authenticated using (public.is_portfolio_admin());

create policy "public published services" on public.services
  for select to anon,authenticated using (is_published = true);
create policy "admin sees all services" on public.services
  for select to authenticated using (public.is_portfolio_admin());
create policy "admin inserts services" on public.services
  for insert to authenticated with check (public.is_portfolio_admin());
create policy "admin updates services" on public.services
  for update to authenticated using (public.is_portfolio_admin()) with check (public.is_portfolio_admin());
create policy "admin deletes services" on public.services
  for delete to authenticated using (public.is_portfolio_admin());

-- Visitors can ONLY submit the four input columns; they cannot see submissions,
-- choose status, change timestamps, or read other visitors' messages.
revoke all on public.inquiries from anon,authenticated;
grant insert (sender_name,sender_email,service_type,message) on public.inquiries to anon,authenticated;
grant select,delete on public.inquiries to authenticated;
grant update (status) on public.inquiries to authenticated;
create policy "public submits inquiries" on public.inquiries
  for insert to anon,authenticated with check (status = 'new');
create policy "admin reads inquiries" on public.inquiries
  for select to authenticated using (public.is_portfolio_admin());
create policy "admin changes inquiry status" on public.inquiries
  for update to authenticated using (public.is_portfolio_admin()) with check (public.is_portfolio_admin());
create policy "admin deletes inquiries" on public.inquiries
  for delete to authenticated using (public.is_portfolio_admin());

-- IMPORTANT: In Supabase Authentication > Users create an admin user, then run:
-- insert into public.admin_users (user_id) values ('PASTE-AUTH-USER-UUID-HERE');
-- DO NOT add open signup or expose any secret/service-role key in browser source.
-- Before high-traffic launch, add CAPTCHA / rate limiting to the contact endpoint.
