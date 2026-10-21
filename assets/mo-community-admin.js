import {readCommunity,writeCommunity,htmlEscape as e,validHttps} from './mo-community-store.js';
import {storeStudioPreviewMedia,isPreviewMediaRef} from './studio-preview-media.js';
export function renderCommunityAdmin(tab){
 const data=readCommunity();
 if(tab==='communityReviews')return '<section class="admin-panel"><h2>تقييمات العملاء والمتدربين — انتظار المراجعة</h2><p class="admin-note">محاكاة داخل متصفح المعاينة فقط: أي تقييم جديد يبقى معلّقًا حتى توافق عليه. النسخة الحقيقية متعددة المستخدمين تحتاج جدولًا وسياسات RLS آمنة قبل النشر.</p><div class="admin-rows">'+(data.reviews.length?data.reviews.slice().reverse().map(x=>'<div class="mo-community-row"><div><strong>'+e(x.name)+'</strong><small>'+e(x.type==='client'?'عميل':'متدرب')+' · '+e(x.subject||'')+' · '+e(x.rating)+'/5 نجوم · '+e(x.status==='pending'?'في انتظار المراجعة':x.status==='approved'?'معتمد':'مرفوض')+'</small><p>'+e(x.text)+'</p></div><div class="mo-community-actions">'+(x.status==='pending'?'<button class="admin-btn" data-community-review="'+e(x.id)+'" data-community-decision="approved">موافقة</button><button class="admin-btn secondary" data-community-review="'+e(x.id)+'" data-community-decision="rejected">رفض</button>':x.status==='approved'?'<button class="admin-btn secondary" data-community-review="'+e(x.id)+'" data-community-decision="rejected">إخفاء</button>':'<button class="admin-btn secondary" data-community-review="'+e(x.id)+'" data-community-decision="approved">موافقة</button>')+'<button class="admin-btn secondary" data-community-delete-review="'+e(x.id)+'">حذف</button></div></div>').join(''):'<p class="admin-empty">لا توجد تقييمات مرسلة حتى الآن.</p>')+'</div></section>';
 if(tab==='communityBrands')return '<section class="admin-panel"><h2>الشركات والبراندات</h2><p class="admin-note">ضيف أسماء وشعارات الجهات اللي تعاملت معاها فعلًا. الشريط مخفي افتراضيًا؛ يمكنك تفعيله أو إيقافه في أي وقت. الشعارات اختيارية.</p><form id="communityBrandVisibilityForm" class="mo-community-form"><label class="cms-toggle"><input type="checkbox" name="visible" '+(data.brands_visible?'checked':'')+'> إظهار شريط البراندات أسفل قسم «شغلك بيمشي إزاي؟»</label><button type="submit" class="admin-btn">حفظ حالة الشريط</button></form><form id="communityBrandForm" class="mo-community-form"><h3>إضافة براند</h3><label>اسم البراند (اختياري مع الشعار)<input name="name" maxlength="100" placeholder="اسم شركة حقيقية"></label><label>رابط شعار HTTPS (اختياري)<input type="url" name="logo" placeholder="https://..."></label><label>أو ارفع صورة الشعار من جهازك<input type="file" name="brand_file" accept="image/jpeg,image/png,image/webp,image/avif"></label><button type="submit" class="admin-btn">إضافة البراند</button><p class="admin-note">يكفي الاسم أو الشعار. صور المعاينة تُحفظ داخل نفس المتصفح.</p></form><div class="admin-rows">'+(data.brands.length?data.brands.map(x=>'<div class="mo-community-row"><div><strong>'+e(x.name)+'</strong><small>'+e(x.enabled?'ظاهر':'مخفي')+' · '+(x.logo?'له شعار':'بدون شعار')+'</small></div><div class="mo-community-actions"><button class="admin-btn secondary" data-community-brand-toggle="'+e(x.id)+'">'+(x.enabled?'إخفاء':'إظهار')+'</button><button class="admin-btn secondary" data-community-brand-edit="'+e(x.id)+'">تعديل</button><button class="admin-btn secondary" data-community-brand-delete="'+e(x.id)+'">حذف</button></div></div>').join(''):'<p class="admin-empty">لسه مفيش براندات مضافة.</p>')+'</div></section>';
 return '';
}
export function communityAdminClick(button){
 const review=button.closest('[data-community-review]'),dropReview=button.closest('[data-community-delete-review]');
 const edit=button.closest('[data-community-brand-edit]'),toggle=button.closest('[data-community-brand-toggle]'),drop=button.closest('[data-community-brand-delete]');
 if(!review&&!dropReview&&!edit&&!toggle&&!drop)return false;
 const data=readCommunity();
 if(review){const x=data.reviews.find(v=>v.id===review.dataset.communityReview);if(x)x.status=review.dataset.communityDecision;}
 if(dropReview)data.reviews=data.reviews.filter(v=>v.id!==dropReview.dataset.communityDeleteReview);
 if(toggle){const x=data.brands.find(v=>v.id===toggle.dataset.communityBrandToggle);if(x)x.enabled=!x.enabled;}
 if(edit){const x=data.brands.find(v=>v.id===edit.dataset.communityBrandEdit);if(x){const name=prompt('اسم البراند',x.name);if(name===null)return true;const logo=prompt('رابط الشعار HTTPS — اتركه فارغًا بدون شعار',x.logo||'');if(logo===null)return true;if((!name.trim()&&!logo.trim())||(logo.trim()&&!validHttps(logo.trim())&&!isPreviewMediaRef(logo.trim()))){alert('راجع الاسم ورابط الصورة');return true}x.name=name.trim().slice(0,100);x.logo=isPreviewMediaRef(logo.trim())?logo.trim():validHttps(logo.trim());}}
 if(drop)data.brands=data.brands.filter(v=>v.id!==drop.dataset.communityBrandDelete);
 writeCommunity(data);return true;
}
export async function communityAdminSubmit(form){
 if(!['communityBrandVisibilityForm','communityBrandForm'].includes(form.id))return false;
 const data=readCommunity();
 if(form.id==='communityBrandVisibilityForm')data.brands_visible=form.elements.namedItem('visible').checked;
 else {
  const f=new FormData(form),name=String(f.get('name')||'').trim(),link=String(f.get('logo')||'').trim(),file=form.querySelector('[name="brand_file"]')?.files?.[0];
  if(data.brands.length>=50||(!name&&!link&&!file)||(link&&!validHttps(link))){alert('لازم اسم أو صورة شعار صحيحة، أو وصلت للحد الأقصى');return true}
  let logo=validHttps(link);
  if(file){try{logo=await storeStudioPreviewMedia(file,'image')}catch(error){alert(error.message);return true}}
  data.brands.push({id:crypto.randomUUID(),name:name.slice(0,100),logo,enabled:true});
 }
 writeCommunity(data);return true;
}
