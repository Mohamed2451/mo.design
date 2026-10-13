import { seed, readDemo, saveDemo, escapeHTML as esc, safeUrl, ar, en } from './data.js';
import { connected, getClient, adminAuthenticated, getAdminContent } from './api.js';
import {PORTFOLIO_CATEGORIES, categoryFor, formatTools} from './categories.js';

const $ = s => document.querySelector(s);
let data = connected ? null : readDemo();
let currentUser = null;
let tab = 'overview';
let editing = null; // {table,id}
let busy = false;

// Dashboard always uses its own neutral dark palette; the public site's theme remains unchanged.
const labels = {notice:'إشعارات الموقع',overview:'الرئيسية',content:'محرر الموقع',settings:'إعدادات الهوية',projects:'المشاريع',appearance:'مظهر الأقسام',media:'مكتبة الصور',services:'الخدمات',testimonials:'آراء العملاء',messages:'طلبات العملاء',future:'الأكاديمية والمحتوى'};
const FONT_CHOICES=[['Alexandria','Alexandria — حديث'],['Cairo','Cairo — واضح'],['Readex Pro','Readex Pro — هادي'],['IBM Plex Sans Arabic','IBM Plex Sans Arabic — احترافي']];
const EXTRA_CONTENT_KEYS=['ticker_items','project_about_title','project_objective_title','selected_real_sub','reviews_real_sub','featured_real_sub'];
const ALL_COPY_KEYS=()=>[...new Set([...Object.keys(ar),...Object.keys(en),...EXTRA_CONTENT_KEYS])].filter(k=>typeof ar[k]==='string'||typeof en[k]==='string');
const copyGroup=()=>ALL_COPY_KEYS().filter(k=>!Object.values(CONTENT_GROUPS).flat().some(([key])=>key===k)).map(k=>[k,(typeof ar[k]==='string'&&ar[k].trim()?ar[k].trim().slice(0,70):k)+' ['+k+']']);
function richField(name,label,value='',rows=6){return `<div class="cms-rich-wrap full">${field(name,label,value,{type:'textarea',full:true,rows})}<div class="cms-rich-toolbar"><button type="button" data-rich="bold" title="غامق">B</button><button type="button" data-rich="italic" title="مائل"><i>I</i></button><button type="button" data-rich="heading" title="عنوان فرعي">H2</button><button type="button" data-rich="list" title="قائمة">☷</button></div><small class="cms-rich-note">حدد نص واضغط غامق أو مائل. استخدم H2 للعناوين، وكل سطر منفصل هيظهر كما كتبته.</small></div>`;}
const SECTIONS=[['featured','المشاريع المميزة'],['signature','عرض الأعمال الرئيسي'],['work','معرض الأعمال'],['services','الخدمات'],['tools','البرامج والأدوات'],['why','أسلوبي في الشغل'],['about','نبذة عني'],['process','مراحل تنفيذ المشاريع'],['testimonials','آراء العملاء'],['faq','الأسئلة الشائعة'],['cta','دعوة بدء مشروع'],['learn','المعرفة الجاية أقرب'],['contact','التواصل وطلب مشروع']];
const CONTENT_GROUPS={
 'المشاريع والأعمال':[['feature_title','عنوان الأعمال المميزة'],['feature_sub','وصف الأعمال المميزة'],['selected','عنوان معرض الأعمال'],['selected_sub','وصف معرض الأعمال'],['signature_title','عنوان العرض السينمائي'],['signature_desc','وصف العرض السينمائي'],['signature_link','نص زر عرض المشروع']],
 'الخدمات وطريقتي':[['services_eyebrow','عنوان صغير للخدمات'],['services_title','العنوان الرئيسي للخدمات'],['services_sub','وصف الخدمات'],['why_title','عنوان طريقة الشغل'],['why_1','الخطوة الأولى'],['why_1d','شرح الخطوة الأولى'],['why_2','الخطوة الثانية'],['why_2d','شرح الخطوة الثانية'],['why_3','الخطوة الثالثة'],['why_3d','شرح الخطوة الثالثة'],['step1','مرحلة التنفيذ الأولى'],['step1d','شرح المرحلة الأولى'],['step2','مرحلة التنفيذ الثانية'],['step2d','شرح المرحلة الثانية'],['step3','مرحلة التنفيذ الثالثة'],['step3d','شرح المرحلة الثالثة']],
 'عني والعملاء':[['about_title','عنوان قسم عني'],['about_card_1','ميزة أولى'],['about_card_2','ميزة ثانية'],['about_card_3','ميزة ثالثة'],['reviews_title','عنوان قسم التفاصيل اللي بتفرق / آراء العملاء'],['reviews_sub','وصف قسم آراء العملاء']],
 'التعليم والتواصل':[['learn_title','عنوان قسم التعليم'],['learn_desc','وصف التعليم المستقبلي'],['learn_tag','عبارة قريبًا'],['learn_live_title','عنوان بعد بدء النشر'],['learn_live_desc','الوصف بعد بدء النشر'],['learn_live_tag','شارة المحتوى المنشور'],['contact_title','عنوان التواصل'],['contact_desc','شرح التواصل'],['cta_title','عنوان الدعوة للمشروع'],['cta_sub','وصف الدعوة للمشروع'],['cta_button','نص زر التواصل']],
 'الأسئلة الشائعة':[['faq_title','عنوان الأسئلة الشائعة'],['faq_desc','مقدمة الأسئلة'],['faq_q1','السؤال الأول'],['faq_a1','إجابة السؤال الأول'],['faq_q2','السؤال الثاني'],['faq_a2','إجابة السؤال الثاني'],['faq_q3','السؤال الثالث'],['faq_a3','إجابة السؤال الثالث'],['faq_q4','السؤال الرابع'],['faq_a4','إجابة السؤال الرابع']]
};
let mediaCache=[];
function toast(message){const el=$('#toast'); el.textContent=message; el.classList.add('show'); clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),4000);}
function uiButton(label,action,id='',className='secondary') {return `<button type="button" class="admin-btn ${className}" data-action="${esc(action)}" data-id="${esc(id)}">${esc(label)}</button>`;}
function field(name,label,value='',options={}){
  const v=esc(value ?? '');
  const required=options.required ? 'required' : '';
  const full=options.full ? ' full' : '';
  if(options.type==='checkbox')return `<label class="form-field checkbox${full}"><input type="checkbox" name="${esc(name)}" ${value?'checked':''}/>${esc(label)}</label>`;
  if(options.type==='textarea')return `<label class="form-field${full}">${esc(label)}<textarea name="${esc(name)}" rows="${options.rows||3}" ${required} maxlength="12000">${v}</textarea></label>`;
  if(options.select)return `<label class="form-field${full}">${esc(label)}<select name="${esc(name)}">${options.select.map(x=>`<option value="${esc(x[0])}" ${String(value)===String(x[0])?'selected':''}>${esc(x[1])}</option>`).join('')}</select></label>`;
  return `<label class="form-field${full}">${esc(label)}<input name="${esc(name)}" type="${options.type||'text'}" value="${v}" maxlength="${options.max||255}" ${required}/></label>`;
}
function refreshAdminLogos(){document.querySelectorAll('[data-admin-brand-logo]').forEach(img=>{const custom=safeUrl(data?.settings?.[document.documentElement.classList.contains('light')?'logo_light_url':'logo_dark_url']);img.src=custom || `./assets/images/mo-logo-${document.documentElement.classList.contains('light')?'black':'white'}.webp`;});}
new MutationObserver(refreshAdminLogos).observe(document.querySelector('#adminApp'), {childList:true});
function renderLogin(error=''){ 
  $('#adminApp').innerHTML=`<div class="admin-login-wrap"><div class="admin-panel"><a href="./index.html" class="brand"><span class="brand-mark"><img src="./assets/images/mo-logo-white.webp" alt="" data-admin-brand-logo /></span> Mo Design<span class="brand-period">.</span></a><h1 style="margin:33px 0 12px;font-size:28px">تسجيل دخول الإدارة</h1><p class="admin-note">هذه اللوحة للمالك والمشرفين المعتمدين فقط. أنشئ حساب المستخدم داخل Supabase وأضف معرفه لجدول admin_users.</p><form id="loginForm" class="admin-auth">${field('email','البريد الإلكتروني','',{type:'email',required:true})}${field('password','كلمة المرور','',{type:'password',required:true})}<button class="admin-btn" type="submit">تسجيل الدخول ↗</button></form><p class="admin-note" role="alert" style="color:#f8a3a3">${esc(error)}</p><a class="admin-note" href="./index.html">← الرجوع للموقع</a></div></div>`;
}
function baseShell(){
 const groups=[
  {title:'المكتب',items:['overview','messages']},
  {title:'إدارة المحتوى',items:['content','appearance','projects','media','services','testimonials','future','notice']},
  {title:'الهوية والإعدادات',items:['settings']}
 ];
 const icons={overview:'◫',messages:'✉',content:'▤',appearance:'◈',projects:'▦',media:'▧',services:'◇',testimonials:'❞',future:'▷',notice:'♧',settings:'⚙'};
 $('#adminApp').innerHTML=`<div class="admin-layout v10-shell"><aside class="admin-sidebar">
 <div class="studio-sidebar-top"><a href="./index.html" class="brand v10-brand"><span class="brand-mark"><img src="./assets/images/mo-logo-white.webp" alt="" data-admin-brand-logo /></span><span><strong>Mo Design</strong><small>مساحة الإدارة الإبداعية</small></span></a><div class="v10-workspace-badge"><span class="v10-online-dot"></span> مساحة الإدارة الخاصة</div></div>
 <nav class="sidebar-nav" id="adminNav" aria-label="أقسام لوحة الإدارة">${groups.map(group=>`<div class="v10-nav-group"><div class="v10-nav-label">${group.title}</div>${group.items.map(key=>`<button type="button" data-tab="${key}" class="${tab===key?'active':''}"><span class="v10-nav-icon" aria-hidden="true">${icons[key]}</span><span>${labels[key]}</span><span class="v10-nav-chevron" aria-hidden="true">‹</span></button>`).join('')}</div>`).join('')}</nav>
 <div class="sidebar-footer"><div class="v10-admin-account"><span class="v10-avatar">م</span><div><strong>محمد محمود</strong><small>مدير الموقع</small></div></div><a href="./index.html" target="_blank" rel="noopener">↗ معاينة الموقع</a>${connected?'<button type="button" data-action="logout">تسجيل الخروج</button>':''}</div></aside>
 <main class="admin-main" id="adminMain"></main></div>`;
}
function renderOverview(){
 const projects=data.projects||[], messages=data.messages||[],lessons=data.learning_items||[];
 const metrics=[
 ['المشاريع المنشورة',projects.filter(x=>x.is_published).length,'▧','مشروع ظاهر للزوار'],
 ['المشاريع المسودة',projects.filter(x=>!x.is_published).length,'◷','مستني المراجعة'],
 ['طلبات جديدة',messages.filter(x=>x.status==='new').length,'✉','محتاج متابعة'],
 ['محتوى تعليمي منشور',lessons.filter(x=>x.is_published).length,'▷','فيديوهات ومقالات']
 ];
 const mode=data.settings?.education_mode||'coming_soon';
 const educationNames={hidden:'القسم مخفي',coming_soon:'قريبًا',live:'بننشر دلوقتي'};
 const recent=messages.slice(0,4);
 return `<section class="v10-overview-hero"><div><span class="v10-eyebrow">لوحة إدارة أعمالك</span><h2>شغلك كله،<br><em>تحت السيطرة.</em></h2><p>أهلًا يا محمد! من هنا تدير الموقع، وتنشر أعمالك، وتتابع العملاء، وتجهّز المحتوى التعليمي.</p><div class="v10-hero-actions">${uiButton('✳ افتح محرر الموقع','goto','content','primary')}${uiButton('▷ انشر محتوى تعليمي','goto','future')}</div></div><div class="v10-overview-art" aria-hidden="true"><span>MO</span><span>DESIGN</span><i>✳</i></div></section>
 <div class="v10-metric-grid">${metrics.map(([label,val,icon,desc])=>`<div class="v10-metric-card"><div class="v10-metric-heading"><span>${esc(label)}</span><b>${icon}</b></div><strong>${val}</strong><small>${esc(desc)}</small></div>`).join('')}</div>
 <div class="v10-overview-columns"><section class="admin-panel v10-overview-section"><div class="admin-heading"><h2>إجراءات سريعة</h2><span class="v10-note-pill">ابدأ من هنا</span></div><div class="v10-action-list">${[['تعديل الصفحة الرئيسية','غير النصوص والعناوين وحالة الأقسام','content','▤'],['إضافة مشروع جديد','الصور والفيديوهات وأعمالك الحقيقية','projects','▧'],['مكتبة الصور','كل صورك في مكان واحد','media','▦'],['الأكاديمية والمحتوى','الحالة الحالية: '+(educationNames[mode]||'قريبًا'),'future','▷']].map(([title,desc,id,icon])=>`<button type="button" class="v10-action-row" data-action="goto" data-id="${id}"><span class="v10-action-icon">${icon}</span><span><strong>${title}</strong><small>${desc}</small></span><span class="v10-action-arrow">↗</span></button>`).join('')}</div></section>
 <section class="admin-panel v10-overview-section"><div class="admin-heading"><h2>آخر طلبات العملاء</h2>${uiButton('عرض الكل','goto','messages')}</div>${recent.length?recent.map(m=>`<div class="v10-recent-lead"><span class="v10-lead-avatar">${esc(m.sender_name?.slice(0,1)||'؟')}</span><div><strong>${esc(m.sender_name||'عميل')}</strong><small>${esc(m.service_type||'طلب مشروع')}</small></div><span class="v10-lead-state">${m.status==='new'?'جديد':'قيد المتابعة'}</span></div>`).join(''):'<div class="v10-empty-leads">مفيش طلبات جديدة دلوقتي. لما حد يراسلّك من الموقع، هتلاقي طلبه هنا.</div>'}</section></div>`;
}

function renderContent(){
 const settings=data.settings||seed.settings, vis=settings.section_visibility||{};
 const controls=SECTIONS.map(([id,label])=>`<label class="cms-toggle"><input type="checkbox" name="section_${id}" ${vis[id]===false?'':'checked'}><span><strong>${esc(label)}</strong><small>${vis[id]===false?'مخفي':'يظهر على الموقع'}</small></span></label>`).join('');
 const groups={...CONTENT_GROUPS,'كل العبارات والأزرار الإضافية (تحكم موسع)':copyGroup()};
 const sections=Object.entries(groups).map(([label,fields],i)=>`<details class="cms-editor-group" ${i===0?'open':''}><summary>${esc(label)} <span>▾</span></summary><div class="admin-form-grid">${fields.map(([key,name])=>`${field('ar_'+key,`${name} — بالعربي المصري`,(settings.content_ar||{})[key]??ar[key]??'',{type:'textarea',full:true,rows:2})}${field('en_'+key,`${name} — النسخة الإنجليزية`,(settings.content_en||{})[key]??en[key]??'',{type:'textarea',full:true,rows:2})}`).join('')}</div></details>`).join('');
 return `<div class="admin-panel"><div class="admin-heading"><div><h2>إدارة كل أقسام الموقع</h2><p class="admin-note">فعّل أو اخفي أي قسم، وعدّل عناوينه ووصفه بالعربي والإنجليزي. مش هتحتاج ترجع لـ GitHub.</p></div><a class="admin-btn secondary" href="./index.html" target="_blank" rel="noopener">معاينة ↗</a></div><form data-entity="content" id="contentForm"><div class="v10-home-copy"><h3>✳ كلام الصفحة الرئيسية</h3><p class="admin-note">ده أول كلام العميل بيشوفه في الموقع. عدّله من هنا واحفظ مع باقي الأقسام.</p><div class="admin-form-grid">${field('headline_ar','العنوان الرئيسي — عربي',settings.headline_ar,{type:'textarea',required:true,rows:2})}${field('headline_en','العنوان الرئيسي — إنجليزي',settings.headline_en,{type:'textarea',required:true,rows:2})}${field('subheadline_ar','نبذة البداية — عربي',settings.subheadline_ar,{type:'textarea',rows:3})}${field('subheadline_en','نبذة البداية — إنجليزي',settings.subheadline_en,{type:'textarea',rows:3})}</div></div><h3>الأقسام اللي تظهر للزائر</h3><div class="cms-toggle-grid">${controls}</div><h3 style="margin-block:35px 15px">تحرير النصوص</h3><label class="form-field full" style="margin-block:12px 16px">ابحث عن كلمة أو عبارة عايز تغيّرها<input id="cmsCopySearch" type="search" placeholder="مثلاً: آراء العملاء أو الزر أو العنوان" autocomplete="off"></label>${sections}<div class="admin-sticky-actions"><button type="submit" class="admin-btn">حفظ المحتوى والتغييرات ✓</button><small>المحتوى بيتحفظ على Supabase ويظهر على الموقع من غير GitHub</small></div></form></div>`;
}

function renderSettings(){
  const s=data.settings || seed.settings;
  return `<div class="admin-panel"><h2>المحتوى والتعريف</h2><form data-entity="settings" id="settingsForm"><div class="admin-form-grid">
  ${field('brand_ar','اسم الموقع بالعربي',s.brand_ar,{required:true})}${field('brand_en','اسم الموقع بالإنجليزي',s.brand_en,{required:true})}${field('personal_name','اسمك الشخصي',s.personal_name||'Mohamed Mahmoud')}
  ${field('role_ar','المسمّى بالعربي',s.role_ar)}${field('role_en','المسمّى بالإنجليزي',s.role_en)}
  ${field('headline_ar','عنوان البداية بالعربي (افصل السطرين بـ Enter)',s.headline_ar,{type:'textarea',full:true,required:true})}
  ${field('headline_en','عنوان البداية بالإنجليزي',s.headline_en,{type:'textarea',full:true,required:true})}
  ${field('subheadline_ar','وصف البداية بالعربي',s.subheadline_ar,{type:'textarea',full:true})}
  ${field('subheadline_en','وصف البداية بالإنجليزي',s.subheadline_en,{type:'textarea',full:true})}
  ${field('bio_ar','نبذة عنك بالعربي',s.bio_ar,{type:'textarea',full:true})}
  ${field('bio_en','نبذة عنك بالإنجليزي',s.bio_en,{type:'textarea',full:true})}
  ${field('profile_image_url','رابط صورتك الشخصية (لو حابب تغيرها)',s.profile_image_url||'',{full:true})}
  <label class="form-field full">ارفع صورة شخصية جديدة مباشرة (8 ميجابايت كحد أقصى)<input type="file" name="profile_file" accept="image/png,image/jpeg,image/webp,image/avif" ${connected?'':'disabled'}></label>
  <div class="cms-brand-settings full"><h3>صورتك والشعار</h3><p class="admin-note">الشعار الأبيض للدارك مود، والأسود للايت مود. رفع الملفات بيحدّث الموقع بعد الحفظ من غير GitHub.</p><div class="cms-brand-preview"><img src="${esc(safeUrl(s.profile_image_url)||'./assets/images/mohamed-mahmoud.webp')}" alt="معاينة صورتك"><img src="${esc(safeUrl(s.logo_dark_url)||'./assets/images/mo-logo-white.webp')}" alt="شعار الوضع الداكن"></div></div>
  ${field('logo_dark_url','رابط الشعار الأبيض للدارك مود (اختياري)',s.logo_dark_url||'',{full:true})}
  <label class="form-field full">أو ارفع الشعار الأبيض من جهازك<input type="file" name="logo_dark_file" accept="image/png,image/jpeg,image/webp,image/avif" ${connected?'':'disabled'}></label>
  ${field('logo_light_url','رابط الشعار الأسود للايت مود (اختياري)',s.logo_light_url||'',{full:true})}
  <label class="form-field full">أو ارفع الشعار الأسود من جهازك<input type="file" name="logo_light_file" accept="image/png,image/jpeg,image/webp,image/avif" ${connected?'':'disabled'}></label>
  ${field('contact_email','بريدك الإلكتروني — اختياري حتى تضيفه',s.contact_email,{type:'email'})}
  ${field('instagram_url','رابط إنستجرام',s.instagram_url,{type:'url'})}${field('behance_url','رابط بيهانس',s.behance_url,{type:'url'})}
  ${field('linkedin_url','رابط لينكدإن',s.linkedin_url,{type:'url'})}${field('whatsapp_url','رابط واتساب',s.whatsapp_url,{type:'url'})}
  ${field('tiktok_url','رابط تيك توك',s.tiktok_url,{type:'url'})}${field('facebook_url','رابط فيسبوك',s.facebook_url,{type:'url'})}
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
  const list=`<div class="admin-panel"><div class="admin-heading"><h2>${isProjects?'الأعمال المعروضة':isTestimonials?'آراء العملاء':'الخدمات المعروضة'}</h2>${uiButton(`+ إضافة ${noun}`,'add',table,'')}</div><div class="admin-rows">${arr.length?arr.map(row=>`<div class="admin-row"><div class="admin-row-content">${isProjects && safeUrl(row.image_url)?`<img class="admin-row-thumb" src="${esc(safeUrl(row.image_url))}" loading="lazy" alt=""/>`:''}<div><h3>${esc(isTestimonials?row.author_ar:row.title_ar)}</h3><p>${esc(isTestimonials?row.author_en:row.title_en)} · ${row.is_published?'منشور':'مسودة'} · #${esc(row.sort_order)}</p></div></div><div class="row-actions">${!isTestimonials?uiButton(row.is_published?'إخفاء':'نشر','togglepublish',`${table}|${row.id}`):''}${uiButton('تعديل','edit',`${table}|${row.id}`)}${uiButton('حذف','delete',`${table}|${row.id}`,'danger')}</div></div>`).join(''):`<p class="admin-empty">لا توجد عناصر بعد.</p>`}</div></div>`;
  if(!editing || editing.table!==table)return list;
  const item=arr.find(a=>a.id===editing.id) || {};
  const isNew=!item.id;
  const main=isTestimonials ? `${field('author_ar','اسم العميل بالعربي',item.author_ar,{required:true})}${field('author_en','اسم العميل بالإنجليزي',item.author_en,{required:true})}
  ${field('job_ar','المسمى / نوع العمل',item.job_ar)}${field('job_en','المسمّى بالإنجليزي',item.job_en)}
  ${field('quote_ar','نص التقييم الحقيقي بالعربي',item.quote_ar,{type:'textarea',full:true,required:true})}${field('quote_en','التقييم بالإنجليزي',item.quote_en,{type:'textarea',full:true,required:true})}
  ${field('rating','التقييم من 1 إلى 5 (0 لقالب المعاينة)',item.rating??0,{type:'number'})}
  ${field('is_verified','هذه شهادة حقيقية وبموافقة صاحبها',item.is_verified,{type:'checkbox',full:true})}
  ${field('sort_order','الترتيب',item.sort_order??arr.length+1,{type:'number'})}${field('is_published','منشور على الموقع',item.is_published??false,{type:'checkbox'})}` : `${field('title_ar','العنوان بالعربي',item.title_ar,{required:true})}${field('title_en','عنوان المشروع بالإنجليزي',item.title_en,{required:true})}
  ${isProjects?`${field('slug','رابط المشروع المختصر (حروف لاتينية وأرقام و -)',item.slug||'',{full:true})}
  <label class="form-field full">تصنيف المشروع (من التصنيفات المعتمدة)<select name="category_id" required>${PORTFOLIO_CATEGORIES.map(c=>`<option value="${esc(c.id)}" ${categoryFor(item)?.id===c.id?'selected':''}>${esc(c.ar)} — ${esc(c.en)}</option>`).join('')}</select><small>الاسم العربي والإنجليزي بيتسجلوا تلقائيًا لتجنب التكرار في المعرض.</small></label>
  ${field('project_type','نوع المشروع',item.project_type||'concept',{select:[['concept','تصوّر إبداعي / تجربة شخصية'],['personal','عمل شخصي'],['client','مشروع عميل مصرح بنشره']]})}
  ${richField('summary_ar','شرح المشروع بالعربي',item.summary_ar,6)}${richField('summary_en','وصف المشروع بالإنجليزي',item.summary_en,6)}
  ${field('cover_style','ستايل الصورة التوضيحية',item.cover_style || 'aurora',{select:[['aurora','تدرجات فنية'],['type','حروف وتايبوجرافي'],['orbit','أشكال دائرية'],['pop','ألوان جريئة']]})}
  ${field('image_url','صورة المشروع (HTTPS أو مسار من assets/images)',item.image_url,{type:'text',full:true})}
  ${field('video_url','رابط فيديو مباشر (MP4 / WebM)',item.video_url||'',{type:'url',full:true})}
  ${field('youtube_url','رابط فيديو يوتيوب أو يوتيوب شورتس',item.youtube_url||'',{type:'url',full:true})}
  ${field('gallery_urls','صور إضافية للمعرض — رابط HTTPS في كل سطر',item.gallery_urls||'',{type:'textarea',full:true,rows:4})}
  ${richField('objective_ar','هدف المشروع بالعربي',item.objective_ar||'',10)}
  ${richField('objective_en','الهدف بالإنجليزي',item.objective_en||'',8)}
  ${field('text_font','خط النص الطويل',item.text_style?.font||'Alexandria',{select:FONT_CHOICES})}${field('text_size','حجم النص بالبكسل (14–30)',item.text_style?.size||17,{type:'number'})}
  <div class="form-field full cms-tool-entry"><span>الأدوات المستخدمة في المشروع</span><div class="cms-tools-box" data-tools-box><div data-tools-tags class="cms-tools-tags"></div><input data-tool-add placeholder="اكتب Photoshop واضغط Enter" aria-label="اكتب أداة واضغط Enter" maxlength="70"></div><input type="hidden" name="tools_used" value="${esc(formatTools(item.tools_used).join(', '))}"><small>اضغط Enter بعد كل برنامج علشان يظهر في خانة مستقلة، أو اضغط × لإزالته.</small></div>
  <label class="form-field full">رفع صورة غلاف للمشروع إلى Supabase Storage (بعد التفعيل) <input type="file" name="media_file" accept="image/png,image/jpeg,image/webp,image/avif" ${connected?'':'disabled'} /> <small>صورة بحد أقصى 8 MB. ترفع بصورة آمنة فقط عند تفعيل التخزين وسياسات الصلاحيات.</small></label>
  <label class="form-field full">إضافة صور متعددة للمعرض (حتى 15 صورة إضافية)<input type="file" name="gallery_files" multiple accept="image/png,image/jpeg,image/webp,image/avif" ${connected?'':'disabled'}/></label>
  ${field('external_url','رابط مشاهدة المشروع (HTTPS) - اختياري' ,item.external_url,{type:'url',full:true})}
  ${field('featured','مميز',item.featured,{type:'checkbox'})}`:
  `${field('description_ar','وصف الخدمة بالعربي',item.description_ar,{type:'textarea',full:true})}${field('description_en','وصف الخدمة بالإنجليزي',item.description_en,{type:'textarea',full:true})}
  ${field('icon','رمز الخدمة',item.icon || 'sparkles',{select:[['diamond','◇ Diamond'],['sparkles','✳ Sparkles'],['play','▷ Editing'],['layout','▦ Web'],['target','◎ Strategy'],['brush','✺ Design']]})}`}
  ${field('sort_order','الترتيب',item.sort_order ?? arr.length+1,{type:'number'})}${field('is_published','منشور على الموقع',item.is_published ?? false,{type:'checkbox'})}`;
  const preview=isProjects?`<div class="cms-project-preview" id="cmsProjectPreview"><div class="cms-preview-art">${safeUrl(item.image_url)?`<img id="previewImage" src="${esc(safeUrl(item.image_url))}" alt="معاينة الغلاف">`:`<span id="previewFallback">✳</span>`}</div><div><small>معاينة سريعة قبل النشر</small><h3 id="previewTitle">${esc(item.title_ar||'اسم مشروعك الجديد')}</h3><p id="previewCategory">${esc(item.category_ar||'تصنيف المشروع')}</p>${item.slug&&item.is_published?`<a href="./project.html?slug=${esc(item.slug)}" target="_blank" rel="noopener">فتح المشروع المنشور ↗</a>`:''}</div></div>`:'';
  return `<div class="admin-panel" id="editorPanel"><h2>${isNew?`إضافة ${noun}`:`تعديل ${noun}`}</h2><form data-entity="${table}" data-edit-id="${esc(item.id || '')}"><div class="admin-form-grid">${main}</div>${preview}<div class="admin-actions">${uiButton('إلغاء','cancel')}<button class="admin-btn" type="submit">حفظ ${noun}</button></div></form></div>`+list;
}
function renderMessages(){
 if(!connected)return `<div class="admin-panel"><h2>رسائل العملاء</h2><p class="admin-note">الرسائل تحتاج توصيل Supabase. على النسخة غير المتصلة، الطلبات تفتح واتساب ومش بتتحفظ هنا.</p></div>`;
 const messages=data.messages||[];
 return `<div class="admin-panel"><div class="admin-heading"><div><h2>صندوق طلبات العملاء</h2><p class="admin-note">افتح وسيلة التواصل المناسبة، سجل المتابعة، وحدّث حالة كل مشروع.</p></div><span class="admin-badge">${messages.length} طلب</span></div><div class="inbox-toolbar"><input id="inboxSearch" type="search" placeholder="دوّر باسم العميل أو نوع الخدمة" aria-label="بحث في الطلبات"><select id="inboxFilter" aria-label="فلترة الطلبات"><option value="">كل الحالات</option><option value="new">جديد</option><option value="reviewing">قيد المراجعة</option><option value="contacted">تم التواصل</option><option value="proposal_sent">تم إرسال عرض</option><option value="accepted">تم الاتفاق</option><option value="completed">مكتمل</option><option value="archived">مؤرشف</option></select></div><div id="inboxRows">${messages.map(m=>{
 const number=String(m.sender_phone||'').replace(/[^0-9]/g,'').replace(/^0(?=1[0125][0-9]{8}$)/,'20');
 const validPhone=number.length>=9&&number.length<=15;
 const safeEmail=encodeURIComponent(m.sender_email||'');
 return `<article class="message-card inbox-item" data-search="${esc((m.sender_name+' '+m.service_type+' '+m.sender_email).toLowerCase())}" data-status="${esc(m.status)}"><div class="admin-heading"><div><strong class="inbox-name">${esc(m.sender_name)} ${m.status==='new'?'<span class="inbox-new">جديد</span>':''}</strong><small>${esc(m.sender_email)} · ${esc(m.service_type)} · ${esc(new Date(m.created_at).toLocaleString('ar-EG'))}</small></div><select data-message-status="${esc(m.id)}" aria-label="حالة الطلب">${[['new','جديد'],['reviewing','قيد المراجعة'],['contacted','تم التواصل'],['proposal_sent','تم إرسال عرض'],['accepted','تم الاتفاق'],['completed','مكتمل'],['archived','مؤرشف']].map(([value,label])=>`<option value="${value}" ${m.status===value?'selected':''}>${label}</option>`).join('')}</select></div><p class="inbox-message">${esc(m.message)}</p><div class="inbox-meta">${m.company?`<span>الشركة: ${esc(m.company)}</span>`:''}${m.budget?`<span>حجم المشروع: ${esc(m.budget)}</span>`:''}${m.desired_timeline?`<span>المدة: ${esc(m.desired_timeline)}</span>`:''}${m.sender_phone?`<span>الهاتف: <b dir="ltr">${esc(m.sender_phone)}</b></span>`:''}${m.reference_url&&safeUrl(m.reference_url)?`<a href="${esc(safeUrl(m.reference_url))}" target="_blank" rel="noopener">الرابط المرجعي ↗</a>`:''}</div><div class="inbox-actions"><a class="admin-btn secondary" href="mailto:${safeEmail}?subject=${encodeURIComponent('بخصوص طلبك من Mo Design')}">↗ الرد بالإيميل</a>${validPhone?`<a class="admin-btn secondary" href="https://wa.me/${number}?text=${encodeURIComponent('أهلًا '+m.sender_name+'، معاك محمد من Mo Design. بخصوص طلب المشروع اللي بعته من الموقع.')}" target="_blank" rel="noopener noreferrer">↗ واتساب العميل</a>`:''}</div><label class="form-field full">ملاحظاتك الداخلية (مش ظاهرة للعميل)<textarea data-inquiry-note="${esc(m.id)}" rows="2" maxlength="2000">${esc(m.internal_notes||'')}</textarea></label>${uiButton('حفظ الملاحظات','savenote',m.id)}</article>`;
 }).join('')||'<p class="admin-empty">مفيش طلبات لحد دلوقتي.</p>'}</div></div>`;
}
function renderMedia(){
 return `<div class="admin-panel"><h2>مكتبة الصور والوسائط</h2><p class="admin-note">ارفع صورك مرة واستخدم الرابط في أي مشروع أو في إعدادات صورتك الشخصية. الصور بتتحفظ في Supabase مش على GitHub.</p><form id="mediaUploadForm" class="media-upload-form"><label class="form-field">اختار الصور (JPG / PNG / WebP / AVIF) <input type="file" name="uploads" multiple accept="image/png,image/jpeg,image/webp,image/avif" ${connected?'':'disabled'} required></label><button type="submit" class="admin-btn" ${connected?'':'disabled'}>رفع الصور</button></form><div id="mediaGallery" class="media-grid">${!connected?'<p class="admin-note">اتصل بـ Supabase الأول علشان تعرض مكتبة الصور.</p>':'<p class="admin-note">جارٍ تحميل الوسائط...</p>'}</div></div>`;
}
async function uploadImage(file,folder='general'){
 if(!['image/png','image/jpeg','image/webp','image/avif'].includes(file.type)||file.size>8*1024*1024)throw Error('اختار صورة PNG أو JPEG أو WebP أو AVIF بحد أقصى 8 ميجابايت.');
 const db=await getClient();const ext=({'image/png':'png','image/jpeg':'jpg','image/webp':'webp','image/avif':'avif'})[file.type];
 const path=`${folder}/${crypto.randomUUID()}.${ext}`;
 const {error}=await db.storage.from('portfolio-media').upload(path,file,{contentType:file.type,upsert:false,cacheControl:'3600'});
 if(error)throw error;
 return db.storage.from('portfolio-media').getPublicUrl(path).data.publicUrl;
}
async function uploadLearningVideo(file){
 if(!['video/mp4','video/webm'].includes(file.type)||file.size>45*1024*1024)throw Error('الفيديو لازم يكون MP4 أو WebM وحجمه أقل من 45 ميجابايت.');
 const db=await getClient();const ext=file.type==='video/mp4'?'mp4':'webm';
 const path=`learning/${crypto.randomUUID()}.${ext}`;
 const {error}=await db.storage.from('portfolio-video').upload(path,file,{contentType:file.type,upsert:false,cacheControl:'3600'});
 if(error)throw error;
 return db.storage.from('portfolio-video').getPublicUrl(path).data.publicUrl;
}
async function loadMedia(){
 const grid=$('#mediaGallery');if(!grid||!connected)return;
 try{
  const db=await getClient();const [project,other]=await Promise.all(['projects','general'].map(folder=>db.storage.from('portfolio-media').list(folder,{limit:100,sortBy:{column:'created_at',order:'desc'}})));
  const errors=[project,other].filter(r=>r.error);if(errors.length)throw errors[0].error;
  mediaCache=[...project.data.map(x=>({folder:'projects',...x})),...other.data.map(x=>({folder:'general',...x}))].filter(x=>x.name&&!x.name.startsWith('.'));
  grid.innerHTML=mediaCache.map(x=>{const url=db.storage.from('portfolio-media').getPublicUrl(x.folder+'/'+x.name).data.publicUrl;return `<div class="media-card"><img src="${esc(url)}" alt="صورة من مكتبة الوسائط" loading="lazy"><small dir="ltr" title="${esc(x.name)}">${esc(x.name.slice(0,14))}...</small><button type="button" class="admin-btn secondary" data-copy-url="${esc(url)}">نسخ الرابط</button></div>`}).join('')||'<p class="admin-empty">المكتبة فاضية، ابدأ برفع صورة.</p>';
 }catch(e){grid.innerHTML=`<p class="admin-note">تعذّر تحميل الصور: ${esc(e.message)}</p>`;}
}

function youtubeId(value){
 try{
  const u=new URL(value),host=u.hostname.toLowerCase();let id='';
  if(['youtu.be','www.youtu.be'].includes(host))id=u.pathname.slice(1).split('/')[0];
  else if(['youtube.com','www.youtube.com','m.youtube.com','www.youtube-nocookie.com'].includes(host)){
   if(u.pathname==='/watch')id=u.searchParams.get('v')||'';
   else if(/^\/(shorts|embed|live)\//.test(u.pathname))id=u.pathname.split('/')[2]||'';
  }
  return /^[A-Za-z0-9_-]{11}$/.test(id)?id:'';
 }catch{return '';}
}
function renderLearningItemEditor(item){
 const isNew=!item.id;
 const mediaId=youtubeId(item.youtube_url||'');
 return `<div class="admin-panel v10-lesson-form" id="lessonEditor"><div class="admin-heading"><div><span class="v10-eyebrow">محرر المحتوى</span><h2>${isNew?'إضافة محتوى جديد':'تعديل المحتوى'}</h2><p class="admin-note">احفظه كمسودة الأول، وبعد المراجعة فعّل النشر.</p></div>${uiButton('إلغاء','cancelLesson')}</div>
 <form data-entity="learning_items" data-edit-id="${esc(item.id||'')}"><div class="admin-form-grid">
 ${field('content_type','نوع المحتوى',item.content_type||'video',{select:[['video','فيديو يوتيوب / شورتس'],['article','مقال أو شرح مكتوب']]})}
 ${field('sort_order','ترتيب الظهور',item.sort_order??((data.learning_items||[]).length+1),{type:'number'})}
 ${field('title_ar','عنوان المحتوى بالعربي',item.title_ar||'',{required:true})}
 ${field('title_en','العنوان بالإنجليزي',item.title_en||'')}
 ${richField('summary_ar','وصف قصير بالعربي',item.summary_ar||'',3)}
 ${richField('summary_en','الوصف بالإنجليزي',item.summary_en||'',3)}
 ${field('youtube_url','رابط فيديو YouTube أو Shorts (اختياري لو هترفع فيديو)',item.youtube_url||'',{type:'url',full:true})}
 ${field('video_url','رابط MP4 أو WebM مباشر (اختياري)',item.video_url||'',{type:'url',full:true})}
 <label class="form-field full">ارفع فيديو من جهازك (MP4 / WebM، بحد أقصى 45 ميجابايت)<input name="lesson_video_file" type="file" accept="video/mp4,video/webm" ${connected?'':'disabled'}><small>الفيديو بيترفع على Supabase Storage عند الضغط على حفظ. للفيديوهات الكبيرة استخدم يوتيوب لتوفير المساحة.</small></label>
 ${field('thumbnail_url','رابط صورة مصغرة (اختياري)',item.thumbnail_url||'',{type:'url',full:true})}
 <label class="form-field full">أو ارفع صورة مصغّرة من جهازك (JPG / PNG / WebP لحد 8 ميجابايت)<input type="file" name="lesson_thumbnail_file" accept="image/png,image/jpeg,image/webp,image/avif" ${connected?'':'disabled'}><small>لو اخترت صورة هنا هتترفع تلقائيًا وقت الحفظ، وتظهر على بطاقة الدرس.</small></label>
 ${field('image_urls','صور الشرح داخل الدرس — رابط HTTPS لكل صورة في سطر (اختياري)',item.image_urls||'',{type:'textarea',full:true,rows:3})}
 <label class="form-field full">ارفع صور الشرح من الكمبيوتر (حتى 15 صورة إجماليًا، 8MB للصورة)<input type="file" name="lesson_images_files" accept="image/png,image/jpeg,image/webp,image/avif" multiple ${connected?'':'disabled'}><small>كل صورة هتظهر كاملة داخل صفحة الدرس بعد الشرح، بالترتيب اللي رفعتها بيه.</small></label>
 ${field('text_font','خط المحتوى',item.text_style?.font||'Alexandria',{select:FONT_CHOICES})}${field('text_size','حجم النص بالبكسل (14–30)',item.text_style?.size||17,{type:'number'})}
 ${field('resource_links','روابط الشرح وملفات PDF أو Google Drive (كل رابط في سطر، بصيغة: اسم الملف | https://...)',item.resource_links||'',{type:'textarea',full:true,rows:4})}
 <p class="admin-note full">علشان ملفات Google Drive تفتح للزوار: افتح إعدادات المشاركة للملف واختر «أي شخص معه الرابط — مشاهد».</p>
 ${richField('body_ar','نص المقال بالعربي (لنوع مقال)',item.body_ar||'',9)}
 ${richField('body_en','نص المقال بالإنجليزي',item.body_en||'',8)}
 ${field('is_published','انشر المحتوى على الموقع',item.is_published||false,{type:'checkbox',full:true})}
 </div>${mediaId?`<div class="v10-video-preview"><img src="https://i.ytimg.com/vi/${mediaId}/hqdefault.jpg" alt="معاينة فيديو يوتيوب"><div>معاينة الصورة المصغّرة <a href="https://www.youtube.com/watch?v=${mediaId}" target="_blank" rel="noopener noreferrer">↗ جرّب فتح الفيديو على يوتيوب</a></div></div>`:''}<div class="admin-actions">${uiButton('إلغاء','cancelLesson')}<button class="admin-btn" type="submit">${isNew?'حفظ المحتوى':'حفظ التعديلات'} ✓</button></div></form></div>`;
}
function renderFuture(){
 const settings=data.settings||seed.settings,vis=settings.section_visibility||{},items=data.learning_items||[];
 const mode=vis.learn===false?'hidden':(['hidden','coming_soon','live'].includes(settings.education_mode)?settings.education_mode:'coming_soon');
 const fields=[['learn_title','عنوان القسم في حالة قريبًا'],['learn_desc','شرح القسم في حالة قريبًا'],['learn_tag','الشارة في حالة قريبًا'],['learn_live_title','عنوان القسم بعد بدء النشر'],['learn_live_desc','وصف القسم بعد بدء النشر'],['learn_live_tag','الشارة بعد بدء النشر']];
 const copyFields=fields.map(([key,label])=>`<div class="v10-editor-pair">${field('ar_'+key,label+' — عربي',(settings.content_ar||{})[key]??ar[key]??'',{type:'textarea',rows:2})}${field('en_'+key,label+' — إنجليزي',(settings.content_en||{})[key]??en[key]??'',{type:'textarea',rows:2})}</div>`).join('');
 const editor=editing?.table==='learning_items'?renderLearningItemEditor(items.find(x=>String(x.id)===String(editing.id))||{}):'';
 return `<div class="admin-panel v10-education-header"><div><span class="v10-eyebrow">استوديو المحتوى التعليمي</span><h2>من «قريبًا» لأول فيديو.</h2><p>هنا تقدر تختار إمتى تظهر الأكاديمية، وتكتب الرسالة اللي تناسب كل مرحلة، وتنشر فيديوهات يوتيوب أو مقالات بنفسك.</p></div><span class="v10-education-icon">▷</span></div>
 <div class="admin-panel"><div class="admin-heading"><div><h2>حالة قسم التعليم</h2><p class="admin-note">اختار حالة واحدة؛ الكلام والبطاقات في الموقع هيتغيروا تلقائيًا بعد الحفظ.</p></div><a href="./index.html#learn" class="admin-btn secondary" target="_blank" rel="noopener">معاينة القسم ↗</a></div><form data-entity="future" id="educationForm">
 <div class="v10-status-options">${[['hidden','مخفي','مش هيظهر للزوار لحد ما تقرر'],['coming_soon','قريبًا','تعريف بمحتوى لسه بيتجهّز'],['live','بدأنا النشر','عرض الفيديوهات والمقالات المنشورة']].map(([key,title,detail])=>`<label class="v10-status-option ${mode===key?'selected':''}"><input type="radio" name="education_mode" value="${key}" ${mode===key?'checked':''}><span class="v10-radio-circle"></span><strong>${title}</strong><small>${detail}</small></label>`).join('')}</div>
 <details class="v10-copy-expander" open><summary>✎ عدّل كلام قسم التعليم (قبل وبعد النشر)</summary><div class="v10-copy-body">${copyFields}</div></details>
 <div class="v10-education-save"><button class="admin-btn" type="submit">حفظ الحالة والنصوص ✓</button><span class="admin-note">مفيش حاجة هتظهر للزوار إلا بعد اختيار «بدأنا النشر» ونشر محتوى.</span></div></form></div>
 <div class="admin-panel" id="learningStudioList"><div class="admin-heading"><div><h2>مكتبة الفيديوهات والمقالات</h2><p class="admin-note">انشر محتوى حقيقي من غير ما ترجع GitHub. المسودات مش بتظهر للزوار.</p></div>${uiButton('＋ إضافة محتوى','newlesson','','primary')}</div>
 ${data.learning_error?`<div class="admin-banner">الأكاديمية محتاجة تشغيل ملف التحديث SQL رقم 005 أولًا: ${esc(data.learning_error)}</div>`:''}
 <div class="v10-learning-table"><div class="v10-learning-table-head"><span>المحتوى</span><span>الحالة</span><span>التحكم</span></div>${items.map(item=>{let id=youtubeId(item.youtube_url||'');return `<div class="v10-learning-row"><div class="v10-learning-title">${safeUrl(item.thumbnail_url)?`<img src="${esc(safeUrl(item.thumbnail_url))}" loading="lazy" alt="">`:id?`<img src="https://i.ytimg.com/vi/${id}/mqdefault.jpg" loading="lazy" alt="">`:'<span class="v10-lesson-fallback">✳</span>'}<div><strong>${esc(item.title_ar)}</strong><small>${item.content_type==='video'?'فيديو / يوتيوب':'مقال'} · ${esc(item.title_en||'بدون ترجمة')}</small></div></div><span class="v10-status-tag ${item.is_published?'published':''}">${item.is_published?'منشور':'مسودة'}</span><div class="v10-learning-actions">${uiButton(item.is_published?'إخفاء':'نشر','togglepublish',`learning_items|${item.id}`)}${uiButton('تعديل','editLesson',item.id)}${uiButton('حذف','deleteLesson',item.id,'danger')}</div></div>`}).join('')||'<div class="v10-no-lesson">مفيش محتوى اتضاف لسه. اضغط «إضافة محتوى» علشان تبدأ.</div>'}</div></div>${editor}`;
}


const DESIGN_SECTIONS=[['home','بداية الموقع'],['featured','المشاريع المميزة'],['signature','أكتر من مجرد تصميم'],['work','معرض الأعمال'],['services','الخدمات'],['why','أسلوبي في الشغل'],['about','نبذة عني'],['process','مراحل التنفيذ'],['testimonials','آراء العملاء'],['cta','شغلك يستحق يتشاف'],['learn','الأكاديمية والمحتوى'],['contact','التواصل']];
function renderAppearance(){
 const design=data.settings?.section_design||{};
 const fields=DESIGN_SECTIONS.map(([id,label],index)=>{
  const d=design[id]||{};
  const color=(key,fallback)=>/^#[a-fA-F0-9]{6}$/.test(d[key]||'')?d[key]:fallback;
  const colorInput=(key,title,def)=>`<label class="form-field v11-color-field">${title}<input type="color" name="${id}__${key}" value="${color(key,def)}"></label>`;
  return `<details class="v11-section-editor" ${index===0?'open':''}><summary><span>◈ ${esc(label)}</span><small>ألوان الدارك واللايت • كافر • حجم القسم</small></summary><div class="admin-form-grid">
    ${field(id+'__enabled','تفعيل المظهر المخصص للقسم (الغيه علشان ترجع للتصميم الافتراضي)',d.enabled||false,{type:'checkbox',full:true})}
    ${colorInput('dark_bg','خلفية الدارك مود','#10121a')}${colorInput('dark_text','الكتابة في الدارك مود','#f4f4f5')}${colorInput('dark_accent','اللون المميز في الدارك مود','#c6fa8a')}
    ${colorInput('light_bg','خلفية اللايت مود','#f7f5ef')}${colorInput('light_text','الكتابة في اللايت مود','#172026')}${colorInput('light_accent','اللون المميز في اللايت مود','#39671a')}
    ${field(id+'__cover_url','رابط الكافر الحالي (اختياري)',d.cover_url||'',{type:'url',full:true})}
    <label class="form-field full">ارفع كافر من جهازك لهذا القسم (اختياري)<input name="${id}__cover_file" type="file" accept="image/png,image/jpeg,image/webp,image/avif" ${connected?'':'disabled'}><small>حد أقصى 8 ميجابايت للصورة، وتقدر تغيّره أو تمسح الرابط في أي وقت.</small></label>
    ${field(id+'__font','خط نصوص القسم',d.font||'',{select:[['','الخط الحالي'],...FONT_CHOICES]})}
    ${field(id+'__heading_size','حجم العنوان الرئيسي (0 = التصميم الأساسي)',d.heading_size??0,{type:'number'})}
    ${field(id+'__body_size','حجم الوصف (0 = التصميم الأساسي)',d.body_size??0,{type:'number'})}
    ${field(id+'__padding','المسافة الداخلية بالأعلى والأسفل (36 إلى 220)',d.padding??90,{type:'number'})}
    ${field(id+'__height','أقل ارتفاع للقسم بالبكسل (0 = تلقائي)',d.height??0,{type:'number'})}
    ${field(id+'__shade','تعتيم صورة الكافر (من 0.1 إلى 0.92)',d.shade??0.7,{type:'text'})}
    </div></details>`;
 }).join('');
 return `<section class="admin-panel v11-appearance"><div class="admin-heading"><div><h2>تحكّم في شكل أقسام الموقع</h2><p class="admin-note">كل قسم تقدر تغيّر خلفيته ولون الكتابة واللون المميز وصورة الكافر وارتفاعه. تغيير ألوان اللايت ما يأثرش على الدارك.</p></div><a href="./index.html" target="_blank" rel="noopener" class="admin-btn secondary">معاينة ↗</a></div><form data-entity="appearance" id="appearanceForm"><details class="v11-section-editor" open><summary>✎ العنوان والوصف: «التفاصيل اللي بتفرق»</summary><div class="admin-form-grid">${field('reviews_title_ar','عنوان القسم بالعربي',(data.settings?.content_ar||{}).reviews_title??ar.reviews_title??'التفاصيل اللي بتفرق.',{full:true})}${field('reviews_title_en','العنوان بالإنجليزي',(data.settings?.content_en||{}).reviews_title??en.reviews_title??'The details make the difference.',{full:true})}${field('reviews_sub_ar','وصف القسم بالعربي',(data.settings?.content_ar||{}).reviews_sub??ar.reviews_sub??'',{type:'textarea',full:true})}${field('reviews_sub_en','وصف القسم بالإنجليزي',(data.settings?.content_en||{}).reviews_sub??en.reviews_sub??'',{type:'textarea',full:true})}</div></details><div class="v11-appearance-help">لتطبيق الشكل الجديد على قسم، فعّل خيار «المظهر المخصص» داخل القسم نفسه؛ الأقسام اللي مش مفعّلة هتحتفظ بشكلها الحالي. متشغّلش صورة كافر إلا لو محتاجها فعلًا، وخلي الكتابة واضحة فوقها.</div>${fields}<div class="admin-sticky-actions"><button class="admin-btn" type="submit">حفظ ألوان وخلفيات الأقسام ✓</button><small>التغييرات بتظهر للزوار بعد حفظها في Supabase وتحديث الصفحة.</small></div></form></section>`;
}
function renderNoticeEditor(){
 const s=data.settings?.site_notice||{};
 const dt=(v)=>{if(!v)return '';const d=new Date(v);if(Number.isNaN(d.getTime()))return '';const t=new Date(d.getTime()-d.getTimezoneOffset()*60000);return t.toISOString().slice(0,16)};
 return `<section class="admin-panel"><div class="admin-heading"><div><h2>إشعار يظهر للزوار</h2><p class="admin-note">رسالة واحدة مؤقتة. تقدر تحدد فترة ظهورها ومدة بقائها على الشاشة أو توقفها فورًا.</p></div></div>
 <form data-entity="notice" id="noticeForm"><div class="admin-form-grid">
 ${field('notice_enabled','تفعيل الإشعار',s.enabled||false,{type:'checkbox',full:true})}
 ${field('notice_title_ar','عنوان الإشعار بالعربي',s.title_ar||'')}${field('notice_title_en','العنوان بالإنجليزي',s.title_en||'')}
 ${field('notice_message_ar','النص بالعربي',s.message_ar||'',{type:'textarea',rows:3})}${field('notice_message_en','النص بالإنجليزي',s.message_en||'',{type:'textarea',rows:3})}
 ${field('notice_duration','مدة ظهور الإشعار بالثواني (3 إلى 120)',s.duration_seconds??30,{type:'number'})}
 <label class="form-field">يبدأ من (اختياري)<input name="notice_starts" type="datetime-local" value="${esc(dt(s.starts_at))}"></label>
 <label class="form-field">ينتهي في (اختياري)<input name="notice_ends" type="datetime-local" value="${esc(dt(s.ends_at))}"></label>
 </div><div class="admin-actions"><button type="submit" class="admin-btn">حفظ الإشعار ✓</button>${uiButton('إخفاء ومسح الإشعار','clearNotice','','danger')}</div></form>
 <p class="admin-note">لو الزائر قفل الإشعار من ×، مش هيظهر تاني في نفس تبويب المتصفح. لإعادة عرضه للزوار بعد تعديل الإشعار، احفظ نسخة جديدة منه.</p></section>`;
}
function renderPanel(){
  if(!data)return;
  const main=$('#adminMain'); if(!main) return;
  const body=({overview:renderOverview,content:renderContent,appearance:renderAppearance,settings:renderSettings,projects:()=>renderItems('projects'),media:renderMedia,services:()=>renderItems('services'),testimonials:()=>renderItems('testimonials'),messages:renderMessages,future:renderFuture,notice:renderNoticeEditor})[tab]();
  main.innerHTML=`<header class="admin-heading v10-page-head"><div><span class="v10-page-path">Mo Design <span>/</span> مساحة العمل <span>/</span> ${esc(labels[tab])}</span><h1>${esc(labels[tab])}</h1><p>أدواتك ومحتواك وطلبات الشغل في مكان واحد.</p></div><div class="v10-page-actions"><span class="admin-badge">${connected?`<span class="v10-online-dot"></span> متصل`:'◌ وضع تجربة محلية'}</span><a href="./index.html" target="_blank" rel="noopener" class="admin-btn secondary">↗ شوف الموقع</a></div></header>${!connected?`<div class="admin-banner"><strong>وضع المعاينة المحلي:</strong> التعديلات تُحفظ على هذا المتصفح فقط، ويمكن لأي شخص فتح لوحة المعاينة. ليست لوحة إنتاج آمنة ولا قاعدة بيانات عامة. لبدء الإدارة الحقيقية فعّل Supabase واتبع ملف التعليمات.</div>`:''}${body}`;
  document.querySelectorAll('[data-tab]').forEach(el=>el.classList.toggle('active',el.dataset.tab===tab));
  if(tab==='media')void loadMedia();
  setupToolTags(main);
  refreshAdminLogos();
}
function setupToolTags(root){
 root.querySelectorAll('[data-tools-box]').forEach(box=>{
   const input=box.querySelector('[data-tool-add]'), tags=box.querySelector('[data-tools-tags]'), hidden=box.parentElement.querySelector('[name="tools_used"]');
   let values=formatTools(hidden.value);
   function draw(){hidden.value=values.join(', ');tags.innerHTML=values.map((x,i)=>`<span class="cms-tool-pill">${esc(x)}<button type="button" data-remove-tool="${i}" aria-label="حذف ${esc(x)}">×</button></span>`).join('')}
   input.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===','){e.preventDefault();const val=input.value.trim().replace(/[,،]+$/,'');if(val&&!values.some(v=>v.toLowerCase()===val.toLowerCase()))values.push(val);input.value='';draw();}});
   input.addEventListener('blur',()=>{const val=input.value.trim();if(val&&!values.some(v=>v.toLowerCase()===val.toLowerCase()))values.push(val);input.value='';draw();});
   tags.addEventListener('click',e=>{const b=e.target.closest('[data-remove-tool]');if(!b)return;values.splice(Number(b.dataset.removeTool),1);draw();input.focus();});
   draw();
 });
}
function getFields(form,table){
  const f=new FormData(form);
  const get=k=>String(f.get(k)||'').trim();
  if(table==='content'){
    const content_ar={...(data.settings?.content_ar||{})},content_en={...(data.settings?.content_en||{})};
    [...Object.values(CONTENT_GROUPS).flat(),...copyGroup()].forEach(([key])=>{content_ar[key]=get('ar_'+key);content_en[key]=get('en_'+key);});
    const section_visibility={...(data.settings?.section_visibility||{})};SECTIONS.forEach(([id])=>section_visibility[id]=f.has('section_'+id));
    return {content_ar,content_en,section_visibility,headline_ar:get('headline_ar'),headline_en:get('headline_en'),subheadline_ar:get('subheadline_ar'),subheadline_en:get('subheadline_en')};
  }
  if(table==='appearance'){
    const section_design=structuredClone(data.settings?.section_design||{});
    for(const [id] of DESIGN_SECTIONS){
      const current={...(section_design[id]||{})};
      current.enabled=f.has(id+'__enabled');
      for(const key of ['dark_bg','dark_text','dark_accent','light_bg','light_text','light_accent'])current[key]=get(id+'__'+key);
      current.font=get(id+'__font');
      current.heading_size=Math.max(0,Math.min(110,Number(get(id+'__heading_size'))||0));
      current.body_size=Math.max(0,Math.min(32,Number(get(id+'__body_size'))||0));
      current.cover_url=get(id+'__cover_url');
      current.padding=Math.max(36,Math.min(220,Number(get(id+'__padding'))||90));
      current.height=Math.max(0,Math.min(900,Number(get(id+'__height'))||0));
      current.shade=Math.max(.1,Math.min(.92,Number(get(id+'__shade'))||.7));
      section_design[id]=current;
    }
    const content_ar={...(data.settings?.content_ar||{})};const content_en={...(data.settings?.content_en||{})};
    for(const key of ['reviews_title','reviews_sub']){content_ar[key]=get(key+'_ar');content_en[key]=get(key+'_en');}
    return {section_design,content_ar,content_en};
  }
  if(table==='future'){
    const mode=['hidden','coming_soon','live'].includes(get('education_mode'))?get('education_mode'):'coming_soon';
    const content_ar={...(data.settings?.content_ar||{})},content_en={...(data.settings?.content_en||{})};
    ['learn_title','learn_desc','learn_tag','learn_live_title','learn_live_desc','learn_live_tag'].forEach(key=>{content_ar[key]=get('ar_'+key);content_en[key]=get('en_'+key);});
    return {education_mode:mode,content_ar,content_en,section_visibility:{...(data.settings?.section_visibility||{}),learn:mode!=='hidden'}};
  }
  if(table==='learning_items')return {text_style:{font:get('text_font')||'Alexandria',size:Math.max(14,Math.min(30,Number(get('text_size'))||17))},image_urls:get('image_urls'),content_type:get('content_type')==='article'?'article':'video',title_ar:get('title_ar'),title_en:get('title_en'),summary_ar:get('summary_ar'),summary_en:get('summary_en'),body_ar:get('body_ar'),body_en:get('body_en'),youtube_url:get('youtube_url'),video_url:get('video_url'),thumbnail_url:get('thumbnail_url'),resource_links:get('resource_links'),sort_order:Number(get('sort_order'))||0,is_published:f.has('is_published')};
  if(table==='notice'){
    const old=data.settings?.site_notice||{};
    const iso=key=>{const val=get(key);return val?new Date(val).toISOString():null;};
    return {site_notice:{enabled:f.has('notice_enabled'),title_ar:get('notice_title_ar'),title_en:get('notice_title_en'),message_ar:get('notice_message_ar'),message_en:get('notice_message_en'),duration_seconds:Math.max(3,Math.min(120,Number(get('notice_duration'))||30)),starts_at:iso('notice_starts'),ends_at:iso('notice_ends'),id:Date.now().toString(36)}};
  }
  if(table==='settings'){
    return {brand_ar:get('brand_ar'),brand_en:get('brand_en'),personal_name:get('personal_name'),role_ar:get('role_ar'),role_en:get('role_en'),headline_ar:get('headline_ar'),headline_en:get('headline_en'),subheadline_ar:get('subheadline_ar'),subheadline_en:get('subheadline_en'),bio_ar:get('bio_ar'),bio_en:get('bio_en'),profile_image_url:get('profile_image_url'),logo_dark_url:get('logo_dark_url'),logo_light_url:get('logo_light_url'),contact_email:get('contact_email'),instagram_url:get('instagram_url'),behance_url:get('behance_url'),linkedin_url:get('linkedin_url'),whatsapp_url:get('whatsapp_url'),tiktok_url:get('tiktok_url'),facebook_url:get('facebook_url'),community_url:get('community_url'),availability:f.has('availability'),stats_projects:Math.max(0,Number(get('stats_projects'))||0),stats_years:Math.max(0,Number(get('stats_years'))||0),stats_satisfaction:Math.max(0,Math.min(100,Number(get('stats_satisfaction'))||0)),stats_verified:f.has('stats_verified')};
  }
  const common={sort_order:Number(get('sort_order'))||0,is_published:f.has('is_published')};
  if(table==='testimonials')return {...common,author_ar:get('author_ar'),author_en:get('author_en'),job_ar:get('job_ar'),job_en:get('job_en'),quote_ar:get('quote_ar'),quote_en:get('quote_en'),rating:Math.max(0,Math.min(5,Number(get('rating'))||0)),is_verified:f.has('is_verified')};
  if(table==='projects'){const category=PORTFOLIO_CATEGORIES.find(c=>c.id===get('category_id'))||PORTFOLIO_CATEGORIES[0];return {...common,text_style:{font:get('text_font')||'Alexandria',size:Math.max(14,Math.min(30,Number(get('text_size'))||17))},title_ar:get('title_ar'),title_en:get('title_en'),category_ar:category.ar,category_en:category.en,summary_ar:get('summary_ar'),summary_en:get('summary_en'),cover_style:get('cover_style'),image_url:get('image_url'),external_url:get('external_url'),featured:f.has('featured'),video_url:get('video_url'),gallery_urls:get('gallery_urls'),objective_ar:get('objective_ar'),objective_en:get('objective_en'),tools_used:get('tools_used'),youtube_url:get('youtube_url'),project_type:get('project_type'),slug:get('slug') || `project-${Date.now()}`};}
  return {...common,title_ar:get('title_ar'),title_en:get('title_en'),description_ar:get('description_ar'),description_en:get('description_en'),icon:get('icon')};
}
async function saveForm(form){
  const table=form.dataset.entity;
  if(!form.reportValidity() || busy)return;
  const entry=getFields(form,table);
  const id=form.dataset.editId;
  if(table==='learning_items'){
    const imageCount=String(entry.image_urls||'').split(/\r?\n/).filter(Boolean).length+(form.querySelector('input[name="lesson_images_files"]')?.files?.length||0);
    if(imageCount>15){toast('يسمح بحد أقصى 15 صورة شرح في الدرس.');return;}
    if(entry.title_ar.length<2){toast('اكتب عنوان عربي من حرفين على الأقل.');return;}
    if(entry.content_type==='video' && !youtubeId(entry.youtube_url) && !(/^https:\/\//.test(entry.video_url)||form.querySelector('input[name="lesson_video_file"]')?.files?.length)){toast('اربط فيديو يوتيوب أو ارفع فيديو MP4 / WebM من جهازك.');return;}
    if(entry.youtube_url && !youtubeId(entry.youtube_url)){toast('رابط يوتيوب مش صحيح.');return;}
    if(entry.video_url && !/^https:\/\//.test(entry.video_url)){toast('رابط الفيديو المباشر لازم يكون HTTPS.');return;}
    if(entry.thumbnail_url && !/^https:\/\//.test(entry.thumbnail_url)){toast('رابط الصورة لازم يبدأ بـ https://');return;}
    if(entry.image_urls && entry.image_urls.split(/\r?\n/).filter(Boolean).some(u=>!/^https:\/\//i.test(u.trim()))){toast('كل صورة شرح لازم تكون رابط HTTPS صحيح.');return;}
    if(entry.resource_links && entry.resource_links.split(/\r?\n/).some(v=>{if(!v.trim())return false;const url=v.split('|').pop().trim();return !/^https:\/\//i.test(url)})){toast('رابط الملف لازم يبدأ بـ https://، واكتب كل ملف في سطر.');return;}
  }
  if(table==='projects') {
    const imageCount=String(entry.gallery_urls||'').split(/\r?\n/).filter(Boolean).length+(form.querySelector('input[name="gallery_files"]')?.files?.length||0);
    if(imageCount>15){toast('يسمح بحد أقصى 15 صورة إضافية للمشروع.');return;}
    if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.slug)){toast('رابط المشروع يجب أن يكون إنجليزيًا بحروف صغيرة وشرطات فقط.');return;}
    if(entry.image_url && !(/^https:\/\//i.test(entry.image_url) || /^\.\/assets\/images\/[\w.-]+$/i.test(entry.image_url))) {toast('استخدم رابط HTTPS أو صورة من مجلد assets/images.');return;}
    if(entry.external_url && !/^https:\/\//i.test(entry.external_url)){toast('رابط المشروع يجب أن يبدأ بـ HTTPS');return;}
    if(entry.youtube_url && !/^https:\/\/(www\.)?(youtube\.com|youtu\.be|m\.youtube\.com)\//i.test(entry.youtube_url)){toast('حط رابط يوتيوب أو شورتس صحيح.');return;}
    if(entry.video_url && !/^https:\/\//i.test(entry.video_url)){toast('الفيديو يجب أن يكون برابط HTTPS');return;}
    if(entry.gallery_urls && !entry.gallery_urls.split(/\r?\n/).filter(Boolean).every(x=>/^https:\/\//i.test(x))){toast('كل صورة إضافية لازم تكون رابط HTTPS في سطر مستقل.');return;}
  }
  busy=true;
  try {
    if(connected && table==='settings'){
      const file=form.querySelector('input[name="profile_file"]')?.files?.[0];
      if(file)entry.profile_image_url=await uploadImage(file,'general');
      for(const [fieldName,key] of [['logo_dark_file','logo_dark_url'],['logo_light_file','logo_light_url']]){
        const newLogo=form.querySelector(`input[name="${fieldName}"]`)?.files?.[0];
        if(newLogo)entry[key]=await uploadImage(newLogo,'general');
      }
    }
    if(connected && table==='learning_items'){
      const videoFile=form.querySelector('input[name="lesson_video_file"]')?.files?.[0];
      if(videoFile)entry.video_url=await uploadLearningVideo(videoFile);
      const thumbnail=form.querySelector('input[name="lesson_thumbnail_file"]')?.files?.[0];
      if(thumbnail)entry.thumbnail_url=await uploadImage(thumbnail,'learning');
      const lessonImages=[...(form.querySelector('[name="lesson_images_files"]')?.files||[])];
      if(lessonImages.length+String(entry.image_urls||'').split(/\r?\n/).filter(Boolean).length>15)throw new Error('الحد الأقصى للصور في الدرس 15 صورة. احذف صور قديمة أولًا.');
      const images=String(entry.image_urls||'').split(/\r?\n/).map(v=>v.trim()).filter(Boolean);
      for(const picture of lessonImages)images.push(await uploadImage(picture,'learning'));
      entry.image_urls=images.join('\n');
    }
    if(connected && table==='appearance'){
      for(const [section] of DESIGN_SECTIONS){
        const file=form.querySelector(`input[name="${section}__cover_file"]`)?.files?.[0];
        if(file)entry.section_design[section].cover_url=await uploadImage(file,'general');
      }
    }
    if(connected && table==='projects'){
      const file=form.querySelector('input[name="media_file"]')?.files?.[0];
      if(file)entry.image_url=await uploadImage(file,'projects');
      const images=[...(form.querySelector('input[name="gallery_files"]')?.files||[])];
      if(images.length+String(entry.gallery_urls||'').split(/\r?\n/).filter(Boolean).length>15)throw new Error('الحد الأقصى لصور المشروع 15 صورة. احذف صور قديمة أولًا.');
      if(images.length){
        const urls=(entry.gallery_urls||'').split(/\r?\n/).map(v=>v.trim()).filter(Boolean);
        for(const photo of images)urls.push(await uploadImage(photo,'projects'));
        entry.gallery_urls=urls.join('\n');
      }
    }
    if(connected){
      const db=await getClient(); let result;
      if(['settings','content','future','appearance','notice'].includes(table))result=await db.from('site_settings').update(entry).eq('id',1);
      else {
        const payload={...entry};
        if(id)payload.id=id;
        else if(table==='projects')payload.slug=entry.slug || `project-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
        result=await db.from(table).upsert(payload);
      }
      if(result.error)throw result.error;
      data=await getAdminContent();
    } else {
      if(['settings','content','future','appearance','notice'].includes(table))data.settings={...data.settings,...entry};
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
$('#adminApp').addEventListener('input',e=>{
  const target=e.target;
  if(target.id==='cmsCopySearch'){const q=target.value.trim().toLocaleLowerCase();
    document.querySelectorAll('.cms-editor-group').forEach(group=>{let found=0;group.querySelectorAll('.form-field').forEach(el=>{const ok=!q||el.textContent.toLocaleLowerCase().includes(q);el.hidden=!ok;if(ok)found++;});group.hidden=!!q&&!found;if(q&&found)group.open=true;});return;
  }
  if(target.closest('#appearanceForm') && /__(dark_bg|dark_text|dark_accent|light_bg|light_text|light_accent|cover_url|cover_file|font|heading_size|body_size|padding|height|shade)$/.test(target.name||'')){
    const section=target.name.split('__')[0];const flag=document.querySelector(`[name="${section}__enabled"]`);if(flag)flag.checked=true;
  }
});
$('#adminApp').addEventListener('click',async e=>{
  const rb=e.target.closest('[data-rich]');if(rb){
    const area=rb.closest('.cms-rich-wrap')?.querySelector('textarea');if(!area)return;
    const a=area.selectionStart,b=area.selectionEnd,selected=area.value.slice(a,b)||'النص';
    const out=rb.dataset.rich==='bold'?`**${selected}**`:rb.dataset.rich==='italic'?`*${selected}*`:rb.dataset.rich==='heading'?`## ${selected}`:`- ${selected}`;
    area.setRangeText(out,a,b,'select');area.focus();return;
  }
  const nav=e.target.closest('button[data-tab]');
  if(nav){tab=nav.dataset.tab;editing=null;renderPanel();window.scrollTo({top:0,behavior:'smooth'});return;}
  const copyBtn=e.target.closest('[data-copy-url]');if(copyBtn){try{await navigator.clipboard.writeText(copyBtn.dataset.copyUrl);toast('تم نسخ الرابط ✓');}catch{toast('تعذر نسخ الرابط');}return;}
  const btn=e.target.closest('button[data-action]');if(!btn)return;
  const {action,id}=btn.dataset;
  if(action==='clearNotice'){
    const form=document.getElementById('noticeForm');if(!form)return;
    for(const k of ['notice_title_ar','notice_title_en','notice_message_ar','notice_message_en','notice_starts','notice_ends']){const el=form.elements.namedItem(k);if(el)el.value='';}
    form.elements.namedItem('notice_enabled').checked=false;form.requestSubmit();return;
  }
  if(action==='goto'){tab=id;editing=null;renderPanel();window.scrollTo({top:0});return;}
  if(action==='themeToggle'){const light=document.documentElement.classList.toggle('light');localStorage.setItem('portfolio_theme',light?'light':'dark');refreshAdminLogos();renderPanel();return;}
  if(action==='newlesson'){tab='future';editing={table:'learning_items',id:null};renderPanel();$('#lessonEditor')?.scrollIntoView({behavior:'smooth'});return;}
  if(action==='editLesson'){tab='future';editing={table:'learning_items',id};renderPanel();$('#lessonEditor')?.scrollIntoView({behavior:'smooth'});return;}
  if(action==='cancelLesson'){editing=null;renderPanel();return;}
  if(action==='deleteLesson'){await deleteItem('learning_items',id);return;}
  if(action==='newproject'){tab='projects';editing={table:'projects',id:null};renderPanel();$('#editorPanel')?.scrollIntoView({behavior:'smooth'});return;}
  if(action==='add'){tab=id;editing={table:id,id:null};renderPanel();$('#editorPanel')?.scrollIntoView({behavior:'smooth'});}
  if(action==='edit'){const [table,itemId]=id.split('|');tab=table;editing={table,id:itemId};renderPanel();$('#editorPanel')?.scrollIntoView({behavior:'smooth'});}
  if(action==='cancel'){editing=null;renderPanel();}
  if(action==='togglepublish' && connected){
    const [table,itemId]=id.split('|');const item=(data[table]||[]).find(x=>x.id===itemId);
    if(!item)return;
    try{const db=await getClient();const {error}=await db.from(table).update({is_published:!item.is_published}).eq('id',itemId);if(error)throw error;data=await getAdminContent();renderPanel();toast(item.is_published?'تم إخفاء العنصر':'تم نشر العنصر');}catch(e){toast('تعذر التعديل: '+e.message)}
  }
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
$('#adminApp').addEventListener('change',e=>{
 if(e.target.matches('[name="education_mode"]')) document.querySelectorAll('.v10-status-option').forEach(el=>el.classList.toggle('selected',el.querySelector('input').checked));
});
$('#adminApp').addEventListener('input',e=>{
 const projectForm=e.target.closest('form[data-entity="projects"]');
 if(projectForm){
  const title=$('#previewTitle'),cat=$('#previewCategory');
  if(title)title.textContent=projectForm.querySelector('[name="title_ar"]')?.value || 'اسم مشروعك الجديد';
  if(cat)cat.textContent=PORTFOLIO_CATEGORIES.find(c=>c.id===projectForm.querySelector('[name="category_id"]')?.value)?.ar || 'تصنيف المشروع';
 }
 if(e.target.matches('#inboxSearch,#inboxFilter')){
   const query=($('#inboxSearch')?.value||'').trim().toLowerCase();const status=$('#inboxFilter')?.value||'';
   document.querySelectorAll('.inbox-item').forEach(item=>item.hidden=!!(query&&!item.dataset.search.includes(query) || status&&item.dataset.status!==status));
 }
});
$('#adminApp').addEventListener('change',e=>{
 if(e.target.matches('#inboxFilter')){
  const q=($('#inboxSearch')?.value||'').trim().toLowerCase(), status=e.target.value;
  document.querySelectorAll('.inbox-item').forEach(item=>item.hidden=!!(q&&!item.dataset.search.includes(q) || status&&item.dataset.status!==status));
 }
});
$('#adminApp').addEventListener('submit',async e=>{
  e.preventDefault();
  const form=e.target;
  if(form.id==='mediaUploadForm'){
    if(!connected)return;
    const button=form.querySelector('button[type=submit]');const files=[...(form.querySelector('[name="uploads"]')?.files||[])];
    if(!files.length)return;button.disabled=true;
    try{for(const f of files)await uploadImage(f);toast(`${files.length} صورة اتضافت للمكتبة`);form.reset();await loadMedia();}
    catch(error){toast('تعذر الرفع: '+error.message);}
    finally{button.disabled=false;}
    return;
  }
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
