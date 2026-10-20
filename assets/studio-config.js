// Team-only settings on the original site. Existing site_settings.content_ar JSONB.
export const STUDIO_KEY='mo_studio_sections_v1';
export const emptyStudio=()=>({team_enabled:false,team:[]});
export function readStudio(settings){
 let value=settings?.content_ar?.[STUDIO_KEY];
 if(typeof value==='string'){try{value=JSON.parse(value)}catch{value=null}}
 if(!value||typeof value!=='object'||Array.isArray(value))return emptyStudio();
 return {team_enabled:value.team_enabled===true,team:Array.isArray(value.team)?value.team.filter(x=>x&&typeof x==='object'&&!Array.isArray(x)).slice(0,30):[]};
}
export const safeStudioUrl=value=>{
 try{if(!value||typeof value!=='string')return '';const url=new URL(value,location.href);return url.protocol==='https:'||(url.origin===location.origin&&url.protocol==='http:')?url.href:''}catch{return ''}
};
