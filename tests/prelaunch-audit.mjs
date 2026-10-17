import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL('../'+path, import.meta.url), 'utf8');

test('contact form contains consent, required fields and spam honeypot', () => {
  const html = read('index.html');
  for (const field of ['name', 'email', 'service', 'message', 'privacy_ack', 'website'])
    assert.match(html, new RegExp('name="'+field+'"'), 'missing contact field '+field);
  assert.match(html, /name="privacy_ack" required/, 'privacy consent is required');
  const app = read('assets/app.js');
  assert.match(app, /if\(f\.get\('website'\)\) return/, 'honeypot is checked');
  assert.match(app, /await sendInquiry\(vals\)/, 'contact form sends to backend');
  assert.match(app, /form\.reportValidity\(\)/, 'browser form validation is used');
});

test('contact API and schema support all visible fields', () => {
  const api = read('assets/api.js');
  const schema = read('supabase/schema.sql');
  const v5 = read('supabase/migrations/003_v5_portfolio.sql');
  const v9 = read('supabase/migrations/004_v9_cms.sql');
  for (const field of ['sender_name','sender_email','service_type','message',
    'sender_phone','company','budget','desired_timeline','reference_url']) {
    assert.ok(api.includes(field), 'missing API field '+field);
    assert.ok((schema+v5+v9).includes(field), 'missing DB migration field '+field);
  }
});

test('admin login and database row-level controls remain present', () => {
  const html = read('admin.html');
  const api = read('assets/api.js');
  const sql = read('supabase/schema.sql');
  assert.match(html, /name="robots" content="noindex,nofollow"/);
  assert.match(api, /auth\.getUser\(\)/);
  assert.match(api, /from\('admin_users'\)/);
  for (const table of ['projects','services','inquiries','site_settings','testimonials'])
    assert.match(sql, new RegExp('alter table public\\.'+table+' enable row level security','i'));
  assert.match(sql, /public submits inquiries/);
  assert.match(sql, /admin reads inquiries/);
  assert.match(sql, /is_portfolio_admin\(\)/);
});

test('published-only SEO and privacy-safe web crawler rules remain in place', () => {
  const xml = read('sitemap.xml');
  const robots = read('robots.txt');
  const generator = read('scripts/update-sitemap.mjs');
  const prerender = read('scripts/project-seo.mjs');
  assert.match(xml, /<urlset/);
  assert.match(robots, /Disallow: \/mo\.design\/admin\.html/);
  assert.match(robots, /Sitemap: https:\/\/mohamed2451\.github\.io\/mo\.design\/sitemap\.xml/);
  assert.match(generator, /is_published.*eq\.true/);
  assert.match(prerender, /item\.is_published !== true/);
  assert.match(prerender, /rel="canonical"/);
});

test('new projects open before the SEO build runs', () => {
  assert.match(read('assets/app.js'), /return `\.\/project\.html\?slug=/);
  assert.match(read('assets/service-dynamic.js'), /project\.html\?slug=/);
});

test('academy is independent of unrelated CMS queries and displays errors', () => {
  const academy = read('assets/learning-page.js');
  assert.match(academy, /readPublicRows\('learning_items'/);
  assert.match(academy, /readPublicRows\('site_settings'/);
  assert.doesNotMatch(academy, /getPublicContent\(/);
  assert.match(academy, /copy\[lang\]\.error/);
});
