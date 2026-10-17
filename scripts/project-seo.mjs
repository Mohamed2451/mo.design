/**
 * Static, crawlable metadata shell for each published Mo Design project.
 * Uses only public data (no service-role secrets or private drafts).
 */
import { readFile, writeFile, mkdir, readdir, unlink, rmdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';

export const SITE_ROOT = 'https://mohamed2451.github.io/mo.design/';
const SAFE_SLUG = /^[a-zA-Z0-9_-]{1,140}$/;
export function projectPath(slug) {
  if (typeof slug !== 'string' || !SAFE_SLUG.test(slug)) return null;
  return 'projects/' + slug + '/';
}
export const projectUrl = slug => {
  const path = projectPath(slug);
  return path ? SITE_ROOT + path : null;
};
const html = x => String(x ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;')
  .replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');

const stripText = x => String(x || '')
  .replace(/<[^>]*>/g, ' ')
  .replace(/[#*_~\[\]\x60]/g, ' ')
  .replace(/\s+/g, ' ').trim();

function absoluteImage(value) {
  try {
    const url=new URL(String(value||''));
    return url.protocol === 'https:' ? url.href : '';
  } catch { return ''; }
}
export function renderProjectPage(template, item) {
  const slug=String(item?.slug||'').trim();
  const url=projectUrl(slug);
  if (!url || item.is_published !== true) throw new Error('Only published safe project slugs can be rendered');
  const title=stripText(item.title_ar || item.title_en || slug).slice(0,125);
  const description=(stripText(item.summary_ar || item.summary_en || item.objective_ar || '') ||
    'شاهد مشروع ' + title + ' ضمن أعمال مو ديزاين في التصميم والمونتاج وصناعة المحتوى البصري.').slice(0,230);
  const image=absoluteImage(item.image_url);
  const titleTag=title + ' | مو ديزاين Mo Design';
  const structured={
    '@context':'https://schema.org', '@type':'CreativeWork',
    name:title, description, url, inLanguage:'ar',
    creator:{'@type':'Person',name:'Mohamed Mahmoud',alternateName:'Mo Design'},
    ...(image?{image}: {})
  };
  const json=JSON.stringify(structured).replace(/</g,'\\u003c')
    .replace(/>/g,'\\u003e').replace(/&/g,'\\u0026');
  let result=template.replace('<head>','<head><base href="../../">')
    .replace(/<title>[^<]*<\/title>/, '<title>'+html(titleTag)+'</title>')
    .replace(/<meta name="description" content="[^"]*"\/>/,
      '<meta name="description" content="'+html(description)+'"/>')
    .replace('<body class="inner-page">',
      '<body class="inner-page" data-project-slug="'+html(slug)+'" data-seo-prerender="1">');
  const meta=[
    '<link rel="canonical" href="'+html(url)+'"/>',
    '<meta name="robots" content="index,follow"/>',
    '<meta property="og:type" content="article"/>',
    '<meta property="og:site_name" content="Mo Design"/>',
    '<meta property="og:locale" content="ar_EG"/>',
    '<meta property="og:title" content="'+html(titleTag)+'"/>',
    '<meta property="og:description" content="'+html(description)+'"/>',
    '<meta property="og:url" content="'+html(url)+'"/>',
    ...(image?['<meta property="og:image" content="'+html(image)+'"/>']:[]),
    '<meta name="twitter:card" content="'+(image?'summary_large_image':'summary')+'"/>',
    '<meta name="twitter:title" content="'+html(titleTag)+'"/>',
    '<meta name="twitter:description" content="'+html(description)+'"/>',
    '<script type="application/ld+json">'+json+'</script>'
  ].join('\n');
  result=result.replace('</head>',meta+'\n</head>');
  const cover=image?'<div class="case-lead-media"><img src="'+html(image)+'" alt="'+html(title)+'" loading="eager"></div>':'';
  const shell='<main class="case-main" id="dynamicProject"><section class="case-hero">'+
    '<span class="case-eyebrow">MO DESIGN / PORTFOLIO</span><h1 class="case-title">'+html(title)+'</h1>'+
    '<p class="case-seo-description">'+html(description)+'</p></section>'+cover+'</main>';
  result=result.replace(
    '<main class="case-main" id="dynamicProject"><section class="case-hero"><h1 class="case-title">جاري تحميل المشروع…</h1></section></main>',
    shell
  );
  if (!result.includes('data-seo-prerender="1"')||!result.includes(shell))
    throw new Error('Project HTML template changed; refused to generate SEO page');
  return result;
}
export async function syncProjectPages(items,{root=process.cwd()}={}) {
  if(!Array.isArray(items)) throw new Error('Missing project list');
  const projects=items.filter(p=>p.is_published===true&&projectPath(p.slug));
  if (!projects.length) throw new Error('No published projects; refusing to remove existing snapshots');
  const template=await readFile(join(root,'project.html'),'utf8');
  const baseDir=resolve(root,'projects');
  await mkdir(baseDir,{recursive:true});
  const desired=new Set();
  for(const p of projects) {
    const slug=p.slug;
    if(desired.has(slug))throw new Error('Duplicate project slug: '+slug);
    desired.add(slug);
    const folder=join(baseDir,slug);
    const target=join(folder,'index.html');
    const content=renderProjectPage(template,p);
    await mkdir(folder,{recursive:true});
    const previous=await readFile(target,'utf8').catch(()=>null);
    if(previous!==content)await writeFile(target,content,'utf8');
  }
  // Remove only files proven to be generated by this script when unpublished.
  for(const dir of await readdir(baseDir,{withFileTypes:true})) {
    if(!dir.isDirectory()||!SAFE_SLUG.test(dir.name)||desired.has(dir.name))continue;
    const target=join(baseDir,dir.name,'index.html');
    const previous=await readFile(target,'utf8').catch(()=>null);
    if(previous?.includes('data-seo-prerender="1"')){
      await unlink(target);
      await rmdir(join(baseDir,dir.name)).catch(()=>{});
    }
  }
  return desired.size;
}
