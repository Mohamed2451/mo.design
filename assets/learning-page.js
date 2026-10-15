import {getPublicContent} from './api.js';
import {safeUrl,escapeHTML as esc,tField} from './data.js';
import {getAcademyCategories,getAcademyMembership,academyText} from './academy-config.js';

let lang=(()=>{try{return localStorage.getItem('portfolio_lang')==='en'?'en':'ar'}catch{return 'ar'}})();
let items=[],filter='all',settings={};
const $=selector=>document.querySelector(selector);
const choose=(item,key)=>tField(item,key,lang);
const youtubeId=value=>{
 try{
  const u=new URL(value);
  if(['youtu.be','www.youtu.be'].includes(u.hostname))return u.pathname.split('/')[1]||'';
  if(['youtube.com','www.youtube.com','m.youtube.com'].includes(u.hostname))return u.searchParams.get('v')||u.pathname.match(/^\/(?:shorts|embed)\/([^/]+)/)?.[1]||'';
 }catch{}
 return '';
};
const copy={
 ar:{title:'المعرفة للجميع',intro:'دروس ومقالات وفيديوهات عن التصميم والمونتاج والذكاء الاصطناعي.',back:'↗ العودة للموقع',filters:{all:'كل المحتوى',video:'فيديوهات',article:'مقالات'},empty:'لا يوجد محتوى منشور في القسم ده حاليًا.',loading:'جاري تحميل المحتوى...',error:'تعذر تحميل المحتوى حاليًا. حاول تفتح الصفحة مرة تانية.'},
 en:{title:'Learning for everyone',intro:'Articles and videos about design, editing and AI.',back:'↗ Back to site',filters:{all:'All content',video:'Videos',article:'Articles'},empty:'No published content in this category yet.',loading:'Loading content...',error:'Could not load the content. Please try again.'}
};
function render(){
 const t=copy[lang];
 const tr=(key)=>academyText(settings,key,lang);
 document.documentElement.lang=lang;
 document.documentElement.dir=lang==='ar'?'rtl':'ltr';
 document.title=tr('academy_page_heading')+' | Mo Design';
 $('#learningLang').textContent=lang==='ar'?'EN':'ع';
 $('#learningHeading').textContent=tr('academy_page_heading');
 $('#learningIntro').textContent=tr('academy_page_intro');
 $('#learningBack').textContent=tr('academy_back');
 $('#learningFilters').setAttribute('aria-label',lang==='ar'?'تصفية المحتوى':'Filter content');
 const categories=getAcademyCategories(settings).filter(x=>x.enabled);
 const fixed=[['all',tr('academy_filter_all')],['video',tr('academy_filter_videos')],['article',tr('academy_filter_articles')]];
 const options=[...fixed,...categories.map(x=>[x.id,(lang==='ar'?x.ar:x.en)||x.ar||x.en])];
 if(!options.some(x=>x[0]===filter))filter='all';
 $('#learningFilters').innerHTML=options.map(([id,label])=>'<button type="button" data-filter="'+esc(id)+'" class="'+(filter===id?'is-active':'')+'" aria-pressed="'+(filter===id)+'">'+esc(label)+'</button>').join('');
 const membership=getAcademyMembership(settings);
 const visible=items.filter(item=>filter==='all'||(filter==='video'||filter==='article'?item.content_type===filter:(membership[String(item.id)]||[]).includes(filter)));
 const grid=$('#learningGrid');
 grid.setAttribute('aria-busy','false');
 if(!visible.length){grid.innerHTML='<p class="academy-empty">'+esc(tr('academy_no_content'))+'</p>';return}
 grid.innerHTML=visible.map(item=>{
  const title=choose(item,'title'),video=item.content_type==='video';
  const id=video?youtubeId(item.youtube_url):'';
  const image=safeUrl(item.thumbnail_url)||(id?'https://i.ytimg.com/vi/'+encodeURIComponent(id)+'/hqdefault.jpg':'');
  return '<article class="academy-card"><a href="./lesson.html?id='+encodeURIComponent(item.id)+'" aria-label="'+esc(title)+'">'+
   '<span class="academy-card-image">'+(image?'<img loading="lazy" src="'+esc(image)+'" alt="">':'<span class="academy-placeholder" aria-hidden="true">◈</span>')+'</span>'+
   '<strong class="academy-card-title">'+esc(title)+'</strong></a></article>';
 }).join('');
}
$('#learningFilters').addEventListener('click',event=>{
 const b=event.target.closest('button[data-filter]');if(!b)return;
 filter=b.dataset.filter;render();
});
$('#learningLang').addEventListener('click',()=>{
 lang=lang==='ar'?'en':'ar';
 try{localStorage.setItem('portfolio_lang',lang)}catch{}
 render();
});
getPublicContent().then(data=>{
 if(data._loadWarnings?.includes('learning items'))throw new Error('Academy content temporarily unavailable');
 settings=data.settings||{};
 items=(data.learning_items||[]).filter(item=>item.is_published).sort((a,b)=>(Number(a.sort_order)||0)-(Number(b.sort_order)||0));
 render();
}).catch(error=>{
 console.error('Mo Design: academy loading failed',error);
 $('#learningGrid').setAttribute('aria-busy','false');
 $('#learningGrid').innerHTML='<p class="academy-empty">'+esc(copy[lang].error)+'</p>';
});
