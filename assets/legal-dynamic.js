import {connected,getClient} from './api.js';
import {DEFAULT_LEGAL,legalPages} from './legal-config.js';
const escapeText=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function language(){return localStorage.getItem('portfolio_lang')==='en'?'en':'ar'}
function contentHTML(s){return String(s||'').split(/\n/).reduce((out,line)=>{const t=line.trim();if(!t)return out+'<div style="height:12px"></div>';if(/^#{1,3}\s+/.test(t)){const level=Math.min(3,t.match(/^#+/)[0].length)+1;return out+'<h'+level+'>'+escapeText(t.replace(/^#{1,3}\s+/,''))+'</h'+level+'>'}return out+'<p>'+escapeText(t)+'</p>'},'')}
async function start(){
 let settings={};
 if(connected){try{const db=await getClient();const {data,error}=await db.from('site_settings').select('content_ar').eq('id',1).maybeSingle();if(!error)settings=data||{};}catch(e){console.warn('Legal settings unavailable',e)}}
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
 const value=p['body_'+lang]||p.body_ar;
 const section=document.querySelector('.case-main .case-content');
 if(value&&section)section.innerHTML=contentHTML(value);
}
start();
