import {connected,getClient} from './api.js';
const dialog=document.getElementById('moLiveReviewDialog');
const form=document.getElementById('moLiveReviewForm');
const status=document.getElementById('moLiveReviewStatus');
const preview=location.hostname.endsWith('.pages.dev');
document.getElementById('moWriteReview')?.addEventListener('click',()=>{status.textContent='';dialog.showModal()});
document.getElementById('moLiveReviewClose')?.addEventListener('click',()=>dialog.close());
form?.addEventListener('submit',async event=>{
 event.preventDefault();if(!form.reportValidity())return;
 const f=new FormData(form);if(f.get('website'))return;
 const name=String(f.get('name')||'').trim(),quote=String(f.get('text')||'').trim();
 if(name.length<2||quote.length<12||!f.get('consent')){status.textContent='راجع الاسم والرأي والموافقة.';return}
 const trainee=f.get('type')==='trainee';
 const row={author_ar:name,author_en:name,job_ar:trainee?'متدرب · من الموقع':'عميل · من الموقع',job_en:trainee?'Learner review · submitted':'Client review · submitted',quote_ar:quote,quote_en:quote,rating:Math.max(1,Math.min(5,Number(f.get('rating'))||5))};
 const button=form.querySelector('button[type="submit"]');button.disabled=true;status.textContent='جارٍ إرسال التقييم...';
 try{
  if(preview){
   const key='mo_design_preview_submitted_reviews_v1';
   const list=JSON.parse(localStorage.getItem(key)||'[]');
   list.unshift({...row,id:crypto.randomUUID(),created_at:new Date().toISOString(),is_verified:false,is_published:false});
   localStorage.setItem(key,JSON.stringify(list.slice(0,100)));
   status.textContent='تم حفظ التقييم للتجربة في نفس المتصفح فقط، ولم يصل لقاعدة البيانات الرسمية.';
  }else{
   if(!connected)throw new Error('قاعدة بيانات التقييمات غير متصلة');
   const db=await getClient();
   const {error}=await db.from('testimonials').insert(row);
   if(error)throw new Error('استقبال التقييمات يحتاج تفعيل صلاحية المراجعات الآمنة في Supabase.');
   status.textContent='تم إرسال التقييم للمراجعة. مش هيظهر إلا بعد الموافقة.';
  }
  form.reset();
 }catch(error){status.textContent=error.message||'تعذر إرسال التقييم. حاول تاني.'}
 finally{button.disabled=false}
});