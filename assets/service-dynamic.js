import {connected,getClient} from './api.js';
import {escapeHTML as esc,safeUrl} from './data.js';
import {PORTFOLIO_CATEGORIES,categoryFor} from './categories.js';
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
let snapshot={services:[],projects:[]};
let projectsLoaded=false;
function render(){
 document.documentElement.lang=lang();document.documentElement.dir=lang()==='ar'?'rtl':'ltr';
 document.querySelectorAll('[data-ar][data-en]').forEach(el=>{el.textContent=el.dataset[lang()];});
 const category=PORTFOLIO_CATEGORIES[config.category];
 const service=snapshot.services.find(s=>s.id===config.service)
  ||snapshot.services.find(s=>new RegExp(category.en.split(' ')[0],'i').test([s.title_en,s.title_ar].join(' ')));
 title.textContent=label(service,'title')||category[lang()];
 desc.textContent=label(service,'description')||tr('نماذج من المشاريع المنشورة في هذا التخصص.','Published work in this specialty.');
 document.title=title.textContent+' | Mo Design';
 const projects=snapshot.projects.filter(p=>p.is_published===true && categoryFor(p)?.id===category.id)
  .sort((a,b)=>(Number(a.sort_order)||0)-(Number(b.sort_order)||0));
 count.textContent=projectsLoaded?tr('المشاريع المنشورة: ','Published projects: ')+projects.length:'';
 if(!projectsLoaded){gallery.innerHTML='<p class="v17-empty">'+tr('جاري تحميل المشاريع المنشورة...','Loading published projects...')+'</p>';return;}
 gallery.innerHTML=projects.length?projects.map(p=>{
  const image=safeUrl(p.image_url);
  const href=root+'project.html?slug='+encodeURIComponent(p.slug||'');
  return '<a class="v17-work" href="'+esc(href)+'">'+(image?'<img src="'+esc(image)+'" alt="'+esc(label(p,'title'))+'" loading="lazy">':'<div class="v17-fallback" aria-hidden="true">◇</div>')+'<span>'+esc(label(p,'title'))+'</span></a>';
 }).join(''):'<p class="v17-empty">'+tr('لا توجد مشاريع منشورة في هذا التصنيف حاليًا. أضف مشروعًا من لوحة التحكم وحدد نفس التصنيف ثم انشره.','No published projects in this category yet. Add and publish one in the dashboard.')+'</p>';
}
document.getElementById('switchLang')?.addEventListener('click',()=>{localStorage.setItem('portfolio_lang',lang()==='ar'?'en':'ar');render();});
document.getElementById('switchTheme')?.addEventListener('click',()=>{const light=document.documentElement.classList.toggle('light');localStorage.setItem('portfolio_theme',light?'light':'dark');});
try{if(localStorage.getItem('portfolio_theme')==='light')document.documentElement.classList.add('light')}catch{}
render();
if(connected){
 try{
  const db=await getClient();
  const [ps,ss]=await Promise.all([
   db.from('projects').select('*').eq('is_published',true).order('sort_order'),
   db.from('services').select('*').eq('is_published',true).order('sort_order')
  ]);
  if(ps.error)throw ps.error;
  snapshot={projects:ps.data||[],services:ss.error?[]:ss.data||[]};
  projectsLoaded=true;
  render();
 }catch(e){console.warn('Service page data unavailable',e);gallery.innerHTML='<p class="v17-empty">'+tr('تعذر تحميل المشاريع مؤقتًا. حاول تحديث الصفحة.','Projects could not be loaded. Please refresh.')+'</p>';}
}else{gallery.innerHTML='<p class="v17-empty">'+tr('يجب توصيل قاعدة البيانات لعرض المشاريع.','Connect the database to show projects.')+'</p>';}
