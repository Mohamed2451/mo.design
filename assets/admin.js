import { seed, readDemo, saveDemo, escapeHTML as esc, safeUrl, ar, en } from './data.js';
import {STUDIO_KEY,readStudio,safeStudioUrl} from './studio-config.js';
import {renderCommunityAdmin,communityAdminClick,communityAdminSubmit} from './mo-community-admin.js';
import {isStudioPreviewHost,isPreviewMediaRef,storeStudioPreviewMedia} from './studio-preview-media.js';
import { connected, getClient, adminAuthenticated, getAdminContent } from './api.js';
import {PORTFOLIO_CATEGORIES, categoryFor, formatTools} from './categories.js';
import {getToolsCatalog,TOOLS_CATALOG_KEY} from './tools-catalog.js';
import {SERVICE_PAGES,SERVICE_PAGE_KEY,serviceConfig,projectServiceGroups} from './service-config.js';
import {LEGAL_KEY,legalPages} from './legal-config.js';
import {getAcademyCategories,getAcademyMembership,ACADEMY_CATEGORIES_KEY,ACADEMY_MEMBERSHIP_KEY,ACADEMY_TEXT_KEYS,academyText} from './academy-config.js';

const $ = s => document.querySelector(s);
// ?demo=1 forces a local-only sandbox; never access live Supabase from this mode.
// Cloudflare staging must never update the production Supabase database.
const cmsConnected=connected && new URLSearchParams(location.search).get('demo')!=='1' && !location.hostname.endsWith('.pages.dev');
let data = cmsConnected ? null : readDemo();
let currentUser = null;
const openingTeamCopyFromLink = new URLSearchParams(location.search).get('editor') === 'team';
let tab = openingTeamCopyFromLink ? 'content' : 'overview';
let editing = null; // {table,id}
let busy = false;
let cmsDirty = false;
function markCmsDirty(){
  if(cmsDirty)return;
  cmsDirty=true;
  const state=document.querySelector('#cmsSaveStatus');
  if(state)state.textContent='عندك تغييرات غير محفوظة';
}
window.addEventListener('beforeunload',event=>{
  if(!cmsDirty)return;
  event.preventDefault();
  event.returnValue='';
});

// Dashboard always uses its own neutral dark palette; the public site's theme remains unchanged.
const labels = {notice:'إشعارات الموقع',overview:'الرئيسية',content:'محرر الموقع',settings:'إعدادات الهوية',projects:'المشاريع',appearance:'مظهر الأقسام',media:'مكتبة الصور',services:'الخدمات',testimonials:'آراء العملاء',messages:'طلبات العملاء',future:'الأكاديمية والمحتوى',team:'فريق العمل',communityReviews:'مراجعة التقييمات',communityBrands:'الشركات والبراندات',tools:'إدارة الأدوات',legal:'الصفحات والروابط'};
const FONT_CHOICES=[['Alexandria','Alexandria — حديث'],['Cairo','Cairo — واضح'],['Readex Pro','Readex Pro — هادي'],['IBM Plex Sans Arabic','IBM Plex Sans Arabic — احترافي']];
const EXTRA_CONTENT_KEYS=[...ACADEMY_TEXT_KEYS.map(x=>x[0]),'team_eyebrow','team_title','team_description','hero_intro','hero_merged_role','hero_merged_description','hero_point_1','hero_point_2','hero_point_3','about_story_label','about_story_value','about_kicker','about_ribbon','portrait_tag','portrait_pill','hero_side','footer_line','learn_eyebrow','learn_big1','learn_big2','cta_kicker','tool_kicker','tools_eyebrow','ticker_items','project_about_title','project_objective_title','selected_real_sub','reviews_real_sub','featured_real_sub','portrait_copyright','hero_year','footer_copyright'];
const ALL_COPY_KEYS=()=>[...new Set([...Object.keys(ar),...Object.keys(en),...EXTRA_CONTENT_KEYS])].filter(k=>EXTRA_CONTENT_KEYS.includes(k)||typeof ar[k]==='string'||typeof en[k]==='string');
const CUSTOM_LABELS={...Object.fromEntries(ACADEMY_TEXT_KEYS.map(x=>[x[0],x[1]])),team_eyebrow:'شريط عنوان قسم الفريق',team_title:'عنوان فريق العمل',team_description:'وصف فريق العمل',hero_intro:'تعريف بداية الموقع — أنا محمد محمود وكل فكرة ليها حكاية',hero_merged_role:'المسمى والخدمات في بداية الموقع',hero_merged_description:'النبذة التعريفية المدمجة في بداية الموقع',hero_point_1:'الميزة الأولى في البداية',hero_point_2:'الميزة الثانية في البداية',hero_point_3:'الميزة الثالثة في البداية',about_story_label:'عبارة بطاقة من وراء الشغل',about_story_value:'عنوان بطاقة من وراء الشغل',about_kicker:'عنوان بطاقة وراء الكواليس',about_ribbon:'شريط بطاقة التعريف',portrait_tag:'وسم صورة بداية الموقع',portrait_pill:'عبارة صورة البداية',hero_side:'استوديو مو ديزاين — 2026 | العبارة الجانبية',footer_line:'النص أسفل الموقع',learn_eyebrow:'عنوان المعرفة للجميع المصغر',learn_big1:'كلمة اتعلم',learn_big2:'كلمة ابتكر',cta_kicker:'عبارة شغلك يستحق يبان',tools_eyebrow:'عنوان الأدوات',portrait_copyright:'حقوق التصميم على صورة البداية',hero_year:'السنة في عبارة استوديو مو ديزاين',footer_copyright:'حقوق النشر في الفوتر'};
const copyGroup=()=>ALL_COPY_KEYS().filter(k=>!Object.values(CONTENT_GROUPS).flat().some(([key])=>key===k)).map(k=>[k,CUSTOM_LABELS[k]||((typeof ar[k]==='string'&&ar[k].trim()?ar[k].trim().slice(0,70):k)+' ['+k+']')]);
function richField(name,label,value='',rows=6){return `<div class="cms-rich-wrap full">${field(name,label,value,{type:'textarea',full:true,rows})}<div class="cms-rich-toolbar"><button type="button" data-rich="bold" title="غامق">B</button><button type="button" data-rich="italic" title="مائل"><i>I</i></button><button type="button" data-rich="heading" title="عنوان فرعي">H2</button><button type="button" data-rich="list" title="قائمة">☷</button></div><small class="cms-rich-note">حدد نص واضغط غامق أو مائل. استخدم H2 للعناوين، وكل سطر منفصل هيظهر كما كتبته.</small></div>`;}
function normalizeMediaCaptions(value){return value&&typeof value==='object'&&!Array.isArray(value)?value:{};}
function mediaCaptionsEditor(kind,captions,urls){
 const data=normalizeMediaCaptions(captions);const list=String(urls||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
 const fields=list.map((url,i)=>`<div class="cms-caption-entry"><small>الصورة الموجودة ${i+1}</small><textarea name="${kind}_existing_caption_${i}" rows="3" placeholder="شرح اختياري تحت هذه الصورة بالعربي">${esc(data[url]?.ar||'')}</textarea><textarea name="${kind}_existing_caption_en_${i}" rows="2" placeholder="English caption (optional)">${esc(data[url]?.en||'')}</textarea><input type="hidden" name="${kind}_existing_url_${i}" value="${esc(url)}"></div>`).join('');
 return `<div class="full cms-caption-editor"><h3>شرح مستقل لكل صورة — اختياري</h3><p class="admin-note">يمكن كتابة نص طويل جدًا تحت كل صورة. الصور الموجودة بالأسفل لها شرح مستقل؛ وعند اختيار صور جديدة اكتب شروحها بنفس ترتيب اختيار الملفات، سطر لكل صورة (اترك السطر فارغًا إذا لا تحتاج شرحًا).</p>${fields}<div class="full" data-new-captions="${kind}"><small>اختر الصور من خانة الرفع أولًا، وستظهر هنا خانة شرح مستقلة لكل صورة، ويمكن كتابة شرح طويل متعدد الفقرات.</small></div></div>`;
}
function readMediaCaptions(form,kind){
 const map={...normalizeMediaCaptions(kind==='gallery'?(data.projects||[]).find(p=>p.id===form.dataset.editId)?.gallery_captions:(data.learning_items||[]).find(p=>p.id===form.dataset.editId)?.image_captions)};
 for(const input of form.querySelectorAll(`[name^="${kind}_existing_url_"]`)){
  const i=input.name.split('_').pop(),url=input.value;
  const ar=form.querySelector(`[name="${kind}_existing_caption_${i}"]`)?.value||'';
  const en=form.querySelector(`[name="${kind}_existing_caption_en_${i}"]`)?.value||'';
  if(ar.trim()||en.trim())map[url]={ar,en};else delete map[url];
 }
 return map;
}
function linkNewCaptions(entry,kind,files,urls,field){
 const form=document.querySelector(`form[data-entity="${kind==='gallery'?'projects':'learning_items'}"]`);
 files.forEach((file,i)=>{
  const ar=form?.querySelector(`[name="${kind}_new_caption_ar_${i}"]`)?.value||'';
  const en=form?.querySelector(`[name="${kind}_new_caption_en_${i}"]`)?.value||'';
  if(ar.trim()||en.trim())entry[field][urls[i]]={ar,en};
 });
}
function refreshNewCaptionInputs(input){
 const kind=input.name==='gallery_files'?'gallery':'lesson';
 const host=input.closest('form')?.querySelector(`[data-new-captions="${kind}"]`);
 if(!host)return;
 host.innerHTML=[...(input.files||[])].map((file,i)=>`<div class="cms-caption-entry"><strong>الصورة الجديدة ${i+1}: ${esc(file.name)}</strong><label>الشرح بالعربي<textarea name="${kind}_new_caption_ar_${i}" rows="5" placeholder="اكتب شرحًا اختياريًا مهما كان طوله"></textarea></label><label>English caption<textarea name="${kind}_new_caption_en_${i}" rows="3"></textarea></label></div>`).join('')||'<small>اختَر صورًا من جهازك لكتابة شرح مستقل لكل صورة.</small>';
}

const SECTIONS=[['featured','المشاريع المميزة'],['signature','عرض الأعمال الرئيسي'],['work','معرض الأعمال'],['services','الخدمات'],['tools','البرامج والأدوات'],['why','أسلوبي في الشغل'],['about','نبذة عني'],['process','مراحل تنفيذ المشاريع'],['testimonials','آراء العملاء'],['faq','الأسئلة الشائعة'],['cta','دعوة بدء مشروع'],['learn','المعرفة الجاية أقرب'],['contact','التواصل وطلب مشروع']];
const CONTENT_GROUPS={
 'المشاريع والأعمال':[['feature_title','عنوان الأعمال المميزة'],['feature_sub','وصف الأعمال المميزة'],['selected','عنوان معرض الأعمال'],['selected_sub','وصف معرض الأعمال'],['signature_title','عنوان العرض السينمائي'],['signature_desc','وصف العرض السينمائي'],['signature_link','نص زر عرض المشروع']],
 'الخدمات وطريقتي':[['services_eyebrow','عنوان صغير للخدمات'],['services_title','العنوان الرئيسي للخدمات'],['services_sub','وصف الخدمات'],['why_title','عنوان طريقة الشغل'],['why_1','الخطوة الأولى'],['why_1d','شرح الخطوة الأولى'],['why_2','الخطوة الثانية'],['why_2d','شرح الخطوة الثانية'],['why_3','الخطوة الثالثة'],['why_3d','شرح الخطوة الثالثة'],['step1','مرحلة التنفيذ الأولى'],['step1d','شرح المرحلة الأولى'],['step2','مرحلة التنفيذ الثانية'],['step2d','شرح المرحلة الثانية'],['step3','مرحلة التنفيذ الثالثة'],['step3d','شرح المرحلة الثالثة']],
 'عني والعملاء':[['about_title','عنوان قسم عني'],['about_card_1','ميزة أولى'],['about_card_2','ميزة ثانية'],['about_card_3','ميزة ثالثة'],['reviews_title','عنوان قسم التفاصيل اللي بتفرق / آراء العملاء'],['reviews_sub','وصف قسم آراء العملاء']],
 'نصوص فريق العمل':[['team_eyebrow','العنوان التعريفي للفريق'],['team_title','عنوان قسم الفريق'],['team_description','الوصف أسفل عنوان الفريق']],
 'التعليم والتواصل':[['learn_title','عنوان قسم التعليم'],['learn_desc','وصف التعليم المستقبلي'],['learn_tag','عبارة قريبًا'],['learn_live_title','عنوان بعد بدء النشر'],['learn_live_desc','الوصف بعد بدء النشر'],['learn_live_tag','شارة المحتوى المنشور'],['contact_title','عنوان التواصل'],['contact_desc','شرح التواصل'],['cta_title','عنوان الدعوة للمشروع'],['cta_sub','وصف الدعوة للمشروع'],['cta_button','نص زر التواصل']],
 'الأسئلة الشائعة':[['faq_title','عنوان الأسئلة الشائعة'],['faq_desc','مقدمة الأسئلة'],['faq_q1','السؤال الأول'],['faq_a1','إجابة السؤال الأول'],['faq_q2','السؤال الثاني'],['faq_a2','إجابة السؤال الثاني'],['faq_q3','السؤال الثالث'],['faq_a3','إجابة السؤال الثالث'],['faq_q4','السؤال الرابع'],['faq_a4','إجابة السؤال الرابع']]
};
let mediaCache=[];
function formStatus(form,message,error=false){
 const node=form?.querySelector('[data-save-status]');
 if(!node)return;
 node.hidden=false;node.textContent=message;node.style.color=error?'#ffb3a9':'#c9ff90';
 node.style.borderColor=error?'#bc4b48':'#79b943';
 node.setAttribute('role',error?'alert':'status');
}
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
  {title:'إدارة المحتوى',items:['content','appearance','projects','media','services','tools','legal','testimonials','communityReviews','communityBrands','future','notice']},
  {title:'الهوية والإعدادات',items:['settings']},
  {title:'فريق العمل',items:['team']}
 ];
 const icons={overview:'◫',messages:'✉',content:'▤',appearance:'◈',projects:'▦',media:'▧',tools:'◈',services:'◇',testimonials:'❞',communityReviews:'★',communityBrands:'▤',future:'▷',team:'♧',notice:'♧',legal:'▣',settings:'⚙'};
 $('#adminApp').innerHTML=`<div class="admin-layout v10-shell"><aside class="admin-sidebar">
 <div class="studio-sidebar-top"><a href="./index.html" class="brand v10-brand"><span class="brand-mark"><img src="./assets/images/mo-logo-white.webp" alt="" data-admin-brand-logo /></span><span><strong>Mo Design</strong><small>مساحة الإدارة الإبداعية</small></span></a><div class="v10-workspace-badge"><span class="v10-online-dot"></span> مساحة الإدارة الخاصة</div></div>
 <nav class="sidebar-nav" id="adminNav" aria-label="أقسام لوحة الإدارة">${groups.map(group=>`<div class="v10-nav-group"><div class="v10-nav-label">${group.title}</div>${group.items.map(key=>`<button type="button" data-tab="${key}" class="${tab===key?'active':''}"><span class="v10-nav-icon" aria-hidden="true">${icons[key]}</span><span>${labels[key]}</span><span class="v10-nav-chevron" aria-hidden="true">‹</span></button>`).join('')}</div>`).join('')}</nav>
 <div class="sidebar-footer"><div class="v10-admin-account"><span class="v10-avatar">م</span><div><strong>محمد محمود</strong><small>مدير الموقع</small></div></div><a href="./index.html" target="_blank" rel="noopener">↗ معاينة الموقع</a>${cmsConnected?'<button type="button" data-action="logout">تسجيل الخروج</button>':''}</div></aside>
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
 const recent=messages.filter(m=>m.status!=='archived').slice(0,4);
 return `<section class="v10-overview-hero"><div><span class="v10-eyebrow">لوحة إدارة أعمالك</span><h2>شغلك كله،<br><em>تحت السيطرة.</em></h2><p>أهلًا يا محمد! من هنا تدير الموقع، وتنشر أعمالك، وتتابع العملاء، وتجهّز المحتوى التعليمي.</p><div class="v10-hero-actions">${uiButton('◈ افتح محرر الموقع','goto','content','primary')}${uiButton('▷ انشر محتوى تعليمي','goto','future')}</div></div><div class="v10-overview-art" aria-hidden="true"><span>MO</span><span>DESIGN</span><i>◈</i></div></section>
 <div class="v10-metric-grid">${metrics.map(([label,val,icon,desc])=>`<div class="v10-metric-card"><div class="v10-metric-heading"><span>${esc(label)}</span><b>${icon}</b></div><strong>${val}</strong><small>${esc(desc)}</small></div>`).join('')}</div>
 <div class="v10-overview-columns"><section class="admin-panel v10-overview-section"><div class="admin-heading"><h2>إجراءات سريعة</h2><span class="v10-note-pill">ابدأ من هنا</span></div><div class="v10-action-list">${[['تعديل الصفحة الرئيسية','غير النصوص والعناوين وحالة الأقسام','content','▤'],['إضافة مشروع جديد','الصور والفيديوهات وأعمالك الحقيقية','projects','▧'],['مكتبة الصور','كل صورك في مكان واحد','media','▦'],['الأكاديمية والمحتوى','الحالة الحالية: '+(educationNames[mode]||'قريبًا'),'future','▷']].map(([title,desc,id,icon])=>`<button type="button" class="v10-action-row" data-action="goto" data-id="${id}"><span class="v10-action-icon">${icon}</span><span><strong>${title}</strong><small>${desc}</small></span><span class="v10-action-arrow">↗</span></button>`).join('')}</div></section>
 <section class="admin-panel v10-overview-section"><div class="admin-heading"><h2>آخر طلبات العملاء</h2>${uiButton('عرض الكل','goto','messages')}</div>${recent.length?recent.map(m=>`<div class="v10-recent-lead"><span class="v10-lead-avatar">${esc(m.sender_name?.slice(0,1)||'؟')}</span><div><strong>${esc(m.sender_name||'عميل')}</strong><small>${esc(m.service_type||'طلب مشروع')}</small></div><span class="v10-lead-state">${m.status==='new'?'جديد':'قيد المتابعة'}</span><div class="inbox-management-actions">${uiButton('أرشفة','archiveInquiry',m.id)}${uiButton('حذف','deleteInquiry',m.id)}</div></div>`).join(''):'<div class="v10-empty-leads">مفيش طلبات جديدة دلوقتي. لما حد يراسلّك من الموقع، هتلاقي طلبه هنا.</div>'}</section></div>`;
}

function renderContent(){
 const settings=data.settings||seed.settings, vis=settings.section_visibility||{};
 const controls=SECTIONS.map(([id,label])=>`<label class="cms-toggle"><input type="checkbox" name="section_${id}" ${vis[id]===false?'':'checked'}><span><strong>${esc(label)}</strong><small>${vis[id]===false?'مخفي':'يظهر على الموقع'}</small></span></label>`).join('');
 const groups={'التعريف المدمج في بداية الموقع':[['hero_intro','سطر أنا محمد محمود وكل فكرة ليها حكاية'],['hero_merged_role','المسمى المهني والخدمات'],['hero_merged_description','النبذة التعريفية المدمجة'],['hero_point_1','فهم حقيقي للبراند'],['hero_point_2','تنفيذ منظم ومرن'],['hero_point_3','إبداع بشري بمساعدة الذكاء الاصطناعي']],'حقوق النشر والسنة — تعديل مباشر':[['portrait_copyright','© MO DESIGN / 2026 — حقوق الصورة الشخصية'],['hero_side','استوديو مو ديزاين — 2026 | النص الجانبي'],['hero_year','2026 — السنة بجوار الاستوديو'],['footer_copyright','حقوق النشر أسفل الموقع']],...CONTENT_GROUPS,'كل العبارات والأزرار الإضافية':copyGroup().filter(([key])=>!['portrait_copyright','hero_side','hero_year','footer_copyright','hero_intro','hero_merged_role','hero_merged_description','hero_point_1','hero_point_2','hero_point_3'].includes(key))};
 const sections=Object.entries(groups).map(([label,fields],i)=>`<details class="cms-editor-group" ${label==='نصوص فريق العمل'?'id="teamCopyGroup" data-team-copy-group':''} ${i===0?'open':''}><summary>${esc(label)} <span>▾</span></summary><div class="admin-form-grid">${fields.map(([key,name])=>`${field('ar_'+key,`${name} — بالعربي المصري`,(settings.content_ar||{})[key]??(key==='team_eyebrow'?'MO DESIGN / PEOPLE':key==='team_title'?'فريقنا وراء كل تفصيلة.':key==='team_description'?'تعرف على الناس اللي بتشتغل على الأفكار والتصاميم.':ar[key]??''),{type:'textarea',full:true,rows:2})}${field('en_'+key,`${name} — النسخة الإنجليزية`,(settings.content_en||{})[key]??(key==='team_eyebrow'?'MO DESIGN / PEOPLE':key==='team_title'?'People behind the work.':key==='team_description'?'Meet the people creating the work.':en[key]??''),{type:'textarea',full:true,rows:2})}`).join('')}</div></details>`).join('');
 return `<div class="admin-panel"><div class="admin-heading"><div><h2>إدارة كل أقسام الموقع</h2><p class="admin-note">فعّل أو اخفي أي قسم، وعدّل عناوينه ووصفه بالعربي والإنجليزي. مش هتحتاج ترجع لـ GitHub.</p></div><a class="admin-btn secondary" href="./index.html" target="_blank" rel="noopener">معاينة ↗</a></div><form data-entity="content" id="contentForm"><div class="v10-home-copy"><h3>◈ كلام الصفحة الرئيسية</h3><p class="admin-note">ده أول كلام العميل بيشوفه في الموقع. عدّله من هنا واحفظ مع باقي الأقسام.</p><div class="admin-form-grid">${field('headline_ar','العنوان الرئيسي — عربي',settings.headline_ar,{type:'textarea',required:true,rows:2})}${field('headline_en','العنوان الرئيسي — إنجليزي',settings.headline_en,{type:'textarea',required:true,rows:2})}${field('subheadline_ar','نبذة البداية — عربي',settings.subheadline_ar,{type:'textarea',rows:3})}${field('subheadline_en','نبذة البداية — إنجليزي',settings.subheadline_en,{type:'textarea',rows:3})}</div></div><h3>الأقسام اللي تظهر للزائر</h3><div class="cms-toggle-grid">${controls}</div><h3 style="margin-block:35px 15px">تحرير النصوص</h3><style id="v13-cms-search-style">.cms-search-controls{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:15px}.cms-search-controls small{margin-inline-end:auto}.cms-search-controls .admin-btn{font-size:12px;padding:8px 10px}.cms-editor-group[hidden],.cms-editor-group .form-field[hidden]{display:none!important}</style><div class="cms-search-tools"><label class="form-field full" style="margin-block:12px 8px">ابحث عن اسم الحقل أو النص الموجود بالعربي أو الإنجليزي<input id="cmsCopySearch" type="search" placeholder="مثلاً: آراء العملاء، الزر، أو كلمات من النص نفسه" autocomplete="off"></label><div class="cms-search-controls"><button class="admin-btn secondary" type="button" data-open-team-copy>فتح نصوص فريق العمل ↘</button><small id="cmsSearchResults" role="status" aria-live="polite">تقدر تبحث في أسماء الحقول ومحتواها.</small><button class="admin-btn secondary" type="button" data-cms-groups="open">فتح كل المجموعات</button><button class="admin-btn secondary" type="button" data-cms-groups="close">طي كل المجموعات</button></div></div>${sections}<div class="admin-sticky-actions"><button type="submit" class="admin-btn">حفظ المحتوى والتغييرات ✓</button><small id="cmsSaveStatus" role="status">المحتوى بيتحفظ على Supabase ويظهر على الموقع من غير GitHub</small></div></form></div>`;
}

function toolEditorRow(tool={}){
 const img=safeUrl(tool.image_url);
 return `<div class="admin-tool-row" data-admin-tool-row style="border:1px solid #ffffff24;border-radius:14px;padding:16px;margin:12px 0">
 <div class="admin-form-grid">
 ${field('tool_name','اسم الأداة',tool.name||'',{required:true,full:true})}
 ${field('tool_ar','وصف عربي',tool.ar||'')}
 ${field('tool_en','English description',tool.en||'')}
 ${field('tool_image','رابط صورة الأداة (يمكن تركه واستخدام الرفع)',tool.image_url||'',{full:true})}
 <label class="form-field full">ارفع صورة للأداة (PNG / JPG / WebP / AVIF)<input type="file" name="tool_upload" accept="image/png,image/jpeg,image/webp,image/avif"><small>الصورة اختيارية، وبحد أقصى 8 ميجابايت.</small></label>
 <label class="form-field checkbox"><input name="tool_enabled" type="checkbox" ${tool.enabled!==false?'checked':''}>إظهار الأداة على الموقع</label>
 </div><div style="display:flex;gap:10px;align-items:center;justify-content:space-between;margin-top:10px"><span class="admin-note">${img?'صورة موجودة ✓':'من غير صورة حاليًا'}</span><span><button class="admin-btn secondary" type="button" data-move-catalog-tool="up" aria-label="تحريك الأداة للأعلى">↑</button> <button class="admin-btn secondary" type="button" data-move-catalog-tool="down" aria-label="تحريك الأداة للأسفل">↓</button> <button class="admin-btn secondary" type="button" data-remove-catalog-tool>حذف الأداة</button></span></div></div>`;
}
function renderToolManager(){
 const tools=getToolsCatalog(data.settings);
 return `<section class="admin-panel"><div class="admin-heading"><h2>أدواتي / الأدوات والمنصات</h2><p class="admin-note">أضف أو احذف أو أخفِ أي أداة، وغيّر اسمها ووصفها وصورتها. ترتيب البطاقات هنا هو ترتيبها في الموقع.</p></div>
 <form data-entity="tools" id="toolManagerForm">
 <div id="toolManagerRows">${tools.map(toolEditorRow).join('')}</div>
 <div class="admin-actions"><button class="admin-btn secondary" type="button" data-add-catalog-tool>+ إضافة أداة</button><button class="admin-btn" type="submit">حفظ الأدوات ✓</button></div>
 </form></section>`;
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
  <label class="form-field full">ارفع صورة شخصية جديدة مباشرة (8 ميجابايت كحد أقصى)<input type="file" name="profile_file" accept="image/png,image/jpeg,image/webp,image/avif" ${cmsConnected?'':'disabled'}></label>
  <div class="cms-brand-settings full"><h3>صورتك والشعار</h3><p class="admin-note">الشعار الأبيض للدارك مود، والأسود للايت مود. رفع الملفات بيحدّث الموقع بعد الحفظ من غير GitHub.</p><div class="cms-brand-preview"><img src="${esc(safeUrl(s.profile_image_url)||'./assets/images/mohamed-mahmoud.webp')}" alt="معاينة صورتك"><img src="${esc(safeUrl(s.logo_dark_url)||'./assets/images/mo-logo-white.webp')}" alt="شعار الوضع الداكن"></div></div>
  ${field('logo_dark_url','رابط الشعار الأبيض للدارك مود (اختياري)',s.logo_dark_url||'',{full:true})}
  <label class="form-field full">أو ارفع الشعار الأبيض من جهازك<input type="file" name="logo_dark_file" accept="image/png,image/jpeg,image/webp,image/avif" ${cmsConnected?'':'disabled'}></label>
  ${field('logo_light_url','رابط الشعار الأسود للايت مود (اختياري)',s.logo_light_url||'',{full:true})}
  <label class="form-field full">أو ارفع الشعار الأسود من جهازك<input type="file" name="logo_light_file" accept="image/png,image/jpeg,image/webp,image/avif" ${cmsConnected?'':'disabled'}></label>
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
function serviceCategoryRow(c={}){
 return `<div class="admin-row" data-simple-category data-category-id="${esc(c.id||'')}" style="margin:7px 0;gap:10px;flex-wrap:wrap">
 <input aria-label="اسم التصنيف بالعربي" name="cat_ar" placeholder="اسم التصنيف (مثال: رمضان)" value="${esc(c.ar||'')}" style="flex:1;min-width:160px">
 <input aria-label="اسم التصنيف بالإنجليزي (اختياري)" name="cat_en" placeholder="الإنجليزي (اختياري)" value="${esc(c.en||'')}" style="flex:1;min-width:130px">
 <label style="display:flex;align-items:center;gap:5px;white-space:nowrap"><input type="checkbox" name="cat_enabled" ${c.enabled!==false?'checked':''}> إظهار</label>
 <button type="button" class="admin-btn secondary" data-remove-simple-category>حذف</button></div>`;
}
function servicePageEditor(){
 const cfg=serviceConfig(data.settings);
 const pages=SERVICE_PAGES.filter(page=>page.slug!=='prompt-engineering');
 return `<section class="admin-panel"><h2>إدارة التصنيفات</h2><p class="admin-note">اختار الخدمة، أضف تصنيفاتها أو أخفِها وقت ما تحب. لو مش محتاج تصنيفات سيبها فاضية. ربط المشاريع يتم من صفحة المشاريع.</p>
 <form data-entity="service_pages"><div class="admin-form-grid">${pages.map(page=>{
 const d=cfg[page.slug];return `<fieldset class="full" data-service-config="${esc(page.slug)}" style="border:1px solid #ffffff33;padding:14px;border-radius:14px;margin-bottom:10px"><legend>${esc(page.ar)}</legend>
 <div data-simple-category-list>${d.categories.map(serviceCategoryRow).join('')}</div>
 <button class="admin-btn secondary" type="button" data-add-simple-category>+ إضافة تصنيف</button>
 <details style="margin-top:12px"><summary>أبعاد صور المشاريع</summary>${field('sp_ratio','طريقة عرض الصور',d.ratio,{select:[['landscape','أفقي'],['square','مربع'],['portrait','طولي'],['original','النسبة الأصلية']]})}</details>
 </fieldset>`;
 }).join('')}</div><button class="admin-btn" type="submit">حفظ التصنيفات وأبعاد الصور</button></form></section>`;
}
document.addEventListener('click',event=>{
 const add=event.target.closest('[data-add-simple-category]');
 if(add){const list=add.closest('[data-service-config]')?.querySelector('[data-simple-category-list]');if(!list)return;if(list.querySelectorAll('[data-simple-category]').length>=25){alert('الحد الأقصى 25 تصنيفًا لكل خدمة.');return;}list.insertAdjacentHTML('beforeend',serviceCategoryRow());list.lastElementChild?.querySelector('[name="cat_ar"]')?.focus();return;}
 const remove=event.target.closest('[data-remove-simple-category]');
 if(remove){if(confirm('حذف التصنيف من الأزرار؟ المشاريع نفسها لن تُحذف.'))remove.closest('[data-simple-category]')?.remove();}
});
function renderItems(table){
  const isProjects=table==='projects';
  const isTestimonials=table==='testimonials';
  const arr=data[table]||[];
  const noun=isProjects?'مشروع':isTestimonials?'رأي عميل':'خدمة';
  const list=`<div class="admin-panel"><div class="admin-heading"><h2>${isProjects?'الأعمال المعروضة':isTestimonials?'آراء العملاء':'الخدمات المعروضة'}</h2>${uiButton(`+ إضافة ${noun}`,'add',table,'')}</div><div class="admin-rows">${arr.length?arr.map(row=>`<div class="admin-row"><div class="admin-row-content">${isProjects && safeUrl(row.image_url)?`<img class="admin-row-thumb" src="${esc(safeUrl(row.image_url))}" loading="lazy" alt=""/>`:''}<div><h3>${esc(isTestimonials?row.author_ar:row.title_ar)}</h3><p>${esc(isTestimonials?row.author_en:row.title_en)} · ${row.is_published?'منشور':'مسودة'} · #${esc(row.sort_order)}</p></div></div><div class="row-actions">${!isTestimonials?uiButton(row.is_published?'إخفاء':'نشر','togglepublish',`${table}|${row.id}`):''}${uiButton('تعديل','edit',`${table}|${row.id}`)}${uiButton('حذف','delete',`${table}|${row.id}`,'danger')}</div></div>`).join(''):`<p class="admin-empty">لا توجد عناصر بعد.</p>`}</div></div>`;
  const servicePages=table==='services'?`<div class="admin-panel"><h3>دليل صفحات الخدمات الفعلية</h3><p class="admin-note">الروابط الأربعة أدناه هي المعاينات المقابلة للخدمات الأساسية الظاهرة على الموقع. الخدمات الفعلية تتعدل من القائمة أسفل هذا الدليل، والمشاريع في كل صفحة تتحدد من تصنيف المشروع المنشور. لإضافة أعمال للصفحة افتح «المشاريع» واختر تصنيفها. عدّل أسماء الخدمات الفعلية من القائمة التالية.</p><div class="admin-rows">${[['social-media','السوشيال ميديا والإعلانات'],['video-motion','الريلز والبودكاست'],['ai-creative','التصميم بالذكاء الاصطناعي'],['branding','الهوية البصرية']].map(([slug,name])=>`<a class="admin-btn secondary" target="_blank" rel="noopener" href="./services/${slug}/">فتح تخصص ${name} ↗</a>`).join('')}</div></div>`:'';
  if(!editing || editing.table!==table)return (table==='services'?servicePageEditor(): '')+servicePages+list;
  const item=arr.find(a=>a.id===editing.id) || {};
  const isNew=!item.id;
  const main=isTestimonials ? `${field('author_ar','اسم العميل بالعربي',item.author_ar,{required:true})}${field('author_en','اسم العميل بالإنجليزي',item.author_en,{required:true})}
  ${field('job_ar','المسمى / نوع العمل',item.job_ar)}${field('job_en','المسمّى بالإنجليزي',item.job_en)}
  ${field('quote_ar','نص التقييم الحقيقي بالعربي',item.quote_ar,{type:'textarea',full:true,required:true})}${field('quote_en','التقييم بالإنجليزي',item.quote_en,{type:'textarea',full:true,required:true})}
  ${field('rating','التقييم من 1 إلى 5 (0 لقالب المعاينة)',item.rating??0,{type:'number'})}
  ${field('is_verified','هذه شهادة حقيقية وبموافقة صاحبها',item.is_verified,{type:'checkbox',full:true})}
  ${field('sort_order','الترتيب',item.sort_order??arr.length+1,{type:'number'})}${field('is_published','منشور على الموقع',item.is_published??false,{type:'checkbox'})}` : `${field('title_ar','العنوان بالعربي',item.title_ar,{required:true})}${field('title_en','عنوان المشروع بالإنجليزي',item.title_en,{required:true})}
  ${isProjects?`<details class="cms-advanced full"><summary>إعدادات الرابط المتقدمة (اختيارية) ▾</summary>${field('slug','عنوان رابط المشروع — يُنشأ تلقائيًا إذا تركته فارغًا',item.slug||'',{full:true})}<small>هذا الجزء يظهر في عنوان صفحة المشروع. اتركه فارغًا لنولّد رابطًا فريدًا بدلًا منك. لا تغيّره لمشروع منشور حتى لا ينكسر الرابط القديم.</small></details>
  <label class="form-field full">تصنيف المشروع (من التصنيفات المعتمدة)<select name="category_id" required>${PORTFOLIO_CATEGORIES.map(c=>`<option value="${esc(c.id)}" ${categoryFor(item)?.id===c.id?'selected':''}>${esc(c.ar)} — ${esc(c.en)}</option>`).join('')}</select><small>الاسم العربي والإنجليزي بيتسجلوا تلقائيًا لتجنب التكرار في المعرض.</small></label>
  <fieldset class="form-field full" style="border:1px solid #ffffff33;border-radius:12px;padding:12px"><legend>التصنيفات داخل صفحات الخدمات</legend>
 <p class="admin-note">حدد الأقسام اللي هيظهر فيها المشروع داخل صفحة خدمته.</p>
 ${SERVICE_PAGES.map(page=>`<div data-service-group-for="${esc(page.category)}" ${page.category===(categoryFor(item)?.id||PORTFOLIO_CATEGORIES[0].id)?'':'hidden'}><strong>${esc(page.ar)}</strong>${serviceConfig(data.settings)[page.slug].categories.map(c=>`<label class="form-field checkbox"><input type="checkbox" name="service_group_${page.slug}" value="${esc(c.id)}" ${projectServiceGroups(item,page.slug).includes(c.id)?'checked':''}>${esc(c.ar)}</label>`).join('')}</div>`).join('')||'<small>يمكن إضافة تصنيفات من قسم الخدمات.</small>'}</fieldset>
   ${field('project_type','نوع المشروع',item.project_type||'concept',{select:[['concept','تصوّر إبداعي / تجربة شخصية'],['personal','عمل شخصي'],['client','مشروع عميل مصرح بنشره']]})}
  ${richField('summary_ar','شرح المشروع بالعربي',item.summary_ar,6)}${richField('summary_en','وصف المشروع بالإنجليزي',item.summary_en,6)}
  <details class="cms-advanced full"><summary>مظهر افتراضي لو لم ترفع صورة ▾</summary>${field('cover_style','ستايل الصورة الافتراضية',item.cover_style || 'aurora',{select:[['aurora','تدرجات فنية'],['type','حروف وتايبوجرافي'],['orbit','أشكال دائرية'],['pop','ألوان جريئة']]})}</details>
  <details class="cms-advanced full"><summary>استخدام رابط صورة جاهزة بدل الرفع (اختياري) ▾</summary>${field('image_url','رابط صورة الغلاف',item.image_url,{type:'text',full:true})}<small>استخدمه فقط لو الصورة موجودة بالفعل على الإنترنت برابط HTTPS. الأسهل: ارفع الصورة من جهازك في الأسفل.</small></details>
  <details class="cms-advanced full"><summary>روابط الفيديو والمشاهدة المتقدمة (اختيارية) ▾</summary>${field('video_url','رابط ملف فيديو MP4 / WebM على الإنترنت',item.video_url||'',{type:'url',full:true})}<small>هذا رابط ينتهي بملف الفيديو نفسه، وليس صفحة بها فيديو. يمكنك تركه فارغًا واستخدام يوتيوب.</small>
  ${field('youtube_url','رابط فيديو يوتيوب أو يوتيوب شورتس',item.youtube_url||'',{type:'url',full:true})}<small>انسخ رابط الفيديو من يوتيوب لو عندك فيديو للمشروع.</small>
  ${field('gallery_urls','روابط الصور الإضافية (اختياري، رابط في كل سطر)',item.gallery_urls||'',{type:'textarea',full:true,rows:4})}</details>
  ${mediaCaptionsEditor('gallery',item.gallery_captions,item.gallery_urls)}${richField('objective_ar','هدف المشروع بالعربي',item.objective_ar||'',10)}
  ${richField('objective_en','الهدف بالإنجليزي',item.objective_en||'',8)}
  ${field('text_font','خط النص الطويل',item.text_style?.font||'Alexandria',{select:FONT_CHOICES})}${field('text_size','حجم النص بالبكسل (14–30)',item.text_style?.size||17,{type:'number'})}
  <div class="form-field full cms-tool-entry"><span>الأدوات المستخدمة في المشروع</span><div class="cms-tools-box" data-tools-box><div data-tools-tags class="cms-tools-tags"></div><input data-tool-add placeholder="اكتب Photoshop واضغط Enter" aria-label="اكتب أداة واضغط Enter" maxlength="70"></div><input type="hidden" name="tools_used" value="${esc(formatTools(item.tools_used).join(', '))}"><small>اضغط Enter بعد كل برنامج علشان يظهر في خانة مستقلة، أو اضغط × لإزالته.</small></div>
  <label class="form-field full">إضافة فيديوهات أخرى للمشروع (حتى 4 فيديوهات في المرة)<input name="project_video_file" type="file" multiple accept="video/mp4,video/webm" ${cmsConnected?'':'disabled'}><small>الفيديو يُرفع إلى Supabase Storage عند حفظ المشروع. للفيديوهات الأكبر استخدم YouTube.</small></label>
  <label class="form-field full">استبدال الفيديو الرئيسي الحالي (اختياري)<input type="file" name="replace_project_video" accept="video/mp4,video/webm" ${cmsConnected?'':'disabled'}><small>اختار فيديو جديد لو عايز تستبدل الرئيسي. هيظهر مكانه بعد الحفظ؛ باقي فيديوهات المشروع مش هتتمسح.</small></label>
  <label class="form-field full">استبدال صورة غلاف المشروع (أو إضافة غلاف لأول مرة) <input type="file" name="media_file" accept="image/png,image/jpeg,image/webp,image/avif" ${cmsConnected?'':'disabled'} /> <small>صورة بحد أقصى 8 MB. ترفع بصورة آمنة فقط عند تفعيل التخزين وسياسات الصلاحيات.</small></label>
  <label class="form-field full">ارفع صور المشروع الإضافية من جهازك (حتى 15 صورة)<input type="file" name="gallery_files" multiple accept="image/png,image/jpeg,image/webp,image/avif" ${cmsConnected?'':'disabled'}/><small data-project-gallery-count role="status" aria-live="polite">الحد الأقصى 15 صورة إضافية، شامل الروابط والملفات الجديدة.</small></label>
  <details class="cms-advanced full"><summary>رابط خارجي للعمل (اختياري) ▾</summary>${field('external_url','رابط لعرض العمل على Behance أو موقع خارجي',item.external_url,{type:'url',full:true})}<small>اتركه فارغًا لو مش عايز تحول الزائر لموقع آخر. صفحة المشروع عندك تعمل بدونه.</small></details>
  ${field('featured','مميز',item.featured,{type:'checkbox'})}`:
  `${field('description_ar','وصف الخدمة بالعربي',item.description_ar,{type:'textarea',full:true})}${field('description_en','وصف الخدمة بالإنجليزي',item.description_en,{type:'textarea',full:true})}
  ${field('icon','رمز الخدمة',item.icon || 'sparkles',{select:[['diamond','◇ Diamond'],['sparkles','◈ Sparkles'],['play','▷ Editing'],['layout','▦ Web'],['target','◎ Strategy'],['brush','✺ Design']]})}`}
  ${field('sort_order','الترتيب',item.sort_order ?? arr.length+1,{type:'number'})}${field('is_published','منشور على الموقع',item.is_published ?? false,{type:'checkbox'})}`;
  const preview=isProjects?`<div class="cms-project-preview" id="cmsProjectPreview"><div class="cms-preview-art">${safeUrl(item.image_url)?`<img id="previewImage" src="${esc(safeUrl(item.image_url))}" alt="معاينة الغلاف">`:`<span id="previewFallback">◈</span>`}</div><div><small>معاينة سريعة قبل النشر</small><h3 id="previewTitle">${esc(item.title_ar||'اسم مشروعك الجديد')}</h3><p id="previewCategory">${esc(item.category_ar||'تصنيف المشروع')}</p>${item.slug&&item.is_published?`<a href="./project.html?slug=${esc(item.slug)}" target="_blank" rel="noopener">فتح المشروع المنشور ↗</a>`:''}</div></div>`:'';
  return `<div class="admin-panel" id="editorPanel"><h2>${isNew?`إضافة ${noun}`:`تعديل ${noun}`}</h2><form data-entity="${table}" data-edit-id="${esc(item.id || '')}" novalidate><div class="admin-form-grid">${main}</div>${preview}<div class="admin-actions"><div data-save-status role="status" aria-live="polite" hidden style="width:100%;padding:12px;border:1px solid #79b943;border-radius:10px;white-space:normal"></div>${uiButton('إلغاء','cancel')}<button class="admin-btn" type="button" data-direct-save>حفظ ${noun}</button></div></form></div>`+list;
}
function renderMessages(){
 if(!cmsConnected)return `<div class="admin-panel"><h2>رسائل العملاء</h2><p class="admin-note">الرسائل تحتاج توصيل Supabase. على النسخة غير المتصلة، الطلبات تفتح واتساب ومش بتتحفظ هنا.</p></div>`;
 const messages=data.messages||[];
 return `<div class="admin-panel"><div class="admin-heading"><div><h2>صندوق طلبات العملاء</h2><p class="admin-note">افتح وسيلة التواصل المناسبة، سجل المتابعة، وحدّث حالة كل مشروع.</p></div><span class="admin-badge">${messages.length} طلب</span></div><div class="inbox-toolbar"><input id="inboxSearch" type="search" placeholder="دوّر باسم العميل أو نوع الخدمة" aria-label="بحث في الطلبات"><select id="inboxFilter" aria-label="فلترة الطلبات"><option value="">كل الحالات</option><option value="new">جديد</option><option value="reviewing">قيد المراجعة</option><option value="contacted">تم التواصل</option><option value="proposal_sent">تم إرسال عرض</option><option value="accepted">تم الاتفاق</option><option value="completed">مكتمل</option><option value="archived">مؤرشف</option></select></div><div id="inboxRows">${messages.map(m=>{
 const number=String(m.sender_phone||'').replace(/[^0-9]/g,'').replace(/^0(?=1[0125][0-9]{8}$)/,'20');
 const validPhone=number.length>=9&&number.length<=15;
 const safeEmail=encodeURIComponent(m.sender_email||'');
 return `<article class="message-card inbox-item" data-search="${esc((m.sender_name+' '+m.service_type+' '+m.sender_email).toLowerCase())}" data-status="${esc(m.status)}"><div class="admin-heading"><div><strong class="inbox-name">${esc(m.sender_name)} ${m.status==='new'?'<span class="inbox-new">جديد</span>':''}</strong><small>${esc(m.sender_email)} · ${esc(m.service_type)} · ${esc(new Date(m.created_at).toLocaleString('ar-EG'))}</small></div><select data-message-status="${esc(m.id)}" aria-label="حالة الطلب">${[['new','جديد'],['reviewing','قيد المراجعة'],['contacted','تم التواصل'],['proposal_sent','تم إرسال عرض'],['accepted','تم الاتفاق'],['completed','مكتمل'],['archived','مؤرشف']].map(([value,label])=>`<option value="${value}" ${m.status===value?'selected':''}>${label}</option>`).join('')}</select></div><p class="inbox-message">${esc(m.message)}</p><div class="inbox-meta">${m.company?`<span>الشركة: ${esc(m.company)}</span>`:''}${m.budget?`<span>حجم المشروع: ${esc(m.budget)}</span>`:''}${m.desired_timeline?`<span>المدة: ${esc(m.desired_timeline)}</span>`:''}${m.sender_phone?`<span>الهاتف: <b dir="ltr">${esc(m.sender_phone)}</b></span>`:''}${m.reference_url&&safeUrl(m.reference_url)?`<a href="${esc(safeUrl(m.reference_url))}" target="_blank" rel="noopener">الرابط المرجعي ↗</a>`:''}</div><div class="inbox-actions"><a class="admin-btn secondary" href="mailto:${safeEmail}?subject=${encodeURIComponent('بخصوص طلبك من Mo Design')}">↗ الرد بالإيميل</a>${validPhone?`<a class="admin-btn secondary" href="https://wa.me/${number}?text=${encodeURIComponent('أهلًا '+m.sender_name+'، معاك محمد من Mo Design. بخصوص طلب المشروع اللي بعته من الموقع.')}" target="_blank" rel="noopener noreferrer">↗ واتساب العميل</a>`:''}</div><label class="form-field full">ملاحظاتك الداخلية (مش ظاهرة للعميل)<textarea data-inquiry-note="${esc(m.id)}" rows="2" maxlength="2000">${esc(m.internal_notes||'')}</textarea></label>${uiButton('حفظ الملاحظات','savenote',m.id)}<div class="inbox-management-actions">${m.status==='archived'?uiButton('إلغاء الأرشفة','restoreInquiry',m.id):uiButton('أرشفة الطلب','archiveInquiry',m.id)}${uiButton('حذف نهائي','deleteInquiry',m.id)}</div></article>`;
 }).join('')||'<p class="admin-empty">مفيش طلبات لحد دلوقتي.</p>'}</div></div>`;
}
function renderMedia(){
 return `<div class="admin-panel"><h2>مكتبة الصور والوسائط</h2><p class="admin-note">ارفع صورك مرة واستخدم الرابط في أي مشروع أو في إعدادات صورتك الشخصية. الصور بتتحفظ في Supabase مش على GitHub.</p><form id="mediaUploadForm" class="media-upload-form"><label class="form-field">اختار الصور (JPG / PNG / WebP / AVIF) <input type="file" name="uploads" multiple accept="image/png,image/jpeg,image/webp,image/avif" ${cmsConnected?'':'disabled'} required></label><button type="submit" class="admin-btn" ${cmsConnected?'':'disabled'}>رفع الصور</button></form><div id="mediaGallery" class="media-grid">${!cmsConnected?'<p class="admin-note">اتصل بـ Supabase الأول علشان تعرض مكتبة الصور.</p>':'<p class="admin-note">جارٍ تحميل الوسائط...</p>'}</div></div>`;
}
async function uploadImage(file,folder='general'){
 if(!['image/png','image/jpeg','image/webp','image/avif'].includes(file.type)||file.size>8*1024*1024)throw Error('اختار صورة PNG أو JPEG أو WebP أو AVIF بحد أقصى 8 ميجابايت.');
 const db=await getClient();const ext=({'image/png':'png','image/jpeg':'jpg','image/webp':'webp','image/avif':'avif'})[file.type];
 const path=`${folder}/${crypto.randomUUID()}.${ext}`;
 const {error}=await db.storage.from('portfolio-media').upload(path,file,{contentType:file.type,upsert:false,cacheControl:'3600'});
 if(error)throw error;
 return db.storage.from('portfolio-media').getPublicUrl(path).data.publicUrl;
}
async function uploadLearningVideo(file,folder='learning'){
 if(!['video/mp4','video/webm'].includes(file.type)||file.size>45*1024*1024)throw Error('الفيديو لازم يكون MP4 أو WebM وحجمه أقل من 45 ميجابايت.');
 const db=await getClient();const ext=file.type==='video/mp4'?'mp4':'webm';
 const path=`${folder}/${crypto.randomUUID()}.${ext}`;
 const {error}=await db.storage.from('portfolio-video').upload(path,file,{contentType:file.type,upsert:false,cacheControl:'3600'});
 if(error)throw error;
 return db.storage.from('portfolio-video').getPublicUrl(path).data.publicUrl;
}
async function loadMedia(){
 const grid=$('#mediaGallery');if(!grid||!cmsConnected)return;
 try{
  const db=await getClient();
  async function listFolder(folder){
    const all=[];const limit=100;const maxPages=20;
    for(let page=0;page<maxPages;page++){
      const {data:batch,error}=await db.storage.from('portfolio-media').list(folder,{limit,offset:page*limit,sortBy:{column:'created_at',order:'desc'}});
      if(error)throw error;
      all.push(...(batch||[]).map(x=>({folder,...x})));
      if(!batch||batch.length<limit)return all;
    }
    console.warn('Media library listing reached its 2000-file safety cap:',folder);
    return all;
  }
  const lists=await Promise.all(['projects','general'].map(listFolder));
  mediaCache=lists.flat().filter(x=>x.name&&!x.name.startsWith('.'));
  grid.innerHTML=mediaCache.map(x=>{const url=db.storage.from('portfolio-media').getPublicUrl(x.folder+'/'+x.name).data.publicUrl;return `<div class="media-card"><img src="${esc(url)}" alt="صورة من مكتبة الوسائط" loading="lazy"><small dir="ltr" title="${esc(x.name)}">${esc(x.name.slice(0,14))}...</small><div class="v13-media-actions"><button type="button" class="admin-btn secondary" data-copy-url="${esc(url)}">نسخ الرابط</button><button type="button" class="admin-btn secondary v13-media-delete" data-media-delete="${esc(x.folder+'/'+x.name)}">حذف الصورة</button></div></div>`}).join('')||'<p class="admin-empty">المكتبة فاضية، ابدأ برفع صورة.</p>';
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
  <fieldset class="form-field full" style="border:1px solid #ffffff2b;border-radius:12px;padding:14px">
    <legend>اختار تصنيف المحتوى</legend>
    <p class="admin-note">كل المحتوى تلقائي، وفيديوهات/مقالات حسب نوع المحتوى فوق. اختار قسمًا إضافيًا أو أكتر لو حابب.</p>
    <div class="admin-form-grid">
      ${getAcademyCategories(data.settings).filter(c=>c.enabled).map(cat=>`<label class="form-field checkbox"><input type="checkbox" name="lesson_category" value="${esc(cat.id)}" ${(getAcademyMembership(data.settings)[String(item.id)]||[]).includes(cat.id)?'checked':''}>${esc(cat.ar||cat.en)}</label>`).join('')||'<p class="admin-note">لسه مفيش أقسام إضافية. أضفها من «إدارة أقسام الأكاديمية» أسفل الصفحة.</p>'}
    </div>
  </fieldset>
 ${field('title_ar','عنوان المحتوى بالعربي',item.title_ar||'',{required:true})}
 ${field('title_en','العنوان بالإنجليزي',item.title_en||'')}
 ${richField('summary_ar','وصف قصير بالعربي',item.summary_ar||'',3)}
 ${richField('summary_en','الوصف بالإنجليزي',item.summary_en||'',3)}
 ${field('youtube_url','رابط فيديو YouTube أو Shorts (اختياري لو هترفع فيديو)',item.youtube_url||'',{type:'url',full:true})}
 ${field('video_url','رابط MP4 أو WebM مباشر (اختياري)',item.video_url||'',{type:'url',full:true})}
 <label class="form-field full">ارفع فيديو من جهازك (MP4 / WebM، بحد أقصى 45 ميجابايت)<input name="lesson_video_file" type="file" accept="video/mp4,video/webm" ${cmsConnected?'':'disabled'}><small>الفيديو بيترفع على Supabase Storage عند الضغط على حفظ. للفيديوهات الكبيرة استخدم يوتيوب لتوفير المساحة.</small></label>
 ${field('thumbnail_url','رابط صورة مصغرة (اختياري)',item.thumbnail_url||'',{type:'url',full:true})}
 <label class="form-field full">أو ارفع صورة مصغّرة من جهازك (JPG / PNG / WebP لحد 8 ميجابايت)<input type="file" name="lesson_thumbnail_file" accept="image/png,image/jpeg,image/webp,image/avif" ${cmsConnected?'':'disabled'}><small>لو اخترت صورة هنا هتترفع تلقائيًا وقت الحفظ، وتظهر على بطاقة الدرس.</small></label>
 <details class="cms-advanced full"><summary>روابط صور الدرس الجاهزة (اختياري) ▾</summary>${field('image_urls','روابط صور الشرح — رابط HTTPS لكل سطر',item.image_urls||'',{type:'textarea',full:true,rows:3})}</details>
 <label class="form-field full">ارفع صور الشرح من الكمبيوتر (حتى 15 صورة إجماليًا، 8MB للصورة)<input type="file" name="lesson_images_files" accept="image/png,image/jpeg,image/webp,image/avif" multiple ${cmsConnected?'':'disabled'}><small data-lesson-gallery-count role="status" aria-live="polite">صور الدرس: الحد الأقصى 15 صورة شامل الروابط والملفات.</small></label>
 ${mediaCaptionsEditor('lesson',item.image_captions,item.image_urls)}${field('text_font','خط المحتوى',item.text_style?.font||'Alexandria',{select:FONT_CHOICES})}${field('text_size','حجم النص بالبكسل (14–30)',item.text_style?.size||17,{type:'number'})}
 ${field('resource_links','روابط الشرح وملفات PDF أو Google Drive (كل رابط في سطر، بصيغة: اسم الملف | https://...)',item.resource_links||'',{type:'textarea',full:true,rows:4})}
 <p class="admin-note full">علشان ملفات Google Drive تفتح للزوار: افتح إعدادات المشاركة للملف واختر «أي شخص معه الرابط — مشاهد».</p>
 ${richField('body_ar','نص المقال بالعربي (لنوع مقال)',item.body_ar||'',9)}
 ${richField('body_en','نص المقال بالإنجليزي',item.body_en||'',8)}
 ${field('is_published','انشر المحتوى على الموقع',item.is_published||false,{type:'checkbox',full:true})}
 </div>${mediaId?`<div class="v10-video-preview"><img src="https://i.ytimg.com/vi/${mediaId}/hqdefault.jpg" alt="معاينة فيديو يوتيوب"><div>معاينة الصورة المصغّرة <a href="https://www.youtube.com/watch?v=${mediaId}" target="_blank" rel="noopener noreferrer">↗ جرّب فتح الفيديو على يوتيوب</a></div></div>`:''}<div class="admin-actions">${uiButton('إلغاء','cancelLesson')}<button class="admin-btn" type="submit">${isNew?'حفظ المحتوى':'حفظ التعديلات'} ✓</button></div></form></div>`;
}
function renderAcademyCategoryManager(){
 const settings=data.settings||{},categories=getAcademyCategories(settings),members=getAcademyMembership(settings);
 const categoryFields=categories.map(cat=>academyCategoryRow(cat)).join('');
 const itemFields=(data.learning_items||[]).map(item=>`<fieldset class="admin-tool-row" data-lesson-category-id="${esc(String(item.id))}" style="padding:12px;margin:12px 0;border:1px solid #ffffff25;border-radius:12px"><legend>${esc(item.title_ar||item.title_en||'محتوى')}</legend><div data-category-assignment>${categories.map(cat=>`<label class="form-field checkbox"><input type="checkbox" data-category-membership="${esc(cat.id)}" ${(members[String(item.id)]||[]).includes(cat.id)?'checked':''}>${esc(cat.ar||cat.en)}</label>`).join('')}</div></fieldset>`).join('');
 const extra=ACADEMY_TEXT_KEYS.map(([key,label])=>`<div class="admin-form-grid">${field('ar_'+key,label+' بالعربي',academyText(settings,key,'ar'),{full:true})}${field('en_'+key,label+' بالإنجليزي',academyText(settings,key,'en'),{full:true})}</div>`).join('');
 return `<section class="admin-panel"><div class="admin-heading"><h2>إدارة أقسام الأكاديمية</h2><p class="admin-note">كل المحتوى والفيديوهات والمقالات أساسية. أضف أقسام جديدة وحدد المحتوى التابع لكل قسم، أو أخفِ أي قسم إضافي.</p></div><form data-entity="academy_categories" id="academyCategoryForm"><div id="academyCategoryRows">${categoryFields}</div><button class="admin-btn secondary" data-add-academy-category type="button">+ إضافة قسم</button><h3>توزيع المحتوى على الأقسام</h3><div id="academyMemberships">${itemFields}</div><details><summary>تحرير نصوص الصفحة الداخلية والأزرار</summary>${extra}</details><button type="submit" class="admin-btn">حفظ أقسام الأكاديمية ✓</button></form></section>`;
}
function academyCategoryRow(cat={}){
 return `<div class="admin-tool-row" data-academy-category-row data-category-id="${esc(cat.id||'')}" style="padding:12px;margin:12px 0;border:1px solid #ffffff25;border-radius:12px"><div class="admin-form-grid">${field('category_ar','اسم القسم بالعربي',cat.ar||'',{required:true})}${field('category_en','English category name',cat.en||'')}${field('category_enabled','إظهار القسم',cat.enabled!==false,{type:'checkbox'})}</div><button class="admin-btn secondary" type="button" data-remove-academy-category>حذف القسم</button></div>`;
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
 <div class="v10-learning-table"><div class="v10-learning-table-head"><span>المحتوى</span><span>الحالة</span><span>التحكم</span></div>${items.map(item=>{let id=youtubeId(item.youtube_url||'');return `<div class="v10-learning-row"><div class="v10-learning-title">${safeUrl(item.thumbnail_url)?`<img src="${esc(safeUrl(item.thumbnail_url))}" loading="lazy" alt="">`:id?`<img src="https://i.ytimg.com/vi/${id}/mqdefault.jpg" loading="lazy" alt="">`:'<span class="v10-lesson-fallback">◈</span>'}<div><strong>${esc(item.title_ar)}</strong><small>${item.content_type==='video'?'فيديو / يوتيوب':'مقال'} · ${esc(item.title_en||'بدون ترجمة')}</small></div></div><span class="v10-status-tag ${item.is_published?'published':''}">${item.is_published?'منشور':'مسودة'}</span><div class="v10-learning-actions">${uiButton(item.is_published?'إخفاء':'نشر','togglepublish',`learning_items|${item.id}`)}${uiButton('تعديل','editLesson',item.id)}${uiButton('حذف','deleteLesson',item.id,'danger')}</div></div>`}).join('')||'<div class="v10-no-lesson">مفيش محتوى اتضاف لسه. اضغط «إضافة محتوى» علشان تبدأ.</div>'}</div></div>${editor}${renderAcademyCategoryManager()}`;
}


const DESIGN_SECTIONS=[['home','بداية الموقع'],['featured','المشاريع المميزة'],['signature','أكتر من مجرد تصميم'],['work','معرض الأعمال'],['services','الخدمات'],['why','أسلوبي في الشغل'],['about','نبذة عني'],['process','مراحل التنفيذ'],['testimonials','آراء العملاء'],['cta','شغلك يستحق يتشاف'],['learn','الأكاديمية والمحتوى'],['contact','التواصل']];
function refreshAppearancePreview(section){
 const preview=document.querySelector('[data-appearance-preview="'+section+'"]');
 const form=document.querySelector('#appearanceForm');
 if(!preview||!form)return;
 for(const mode of ['dark','light']){
  const card=preview.querySelector('[data-preview-mode="'+mode+'"]');
  if(!card)continue;
  const get=k=>form.elements.namedItem(section+'__'+mode+'_'+k)?.value;
  const hex=v=>/^#[0-9a-f]{6}$/i.test(v||'')?v:null;
  const bg=hex(get('bg')),fg=hex(get('text')),accent=hex(get('accent'));
  if(bg)card.style.backgroundColor=bg;
  if(fg)card.style.color=fg;
  const mark=card.querySelector('span');if(mark&&accent)mark.style.color=accent;
 }
}
function renderAppearance(){
 const design=data.settings?.section_design||{};
 const fields=DESIGN_SECTIONS.map(([id,label],index)=>{
  const d=design[id]||{};
  const color=(key,fallback)=>/^#[a-fA-F0-9]{6}$/.test(d[key]||'')?d[key]:fallback;
  const colorInput=(key,title,def)=>`<label class="form-field v11-color-field">${title}<input type="color" name="${id}__${key}" value="${color(key,def)}"></label>`;
  return `<details class="v11-section-editor" ${index===0?'open':''}><summary><span>◈ ${esc(label)}</span><small>ألوان الدارك واللايت • كافر • حجم القسم</small></summary><div class="admin-form-grid">
    <div class="full appearance-reset-bar"><span class="appearance-state">${d.enabled?'المظهر المخصص محفوظ لهذا القسم':'القسم على ألوانه الأصلية'} — أي تعديل جديد هيتفعّل عند الحفظ.</span><input type="hidden" name="${id}__enabled" value="${d.enabled?'1':'0'}"><button type="button" class="admin-btn secondary appearance-reset-button" data-action="resetAppearance" data-section="${id}">↶ إعادة الألوان والتصميم الأصلي</button></div>
    ${colorInput('dark_bg','خلفية الدارك مود','#10121a')}${colorInput('dark_text','الكتابة في الدارك مود','#f4f4f5')}${colorInput('dark_accent','اللون المميز في الدارك مود','#c6fa8a')}
    ${colorInput('light_bg','خلفية اللايت مود','#f7f5ef')}${colorInput('light_text','الكتابة في اللايت مود','#172026')}${colorInput('light_accent','اللون المميز في اللايت مود','#39671a')}
    <div class="full v13-preview-pair" data-appearance-preview="${id}" aria-label="معاينة محلية للألوان قبل الحفظ">
      <div class="v13-preview-mode" data-preview-mode="dark" style="background:${color('dark_bg','#10121a')};color:${color('dark_text','#f4f4f5')}"><small>Dark mode — معاينة فقط</small><strong>عنوان تجريبي للقسم</strong><span style="color:${color('dark_accent','#c6fa8a')}">نص باللون المميز ●</span><p>مثال على وضوح النص فوق الخلفية.</p></div>
      <div class="v13-preview-mode" data-preview-mode="light" style="background:${color('light_bg','#f7f5ef')};color:${color('light_text','#172026')}"><small>Light mode — معاينة فقط</small><strong>عنوان تجريبي للقسم</strong><span style="color:${color('light_accent','#39671a')}">نص باللون المميز ●</span><p>مثال على وضوح النص فوق الخلفية.</p></div>
    </div>
    ${field(id+'__cover_url','رابط الكافر الحالي (اختياري)',d.cover_url||'',{type:'url',full:true})}
    <label class="form-field full">ارفع كافر من جهازك لهذا القسم (اختياري)<input name="${id}__cover_file" type="file" accept="image/png,image/jpeg,image/webp,image/avif" ${cmsConnected?'':'disabled'}><small>حد أقصى 8 ميجابايت للصورة، وتقدر تغيّره أو تمسح الرابط في أي وقت.</small></label>
    ${field(id+'__font','خط نصوص القسم',d.font||'',{select:[['','الخط الحالي'],...FONT_CHOICES]})}
    ${field(id+'__heading_size','حجم العنوان الرئيسي (0 = التصميم الأساسي)',d.heading_size??0,{type:'number'})}
    ${field(id+'__body_size','حجم الوصف (0 = التصميم الأساسي)',d.body_size??0,{type:'number'})}
    ${field(id+'__padding','المسافة الداخلية بالأعلى والأسفل (36 إلى 220)',d.padding??90,{type:'number'})}
    ${field(id+'__height','أقل ارتفاع للقسم بالبكسل (0 = تلقائي)',d.height??0,{type:'number'})}
    ${field(id+'__shade','تعتيم صورة الكافر (من 0.1 إلى 0.92)',d.shade??0.7,{type:'text'})}
    </div></details>`;
 }).join('');
 return `<style>.v13-preview-pair{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin:10px 0 18px}.v13-preview-mode{border:1px solid #80808055;border-radius:14px;padding:18px;display:flex;flex-direction:column;gap:8px;min-height:165px}.v13-preview-mode strong{font-size:19px}.v13-preview-mode p{margin:0;color:inherit}.v13-preview-mode small{opacity:.8}</style><section class="admin-panel v11-appearance"><div class="admin-heading"><div><h2>تحكّم في شكل أقسام الموقع</h2><p class="admin-note">كل قسم تقدر تغيّر خلفيته ولون الكتابة واللون المميز وصورة الكافر وارتفاعه. تغيير ألوان اللايت ما يأثرش على الدارك.</p></div><a href="./index.html" target="_blank" rel="noopener" class="admin-btn secondary">معاينة ↗</a></div><form data-entity="appearance" id="appearanceForm"><details class="v11-section-editor" open><summary>✎ العنوان والوصف: «التفاصيل اللي بتفرق»</summary><div class="admin-form-grid">${field('reviews_title_ar','عنوان القسم بالعربي',(data.settings?.content_ar||{}).reviews_title??ar.reviews_title??'التفاصيل اللي بتفرق.',{full:true})}${field('reviews_title_en','العنوان بالإنجليزي',(data.settings?.content_en||{}).reviews_title??en.reviews_title??'The details make the difference.',{full:true})}${field('reviews_sub_ar','وصف القسم بالعربي',(data.settings?.content_ar||{}).reviews_sub??ar.reviews_sub??'',{type:'textarea',full:true})}${field('reviews_sub_en','وصف القسم بالإنجليزي',(data.settings?.content_en||{}).reviews_sub??en.reviews_sub??'',{type:'textarea',full:true})}</div></details><div class="v11-appearance-help">أي تغيير في الألوان أو الخط أو الكافر هيشتغل تلقائيًا لما تضغط حفظ. لو عايز ترجع الشكل الأصلي لقسم معين، استخدم زر «إعادة الألوان والتصميم الأصلي» الخاص بيه. متشغّلش صورة كافر إلا لو محتاجها فعلًا، وخلي الكتابة واضحة فوقها.</div>${fields}<div class="admin-sticky-actions"><button class="admin-btn" type="submit">حفظ ألوان وخلفيات الأقسام ✓</button><small>التغييرات بتظهر للزوار بعد حفظها في Supabase وتحديث الصفحة.</small></div></form></section>`;
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
document.addEventListener('change',event=>{
 if(event.target?.name!=='category_id')return;
 const editor=event.target.closest('form[data-entity="projects"]');if(!editor)return;
 const selected=event.target.value;
 editor.querySelectorAll('[data-service-group-for]').forEach(group=>{group.hidden=group.dataset.serviceGroupFor!==selected;});
});
function legalSectionRow(item={}){
 return `<div data-legal-section style="border:1px solid #ffffff22;border-radius:10px;padding:12px;margin:10px 0">
 <div class="admin-form-grid">
 ${field('legal_section_title_ar','عنوان الجزء بالعربي',item.title_ar||'')}
 ${field('legal_section_title_en','عنوان الجزء بالإنجليزي (اختياري)',item.title_en||'')}
 ${field('legal_section_text_ar','النص بالعربي',item.text_ar||'',{type:'textarea',full:true,rows:4})}
 ${field('legal_section_text_en','النص بالإنجليزي (اختياري)',item.text_en||'',{type:'textarea',full:true,rows:4})}
 </div><button type="button" class="admin-btn secondary" data-legal-remove-section>حذف الجزء</button></div>`;
}
function renderLegalPages(){
 const pages=legalPages(data.settings);
 return `<section class="admin-panel"><h2>الصفحات والروابط أسفل الموقع</h2><p class="admin-note">كل جزء له خانة عنوان وخانة نص منفصلة. أضف عدد الأجزاء اللي تحتاجه واضغط حفظ. محتوى الصفحات الأصلية يظل محفوظًا حتى تستبدله.</p><form data-entity="legal_pages"><div data-legal-list>${pages.map(p=>legalRow(p)).join('')}</div><button type="button" class="admin-btn secondary" data-legal-add>+ إضافة صفحة</button><button type="submit" class="admin-btn">حفظ الصفحات والروابط</button></form></section>`;
}
function legalRow(p={}){
 const sections=Array.isArray(p.sections)?p.sections:[];
 return `<fieldset data-legal-row data-legal-id="${esc(p.id||'')}" style="border:1px solid #ffffff33;border-radius:12px;padding:14px;margin:12px 0"><legend>${esc(p.ar||'صفحة جديدة')}</legend><div class="admin-form-grid">
 ${field('legal_ar','اسم الصفحة بالعربي',p.ar||'',{required:true})}${field('legal_en','اسم الصفحة بالإنجليزي',p.en||'')}
 </div><h3>العناوين والنصوص داخل الصفحة</h3><div data-legal-sections>${sections.map(legalSectionRow).join('')}</div>
 <button type="button" class="admin-btn secondary" data-legal-add-section>+ إضافة عنوان ونص</button>
 <label class="form-field"><input type="checkbox" name="legal_enabled" ${p.enabled!==false?'checked':''}/> إظهار الرابط</label>
 ${['privacy','terms','copyright'].includes(p.id)?'<small>محتوى الصفحة الأصلي يظل موجودًا حتى تحفظ أجزاء جديدة.</small>':'<button type="button" class="admin-btn secondary" data-legal-remove>حذف الصفحة الجديدة</button>'}
 </fieldset>`;
}
document.addEventListener('click',event=>{
 if(event.target.closest('[data-legal-add]')){const list=document.querySelector('[data-legal-list]');if(list&&list.children.length<15)list.insertAdjacentHTML('beforeend',legalRow());}
 if(event.target.closest('[data-legal-remove]'))event.target.closest('[data-legal-row]')?.remove();
 if(event.target.closest('[data-legal-add-section]')){const list=event.target.closest('[data-legal-row]')?.querySelector('[data-legal-sections]');if(list&&list.children.length<30)list.insertAdjacentHTML('beforeend',legalSectionRow());}
 if(event.target.closest('[data-legal-remove-section]'))event.target.closest('[data-legal-section]')?.remove();
});

function teamRow(item={},index=0){
 const val=key=>esc(item[key]||'');
 const field=(id,title)=>'<label>'+title+'<input name="'+id+'" value="'+val(id)+'" placeholder="'+title+'"></label>';
 return '<div class="mo-studio-edit-row" data-team-row data-id="'+val('id')+'"><div class="mo-studio-row-head"><strong>عضو فريق '+(index+1)+'</strong><button type="button" class="admin-btn secondary" data-team-remove>حذف العضو</button></div><div class="admin-form-grid">'+
  field('name_ar','اسم العضو بالعربي')+field('name_en','Name in English')+
  field('role_ar','الوظيفة بالعربي')+field('role_en','Role in English')+
  field('image_url','رابط الصورة HTTPS')+field('link_url','رابط أعمال العضو')+
  '<label>رفع صورة العضو<input type="file" name="team_file" accept="image/png,image/jpeg,image/webp,image/avif" '+(cmsConnected||isStudioPreviewHost()?'':'disabled')+'></label>'+
  '<label>الترتيب<input type="number" name="sort_order" value="'+Number(item.sort_order||index)+'"></label>'+
  '<label class="form-field checkbox"><input type="checkbox" name="enabled" '+(item.enabled?'checked':'')+'> إظهار هذا العضو</label>'+
  '</div></div>';
}
const TEAM_COPY_FIELDS=[
 ['team_eyebrow','النص الصغير أعلى قسم الفريق','MO DESIGN / PEOPLE','MO DESIGN / PEOPLE'],
 ['team_title','العنوان الرئيسي لقسم الفريق','فريقنا وراء كل تفصيلة.','People behind the work.'],
 ['team_description','الوصف تحت عنوان الفريق','تعرف على الناس اللي بتشتغل على الأفكار والتصاميم.','Meet the people creating the work.']
];
function teamCopyEditor(settings){
 const arCopy=settings?.content_ar||{}, enCopy=settings?.content_en||{};
 return '<section class="mo-team-copy-panel" id="teamCopyEditor"><h3>نصوص قسم فريق العمل</h3><p class="admin-note">عدّل الثلاث عبارات الظاهرة فوق أعضاء الفريق بالعربي والإنجليزي، واضغط حفظ أسفل النموذج.</p><div class="admin-form-grid">'+
 TEAM_COPY_FIELDS.map(([key,label,defaultAr,defaultEn])=>
   field('ar_'+key,label+' — عربي',arCopy[key]??defaultAr,{type:'textarea',rows:2})+
   field('en_'+key,label+' — English',enCopy[key]??defaultEn,{type:'textarea',rows:2})
 ).join('')+'</div></section>';
}
function renderTeam(){
 const cfg=readStudio(data.settings);
 return '<section class="admin-panel"><h2>إدارة فريق العمل</h2><p class="admin-note">القسم يظهر بعد نموذج التواصل وقبل الفوتر. هنا تقدر تتحكم في نصوصه وأعضائه وصورهم وترتيبهم من مكان واحد.</p><form id="teamForm">'+teamCopyEditor(data.settings)+'<div class="mo-studio-toggles"><label class="cms-toggle"><input name="team_enabled" type="checkbox" '+(cfg.team_enabled?'checked':'')+'> إظهار قسم الفريق في الموقع</label></div><h3>أعضاء الفريق وصورهم</h3><div id="teamRows">'+cfg.team.map((x,i)=>teamRow(x,i)).join('')+'</div><button type="button" class="admin-btn secondary" data-team-add>+ إضافة عضو جديد</button><div class="admin-actions"><button type="submit" class="admin-btn">حفظ نصوص وأعضاء الفريق</button></div><p id="teamStatus" role="status"></p></form></section>';
}
async function saveTeamForm(form){
 const button=form.querySelector('button[type="submit"]'),status=form.querySelector('#teamStatus');
 if(button)button.disabled=true;status.textContent='جاري حفظ أعضاء الفريق...';
 try{
  const rows=[...form.querySelectorAll('[data-team-row]')];
  if(rows.length>30)throw Error('الحد الأقصى لفريق العمل 30 عضوًا');
  const items=[];
  for(const row of rows){
   const get=n=>row.querySelector('[name="'+n+'"]')?.value?.trim()||'';
   const item={id:row.dataset.id||crypto.randomUUID(),enabled:!!row.querySelector('[name="enabled"]')?.checked,sort_order:Number(get('sort_order'))||0};
   for(const key of ['name_ar','name_en','role_ar','role_en','image_url','link_url'])item[key]=get(key).slice(0,350);
   if(!item.name_ar)throw Error('اكتب الاسم بالعربي لكل عضو في الفريق');
   const file=row.querySelector('[name="team_file"]')?.files?.[0];
   if(file)item.image_url=cmsConnected?await uploadImage(file,'team'):await storeStudioPreviewMedia(file,'image');
   if(item.image_url&&!safeStudioUrl(item.image_url)&&!(isStudioPreviewHost()&&isPreviewMediaRef(item.image_url)))throw Error('رابط صورة عضو الفريق غير صحيح');
   if(item.link_url&&!safeStudioUrl(item.link_url))throw Error('رابط أعمال عضو الفريق غير صحيح');
   items.push(item);
  }
  const next={team_enabled:!!form.querySelector('[name="team_enabled"]')?.checked,team:items};
  // Replace the old team+video settings with team-only content when saved;
  // existing team members and their image URLs are preserved.
  const content_ar={...(data.settings?.content_ar||{}),[STUDIO_KEY]:JSON.stringify(next)};
  const content_en={...(data.settings?.content_en||{})};
  for(const [key] of TEAM_COPY_FIELDS){
    const arField=form.elements.namedItem('ar_'+key),enField=form.elements.namedItem('en_'+key);
    if(!arField||!enField)throw Error('حقول نصوص الفريق غير ظاهرة في نموذج الحفظ');
    content_ar[key]=arField.value.trim().slice(0,500);
    content_en[key]=enField.value.trim().slice(0,500);
  }
  if(cmsConnected){
   const db=await getClient();
   const {data:updated,error}=await db.from('site_settings').update({content_ar,content_en}).eq('id',1).select().single();
   if(error)throw error;
   data.settings=updated;
  }else{
   data.settings={...data.settings,content_ar,content_en};
   saveDemo(data);
  }
  status.textContent=cmsConnected?'تم حفظ نصوص الفريق والأعضاء بنجاح. حدّث الموقع لمشاهدة التغيير.':'تم حفظ نصوص الفريق والأعضاء في نفس المتصفح التجريبي.';
  toast('تم حفظ فريق العمل');
 }catch(error){status.textContent='تعذر الحفظ: '+error.message;toast('تعذر الحفظ: '+error.message);}
 finally{if(button)button.disabled=false}
}

function renderPanel(){
  if(!data)return;
  const main=$('#adminMain'); if(!main) return;
  const body=({overview:renderOverview,content:renderContent,appearance:renderAppearance,settings:renderSettings,projects:()=>renderItems('projects'),media:renderMedia,tools:renderToolManager,legal:renderLegalPages,services:()=>renderItems('services'),testimonials:()=>renderItems('testimonials'),messages:renderMessages,future:renderFuture,team:renderTeam,communityReviews:()=>renderCommunityAdmin('communityReviews'),communityBrands:()=>renderCommunityAdmin('communityBrands'),notice:renderNoticeEditor})[tab]();
  main.innerHTML=`<header class="admin-heading v10-page-head"><div><span class="v10-page-path">Mo Design <span>/</span> مساحة العمل <span>/</span> ${esc(labels[tab])}</span><h1>${esc(labels[tab])}</h1><p>أدواتك ومحتواك وطلبات الشغل في مكان واحد.</p></div><div class="v10-page-actions"><span class="admin-badge">${cmsConnected?`<span class="v10-online-dot"></span> متصل`:'◌ وضع تجربة محلية'}</span><a href="./index.html" target="_blank" rel="noopener" class="admin-btn secondary">↗ شوف الموقع</a></div></header>${!cmsConnected?`<div class="admin-banner"><strong>وضع المعاينة المحلي:</strong> التعديلات تُحفظ على هذا المتصفح فقط، ويمكن لأي شخص فتح لوحة المعاينة. ليست لوحة إنتاج آمنة ولا قاعدة بيانات عامة. لبدء الإدارة الحقيقية فعّل Supabase واتبع ملف التعليمات.</div>`:''}${body}`;
  document.querySelectorAll('[data-tab]').forEach(el=>el.classList.toggle('active',el.dataset.tab===tab));
  if(tab==='media')void loadMedia();
  if(tab==='content' && openingTeamCopyFromLink){
    const group=document.getElementById('teamCopyGroup');
    if(group){group.open=true;requestAnimationFrame(()=>group.scrollIntoView({block:'center'}));}
  }
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
  if(table==='tools'||table==='service_pages'||table==='legal_pages')return {};
   if(table==='academy_categories')return {};
   if(table==='content'){
    const content_ar={...(data.settings?.content_ar||{})},content_en={...(data.settings?.content_en||{})};
    // Save only fields actually present in the editor, including the special
    // copyright/studio-year group excluded from copyGroup().
    for(const [key] of [...Object.values(CONTENT_GROUPS).flat(),...copyGroup(),
      ['hero_intro'],['hero_merged_role'],['hero_merged_description'],['hero_point_1'],['hero_point_2'],['hero_point_3'],
      ['portrait_copyright'],['hero_side'],['hero_year'],['footer_copyright']]){
      if(f.has('ar_'+key))content_ar[key]=get('ar_'+key);
      if(f.has('en_'+key))content_en[key]=get('en_'+key);
    }
    const section_visibility={...(data.settings?.section_visibility||{})};SECTIONS.forEach(([id])=>section_visibility[id]=f.has('section_'+id));
    return {content_ar,content_en,section_visibility,headline_ar:get('headline_ar'),headline_en:get('headline_en'),subheadline_ar:get('subheadline_ar'),subheadline_en:get('subheadline_en')};
  }
  if(table==='appearance'){
    const section_design=structuredClone(data.settings?.section_design||{});
    for(const [id] of DESIGN_SECTIONS){
      const current={...(section_design[id]||{})};
      current.enabled=get(id+'__enabled')==='1';
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
  if(table==='learning_items')return {image_captions:readMediaCaptions(form,'lesson'),text_style:{font:get('text_font')||'Alexandria',size:Math.max(14,Math.min(30,Number(get('text_size'))||17))},image_urls:get('image_urls'),content_type:get('content_type')==='article'?'article':'video',title_ar:get('title_ar'),title_en:get('title_en'),summary_ar:get('summary_ar'),summary_en:get('summary_en'),body_ar:get('body_ar'),body_en:get('body_en'),youtube_url:get('youtube_url'),video_url:get('video_url'),thumbnail_url:get('thumbnail_url'),resource_links:get('resource_links'),sort_order:Number(get('sort_order'))||0,is_published:f.has('is_published')};
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
  if(table==='projects'){const captions=readMediaCaptions(form,'gallery');const groups={};for(const page of SERVICE_PAGES)groups[page.slug]=[...form.querySelectorAll('[name="service_group_'+page.slug+'"]:checked')].map(x=>x.value);captions.__service_groups=groups;const category=PORTFOLIO_CATEGORIES.find(c=>c.id===get('category_id'))||PORTFOLIO_CATEGORIES[0];return {...common,gallery_captions:captions,text_style:{font:get('text_font')||'Alexandria',size:Math.max(14,Math.min(30,Number(get('text_size'))||17))},title_ar:get('title_ar'),title_en:get('title_en'),category_ar:category.ar,category_en:category.en,summary_ar:get('summary_ar'),summary_en:get('summary_en'),cover_style:get('cover_style'),image_url:get('image_url'),external_url:get('external_url'),featured:f.has('featured'),video_url:get('video_url'),gallery_urls:get('gallery_urls'),objective_ar:get('objective_ar'),objective_en:get('objective_en'),tools_used:get('tools_used'),youtube_url:get('youtube_url'),project_type:get('project_type'),slug:get('slug') || `project-${Date.now()}-${Math.random().toString(36).slice(2,7)}`};}
  return {...common,title_ar:get('title_ar'),title_en:get('title_en'),description_ar:get('description_ar'),description_en:get('description_en'),icon:get('icon')};
}
async function saveForm(form){
  const table=form.dataset.entity;
  if(busy){formStatus(form,"جاري حفظ طلب سابق، انتظر اكتماله.");return;} if(!form.checkValidity()){const invalid=form.querySelector(':invalid');formStatus(form,'لا يمكن الحفظ: راجع الحقل '+(invalid?.closest('label')?.textContent?.trim().slice(0,110)||invalid?.name||'حقل مطلوب')+'. افتح الإعدادات المتقدمة لو الحقل بداخلها.',true);invalid?.closest('details')?.setAttribute('open','');invalid?.focus();return;}
  let entry;
  try { entry=getFields(form,table); }
  catch(error){console.error('Mo Design: form preparation failed',error);formStatus(form,'تعذر تجهيز بيانات الحفظ: '+(error.message||'خطأ غير معروف')+'. احتفظ بالبيانات المفتوحة ولا تحدث الصفحة.',true);return;}
  const id=form.dataset.editId;
  const selectedLessonCategories=table==='learning_items'?[...form.querySelectorAll('[name="lesson_category"]:checked')].map(x=>x.value):[];
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
    if(imageCount>15){formStatus(form,`عدد الصور الإجمالي ${imageCount}، والمسموح 15 فقط. الصور المكتوبة كرابط تُحسب أيضًا. احذف الصور الزائدة قبل الحفظ.`,true);return;}
    if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.slug)){formStatus(form,'رابط المشروع غير صحيح. اتركه فارغًا ليتولد تلقائيًا أو اكتب حروف إنجليزية صغيرة وأرقام وشرطات فقط.',true);return;}
    if(entry.image_url && !(/^https:\/\//i.test(entry.image_url) || /^\.\/assets\/images\/[\w.-]+$/i.test(entry.image_url))) {toast('استخدم رابط HTTPS أو صورة من مجلد assets/images.');return;}
    if(entry.external_url && !/^https:\/\//i.test(entry.external_url)){toast('رابط المشروع يجب أن يبدأ بـ HTTPS');return;}
    if(entry.youtube_url && !/^https:\/\/(www\.)?(youtube\.com|youtu\.be|m\.youtube\.com)\//i.test(entry.youtube_url)){toast('حط رابط يوتيوب أو شورتس صحيح.');return;}
    if(entry.video_url && !/^https:\/\//i.test(entry.video_url)){toast('الفيديو يجب أن يكون برابط HTTPS');return;}
    if(entry.gallery_urls && !entry.gallery_urls.split(/\r?\n/).filter(Boolean).every(x=>/^https:\/\//i.test(x))){toast('كل صورة إضافية لازم تكون رابط HTTPS في سطر مستقل.');return;}
  }
  busy=true;
  const submitButton=form.querySelector('[data-direct-save],button[type="submit"]');if(submitButton){submitButton.disabled=true;submitButton.textContent='جاري الحفظ...';}
  formStatus(form,'جارٍ تجهيز البيانات للحفظ. لا تغلق الصفحة أثناء رفع الصور.');
  try {
    if(table==='academy_categories'){
      const old=getAcademyCategories(data.settings);
      const oldIds=new Set(old.map(x=>x.id));
      const used=new Set();
      const rows=[...form.querySelectorAll('[data-academy-category-row]')];
      if(rows.length>25)throw new Error('الحد الأقصى 25 قسم.');
      const categories=rows.map((row,i)=>{
       let id=row.dataset.categoryId;
       if(!id){id='category-'+Date.now().toString(36)+'-'+i;}
       if(used.has(id))throw new Error('معرّف قسم مكرر.');
       used.add(id);
       const arName=String(row.querySelector('[name="category_ar"]')?.value||'').trim();
       if(!arName)throw new Error('اكتب اسم القسم بالعربي.');
       return {id,ar:arName.slice(0,85),en:String(row.querySelector('[name="category_en"]')?.value||'').trim().slice(0,85),enabled:!!row.querySelector('[name="category_enabled"]')?.checked};
      });
      const memberships={};
      for(const row of form.querySelectorAll('[data-lesson-category-id]')){
       const id=row.dataset.lessonCategoryId;
       const previous=getAcademyMembership(data.settings)[id]||[];
       memberships[id]=[...new Set([...previous.filter(x=>!oldIds.has(x)&&!used.has(x)),...([...row.querySelectorAll('[data-category-membership]:checked')].map(x=>x.dataset.categoryMembership).filter(x=>used.has(x)))])];
      }
      const content_ar={...(data.settings?.content_ar||{}),[ACADEMY_CATEGORIES_KEY]:JSON.stringify(categories),[ACADEMY_MEMBERSHIP_KEY]:JSON.stringify(memberships)};
      const content_en={...(data.settings?.content_en||{})};
      for(const [key] of ACADEMY_TEXT_KEYS){content_ar[key]=String(form.elements.namedItem('ar_'+key)?.value||'').trim();content_en[key]=String(form.elements.namedItem('en_'+key)?.value||'').trim();}
      entry={content_ar,content_en};
    }
    if(table==='legal_pages'){
      const existing=legalPages(data.settings);const output=[];
      for(const [i,row] of [...form.querySelectorAll('[data-legal-row]')].entries()){
        const val=(root,n)=>String(root.querySelector('[name="'+n+'"]')?.value||'').trim();
        const ar=val(row,'legal_ar');if(!ar)throw new Error('اكتب اسم الصفحة بالعربي.');
        const id=row.dataset.legalId||('custom-'+Date.now().toString(36)+'-'+i);
        const previous=existing.find(p=>p.id===id)||{};
        const sections=[...row.querySelectorAll('[data-legal-section]')].map(sec=>({
          title_ar:val(sec,'legal_section_title_ar').slice(0,150),
          title_en:val(sec,'legal_section_title_en').slice(0,150),
          text_ar:val(sec,'legal_section_text_ar').slice(0,10000),
          text_en:val(sec,'legal_section_text_en').slice(0,10000)
        })).filter(x=>x.title_ar||x.title_en||x.text_ar||x.text_en);
        output.push({...previous,id,ar:ar.slice(0,100),en:val(row,'legal_en').slice(0,100),sections,enabled:!!row.querySelector('[name="legal_enabled"]')?.checked});
      }
      entry={content_ar:{...(data.settings?.content_ar||{}),[LEGAL_KEY]:JSON.stringify(output)}};
    }
    if(table==='service_pages'){
      const previous=serviceConfig(data.settings);
      const output=Object.fromEntries(Object.entries(previous).map(([slug,config])=>[slug,{...config}]));
      for(const row of form.querySelectorAll('[data-service-config]')){
        const slug=row.dataset.serviceConfig,old=previous[slug];
        const used=new Set();
        const categories=[...row.querySelectorAll('[data-simple-category]')].map((item,i)=>{
          const ar=String(item.querySelector('[name="cat_ar"]')?.value||'').trim().slice(0,75);
          const en=String(item.querySelector('[name="cat_en"]')?.value||'').trim().slice(0,75);
          if(!ar)return null;
          const priorId=item.dataset.categoryId;
          const prior=old.categories.find(c=>c.id===priorId);
          const id=prior?.id||('group-'+Date.now().toString(36)+'-'+i+'-'+Math.random().toString(36).slice(2,6));
          if(used.has(id))return null;used.add(id);
          return {id,ar,en,enabled:!!item.querySelector('[name="cat_enabled"]')?.checked};
        }).filter(Boolean);
        output[slug]={...old,ratio:row.querySelector('[name="sp_ratio"]')?.value||old.ratio,categories};
      }
      entry={content_ar:{...(data.settings?.content_ar||{}),[SERVICE_PAGE_KEY]:JSON.stringify(output)}};
    }
    if(table==='tools'){
      const rows=[...form.querySelectorAll('[data-admin-tool-row]')];
      if(rows.length>40)throw new Error('الحد الأقصى 40 أداة.');
      const output=[];
      for(const row of rows){
       const val=name=>String(row.querySelector('[name="'+name+'"]')?.value||'').trim();
       const name=val('tool_name');
       if(!name)throw new Error('اكتب اسم كل أداة أو احذف السطر الفارغ.');
       let image_url=val('tool_image');
       const file=row.querySelector('[name="tool_upload"]')?.files?.[0];
       if(file)image_url=await uploadImage(file,'general');
       if(image_url && !safeUrl(image_url))throw new Error('رابط صورة الأداة غير صحيح.');
       output.push({id:'tool-'+output.length,name:name.slice(0,100),ar:val('tool_ar').slice(0,250),en:val('tool_en').slice(0,250),image_url,enabled:!!row.querySelector('[name="tool_enabled"]')?.checked});
      }
      const content_ar={...(data.settings?.content_ar||{}),[TOOLS_CATALOG_KEY]:JSON.stringify(output)};
      entry={content_ar};
    }
    if(cmsConnected && table==='settings'){
      const file=form.querySelector('input[name="profile_file"]')?.files?.[0];
      if(file)entry.profile_image_url=await uploadImage(file,'general');
      for(const [fieldName,key] of [['logo_dark_file','logo_dark_url'],['logo_light_file','logo_light_url']]){
        const newLogo=form.querySelector(`input[name="${fieldName}"]`)?.files?.[0];
        if(newLogo)entry[key]=await uploadImage(newLogo,'general');
      }
    }
    if(cmsConnected && table==='learning_items'){
      const videoFile=form.querySelector('input[name="lesson_video_file"]')?.files?.[0];
      if(videoFile)entry.video_url=await uploadLearningVideo(videoFile);
      const thumbnail=form.querySelector('input[name="lesson_thumbnail_file"]')?.files?.[0];
      if(thumbnail)entry.thumbnail_url=await uploadImage(thumbnail,'learning');
      const lessonImages=[...(form.querySelector('[name="lesson_images_files"]')?.files||[])];
      if(lessonImages.length+String(entry.image_urls||'').split(/\r?\n/).filter(Boolean).length>15)throw new Error('الحد الأقصى للصور في الدرس 15 صورة. احذف صور قديمة أولًا.');
      const images=String(entry.image_urls||'').split(/\r?\n/).map(v=>v.trim()).filter(Boolean);
      const newlyUploaded=[];for(let i=0;i<lessonImages.length;i++){formStatus(form,`جاري رفع صورة الدرس ${i+1} من ${lessonImages.length}...`);const url=await uploadImage(lessonImages[i],'learning');images.push(url);newlyUploaded.push(url);}linkNewCaptions(entry,'lesson',lessonImages,newlyUploaded,'image_captions');
      entry.image_urls=images.join('\n');
    }
    if(cmsConnected && table==='appearance'){
      for(const [section] of DESIGN_SECTIONS){
        const file=form.querySelector(`input[name="${section}__cover_file"]`)?.files?.[0];
        if(file)entry.section_design[section].cover_url=await uploadImage(file,'general');
      }
    }
    if(cmsConnected && table==='projects'){
      const replacementVideo=form.querySelector('input[name="replace_project_video"]')?.files?.[0];
      if(replacementVideo){
        formStatus(form,'جاري رفع الفيديو الرئيسي البديل...');
        const previousMain=entry.video_url;
        const replacementUrl=await uploadLearningVideo(replacementVideo,'projects');
        entry.video_url=replacementUrl;
        const videos=Array.isArray(entry.gallery_captions?.__project_videos)?entry.gallery_captions.__project_videos:[];
        entry.gallery_captions.__project_videos=[...new Set([replacementUrl,...videos.filter(url=>url!==previousMain)])].slice(0,8);
      }
      const projectVideos=[...(form.querySelector('input[name="project_video_file"]')?.files||[])];
      if(projectVideos.length>4)throw new Error('الحد الأقصى 4 فيديوهات جديدة في كل عملية حفظ.');
      const existingVideos=Array.isArray(entry.gallery_captions?.__project_videos)?entry.gallery_captions.__project_videos:[];
      const newVideos=[];
      for(let i=0;i<projectVideos.length;i++){
       formStatus(form,'جاري رفع فيديو المشروع '+(i+1)+' من '+projectVideos.length+'...');
       newVideos.push(await uploadLearningVideo(projectVideos[i],'projects'));
      }
      if(newVideos.length){
       if(!entry.video_url)entry.video_url=newVideos[0];
       entry.gallery_captions.__project_videos=[...new Set([...existingVideos,...newVideos])].slice(0,8);
      }
      const file=form.querySelector('input[name="media_file"]')?.files?.[0];
      if(file)entry.image_url=await uploadImage(file,'projects');
      const images=[...(form.querySelector('input[name="gallery_files"]')?.files||[])];
      if(images.length+String(entry.gallery_urls||'').split(/\r?\n/).filter(Boolean).length>15)throw new Error('الحد الأقصى لصور المشروع 15 صورة. احذف صور قديمة أولًا.');
      if(images.length){
        const urls=(entry.gallery_urls||'').split(/\r?\n/).map(v=>v.trim()).filter(Boolean);
        const newlyUploaded=[];for(let i=0;i<images.length;i++){formStatus(form,`جاري رفع صورة المشروع ${i+1} من ${images.length}... لا تغلق الصفحة.`);const url=await uploadImage(images[i],'projects');urls.push(url);newlyUploaded.push(url);}linkNewCaptions(entry,'gallery',images,newlyUploaded,'gallery_captions');
        entry.gallery_urls=urls.join('\n');
      }
    }
    if(cmsConnected){
      formStatus(form,'اكتمل رفع الملفات، جاري تسجيل المشروع والبيانات في Supabase...');
      const db=await getClient(); let result;
      if(['settings','content','future','appearance','notice','tools','academy_categories','service_pages','legal_pages'].includes(table))result=await db.from('site_settings').update(entry).eq('id',1);
      else {
        const payload={...entry};
        if(id)payload.id=id;
        else if(table==='projects')payload.slug=entry.slug || `project-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
        result=table==='learning_items'?await db.from(table).upsert(payload).select('id').single():await db.from(table).upsert(payload);
      }
      if(result.error)throw result.error;
      if(table==='legal_pages'){
        const {data:verified,error:readError}=await db.from('site_settings').select('content_ar').eq('id',1).single();
        if(readError)throw new Error('الحفظ تم لكن التحقق من المحتوى فشل: '+readError.message);
        const expected=entry.content_ar?.[LEGAL_KEY];
        if(verified?.content_ar?.[LEGAL_KEY]!==expected)throw new Error('لم يتم تأكيد حفظ نصوص الصفحات في قاعدة البيانات. راجع صلاحيات الحفظ.');
      }
      if(table==='learning_items'){
        const savedId=String(result.data?.id||id||'');
        if(!savedId)throw new Error('تم حفظ المحتوى لكن تعذر معرفة رقمه لحفظ التصنيفات. افتح المحتوى من القائمة وحاول تاني.');
        form.dataset.editId=savedId;
        const allowed=new Set(getAcademyCategories(data.settings).map(c=>c.id));
        const memberships={...getAcademyMembership(data.settings),[savedId]:[...new Set(selectedLessonCategories.filter(cat=>allowed.has(cat)))]};
        const content_ar={...(data.settings?.content_ar||{}),[ACADEMY_MEMBERSHIP_KEY]:JSON.stringify(memberships)};
        const linked=await db.from('site_settings').update({content_ar}).eq('id',1);
        if(linked.error)throw new Error('المحتوى اتحفظ، لكن ربط التصنيفات فشل: '+linked.error.message+'. حاول تحفظ من نفس النموذج تاني.');
      }
      data=await getAdminContent();
    } else {
      if(table==='service_pages'||table==='tools'||table==='academy_categories'||table==='legal_pages')data.settings={...data.settings,...entry};
      else if(['settings','content','future','appearance','notice'].includes(table))data.settings={...data.settings,...entry};
      else if(id){const index=data[table].findIndex(x=>x.id===id);if(index!==-1)data[table][index]={...data[table][index],...entry};}
      else data[table].push({...entry,id:`local-${Date.now()}`,slug:`project-${Date.now()}`});
      saveDemo(data);
    }
    if(table==='content')cmsDirty=false;
    editing=null; renderPanel(); toast('تم حفظ التعديلات بنجاح ✓');
  } catch(error){console.error(error);const message=`تعذر الحفظ: ${error.message || 'خطأ غير معروف'}. البيانات ما زالت في النموذج، لا تحدث الصفحة.`;formStatus(form,message,true);toast(message);}
  finally{busy=false;if(submitButton?.isConnected){submitButton.disabled=false;submitButton.textContent=table==='projects'?'حفظ مشروع':table==='learning_items'?'حفظ المحتوى':'حفظ التعديلات';}}
}
async function deleteItem(table,id){
  if(!confirm('هل أنت متأكد من حذف هذا العنصر؟'))return;
  try{
    if(cmsConnected){const db=await getClient();const {error}=await db.from(table).delete().eq('id',id);if(error)throw error;data=await getAdminContent();}
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
function updateLessonGalleryCount(form){
 if(!form || form.dataset.entity!=='learning_items')return;
 const urls=String(form.querySelector('[name="image_urls"]')?.value||'').split(/\r?\n/).filter(line=>line.trim()).length;
 const files=form.querySelector('[name="lesson_images_files"]')?.files?.length||0;
 const total=urls+files;
 const label=form.querySelector('[data-lesson-gallery-count]');
 if(label){
  label.textContent='صور الدرس: '+total+' من 15 ('+urls+' روابط + '+files+' ملفات)';
  label.style.color=total>15?'#ff8a8a':'';
 }
 if(total>15)formStatus(form,'إجمالي الصور '+total+' (روابط سابقة + صور جديدة)، والحد الأقصى 15. قلّل العدد ثم احفظ. لم تُحذف أي صور.',true);
 else {const status=form.querySelector('[data-save-status]');if(status?.textContent?.startsWith('إجمالي الصور'))status.hidden=true;}
}
function updateProjectGalleryCount(form){
 if(!form || form.dataset.entity!=='projects')return;
 const urls=String(form.querySelector('[name="gallery_urls"]')?.value||'').split(/\r?\n/).filter(line=>line.trim()).length;
 const files=form.querySelector('[name="gallery_files"]')?.files?.length||0;
 const total=urls+files;
 const label=form.querySelector('[data-project-gallery-count]');
 if(label){
   label.textContent='صور المعرض: '+total+' من 15 ('+urls+' روابط + '+files+' ملفات)';
   label.style.color=total>15?'#ff8a8a':'';
 }
 if(total>15)formStatus(form,'إجمالي الصور '+total+' (روابط سابقة + صور جديدة)، والحد الأقصى 15. قلّل العدد ثم احفظ. لم تُحذف أي صور.',true);
 else {const status=form.querySelector('[data-save-status]');if(status?.textContent?.startsWith('إجمالي الصور'))status.hidden=true;}
}
$('#adminApp').addEventListener('input',e=>{
 if(e.target.name==='gallery_urls')updateProjectGalleryCount(e.target.closest('form'));
 if(e.target.name==='image_urls')updateLessonGalleryCount(e.target.closest('form'));
});
$('#adminApp').addEventListener('change',e=>{
 if(e.target.name==='gallery_files')updateProjectGalleryCount(e.target.closest('form'));
 if(e.target.name==='lesson_images_files')updateLessonGalleryCount(e.target.closest('form'));
});
$('#adminApp').addEventListener('input',e=>{
  if(e.target.closest('#contentForm') && e.target.id!=='cmsCopySearch')markCmsDirty();
});
$('#adminApp').addEventListener('change',e=>{
  if(e.target.closest('#contentForm') && e.target.id!=='cmsCopySearch')markCmsDirty();
});
$('#adminApp').addEventListener('input',e=>{
  const target=e.target;
  if(target.id==='cmsCopySearch'){
    const normalizeQuery=v=>String(v||'').toLocaleLowerCase().replace(/[\u064b-\u065f\u0670]/g,'').replace(/[ـ]/g,'').replace(/[–—-]/g,' ').replace(/\s+/g,' ').trim();
    const q=normalizeQuery(target.value);let matches=0;
    document.querySelectorAll('.cms-editor-group').forEach(group=>{
      let found=0;
      group.querySelectorAll('.form-field').forEach(el=>{
        const input=el.querySelector('input,textarea,select');
        const searchText=[el.textContent,input?.value||'',input?.name||'',group.querySelector('summary')?.textContent||''].join(' ').toLocaleLowerCase();
        const normalized=normalizeQuery(searchText);
        const tokens=q.replace(/[+،,\/]/g,' ').split(/\s+/).filter(Boolean);
        const isCombinedLearn=tokens.some(t=>t==='اتعلم'||t==='تعلم')&&tokens.some(t=>t==='ابتكر');
        const isLearnField=isCombinedLearn&&['learn_big1','learn_big2'].some(k=>input?.name?.endsWith('_'+k));
        const ok=!q||normalized.includes(q)||tokens.every(t=>normalized.includes(t))||isLearnField||((q.includes('استوديو مو ديزاين')||q.includes('mo design'))&&['hero_side','hero_year'].some(k=>input?.name?.endsWith('_'+k)))||((q.includes('2026')||q.includes('حقوق'))&&['portrait_copyright','footer_copyright','hero_year'].some(k=>input?.name?.endsWith('_'+k)));
        el.hidden=!ok;if(ok)found++;
      });
      group.hidden=!!q&&!found;
      if(q&&found)group.open=true;
      matches+=found;
    });
    const results=document.querySelector('#cmsSearchResults');
    if(results)results.textContent=q?(matches?'نتائج البحث: '+matches+' حقل':'مفيش نتائج. جرّب كلمة تانية.'):'تقدر تبحث في أسماء الحقول ومحتواها.';
    return;
  }
  if(target.closest('#appearanceForm') && /__(dark_bg|dark_text|dark_accent|light_bg|light_text|light_accent|cover_url|cover_file|font|heading_size|body_size|padding|height|shade)$/.test(target.name||'')){
    const section=target.name.split('__')[0];refreshAppearancePreview(section);const flag=document.querySelector(`[name="${section}__enabled"]`);if(flag){flag.value='1';const label=flag.closest('.appearance-reset-bar')?.querySelector('.appearance-state');if(label)label.textContent='تغييرات جاهزة للحفظ — اضغط حفظ ألوان الأقسام';}
  }
});
$('#adminApp').addEventListener('click',e=>{
  if(communityAdminClick(e.target.closest('button')||e.target)){if(!e.target.closest('[data-community-brand-replace]'))renderPanel();return;}
  const teamShortcut=e.target.closest('[data-open-team-copy]');
  if(teamShortcut){
    const search=document.querySelector('#cmsCopySearch');
    if(search&&search.value){search.value='';search.dispatchEvent(new Event('input',{bubbles:true}));}
    const group=document.getElementById('teamCopyGroup');
    if(group){group.hidden=false;group.open=true;group.scrollIntoView({behavior:'smooth',block:'center'});}
    return;
  }
  const toggle=e.target.closest('[data-cms-groups]');
  if(!toggle)return;
  const open=toggle.dataset.cmsGroups==='open';
  document.querySelectorAll('.cms-editor-group:not([hidden])').forEach(group=>{group.open=open;});
});
$('#adminApp').addEventListener('click',async e=>{
  const rb=e.target.closest('[data-rich]');if(rb){
    const area=rb.closest('.cms-rich-wrap')?.querySelector('textarea');if(!area)return;
    const a=area.selectionStart,b=area.selectionEnd,selected=area.value.slice(a,b)||'النص';
    const out=rb.dataset.rich==='bold'?`**${selected}**`:rb.dataset.rich==='italic'?`*${selected}*`:rb.dataset.rich==='heading'?`## ${selected}`:`- ${selected}`;
    area.setRangeText(out,a,b,'select');area.focus();return;
  }
  const addTeam=e.target.closest('[data-team-add]');if(addTeam){const host=document.querySelector('#teamRows');if(host)host.insertAdjacentHTML('beforeend',teamRow({},host.children.length));return;}
  const removeTeam=e.target.closest('[data-team-remove]');if(removeTeam){removeTeam.closest('[data-team-row]')?.remove();return;}
  const nav=e.target.closest('button[data-tab]');
  if(nav){
    if(cmsDirty && !confirm('عندك تغييرات غير محفوظة في محرر الموقع. هل تريد مغادرة القسم وفقدان التعديلات؟'))return;
    cmsDirty=false;tab=nav.dataset.tab;editing=null;renderPanel();window.scrollTo({top:0,behavior:'smooth'});return;
  }
  if(e.target.closest('[data-add-academy-category]')){
    const host=document.querySelector('#academyCategoryRows');
    const id='category-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7);
    host?.insertAdjacentHTML('beforeend',academyCategoryRow({id,enabled:true}));
    document.querySelectorAll('[data-category-assignment]').forEach(box=>box.insertAdjacentHTML('beforeend','<label class="form-field checkbox"><input type="checkbox" data-category-membership="'+esc(id)+'">قسم جديد (غيّر اسمه فوق)</label>'));
    return;
   }
   if(e.target.closest('[data-remove-academy-category]')){const row=e.target.closest('[data-academy-category-row]');const id=row?.dataset.categoryId;row?.remove();if(id)document.querySelectorAll('[data-category-membership]').forEach(input=>{if(input.dataset.categoryMembership===id)input.closest('label')?.remove();});return;}
   if(e.target.closest('[data-add-catalog-tool]')){document.querySelector('#toolManagerRows')?.insertAdjacentHTML('beforeend',toolEditorRow({enabled:true}));return;}
   const moveTool=e.target.closest('[data-move-catalog-tool]');
   if(moveTool){const row=moveTool.closest('[data-admin-tool-row]'),host=row?.parentNode;if(!row||!host)return;
    if(moveTool.dataset.moveCatalogTool==='up'&&row.previousElementSibling)host.insertBefore(row,row.previousElementSibling);
    if(moveTool.dataset.moveCatalogTool==='down'&&row.nextElementSibling)host.insertBefore(row.nextElementSibling,row);
    return;
   }
   if(e.target.closest('[data-remove-catalog-tool]')){e.target.closest('[data-admin-tool-row]')?.remove();return;}
   const deleteMedia=e.target.closest('[data-media-delete]');
  if(deleteMedia){
    if(!cmsConnected || deleteMedia.disabled)return;
    const path=deleteMedia.dataset.mediaDelete||'';
    // Only files currently returned by the authenticated media library can be removed.
    if(!mediaCache.some(x=>x.folder+'/'+x.name===path))return;
    const db=await getClient();
    const url=db.storage.from('portfolio-media').getPublicUrl(path).data.publicUrl;
    // Look through all loaded CMS records to prevent deleting an in-use image.
    const referenced=JSON.stringify({
      settings:data.settings||{},
      projects:data.projects||[],
      learning_items:data.learning_items||[],
      services:data.services||[],
      testimonials:data.testimonials||[]
    }).includes(url);
    if(referenced){toast('الصورة مستخدمة حاليًا في محتوى الموقع. غيّرها من القسم المرتبط أولًا ثم احذفها.');return;}
    if(!confirm('تحذف الصورة نهائيًا من مكتبة Supabase؟ الإجراء لا يمكن التراجع عنه.'))return;
    deleteMedia.disabled=true;deleteMedia.textContent='جارٍ الحذف...';
    try{
      const {error}=await db.storage.from('portfolio-media').remove([path]);
      if(error)throw error;
      toast('تم حذف الصورة من المكتبة ✓');
      await loadMedia();
    }catch(error){toast('تعذّر حذف الصورة: '+(error.message||'تحقق من صلاحيات Storage'));deleteMedia.disabled=false;deleteMedia.textContent='حذف الصورة';}
    return;
  }
  const copyBtn=e.target.closest('[data-copy-url]');if(copyBtn){try{await navigator.clipboard.writeText(copyBtn.dataset.copyUrl);toast('تم نسخ الرابط ✓');}catch{toast('تعذر نسخ الرابط');}return;}
  const btn=e.target.closest('button[data-action]');if(!btn)return;
  const {action,id}=btn.dataset;
  if(action==='resetAppearance'){
    const section=btn.dataset.section;
    if(!DESIGN_SECTIONS.some(([key])=>key===section))return;
    const form=document.getElementById('appearanceForm');
    if(!form)return;
    if(!confirm('تحضير إعادة التصميم الأصلي لهذا القسم؟ التغيير مش هيظهر على الموقع إلا بعد الضغط على حفظ ألوان الأقسام.'))return;
    const defaults={dark_bg:'#10121a',dark_text:'#f4f4f5',dark_accent:'#c6fa8a',light_bg:'#f7f5ef',light_text:'#172026',light_accent:'#39671a',cover_url:'',font:'',heading_size:'0',body_size:'0',padding:'90',height:'0',shade:'0.7',enabled:'0'};
    for(const [key,value] of Object.entries(defaults)){
      const input=form.elements.namedItem(section+'__'+key);
      if(input)input.value=value;
    }
    refreshAppearancePreview(section);
    const label=btn.closest('.appearance-reset-bar')?.querySelector('.appearance-state');
    if(label)label.textContent='إعادة التصميم الأصلي جاهزة — اضغط حفظ ألوان الأقسام لتطبيقها.';
    toast('إعادة الضبط جاهزة. لن يتغير الموقع إلا بعد الضغط على حفظ. ✓');
    return;
  }
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
  if(action==='togglepublish' && cmsConnected){
    const [table,itemId]=id.split('|');const item=(data[table]||[]).find(x=>x.id===itemId);
    if(!item)return;
    try{const db=await getClient();const {error}=await db.from(table).update({is_published:!item.is_published}).eq('id',itemId);if(error)throw error;data=await getAdminContent();renderPanel();toast(item.is_published?'تم إخفاء العنصر':'تم نشر العنصر');}catch(e){toast('تعذر التعديل: '+e.message)}
  }
  if(action==='delete'){const [table,itemId]=id.split('|');await deleteItem(table,itemId);}
  if(action==='markread')await markRead(id);
  if(['archiveInquiry','restoreInquiry','deleteInquiry'].includes(action) && cmsConnected){
    const message=(data.messages||[]).find(m=>String(m.id)===String(id));
    if(!message)return;
    const removing=action==='deleteInquiry';
    if(removing && !confirm('حذف طلب العميل نهائيًا؟ لا يمكن استرجاع الرسالة بعد الحذف.'))return;
    if(!removing && !confirm(action==='archiveInquiry'?'نقل الطلب إلى الأرشيف؟':'إلغاء أرشفة الطلب؟'))return;
    btn.disabled=true;
    try{
      const db=await getClient();
      const result=removing
        ?await db.from('inquiries').delete().eq('id',id)
        :await db.from('inquiries').update({status:action==='archiveInquiry'?'archived':'reviewing'}).eq('id',id);
      if(result.error)throw result.error;
      data.messages=removing?data.messages.filter(m=>String(m.id)!==String(id)):
        data.messages.map(m=>String(m.id)===String(id)?{...m,status:action==='archiveInquiry'?'archived':'reviewing'}:m);
      renderPanel();
      toast(removing?'تم حذف الطلب':'تم تحديث أرشفة الطلب');
    }catch(error){btn.disabled=false;toast('تعذر تحديث الطلب: '+error.message);}
    return;
  }
  if(action==='savenote' && cmsConnected){try{const db=await getClient();const notes=document.querySelector(`[data-inquiry-note="${id}"]`)?.value||'';const {error}=await db.from('inquiries').update({internal_notes:notes.trim().slice(0,2000)}).eq('id',id);if(error)throw error;toast('تم حفظ ملاحظات الطلب');}catch(error){toast('تعذر حفظ الملاحظة: '+error.message);}}
  if(action==='export')exportDemo();
  if(action==='logout'){const db=await getClient();await db.auth.signOut();currentUser=null;data=null;renderLogin();}
});
$('#adminApp').addEventListener('change',async e=>{
  const ctl=e.target.closest('[data-message-status]');
  if(!ctl || !cmsConnected)return;
  try{const db=await getClient();const {error}=await db.from('inquiries').update({status:ctl.value}).eq('id',ctl.dataset.messageStatus);if(error)throw error;data.messages=(data.messages||[]).map(m=>String(m.id)===String(ctl.dataset.messageStatus)?{...m,status:ctl.value}:m);renderPanel();toast('تم تحديث حالة الطلب والعداد');}catch(error){toast('تعذر تعديل الحالة: '+error.message);}
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
$('#adminApp').addEventListener('change',e=>{if(e.target.matches('[name="gallery_files"],[name="lesson_images_files"]'))refreshNewCaptionInputs(e.target);});
$('#adminApp').addEventListener('change',e=>{
 if(e.target.matches('#inboxFilter')){
  const q=($('#inboxSearch')?.value||'').trim().toLowerCase(), status=e.target.value;
  document.querySelectorAll('.inbox-item').forEach(item=>item.hidden=!!(q&&!item.dataset.search.includes(q) || status&&item.dataset.status!==status));
 }
});
$('#adminApp').addEventListener('invalid',e=>{
 const form=e.target.closest('form[data-entity]');
 if(form)formStatus(form,'الحفظ لم يبدأ بسبب حقل غير صحيح: '+(e.target.closest('label')?.textContent?.trim().slice(0,120)||e.target.name||'حقل مطلوب'),true);
},true);
// A direct click ensures the editor save handler runs even when the browser blocks native form submission.
$('#adminApp').addEventListener('click',async e=>{
 const button=e.target.closest('[data-direct-save]');
 if(!button)return;
 e.preventDefault();
 const form=button.closest('form[data-entity]');
 if(!form)return;
 formStatus(form,'تم استقبال الضغط على حفظ. جاري مراجعة الحقول والملفات...');
 await saveForm(form);
});
$('#adminApp').addEventListener('submit',async e=>{
  e.preventDefault();
  const form=e.target;
  if(form.id==='teamForm'){await saveTeamForm(form);return;}
  if(['communityBrandForm','communityBrandVisibilityForm','communityBrandReplaceForm'].includes(form.id)){await communityAdminSubmit(form);renderPanel();return;}
  if(form.id==='mediaUploadForm'){
    if(!cmsConnected)return;
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
// Never leave the admin on an indefinite initial loading screen if Supabase/CDN is slow.
const adminTimeout=(promise,ms,label)=>Promise.race([promise,new Promise((_,reject)=>setTimeout(()=>reject(new Error(label)),ms))]);
async function init(){
  if(!cmsConnected){baseShell();renderPanel();refreshAdminLogos();return;}
  try{
    currentUser=await adminTimeout(adminAuthenticated(),14000,'تأخر الاتصال بخدمة تسجيل الدخول.');
    if(currentUser){
      data=await adminTimeout(getAdminContent(),18000,'تأخر تحميل بيانات لوحة التحكم.');
      baseShell();renderPanel();refreshAdminLogos();
    }else renderLogin();
  }catch(e){
    console.error('Admin startup:',e);
    renderLogin('تعذر إكمال تحميل لوحة الإدارة: '+(e.message||'خطأ غير معروف')+' يمكنك تحديث الصفحة وإعادة المحاولة. لم تُحذف أي بيانات.');
  }
}
init();
