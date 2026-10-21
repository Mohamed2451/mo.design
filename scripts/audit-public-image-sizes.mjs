/**
 * Read-only, public image-transfer audit for Mo Design.
 * Runs on GitHub Actions. No credentials, user records, or content are logged.
 * Only prints media type and transfer size for already-published images.
 */
import {readFile} from 'node:fs/promises';
const config=await readFile('config.js','utf8');
const url=config.match(/supabaseUrl:\s*['"]([^'"]+)['"]/)?.[1];
const key=config.match(/supabasePublishableKey:\s*['"]([^'"]+)['"]/)?.[1];
if(!url||!key)throw new Error('Public project config missing');
const root=new URL(url);
const api=async(table,params)=>{
  const endpoint=new URL('rest/v1/'+table,root);
  endpoint.searchParams.set('select',params);
  if(table==='projects')endpoint.searchParams.set('is_published','eq.true');
  if(table==='site_settings')endpoint.searchParams.set('id','eq.1');
  endpoint.searchParams.set('limit','20');
  const res=await fetch(endpoint,{headers:{apikey:key,Accept:'application/json'},signal:AbortSignal.timeout(15000)});
  if(!res.ok)throw Error('Public data fetch failed for '+table+' HTTP '+res.status);
  return res.json();
};
const [settings,projects]=await Promise.all([api('site_settings','profile_image_url'),api('projects','image_url,is_published')]);
const list=[{kind:'hero-profile',url:settings[0]?.profile_image_url},...projects.map((p,i)=>({kind:'project-image-'+(i+1),url:p.image_url}))];
const results=[];
for(const item of list){
 if(!item.url)continue;
 let address;
 try{address=new URL(item.url,new URL('https://mohamed2451.github.io/mo.design/'))}catch{continue}
 if(address.protocol!=='https:'&&address.protocol!=='http:')continue;
 // Only metadata for the project's known public Supabase media host.
 if(address.hostname!==root.hostname){results.push({kind:item.kind,host:address.hostname,bytes:'external-not-measured'});continue}
 if(!address.pathname.startsWith('/storage/v1/object/public/'))continue;
 try{
  const res=await fetch(address,{method:'HEAD',signal:AbortSignal.timeout(12000)});
  results.push({kind:item.kind,status:res.status,bytes:Number(res.headers.get('content-length'))||null,contentType:res.headers.get('content-type')});
 }catch(error){results.push({kind:item.kind,error:error.name})}
}
console.log('PUBLIC IMAGE SIZE AUDIT: '+JSON.stringify(results));
console.log('TOTAL KNOWN BYTES:',results.reduce((sum,x)=>sum+(x.bytes||0),0));
