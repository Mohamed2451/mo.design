import {readCommunity,writeCommunity,htmlEscape as e,validHttps} from './mo-community-store.js';
const $=id=>document.getElementById(id);let cursor=0;
function render(){
 const data=readCommunity();
 const brands=data.brands.filter(x=>x.enabled&&(x.name||x.logo));
 const brandSection=$('moBrands');
 brandSection.hidden=!(data.brands_visible&&brands.length);
 if(!brandSection.hidden){
 const content=brands.map(x=>'<div class="mo-brand-tile">'+(validHttps(x.logo)?'<img loading="lazy" src="'+e(validHttps(x.logo))+'" alt="'+e(x.name||'شعار براند')+'">':'<strong>'+e(x.name)+'</strong>')+'</div>').join('');
 $('moBrandsTrack').innerHTML=content+content;
 }
 const reviews=data.reviews.filter(x=>x.status==='approved');
 $('moUserReviewList').innerHTML=reviews.map(x=>'<article class="mo-review-card"><div><strong>'+e(x.name)+'</strong><span>'+e(x.type==='client'?'عميل':'متدرب')+'</span></div><div class="mo-review-stars-display">'+ '★'.repeat(Math.min(5,Math.max(1,Number(x.rating)||5)))+'</div><p>'+e(x.text)+'</p><small>'+e(x.subject||'MO DESIGN')+'</small></article>').join('');
 const all=[...$('testimonialsGrid').children,...$('moUserReviewList').children];
 cursor=Math.max(0,Math.min(cursor,Math.max(0,all.length-1)));
 all.forEach((node,i)=>{const distance=(i-cursor+all.length)%Math.max(1,all.length);node.style.display=distance<Math.min(3,all.length)?'':'none';node.style.order=String(distance)});
 $('moReviewCount').textContent=all.length?String(cursor+1)+' / '+String(all.length):'';
 $('testimonials').hidden=false;
 $('moReviewSlider').classList.toggle('mo-empty-reviews',!all.length);
}
$('moReviewOpen')?.addEventListener('click',()=>$('moReviewDialog').showModal());
$('moReviewClose')?.addEventListener('click',()=>$('moReviewDialog').close());
$('moReviewPrev')?.addEventListener('click',()=>{cursor=Math.max(cursor-1,0);render()});
$('moReviewNext')?.addEventListener('click',()=>{const all=$('testimonialsGrid').children.length+$('moUserReviewList').children.length;cursor=Math.min(cursor+1,all-1);render()});
$('moReviewForm')?.addEventListener('submit',ev=>{
 ev.preventDefault();
 const form=ev.currentTarget,f=new FormData(form),name=String(f.get('review_name')||'').trim(),body=String(f.get('review_text')||'').trim();
 if(f.get('website')||name.length<2||body.length<12||!f.get('review_consent'))return;
 const data=readCommunity();
 if(data.reviews.length>=200){$('moReviewStatus').textContent='تم الوصول لحد المعاينة التجريبية';return;}
 data.reviews.push({id:crypto.randomUUID(),name:name.slice(0,70),type:f.get('review_type')==='trainee'?'trainee':'client',subject:String(f.get('review_subject')||'').trim().slice(0,90),rating:Math.max(1,Math.min(5,Number(f.get('review_rating'))||5)),text:body.slice(0,1200),status:'pending',createdAt:new Date().toISOString()});
 try{writeCommunity(data);form.reset();$('moReviewDialog').close();alert('تم استلام رأيك للمراجعة. لن يظهر في الموقع قبل الموافقة عليه من لوحة المعاينة.')}catch{$('moReviewStatus').textContent='التخزين المحلي غير متاح في المتصفح'}
});
window.addEventListener('mo-community-change',render);
window.addEventListener('storage',ev=>{if(ev.key==='mo_design_community_preview_v1')render()});
const moObserver=new MutationObserver(()=>{if($('testimonialsGrid').children.length){moObserver.disconnect();render()}});
moObserver.observe($('testimonialsGrid'),{childList:true});
const visibilityObserver=new MutationObserver(()=>{if($('testimonials').hidden)$('testimonials').hidden=false});visibilityObserver.observe($('testimonials'),{attributes:true,attributeFilter:['hidden']});render();
