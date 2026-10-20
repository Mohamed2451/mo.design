import {readStudio,safeStudioUrl} from './studio-config.js';
import {isStudioPreviewHost,isPreviewMediaRef,resolveStudioPreviewMedia} from './studio-preview-media.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function teamCard(x){
 const lang=document.documentElement.lang==='en'?'en':'ar';
 const name=x['name_'+lang]||x.name_ar||'',role=x['role_'+lang]||x.role_ar||'';
 const image=safeStudioUrl(x.image_url),local=isStudioPreviewHost()&&isPreviewMediaRef(x.image_url)?x.image_url:'',link=safeStudioUrl(x.link_url);
 return '<article class="mo-studio-card"><figure>'+(image?'<img loading="lazy" decoding="async" src="'+esc(image)+'" alt="'+esc(name)+'">':local?'<img hidden data-preview-img="'+esc(local)+'" alt="'+esc(name)+'">':'<span class="mo-studio-monogram">'+esc(name.charAt(0))+'</span>')+'</figure><div class="mo-studio-card-body"><h3>'+esc(name)+'</h3><p>'+esc(role)+'</p>'+(link?'<a href="'+esc(link)+'" rel="noopener noreferrer" target="_blank">'+(lang==='ar'?'شوف أعماله ↗':'View portfolio ↗')+'</a>':'')+'</div></article>';
}
export function mountStudio({target}){
 if(!target)return;
 let settings=null;
 const render=()=>{
  const cfg=readStudio(settings),members=cfg.team.filter(x=>x.enabled).sort((a,b)=>(Number(a.sort_order)||0)-(Number(b.sort_order)||0));
  target.hidden=!(cfg.team_enabled&&members.length);
  if(target.hidden){target.replaceChildren();return}
  const english=document.documentElement.lang==='en';
  const copy=settings?.[english?'content_en':'content_ar']||{};
  const phrase=(key,fallback)=>typeof copy[key]==='string'&&copy[key].trim()?copy[key].trim():fallback;
  target.innerHTML='<section class="mo-studio-section" id="moTeam" aria-label="'+(english?'Meet the team':'فريق العمل')+'"><div class="container"><div class="eyebrow">MO DESIGN / PEOPLE</div><h2 class="mo-studio-title">'+(english?'People behind the work.':'فريقنا وراء كل تفصيلة.')+'</h2><p class="mo-studio-subtitle">'+(english?'Meet the people creating the work.':'تعرف على الناس اللي بتشتغل على الأفكار والتصاميم.')+'</p><div class="mo-studio-cards">'+members.map(teamCard).join('')+'</div></div></section>';
  if(isStudioPreviewHost())target.querySelectorAll('[data-preview-img]').forEach(async image=>{try{const url=await resolveStudioPreviewMedia(image.dataset.previewImg);if(url){image.src=url;image.hidden=false}}catch(err){console.warn('Preview team photo unavailable',err)}});
 };
 const refresh=async()=>{
  try{
   if(isStudioPreviewHost()){
    const {readDemo}=await import('./data.js');
    const local=readDemo()?.settings;
    if(local?.content_ar?.mo_studio_sections_v1){settings=local;render();return}
   }
   const {readPublicRows}=await import('./public-content-reader.js');
   settings=(await readPublicRows('site_settings',{eq:{id:1},limit:1}))?.[0]||null;render();
  }catch(error){console.warn('Team section unavailable',error)}
 };
 void refresh();
 document.getElementById('langToggle')?.addEventListener('click',()=>setTimeout(render,0));
 window.addEventListener('storage',event=>{if(event.key?.includes('mo_design_portfolio_demo'))void refresh()});
}
