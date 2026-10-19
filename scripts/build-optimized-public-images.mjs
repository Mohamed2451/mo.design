/**
 * Generate fast, public WebP presentation copies during the Pages build.
 * NO Supabase writes, NO service-role credentials, NO changes to source files.
 * Supports only public objects hosted by this site's own Supabase project.
 */
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { fetchPublishedProjects } from './update-sitemap.mjs';

const MAX_SOURCE_BYTES = 16 * 1024 * 1024;
const MAX_OUTPUT_ITEMS = 200;
const OPTIMIZED_DIR = 'assets/optimized';

export function trustedPublicImage(source, supabaseBase) {
  try {
    const image = new URL(String(source));
    const owner = new URL(String(supabaseBase));
    return image.protocol === 'https:' && image.hostname === owner.hostname
      && image.port === owner.port && !image.username && !image.password
      && image.pathname.startsWith('/storage/v1/object/public/')
      && /\.(png|jpe?g|webp|avif)$/i.test(image.pathname);
  } catch { return false; }
}

export function optimizedMediaFilename(buffer) {
  return createHash('sha256').update(buffer).digest('hex').slice(0, 24) + '.webp';
}

async function boundedDownload(url, fetchImpl) {
  const response = await fetchImpl(url, {signal:AbortSignal.timeout(20000)});
  if (!response.ok) throw new Error('Image request HTTP ' + response.status);
  const type = String(response.headers.get('content-type') || '').split(';')[0].trim();
  if (!['image/jpeg','image/png','image/webp','image/avif'].includes(type))
    throw new Error('Not a raster image');
  const length = Number(response.headers.get('content-length'));
  if (length > MAX_SOURCE_BYTES) throw new Error('Source exceeds size limit');
  if (!response.body) throw new Error('No image response stream');
  let received = 0;
  const chunks = [];
  for await (const chunk of response.body) {
    received += chunk.length;
    if (received > MAX_SOURCE_BYTES) {
      await response.body.cancel?.().catch(()=>{});
      throw new Error('Source exceeds size limit');
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function loadSiteConfig(fetchImpl) {
  const contents = await readFile('config.js', 'utf8');
  const supabaseUrl = contents.match(/supabaseUrl:\s*['"]([^'"]+)['"]/)?.[1];
  const publicKey = contents.match(/supabasePublishableKey:\s*['"]([^'"]+)['"]/)?.[1];
  if (!supabaseUrl || !publicKey) throw new Error('Missing public Supabase config');
  const endpoint = new URL('rest/v1/site_settings', supabaseUrl.replace(/\/$/,'')+'/');
  endpoint.searchParams.set('select','profile_image_url');
  endpoint.searchParams.set('id','eq.1');
  endpoint.searchParams.set('limit','1');
  const response = await fetchImpl(endpoint,{
    headers:{apikey:publicKey,Accept:'application/json'},
    signal:AbortSignal.timeout(20000)
  });
  if (!response.ok) throw new Error('Public settings HTTP '+response.status);
  const rows = await response.json();
  if (!Array.isArray(rows)) throw new Error('Invalid public settings');
  return {supabaseUrl,profile:rows[0]?.profile_image_url||''};
}

export async function generateOptimizedImages({
  originals, supabaseUrl, root=process.cwd(), fetchImpl=fetch,
  sharpImpl, log=console.log
}) {
  const sharp = sharpImpl || (await import(pathToFileURL(resolve(process.env.MO_SHARP_MODULE||'node_modules/sharp/lib/index.js')).href)).default;
  const folder=join(root,OPTIMIZED_DIR);
  await mkdir(folder,{recursive:true});
  const manifest={};
  let originalBytes=0, optimizedBytes=0,errors=0;
  const eligible=[...new Set(originals)].filter(url=>trustedPublicImage(url,supabaseUrl)).slice(0,MAX_OUTPUT_ITEMS);
  // Low bounded concurrency so the hourly build remains predictable.
  let pointer=0;
  async function worker(){
    while(pointer<eligible.length){
      const i=pointer++;
      const url=eligible[i];
      try {
        const before=await boundedDownload(url,fetchImpl);
        const after=await sharp(before).rotate().resize({
          width: i===0?760:1150, withoutEnlargement:true, fit:'inside'
        }).webp({quality:77,effort:5}).toBuffer();
        if (after.length>=before.length*0.95) continue; // never transfer a larger copy
        const filename=optimizedMediaFilename(after);
        await writeFile(join(folder,filename),after);
        manifest[url]=filename;
        originalBytes+=before.length;
        optimizedBytes+=after.length;
      } catch(error) {
        errors++;
        log('Skipping a public image: '+String(error.message||error).slice(0,100));
      }
    }
  }
  await Promise.all(Array.from({length:Math.min(4,eligible.length)},worker));
  // The script is parser-loaded before the homepage JS; no extra network roundtrip
  // to fetch a manifest after the original PNG has already started downloading.
  const js='window.MO_OPTIMIZED_IMAGES='+JSON.stringify(manifest)+';\n';
  await writeFile(join(folder,'manifest.js'),js,'utf8');
  log('WebP results: '+Object.keys(manifest).length+' / '+eligible.length+
    ' public images; input '+originalBytes+' bytes, output '+optimizedBytes+
    ' bytes; failed '+errors+'. Originals untouched.');
  return {manifest, originalBytes, optimizedBytes, errors};
}

export async function main() {
  const [{supabaseUrl,profile},projects]=await Promise.all([
    loadSiteConfig(fetch),fetchPublishedProjects()
  ]);
  const originalList=[profile,...projects.map(item=>item.image_url).filter(Boolean)].filter(Boolean);
  return generateOptimizedImages({originals:originalList,supabaseUrl});
}
if (process.argv[1] && import.meta.url===pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(error=>{console.error(error.message);process.exitCode=1;});
}
