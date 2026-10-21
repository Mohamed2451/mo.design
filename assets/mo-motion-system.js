(()=>{'use strict';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const works=[
 {title:'Visual Identity & Creative Direction',description:'دراسة مفاهيمية للهوية والإخراج البصري',category:'تصميم',src:'./assets/images/concept-aura.svg'},
 {title:'AI Visual Campaign',description:'تجربة في إعلانات المنتجات بالذكاء الاصطناعي',category:'ذكاء اصطناعي',src:'./assets/images/concept-neon.svg'},
 {title:'Product Key Visual',description:'إخراج مشاهد بصرية للمنتجات',category:'تصميم',src:'./assets/images/concept-forme.svg'},
 {title:'Motion Design Study',description:'لغة الحركة والإيقاع للمحتوى المرئي',category:'مونتاج',src:'./assets/images/concept-pulse.svg'},
 {title:'Creative Poster Design',description:'دراسة تركيب بوسترات وألوان',category:'تصميم',src:'./assets/images/concept-zest.svg'}
];
const stage=document.getElementById('moGalleryStage'),host=document.getElementById('moGalleryCards'),rail=document.getElementById('moGalleryRail');if(!stage||!host||!rail)return;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;let current=0,expanded=false,filter='الكل';let shown=works.slice(),cards=[];
function index(i){return ((i%shown.length)+shown.length)%shown.length}
function layout(){
 cards.forEach((b,i)=>{const d=i-current,angle=d*11,side=d*78;
  b.dataset.selected=String(i===current);
  b.style.setProperty('--fan-turn',expanded?'0deg':angle+'deg');
  b.style.setProperty('--fan-shift',expanded?(d*165)+'px':side+'px');
  b.style.setProperty('--fan-y',expanded?'0px':Math.abs(d)*27+'px');
  b.style.setProperty('--fan-z',String(100-Math.abs(d)*13));
  b.tabIndex=i===current?0:-1;
  b.setAttribute('aria-pressed',String(i===current));
 });
 const work=shown[current];document.getElementById('moActiveWorkTitle').textContent=work?.title||'';document.getElementById('moActiveWorkSummary').textContent=work?.description||'';
 rail.querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===current)));
 stage.dataset.expanded=String(expanded);document.querySelector('[data-gallery-layout]')?.setAttribute('aria-pressed',String(expanded));
}
function render(category){
 filter=category;shown=category==='الكل'?works.slice():works.filter(w=>w.category===category);
 current=0;expanded=false;
 host.innerHTML=shown.map((w,i)=>'<button type="button" class="mo-fan-card" data-fan-index="'+i+'" aria-label="'+esc(w.title)+'"><img src="'+esc(w.src)+'" alt="'+esc(w.title)+'" loading="'+(i===0?'eager':'lazy')+'" decoding="async"><span class="mo-fan-label"><b>'+esc(w.title)+'</b><small>'+esc(w.category)+' • CONCEPT</small></span><span class="mo-fan-glint" aria-hidden="true"></span></button>').join('');
 rail.innerHTML=shown.map((w,i)=>'<button type="button" aria-label="اختار '+esc(w.title)+'" aria-pressed="'+(i===0)+'" data-rail-index="'+i+'"><img src="'+esc(w.src)+'" loading="lazy" alt=""></button>').join('');
 cards=[...host.querySelectorAll('.mo-fan-card')];layout();
}
function activate(i,open=false){if(!shown.length)return;current=index(i);layout();if(open)document.getElementById('artworkDialog')&&openArtwork(shown[current])}
function openArtwork(w){const dlg=document.getElementById('artworkDialog');if(!dlg||!w)return;document.getElementById('artworkTitle').textContent=w.title;const img=document.getElementById('artworkImage');img.src=w.src;img.alt=w.title;dlg.showModal()}
host.addEventListener('click',e=>{const b=e.target.closest('[data-fan-index]');if(!b)return;const idx=Number(b.dataset.fanIndex);activate(idx,idx===current)});
rail.addEventListener('click',e=>{const b=e.target.closest('[data-rail-index]');if(b)activate(Number(b.dataset.railIndex))});
document.querySelector('[data-gallery-back]')?.addEventListener('click',()=>activate(current-1));
document.querySelector('[data-gallery-forward]')?.addEventListener('click',()=>activate(current+1));
document.querySelector('[data-gallery-open]')?.addEventListener('click',()=>openArtwork(shown[current]));
document.querySelector('[data-gallery-layout]')?.addEventListener('click',()=>{expanded=!expanded;layout()});
stage.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();activate(current+(e.key==='ArrowLeft'?-1:1))}if(e.key==='Enter')openArtwork(shown[current])});
let start=null;stage.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')start=e.clientX});
stage.addEventListener('pointerup',e=>{if(start===null)return;const delta=e.clientX-start;start=null;if(Math.abs(delta)>42)activate(current+(delta>0?1:-1))});
host.addEventListener('pointermove',e=>{if(reduced)return;const b=e.target.closest('.mo-fan-card');if(!b)return;const rect=b.getBoundingClientRect();b.style.setProperty('--mouse-x',((e.clientX-rect.left)/rect.width*100).toFixed(1)+'%');b.style.setProperty('--mouse-y',((e.clientY-rect.top)/rect.height*100).toFixed(1)+'%')});
document.getElementById('workFilters')?.addEventListener('click',e=>{const b=e.target.closest('[data-filter]');if(b)render(b.dataset.filter)});
const skills=['VISUAL SYSTEMS','BRANDING','MOTION DESIGN','ART DIRECTION','CREATIVE AI','SOCIAL CAMPAIGNS'];const track=document.querySelector('[data-motion-skill-track]');if(track){const unit=skills.map(x=>'<span class="mo-skill-unit">'+esc(x)+' <b>✳</b></span>').join('');track.innerHTML=unit+unit}
render('الكل');
})();