export const SERVICE_PAGE_KEY='service_pages_config_json';
export const SERVICE_PAGES=[
 {slug:'social-media',category:'Social Media Ads',ar:'تصاميم السوشيال والإعلانات',en:'Social media & advertising'},
 {slug:'video-motion',category:'Reels & Podcast Editing',ar:'مونتاج الريلز والبودكاست',en:'Video editing'},
 {slug:'ai-creative',category:'AI Visuals & Concepts',ar:'تصميم وإنتاج بالذكاء الاصطناعي',en:'AI creative'},
 {slug:'prompt-engineering',category:'AI Visuals & Concepts',ar:'البرومبتات',en:'Prompts'},
 {slug:'branding',category:'Branding & Identity',ar:'الهوية البصرية',en:'Branding'}
];
export function serviceConfig(settings){
 let saved={};try{saved=JSON.parse(settings?.content_ar?.[SERVICE_PAGE_KEY]||'{}')||{}}catch{}
 return Object.fromEntries(SERVICE_PAGES.map(p=>{
 const cfg=saved[p.slug]||{};
 const categories=Array.isArray(cfg.categories)?cfg.categories.slice(0,25).map((c,i)=>({
  id:String(c.id||'group-'+i).replace(/[^a-z0-9-]/gi,'').slice(0,65),
  ar:String(c.ar||'').trim().slice(0,75),en:String(c.en||'').trim().slice(0,75),
  enabled:c.enabled!==false
 })).filter(c=>c.id&&(c.ar||c.en)):[];
 return [p.slug,{categories,columns:[2,3,4].includes(Number(cfg.columns))?Number(cfg.columns):3,
 ratio:['square','portrait','landscape','original'].includes(cfg.ratio)?cfg.ratio:'landscape',
 title_ar:String(cfg.title_ar||'').slice(0,150),title_en:String(cfg.title_en||'').slice(0,150),
 description_ar:String(cfg.description_ar||'').slice(0,600),description_en:String(cfg.description_en||'').slice(0,600)}];
 }));
}
export function projectVideoUrls(project){
 const value=project?.gallery_captions?.__project_videos;
 return Array.isArray(value)?value.filter(v=>typeof v==='string'&&/^https:\/\//i.test(v)).slice(0,8):[];
}
export function projectServiceGroups(project,slug){
 const map=project?.gallery_captions?.__service_groups;
 return Array.isArray(map?.[slug])?map[slug].filter(x=>typeof x==='string'):[];
}
