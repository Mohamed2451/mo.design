import {getPublicContent} from './api.js';
import {escapeHTML as esc, safeUrl, tField} from './data.js';
import {renderRich,textStyle} from './rich-text.js';
const qs=new URLSearchParams(location.search);
const root=document.getElementById('lessonMain');
let lang=localStorage.getItem('portfolio_lang')==='en'?'en':'ar';
let theme=localStorage.getItem('portfolio_theme')==='light'?'light':'dark';
let article=null;let settings=null;
function ytId(value){
 try{const u=new URL(value);const h=u.hostname.toLowerCase();let id='';
 if(['youtu.be','www.youtu.be'].includes(h))id=u.pathname.split('/')[1];
 else if(['youtube.com','www.youtube.com','m.youtube.com','music.youtube.com','www.youtube-nocookie.com'].includes(h)){
  if(u.pathname==='/watch')id=u.searchParams.get('v')||'';
  else if(/^\/(shorts|embed|live|v)\//.test(u.pathname))id=u.pathname.split('/')[2]||'';
 }
 return /^[A-Za-z0-9_-]{11}$/.test(id)?id:'';
 }catch{return ''}
}
function lessonImages(value,captions={}){return String(value||'').split(/\r?\n/).map(v=>safeUrl(v.trim())).filter(u=>u&&u.startsWith('https://')).slice(0,15).map((url,i)=>`<figure class="lesson-figure ${((captions[url]?.[lang]||captions[url]?.ar)||'').trim()?'has-caption':'no-caption'}"><img src="${esc(url)}" loading="lazy" alt="${lang==='ar'?'صورة شرح':'Lesson illustration'} ${i+1}">${((captions[url]?.[lang]||captions[url]?.ar)||'').trim()?`<figcaption class="media-long-caption rich-body">${renderRich(captions[url]?.[lang]||captions[url]?.ar)}</figcaption>`:''}</figure>`).join('')}
function resLinks(value){return String(value||'').split(/\r?\n/).map(line=>{
 const parts=line.split('|'); const url=safeUrl(parts.pop()?.trim()||'');if(!url||!url.startsWith('https://'))return '';
 const label=(parts.join('|').trim()||new URL(url).hostname).slice(0,120);
 return `<a class="lesson-resource" href="${esc(url)}" target="_blank" rel="noopener noreferrer">↗ ${esc(label)}</a>`;
}).filter(Boolean).join('')}
function formatBody(value){return renderRich(value)}
function applyTheme(){document.documentElement.classList.toggle('light',theme==='light');document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';document.getElementById('lessonLang').textContent=lang==='ar'?'EN':'ع';document.getElementById('lessonTheme').textContent=theme==='light'?'☾':'☼';}
function render(){applyTheme();if(!article)return;
 const title=tField(article,'title',lang)||tField(article,'title','ar');
 const summary=tField(article,'summary',lang)||tField(article,'summary','ar');
 const body=tField(article,'body',lang)||tField(article,'body','ar');
 document.title=title+' | Mo Design';
 const id=ytId(article.youtube_url); const direct=safeUrl(article.video_url);
 const youtubeLink=safeUrl(article.youtube_url);
 const cover=safeUrl(article.thumbnail_url)||(id?`https://i.ytimg.com/vi/${id}/hqdefault.jpg`:'');
 const video=article.content_type==='video';
 const media=id?`<div class="lesson-player"><iframe src="https://www.youtube-nocookie.com/embed/${id}?rel=0&playsinline=1" title="${esc(title)}" loading="eager" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>`:
 (video&&direct?`<div class="lesson-player"><video src="${esc(direct)}" controls playsinline preload="metadata" ${cover?`poster="${esc(cover)}"`:''}></video></div>`:
 (cover?`<img class="lesson-cover" src="${esc(cover)}" alt="" loading="eager">`:''));
 const external=(video&&youtubeLink)?`<a class="lesson-youtube-external" href="${esc(youtubeLink)}" target="_blank" rel="noopener noreferrer">↗ ${lang==='ar'?'افتح الفيديو على يوتيوب لو مش شغال هنا':'Open on YouTube if embedding is unavailable'}</a>`:'';
 const resources=resLinks(article.resource_links);const gallery=lessonImages(article.image_urls,article.image_captions);const copy=settings?.[lang==='ar'?'content_ar':'content_en']||{};
 const date=article.created_at?new Date(article.created_at).toLocaleDateString(lang==='ar'?'ar-EG':'en-US'):'';
 root.innerHTML=`<div class="lesson-kicker">${video?(lang==='ar'?'فيديو تعليمي':'Video lesson'):(lang==='ar'?'مقال وشرح':'Article & guide')} <span>✳</span> ${esc(date)}</div><h1>${esc(title)}</h1><div class="lesson-summary rich-body" style="${textStyle(article.text_style)}">${renderRich(summary)}</div>${media}${external}${body?`<article class="lesson-body rich-body" style="${textStyle(article.text_style)}">${formatBody(body)}</article>`:''}${gallery?`<section class="lesson-image-gallery"><h2>${copy.lesson_gallery_title||(lang==='ar'?'صور الشرح بالتفصيل':'Lesson illustrations')}</h2>${gallery}</section>`:''}${resources?`<section class="lesson-resources"><h2>${copy.lesson_resources_title||(lang==='ar'?'ملفات وروابط تساعدك':'Resources & downloads')}</h2><div>${resources}</div></section>`:''}<a class="lesson-bottom-back" href="./index.html#learn">← ${lang==='ar'?'شوف باقي المحتوى':'Explore more lessons'}</a>`;
}
document.getElementById('lessonLang').onclick=()=>{lang=lang==='ar'?'en':'ar';localStorage.setItem('portfolio_lang',lang);render()};
document.getElementById('lessonTheme').onclick=()=>{theme=theme==='light'?'dark':'light';localStorage.setItem('portfolio_theme',theme);render()};
try{const id=qs.get('id')||'';const content=await getPublicContent();settings=content.settings||{};article=(content.learning_items||[]).find(item=>String(item.id)===id&&item.is_published);
 if(!article||settings.education_mode!=='live'||settings.section_visibility?.learn===false){root.innerHTML='<div class="lesson-error"><h1>الدرس مش متاح حاليًا</h1><p>يمكن يكون لسه مسودة أو اتخفى من لوحة التحكم.</p><a href="./index.html#learn">ارجع للمحتوى</a></div>'}
 else render();
}catch(e){root.innerHTML='<div class="lesson-error"><h1>حصلت مشكلة في تحميل الدرس</h1><p>جرّب تحديث الصفحة أو ارجع لقائمة المحتوى.</p><a href="./index.html#learn">رجوع</a></div>';console.warn(e)}
