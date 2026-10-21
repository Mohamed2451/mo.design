import {startRail} from './mo-infinite-rail.js';
const $=id=>document.getElementById(id);
const safe=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function card(x){
 const name=String(x.author_ar||x.author_en||'عميل'),job=String(x.job_ar||x.job_en||'عميل'),rating=Math.max(1,Math.min(5,Number(x.rating)||5));
 return '<article class="mo-live-card"><div class="mo-live-person"><span class="mo-live-avatar">'+safe(name.charAt(0))+'</span><span class="mo-live-person-text"><strong>'+safe(name)+'</strong><small>'+safe(job)+'</small></span><span class="mo-live-verified">رأي عميل موثّق</span></div><span class="mo-live-stars">'+ '★'.repeat(rating)+'</span><p>'+safe(x.quote_ar||x.quote_en||'')+'</p><footer>✓ رأي عميل موثّق</footer></article>';
}
function logo(x){
 const name=String(x.name||'');let url='';
 try{const parsed=new URL(x.logo);if(parsed.protocol==='https:')url=parsed.href}catch{}
 return '<div class="mo-live-brand">'+(url?'<img src="'+safe(url)+'" alt="'+safe(name||'شعار براند')+'" loading="eager">':'<strong>'+safe(name)+'</strong>')+'</div>';
}
function render(rail,viewport,data,fn,speed){
 rail.__moStopRail?.();rail.replaceChildren();
 if(!data.length)return;
 const width=viewport.clientWidth||window.innerWidth;
 const itemWidth=fn===card?(innerWidth<650?360:400):(innerWidth<650?192:236);
 const required=Math.max(8,Math.ceil((width*2+itemWidth*2)/itemWidth));
 const template=data.map(fn).join('');
 const repeats=Math.max(1,Math.ceil(required/data.length));
 rail.innerHTML=Array(Math.min(40,repeats)).fill(template).join('');
 startRail(rail,viewport,speed);
}
let entries=[],brands=[];
function paintReviews(){
 const viewport=$('moLiveReviewsViewport'),rail=$('moLiveReviewsTrack'),shell=$('moLiveReviews');
 if(!viewport||!rail||!shell)return;
 shell.hidden=!entries.length;
 if(entries.length)render(rail,viewport,entries,card,112);
}
function paintBrands(){
 const viewport=$('moLiveBrandsViewport'),rail=$('moLiveBrandsTrack'),shell=$('moLiveBrands');
 if(!viewport||!rail||!shell)return;
 shell.hidden=false;
 if(brands.length)render(rail,viewport,brands,logo,165);
}
function parseBrands(raw){
 try{return JSON.parse(raw||'[]').filter(x=>x&&typeof x==='object'&&(x.name||x.logo)&&x.enabled!==false).slice(0,40)}catch{return []}
}
export function updateCommunityReviews(rows){entries=Array.isArray(rows)?rows.filter(x=>x.is_published&&x.is_verified):[];if(location.hostname.endsWith('.pages.dev')){try{const demo=JSON.parse(localStorage.getItem('mo_design_preview_submitted_reviews_v1')||'[]');entries=entries.concat(demo.filter(x=>x.is_published&&x.is_verified))}catch{}}paintReviews()}
export function updateCommunityBrands(settings){brands=parseBrands(settings?.content_ar?.mo_public_brands);if(location.hostname.endsWith('.pages.dev'))brands=parseBrands(localStorage.getItem('mo_design_preview_public_brands_v1'));paintBrands()}
export function mountCommunity(){
 const review=$('moLiveReviewsTrack');
 if(!review)return;
 $('moLiveReviewsPrev')?.addEventListener('click',()=>review.__moRailNudge?.(-1));
 $('moLiveReviewsNext')?.addEventListener('click',()=>review.__moRailNudge?.(1));
 let timer=0;window.addEventListener('resize',()=>{clearTimeout(timer);timer=setTimeout(()=>{paintReviews();paintBrands()},220)});
 window.addEventListener('storage',()=>{updateCommunityBrands();updateCommunityReviews(entries)});
 paintReviews();paintBrands();
}
