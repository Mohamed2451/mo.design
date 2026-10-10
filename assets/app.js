import { seed, readDemo, escapeHTML as esc, safeUrl, tField, ar, en } from './data.js';
import { connected, getPublicContent, sendInquiry } from './api.js';

let model = readDemo();
let lang = localStorage.getItem('portfolio_lang') === 'en' ? 'en' : 'ar';
let theme = localStorage.getItem('portfolio_theme') === 'light' ? 'light' : 'dark';
let activeCategory = '*';
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const txt = () => lang === 'ar' ? ar : en;
const field = (obj, key) => tField(obj, key, lang);
const number = (n) => String(n).padStart(2, '0');

function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toast.timeout);
  toast.timeout = setTimeout(() => el.classList.remove('show'), 5000);
}
function updateDocument() {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.classList.toggle('light', theme === 'light');
  $('#langToggle').textContent = lang === 'ar' ? 'EN' : 'ع';
  $('#langToggle').setAttribute('aria-label', lang === 'ar' ? 'Switch to English' : 'التبديل للعربية');
  $('#themeToggle').textContent = theme === 'dark' ? '☼' : '☾';
  $('#themeToggle').setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  $$('[data-brand-logo]').forEach(img => {img.src = `./assets/images/mo-logo-${theme === 'dark' ? 'white' : 'black'}.webp`;});
  $$('[data-i18n]').forEach(el => {
    const val = txt()[el.dataset.i18n];
    if (val !== undefined) {
      if(['signature_title','why_title'].includes(el.dataset.i18n)){
        const lines=String(val).split('\n');el.innerHTML=`${esc(lines[0]||'')}<br><em>${esc(lines.slice(1).join(' ')||'')}</em>`;
      } else el.textContent = val;
    }
  });
  document.title = `Mo Design — Mohamed Mahmoud | ${lang === 'ar' ? 'تصميم ومونتاج وذكاء اصطناعي' : 'Design, Motion & AI'}`;
  document.querySelector('meta[name="description"]').content = field(model.settings, 'subheadline');
}
function setBrandContent() {
  const settings = model.settings || seed.settings;
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
  $('#copyrightText').textContent = `© ${new Date().getFullYear()} Mo Design / Mohamed Mahmoud. ${txt().rights}`;
  const countValues=[settings.stats_projects,settings.stats_years,settings.stats_satisfaction];
  $$('.stats-strip [data-count]').forEach((el,i)=>{ const newCount=Math.max(0,Number(countValues[i]??[100,3,100][i])||0);el.dataset.count=String(newCount);if(el.textContent==='0')el.textContent='0'; });
  const verifiedStats = Boolean(settings.stats_verified);
  $('.stats-strip').hidden = !verifiedStats;
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
  const original=['glow-beauty','vanta-ai','pulse-motion','forme-brand','flash-social','solar-product','neon-ai','noir-identity','aura-fragrance','zest-beverage','kinetik-motion','frame-storyboard'].includes(slug);
  return original ? `./projects/${encodeURIComponent(slug)}/` : `./project.html?slug=${encodeURIComponent(slug)}`;
}
function graphicHTML(project) {
  const type = ['aurora','type','orbit','pop'].includes(project.cover_style) ? project.cover_style : 'aurora';
  const safeImage = safeUrl(project.image_url);
  const isVideo = Boolean(project.video_url);
  const art = {aurora:'GO!',type:'aA.',orbit:'',pop:'WOW!'}[type];
  return `<div class="project-cover ${safeImage ? 'custom' : type}">${safeImage ? `<img class="cover-img" src="${esc(safeImage)}" alt="${esc(field(project, 'title'))}" loading="lazy" onerror="this.style.display='none'">` : `<div class="cover-graphic" aria-hidden="true">${art}</div>`}<span class="cover-label">${esc(field(project, 'category'))}${isVideo ? ' ▶ VIDEO' : ''}</span><span class="cover-arrow">↗</span></div>`;
}
function renderFilters() {
  const published=model.projects.filter(p=>p.is_published);
  const core=[
    ['Social Media Ads','تصاميم السوشيال ميديا والإعلانات'],
    ['Video Editing & Motion','مونتاج وموشن جرافيكس'],
    ['AI Visuals & Concepts','فنون وتوليد الذكاء الاصطناعي'],
    ['Branding & Identity','براندينج وهوية بصرية']
  ];
  const cats=[...core];
  for(const p of published){const k=p.category_en || p.category_ar;if(k && !cats.some(a=>a[0]===k))cats.push([k,p.category_ar||k]);}
  if(activeCategory!=='*' && !cats.some(a=>a[0]===activeCategory))activeCategory='*';
  const pills=[['*',txt().all],...cats.map(([key,arabic])=>[key,lang==='ar'?arabic:key])];
  $('#workFilters').innerHTML=pills.map(([key,label])=>`<button type="button" class="filter-pill ${activeCategory===key?'active':''}" data-filter="${esc(key)}" aria-pressed="${activeCategory===key}">${esc(label)}</button>`).join('');
}
function renderProjects() {
  renderFilters();
  const items = model.projects.filter(p=>p.is_published && (activeCategory==='*'||(p.category_en || p.category_ar)===activeCategory)).sort((a,b)=>(a.sort_order || 0)-(b.sort_order || 0));
  $('#worksCount').textContent = `${number(items.length)} PROJECTS`;
  $('#projectGrid').innerHTML = items.length ? items.map((p,i)=>`<article class="project-card reveal"><a class="project-cover-button" href="${esc(caseUrl(p))}" style="display:block;width:100%" aria-label="${esc(txt().details)}: ${esc(field(p,'title'))}">${graphicHTML(p)}</a><div class="project-meta"><div><h3>${esc(field(p,'title'))}</h3><p>${esc(field(p,'category'))}</p></div><span class="project-index">/${number(i+1)}</span></div></article>`).join('') : `<p class="admin-empty">${esc(txt().no_projects)}</p>`;
  observeReveal();
}
function renderServices() {
  const items = model.services.filter(s=>s.is_published).sort((a,b)=>(a.sort_order || 0)-(b.sort_order || 0));
  const icons = {diamond:'◇',sparkles:'✳',play:'▷',layout:'▦',target:'◎',brush:'✺'};
  const serviceSlug = s => {const title=String(s.title_en||'').toLowerCase();if(/video|motion/.test(title))return 'video-motion';if(/ai|artificial/.test(title))return 'ai-creative';if(/brand|identity/.test(title))return 'branding';if(/social|advertis|ads/.test(title))return 'social-media';return '';};
  $('#servicesList').innerHTML = items.map((s,i)=>`<article class="service-item reveal"><span class="service-number">/${number(i+1)}</span><h3 class="service-title">${esc(field(s,'title'))}</h3><p class="service-desc">${esc(field(s,'description'))}</p><a href="${serviceSlug(s)?`./services/${serviceSlug(s)}/`:`#contact`}" class="service-mark" aria-label="${esc(txt().details)}: ${esc(field(s,'title'))}">${icons[s.icon] || '↗'}</a></article>`).join('');
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
      <span class="feature-scrim" aria-hidden="true"></span><span class="feature-info"><span class="feature-tag">${esc(field(p,'category'))}</span><h3>${esc(field(p,'title'))}</h3><p>MO DESIGN · CONCEPT SERIES ${number(i+1)}</p></span>
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
    <div class="review-stars" aria-label="${verified&&Number(r.rating)>0?`${Number(r.rating)}/5`:''}">${verified && Number(r.rating)>0 ? '★'.repeat(Math.min(5,Math.max(1,Number(r.rating)))) : (verified?'✓ MO DESIGN':'✦  MO DESIGN  ✦')}</div><p class="review-quote">${esc(field(r,'quote'))}</p><div class="review-bottom"><span>${verified?'✓':'◎'} ${esc(verified?txt().review_verified:txt().review_placeholder)}</span><span>MO DESIGN / ${number(i+1)}</span></div></article>`;
  }).join('') || `<p class="admin-empty">${esc(lang==='ar'?'قريبًا: تقييمات العملاء':'Client feedback coming soon')}</p>`;
  $('#testimonials').hidden = items.length===0;
  $('#testimonials').classList.toggle('no-reviews',items.length===0);
  const allVerified=items.length>0 && items.every(r=>r.is_verified);
  $('.reviews-note').hidden=allVerified;
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
function observeReveal() {
  const nodes = $$('.reveal:not(.visible)');
  if(!('IntersectionObserver' in window)) {nodes.forEach(n=>n.classList.add('visible')); return;}
  nodes.forEach(node=>observer.observe(node));
}
const observer = new IntersectionObserver((entries,ob)=>entries.forEach(e=>{
  if(e.isIntersecting){e.target.classList.add('visible');ob.unobserve(e.target);}
}),{threshold:.06,rootMargin:'0px 0px 20px 0px'});
function render() {updateDocument();setBrandContent();renderProjects();renderFeatured();renderServices();renderReviews();renderSubjects();observeReveal();}

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

$('#langToggle').addEventListener('click',()=>{lang=lang==='ar'?'en':'ar';localStorage.setItem('portfolio_lang',lang);render();});
$('#themeToggle').addEventListener('click',()=>{theme=theme==='dark'?'light':'dark';localStorage.setItem('portfolio_theme',theme);render();});
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
  const vals={name:String(f.get('name')||''),email:String(f.get('email')||''),service:String(f.get('service')||''),message:String(f.get('message')||''),company:String(f.get('company')||''),budget:String(f.get('budget')||''),timeline:String(f.get('timeline')||''),reference_url:String(f.get('reference_url')||'')};
  const button=form.querySelector('button[type=submit]');
  button.disabled=true; button.querySelector('span').textContent=txt().submitting;
  $('#formMessage').textContent='';
  try {
    const result=await sendInquiry(vals);
    if(result.mode==='email'){
      const phone = (model.settings.whatsapp_url || 'https://wa.me/201097865616').split('?')[0];
      const info = lang==='ar' ? `طلب مشروع من موقع Mo Design\nالاسم: ${vals.name}\nالبريد: ${vals.email}\nالخدمة: ${vals.service}\nالشركة: ${vals.company || "—"}\nالميزانية: ${vals.budget || "—"}\nالمدة: ${vals.timeline || "—"}\nمرجع: ${vals.reference_url || "—"}\nالتفاصيل: ${vals.message}` : `Project enquiry from Mo Design\nName: ${vals.name}\nEmail: ${vals.email}\nService: ${vals.service}\nCompany: ${vals.company || "—"}\nBudget: ${vals.budget || "—"}\nTimeline: ${vals.timeline || "—"}\nReference: ${vals.reference_url || "—"}\nBrief: ${vals.message}`;
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
  getPublicContent().then(data=>{model=data;render();}).catch(err=>{console.error(err);toast(lang==='ar'?'تعذر تحميل البيانات؛ يجري عرض محتوى تجريبي.':'Could not load live data; showing sample content.');});
}
