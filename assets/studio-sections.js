import {readStudio,safeStudioUrl,isYouTube} from './studio-config.js';
import {isStudioPreviewHost,isPreviewMediaRef,resolveStudioPreviewMedia} from './studio-preview-media.js';
const escapeText=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const state={lang:()=>document.documentElement.lang==='en'?'en':'ar'};
function teamCard(x){
 const lang=state.lang(),name=x['name_'+lang]||x.name_ar||'',role=x['role_'+lang]||x.role_ar||'',image=safeStudioUrl(x.image_url),local=isStudioPreviewHost()&&isPreviewMediaRef(x.image_url)?x.image_url:'',link=safeStudioUrl(x.link_url);
 return '<article class="mo-studio-card"><figure>'+(image?'<img loading="lazy" decoding="async" src="'+escapeText(image)+'" alt="'+escapeText(name)+'">':(local?'<img hidden data-preview-img="'+escapeText(local)+'" alt="'+escapeText(name)+'">':'<span class="mo-studio-monogram">'+escapeText(name.charAt(0))+'</span>'))+'</figure><div class="mo-studio-card-body"><h3>'+escapeText(name)+'</h3><p>'+escapeText(role)+'</p>'+(link?'<a href="'+escapeText(link)+'" rel="noopener noreferrer" target="_blank">'+(lang==='ar'?'شوف أعماله ↗':'View portfolio ↗')+'</a>':'')+'</div></article>';
}
function videoCard(x,i){
 const lang=state.lang(),title=x['title_'+lang]||x.title_ar||'',desc=x['description_'+lang]||x.description_ar||'',poster=safeStudioUrl(x.poster_url),local=isStudioPreviewHost()&&isPreviewMediaRef(x.poster_url)?x.poster_url:'';
 return '<button type="button" class="mo-studio-card mo-studio-video-card" data-studio-video="'+i+'"><figure>'+(poster?'<img loading="lazy" decoding="async" src="'+escapeText(poster)+'" alt="">':(local?'<img hidden data-preview-img="'+escapeText(local)+'" alt="">':'<span class="mo-studio-monogram">MO.</span>'))+'</figure><span class="mo-studio-play" aria-hidden="true">▶</span><div class="mo-studio-card-body"><h3>'+escapeText(title)+'</h3><p>'+escapeText(desc)+'</p></div></button>';
}
function playVideo(url){
 const link=(typeof url==='string'&&url.startsWith('blob:')&&isStudioPreviewHost()?url:safeStudioUrl(url)),yt=isYouTube(link),direct=/\.(mp4|webm)(?:[?#]|$)/i.test(link);
 if(!yt&&!direct&&!(isStudioPreviewHost()&&link.startsWith('blob:')))return;
 let d=document.getElementById('moStudioPlayer');if(!d){d=document.createElement('dialog');d.id='moStudioPlayer';d.className='mo-studio-media';document.body.append(d);}
 d.replaceChildren();const close=document.createElement('button');close.className='mo-studio-close';close.type='button';close.textContent='×';close.setAttribute('aria-label','Close video');const frame=yt?document.createElement('iframe'):document.createElement('video');if(yt){frame.src='https://www.youtube-nocookie.com/embed/'+yt+'?autoplay=1';frame.title='Mo Design video';frame.allow='autoplay; encrypted-media; picture-in-picture';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';}else{frame.src=link;frame.controls=true;frame.playsInline=true;frame.autoplay=true;frame.preload='metadata';}d.append(close,frame);close.onclick=()=>d.close();d.addEventListener('close',()=>d.replaceChildren(),{once:true});d.showModal();
}
function render(target,settings,scope){
 if(!target)return;
 const cfg=readStudio(settings),lang=state.lang(),team=cfg.team.filter(x=>x.enabled).sort((a,b)=>(Number(a.sort_order)||0)-(Number(b.sort_order)||0)),videos=cfg.videos.filter(x=>x.enabled&&x[scope==='academy'?'in_academy':'on_site']&&(safeStudioUrl(x.video_url)||(isStudioPreviewHost()&&isPreviewMediaRef(x.video_url)))).sort((a,b)=>(Number(a.sort_order)||0)-(Number(b.sort_order)||0));
 const showTeam=scope==='site'&&cfg.team_enabled&&team.length>0;
 const showVideos=(scope==='site'?cfg.site_videos_enabled:cfg.academy_videos_enabled)&&videos.length>0;
 target.hidden=!(showTeam||showVideos);if(target.hidden){target.replaceChildren();return;}
 target.innerHTML=(showTeam?'<section class="mo-studio-section" id="moTeam"><div class="container"><div class="eyebrow">MO DESIGN / PEOPLE</div><h2 class="mo-studio-title">'+(lang==='ar'?'فريقنا وراء كل تفصيلة.':'People behind the work.')+'</h2><p class="mo-studio-subtitle">'+(lang==='ar'?'تعرف على الناس اللي بتشتغل على الأفكار والتصاميم.':'Meet the team bringing ideas to life.')+'</p><div class="mo-studio-cards">'+team.map(teamCard).join('')+'</div></div></section>':'')+(showVideos?'<section class="mo-studio-section" id="moVideos"><div class="container"><div class="eyebrow">MO DESIGN / VIDEO SHOWCASE</div><h2 class="mo-studio-title">'+(lang==='ar'?'الأفكار وهي بتتحرك.':'Ideas in motion.')+'</h2><p class="mo-studio-subtitle">'+(lang==='ar'?'شاهد فيديوهاتنا وقت ما تحب. بدون تشغيل تلقائي أو تحميل زائد.':'Watch our selected videos on demand.')+'</p><div class="mo-studio-cards">'+videos.map(videoCard).join('')+'</div></div></section>':'');
 target.querySelectorAll('[data-studio-video]').forEach(button=>button.addEventListener('click',async()=>{const raw=videos[Number(button.dataset.studioVideo)]?.video_url;const url=isPreviewMediaRef(raw)?await resolveStudioPreviewMedia(raw):raw;playVideo(url)}));
 if(isStudioPreviewHost()){target.querySelectorAll('[data-preview-img]').forEach(async image=>{const url=await resolveStudioPreviewMedia(image.dataset.previewImg);if(url){image.src=url;image.hidden=false;}});}
}
export function mountStudio({target,scope='site'}){
 if(!target)return;
 let settings=null;
 const update=()=>render(target,settings,scope);
 const refresh=async()=>{
  try{
   if(location.hostname.endsWith('.pages.dev')){
    const {readDemo}=await import('./data.js');
    const local=readDemo()?.settings;
    if(local?.content_ar?.mo_studio_sections_v1){settings=local;update();return;}
   }
   const {readPublicRows}=await import('./public-content-reader.js');
   const rows=await readPublicRows('site_settings',{eq:{id:1},limit:1});
   settings=rows?.[0]||null;update();
  }catch(err){console.warn('Studio sections unavailable:',err)}
 };
 void refresh();
 document.getElementById(scope==='site'?'langToggle':'learningLang')?.addEventListener('click',()=>setTimeout(update,0));
 window.addEventListener('storage',event=>{if(event.key?.includes('portfolio_demo'))void refresh()});
}
