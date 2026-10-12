import { seed, readDemo, saveDemo, escapeHTML as esc, safeUrl, ar, en } from './data.js';
import { connected, getClient, adminAuthenticated, getAdminContent } from './api.js';

const $ = s => document.querySelector(s);
let data = connected ? null : readDemo();
let currentUser = null;
let tab = 'overview';
let editing = null; // {table,id}
let busy = false;

if(localStorage.getItem('portfolio_theme') === 'light') document.documentElement.classList.add('light');
const labels = {overview:'الرئيسية',content:'محرر الموقع',settings:'إعدادات الهوية',projects:'المشاريع',media:'مكتبة الصور',services:'الخدمات',testimonials:'آراء العملاء',messages:'طلبات العملاء',future:'التعلم والمستقبل'};
const SECTIONS=[['featured','المشاريع المميزة'],['signature','عرض الأعمال الرئيسي'],['work','معرض الأعمال'],['services','الخدمات'],['tools','البرامج والأدوات'],['why','أسلوبي في الشغل'],['about','نبذة عني'],['process','مراحل تنفيذ المشاريع'],['testimonials','آراء العملاء'],['faq','الأسئلة الشائعة'],['cta','دعوة بدء مشروع'],['learn','المعرفة الجاية أقرب'],['contact','التواصل وطلب مشروع']];
const CONTENT_GROUPS={
 'المشاريع والأعمال':[['feature_title','عنوان الأعمال المميزة'],['feature_sub','وصف الأعمال المميزة'],['selected','عنوان معرض الأعمال'],['selected_sub','وصف معرض الأعمال'],['signature_title','عنوان العرض السينمائي'],['signature_desc','وصف العرض السينمائي'],['signature_link','نص زر عرض المشروع']],
 'الخدمات وطريقتي':[['services_eyebrow','عنوان صغير للخدمات'],['services_title','العنوان الرئيسي للخدمات'],['services_sub','وصف الخدمات'],['why_title','عنوان طريقة الشغل'],['why_1','الخطوة الأولى'],['why_1d','شرح الخطوة الأولى'],['why_2','الخطوة الثانية'],['why_2d','شرح الخطوة الثانية'],['why_3','الخطوة الثالثة'],['why_3d','شرح الخطوة الثالثة'],['step1','مرحلة التنفيذ الأولى'],['step1d','شرح المرحلة الأولى'],['step2','مرحلة التنفيذ الثانية'],['step2d','شرح المرحلة الثانية'],['step3','مرحلة التنفيذ الثالثة'],['step3d','شرح المرحلة الثالثة']],
 'عني والعملاء':[['about_title','عنوان قسم عني'],['about_card_1','ميزة أولى'],['about_card_2','ميزة ثانية'],['about_card_3','ميزة ثالثة'],['reviews_title','عنوان آراء العملاء'],['reviews_sub','وصف آراء العملاء']],
 'التعليم والتواصل':[['learn_title','عنوان قسم التعليم'],['learn_desc','وصف التعليم المستقبلي'],['learn_tag','عبارة قريبًا'],['contact_title','عنوان التواصل'],['contact_desc','شرح التواصل'],['cta_title','عنوان الدعوة للمشروع'],['cta_sub','وصف الدعوة للمشروع'],['cta_button','نص زر التواصل']],
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
  $('#adminApp').innerHTML=`<div class="admin-layout"><aside class="admin-sidebar"><a href="./index.html" class="brand"><span class="brand-mark"><img src="./assets/images/mo-logo-white.webp" alt="" data-admin-brand-logo /></span> Mo Design<span class="brand-period">.</span></a><div class="admin-top-mobile"><strong>لوحة الإدارة</strong></div><nav class="sidebar-nav" id="adminNav">${Object.entries(labels).map(([key,label])=>`<button type="button" data-tab="${key}" class="${tab===key?'active':''}"><span>${({overview:'◉',content:'▤',settings:'✳',projects:'▣',media:'▧',services:'◇',testimonials:'❝',messages:'✉',future:'✦'})[key]}</span> ${label}</button>`).join('')}</nav><div class="sidebar-footer"><a href="./index.html" target="_blank" rel="noopener">معاينة الموقع ↗</a>${connected?'<button type="button" data-action="logout">تسجيل الخروج</button>':''}</div></aside><main class="admin-main" id="adminMain"></main></div>`;
}
function renderOverview(){
 const projects=data.projects||[], messages=data.messages||[];
 const counts=[['مشاريع منشورة',projects.filter(p=>p.is_published).length,'▣'],['مشاريع مسودة',projects.filter(p=>!p.is_published).length,'◷'],['رسائل جديدة',messages.filter(m=>m.status==='new').length,'✉'],['خدمات متاحة',(data.services||[]).filter(v=>v.is_published).length,'◇']];
 return `<div class="admin-panel"><div class="admin-welcome"><div><span class="admin-overline">MO DESIGN — STUDIO DESK</span><h2>أهلًا يا محمد 👋</h2><p class="admin-note">كل حاجة محتاجها علشان تدير موقعك وشغلك من مكان واحد.</p></div><a class="admin-btn" href="./index.html" target="_blank" rel="noopener">شوف الموقع ↗</a></div><div class="admin-stat-grid">${counts.map(([label,count,icon])=>`<article class="admin-stat"><span>${icon} ${label}</span><strong>${count}</strong></article>`).join('')}</div></div>
 <div class="admin-panel"><h2>إجراءات سريعة</h2><div class="admin-quick-actions">${uiButton('✎ تعديل النصوص','goto','content')}${uiButton('▣ مشروع جديد','newproject')}${uiButton('▧ مكتبة الصور','goto','media')}${uiButton('✉ رسائل العملاء','goto','messages')}${uiButton('✳ إعدادات الموقع','goto','settings')}</div></div>
 <div class="admin-panel"><h2>مهم قبل النشر</h2><p class="admin-note">المشاريع والتقييمات التجريبية مش شهادات شغل حقيقي. انشر بس البيانات المعتمدة، وارفع الأعمال اللي عندك حق نشرها. تعديل محتوى الأقسام الجديد يحتاج تشغيل ترحيل قاعدة البيانات V9 مرة واحدة.</p></div>`;
}
function renderContent(){
 const settings=data.settings||seed.settings, vis=settings.section_visibility||{};
 const controls=SECTIONS.map(([id,label])=>`<label class="cms-toggle"><input type="checkbox" name="section_${id}" ${vis[id]===false?'':'checked'}><span><strong>${esc(label)}</strong><small>${vis[id]===false?'مخفي':'يظهر على الموقع'}</small></span></label>`).join('');
 const sections=Object.entries(CONTENT_GROUPS).map(([label,fields],i)=>`<details class="cms-editor-group" ${i===0?'open':''}><summary>${esc(label)} <span>▾</span></summary><div class="admin-form-grid">${fields.map(([key,name])=>`${field('ar_'+key,`${name} — بالعربي المصري`,(settings.content_ar||{})[key]??ar[key]??'',{type:'textarea',full:true,rows:2})}${field('en_'+key,`${name} — النسخة الإنجليزية`,(settings.content_en||{})[key]??en[key]??'',{type:'textarea',full:true,rows:2})}`).join('')}</div></details>`).join('');
 return `<div class="admin-panel"><div class="admin-heading"><div><h2>إدارة كل أقسام الموقع</h2><p class="admin-note">فعّل أو اخفي أي قسم، وعدّل عناوينه ووصفه بالعربي والإنجليزي. مش هتحتاج ترجع لـ GitHub.</p></div><a class="admin-btn secondary" href="./index.html" target="_blank" rel="noopener">معاينة ↗</a></div><form data-entity="content" id="contentForm"><h3>الأقسام اللي تظهر للزائر</h3><div class="cms-toggle-grid">${controls}</div><h3 style="margin-block:35px 15px">تحرير النصوص</h3>${sections}<div class="admin-sticky-actions"><button type="submit" class="admin-btn">حفظ المحتوى والتغييرات ✓</button><small>المحتوى بيتحفظ مباشرة في Supabase بعد تطبيق ترحيل V9</small></div></form></div>`;
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
  ${field('category_ar','التصنيف بالعربي',item.category_ar,{required:true})}${field('category_en','التصنيف بالإنجليزي',item.category_en,{required:true})}
  ${field('project_type','نوع المشروع',item.project_type||'concept',{select:[['concept','تصوّر إبداعي / تجربة شخصية'],['personal','عمل شخصي'],['client','مشروع عميل مصرح بنشره']]})}
  ${field('summary_ar','شرح المشروع بالعربي',item.summary_ar,{type:'textarea',full:true})}${field('summary_en','وصف المشروع بالإنجليزي',item.summary_en,{type:'textarea',full:true})}
  ${field('cover_style','ستايل الصورة التوضيحية',item.cover_style || 'aurora',{select:[['aurora','تدرجات فنية'],['type','حروف وتايبوجرافي'],['orbit','أشكال دائرية'],['pop','ألوان جريئة']]})}
  ${field('image_url','صورة المشروع (HTTPS أو مسار من assets/images)',item.image_url,{type:'text',full:true})}
  ${field('video_url','رابط فيديو مباشر (MP4 / WebM)',item.video_url||'',{type:'url',full:true})}
  ${field('youtube_url','رابط فيديو يوتيوب أو يوتيوب شورتس',item.youtube_url||'',{type:'url',full:true})}
  ${field('gallery_urls','صور إضافية للمعرض — رابط HTTPS في كل سطر',item.gallery_urls||'',{type:'textarea',full:true,rows:4})}
  ${field('objective_ar','هدف المشروع بالعربي',item.objective_ar||'',{type:'textarea',full:true})}
  ${field('objective_en','الهدف بالإنجليزي',item.objective_en||'',{type:'textarea',full:true})}
  ${field('tools_used','الأدوات المستخدمة',item.tools_used||'',{type:'text',full:true})}
  <label class="form-field full">رفع صورة غلاف للمشروع إلى Supabase Storage (بعد التفعيل) <input type="file" name="media_file" accept="image/png,image/jpeg,image/webp,image/avif" ${connected?'':'disabled'} /> <small>صورة بحد أقصى 8 MB. ترفع بصورة آمنة فقط عند تفعيل التخزين وسياسات الصلاحيات.</small></label>
  <label class="form-field full">إضافة صور متعددة للمعرض (حتى 6 في المرة)<input type="file" name="gallery_files" multiple accept="image/png,image/jpeg,image/webp,image/avif" ${connected?'':'disabled'}/></label>
  ${field('external_url','رابط مشاهدة المشروع (HTTPS) - اختياري' ,item.external_url,{type:'url',full:true})}
  ${field('featured','مميز',item.featured,{type:'checkbox'})}`:
  `${field('description_ar','وصف الخدمة بالعربي',item.description_ar,{type:'textarea',full:true})}${field('description_en','Service description in English',item.description_en,{type:'textarea',full:true})}
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
async function loadMedia(){
 const grid=$('#mediaGallery');if(!grid||!connected)return;
 try{
  const db=await getClient();const [project,other]=await Promise.all(['projects','general'].map(folder=>db.storage.from('portfolio-media').list(folder,{limit:100,sortBy:{column:'created_at',order:'desc'}})));
  const errors=[project,other].filter(r=>r.error);if(errors.length)throw errors[0].error;
  mediaCache=[...project.data.map(x=>({folder:'projects',...x})),...other.data.map(x=>({folder:'general',...x}))].filter(x=>x.name&&!x.name.startsWith('.'));
  grid.innerHTML=mediaCache.map(x=>{const url=db.storage.from('portfolio-media').getPublicUrl(x.folder+'/'+x.name).data.publicUrl;return `<div class="media-card"><img src="${esc(url)}" alt="صورة من مكتبة الوسائط" loading="lazy"><small dir="ltr" title="${esc(x.name)}">${esc(x.name.slice(0,14))}...</small><button type="button" class="admin-btn secondary" data-copy-url="${esc(url)}">نسخ الرابط</button></div>`}).join('')||'<p class="admin-empty">المكتبة فاضية، ابدأ برفع صورة.</p>';
 }catch(e){grid.innerHTML=`<p class="admin-note">تعذّر تحميل الصور: ${esc(e.message)}</p>`;}
}

function renderFuture(){const vis=data.settings?.section_visibility||{};return `<div class="admin-panel"><h2>المعرفة الجاية أقرب</h2><p class="admin-note">تقدر تظهر أو تخفي القسم التعليمي في الصفحة الرئيسية. المقالات والكورسات المدفوعة لسه ميتمش تشغيلها.</p><form data-entity="future"><label class="cms-toggle cms-feature-toggle"><input type="checkbox" name="learn_enabled" ${vis.learn===false?'':'checked'}><span><strong>إظهار قسم «المعرفة الجاية أقرب»</strong><small>لما تلغي العلامة، القسم يختفي من الموقع من غير ما يتحذف.</small></span></label><button class="admin-btn" type="submit">حفظ حالة القسم</button></form><hr class="cms-divider"/><h3>تحرير المحتوى</h3><p class="admin-note">لتعديل عنوان القسم ووصفه بالعربي والإنجليزي، افتح محرر الموقع.</p>${uiButton('اذهب لمحرر الموقع','goto','content')}<h3 style="margin-top:30px">الخطوات اللي جاية</h3><div class="admin-rows"><div class="admin-row">مقالات وفيديوهات تعليمية فعلية</div><div class="admin-row">مكتبة برومبتات قابلة للبحث</div><div class="admin-row">دروس وكورسات مع نظام دفع آمن لما تحتاجه</div></div></div>`;}

function renderPanel(){
  if(!data)return;
  const main=$('#adminMain'); if(!main) return;
  const body=({overview:renderOverview,content:renderContent,settings:renderSettings,projects:()=>renderItems('projects'),media:renderMedia,services:()=>renderItems('services'),testimonials:()=>renderItems('testimonials'),messages:renderMessages,future:renderFuture})[tab]();
  main.innerHTML=`<header class="admin-heading"><div><div class="eyebrow">مركز إدارة المحتوى</div><h1>${esc(labels[tab])}</h1><p>أعمالك ومحتواك وطلبات العملاء في مكان واحد.</p></div><span class="admin-badge">${connected?`● متصل · ${esc(currentUser?.email||'')}`:'◌ وضع تجربة محلية'}</span></header>${!connected?`<div class="admin-banner"><strong>وضع المعاينة المحلي:</strong> التعديلات تُحفظ على هذا المتصفح فقط، ويمكن لأي شخص فتح لوحة المعاينة. ليست لوحة إنتاج آمنة ولا قاعدة بيانات عامة. لبدء الإدارة الحقيقية فعّل Supabase واتبع ملف التعليمات.</div>`:''}${body}`;
  document.querySelectorAll('[data-tab]').forEach(el=>el.classList.toggle('active',el.dataset.tab===tab));
  if(tab==='media')void loadMedia();
}
function getFields(form,table){
  const f=new FormData(form);
  const get=k=>String(f.get(k)||'').trim();
  if(table==='content'){
    const content_ar={...(data.settings?.content_ar||{})},content_en={...(data.settings?.content_en||{})};
    Object.values(CONTENT_GROUPS).flat().forEach(([key])=>{content_ar[key]=get('ar_'+key);content_en[key]=get('en_'+key);});
    const section_visibility={...(data.settings?.section_visibility||{})};SECTIONS.forEach(([id])=>section_visibility[id]=f.has('section_'+id));
    return {content_ar,content_en,section_visibility};
  }
  if(table==='future')return {section_visibility:{...(data.settings?.section_visibility||{}),learn:f.has('learn_enabled')}};
  if(table==='settings'){
    return {brand_ar:get('brand_ar'),brand_en:get('brand_en'),personal_name:get('personal_name'),role_ar:get('role_ar'),role_en:get('role_en'),headline_ar:get('headline_ar'),headline_en:get('headline_en'),subheadline_ar:get('subheadline_ar'),subheadline_en:get('subheadline_en'),bio_ar:get('bio_ar'),bio_en:get('bio_en'),profile_image_url:get('profile_image_url'),contact_email:get('contact_email'),instagram_url:get('instagram_url'),behance_url:get('behance_url'),linkedin_url:get('linkedin_url'),whatsapp_url:get('whatsapp_url'),tiktok_url:get('tiktok_url'),facebook_url:get('facebook_url'),community_url:get('community_url'),availability:f.has('availability'),stats_projects:Math.max(0,Number(get('stats_projects'))||0),stats_years:Math.max(0,Number(get('stats_years'))||0),stats_satisfaction:Math.max(0,Math.min(100,Number(get('stats_satisfaction'))||0)),stats_verified:f.has('stats_verified')};
  }
  const common={sort_order:Number(get('sort_order'))||0,is_published:f.has('is_published')};
  if(table==='testimonials')return {...common,author_ar:get('author_ar'),author_en:get('author_en'),job_ar:get('job_ar'),job_en:get('job_en'),quote_ar:get('quote_ar'),quote_en:get('quote_en'),rating:Math.max(0,Math.min(5,Number(get('rating'))||0)),is_verified:f.has('is_verified')};
  if(table==='projects')return {...common,title_ar:get('title_ar'),title_en:get('title_en'),category_ar:get('category_ar'),category_en:get('category_en'),summary_ar:get('summary_ar'),summary_en:get('summary_en'),cover_style:get('cover_style'),image_url:get('image_url'),external_url:get('external_url'),featured:f.has('featured'),video_url:get('video_url'),gallery_urls:get('gallery_urls'),objective_ar:get('objective_ar'),objective_en:get('objective_en'),tools_used:get('tools_used'),youtube_url:get('youtube_url'),project_type:get('project_type'),slug:get('slug') || `project-${Date.now()}`};
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
    if(entry.youtube_url && !/^https:\/\/(www\.)?(youtube\.com|youtu\.be|m\.youtube\.com)\//i.test(entry.youtube_url)){toast('حط رابط يوتيوب أو شورتس صحيح.');return;}
    if(entry.video_url && !/^https:\/\//i.test(entry.video_url)){toast('الفيديو يجب أن يكون برابط HTTPS');return;}
    if(entry.gallery_urls && !entry.gallery_urls.split(/\r?\n/).filter(Boolean).every(x=>/^https:\/\//i.test(x))){toast('كل صورة إضافية لازم تكون رابط HTTPS في سطر مستقل.');return;}
  }
  busy=true;
  try {
    if(connected && table==='settings'){
      const file=form.querySelector('input[name="profile_file"]')?.files?.[0];
      if(file)entry.profile_image_url=await uploadImage(file,'general');
    }
    if(connected && table==='projects'){
      const file=form.querySelector('input[name="media_file"]')?.files?.[0];
      if(file)entry.image_url=await uploadImage(file,'projects');
      const images=[...(form.querySelector('input[name="gallery_files"]')?.files||[])];
      if(images.length>6)throw new Error('ارفع 6 صور إضافية بحد أقصى في كل مرة.');
      if(images.length){
        const urls=(entry.gallery_urls||'').split(/\r?\n/).map(v=>v.trim()).filter(Boolean);
        for(const photo of images)urls.push(await uploadImage(photo,'projects'));
        entry.gallery_urls=urls.join('\n');
      }
    }
    if(connected){
      const db=await getClient(); let result;
      if(['settings','content','future'].includes(table))result=await db.from('site_settings').update(entry).eq('id',1);
      else {
        const payload={...entry};
        if(id)payload.id=id;
        else if(table==='projects')payload.slug=entry.slug || `project-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
        result=await db.from(table).upsert(payload);
      }
      if(result.error)throw result.error;
      data=await getAdminContent();
    } else {
      if(['settings','content','future'].includes(table))data.settings={...data.settings,...entry};
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
  const copyBtn=e.target.closest('[data-copy-url]');if(copyBtn){try{await navigator.clipboard.writeText(copyBtn.dataset.copyUrl);toast('تم نسخ الرابط ✓');}catch{toast('تعذر نسخ الرابط');}return;}
  const btn=e.target.closest('button[data-action]');if(!btn)return;
  const {action,id}=btn.dataset;
  if(action==='goto'){tab=id;editing=null;renderPanel();window.scrollTo({top:0});return;}
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
$('#adminApp').addEventListener('input',e=>{
 const projectForm=e.target.closest('form[data-entity="projects"]');
 if(projectForm){
  const title=$('#previewTitle'),cat=$('#previewCategory');
  if(title)title.textContent=projectForm.querySelector('[name="title_ar"]')?.value || 'اسم مشروعك الجديد';
  if(cat)cat.textContent=projectForm.querySelector('[name="category_ar"]')?.value || 'تصنيف المشروع';
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
