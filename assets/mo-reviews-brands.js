import {readCommunity,writeCommunity,htmlEscape as e,validHttps} from './mo-community-store.js';
import {isPreviewMediaRef,resolveStudioPreviewMedia} from './studio-preview-media.js';
const $=id=>document.getElementById(id);
const demo=[
 {name:'نموذج توضيحي',type:'client',rating:5,text:'ده مكان عرض تقييم عميل بعد موافقتك عليه من لوحة التحكم.',subject:'عرض تجريبي'},
 {name:'نموذج متدرب',type:'trainee',rating:5,text:'هنا يظهر رأي المتدرب بعد المراجعة والموافقة.',subject:'عرض تجريبي'},
 {name:'تقييم توضيحي',type:'client',rating:4,text:'تصميم البطاقة والحركة للمعاينة فقط، مش شهادة حقيقية.',subject:'عرض تجريبي'}
];
let startX=null,signature='',resizeTimeout=0;
function fallback(img,reason){
 const tile=img.closest('.mo-brand-tile');
 if(!tile)return;
 const el=document.createElement('span');
 el.className='mo-brand-fallback';
 el.textContent=tile.dataset.brandName||'أعد رفع الشعار';
 el.title=reason;
 img.replaceWith(el);
}
// Each identical group must be wider than the viewport. Animate exactly one group.
// CSS repeats forever; no timer or per-frame DOM updates to stall or vanish.
function syncLoop(track,speed){
 if(!track)return;
 const group=track.firstElementChild;
 if(!group)return;
 const width=group.getBoundingClientRect().width;
 if(width<1)return;
 track.style.setProperty('--mo-loop-px',width+'px');
 track.style.setProperty('--mo-loop-seconds',Math.max(4,width/speed).toFixed(3)+'s');
}
function brandTile(x){
 const name=e(x.name||''),alt=e(x.name||'شعار براند');
 const logo=validHttps(x.logo);
 const content=logo?'<img loading="eager" decoding="async" src="'+e(logo)+'" alt="'+alt+'">':
  isPreviewMediaRef(x.logo)?'<img loading="eager" decoding="async" data-preview-brand="'+e(x.logo)+'" alt="'+alt+'">':
  '<strong>'+name+'</strong>';
 return '<div class="mo-brand-tile" data-brand-name="'+name+'">'+content+'</div>';
}
function renderBrands(){
 const section=$('moBrands'),track=$('moBrandsTrack');
 if(!section||!track)return;
 const data=readCommunity(),brands=data.brands.filter(x=>x.enabled&&(x.name||x.logo));
 section.hidden=!(data.brands_visible&&brands.length);
 if(section.hidden){track.replaceChildren();return;}
 const viewport=section.querySelector('.mo-brands-window'),tileWidth=matchMedia('(max-width:600px)').matches?195:251;
 const repeat=Math.max(1,Math.ceil(((viewport.clientWidth||innerWidth)+tileWidth*2)/(tileWidth*brands.length)));
 const tiles=brands.map(brandTile).join(''),full=Array(repeat).fill(tiles).join('');
 track.innerHTML='<div class="mo-brand-loop-group">'+full+'</div><div class="mo-brand-loop-group" aria-hidden="true">'+full+'</div>';
 track.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>fallback(img,'الشعار غير متاح هنا؛ أعد رفعه من لوحة تحكم نفس رابط المعاينة.'),{once:true}));
 track.querySelectorAll('[data-preview-brand]').forEach(async img=>{
  try{
   const src=await resolveStudioPreviewMedia(img.dataset.previewBrand);
   if(src)img.src=src;else fallback(img,'الملف محفوظ في متصفح أو رابط معاينة مختلف، أعد رفعه.');
  }catch{fallback(img,'تعذر قراءة ملف المعاينة، أعد رفعه.');}
 });
 requestAnimationFrame(()=>syncLoop(track,165));
}
function reviewCard(x,isDemo){
 const rating=Math.max(1,Math.min(5,Number(x.rating)||5));
 const name=String(x.name||'زائر'),type=x.type==='trainee'?'متدرب':'عميل',subject=String(x.subject||'تجربة مع Mo Design');
 const avatar=e(name.trim().slice(0,1)||'م');
 return '<article class="mo-carousel-card" aria-label="رأي '+e(name)+'">'+
  '<div class="mo-carousel-person"><div class="mo-carousel-avatar" aria-hidden="true">'+avatar+'</div>'+
  '<div class="mo-carousel-person-details"><strong>'+e(name)+'</strong><small>'+e(subject)+'</small></div>'+
  '<span class="mo-carousel-verified">'+(isDemo?'نموذج توضيحي':'رأي '+type+' موثّق')+'</span></div>'+
  '<div class="mo-carousel-stars" aria-label="'+rating+' من 5">'+ '★'.repeat(rating)+'</div>'+
  '<p class="mo-carousel-quote">'+e(x.text)+'</p>'+
  '<div class="mo-carousel-bottom"><span>'+(isDemo?'للمعاينة فقط':'✓ رأي '+type+' معتمد')+'</span></div></article>';
}
function renderReviews(){
 const track=$('moReviewTrack'),viewport=$('moReviewViewport');
 if(!track||!viewport)return;
 const approved=readCommunity().reviews.filter(x=>x.status==='approved');
 const list=approved.length?approved:demo;
 const sign=JSON.stringify(list);
 $('testimonials').hidden=false;
 $('moReviewDemoNote').hidden=Boolean(approved.length);
 $('moReviewCount').textContent=approved.length?approved.length+' تقييم معتمد':'عرض توضيحي';
 if(sign!==signature||!track.firstElementChild){
  signature=sign;
  const tileWidth=matchMedia('(max-width:600px)').matches?350:397;
  const repeat=Math.max(1,Math.ceil(((viewport.clientWidth||innerWidth)+tileWidth*2)/(tileWidth*list.length)));
  const cards=Array(repeat).fill(list.map(x=>reviewCard(x,!approved.length)).join('')).join('');
  track.innerHTML='<div class="mo-review-loop-group">'+cards+'</div><div class="mo-review-loop-group" aria-hidden="true">'+cards+'</div>';
 }
 requestAnimationFrame(()=>syncLoop(track,112));
}
function move(direction){
 const track=$('moReviewTrack'),group=track?.firstElementChild,card=group?.firstElementChild;
 if(!track||!group||!card)return;
 const step=card.getBoundingClientRect().width+16;
 const distance=group.getBoundingClientRect().width;
 const current=parseFloat(getComputedStyle(track).getPropertyValue('--mo-loop-shift'))||0;
 const next=(current+direction*step+distance)%distance;
 // A manual nudge is applied only as a phase change using a negative delay.
 const speed=112,duration=distance/speed;
 track.style.animationDelay=(-next/speed)+'s';
}
$('moReviewPrev')?.addEventListener('click',()=>move(-1));
$('moReviewNext')?.addEventListener('click',()=>move(1));
const view=$('moReviewViewport');
view?.addEventListener('pointerdown',ev=>{startX=ev.clientX});
view?.addEventListener('pointerup',ev=>{
 if(startX==null)return;
 const delta=ev.clientX-startX;startX=null;
 if(Math.abs(delta)>50)move(delta<0?1:-1);
});
window.addEventListener('resize',()=>{
 clearTimeout(resizeTimeout);
 resizeTimeout=setTimeout(()=>{renderBrands();signature='';renderReviews()},180);
});
const dialog=$('moReviewDialog'),form=$('moReviewForm'),status=$('moReviewStatus');
$('moReviewOpen')?.addEventListener('click',()=>{status.textContent='';dialog.showModal();});
$('moReviewClose')?.addEventListener('click',()=>dialog.close());
form.noValidate=true; // Make all validation errors visible next to the submit action.
form.addEventListener('submit',ev=>{
 ev.preventDefault();
 status.textContent='';
 const fields=new FormData(form),name=String(fields.get('review_name')||'').trim(),body=String(fields.get('review_text')||'').trim();
 if(!form.reportValidity()){status.textContent='راجع الحقول المطلوبة، وحدّد الموافقة على عرض التقييم.';return}
 if(fields.get('website')){status.textContent='تعذّر إرسال التقييم، حاول تاني.';return}
 if(name.length<2){status.textContent='اكتب اسم من حرفين على الأقل.';return}
 if(body.length<12){status.textContent='رأيك لازم يكون 12 حرف على الأقل.';return}
 if(!fields.get('review_consent')){status.textContent='لازم توافق على عرض التقييم بعد المراجعة.';return}
 try{
  const data=readCommunity();
  if(data.reviews.length>=200){status.textContent='وصلنا للحد الأقصى للتقييمات التجريبية.';return}
  data.reviews.push({
   id:crypto.randomUUID(),name:name.slice(0,70),type:fields.get('review_type')==='trainee'?'trainee':'client',
   subject:String(fields.get('review_subject')||'').trim().slice(0,90),
   rating:Math.max(1,Math.min(5,Number(fields.get('review_rating'))||5)),
   text:body.slice(0,1200),status:'pending',createdAt:new Date().toISOString()
  });
  writeCommunity(data);
  form.reset();
  dialog.close();
  const toast=$('toast');
  if(toast){toast.textContent='التقييم اتحفظ للمراجعة في لوحة تحكم نفس المتصفح (معاينة محلية فقط).';toast.classList.add('show');}
 }catch(error){
  console.error('Review preview storage:',error);
  status.textContent='تعذر حفظ التقييم على المتصفح. تأكد إن التخزين المحلي متاح ثم حاول تاني.';
 }
});
window.addEventListener('mo-community-change',()=>{renderBrands();renderReviews()});
window.addEventListener('storage',ev=>{if(ev.key==='mo_design_community_preview_v1'){renderBrands();renderReviews()}});
const testimonials=$('testimonials');
if(testimonials)new MutationObserver(()=>{if(testimonials.hidden)testimonials.hidden=false}).observe(testimonials,{attributes:true,attributeFilter:['hidden']});
renderBrands();renderReviews();
