import { seed, readDemo, saveDemo, escapeHTML as esc, safeUrl } from './data.js';
import { connected, getClient, adminAuthenticated, getAdminContent } from './api.js';

const $ = s => document.querySelector(s);
let data = connected ? null : readDemo();
let currentUser = null;
let tab = 'overview';
let editing = null; // {table,id}
let busy = false;

if(localStorage.getItem('portfolio_theme') === 'light') document.documentElement.classList.add('light');
const labels = {overview:'نظرة عامة',settings:'معلومات الموقع',projects:'إدارة الأعمال',services:'إدارة الخدمات',testimonials:'آراء العملاء',messages:'رسائل العملاء',future:'التطوير المستقبلي'};
function toast(message){const el=$('#toast'); el.textContent=message; el.classList.add('show'); clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),4000);}
function uiButton(label,action,id='',className='secondary') {return `<button type="button" class="admin-btn ${className}" data-action="${esc(action)}" data-id="${esc(id)}">${esc(label)}</button>`;}
function field(name,label,value='',options={}){
  const v=esc(value ?? '');
  const required=options.required ? 'required' : '';
  const full=options.full ? ' full' : '';
  if(options.type==='checkbox')return `<label class="form-field checkbox${full}"><input type="checkbox" name="${esc(name)}" ${value?'checked':''}/>${esc(label)}</label>`;
  if(options.type==='textarea')return `<label class="form-field${full}">${esc(label)}<textarea name="${esc(name)}" rows="${options.rows||3}" ${required} maxlength="4000">${v}</textarea></label>`;
  if(options.select)return `<label class="form-field${full}">${esc(label)}<select name="${esc(name)}">${options.select.map(x=>`<option value="${esc(x[0])}" ${String(value)===String(x[0])?'selected':''}>${esc(x[1])}</option>`).join('')}</select></label>`;
  return `<label class="form-field${full}">${esc(label)}<input name="${esc(name)}" type="${options.type||'text'}" value="${v}" maxlength="${options.max||255}" ${required}/></label>`;
}
function refreshAdminLogos(){document.querySelectorAll('[data-admin-brand-logo]').forEach(img=>img.src=`./assets/images/mo-logo-${document.documentElement.classList.contains('light')?'black':'white'}.webp`);}
new MutationObserver(refreshAdminLogos).observe(document.querySelector('#adminApp'), {childList:true});
function renderLogin(error=''){ 
  $('#adminApp').innerHTML=`<div class="admin-login-wrap"><div class="admin-panel"><a href="./index.html" class="brand"><span class="brand-mark"><img src="./assets/images/mo-logo-white.webp" alt="" data-admin-brand-logo /></span> Mo Design<span class="brand-period">.</span></a><h1 style="margin:33px 0 12px;font-size:28px">تسجيل دخول الإدارة</h1><p class="admin-note">هذه اللوحة للمالك والمشرفين المعتمدين فقط. أنشئ حساب المستخدم داخل Supabase وأضف معرفه لجدول admin_users.</p><form id="loginForm" class="admin-auth">${field('email','البريد الإلكتروني','',{type:'email',required:true})}${field('password','كلمة المرور','',{type:'password',required:true})}<button class="admin-btn" type="submit">تسجيل الدخول ↗</button></form><p class="admin-note" role="alert" style="color:#f8a3a3">${esc(error)}</p><a class="admin-note" href="./index.html">← الرجوع للموقع</a></div></div>`;
}
function baseShell(){
  $('#adminApp').innerHTML=`<div class="admin-layout"><aside class="admin-sidebar"><a href="./index.html" class="brand"><span class="brand-mark"><img src="./assets/images/mo-logo-white.webp" alt="" data-admin-brand-logo /></span> Mo Design<span class="brand-period">.</span></a><div class="admin-top-mobile"><strong>لوحة الإدارة</strong></div><nav class="sidebar-nav" id="adminNav">${Object.entries(labels).map(([key,label])=>`<button type="button" data-tab="${key}" class="${tab===key?'active':''}"><span>${({overview:'◉',settings:'✳',projects:'▣',services:'◇',testimonials:'❝',messages:'✉',future:'✦'})[key]}</span> ${label}</button>`).join('')}</nav><div class="sidebar-footer"><a href="./index.html" target="_blank" rel="noopener">معاينة الموقع ↗</a>${connected?'<button type="button" data-action="logout">تسجيل الخروج</button>':''}</div></aside><main class="admin-main" id="adminMain"></main></div>`;
}
function renderOverview(){
  const counts=[['الأعمال',data.projects.length],['الخدمات',data.services.length],['الآراء',data.testimonials?.length||0],['الرسائل',data.messages?.length??'—']];
  return `<div class="admin-panel"><h2>أهلًا بيك 👋</h2><p class="admin-note">من هنا تقدر تغيّر اسمك ونصوص الموقع والخدمات والأعمال، وتتابع رسائل العملاء بعد توصيل قاعدة البيانات.</p><div class="process-grid" style="margin-top:25px">${counts.map(([k,v])=>`<div class="process-card" style="min-height:140px"><span class="process-n">${esc(k)}</span><h3 style="font:800 45px 'DM Sans';margin:16px 0">${esc(v)}</h3></div>`).join('')}</div></div><div class="admin-panel"><h2>قبل نشر موقعك</h2><p class="admin-note">١. أضف بريدك الإلكتروني وروابط ملفاتك الشخصية بدل الروابط العامة. ٢. استبدل بطاقات الأعمال التجريبية بأعمالك الأصلية. ٣. فعّل Supabase وشغّل Migration 003_v5_portfolio.sql لوصول الرسائل ورفع الصور عبر الإنترنت.</p>${!connected?uiButton('صدّر بيانات المعاينة (JSON)','export') : ''}</div>`;
}
function renderSettings(){
  const s=data.settings || seed.settings;
  return `<div class="admin-panel"><h2>المحتوى والتعريف</h2><form data-entity="settings" id="settingsForm"><div class="admin-form-grid">
  ${field('brand_ar','اسم الموقع بالعربي',s.brand_ar,{required:true})}${field('brand_en','Website brand in English',s.brand_en,{required:true})}${field('personal_name','اسمك الشخصي',s.personal_name||'Mohamed Mahmoud')}
  ${field('role_ar','المسمّى بالعربي',s.role_ar)}${field('role_en','Role in English',s.role_en)}
  ${field('headline_ar','عنوان البداية بالعربي (افصل السطرين بـ Enter)',s.headline_ar,{type:'textarea',full:true,required:true})}
  ${field('headline_en','Hero heading in English',s.headline_en,{type:'textarea',full:true,required:true})}
  ${field('subheadline_ar','وصف البداية بالعربي',s.subheadline_ar,{type:'textarea',full:true})}
  ${field('subheadline_en','Hero description in English',s.subheadline_en,{type:'textarea',full:true})}
  ${field('bio_ar','نبذة عنك بالعربي',s.bio_ar,{type:'textarea',full:true})}
  ${field('bio_en','About you in English',s.bio_en,{type:'textarea',full:true})}
  ${field('contact_email','بريدك الإلكتروني — اختياري حتى تضيفه',s.contact_email,{type:'email'})}
  ${field('instagram_url','Instagram URL',s.instagram_url,{type:'url'})}${field('behance_url','Behance URL',s.behance_url,{type:'url'})}
  ${field('linkedin_url','LinkedIn URL',s.linkedin_url,{type:'url'})}${field('whatsapp_url','WhatsApp URL',s.whatsapp_url,{type:'url'})}
  ${field('tiktok_url','TikTok URL',s.tiktok_url,{type:'url'})}${field('facebook_url','Facebook URL',s.facebook_url,{type:'url'})}
  ${field('community_url','مجتمع AI على واتساب',s.community_url,{type:'url',full:true})}
  ${field('availability','إظهار «متاح لمشاريع جديدة»',s.availability,{type:'checkbox',full:true})}
  ${field('stats_projects','عدد المشاريع الفعلي (يظهر بعد توثيق الأرقام)',s.stats_projects??100,{type:'number'})}${field('stats_years','سنوات الخبرة الفعلية',s.stats_years??3,{type:'number'})}${field('stats_satisfaction','نسبة رضا العملاء الفعلية (0–100)',s.stats_satisfaction??100,{type:'number'})}
  ${field('stats_verified','أؤكد صحة الأرقام (+100 مشروع، +3 سنوات خبرة، 100% رضا عملاء) وأوافق على إظهارها علنًا',s.stats_verified,{type:'checkbox',full:true})}
  </div><div class="admin-actions"><button class="admin-btn" type="submit">حفظ التعديلات</button></div></form></div>`;
}
function renderItems(table){
  const isProjects=table==='projects';
  const isTestimonials=table==='testimonials';
  const arr=data[table]||[];
  const noun=isProjects?'مشروع':isTestimonials?'رأي عميل':'خدمة';
  const list=`<div class="admin-panel"><div class="admin-heading"><h2>${isProjects?'الأعمال المعروضة':isTestimonials?'آراء العملاء':'الخدمات المعروضة'}</h2>${uiButton(`+ إضافة ${noun}`,'add',table,'')}</div><div class="admin-rows">${arr.length?arr.map(row=>`<div class="admin-row"><div><h3>${esc(isTestimonials?row.author_ar:row.title_ar)}</h3><p>${esc(isTestimonials?row.author_en:row.title_en)} · ${row.is_published?'منشور':'مسودة'} · #${esc(row.sort_order)}</p></div><div class="row-actions">${uiButton('تعديل','edit',`${table}|${row.id}`)}${uiButton('حذف','delete',`${table}|${row.id}`,'danger')}</div></div>`).join(''):`<p class="admin-empty">لا توجد عناصر بعد.</p>`}</div></div>`;
  if(!editing || editing.table!==table)return list;
  const item=arr.find(a=>a.id===editing.id) || {};
  const isNew=!item.id;
  const main=isTestimonials ? `${field('author_ar','اسم العميل بالعربي',item.author_ar,{required:true})}${field('author_en','Client name',item.author_en,{required:true})}
  ${field('job_ar','المسمى / نوع العمل',item.job_ar)}${field('job_en','Role / project type',item.job_en)}
  ${field('quote_ar','نص التقييم الحقيقي بالعربي',item.quote_ar,{type:'textarea',full:true,required:true})}${field('quote_en','Verified quote in English',item.quote_en,{type:'textarea',full:true,required:true})}
  ${field('rating','التقييم من 1 إلى 5 (0 لقالب المعاينة)',item.rating??0,{type:'number'})}
  ${field('is_verified','هذه شهادة حقيقية وبموافقة صاحبها',item.is_verified,{type:'checkbox',full:true})}
  ${field('sort_order','الترتيب',item.sort_order??arr.length+1,{type:'number'})}${field('is_published','منشور على الموقع',item.is_published??true,{type:'checkbox'})}` : `${field('title_ar','العنوان بالعربي',item.title_ar,{required:true})}${field('title_en','Title in English',item.title_en,{required:true})}
  ${isProjects?`${field('slug','رابط المشروع المختصر (حروف لاتينية وأرقام و -)',item.slug||'',{full:true})}
  ${field('category_ar','التصنيف بالعربي',item.category_ar,{required:true})}${field('category_en','Category in English',item.category_en,{required:true})}
  ${field('project_type','نوع المشروع',item.project_type||'concept',{select:[['concept','Concept / دراسة شخصية'],['personal','عمل شخصي'],['client','مشروع عميل مصرح بنشره']]})}
  ${field('summary_ar','شرح المشروع بالعربي',item.summary_ar,{type:'textarea',full:true})}${field('summary_en','Project summary in English',item.summary_en,{type:'textarea',full:true})}
  ${field('cover_style','ستايل الصورة التوضيحية',item.cover_style || 'aurora',{select:[['aurora','Aurora'],['type','Typography'],['orbit','Orbit'],['pop','Pop']]})}
  ${field('image_url','صورة المشروع (HTTPS أو مسار من assets/images)',item.image_url,{type:'text',full:true})}
  ${field('video_url','رابط فيديو مباشر HTTPS (MP4/WebM) إن توفر',item.video_url||'',{type:'url',full:true})}
  ${field('gallery_urls','صور إضافية للمعرض — رابط HTTPS في كل سطر',item.gallery_urls||'',{type:'textarea',full:true,rows:4})}
  ${field('objective_ar','هدف المشروع بالعربي',item.objective_ar||'',{type:'textarea',full:true})}
  ${field('objective_en','Project goal in English',item.objective_en||'',{type:'textarea',full:true})}
  ${field('tools_used','الأدوات / Tools',item.tools_used||'',{type:'text',full:true})}
  <label class="form-field full">رفع صورة غلاف للمشروع إلى Supabase Storage (بعد التفعيل) <input type="file" name="media_file" accept="image/png,image/jpeg,image/webp,image/avif" ${connected?'':'disabled'} /> <small>صورة بحد أقصى 8 MB. ترفع بصورة آمنة فقط عند تفعيل التخزين وسياسات الصلاحيات.</small></label>
  ${field('external_url','رابط مشاهدة المشروع (HTTPS) - اختياري',item.external_url,{type:'url',full:true})}
  ${field('featured','مميز',item.featured,{type:'checkbox'})}`:
  `${field('description_ar','وصف الخدمة بالعربي',item.description_ar,{type:'textarea',full:true})}${field('description_en','Service description in English',item.description_en,{type:'textarea',full:true})}
  ${field('icon','رمز الخدمة',item.icon || 'sparkles',{select:[['diamond','◇ Diamond'],['sparkles','✳ Sparkles'],['play','▷ Motion'],['layout','▦ Web'],['target','◎ Strategy'],['brush','✺ Design']]})}`}
  ${field('sort_order','الترتيب',item.sort_order ?? arr.length+1,{type:'number'})}${field('is_published','منشور على الموقع',item.is_published ?? true,{type:'checkbox'})}`;
  return `<div class="admin-panel" id="editorPanel"><h2>${isNew?`إضافة ${noun}`:`تعديل ${noun}`}</h2><form data-entity="${table}" data-edit-id="${esc(item.id || '')}"><div class="admin-form-grid">${main}</div><div class="admin-actions">${uiButton('إلغاء','cancel')}<button class="admin-btn" type="submit">حفظ ${noun}</button></div></form></div>`+list;
}
function renderMessages(){
  if(!connected)return `<div class="admin-panel"><h2>رسائل العملاء</h2><p class="admin-note">الرسائل تحتاج قاعدة بيانات Supabase. في النسخة غير المتصلة، النموذج يفتح واتساب برسالة جاهزة، ولا يخزن بيانات الزوار في لوحة الإدارة. بعد ربط Supabase ستصل الرسائل مباشرة هنا.</p></div>`;
  return `<div class="admin-panel"><h2>آخر 100 رسالة</h2>${data.messages?.length ? data.messages.map(m=>`<article class="message-card"><div class="admin-heading"><div><h3>${esc(m.sender_name)} ${m.status==='new'?'• جديد':''}</h3><small>${esc(m.sender_email)} · ${esc(m.service_type)} · ${esc(new Date(m.created_at).toLocaleString('ar-EG'))}</small></div><select data-message-status="${esc(m.id)}" aria-label="حالة الطلب">${[['new','جديد'],['reviewing','مراجعة'],['contacted','تم التواصل'],['proposal_sent','عرض مرسل'],['accepted','مقبول'],['completed','مكتمل'],['archived','مؤرشف']].map(([value,label])=>`<option value="${value}" ${m.status===value?'selected':''}>${label}</option>`).join('')}</select></div><p>${esc(m.message)}</p><label class="form-field full">ملاحظات داخلية — لا يراها الزائر<textarea data-inquiry-note="${esc(m.id)}" rows="3" maxlength="2000">${esc(m.internal_notes||'')}</textarea></label>${uiButton('حفظ الملاحظة','savenote',m.id)}<a class="admin-btn secondary" href="mailto:${encodeURIComponent(m.sender_email)}" style="display:inline-block">رد بالإيميل ↗</a></article>`).join(''):'<p class="admin-empty">لا توجد رسائل حتى الآن.</p>'}</div>`;
}
function renderFuture(){return `<div class="admin-panel"><h2>خطة تطوير المنصة</h2><p class="admin-note">أساس الموقع مهيأ لإضافة محتوى تعليمي مستقبلًا، لكن لا توجد حاليًا منظومة كورسات أو دفع فعّالة.</p><div class="admin-rows"><div class="admin-row">المرحلة التالية: قسم المقالات والمحتوى التعليمي</div><div class="admin-row">ثم: حسابات الطلاب وتسجيل الدخول</div><div class="admin-row">ثم: تشغيل الفيديو والدروس وتتبع التقدم</div><div class="admin-row">أخيرًا: المدفوعات والاشتراكات بعد اختيار بوابة تدعم بلدك</div></div></div>`;}
function renderPanel(){
  if(!data)return;
  const main=$('#adminMain'); if(!main) return;
  const body=({overview:renderOverview,settings:renderSettings,projects:()=>renderItems('projects'),services:()=>renderItems('services'),testimonials:()=>renderItems('testimonials'),messages:renderMessages,future:renderFuture})[tab]();
  main.innerHTML=`<header class="admin-heading"><div><div class="eyebrow">PORTFOLIO / CONTROL ROOM</div><h1>${esc(labels[tab])}</h1><p>إدارة موقعك الإبداعي من مكان واحد.</p></div><span class="admin-badge">${connected?`● LIVE · ${esc(currentUser?.email||'')}`:'◌ LOCAL DEMO'}</span></header>${!connected?`<div class="admin-banner"><strong>وضع المعاينة المحلي:</strong> التعديلات تُحفظ على هذا المتصفح فقط، ويمكن لأي شخص فتح لوحة المعاينة. ليست لوحة إنتاج آمنة ولا قاعدة بيانات عامة. لبدء الإدارة الحقيقية فعّل Supabase واتبع ملف التعليمات.</div>`:''}${body}`;
  document.querySelectorAll('[data-tab]').forEach(el=>el.classList.toggle('active',el.dataset.tab===tab));
}
function getFields(form,table){
  const f=new FormData(form);
  const get=k=>String(f.get(k)||'').trim();
  if(table==='settings'){
    return {brand_ar:get('brand_ar'),brand_en:get('brand_en'),personal_name:get('personal_name'),role_ar:get('role_ar'),role_en:get('role_en'),headline_ar:get('headline_ar'),headline_en:get('headline_en'),subheadline_ar:get('subheadline_ar'),subheadline_en:get('subheadline_en'),bio_ar:get('bio_ar'),bio_en:get('bio_en'),contact_email:get('contact_email'),instagram_url:get('instagram_url'),behance_url:get('behance_url'),linkedin_url:get('linkedin_url'),whatsapp_url:get('whatsapp_url'),tiktok_url:get('tiktok_url'),facebook_url:get('facebook_url'),community_url:get('community_url'),availability:f.has('availability'),stats_projects:Math.max(0,Number(get('stats_projects'))||0),stats_years:Math.max(0,Number(get('stats_years'))||0),stats_satisfaction:Math.max(0,Math.min(100,Number(get('stats_satisfaction'))||0)),stats_verified:f.has('stats_verified')};
  }
  const common={sort_order:Number(get('sort_order'))||0,is_published:f.has('is_published')};
  if(table==='testimonials')return {...common,author_ar:get('author_ar'),author_en:get('author_en'),job_ar:get('job_ar'),job_en:get('job_en'),quote_ar:get('quote_ar'),quote_en:get('quote_en'),rating:Math.max(0,Math.min(5,Number(get('rating'))||0)),is_verified:f.has('is_verified')};
  if(table==='projects')return {...common,title_ar:get('title_ar'),title_en:get('title_en'),category_ar:get('category_ar'),category_en:get('category_en'),summary_ar:get('summary_ar'),summary_en:get('summary_en'),cover_style:get('cover_style'),image_url:get('image_url'),external_url:get('external_url'),featured:f.has('featured'),video_url:get('video_url'),gallery_urls:get('gallery_urls'),objective_ar:get('objective_ar'),objective_en:get('objective_en'),tools_used:get('tools_used'),project_type:get('project_type'),slug:get('slug') || `project-${Date.now()}`};
  return {...common,title_ar:get('title_ar'),title_en:get('title_en'),description_ar:get('description_ar'),description_en:get('description_en'),icon:get('icon')};
}
async function saveForm(form){
  const table=form.dataset.entity;
  if(!form.reportValidity() || busy)return;
  const entry=getFields(form,table);
  const id=form.dataset.editId;
  if(table==='projects') {
    if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.slug)){toast('رابط المشروع يجب أن يكون إنجليزيًا بحروف صغيرة وشرطات فقط.');return;}
    if(entry.image_url && !(/^https:\/\//i.test(entry.image_url) || /^\.\/assets\/images\/[\w.-]+$/i.test(entry.image_url))) {toast('استخدم رابط HTTPS أو صورة من مجلد assets/images.');return;}
    if(entry.external_url && !/^https:\/\//i.test(entry.external_url)){toast('رابط المشروع يجب أن يبدأ بـ HTTPS');return;}
    if(entry.video_url && !/^https:\/\//i.test(entry.video_url)){toast('الفيديو يجب أن يكون برابط HTTPS');return;}
    if(entry.gallery_urls && !entry.gallery_urls.split(/\r?\n/).filter(Boolean).every(x=>/^https:\/\//i.test(x))){toast('كل صورة إضافية لازم تكون رابط HTTPS في سطر مستقل.');return;}
  }
  busy=true;
  try {
    if(connected && table==='projects'){
      const file=form.querySelector('input[name="media_file"]')?.files?.[0];
      if(file){
        const approved=['image/png','image/jpeg','image/webp','image/avif'];
        if(!approved.includes(file.type) || file.size>8*1024*1024)throw new Error('الصورة يجب أن تكون PNG/JPEG/WebP/AVIF وأقل من 8MB.');
        const db=await getClient();
        const ext=({ 'image/png':'png','image/jpeg':'jpg','image/webp':'webp','image/avif':'avif'})[file.type];
        const key=`projects/${crypto.randomUUID()}.${ext}`;
        const {error}=await db.storage.from('portfolio-media').upload(key,file,{contentType:file.type,upsert:false,cacheControl:'3600'});
        if(error)throw error;
        entry.image_url=db.storage.from('portfolio-media').getPublicUrl(key).data.publicUrl;
      }
    }
    if(connected){
      const db=await getClient(); let result;
      if(table==='settings')result=await db.from('site_settings').update(entry).eq('id',1);
      else {
        const payload={...entry};
        if(id)payload.id=id;
        else if(table==='projects')payload.slug=entry.slug || `project-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
        result=await db.from(table).upsert(payload);
      }
      if(result.error)throw result.error;
      data=await getAdminContent();
    } else {
      if(table==='settings')data.settings={...data.settings,...entry};
      else if(id){const index=data[table].findIndex(x=>x.id===id);if(index!==-1)data[table][index]={...data[table][index],...entry};}
      else data[table].push({...entry,id:`local-${Date.now()}`,slug:`project-${Date.now()}`});
      saveDemo(data);
    }
    editing=null; renderPanel(); toast('تم حفظ التعديلات بنجاح ✓');
  } catch(error){console.error(error);toast(`تعذر الحفظ: ${error.message || 'Unknown error'}`);}
  finally{busy=false;}
}
async function deleteItem(table,id){
  if(!confirm('هل أنت متأكد من حذف هذا العنصر؟'))return;
  try{
    if(connected){const db=await getClient();const {error}=await db.from(table).delete().eq('id',id);if(error)throw error;data=await getAdminContent();}
    else {data[table]=data[table].filter(x=>String(x.id)!==id);saveDemo(data);}
    if(editing?.id===id)editing=null;
    renderPanel();toast('تم الحذف.');
  }catch(e){toast('تعذر الحذف: '+e.message);}
}
async function markRead(id){
  try{const db=await getClient();const {error}=await db.from('inquiries').update({status:'read'}).eq('id',id);if(error)throw error;data=await getAdminContent();renderPanel();}catch(e){toast('تعذر التحديث: '+e.message);}
}
function exportDemo(){
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='mo-design-portfolio-preview-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
$('#adminApp').addEventListener('click',async e=>{
  const nav=e.target.closest('button[data-tab]');
  if(nav){tab=nav.dataset.tab;editing=null;renderPanel();window.scrollTo({top:0,behavior:'smooth'});return;}
  const btn=e.target.closest('button[data-action]');if(!btn)return;
  const {action,id}=btn.dataset;
  if(action==='add'){tab=id;editing={table:id,id:null};renderPanel();$('#editorPanel')?.scrollIntoView({behavior:'smooth'});}
  if(action==='edit'){const [table,itemId]=id.split('|');tab=table;editing={table,id:itemId};renderPanel();$('#editorPanel')?.scrollIntoView({behavior:'smooth'});}
  if(action==='cancel'){editing=null;renderPanel();}
  if(action==='delete'){const [table,itemId]=id.split('|');await deleteItem(table,itemId);}
  if(action==='markread')await markRead(id);
  if(action==='savenote' && connected){try{const db=await getClient();const notes=document.querySelector(`[data-inquiry-note="${id}"]`)?.value||'';const {error}=await db.from('inquiries').update({internal_notes:notes.trim().slice(0,2000)}).eq('id',id);if(error)throw error;toast('تم حفظ ملاحظات الطلب');}catch(error){toast('تعذر حفظ الملاحظة: '+error.message);}}
  if(action==='export')exportDemo();
  if(action==='logout'){const db=await getClient();await db.auth.signOut();currentUser=null;data=null;renderLogin();}
});
$('#adminApp').addEventListener('change',async e=>{
  const ctl=e.target.closest('[data-message-status]');
  if(!ctl || !connected)return;
  try{const db=await getClient();const {error}=await db.from('inquiries').update({status:ctl.value}).eq('id',ctl.dataset.messageStatus);if(error)throw error;toast('تم تحديث حالة الطلب');}catch(error){toast('تعذر تعديل الحالة: '+error.message);}
});
$('#adminApp').addEventListener('submit',async e=>{
  e.preventDefault();
  const form=e.target;
  if(form.id==='loginForm'){
    const button=form.querySelector('button[type=submit]');button.disabled=true;button.textContent='جاري الدخول...';
    try{
      const db=await getClient();const f=new FormData(form);
      const {error}=await db.auth.signInWithPassword({email:String(f.get('email')).trim(),password:String(f.get('password'))});
      if(error)throw error;
      currentUser=await adminAuthenticated();
      if(!currentUser){await db.auth.signOut();throw new Error('هذا الحساب غير مصرح له بإدارة الموقع.');}
      data=await getAdminContent();baseShell();renderPanel();
    }catch(e){renderLogin(e.message||'فشل تسجيل الدخول');}
    return;
  }
  if(form.dataset.entity)await saveForm(form);
});
async function init(){
  if(!connected){baseShell();renderPanel();refreshAdminLogos();return;}
  try{
    currentUser=await adminAuthenticated();
    if(currentUser){data=await getAdminContent();baseShell();renderPanel();refreshAdminLogos();}
    else renderLogin();
  }catch(e){console.error(e);renderLogin('تأكد من اتصال الإنترنت وإعدادات Supabase. '+(e.message||''));}
}
init();
