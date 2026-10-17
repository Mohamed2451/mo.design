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
  assert.match(xml,/project.html\?slug=red-bull/);
  assert.match(xml,/project.html\?slug=%D8%AD/);
  assert.doesNotMatch(xml,/hidden|bad\/slug/);
  assert.match(xml, /<urlset xmlns=/, 'valid sitemap root');
  assert.equal(publishedProjectLinks(projects).length,2);
});
test('unsafe empty API data never rewrites sitemap', async () => {
  await assert.rejects(fetchPublishedProjects({
    configText:`window.PORTFOLIO_CONFIG={supabaseUrl:'https://example.supabase.co',supabasePublishableKey:'publishable'}`,
    fetchImpl:async()=>({ok:true,json:async()=>[]})
  }),/No published projects/);
});
