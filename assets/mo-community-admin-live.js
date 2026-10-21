const safe=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function brandRows(settings){
 try{const value=JSON.parse(settings?.content_ar?.mo_public_brands||'[]');return Array.isArray(value)?value.slice(0,40):[]}catch{return []}
}
export function renderBrandManager(settings){
 const rows=brandRows(settings);
 return `<section class="admin-panel mo-brand-admin" id="moPublicBrandsPanel">
 <header class="mo-brand-admin-head"><div><span class="mo-brand-admin-kicker">MO DESIGN / COLLABORATIONS</span><h2>الشركات والبراندات</h2><p>ارفع صورة الشعار من جهازك. اسم البراند اختياري، وتقدر تظهر أو تخفي أي براند.</p></div><span class="mo-brand-admin-total">${rows.filter(x=>x.enabled!==false).length} ظاهر</span></header>
 <form id="moPublicBrandForm" class="mo-brand-admin-form">
 <div class="mo-brand-admin-form-top"><h3>إضافة براند جديد</h3><span>اسم أو صورة، واحد منهم على الأقل</span></div>
 <div class="mo-brand-admin-form-grid">
 <label class="mo-brand-admin-field"><span>اسم البراند (اختياري)</span><input name="brand_name" maxlength="100" placeholder="اسم الشركة أو البراند"></label>
 <label class="mo-brand-admin-field"><span>رابط الشعار (اختياري)</span><input name="brand_url" type="url" dir="ltr" placeholder="https://example.com/logo.png"></label>
 <label class="mo-brand-admin-file"><span class="mo-brand-admin-file-icon">↑</span><span class="mo-brand-admin-file-text"><strong>رفع صورة الشعار من الجهاز</strong><small>PNG / JPEG / WebP / AVIF — بحد أقصى 8 MB</small></span><input type="file" name="brand_file" accept="image/png,image/jpeg,image/webp,image/avif"></label>
 </div><div class="mo-brand-admin-footer"><button type="submit" class="admin-btn">+ إضافة البراند</button><p data-brand-status role="status"></p></div></form>
 <div class="mo-brand-admin-list-title"><h3>الشركات المضافة</h3><span>${rows.length} براند</span></div>
 <div class="mo-brand-admin-grid">${rows.length?rows.map((x,k)=>`<article class="mo-brand-admin-tile"><div class="mo-brand-admin-image">${x.logo?'<img '+(String(x.logo).startsWith('preview-media:')?'data-preview-logo="'+safe(x.logo)+'"':'src="'+safe(x.logo)+'"')+' alt="'+safe(x.name||'شعار البراند')+'" loading="lazy">':'<span>'+safe((x.name||'م').slice(0,2))+'</span>'}</div><strong>${safe(x.name||'شعار بدون اسم')}</strong><span class="mo-brand-admin-state">${x.enabled===false?'مخفي':'ظاهر'}</span><div class="mo-brand-admin-tile-actions"><button type="button" class="admin-btn secondary" data-public-brand-toggle="${k}">${x.enabled===false?'إظهار':'إخفاء'}</button><button type="button" class="admin-btn secondary" data-public-brand-delete="${k}">حذف</button></div></article>`).join(''):'<div class="mo-brand-admin-empty">لسه مفيش براندات. ارفع أول شعار من فوق.</div>'}</div>
 </section>`;
}
export async function saveBrandList(db,settings,rows){
 const content_ar={...(settings.content_ar||{}),mo_public_brands:JSON.stringify(rows)};
 const {data,error}=await db.from('site_settings').update({content_ar}).eq('id',1).select().single();
 if(error)throw error;
 return data;
}

export async function hydrateBrandAdminImages(root){
 if(!location.hostname.endsWith('.pages.dev'))return;
 const {resolveStudioPreviewMedia}=await import('./studio-preview-media.js');
 for(const img of root.querySelectorAll('[data-preview-logo]')){
  try{const url=await resolveStudioPreviewMedia(img.dataset.previewLogo);
   if(url)img.src=url;else img.alt='أعد رفع الشعار';
  }catch{img.alt='تعذّر تحميل الشعار'}
 }
}
