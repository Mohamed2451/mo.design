import { seed, readDemo, escapeHTML as esc, safeUrl, tField, ar, en } from './data.js';
import { connected, getPublicContent, sendInquiry } from './api.js';
import {PORTFOLIO_CATEGORIES, categoryFor} from './categories.js';

let model = connected ? {...seed, projects:[], testimonials:[]} : readDemo();
let lang = (()=>{try{return localStorage.getItem('portfolio_lang')==='en'?'en':'ar'}catch{return 'ar'}})();
let theme = (()=>{try{return localStorage.getItem('portfolio_theme')==='light'?'light':'dark'}catch{return 'dark'}})();
let activeCategory = (()=>{const id=new URLSearchParams(location.search).get('category');return PORTFOLIO_CATEGORIES.some(c=>c.id===id)?id:'*';})();
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const txt = () => ({...(lang === 'ar' ? ar : en), ...(model.settings?.[lang==='ar'?'content_ar':'content_en']||{})});
const field = (obj, key) => tField(obj, key, lang);
const number = (n) => String(n).padStart(2, '0');

function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toast.timeout);
  toast.timeout = setTimeout(() => el.classList.remove('show'), 5000);
}
let tickerSignature='';
let tickerResizePending=false;
function refreshTicker(force=false){
 const track=document.querySelector('.ticker-track');
 const shell=track?.closest('.ticker');
 if(!track||!shell)return;
 const words=String(txt().ticker_items||'').split(/\n|\|/).map(w=>w.trim()).filter(Boolean).slice(0,20);
 const selected=words.length?words:['مو ديزاين','تصميم إعلانات','مونتاج فيديو','ذكاء اصطناعي'];
 const signature=selected.join('|')+'::'+lang;
 const viewport=Math.max(shell.clientWidth,window.innerWidth||0,320);
 if(!force && signature===tickerSignature && Number(track.dataset.forWidth)>=viewport)return;
 tickerSignature=signature;
 const build=()=>selected.map(word=>`<span class="ticker-item">${esc(word)}</span>`).join('');
 const first=document.createElement('span');
 first.className='ticker-segment';
 first.innerHTML=build();
 track.replaceChildren(first);
 // Each identical sequence covers the full visible strip, including during the seam.
 let count=0;
 while(first.getBoundingClientRect().width<viewport+160 && count<30){
   first.insertAdjacentHTML('beforeend',build());count++;
 }
 // Three exactly matching segments. Moving by one third of the track is seamless,
 // independent of fonts, fractional pixel sizes or right-to-left page direction.
 for(let i=0;i<2;i++){
   const clone=first.cloneNode(true);
   clone.setAttribute('aria-hidden','true');
   track.appendChild(clone);
 }
 track.dataset.forWidth=String(viewport);
 const distance=first.getBoundingClientRect().width;
 track.style.setProperty('--mo-ticker-time',Math.max(18,distance/85)+'s');
 track.style.animation='none';
 void track.offsetWidth;
 track.style.animation='';
}
window.addEventListener('resize',()=>{
 if(document.hidden||tickerResizePending)return;
 tickerResizePending=true;
 requestAnimationFrame(()=>{tickerResizePending=false;refreshTicker(true);});
},{passive:true});
if(document.fonts?.ready)document.fonts.ready.then(()=>refreshTicker(true)).catch(()=>{});
function updateDocument() {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.classList.toggle('light', theme === 'light');
  $('#langToggle').textContent = lang === 'ar' ? 'EN' : 'ع';
  $('#langToggle').setAttribute('aria-label', lang === 'ar' ? 'Switch to English' : 'التبديل للعربية');
  $('#themeToggle').textContent = theme === 'dark' ? '☼' : '☾';
  $('#themeToggle').setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  refreshTicker();

  $$('[data-brand-logo]').forEach(img => {img.src = safeUrl(model.settings?.[theme==='dark'?'logo_dark_url':'logo_light_url']) || `./assets/images/mo-logo-${theme === 'dark' ? 'white' : 'black'}.webp`;});
  $$('[data-i18n]').forEach(el => {
    const val = txt()[el.dataset.i18n];
    if (val !== undefined) {
      if(['signature_title','why_title'].includes(el.dataset.i18n)){
        const lines=String(val).split('\n');el.innerHTML=`${esc(lines[0]||'')}<br><em>${esc(lines.slice(1).join(' ')||'')}</em>`;
      } else if(['about_title','contact_title'].includes(el.dataset.i18n)) el.innerHTML=String(val).split('\n').map(esc).join('<br>');
      else el.textContent = val;
    }
  });
  document.title = `Mo Design — Mohamed Mahmoud | ${lang === 'ar' ? 'تصميم ومونتاج وذكاء اصطناعي' : 'Design, Editing & AI'}`;
  document.querySelector('meta[name="description"]').content = field(model.settings, 'subheadline');
}
function setBrandContent() {
  const settings = model.settings || seed.settings;
  const photo = safeUrl(settings.profile_image_url);
  if(photo) {document.querySelector('.hero-portrait').src=photo;const about=document.querySelector('.about-photo-mini img');if(about)about.src=photo;}
  $$('[data-brand-logo]').forEach(img=>{img.src=safeUrl(settings[theme==='dark'?'logo_dark_url':'logo_light_url']) || `./assets/images/mo-logo-${theme==='dark'?'white':'black'}.webp`;});
  $('#brandName').textContent = field(settings, 'brand');
  $('#footerBrand').textContent = field(settings, 'brand');
  $('#heroRole').textContent = field(settings, 'role');
  const parts = field(settings, 'headline').split('\n');
  $('#heroTitle').innerHTML = `${esc(parts[0] || '')}<br><em>${esc(parts.slice(1).join(' ') || '')}</em>`;
  $('#heroDescription').textContent = field(settings, 'subheadline');
  $('#aboutDescription').textContent = field(settings, 'bio');
  $('#availabilityText').textContent = settings.availability ? txt().available : txt().unavailable;
  $('#availabilityText').closest('.availability').querySelector('.status-pulse').style.background = settings.availability ? 'var(--accent)' : '#ff9b9b';
  const email = String(settings.contact_email || '').trim();
  const emailLink = $('#contactEmailLink');
  emailLink.textContent = email || txt().email_missing;
  if (email) {
    emailLink.href = `mailto:${encodeURIComponent(email)}`;
    emailLink.removeAttribute('aria-disabled');
    emailLink.classList.remove('is-disabled');
  } else {
    emailLink.href = '#contact';
    emailLink.setAttribute('aria-disabled','true');
    emailLink.classList.add('is-disabled');
  }
  const wa = safeUrl(settings.whatsapp_url) || 'https://wa.me/201097865616';
  ['heroWhatsApp','contactWhatsApp','floatingWhatsApp','ctaWhatsApp'].forEach(id=>{const a=$(`#${id}`);if(a)a.href=wa;});
  const community = safeUrl(settings.community_url) || 'https://chat.whatsapp.com/HvJGMrahSBFBmCxRMxD2Z5';
  $('#communityLink').href = community;
  $('#communityLink').closest('.contact-quick').hidden = !(settings.community_url && safeUrl(settings.community_url));
  document.querySelector('.email-actions').hidden = !email;
  $('#copyrightText').textContent = `© ${new Date().getFullYear()} Mo Design / Mohamed Mahmoud. ${txt().rights}`;
  const countValues=[settings.stats_projects,settings.stats_years,settings.stats_satisfaction];
  $$('.stats-strip [data-count]').forEach((el,i)=>{ const newCount=Math.max(0,Number(countValues[i]??[100,3,100][i])||0);el.dataset.count=String(newCount);el.textContent=String(newCount); });
  const hasStats = countValues.some(v => Number(v) > 0);
  $('.stats-strip').hidden = !settings.stats_verified || !hasStats;
  $('#demoHint').style.display = model.projects.some(p=>String(p.id).startsWith('demo-') && p.is_published) ? 'flex' : 'none';
  const socials = [
    ['Behance',settings.behance_url,'Bē'],['LinkedIn',settings.linkedin_url,'in'],
    ['Instagram',settings.instagram_url,'◎'],['TikTok',settings.tiktok_url,'♪'],
    ['Facebook',settings.facebook_url,'f']
  ];
  $('#socialLinks').innerHTML = socials.filter(([,u])=>safeUrl(u)).map(([name,u,icon])=>`<a href="${esc(safeUrl(u))}" target="_blank" rel="noopener noreferrer" aria-label="${name} — external link"><span class="social-icon" aria-hidden="true">${esc(icon)}</span>${name}<span class="social-arrow">↗</span></a>`).join('');
  $('#socialDisclaimer').hidden = true;
}
function caseUrl(project){
  const slug=String(project.slug||'').trim();
  return `./project.html?slug=${encodeURIComponent(slug)}`;
}

function graphicHTML(project) {
  const type = ['aurora','type','orbit','pop'].includes(project.cover_style) ? project.cover_style : 'aurora';
  const safeImage = safeUrl(project.image_url);
  const isVideo = Boolean(project.video_url || project.youtube_url);
  const art = {aurora:'GO!',type:'aA.',orbit:'',pop:'WOW!'}[type];
  return `<div class="project-cover ${safeImage ? 'custom' : type}">${safeImage ? `<img class="cover-img" src="${esc(safeImage)}" alt="${esc(field(project, 'title'))}" loading="lazy" onerror="this.style.display='none'">` : `<div class="cover-graphic" aria-hidden="true">${art}</div>`}<span class="cover-label">${esc(field(project, 'category'))}${isVideo ? ' ▶ VIDEO' : ''}</span><span class="cover-arrow">↗</span></div>`;
}
function renderFilters() {
 const categories=PORTFOLIO_CATEGORIES;
 if(activeCategory!=='*'&&!categories.some(c=>c.id===activeCategory))activeCategory='*';
 const pills=[{id:'*',ar:txt().all,en:txt().all},...categories];
 $('#workFilters').innerHTML=pills.map(c=>`<button type="button" class="filter-pill ${activeCategory===c.id?'active':''}" data-filter="${esc(c.id)}" aria-pressed="${activeCategory===c.id}">${esc(lang==='ar'?c.ar:c.en)}</button>`).join('');
}
function renderProjects() {
 renderFilters();
 const items = model.projects.filter(p=>p.is_published&&(activeCategory==='*'||categoryFor(p)?.id===activeCategory)).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));
 $('#worksCount').textContent=lang==='ar'?`${number(items.length)} عمل`:`${number(items.length)} projects`;
 $('#projectGrid').setAttribute('aria-live','polite');
 $('#projectGrid').innerHTML=items.length?items.map((p,i)=>`<article class="project-card reveal"><a class="project-cover-button" href="${esc(caseUrl(p))}" style="display:block;width:100%" aria-label="${esc(txt().details)}: ${esc(field(p,'title'))}">${graphicHTML(p)}</a><div class="project-meta"><div><h3>${esc(field(p,'title'))}</h3><p>${esc((categoryFor(p)||{})[lang]||field(p,'category'))}</p></div><span class="project-index">/${number(i+1)}</span></div></article>`).join(''):`<p class="admin-empty">${esc(txt().no_projects)}</p>`;
 observeReveal();
}
function renderServices() {
  const items = model.services.filter(s=>s.is_published).sort((a,b)=>(a.sort_order || 0)-(b.sort_order || 0));
  const icons = {diamond:'◇',sparkles:'✳',play:'▷',layout:'▦',target:'◎',brush:'✺'};
  const serviceCategory = service => {
    const id=String(service.id||'').toLowerCase();
    const name=[service.title_en,service.title_ar].join(' ').toLowerCase();
    if(id==='service-edit'||/reels|podcast|video|مونتاج|ريلز|بودكاست/.test(name))return PORTFOLIO_CATEGORIES[1].id;
    if(id==='service-ai'||id==='service-prompts'||/artificial|\bai\b|prompt|ذكاء|اصطناعي/.test(name))return PORTFOLIO_CATEGORIES[2].id;
    if(id==='service-brand'||/brand|identity|هوية|براند/.test(name))return PORTFOLIO_CATEGORIES[3].id;
    if(id==='service-ads'||/social|advertis|ads|سوشيال|إعلان/.test(name))return PORTFOLIO_CATEGORIES[0].id;
    return '';
  };
  const servicePage = service => {
    const id=String(service.id||'').toLowerCase();
    const name=[service.title_en,service.title_ar].join(' ').toLowerCase();
    if(id==='service-prompts'||/prompt|برومبت/.test(name))return 'prompt-engineering';
    if(id==='service-edit'||/reels|podcast|video|مونتاج|ريلز|بودكاست/.test(name))return 'video-motion';
    if(id==='service-ai'||/artificial|\\bai\\b|ذكاء|اصطناعي/.test(name))return 'ai-creative';
    if(id==='service-brand'||/brand|identity|هوية|براند/.test(name))return 'branding';
    if(id==='service-ads'||/social|advertis|ads|سوشيال|إعلان/.test(name))return 'social-media';
    return '';
  };
  $('#servicesList').innerHTML = items.map((s,i)=>`<article class="service-item reveal"><span class="service-number">/${number(i+1)}</span><h3 class="service-title"><a href="${servicePage(s)?`./services/${servicePage(s)}/`:`./index.html?category=${encodeURIComponent(serviceCategory(s)||"")}#work`}" style="color:inherit;text-decoration:none">${esc(field(s,'title'))}</a></h3><p class="service-desc">${esc(field(s,'description'))}</p><a href="${servicePage(s)?`./services/${servicePage(s)}/`:`./index.html?category=${encodeURIComponent(serviceCategory(s)||"")}#work`}" class="service-mark" aria-label="${esc(txt().details)}: ${esc(field(s,'title'))}">${icons[s.icon] || '↗'}</a></article>`).join('');
  observeReveal();
}
function showProject(id) {
  const p = model.projects.find(p=>String(p.id)===String(id));
  if(!p) return;
  const link = safeUrl(p.external_url);
  const visit = link ? `<a href="${esc(link)}" target="_blank" rel="noopener noreferrer" class="pill-btn primary-btn">${esc(txt().visit)} ↗</a>` : `<span class="admin-note">${esc(txt().no_link)}</span>`;
  $('#dialogContents').innerHTML = `<div class="dialog-body">${graphicHTML(p)}<span class="dialog-tag">${esc(field(p,'category'))}</span><h2>${esc(field(p,'title'))}</h2><p>${esc(field(p,'summary'))}</p><p class="concept-notice">${esc(String(p.id).startsWith('demo-') ? txt().feature_disclaimer : '')}</p>${visit}</div>`;
  $('#projectDialog').showModal();
}
let featureIndex = 0;
function featuredItems() {
  return model.projects.filter(p => p.is_published && p.featured).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));
}
function renderFeatured() {
  const projects=featuredItems();
  const count=projects.length;
  const stage=$('#featureStage');
  if(!count){$('#featured').hidden=true;$('#featureCards').innerHTML='';$('#featureCount').textContent='00 / 00';$('#featureDots').innerHTML='';return;}
  $('#featured').hidden=false;
  featureIndex=((featureIndex%count)+count)%count;
  const dist=(a,b)=>((a-b+count)%count);
  $('#featureCards').innerHTML=projects.map((p,i)=>{
    const d=dist(i,featureIndex), reverse=dist(featureIndex,i);
    const position=d===0?'active':reverse===1?'prev':d===1?'next':reverse===2?'far-prev':d===2?'far-next':'hidden';
    const asset=safeUrl(p.image_url);
    return `<article class="feature-slide" data-position="${position}" data-slide-index="${i}" ${position==='active'?'':'aria-hidden="true"'}>
      <a class="feature-project-link" href="${esc(caseUrl(p))}" tabindex="${position==='active'?'0':'-1'}" aria-label="${esc(txt().details)}: ${esc(field(p,'title'))}">
      ${asset ? `<img src="${esc(asset)}" alt="${esc(field(p,'title'))}" loading="${i<3?'eager':'lazy'}"/>` : `<div class="project-cover ${esc(p.cover_style||'aurora')}" style="height:100%"><div class="cover-graphic">✳</div></div>`}
      <span class="feature-scrim" aria-hidden="true"></span><span class="feature-info"><span class="feature-tag">${esc(field(p,'category'))}</span><h3>${esc(field(p,'title'))}</h3><p>${p.project_type==='concept'||String(p.id).startsWith('demo-')?(lang==='ar'?'تصوّر إبداعي':'Concept work'):(lang==='ar'?'مشروع من أعمالي':'Portfolio project')} · ${number(i+1)}</p></span>
      </a></article>`;
  }).join('');
  $('#featureCount').textContent=`${number(featureIndex+1)} / ${number(count)}`;
  $('#featureDots').innerHTML=projects.map((p,i)=>`<button type="button" class="feature-dot" data-feature-to="${i}" aria-label="${lang==='ar'?'الذهاب إلى مشروع':'Go to project'} ${i+1}" aria-current="${i===featureIndex}"></button>`).join('');
  stage.querySelectorAll('.feature-slide').forEach(el=>{el.inert=el.dataset.position!=='active';});
}
function moveFeature(delta){const a=featuredItems();if(!a.length)return;featureIndex=(featureIndex+delta+a.length)%a.length;renderFeatured();}
function renderReviews() {
  const items=(model.testimonials||[]).filter(r=>r.is_published && r.is_verified).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));
  $('#testimonialsGrid').innerHTML=items.map((r,i)=>{
    const verified=Boolean(r.is_verified);
    const name=field(r,'author')|| (lang==='ar'?'مساحة لرأي عميل':'Client review space');
    return `<article class="review-card reveal ${verified?'verified':''}"><div class="review-person"><div class="review-avatar" aria-hidden="true">${esc(name.trim().slice(0,1).toUpperCase())}</div><div><h3>${esc(name)}</h3><p>${esc(field(r,'job'))}</p></div><span class="review-badge">${esc(verified?txt().review_verified:txt().review_placeholder)}</span></div>
    <div class="review-stars" aria-label="${verified&&Number(r.rating)>0?`${Number(r.rating)}/5`:''}">${Number(r.rating)>0 ? '★'.repeat(Math.min(5,Math.max(1,Number(r.rating)))) : '✦  MO DESIGN  ✦'}</div><p class="review-quote">${esc(field(r,'quote'))}</p><div class="review-bottom"><span>${verified?'✓':'◎'} ${esc(verified?txt().review_verified:txt().review_placeholder)}</span><span>MO DESIGN / ${number(i+1)}</span></div></article>`;
  }).join('') || `<p class="admin-empty">${esc(lang==='ar'?'قريبًا: تقييمات العملاء':'Client feedback coming soon')}</p>`;
  $('#testimonials').hidden = items.length===0;
  $('#testimonials').classList.toggle('no-reviews',items.length===0);
  $('.reviews-note').hidden = true; // Verified published client reviews need no fictional-placeholder disclaimer.
  observeReveal();
}
$('#featurePrev').addEventListener('click',()=>moveFeature(-1));
$('#featureNext').addEventListener('click',()=>moveFeature(1));
$('#featureDots').addEventListener('click',e=>{const b=e.target.closest('[data-feature-to]');if(b){featureIndex=Number(b.dataset.featureTo);renderFeatured();}});

$('#featureStage').addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();moveFeature(1);}else if(e.key==='ArrowLeft'){e.preventDefault();moveFeature(-1);}});
let touchX=0;
$('#featureStage').addEventListener('touchstart',e=>{touchX=e.changedTouches[0]?.screenX||0;},{passive:true});
$('#featureStage').addEventListener('touchend',e=>{const dx=(e.changedTouches[0]?.screenX||0)-touchX;if(Math.abs(dx)>55)moveFeature(dx<0?1:-1);},{passive:true});

function renderSubjects() {
  $('#serviceSelect').innerHTML = txt().subject_options.map((v,i)=>`<option value="${esc(v)}" ${i===0?'disabled selected':''}>${esc(v)}</option>`).join('');
}

function renderTools() {
 const defs=[
   {id:'photoshop',name:'Adobe Photoshop',ar:'تصميم الإعلانات وتعديل الصور',en:'Design and photo retouching'},
   {id:'illustrator',name:'Adobe Illustrator',ar:'الشعارات والهوية البصرية',en:'Logos and vector identities'},
   {id:'premiere',name:'Adobe Premiere Pro',ar:'مونتاج الفيديوهات والريلز',en:'Video and reels editing'},
   {id:'resolve',name:'DaVinci Resolve',ar:'مونتاج وتصحيح الألوان',en:'Editing and color grading'},
   {id:'capcut',name:'CapCut',ar:'مونتاج المقاطع القصيرة',en:'Short-form editing'},
   {id:'higgsfield',name:'Higgsfield',ar:'إنشاء فيديوهات وصور بالذكاء الاصطناعي',en:'AI image and video creation'},
   {id:'flow',name:'Google Flow',ar:'صناعة فيديوهات بالذكاء الاصطناعي',en:'AI video creation'}
 ];
 const grid=$('#toolsGrid');if(!grid)return;
 grid.innerHTML=defs.map((d,i)=>`<article class="tool-card reveal" tabindex="0">
  <div class="tool-badge"><img loading="lazy" src="./assets/icons/${['resolve','capcut','higgsfield','flow'].includes(d.id)?d.id+'.png':d.id+'.svg'}" alt="${esc(d.name)}" width="56" height="56"></div>
  <div class="tool-copy"><h3 dir="ltr">${esc(d.name)}</h3><p>${esc(lang==='ar'?d.ar:d.en)}</p></div><span class="tool-index">${number(i+1)}</span></article>`).join('');
}

function applyInteractiveFX(){
  // Heavy per-card pointer tracking was causing unnecessary layout work.
  // CSS hover effects remain; no pointermove listeners are registered.
}

function observeReveal() {
  // Progressive enhancement: items are visible by default.
  // Hide only after the observer is successfully attached so a JS/network
  // failure cannot leave the complete portfolio invisible.
  const nodes = $$('.reveal:not(.visible)');
  if(!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    nodes.forEach(n=>{ n.classList.remove('will-reveal'); n.classList.add('visible'); });
    return;
  }
  nodes.forEach(node=>{
    try { observer.observe(node); node.classList.add('will-reveal'); }
    catch(err) { console.error('Reveal observer:',err); node.classList.add('visible'); }
  });
}
const observer = new IntersectionObserver((entries,ob)=>entries.forEach(e=>{
  if(e.isIntersecting){e.target.classList.add('visible');ob.unobserve(e.target);}
}),{threshold:.06,rootMargin:'0px 0px 20px 0px'});

function renderSignature() {
  const projects=(model.projects||[]).filter(p=>p.is_published).sort((a,b)=>(Number(b.featured)-Number(a.featured)) || ((a.sort_order||0)-(b.sort_order||0))).slice(0,3);
  const gallery=document.querySelector('.editorial-gallery');
  if(!gallery)return;
  if(!projects.length){ document.querySelector('#signature').hidden=true; return; }
  gallery.innerHTML=projects.map((p,i)=>`<a class="editorial-tile editorial-tile-${'abc'[i]}" href="${esc(caseUrl(p))}">${safeUrl(p.image_url)?`<img src="${esc(safeUrl(p.image_url))}" loading="lazy" alt="${esc(field(p,'title'))}">`:`<div class="editorial-fallback">✳</div>`}<span>${esc(field(p,'title'))}</span></a>`).join('');
  const first=document.querySelector('.editorial-link');if(first)first.href=caseUrl(projects[0]);
}
function applySectionVisibility(){
 const visibility=model.settings?.section_visibility||{};
 const sections=['featured','signature','work','services','tools','why','about','process','testimonials','faq','cta','learn','contact'];
 for(const id of sections){const node=document.getElementById(id);if(node){ const enabled=visibility[id]!==false; node.hidden=!enabled || (['featured','signature'].includes(id) && !model.projects.some(p=>p.is_published && (id==='signature'||p.featured))) || (id==='testimonials' && !model.testimonials.some(r=>r.is_verified && r.is_published)); }}
}
function youtubeId(value) {
  try {
    const u=new URL(value),host=u.hostname.toLowerCase(); let id='';
    if(host==='youtu.be'||host==='www.youtu.be') id=u.pathname.slice(1).split('/')[0];
    else if(['youtube.com','www.youtube.com','m.youtube.com','music.youtube.com'].includes(host)) {
      if(u.pathname==='/watch')id=u.searchParams.get('v')||'';
      else if(/^\/(shorts|embed|live)\//.test(u.pathname))id=u.pathname.split('/')[2]||'';
    }
    return /^[A-Za-z0-9_-]{11}$/.test(id)?id:'';
  } catch {return '';}
}
function renderLearning() {
  const section=$('#learn'),list=$('#learningList');if(!section||!list)return;
  const settings=model.settings||seed.settings;
  const mode=['hidden','coming_soon','live'].includes(settings.education_mode)?settings.education_mode:'coming_soon';
  const visibility=settings.section_visibility||{};
  section.hidden=(visibility.learn===false||mode==='hidden');
  if(section.hidden)return;
  const live=mode==='live';
  const copy=txt();
  const header=section.querySelector('[data-i18n="learn_title"]');
  const intro=section.querySelector('[data-i18n="learn_desc"]');
  const badge=section.querySelector('[data-i18n="learn_tag"]');
  header.textContent=live?copy.learn_live_title|| (lang==='ar'?'بدأت أنشر محتوى جديد':'New content is live'):copy.learn_title;
  intro.textContent=live?copy.learn_live_desc||'':copy.learn_desc;
  badge.textContent=live?copy.learn_live_tag||'':copy.learn_tag;
  list.hidden=!live;
  if(!live)return;
  const published=(model.learning_items||[]).filter(item=>item.is_published);
  if(!published.length) {
    list.innerHTML=`<p class="learning-empty">${lang==='ar'?'لسه بنجهّز أول درس. تابعنا قريب.':'First lesson coming soon.'}</p>`;
    return;
  }
  const cards=published.map((item,index)=>{
    const title=field(item,'title'),summary=field(item,'summary');
    const video=item.content_type==='video';
    const id=video?youtubeId(item.youtube_url):'';
    const customThumb=safeUrl(item.thumbnail_url);
    const thumb=customThumb||(id?`https://i.ytimg.com/vi/${id}/hqdefault.jpg`:'');
    return `<a class="learning-card reveal" href="./lesson.html?id=${encodeURIComponent(item.id)}" aria-label="${esc(title)}">
      <span class="learning-thumb">${thumb?`<img src="${esc(thumb)}" alt="" loading="lazy" onerror="this.style.display='none'">`:`<span class="learning-abstract" aria-hidden="true">✳</span>`}<span class="learning-play" aria-hidden="true">${video?'▶':'↗'}</span></span>
      <span class="learning-item-meta">${video?(lang==='ar'?'فيديو تعليمي':'Video lesson'):(lang==='ar'?'مقال':'Article')} <span> / ${String(index+1).padStart(2,'0')}</span></span>
      <strong>${esc(title)}</strong><span class="learning-item-desc">${esc(summary)}</span>
    </a>`;
  });
  list.innerHTML=cards.join('');
}

function syncRealWorkCopy(){
 const projects=(model.projects||[]).filter(p=>p.is_published);
 const real=projects.some(p=>!String(p.id).startsWith('demo-') && p.project_type!=='concept');
 const concepts=projects.some(p=>(String(p.id).startsWith('demo-') || p.project_type==='concept'));
 const featuredConcepts=projects.some(p=>p.featured && (String(p.id).startsWith('demo-') || p.project_type==='concept'));
 const reviews=(model.testimonials||[]).some(r=>r.is_published&&r.is_verified);
 const copy=txt(),defaults=lang==='ar'?ar:en;
 const original=value=>String(value||'').trim();
 const put=(key,value)=>{const el=document.querySelector(`[data-i18n="${key}"]`);if(!el)return;
   const saved=model.settings?.[lang==='ar'?'content_ar':'content_en']?.[key];
   if(saved!==undefined&&original(saved)!==original(defaults[key]))return; // Honor custom text.
   el.textContent=value;
 };
 const disclaimer=$('.feature-disclaimer');if(disclaimer){disclaimer.hidden=!featuredConcepts;if(featuredConcepts)disclaimer.textContent=lang==='ar'?'بعض المشاريع المميزة تصورات إبداعية وليست أعمالًا مدفوعة.':'Some featured projects are personal concepts, not client commissions.';}
 const conceptCaption=$('.editorial-caption');if(conceptCaption){conceptCaption.hidden=!concepts;if(concepts)conceptCaption.textContent=lang==='ar'?'بعض الأعمال تصورات مستقلة ومميزة بوضوح.':'Some portfolio work is clearly labeled as an independent concept.';}
 if(real){put('selected_sub',copy.selected_real_sub||defaults.selected_real_sub);put('feature_sub',copy.featured_real_sub||defaults.featured_real_sub);}
 if(reviews)put('reviews_sub',copy.reviews_real_sub||defaults.reviews_real_sub);
 const note=$('.reviews-note');if(note)note.hidden=true;
}
function renderNotice(){
 const cfg=model.settings?.site_notice||{};let node=document.getElementById('moNotice');
 if(node){clearTimeout(renderNotice.timer);node.remove();}
 if(!cfg.enabled)return;
 const now=Date.now(); const start=Date.parse(cfg.starts_at||'');const end=Date.parse(cfg.ends_at||'');
 if((Number.isFinite(start)&&now<start)||(Number.isFinite(end)&&now>end))return;
 const title=lang==='ar'?(cfg.title_ar||cfg.title_en):(cfg.title_en||cfg.title_ar);
 const body=lang==='ar'?(cfg.message_ar||cfg.message_en):(cfg.message_en||cfg.message_ar);
 if(!title&&!body)return;
 const dismissKey='mo_notice_closed_'+encodeURIComponent(String(cfg.id||'')+'_'+String(cfg.starts_at||''));
 try { if(sessionStorage.getItem(dismissKey))return; } catch {}
 node=document.createElement('aside');node.className='mo-notice';node.id='moNotice';node.setAttribute('role','status');node.setAttribute('aria-live','polite');
 node.innerHTML=`<button type="button" aria-label="${lang==='ar'?'إغلاق الإشعار':'Dismiss notice'}">×</button>${title?`<strong>${esc(title)}</strong>`:''}${body?`<p>${esc(body)}</p>`:''}`;
 const dismiss=()=>{try{sessionStorage.setItem(dismissKey,'1')}catch{} node.remove()};
 node.querySelector('button').addEventListener('click',dismiss);
 document.body.appendChild(node);
 renderNotice.timer=setTimeout(dismiss,Math.max(3,Math.min(120,Number(cfg.duration_seconds)||30))*1000);
}
function applySectionDesign(){
 const design=model.settings?.section_design||{};
 const validHex=v=>/^#[0-9a-f]{6}$/i.test(v||'')?v:'';
 for(const [id,raw] of Object.entries(design)){
  const section=document.getElementById(id);
  if(!section || !raw || typeof raw!=='object')continue;
  const target=['cta','learn'].includes(id)?section.querySelector(id==='cta'?'.cta-statement':'.learn-panel'):section;
  if(!target)continue;
  // Reset previously applied styles when the custom section design is disabled.
  if(raw.enabled!==true){
    target.classList.remove('v11-designed','v11-with-cover','v12-custom-font','v12-custom-heading','v12-custom-body');
    for(const key of ['--v11-bg','--v11-fg','--v11-accent','--v11-pad','--v11-minh','--v11-cover','--v11-shade','--v12-section-font','--v12-heading-size','--v12-body-size']){
      target.style.removeProperty(key);
    }
    continue;
  }
  const mode=theme==='light'?'light':'dark';
  const background=validHex(raw[mode+'_bg']);
  const foreground=validHex(raw[mode+'_text']);
  const accent=validHex(raw[mode+'_accent']);
  const cover=safeUrl(raw.cover_url);
  const allowedCover=cover && /^https?:\/\//i.test(cover)?cover:'';
  target.classList.add('v11-designed');
  if(background)target.style.setProperty('--v11-bg',background);else target.style.removeProperty('--v11-bg');
  if(foreground)target.style.setProperty('--v11-fg',foreground);else target.style.removeProperty('--v11-fg');
  if(accent)target.style.setProperty('--v11-accent',accent);else target.style.removeProperty('--v11-accent');
  const font=['Alexandria','Cairo','Readex Pro','IBM Plex Sans Arabic'].includes(raw.font)?raw.font:'';
  target.classList.toggle('v12-custom-font',Boolean(font));
  if(font)target.style.setProperty('--v12-section-font',`'${font}',sans-serif`);else target.style.removeProperty('--v12-section-font');
  const heading=Math.max(0,Math.min(110,Number(raw.heading_size)||0));
  const body=Math.max(0,Math.min(32,Number(raw.body_size)||0));
  target.classList.toggle('v12-custom-heading',Boolean(heading));
  if(heading)target.style.setProperty('--v12-heading-size',heading+'px');else target.style.removeProperty('--v12-heading-size');
  target.classList.toggle('v12-custom-body',Boolean(body));
  if(body)target.style.setProperty('--v12-body-size',body+'px');else target.style.removeProperty('--v12-body-size');
  target.style.setProperty('--v11-pad',`${Math.max(36,Math.min(220,Number(raw.padding)||90))}px`);
  target.style.setProperty('--v11-minh',`${Math.max(0,Math.min(900,Number(raw.height)||0))}px`);
  if(allowedCover){
    // URL constructor escapes unsafe input; only HTTPS/http assets are displayed.
    const clean=allowedCover.replace(/["()]/g,'').replaceAll(String.fromCharCode(92),'');
    target.style.setProperty('--v11-cover',`url("${clean}")`);
    target.classList.add('v11-with-cover');
    target.style.setProperty('--v11-shade',String(Math.max(.1,Math.min(.92,Number(raw.shade)||.7))));
  }else{target.classList.remove('v11-with-cover');target.style.removeProperty('--v11-cover');}
 }
}
function render() {
  // Independent sections: an error in one widget must never blank the whole site.
  const stages = [
    ['document',updateDocument],
    ['hero',setBrandContent],
    ['projects',renderProjects],
    ['featured',renderFeatured],
    ['signature',renderSignature],
    ['services',renderServices],
    ['tools',renderTools],
    ['testimonials',renderReviews],
    ['subjects',renderSubjects],
    ['visibility',applySectionVisibility],
    ['learning',renderLearning],
    ['appearance',applySectionDesign],
    ['proof copy',syncRealWorkCopy],
    ['notice',renderNotice],
    ['interactive effects',applyInteractiveFX]
  ];
  for(const [name,run] of stages) {
    try { run(); } catch(error) { console.error('Mo Design section failed:',name,error); }
  }
  try { observeReveal(); } catch(error) {
    console.error('Mo Design reveal fallback:',error);
    $$('.reveal').forEach(el=>el.classList.add('visible'));
  }
}

$('#learningList').addEventListener('click',e=>{
 const button=e.target.closest('[data-lesson]');if(!button)return;
 const item=(model.learning_items||[]).find(x=>String(x.id)===button.dataset.lesson&&x.is_published);
 if(!item)return;
 const dialog=$('#learningDialog'),body=$('#learningDialogBody');
 const title=esc(field(item,'title')),description=esc(field(item,'summary'));
 const id=item.content_type==='video'?youtubeId(item.youtube_url):'';
 const fileVideo=item.content_type==='video'?safeUrl(item.video_url):'';
 const article=esc(field(item,'body')).replace(/\n/g,'<br>');
 body.innerHTML=`<h2>${title}</h2><p>${description}</p>${id?`<div class="learning-player"><iframe src="https://www.youtube-nocookie.com/embed/${id}?rel=0" title="${title}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>`:fileVideo?`<div class="learning-player"><video src="${esc(fileVideo)}" controls playsinline preload="none"></video></div>`:`<div class="learning-article">${article||esc(lang==='ar'?'تفاصيل المقال هتظهر قريب.':'Article details coming soon.')}</div>`}`;
 dialog.showModal();
});
$('#learningClose').addEventListener('click',()=>$('#learningDialog').close());
$('#learningDialog').addEventListener('click',e=>{if(e.target.id==='learningDialog')e.target.close();});
$('#learningDialog').addEventListener('close',()=>{$('#learningDialogBody').innerHTML='';});
$('#copyEmail').addEventListener('click',async ()=>{
  const email=String(model.settings?.contact_email||'').trim();
  if(!email){toast(txt().email_missing);return;}
  try { await navigator.clipboard.writeText(email);toast(txt().copied); }
  catch {const input=document.createElement('textarea');input.value=email;document.body.append(input);input.select();document.execCommand('copy');input.remove();toast(txt().copied);}
});
const statObserver = ('IntersectionObserver' in window) ? new IntersectionObserver((entries,obs)=>{
  entries.forEach(({target,isIntersecting})=>{if(!isIntersecting)return;obs.unobserve(target);
    const end=Number(target.dataset.count)||0;
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){target.textContent=end;return;}
    const t0=performance.now();const duration=1100;
    const step=(now)=>{const t=Math.min(1,(now-t0)/duration);target.textContent=Math.round(end*(1-Math.pow(1-t,3)));if(t<1)requestAnimationFrame(step);};
    requestAnimationFrame(step);
  });
},{threshold:.3}) : null;
$$('[data-count]').forEach(el=>statObserver ? statObserver.observe(el):el.textContent=el.dataset.count);

$('#langToggle').addEventListener('click',()=>{lang=lang==='ar'?'en':'ar';try{localStorage.setItem('portfolio_lang',lang)}catch{}render();});
$('#themeToggle').addEventListener('click',()=>{theme=theme==='dark'?'light':'dark';try{localStorage.setItem('portfolio_theme',theme)}catch{}render();});
$('#mobileMenuBtn').addEventListener('click',()=>{
  const isOpen = $('#mobileNav').classList.toggle('open');
  $('#mobileMenuBtn').setAttribute('aria-expanded',String(isOpen));
});
$('#mobileNav').addEventListener('click',e=>{if(e.target.closest('a')){$('#mobileNav').classList.remove('open');$('#mobileMenuBtn').setAttribute('aria-expanded','false');}});
$('#workFilters').addEventListener('click',e=>{const btn=e.target.closest('button[data-filter]');if(btn){activeCategory=btn.dataset.filter;renderProjects();}});
$('#projectGrid').addEventListener('click',e=>{const btn=e.target.closest('button[data-project]');if(btn)showProject(btn.dataset.project);});
$('#dialogClose').addEventListener('click',()=>$('#projectDialog').close());
$('#projectDialog').addEventListener('click',e=>{if(e.target===$('#projectDialog'))$('#projectDialog').close();});
$('#contactForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const form = e.currentTarget;
  if(!form.reportValidity())return;
  const f = new FormData(form);
  if(f.get('website')) return; // spam honeypot
  const vals={name:String(f.get('name')||''),email:String(f.get('email')||''),phone:String(f.get('phone')||''),service:String(f.get('service')||''),message:String(f.get('message')||''),company:String(f.get('company')||''),budget:String(f.get('budget')||''),timeline:String(f.get('timeline')||''),reference_url:String(f.get('reference_url')||'')};
  const button=form.querySelector('button[type=submit]');
  button.disabled=true; button.querySelector('span').textContent=txt().submitting;
  $('#formMessage').textContent='';
  try {
    const result=await sendInquiry(vals);
    if(result.mode==='email'){
      const phone = (model.settings.whatsapp_url || 'https://wa.me/201097865616').split('?')[0];
      const info = lang==='ar' ? `طلب مشروع من موقع Mo Design\nالاسم: ${vals.name}\nالبريد: ${vals.email}\nالهاتف: ${vals.phone||'—'}\nالخدمة: ${vals.service}\nالشركة: ${vals.company || "—"}\nالميزانية: ${vals.budget || "—"}\nالمدة: ${vals.timeline || "—"}\nمرجع: ${vals.reference_url || "—"}\nالتفاصيل: ${vals.message}` : `Project enquiry from Mo Design\nName: ${vals.name}\nEmail: ${vals.email}\nPhone: ${vals.phone||'—'}\nService: ${vals.service}\nCompany: ${vals.company || "—"}\nBudget: ${vals.budget || "—"}\nTimeline: ${vals.timeline || "—"}\nReference: ${vals.reference_url || "—"}\nBrief: ${vals.message}`;
      const url = `${safeUrl(phone) || 'https://wa.me/201097865616'}?text=${encodeURIComponent(info)}`;
      // Existing user gesture, opens direct WhatsApp as a transparent fallback.
      const opened=window.open(url,'_blank','noopener,noreferrer');
      if(!opened) window.location.href=url;
      $('#formMessage').textContent=txt().email_open;
    } else {form.reset();renderSubjects();$('#formMessage').textContent=txt().sent;}
  } catch(error) { console.error(error);$('#formMessage').textContent=txt().send_error; }
  finally {button.disabled=false;button.querySelector('span').textContent=txt().submit;}
});
if(window.matchMedia('(hover: hover) and (pointer: fine)').matches){
  const glow=$('#cursorGlow');
  window.addEventListener('pointermove',e=>{glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px';glow.style.opacity='1';},{passive:true});
}
render();
if(connected){
  getPublicContent().then(data=>{
    model=data;
    render();
    if(data._loadWarnings?.length) {
      console.warn('Mo Design: some public content is temporarily unavailable:',data._loadWarnings);
      toast(lang==='ar'?'بعض محتويات الموقع غير متاحة مؤقتًا. حاول تحديث الصفحة لاحقًا.':'Some content is temporarily unavailable. Please refresh later.');
    }
  }).catch(err=>{
    console.error('Mo Design: public content loading failed:',err);
    // Preserve the last successfully rendered state; never erase real projects on an error.
    toast(lang==='ar'?'تعذر تحديث البيانات مؤقتًا. حاول مجددًا لاحقًا.':'Content could not be refreshed. Please try again later.');
  });
}
