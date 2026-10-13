import { getPublicContent } from './api.js';
import { readDemo, escapeHTML as esc, safeUrl, tField } from './data.js';
import { categoryFor, formatTools } from './categories.js';
let lang=localStorage.getItem('portfolio_lang')==='en'?'en':'ar';
let theme=localStorage.getItem('portfolio_theme')==='light'?'light':'dark';
let entry=null;let settings=null;
const $=id=>document.getElementById(id);
const tr=(a,b)=>lang==='ar'?a:b;
const fld=k=>tField(entry,k,lang)||'';
const route=new URLSearchParams(location.search).get('slug');
function youtubeID(raw) {
  try {
    const u=new URL(raw);
    const host=u.hostname.toLowerCase().replace(/^www\./,'');
    let id='';
    if(host==='youtu.be')id=u.pathname.slice(1).split('/')[0];
    else if(host==='youtube.com'||host==='m.youtube.com'||host==='youtube-nocookie.com'){
      id=u.pathname.startsWith('/shorts/')||u.pathname.startsWith('/embed/')?u.pathname.split('/')[2]:u.searchParams.get('v');
    }
    return /^[a-zA-Z0-9_-]{11}$/.test(id||'')?id:null;
  }catch{return null;}
}
function chrome(){
 document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';document.documentElement.classList.toggle('light',theme==='light');
 $('dynamicLogo').src=safeUrl(settings?.[theme==='light'?'logo_light_url':'logo_dark_url'])||`./assets/images/mo-logo-${theme==='light'?'black':'white'}.webp`;
 $('dynamicLanguage').textContent=lang==='ar'?'EN':'ع';$('dynamicTheme').textContent=theme==='dark'?'☼':'☾';
 $('backLabel').textContent=tr('الأعمال','Work');$('dynamicContact').textContent=tr('ابدأ مشروعك','Start a project');
}
function render(){chrome();
 if(!entry){$('dynamicProject').innerHTML=`<section class="case-hero"><h1 class="case-title">${tr('المشروع غير متاح','Project unavailable')}</h1><a href="./index.html#work" class="inner-primary">${tr('شوف الأعمال','Explore portfolio')}</a></section>`;return;}
 document.title=`${fld('title')} | Mo Design`;
 const media=safeUrl(entry.image_url);
 const video=safeUrl(entry.video_url);
 const isConcept=entry.project_type==='concept' || String(entry.id).startsWith('demo-');
 const description=esc(fld('summary'));
 const txt=(ar,en)=>tr(ar,en);
 const gallery=(entry.gallery_urls||'').split(/\r?\n/).map(v=>safeUrl(v.trim())).filter(Boolean).slice(0,12);
 const galleryHTML=gallery.length?`<div class="case-stacked-media">${gallery.map((url,i)=>`<div class="case-artframe"><img src="${esc(url)}" loading="lazy" alt="${esc(fld('title'))} gallery image ${i+1}"/></div>`).join('')}</div>`:'';
 const youtube=youtubeID(entry.youtube_url);
 const youtubeHTML=youtube?`<div class="case-youtube"><iframe src="https://www.youtube-nocookie.com/embed/${youtube}" title="${esc(fld('title'))}" loading="lazy" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>`:'';
 const videoHTML=video&&/\.(mp4|webm)(\?|$)/i.test(video)?`<video class="case-video" controls playsinline preload="none" ${media?`poster="${esc(media)}"`:''}><source src="${esc(video)}" type="${/\.webm/i.test(video)?'video/webm':'video/mp4'}"/></video>`:'';
 $('dynamicProject').innerHTML=`<section class="case-hero"><span class="case-eyebrow">MO DESIGN / ${isConcept?'SPEC WORK':'PORTFOLIO'}</span><h1 class="case-title">${esc(fld('title'))}</h1><div class="case-subline"><span>${esc((categoryFor(entry)||{})[lang]||fld('category'))}</span><span>${isConcept?txt('نموذج مفاهيمي غير تجاري','Speculative, non-commissioned project'):'MO DESIGN / PROJECT'}</span></div></section>${media?`<div class="case-lead-media"><img src="${esc(media)}" alt="${esc(fld('title'))}" fetchpriority="high"/></div>`:''}${videoHTML}${youtubeHTML}${galleryHTML}<section class="case-content-grid"><div class="case-side-title">OVERVIEW / 01</div><div class="case-content"><h2>${txt('عن المشروع','About this project')}</h2><p>${description}</p>${fld('objective')?`<h3>${txt('الهدف','Objective')}</h3><p>${esc(fld('objective'))}</p>`:''}${entry.tools_used?`<div class="case-meta-tags">${formatTools(entry.tools_used).map(t=>`<span>${esc(t)}</span>`).join('')}</div>`:''}</div></section><section class="case-close"><h2>${txt('عايز مشروع بنفس الروح؟','Want to create something similar?')}</h2><a href="https://wa.me/201097865616?text=${encodeURIComponent('Hi Mo Design, I saw '+(entry.title_en||'a project')+' and want to discuss a similar brief.')}" target="_blank" rel="noopener noreferrer">${txt('كلمني واتساب ↗','Discuss a project ↗')}</a></section>`;
}
$('dynamicLanguage').addEventListener('click',()=>{lang=lang==='ar'?'en':'ar';localStorage.setItem('portfolio_lang',lang);render()});
$('dynamicTheme').addEventListener('click',()=>{theme=theme==='dark'?'light':'dark';localStorage.setItem('portfolio_theme',theme);render()});
chrome();
if(route&&/^[a-z0-9-]{1,100}$/.test(route)){
 getPublicContent().then(data=>{settings=data.settings;entry=(data.projects||[]).find(p=>p.slug===route&&p.is_published)||null;render()}).catch(()=>{const demo=readDemo();entry=demo.projects.find(p=>p.slug===route&&p.is_published)||null;render()});
}else render();
