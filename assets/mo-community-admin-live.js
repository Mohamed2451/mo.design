const safe=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function brandRows(settings){
 try{const value=JSON.parse(settings?.content_ar?.mo_public_brands||'[]');return Array.isArray(value)?value.slice(0,40):[]}catch{return []}
}
export function renderBrandManager(settings){
 const rows=brandRows(settings);
 return '<section class="admin-panel" id="moPublicBrandsPanel"><h2>الشركات والبراندات — الشريط المتحرك</h2><p class="admin-note">رفع الشعار هنا ينشره في مكتبة صور الموقع الحقيقية. الاسم اختياري مع الشعار. لا يتم نقل صور المعاينة تلقائيًا. عنوان القسم يظهر دائمًا للزوار، والشعارات تظهر فور إضافة براندات مفعّلة.</p>'+
 '<form id="moPublicBrandForm" class="mo-public-brand-form">'+
 '<label>اسم الشركة (اختياري مع صورة)<input name="brand_name" maxlength="100" placeholder="اسم البراند"></label>'+
 '<label>ملف الشعار PNG / JPG / WebP / AVIF (اختياري مع الاسم)<input type="file" name="brand_file" accept="image/png,image/jpeg,image/webp,image/avif"></label>'+
 '<label>أو رابط صورة HTTPS<input type="url" name="brand_url" placeholder="https://..."></label>'+
 '<button type="submit" class="admin-btn">إضافة البراند</button><p role="status" data-brand-status></p></form>'+
 '<div class="admin-rows">'+(rows.length?rows.map((x,i)=>'<div class="admin-row" style="display:flex;align-items:center;gap:15px"><div style="flex:1">'+
 (x.logo?'<img src="'+safe(x.logo)+'" loading="lazy" style="max-height:55px;max-width:130px;object-fit:contain" alt="">':'')+
 '<strong>'+safe(x.name||'براند بدون اسم')+'</strong></div><button class="admin-btn secondary" data-public-brand-toggle="'+i+'">'+(x.enabled===false?'إظهار':'إخفاء')+'</button><button class="admin-btn secondary" data-public-brand-delete="'+i+'">حذف</button></div>').join(''):'<p class="admin-empty">لم تتم إضافة براندات حقيقية بعد.</p>')+'</div></section>';
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
