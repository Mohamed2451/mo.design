// Flexible academy categories and their item assignments, stored in site_settings.
// Built-in filters are video/article; custom filters can be created without SQL.
export const ACADEMY_CATEGORIES_KEY='academy_categories_json';
export const ACADEMY_MEMBERSHIP_KEY='academy_memberships_json';
export const ACADEMY_TEXT_KEYS=[
 ['academy_page_heading','عنوان صفحة المعرفة للجميع','المعرفة للجميع','Learning for everyone'],
 ['academy_page_intro','وصف صفحة المعرفة للجميع','دروس ومقالات وفيديوهات عن التصميم والمونتاج والذكاء الاصطناعي.','Articles and videos about design, editing and AI.'],
 ['academy_filter_all','زر كل المحتوى','كل المحتوى','All content'],
 ['academy_filter_videos','زر الفيديوهات','فيديوهات','Videos'],
 ['academy_filter_articles','زر المقالات','مقالات','Articles'],
 ['academy_back','زر العودة للموقع','↗ العودة للموقع','↗ Back to site'],
 ['academy_no_content','رسالة عدم وجود محتوى','مفيش محتوى منشور في القسم ده حاليًا.','No published content in this category yet.'],
 ['academy_loading','رسالة التحميل','جاري تحميل المحتوى...','Loading content...'],
 ['academy_error','رسالة تعذر التحميل','تعذر تحميل المحتوى. حاول تفتح الصفحة تاني.','Content could not be loaded. Please try again.']
];
export function getAcademyCategories(settings){
 const raw=settings?.content_ar?.[ACADEMY_CATEGORIES_KEY];
 if(typeof raw!=='string')return [];
 try{const items=JSON.parse(raw);return Array.isArray(items)?items.slice(0,25).filter(x=>x&&typeof x==='object'&&/^[a-z0-9-]{1,80}$/.test(String(x.id||''))).map(x=>({id:String(x.id),ar:String(x.ar||'').slice(0,85),en:String(x.en||'').slice(0,85),enabled:x.enabled!==false})).filter(x=>x.ar||x.en):[];}
 catch{return []}
}
export function getAcademyMembership(settings){
 const raw=settings?.content_ar?.[ACADEMY_MEMBERSHIP_KEY];if(typeof raw!=='string')return {};
 try{const obj=JSON.parse(raw);if(!obj||typeof obj!=='object'||Array.isArray(obj))return {};
 return Object.fromEntries(Object.entries(obj).slice(0,500).map(([id,groups])=>[id,Array.isArray(groups)?groups.filter(x=>typeof x==='string').slice(0,25):[]]));}
 catch{return {}}
}
export function academyText(settings,key,lang){
 const overrides=settings?.[lang==='ar'?'content_ar':'content_en']||{};
 const entry=ACADEMY_TEXT_KEYS.find(row=>row[0]===key);
 return overrides[key]??(entry?(lang==='ar'?entry[2]:entry[3]):'');
}
