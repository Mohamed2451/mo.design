/**
 * Build GitHub Pages sitemap from PUBLIC, published Supabase projects only.
 * Does not use a service-role key and never writes to Supabase.
 * Run: node scripts/update-sitemap.mjs
 */
import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { projectUrl, syncProjectPages } from './project-seo.mjs';

export const SITE = 'https://mohamed2451.github.io/mo.design/';
export const STATIC_PAGES = Object.freeze([
  '', 'privacy.html', 'terms.html', 'copyright.html',
  'learning.html',
  'services/social-media/', 'services/video-motion/',
  'services/ai-creative/', 'services/branding/',
  'services/prompt-engineering/'
]);

export function publishedProjectLinks(records) {
  if (!Array.isArray(records)) throw new Error('Supabase did not return a project array');
  const slugs = new Set();
  for (const project of records) {
    if (project?.is_published !== true || typeof project.slug !== 'string') continue;
    const slug = project.slug.trim().normalize('NFC');
    if (!slug || slug.length > 256 || /[\\/\x00-\x1f\x7f]/.test(slug)) continue;
    slugs.add(slug);
  }
  return [...slugs].sort((a, b) => a.localeCompare(b, 'en'))
    .map(slug => projectUrl(slug)).filter(Boolean);
}

export function sitemapXML(records) {
  const urls = [...STATIC_PAGES.map(path => SITE + path), ...publishedProjectLinks(records)];
  const escape = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  return '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map(url => '  <url><loc>' + escape(url) + '</loc></url>').join('\n') +
    '\n</urlset>\n';
}

function publicConfig(source) {
  const url = source.match(/supabaseUrl:\s*['"]([^'"]+)['"]/);
  const key = source.match(/supabasePublishableKey:\s*['"]([^'"]+)['"]/);
  if (!url || !key) throw new Error('Missing public Supabase configuration');
  return { url: url[1], key: key[1] };
}

export async function fetchPublishedProjects({ fetchImpl = fetch, configText } = {}) {
  const { url, key } = publicConfig(configText ?? await readFile('config.js', 'utf8'));
  const all = [];
  const pageSize = 500;
  for (let offset = 0; offset <= 50000; offset += pageSize) {
    const endpoint = new URL('rest/v1/projects', url.replace(/\/$/, '') + '/');
    endpoint.searchParams.set('select', 'slug,is_published,title_ar,title_en,summary_ar,summary_en,objective_ar,image_url');
    endpoint.searchParams.set('is_published', 'eq.true');
    endpoint.searchParams.set('order', 'slug.asc');
    endpoint.searchParams.set('limit', String(pageSize));
    endpoint.searchParams.set('offset', String(offset));
    const response = await fetchImpl(endpoint, {
      headers: { apikey: key, Accept: 'application/json' },
      signal: AbortSignal.timeout(20000)
    });
    if (!response.ok) throw new Error('Supabase public projects fetch failed (HTTP ' + response.status + ')');
    const rows = await response.json();
    if (!Array.isArray(rows)) throw new Error('Supabase response was not a project list');
    all.push(...rows);
    // Public RLS may return only published rows; never read or write private content.
    if (rows.length < pageSize) break;
    if (offset === 50000) throw new Error('Project pagination safety limit reached');
  }
  // Fail closed: never overwrite a working sitemap with an empty one if RLS/network changes.
  if (!publishedProjectLinks(all).length) throw new Error('No published projects returned; sitemap unchanged');
  return all;
}

async function main() {
  const projects = await fetchPublishedProjects();
  await syncProjectPages(projects);
  const xml = sitemapXML(projects);
  const destination = resolve('sitemap.xml');
  const old = await readFile(destination, 'utf8').catch(() => '');
  if (old !== xml) await writeFile(destination, xml, 'utf8');
  console.log('Sitemap checked: ' + publishedProjectLinks(projects).length + ' published projects; ' +
    (old === xml ? 'no change' : 'updated'));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
