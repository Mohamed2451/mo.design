import {readCommunity,writeCommunity,htmlEscape as e,validHttps} from './mo-community-store.js';
import {isPreviewMediaRef,resolveStudioPreviewMedia} from './studio-preview-media.js';
const $=id=>document.getElementById(id);
let startX=null,signature='',reviewAnimation=null;
const demo=[{name:'نموذج توضيحي',type:'client',rating:5,text:'ده مكان عرض تقييم عميل بعد موافقتك عليه من لوحة التحكم.',subject:'عرض تجريبي'},{name:'نموذج متدرب',type:'trainee',rating:5,text:'هنا يظهر رأي المتدرب بعد المراجعة والموافقة.',subject:'عرض تجريبي'},{name:'تقييم توضيحي',type:'client',rating:4,text:'تصميم البطاقة والحركة للمعاينة فقط، مش شهادة حقيقية.',subject:'عرض تجريبي'}];
function renderBrands(){
 const data=readCommunity(),brands=data.brands.filter(x=>x.enabled&&(x.name||x.logo)),section=$('moBrands');
 section.hidden=!(data.brands_visible&&brands.length);
 if(section.hidden)return;
 const unit=brands.map(x=>'<div class="mo-brand-tile">'+(validHttps(x.logo)?'<img loading="lazy" src="'+e(validHttps(x.logo))+'" alt="'+e(x.name||'شعار براند')+'">':isPreviewMediaRef(x.logo)?'<img loading="lazy" data-preview-brand="'+e(x.logo)+'" alt="'+e(x.name||'شعار براند')+'">':'<strong>'+e(x.name)+'</strong>')+'</div>').join('');
 $('moBrandsTrack').innerHTML=unit+unit;
 $('moBrandsTrack').querySelectorAll('img').forEach(img=>{img.addEventListener('error',()=>{img.replaceWith(Object.assign(document.createElement('span'),{textContent:'الشعار غير متاح على هذا المتصفح'}))},{once:true})});
 $('moBrandsTrack').querySelectorAll('[data-preview-brand]').forEach(async img=>{try{const url=await resolveStudioPreviewMedia(img.dataset.previewBrand);if(url)img.src=url;else img.replaceWith(Object.assign(document.createElement('span'),{textContent:'أعد رفع الشعار هنا'}))}catch{img.replaceWith(Object.assign(document.createElement('span'),{textContent:'تعذر تحميل الشعار'}))}});
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
   {duration:Math.max(12000,width/48*1000),iterations:Infinity,easing:'linear'});
 }
}
function renderReviews(){
 const approved=readCommunity().reviews.filter(x=>x.status==='approved');
 const list=approved.length?approved:demo,sign=JSON.stringify(list);
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
viewport.addEventListener('pointerdown',ev=>{startX=ev.clientX});
viewport.addEventListener('pointerup',ev=>{if(startX===null)return;const d=ev.clientX-startX;startX=null;if(Math.abs(d)>45)next(d<0?1:-1)});
window.addEventListener('resize',()=>{signature='';renderReviews()});
document.addEventListener('visibilitychange',()=>{if(reviewAnimation){if(document.hidden)reviewAnimation.pause();else reviewAnimation.play()}});
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
