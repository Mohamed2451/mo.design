import {getPublicContent} from './api.js';
import {safeUrl,escapeHTML as esc,tField} from './data.js';
let lang=localStorage.getItem('portfolio_lang')==='en'?'en':'ar',items=[],index=0;
const $=s=>document.querySelector(s);
const choose=(p,k)=>tField(p,k,lang);
const yt=(url)=>{try{const u=new URL(url);return u.hostname.includes('youtu.be')?u.pathname.slice(1):u.searchParams.get('v')||u.pathname.match(/\/(?:shorts|embed)\/([^/]+)/)?.[1]||''}catch{return ''}};
function render(){
 document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';
 $('#learningLang').textContent=lang==='ar'?'EN':'ع';
 $('#learningHeading').textContent=lang==='ar'?'المعرفة للجميع':'Learning for everyone';
 $('#learningIntro').textContent=lang==='ar'?'دروس ومقالات وفيديوهات عن التصميم والمونتاج وصناعة المحتوى بالذكاء الاصطناعي.':'Articles and videos on design, editing and AI.';
 $('#learningBack').textContent=lang==='ar'?'↗ العودة للموقع':'↗ Back to site';
 const stage=$('#learningStage'),dots=$('#learningDots'),count=items.length;
 if(!count){stage.innerHTML='<p class="academy-empty">'+(lang==='ar'?'لا يوجد محتوى منشور حاليًا.':'No published content yet.')+'</p>';stage.dataset.renderKey='';dots.innerHTML='';$('#learningCount').textContent='00 / 00';$('#learningPrev').disabled=true;$('#learningNext').disabled=true;return;}
 index=(index+count)%count;
 const key=lang+'|'+items.map(p=>[p.id,choose(p,'title'),p.thumbnail_url].join(':')).join('|');
 if(stage.dataset.renderKey!==key){
  stage.innerHTML=items.map((p,i)=>{
   const id=yt(p.youtube_url),image=safeUrl(p.thumbnail_url)||(id?'https://i.ytimg.com/vi/'+id+'/hqdefault.jpg':'');
   return '<article class="academy-slide" data-index="'+i+'"><a href="./lesson.html?id='+encodeURIComponent(p.id)+'">'+(image?'<img src="'+esc(image)+'" alt="" loading="lazy">':'<div class="academy-fallback">✳</div>')+'<span class="academy-slide-copy"><small>'+(p.content_type==='video'?(lang==='ar'?'فيديو':'Video'):(lang==='ar'?'مقال':'Article'))+'</small><strong>'+esc(choose(p,'title'))+'</strong><span>'+esc(choose(p,'summary'))+'</span></span></a></article>';
  }).join('');
  stage.dataset.renderKey=key;
 }
 stage.querySelectorAll('.academy-slide').forEach((slide,i)=>{
  const d=(i-index+count)%count,r=(index-i+count)%count;
  const position=d===0?'active':r===1?'prev':d===1?'next':'hidden';
  slide.dataset.position=position;slide.setAttribute('aria-hidden',String(position!=='active'));slide.inert=position!=='active';
  slide.querySelector('a').tabIndex=position==='active'?0:-1;
 });
 dots.innerHTML=items.map((_,i)=>'<button type="button" data-index="'+i+'" aria-label="'+(lang==='ar'?'المحتوى ':'Item ')+(i+1)+'" aria-current="'+(i===index)+'"></button>').join('');
 $('#learningCount').textContent=String(index+1).padStart(2,'0')+' / '+String(count).padStart(2,'0');
 $('#learningPrev').disabled=count<2;$('#learningNext').disabled=count<2;
}
function move(n){if(!items.length)return;index=(index+n+items.length)%items.length;render()}
$('#learningPrev').onclick=()=>move(-1);$('#learningNext').onclick=()=>move(1);
$('#learningDots').onclick=e=>{const b=e.target.closest('[data-index]');if(b){index=Number(b.dataset.index);render()}};
$('#learningLang').onclick=()=>{lang=lang==='ar'?'en':'ar';localStorage.setItem('portfolio_lang',lang);render()};
let x=0;$('#learningStage').addEventListener('touchstart',e=>x=e.changedTouches[0].clientX,{passive:true});
$('#learningStage').addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-x;if(Math.abs(dx)>45)move(dx<0?1:-1)},{passive:true});
$('#learningStage').addEventListener('keydown',e=>{if(e.key==='ArrowRight')move(1);if(e.key==='ArrowLeft')move(-1)});
getPublicContent().then(data=>{items=(data.learning_items||[]).filter(p=>p.is_published).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));render()}).catch(err=>{console.error(err);$('#learningStage').textContent=lang==='ar'?'تعذر تحميل المحتوى':'Content unavailable'});
