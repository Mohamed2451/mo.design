/* Mo Design motion upgrade. Browser-only preview; production DB/auth untouched. */
(()=>{'use strict';
const KEY='mo_concept_upgrade_demo_v1';
const el=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let data={brands:[],reviews:[]};
try{const x=JSON.parse(localStorage.getItem(KEY)||'null');if(x&&typeof x==='object'){data.brands=Array.isArray(x.brands)?x.brands.slice(0,40):[];data.reviews=Array.isArray(x.reviews)?x.reviews.slice(0,200):[]}}catch{}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(data))}catch{alert('مساحة تخزين المعاينة ممتلئة')}};
const validatedUrl=url=>{try{if(!url)return '';const u=new URL(String(url));return u.protocol==='https:'?u.href:''}catch{return ''}};
const tools=[['Ps','Photoshop'],['Ai','Illustrator'],['Pr','Premiere Pro'],['Ae','After Effects'],['F','Figma'],['DaV','DaVinci Resolve'],['AI','Creative AI'],['Lr','Lightroom']];
const toolsTrack=el('moTools')?.querySelector('[data-tools-track]');
if(toolsTrack){const cells=tools.map(([symbol,name])=>'<div class="tool-chip"><b>'+esc(symbol)+'</b><small>'+esc(name)+'</small></div>').join('');toolsTrack.innerHTML=cells+cells;}
function renderBrands(){
 const track=el('brandsTrack'),empty=el('brandsEmpty'),mask=el('partnersMarquee');if(!track||!empty||!mask)return;
 const list=data.brands.filter(x=>x.name),visible=list.length>0;
 empty.hidden=visible;mask.hidden=!visible;
 if(visible){const unit=list.map(x=>'<div class="brand-chip">'+(validatedUrl(x.logo)?'<img loading="lazy" src="'+esc(validatedUrl(x.logo))+'" alt="'+esc(x.name)+'">':'<b>'+esc(x.name)+'</b>')+'</div>').join('');track.innerHTML=unit+unit;}
 const management=el('adminBrands');if(management)management.innerHTML=list.map(x=>'<div class="brand-row"><strong>'+esc(x.name)+'</strong><button type="button" data-remove-brand="'+esc(x.id)+'">حذف</button></div>').join('')||'<p class="muted">مافيش براندات مضافة لسه.</p>';
}
function renderReviews(){
 const container=el('testimonialsPreview');if(!container)return;
 const approved=data.reviews.filter(x=>x.status==='approved');
 const part=approved.map(x=>'<article class="catalog-card"><div class="catalog-info"><small>DEMO '+(x.role==='client'?'CLIENT':'LEARNER')+' REVIEW</small><h4>'+esc(x.name)+'</h4><p>'+esc(x.text)+'</p><strong style="color:var(--lime)">'+('★'.repeat(Math.min(5,Math.max(1,x.rating))))+'</strong></div></article>').join('');
 // Existing demo course reviews (if any) are preserved separately.
 const current=container.querySelectorAll('[data-addon-review]');current.forEach(x=>x.remove());
 if(part)container.insertAdjacentHTML('beforeend',part.replaceAll('class="catalog-card"','class="catalog-card" data-addon-review'));
 const admin=el('adminReviews');if(admin){admin.querySelectorAll('[data-addon-moderation]').forEach(n=>n.remove());data.reviews.forEach(x=>{const item=document.createElement('div');item.className='order';item.dataset.addonModeration=x.id;item.innerHTML='<div><strong>'+esc(x.name)+' — '+('★'.repeat(x.rating))+'</strong><br><small class="muted">'+esc(x.role==='client'?'عميل (Demo)':'متدرب (Demo)')+' • '+esc(x.text)+' • '+esc(x.status)+'</small></div>'+(x.status==='pending'?'<div><button class="btn sm" data-moderate-review="'+esc(x.id)+'" data-decision="approved">موافقة</button> <button class="btn sm outline" data-moderate-review="'+esc(x.id)+'" data-decision="rejected">رفض</button></div>':'');admin.append(item)})}
}
function showArtwork(card){
 const d=el('artworkDialog');if(!d)return;const img=card.querySelector('img');el('artworkImage').src=img?.getAttribute('src')||'';el('artworkImage').alt=img?.alt||'';el('artworkTitle').textContent=card.querySelector('h3')?.textContent||'Project';d.showModal();
}
document.addEventListener('click',event=>{
 const nav=event.target.closest('.nav-trigger');if(nav){const group=nav.closest('.nav-group'),was=group.classList.contains('menu-open');document.querySelectorAll('.nav-group').forEach(x=>{x.classList.remove('menu-open');x.querySelector('.nav-trigger')?.setAttribute('aria-expanded','false')});group.classList.toggle('menu-open',!was);nav.setAttribute('aria-expanded',String(!was));return;}
 const choose=event.target.closest('[data-work-pick]');if(choose){const category=choose.dataset.workPick;setTimeout(()=>{const button=[...document.querySelectorAll('[data-filter]')].find(x=>x.dataset.filter===category);button?.click();document.querySelectorAll('.nav-group').forEach(g=>g.classList.remove('menu-open'));},0);}
 const expand=event.target.closest('[data-expand-word]');if(expand){const on=expand.getAttribute('aria-pressed')==='true';expand.setAttribute('aria-pressed',String(!on));const target=expand.querySelector('[data-stretch-word]');if(target)target.textContent=expand.dataset[on?'wordShort':'wordLong'];}
 const card=event.target.closest('#workGrid .work-card');if(card){event.preventDefault();showArtwork(card);}
 if(event.target.closest('[data-open-public-review]'))el('publicReviewDialog')?.showModal();
 const admin=event.target.closest('[data-demo-admin]');if(admin)setTimeout(()=>{renderBrands();renderReviews()},80);
 const del=event.target.closest('[data-remove-brand]');if(del){data.brands=data.brands.filter(x=>x.id!==del.dataset.removeBrand);save();renderBrands();}
 const moderate=event.target.closest('[data-moderate-review]');if(moderate){const x=data.reviews.find(x=>x.id===moderate.dataset.moderateReview);if(x){x.status=moderate.dataset.decision;save();renderReviews();}}
});
el('publicReviewForm')?.addEventListener('submit',ev=>{
 ev.preventDefault();const f=new FormData(ev.target),name=String(f.get('reviewer')||'').trim(),comment=String(f.get('text')||'').trim();
 if(name.length<2||comment.length<8)return;
 data.reviews.push({id:crypto.randomUUID(),name:name.slice(0,65),role:f.get('role')==='client'?'client':'student',rating:Math.min(5,Math.max(1,Number(f.get('rating'))||5)),text:comment.slice(0,700),status:'pending'});
 save();ev.target.reset();el('publicReviewDialog').close();alert('اتسجل التقييم كمراجعة معلقة. افتح «إدارة التجربة» علشان توافق عليه أو ترفضه.');
});
el('brandsForm')?.addEventListener('submit',ev=>{
 ev.preventDefault();const name=el('brandInput')?.value.trim(),logo=el('brandLogoInput')?.value.trim();
 if(!name)return;if(logo&&!validatedUrl(logo)){alert('رابط الشعار لازم يبدأ بـ https://');return}
 if(data.brands.length>=40){alert('الحد الأقصى في المعاينة 40 براند');return}
 data.brands.push({id:crypto.randomUUID(),name:name.slice(0,80),logo:validatedUrl(logo)});
 save();ev.target.reset();renderBrands();
});
renderBrands();renderReviews();
})();