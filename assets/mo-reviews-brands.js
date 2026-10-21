import {readCommunity,writeCommunity,htmlEscape as e,validHttps} from './mo-community-store.js';
import {isPreviewMediaRef,resolveStudioPreviewMedia} from './studio-preview-media.js';
const $=id=>document.getElementById(id);
let startX=null,signature='',reviewAnimation=null;
const demo=[{name:'نموذج توضيحي',type:'client',rating:5,text:'ده مكان عرض تقييم عميل بعد موافقتك عليه من لوحة التحكم.',subject:'عرض تجريبي'},{name:'نموذج متدرب',type:'trainee',rating:5,text:'هنا يظهر رأي المتدرب بعد المراجعة والموافقة.',subject:'عرض تجريبي'},{name:'تقييم توضيحي',type:'client',rating:4,text:'تصميم البطاقة والحركة للمعاينة فقط، مش شهادة حقيقية.',subject:'عرض تجريبي'}];
function brandFallback(img,reason){
 const tile=img.closest('.mo-brand-tile');
 if(!tile)return;
 const fallback=document.createElement('span');
 fallback.className='mo-brand-fallback';
 fallback.textContent=tile.dataset.brandName||'الشعار لم يُحمّل';
 fallback.title=reason||'من لوحة التحكم اختر تغيير الشعار وارفع الصورة مرة تانية على نفس رابط المعاينة.';
 img.replaceWith(fallback);
}
function renderBrands(){
 const data=readCommunity(),brands=data.brands.filter(x=>x.enabled&&(x.name||x.logo)),section=$('moBrands');
 section.hidden=!(data.brands_visible&&brands.length);
 if(section.hidden)return;
 const tiles=brands.map(x=>{
  const name=e(x.name||''),alt=e(x.name||'شعار الشركة'),https=validHttps(x.logo),preview=isPreviewMediaRef(x.logo);
  const contents=https?'<img loading="eager" decoding="async" src="'+e(https)+'" alt="'+alt+'">':preview?'<img loading="eager" decoding="async" data-preview-brand="'+e(x.logo)+'" alt="'+alt+'">':'<strong>'+name+'</strong>';
  return '<div class="mo-brand-tile" data-brand-name="'+name+'">'+contents+'</div>';
 }).join('');
 const track=$('moBrandsTrack');
 track.innerHTML='<div class="mo-brand-loop-group">'+tiles+'</div><div class="mo-brand-loop-group" aria-hidden="true">'+tiles+'</div>';
 track.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>brandFallback(img,'رابط الشعار غير صالح أو الملف غير موجود. ارفع صورة الشعار مرة تانية من لوحة التحكم.'),{once:true}));
 track.querySelectorAll('[data-preview-brand]').forEach(async img=>{
  try{
   const url=await resolveStudioPreviewMedia(img.dataset.previewBrand);
   if(url)img.src=url;
   else brandFallback(img,'ملف الشعار موجود في معاينة أو متصفح مختلف. افتح لوحة التحكم على نفس الرابط واضغط تغيير الشعار.');
  }catch{brandFallback(img,'تعذر قراءة الشعار من التخزين المحلي. أعد رفعه من لوحة التحكم على نفس الرابط.')}
 });
 requestAnimationFrame(()=>{
  const first=track.firstElementChild;
  if(!first)return;
  const width=first.getBoundingClientRect().width;
  if(width)track.style.setProperty('--mo-brands-duration',Math.max(5,width/95).toFixed(2)+'s');
 });
}
function card(x,isDemo){return '<article class="mo-carousel-card" aria-label="'+e(x.name)+'"><div class="mo-carousel-top"><div><strong>'+e(x.name)+'</strong><small>'+e(isDemo?'نموذج توضيحي':x.type==='trainee'?'متدرب':'عميل')+'</small></div><span class="mo-carousel-stars">'+ '★'.repeat(Math.max(1,Math.min(5,Number(x.rating)||5)))+'</span></div><p>'+e(x.text)+'</p><small>'+e(x.subject||'MO DESIGN')+'</small>'+(isDemo?'<span class="mo-carousel-demo">للمعاينة فقط</span>':'')+'</article>'}
// Seamless marquee: two identical, sufficiently long groups; translate exactly one group.
function restartMotion(){
 const track=$('moReviewTrack'),group=track.firstElementChild;
 if(reviewAnimation){reviewAnimation.cancel();reviewAnimation=null}
 if(!group)return;
 const width=group.getBoundingClientRect().width;
 if(!width)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(!reduced){
  reviewAnimation=track.animate([{transform:'translate3d(0,0,0)'},{transform:'translate3d(-'+width+'px,0,0)'}],
   {duration:Math.max(4000,width/115*1000),iterations:Infinity,easing:'linear'});
  if($('moReviewViewport').matches(':hover')||document.hidden)reviewAnimation.pause();
 }
}
function renderReviews(){
 const approved=readCommunity().reviews.filter(x=>x.status==='approved');
 const list=approved.length?approved:demo,sign=JSON.stringify(list);
 $('moReviewCount').textContent=approved.length?approved.length+' تقييم معتمد':'عرض توضيحي';
 $('testimonials').hidden=false;$('moReviewDemoNote').hidden=Boolean(approved.length);
 if(sign!==signature){
  signature=sign;
  const viewport=$('moReviewViewport'),estimated=Math.max(1,Math.ceil((viewport.clientWidth||1080)/300)+1);
  const repetitions=Math.max(2,Math.ceil(estimated/list.length));
  const cards=Array.from({length:repetitions},()=>list.map(x=>card(x,!approved.length)).join('')).join('');
  $('moReviewTrack').innerHTML='<div class="mo-review-loop-group">'+cards+'</div><div class="mo-review-loop-group" aria-hidden="true">'+cards+'</div>';
  requestAnimationFrame(restartMotion);
 }
}
function next(delta){
 if(!reviewAnimation)return;
 const group=$('moReviewTrack').firstElementChild;
 const first=group?.firstElementChild;
 if(!first)return;
 const step=first.getBoundingClientRect().width+16;
 const duration=reviewAnimation.effect.getTiming().duration;
 const groupWidth=group.getBoundingClientRect().width;
 reviewAnimation.currentTime=((reviewAnimation.currentTime||0)+(delta*step/groupWidth*duration)+duration)%duration;
}
$('moReviewPrev').addEventListener('click',()=>next(-1));
$('moReviewNext').addEventListener('click',()=>next(1));
const viewport=$('moReviewViewport');
const pauseReviews=()=>reviewAnimation?.pause();
const resumeReviews=()=>{if(!document.hidden&&!viewport.matches(':hover'))reviewAnimation?.play()};
viewport.addEventListener('pointerenter',ev=>{if(ev.pointerType==='mouse')pauseReviews()});
viewport.addEventListener('pointerleave',resumeReviews);
viewport.addEventListener('focusin',pauseReviews);
viewport.addEventListener('focusout',()=>{if(!viewport.contains(document.activeElement))resumeReviews()});
viewport.addEventListener('pointerdown',ev=>{startX=ev.clientX});
viewport.addEventListener('pointerup',ev=>{if(startX===null)return;const d=ev.clientX-startX;startX=null;if(Math.abs(d)>45)next(d<0?1:-1)});
window.addEventListener('resize',()=>{signature='';renderReviews()});
document.addEventListener('visibilitychange',()=>{if(reviewAnimation){if(document.hidden||viewport.matches(':hover'))reviewAnimation.pause();else reviewAnimation.play()}});
$('moReviewOpen').addEventListener('click',()=>$('moReviewDialog').showModal());
$('moReviewClose').addEventListener('click',()=>$('moReviewDialog').close());
$('moReviewForm').addEventListener('submit',ev=>{
 ev.preventDefault();const form=ev.currentTarget,f=new FormData(form),name=String(f.get('review_name')||'').trim(),body=String(f.get('review_text')||'').trim();if(f.get('website')||name.length<2||body.length<12||!f.get('review_consent'))return;const data=readCommunity();if(data.reviews.length>=200)return;
 data.reviews.push({id:crypto.randomUUID(),name:name.slice(0,70),type:f.get('review_type')==='trainee'?'trainee':'client',subject:String(f.get('review_subject')||'').trim().slice(0,90),rating:Math.max(1,Math.min(5,Number(f.get('review_rating'))||5)),text:body.slice(0,1200),status:'pending',createdAt:new Date().toISOString()});
 try{writeCommunity(data);form.reset();$('moReviewDialog').close();alert('اتسجل التقييم للمراجعة. مش هيظهر إلا بعد الموافقة عليه من لوحة المعاينة.')}catch{$('moReviewStatus').textContent='التخزين المحلي غير متاح'}
});
window.addEventListener('mo-community-change',()=>{renderBrands();renderReviews()});
window.addEventListener('storage',event=>{if(event.key==='mo_design_community_preview_v1'){renderBrands();renderReviews()}});
const observer=new MutationObserver(()=>{if($('testimonials').hidden)$('testimonials').hidden=false});observer.observe($('testimonials'),{attributes:true,attributeFilter:['hidden']});
renderBrands();renderReviews();
