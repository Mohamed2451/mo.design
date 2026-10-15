// Single source of truth for the default tool cards and their editable CMS values.
// Stored under site_settings.content_ar.tools_catalog_json to avoid a schema migration.
export const DEFAULT_TOOLS=[
 {id:'photoshop',name:'Adobe Photoshop',ar:'تصميم الإعلانات وتعديل الصور',en:'Design and photo retouching',image_url:'./assets/icons/photoshop.svg',enabled:true},
 {id:'illustrator',name:'Adobe Illustrator',ar:'الشعارات والهوية البصرية',en:'Logos and vector identities',image_url:'./assets/icons/illustrator.svg',enabled:true},
 {id:'premiere',name:'Adobe Premiere Pro',ar:'مونتاج الفيديوهات والريلز',en:'Video and reels editing',image_url:'./assets/icons/premiere.svg',enabled:true},
 {id:'resolve',name:'DaVinci Resolve',ar:'مونتاج وتصحيح الألوان',en:'Editing and color grading',image_url:'./assets/icons/resolve.png',enabled:true},
 {id:'capcut',name:'CapCut',ar:'مونتاج المقاطع القصيرة',en:'Short-form editing',image_url:'./assets/icons/capcut.png',enabled:true},
 {id:'higgsfield',name:'Higgsfield',ar:'إنشاء فيديوهات وصور بالذكاء الاصطناعي',en:'AI image and video creation',image_url:'./assets/icons/higgsfield.png',enabled:true},
 {id:'flow',name:'Google Flow',ar:'صناعة فيديوهات بالذكاء الاصطناعي',en:'AI video creation',image_url:'./assets/icons/flow.png',enabled:true}
];
export const TOOLS_CATALOG_KEY='tools_catalog_json';
export function normalizeTools(value){
 if(!Array.isArray(value))return DEFAULT_TOOLS.map(x=>({...x}));
 return value.slice(0,40).filter(x=>x&&typeof x==='object').map((x,i)=>({
  id:String(x.id||'tool-'+i).slice(0,90),
  name:String(x.name||'').trim().slice(0,100),
  ar:String(x.ar||'').trim().slice(0,250),
  en:String(x.en||'').trim().slice(0,250),
  image_url:String(x.image_url||'').trim().slice(0,1200),
  enabled:x.enabled!==false
 })).filter(x=>x.name);
}
export function getToolsCatalog(settings){
 const raw=settings?.content_ar?.[TOOLS_CATALOG_KEY];
 if(typeof raw!=='string')return normalizeTools(undefined);
 try{return normalizeTools(JSON.parse(raw));}
 catch{return normalizeTools(undefined)}
}
