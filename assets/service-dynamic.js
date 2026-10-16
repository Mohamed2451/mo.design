import {connected,getClient} from './api.js';
import {escapeHTML as esc,safeUrl} from './data.js';
import {PORTFOLIO_CATEGORIES,categoryFor} from './categories.js';
import {serviceConfig,projectServiceGroups} from './service-config.js';
const mapping={
 'social-media':{category:0,service:'service-ads'},
 'video-motion':{category:1,service:'service-edit'},
 'ai-creative':{category:2,service:'service-ai'},
 'prompt-engineering':{category:2,service:'service-prompts'},
 'branding':{category:3,service:'service-brand'}
};
const key=document.body.dataset.servicePage;
const config=mapping[key];
const root='../../';
const title=document.getElementById('serviceTitle');
const desc=document.getElementById('serviceDescription');
const gallery=document.getElementById('serviceProjects');
const count=document.getElementById('serviceCount');
const lang=()=>localStorage.getItem('portfolio_lang')==='en'?'en':'ar';
const tr=(ar,en)=>lang()==='ar'?ar:en;
const label=(o,name)=>o?.[name+'_'+lang()]||o?.[name+'_'+(lang()==='ar'?'en':'ar')]||'';
let snapshot={services:[],projects:[],settings:{}};
let activeGroup='all';
let projectsLoaded=false;
function render(){
 document.documentElement.lang=lang();document.documentElement.dir=lang()==='ar'?'rtl':'ltr';
 document.querySelectorAll('[data-ar][data-en]').forEach(el=>{el.textContent=el.dataset[lang()];});
 const category=PORTFOLIO_CATEGORIES[config.category];
 const service=snapshot.services.find(s=>s.id===config.service)
  ||snapshot.services.find(s=>new RegExp(category.en.split(' ')[0],'i').test([s.title_en,s.title_ar].join(' ')));
 const cfg=serviceConfig(snapshot.settings)[key];
 title.textContent=cfg['title_'+lang()]||label(service,'title')||category[lang()];
 desc.textContent=cfg['description_'+lang()]||label(service,'description')||tr('نماذج من المشاريع المنشورة في هذا التخصص.','Published work in this specialty.');
 document.title=title.textContent+' | Mo Design';
 const allProjects=snapshot.projects.filter(p=>p.is_published===true && categoryFor(p)?.id===category.id);
 const filters=document.getElementById('serviceFilters');
 const groups=cfg.categories.filter(x=>x.enabled);
 if(activeGroup!=='all'&&!groups.some(c=>c.id===activeGroup))activeGroup='all';
 const projects=allProjects.filter(p=>activeGroup==='all'||projectServiceGroups(p,key).includes(activeGroup))
  .sort((a,b)=>(Number(a.sort_order)||0)-(Number(b.sort_order)||0));
 if(filters)filters.innerHTML=groups.length?[{id:'all',ar:'كل المشاريع',en:'All projects'},...groups].map(c=>'<button type="button" data-service-filter="'+esc(c.id)+'" aria-pressed="'+(activeGroup===c.id)+'">'+esc(c[lang()]||c.ar||c.en)+'</button>').join(''):'';
 gallery.style.setProperty('--service-cols',cfg.columns);
 gallery.dataset.ratio=cfg.ratio;
 count.textContent=projectsLoaded?tr('المشاريع المنشورة: ','Published projects: ')+projects.length:'';
 if(!projectsLoaded){gallery.innerHTML='<p class="v17-empty">'+tr('جاري تحميل المشاريع المنشورة...','Loading published projects...')+'</p>';return;}
 gallery.innerHTML=projects.length?projects.map(p=>{
  const image=safeUrl(p.image_url),video=safeUrl(p.video_url);
  const directVideo=video&&/\.(mp4|webm)(\?|$)/i.test(video);
  const href=root+'project.html?slug='+encodeURIComponent(p.slug||'');
  const cover=image?'<img src="'+esc(image)+'" alt="'+esc(label(p,'title'))+'" loading="lazy">':directVideo?'<video muted playsinline preload="metadata" aria-label="'+esc(label(p,'title'))+'"><source src="'+esc(video)+'" type="'+(/\.webm/i.test(video)?'video/webm':'video/mp4')+'"></video>':'<div class="v17-fallback" aria-hidden="true">◇</div>';
  return '<a class="v17-work" href="'+esc(href)+'">'+cover+'<span>'+esc(label(p,'title'))+(directVideo?' ▷':'')+'</span></a>';
 }).join(''):'<p class="v17-empty">'+tr('لا توجد مشاريع منشورة في هذا التصنيف حاليًا. أضف مشروعًا من لوحة التحكم وحدد نفس التصنيف ثم انشره.','No published projects in this category yet. Add and publish one in the dashboard.')+'</p>';
}
document.getElementById('serviceFilters')?.addEventListener('click',e=>{const btn=e.target.closest('[data-service-filter]');if(btn){activeGroup=btn.dataset.serviceFilter;render();}});
document.getElementById('switchLang')?.addEventListener('click',()=>{localStorage.setItem('portfolio_lang',lang()==='ar'?'en':'ar');render();});
document.getElementById('switchTheme')?.addEventListener('click',()=>{const light=document.documentElement.classList.toggle('light');localStorage.setItem('portfolio_theme',light?'light':'dark');});
try{if(localStorage.getItem('portfolio_theme')==='light')document.documentElement.classList.add('light')}catch{}
render();
if(connected){
 try{
  const db=await getClient();
  const [ps,ss,st]=await Promise.all([
   db.from('projects').select('*').eq('is_published',true).order('sort_order'),
   db.from('services').select('*').eq('is_published',true).order('sort_order'),
   db.from('site_settings').select('*').eq('id',1).maybeSingle()
  ]);
  if(ps.error)throw ps.error;
  snapshot={projects:ps.data||[],services:ss.error?[]:ss.data||[],settings:st.error?{}:(st.data||{})};
  projectsLoaded=true;
  render();
 }catch(e){console.warn('Service page data unavailable',e);gallery.innerHTML='<p class="v17-empty">'+tr('تعذر تحميل المشاريع مؤقتًا. حاول تحديث الصفحة.','Projects could not be loaded. Please refresh.')+'</p>';}
}else{gallery.innerHTML='<p class="v17-empty">'+tr('يجب توصيل قاعدة البيانات لعرض المشاريع.','Connect the database to show projects.')+'</p>';}
