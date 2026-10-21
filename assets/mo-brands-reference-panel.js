import {isPreviewMediaRef,resolveStudioPreviewMedia} from './studio-preview-media.js';
const safe=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function brandRows(settings){
 try{const x=JSON.parse(settings?.content_ar?.mo_public_brands||'[]');return Array.isArray(x)?x.slice(0,40):[]}catch{return []}
}
export function renderBrandManager(settings){
 const rows=brandRows(settings);
 const on=settings?.content_ar?.mo_public_brands_visible!==false;
 return `<section class="admin-panel mo-ref-brands" id="moPublicBrandsPanel" dir="rtl">
 <header class="mo-ref-header"><h2>الشركات والبراندات</h2><p>ضيف أسماء وشعارات الجهات اللي تعاملت معاها فعلًا. الشريط مخفي افتراضيًا؛ ويمكنك تفعيله أو إيقافه في أي وقت. الشعارات اختيارية.</p></header>
 <form id="moPublicBrandsVisibilityForm" class="mo-ref-box mo-ref-visible">
  <label><input type="checkbox" name="visible" ${on?'checked':''}> <strong>إظهار شريط البراندات أسفل قسم «شغلك بيمشي إزاي؟»</strong></label>
  <div><button type="submit" class="admin-btn">حفظ حالة الشريط</button><p role="status" data-brand-visible-status></p></div>
 </form>
 <form id="moPublicBrandForm" class="mo-ref-box mo-ref-add">
  <h3>إضافة براند</h3>
  <label>اسم البراند (اختياري مع الشعار)<input name="brand_name" maxlength="100" placeholder="اسم شركة حقيقية"></label>
  <label>رابط شعار HTTPS (اختياري)<input type="url" name="brand_url" dir="ltr" placeholder="https://..."></label>
  <label>أو ارفع صورة الشعار من جهازك<input type="file" name="brand_file" accept="image/jpeg,image/png,image/webp,image/avif"></label>
  <button type="submit" class="admin-btn">إضافة البراند</button>
  <p data-brand-status role="status"></p>
  <p class="mo-ref-help">يكفي الاسم أو الشعار. صور المعاينة تُحفظ داخل نفس المتصفح وعلى نفس رابط المعاينة بالضبط. عند الانتقال لرابط معاينة أو جهاز آخر يلزم إعادة رفع الشعار. هذه ليست ملفات منشورة للعامة.</p>
 </form>
 <section class="mo-ref-box mo-ref-list"><h3>الشركات المضافة <small>(${rows.length})</small></h3><div class="mo-ref-brand-rows">${rows.length?rows.map((x,k)=>`<article class="mo-ref-brand-row">
 <div class="mo-ref-brand-art">${x.logo?'<img '+(isPreviewMediaRef(x.logo)?'data-preview-logo="'+safe(x.logo)+'"':'src="'+safe(x.logo)+'"')+' alt="'+safe(x.name||'شعار الشركة')+'">':'<span>'+safe((x.name||'م').slice(0,2))+'</span>'}</div>
 <div class="mo-ref-brand-info"><strong>${safe(x.name||'شعار بدون اسم')}</strong><small>${x.enabled===false?'مخفي':'ظاهر'} · ${x.logo?'له شعار':'بدون شعار'}</small></div>
 <div class="mo-ref-brand-actions"><button type="button" class="admin-btn secondary" data-public-brand-toggle="${k}">${x.enabled===false?'إظهار':'إخفاء'}</button><button type="button" class="admin-btn secondary" data-public-brand-delete="${k}">حذف</button></div>
 </article>`).join(''):'<p class="mo-ref-empty">لسه مفيش براندات مضافة.</p>'}</div></section>
 </section>`;
}
export async function hydrateBrandAdminImages(root){
 if(!location.hostname.endsWith('.pages.dev'))return;
 for(const img of root.querySelectorAll('[data-preview-logo]')){
  try{const url=await resolveStudioPreviewMedia(img.dataset.previewLogo);if(url)img.src=url;else img.alt='أعد رفع الشعار'}catch{img.alt='الشعار غير متاح'}
 }
}
export async function saveBrandList(db,settings,rows){
 const content_ar={...(settings.content_ar||{}),mo_public_brands:JSON.stringify(rows)};
 const {data,error}=await db.from('site_settings').update({content_ar}).eq('id',1).select().single();
 if(error)throw error;return data;
}
export async function saveBrandVisibility(db,settings,visible){
 const content_ar={...(settings.content_ar||{}),mo_public_brands_visible:Boolean(visible)};
 const {data,error}=await db.from('site_settings').update({content_ar}).eq('id',1).select().single();
 if(error)throw error;return data;
}
