// Real-site team and public video sections; stored in existing site_settings.content_ar JSONB.
// No new Supabase tables, schema migration, or V14 demo data.
export const STUDIO_KEY = 'mo_studio_sections_v1';
export const emptyStudio = () => ({
  team_enabled:false,
  site_videos_enabled:false,
  academy_videos_enabled:false,
  team:[],
  videos:[]
});
export function readStudio(settings) {
  let src=settings?.content_ar?.[STUDIO_KEY];
  if(typeof src==='string'){try{src=JSON.parse(src)}catch{src=null}}
  if(!src||typeof src!=='object'||Array.isArray(src))return emptyStudio();
  const clean=(rows,limit)=>Array.isArray(rows)?rows.filter(r=>r&&typeof r==='object'&&!Array.isArray(r)).slice(0,limit):[];
  return {
    team_enabled:src.team_enabled===true,
    site_videos_enabled:src.site_videos_enabled===true,
    academy_videos_enabled:src.academy_videos_enabled===true,
    team:clean(src.team,30),
    videos:clean(src.videos,60)
  };
}
export const safeStudioUrl = value => {
  try {
    if(!value||typeof value!=='string')return '';
    const u=new URL(value,location.href);
    return u.protocol==='https:' || (u.origin===location.origin && u.protocol==='http:') ? u.href : '';
  }catch{return '';}
};
export const isYouTube = value => {
  try {
    const u=new URL(value);
    const host=u.hostname.toLowerCase();
    if(!['youtube.com','www.youtube.com','m.youtube.com','youtu.be','www.youtu.be'].includes(host))return '';
    const id=host.endsWith('youtu.be')?u.pathname.slice(1).split('/')[0]:(u.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1]||u.searchParams.get('v')||'');
    return /^[a-zA-Z0-9_-]{11}$/.test(id)?id:'';
  }catch{return '';}
};
