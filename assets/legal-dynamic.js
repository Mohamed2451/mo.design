import {connected,getPublicContent} from './api.js';
import {DEFAULT_LEGAL,legalPages} from './legal-config.js';
const escapeText=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function language(){return localStorage.getItem('portfolio_lang')==='en'?'en':'ar'}
function contentHTML(s){return String(s||'').split(/\n/).reduce((out,line)=>{const t=line.trim();if(!t)return out+'<div style="height:12px"></div>';if(/^#{1,3}\s+/.test(t)){const level=Math.min(3,t.match(/^#+/)[0].length)+1;return out+'<h'+level+'>'+escapeText(t.replace(/^#{1,3}\s+/,''))+'</h'+level+'>'}return out+'<p>'+escapeText(t)+'</p>'},'')}
async function start(){
 let settings={};
 if(connected){
   try{
     const publicData=await getPublicContent();
     if(publicData._loadWarnings?.includes('site settings')||publicData._loadWarnings?.includes('connection'))throw new Error('تعذر قراءة إعدادات الموقع العامة');
     settings=publicData.settings||{};
   }catch(error){
     console.error('Legal pages: settings could not load',error);
     const section=document.querySelector('.case-main .case-content');
     if(section){const warning=document.createElement('p');warning.textContent='تعذر تحديث نص الصفحة مؤقتًا. جرّب تحديث الصفحة.';warning.style.color='#f0b77c';section.prepend(warning);}
   }
 }
 const pages=legalPages(settings).filter(p=>p.enabled!==false);
 const lang=language();
 const footer=document.querySelector('.footer-legal, .legal-links');
 if(footer){footer.querySelectorAll('a[href*="privacy.html"],a[href*="terms.html"],a[href*="copyright.html"]').forEach(a=>a.remove());
  for(const p of pages){const a=document.createElement('a');a.href='./'+p.url;a.textContent=p[lang]||p.ar;footer.appendChild(a)}}
 const pageId=document.body.dataset.legalPage || new URLSearchParams(location.search).get('id');
 if(!pageId)return;
 const p=legalPages(settings).find(x=>x.id===pageId&&x.enabled!==false);
 if(!p)return;
 const heading=document.querySelector('.case-main .case-title');
 if(heading){heading.textContent=p[lang]||p.ar;document.title=heading.textContent+' | Mo Design'}
 const section=document.querySelector('.case-main .case-content');
 const sections=Array.isArray(p.sections)?p.sections:[];
 if(section&&sections.length){
   section.innerHTML=sections.map(part=>{
     const heading=part['title_'+lang]||part.title_ar||'';
     const text=part['text_'+lang]||part.text_ar||'';
     return '<section class="legal-section">'+(heading?'<h2>'+escapeText(heading)+'</h2>':'')+(text?'<p>'+escapeText(text).replace(/\\n/g,'<br>')+'</p>':'')+'</section>';
   }).join('');
 }else{
   const value=p['body_'+lang]||p.body_ar;
   if(value&&section)section.innerHTML=contentHTML(value);
 }
}
start();
