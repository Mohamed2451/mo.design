import test from 'node:test';
import assert from 'node:assert/strict';
import { sitemapXML, publishedProjectLinks, fetchPublishedProjects } from '../scripts/update-sitemap.mjs';

test('only published valid slugs appear in sitemap', () => {
  const projects=[
    {slug:'red-bull',is_published:true},
    {slug:'hidden',is_published:false},
    {slug:'حملة رمضان',is_published:true},
    {slug:'bad/slug',is_published:true}
  ];
  const xml=sitemapXML(projects);
  assert.match(xml,/projects\/red-bull\//);
  assert.match(xml,/projects\//);
  assert.doesNotMatch(xml,/hidden|bad\/slug/);
  assert.match(xml, /<urlset xmlns=/, 'valid sitemap root');
  assert.equal(publishedProjectLinks(projects).length,1);
});
test('unsafe empty API data never rewrites sitemap', async () => {
  await assert.rejects(fetchPublishedProjects({
    configText:`window.PORTFOLIO_CONFIG={supabaseUrl:'https://example.supabase.co',supabasePublishableKey:'publishable'}`,
    fetchImpl:async()=>({ok:true,json:async()=>[]})
  }),/No published projects/);
});

test('static SEO page embeds a unique project heading and canonical URL', async () => {
 const { renderProjectPage } = await import('../scripts/project-seo.mjs');
 const { readFile } = await import('node:fs/promises');
 const template = await readFile('project.html','utf8');
 const page = renderProjectPage(template,{
  slug:'test-project',is_published:true,title_ar:'مشروع تجريبي',summary_ar:'تفاصيل المشروع',image_url:'https://example.org/image.png'
 });
 assert.match(page, /مشروع تجريبي \| مو ديزاين Mo Design/);
 assert.match(page, /<h1 class="case-title">مشروع تجريبي<\/h1>/);
 assert.match(page, /projects\/test-project\//);
 assert.match(page, /data-project-slug="test-project"/);
 assert.match(page, /<base href="\.\.\/\.\.\/"/);
});
