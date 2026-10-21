import {readCommunity,writeCommunity,htmlEscape as e,validHttps} from './mo-community-store.js';
import {isPreviewMediaRef,resolveStudioPreviewMedia} from './studio-preview-media.js';
const $=id=>document.getElementById(id);
let cursor=0,timer=0,startX=null,signature='';
const demo=[{name:'نموذج توضيحي',type:'client',rating:5,text:'ده مكان عرض تقييم عميل بعد موافقتك عليه من لوحة التحكم.',subject:'عرض تجريبي'},{name:'نموذج متدرب',type:'trainee',rating:5,text:'هنا يظهر رأي المتدرب بعد المراجعة والموافقة.',subject:'عرض تجريبي'},{name:'تقييم توضيحي',type:'client',rating:4,text:'تصميم البطاقة والحركة للمعاينة فقط، مش شهادة حقيقية.',subject:'عرض تجريبي'}];
function renderBrands(){
 const data=readCommunity(),brands=data.brands.filter(x=>x.enabled&&(x.name||x.logo)),section=$('moBrands');
 section.hidden=!(data.brands_visible&&brands.length);
 if(section.hidden)return;
 const unit=brands.map(x=>'<div class="mo-brand-tile">'+(validHttps(x.logo)?'<img loading="lazy" src="'+e(validHttps(x.logo))+'" alt="'+e(x.name||'شعار براند')+'">':isPreviewMediaRef(x.logo)?'<img loading="lazy" data-preview-brand="'+e(x.logo)+'" alt="'+e(x.name||'شعار براند')+'">':'<strong>'+e(x.name)+'</strong>')+'</div>').join('');
 $('moBrandsTrack').innerHTML=unit+unit;
 $('moBrandsTrack').querySelectorAll('[data-preview-brand]').forEach(async img=>{const url=await resolveStudioPreviewMedia(img.dataset.previewBrand);if(url)img.src=url});
}
function card(x,isDemo){return '<article class="mo-carousel-card" aria-label="'+e(x.name)+'"><div class="mo-carousel-top"><div><strong>'+e(x.name)+'</strong><small>'+e(isDemo?'نموذج توضيحي':x.type==='trainee'?'متدرب':'عميل')+'</small></div><span class="mo-carousel-stars">'+ '★'.repeat(Math.max(1,Math.min(5,Number(x.rating)||5)))+'</span></div><p>'+e(x.text)+'</p><small>'+e(x.subject||'MO DESIGN')+'</small>'+(isDemo?'<span class="mo-carousel-demo">للمعاينة فقط</span>':'')+'</article>'}
function move(){const track=$('moReviewTrack'),cards=[...track.children];if(!cards.length)return;const viewport=$('moReviewViewport'),gap=16,one=cards[0].getBoundingClientRect().width+gap;track.style.transform='translate3d('+(-cursor*one)+'px,0,0)';$('moReviewCount').textContent=(cursor+1)+' / '+cards.length;}
function renderReviews(){
 const approved=readCommunity().reviews.filter(x=>x.status==='approved');
 const list=approved.length?approved:demo,sign=JSON.stringify(list);
 $('testimonials').hidden=false;$('moReviewDemoNote').hidden=Boolean(approved.length);
 if(sign!==signature){signature=sign;cursor=0;$('moReviewTrack').innerHTML=list.map(x=>card(x,!approved.length)).join('')}
 move();
}
function next(delta){const count=$('moReviewTrack').children.length;if(!count)return;cursor=(cursor+delta+count)%count;move()}
$('moReviewPrev').addEventListener('click',()=>next(-1));
$('moReviewNext').addEventListener('click',()=>next(1));
const viewport=$('moReviewViewport');viewport.addEventListener('pointerdown',ev=>{startX=ev.clientX});viewport.addEventListener('pointerup',ev=>{if(startX===null)return;const d=ev.clientX-startX;startX=null;if(Math.abs(d)>45)next(d<0?1:-1)});
window.addEventListener('resize',move);
if(!matchMedia('(prefers-reduced-motion: reduce)').matches){timer=setInterval(()=>{if(!document.hidden&&!viewport.matches(':hover')&&!viewport.contains(document.activeElement))next(1)},5200)}
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
