import { getClient, connected } from './api.js';
import { readDemo, escapeHTML as esc, safeUrl, tField } from './data.js';
import { categoryFor, formatTools } from './categories.js';
import {projectVideoUrls} from './service-config.js';
import {renderRich,textStyle} from './rich-text.js';
let lang=localStorage.getItem('portfolio_lang')==='en'?'en':'ar';
let theme=localStorage.getItem('portfolio_theme')==='light'?'light':'dark';
let entry=null;let settings=null;
const $=id=>document.getElementById(id);
const tr=(a,b)=>lang==='ar'?a:b;
const txt=tr;
const fld=k=>tField(entry,k,lang)||'';
const route=new URLSearchParams(location.search).get('slug') || document.body.dataset.projectSlug || null;
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));

function updateProjectSEO(project) {
  let robots = document.querySelector('meta[name="robots"]');

  if (!robots) {
    robots = document.createElement('meta');
    robots.name = 'robots';
    document.head.appendChild(robots);
  }

  robots.content = project ? 'index, follow' : 'noindex, follow';

  let canonical = document.querySelector('link[rel="canonical"]');

  if (project) {
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }

    canonical.href = document.body.dataset.seoPrerender === '1'
      ? new URL('./projects/' + encodeURIComponent(route) + '/', document.baseURI).href
      : new URL('./project.html?slug=' + encodeURIComponent(route), document.baseURI).href;
  } else if (canonical) {
    canonical.remove();
  }
}
function showLoadError(message){
 $('dynamicProject').innerHTML=`<section class="case-hero case-error"><h1 class="case-title">${esc(message)}</h1><p>${tr('المشروع موجود في قاعدة البيانات غالبًا، لكن الاتصال اتأخر. جرّب تاني.','The project might be available, but loading was interrupted. Please retry.')}</p><button class="inner-primary" type="button" id="retryProject">${tr('حاول تاني ↻','Try again ↻')}</button></section>`;
 $('retryProject')?.addEventListener('click',()=>void loadProject());
}
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
function render(){chrome();updateProjectSEO(entry);
 if(!entry){$('dynamicProject').innerHTML=`<section class="case-hero"><h1 class="case-title">${tr('المشروع غير متاح','Project unavailable')}</h1><a href="./index.html#work" class="inner-primary">${tr('شوف الأعمال','Explore portfolio')}</a></section>`;return;}
 document.title=`${fld('title')} | مو ديزاين Mo Design`;
 const seoDescription=document.querySelector('meta[name="description"]');
 if(seoDescription){seoDescription.content=String(fld('summary')||fld('objective')||fld('title')).replace(/<[^>]*>/g,' ').slice(0,200);}
 const ogTitle=document.querySelector('meta[property="og:title"]');if(ogTitle)ogTitle.content=document.title;
 const ogDescription=document.querySelector('meta[property="og:description"]');if(ogDescription&&seoDescription)ogDescription.content=seoDescription.content;
 const media=safeUrl(entry.image_url);
 const video=safeUrl(entry.video_url);
 const isConcept=entry.project_type==='concept' || String(entry.id).startsWith('demo-');
 const description=renderRich(fld('summary'));
 const objective=renderRich(fld('objective'));
 const format=textStyle(entry.text_style);
 const copy=settings?.[lang==='ar'?'content_ar':'content_en']||{};
 const aboutLabel=copy.project_about_title||txt('عن المشروع','About this project');
 const goalLabel=copy.project_objective_title||txt('هدف المشروع','Project objective');
 const gallery=[...new Set(String(entry.gallery_urls||'').split(/\r?\n/).map(v=>safeUrl(v.trim())).filter(Boolean))].slice(0,15);
 const captions=entry.gallery_captions&&typeof entry.gallery_captions==='object'?entry.gallery_captions:{};
  const galleryHTML=gallery.length?`<div class="case-stacked-media">${gallery.map((url,i)=>`<figure class="case-artframe"><img src="${esc(url)}" loading="lazy" alt="${esc(fld('title'))} gallery image ${i+1}" data-case-media/>${(captions[url]?.[lang]||captions[url]?.ar)?`<figcaption class="media-long-caption rich-body">${renderRich(captions[url]?.[lang]||captions[url]?.ar)}</figcaption>`:""}</figure>`).join('')}</div>`:'';
 const extraVideos=projectVideoUrls(entry).filter(url=>url!==video).filter(url=>/\.(mp4|webm)(\?|$)/i.test(url));
 const extraVideoHTML=extraVideos.length?'<div class="case-stacked-media">'+extraVideos.map(url=>'<video class="case-video" controls playsinline preload="metadata"><source src="'+esc(url)+'" type="'+(/\.webm/i.test(url)?'video/webm':'video/mp4')+'"></video>').join('')+'</div>':'';
 const externalLink=safeUrl(entry.external_url);
 const externalLinkHTML=externalLink&&/^https?:\/\//i.test(externalLink)?'<div class="case-external-link"><a href="'+esc(externalLink)+'" target="_blank" rel="noopener noreferrer">'+esc(tr('عرض المشروع على الرابط الخارجي ↗','View project on external website ↗'))+'</a></div>':'';
 const youtube=youtubeID(entry.youtube_url);
 const youtubeHTML=youtube?`<div class="case-youtube"><iframe src="https://www.youtube-nocookie.com/embed/${youtube}" title="${esc(fld('title'))}" loading="lazy" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>`:'';
 const videoHTML=video&&/\.(mp4|webm)(\?|$)/i.test(video)?`<video class="case-video" controls playsinline preload="none" ${media?`poster="${esc(media)}"`:''}><source src="${esc(video)}" type="${/\.webm/i.test(video)?'video/webm':'video/mp4'}"/></video>`:'';
 $('dynamicProject').innerHTML=`<section class="case-hero"><span class="case-eyebrow">MO DESIGN / ${isConcept?'SPEC WORK':'PORTFOLIO'}</span><h1 class="case-title">${esc(fld('title'))}</h1><div class="case-subline"><span>${esc((categoryFor(entry)||{})[lang]||fld('category'))}</span><span>${isConcept?txt('نموذج مفاهيمي غير تجاري','Speculative, non-commissioned project'):'MO DESIGN / PROJECT'}</span></div></section>${media?`<div class="case-lead-media"><img src="${esc(media)}" alt="${esc(fld('title'))}" fetchpriority="high" data-case-media/></div>`:''}${videoHTML}${extraVideoHTML}${youtubeHTML}${galleryHTML}<section class="case-content-grid"><div class="case-side-title">OVERVIEW / 01</div><div class="case-content"><h2>${esc(aboutLabel)}</h2><div class="rich-body case-prose" style="${format}">${description}</div>${fld('objective')?`<h3>${esc(goalLabel)}</h3><div class="rich-body case-prose" style="${format}">${objective}</div>`:''}${externalLinkHTML}${entry.tools_used?`<div class="case-meta-tags">${formatTools(entry.tools_used).map(t=>`<span>${esc(t)}</span>`).join('')}</div>`:''}</div></section><section class="case-close"><h2>${esc(copy.case_cta_title||txt('عايز مشروع بنفس الروح؟','Want to create something similar?'))}</h2><a href="https://wa.me/201097865616?text=${encodeURIComponent('Hi Mo Design, I saw '+(entry.title_en||'a project')+' and want to discuss a similar brief.')}" target="_blank" rel="noopener noreferrer">${esc(copy.case_cta_button||txt('كلمني واتساب ↗','Discuss a project ↗'))}</a></section>`;
  // Broken media must not leave empty frames or block the remaining project.
 $('dynamicProject').querySelectorAll('img[data-case-media]').forEach(img=>{
   img.addEventListener('error',()=>{img.closest('.case-artframe,.case-lead-media')?.remove();},{once:true});
 });
}
$('dynamicLanguage').addEventListener('click',()=>{lang=lang==='ar'?'en':'ar';localStorage.setItem('portfolio_lang',lang);render()});
$('dynamicTheme').addEventListener('click',()=>{theme=theme==='dark'?'light':'dark';localStorage.setItem('portfolio_theme',theme);render()});
chrome();
async function loadProject(){

if (!route || !/^[a-zA-Z0-9_-]{1,140}$/.test(route)) {
  updateProjectSEO(null);
  showLoadError(tr('رابط المشروع غير صحيح.', 'Invalid project link.'));
  return;
}
 $('dynamicProject').innerHTML=`<section class="case-hero"><h1 class="case-title">${tr('جاري تحميل المشروع…','Loading project…')}</h1></section>`;
 if(!connected){
  const demo=readDemo();settings=demo.settings;entry=(demo.projects||[]).find(p=>p.slug===route&&p.is_published)||null;
  try{render()}catch(error){console.error('Project render failed',error);showLoadError(tr('حصل خطأ أثناء عرض المشروع.','Could not display this project.'))}
  return;
 }
 for(let attempt=1;attempt<=3;attempt++){
  try{
   const db=await getClient();
   // Only request this project: errors in services/reviews/lessons must never block it.
   const {data:project,error}=await db.from('projects').select('*').eq('slug',route).eq('is_published',true).maybeSingle();
   if(error)throw error;
   entry=project||null;
   // Render immediately after the required project query. Settings are optional.
   settings={};
   try{render()}catch(renderError){console.error('Project display error',renderError);showLoadError(tr('حصل خطأ أثناء عرض بيانات المشروع.','Project rendering failed.'));return;}
   void db.from('site_settings').select('*').eq('id',1).maybeSingle()
     .then(({data:site,error:settingsError})=>{
       if(settingsError){console.warn('Optional project settings unavailable:',settingsError.message);return;}
       if(site){settings=site;try{render()}catch(renderError){console.warn('Optional settings render failed:',renderError);}}
     }).catch(settingsError=>console.warn('Optional project settings request failed:',settingsError));
   return;
  }catch(error){
   console.warn(`Mo Design project loading attempt ${attempt}/3`,error);
   if(attempt<3)await wait(450*attempt);
   else showLoadError(tr('تعذر تحميل المشروع مؤقتًا.','Unable to load the project right now.'));
  }
 }
}
void loadProject();
