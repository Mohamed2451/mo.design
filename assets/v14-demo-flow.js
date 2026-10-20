/* MO ACADEMY V14 — isolated, fully interactive demo workflow.
   Browser-only simulation. No real identity verification, payment, upload, enrollment,
   protected content or Supabase writes. Do not deploy this as a production backend. */
(function(){
'use strict';
const M=window.MoV14;
if(!M)return;
const KEY='mo_design_v14_learning_demo_v2';
const seededLessons={
 'demo-course-motion':[
  {id:'motion-1',titleAr:'01 — إزاي تحوّل فكرة إلى Reel؟',titleEn:'01 — From idea to Reel',bodyAr:'الريل الناجح بيبدأ بهدف واضح: مين الجمهور؟ إيه المشكلة أو الرغبة؟ وإيه الفعل المطلوب بعد المشاهدة؟\n\nقسّم الفيديو إلى 3 أجزاء: Hook في أول ثانيتين، عرض الفكرة بوضوح، ثم CTA بسيط. مثال: إعلان لمقهى يبدأ بصوت ماكينة القهوة، بعدها اللقطات السريعة، وينتهي بظهور اسم المكان.',bodyEn:'Start with a clear goal: audience, need, desired action. Plan three beats: a hook in the first two seconds, the main idea and a simple call to action. Example: a coffee ad starts with the espresso sound and finishes on the brand.'},
  {id:'motion-2',titleAr:'02 — ترتيب اللقطات والإيقاع',titleEn:'02 — Shots and rhythm',bodyAr:'قبل المونتاج اكتب قائمة لقطات: لقطة واسعة للمكان، لقطة متوسطة للمنتج، ولقطة قريبة للتفاصيل.\n\nابدأ بتجميع اللقطات على Timeline، واحذف أي لحظة ملهاش وظيفة. خلي القطع على الحركة أو الإيقاع، بس من غير ما يبقى كل تأثير لمجرد الزينة.',bodyEn:'Plan wide, medium and close-up shots. Assemble them on the timeline, remove unnecessary moments and cut on motion or sound. Use transitions only where they communicate something.'},
  {id:'motion-3',titleAr:'03 — الصوت والألوان والعناوين',titleEn:'03 — Sound, color and titles',bodyAr:'خلي الصوت واضح وما يغطيش على الكلام. اعمل موازنة للسطوع والتباين بين اللقطات. استخدم عنوانين أو ثلاثة على الأكثر، وخليهم مقروئين على الموبايل.\n\nاختبار سريع: شوف الفيديو من غير صوت؛ هل الرسالة لسه واضحة؟',bodyEn:'Balance dialogue and music, match exposure between shots, and keep titles readable on a phone. Watch your cut with sound muted: is the story still clear?'},
  {id:'motion-4',titleAr:'04 — المشروع النهائي والتصدير',titleEn:'04 — Final project and export',bodyAr:'اعمل Reel مدته 15 ثانية لمنتج تخيلي. البداية لازم تشد الانتباه، النص لا يزيد عن 3 رسائل، والنهاية فيها CTA.\n\nصدّر نسخة عمودية 1080×1920، وراجع الكلام داخل المنطقة الآمنة بعيدًا عن أزرار التطبيق. بعد ما تخلص ابعت وصف ورابط عملك في مساحة المتدرب.',bodyEn:'Create a 15-second vertical ad for an imaginary product: strong hook, up to three messages and a CTA. Export at 1080×1920, check safe areas and submit your project description.'}
 ],
 'demo-course-ai':[
  {id:'ai-1',titleAr:'01 — تحليل المنتج والهدف الإعلاني',titleEn:'01 — Product and campaign brief',bodyAr:'قبل ما تكتب أي Prompt، حدّد المنتج، مميزاته الحقيقية، الجمهور، وطبيعة الإعلان: فاخر، رياضي، بسيط، أو تقني. اكتب Brief من 5 جمل من غير وعود غير قابلة للإثبات.',bodyEn:'Before prompting, define the product, factual features, audience and campaign tone. Write a five-sentence brief without unsupported claims.'},
  {id:'ai-2',titleAr:'02 — برومبت الصورة الأساسية',titleEn:'02 — The key visual prompt',bodyAr:'ابني البرومبت من: نوع المنتج + زاوية التصوير + الإضاءة + الخلفية + مساحة النص + القيم الفنية. مثال: عبوة عصير تخيلي في إضاءة استوديو ناعمة وخلفية نظيفة مع مساحة للنص ناحية اليمين.\n\nراجع أي أخطاء في العبوة أو الشعار؛ ما تعتمدش نصوص AI غير الدقيقة.',bodyEn:'Combine product, camera angle, lighting, background, space for copy and style. Example: an imaginary juice bottle in soft studio light with clean space on the right. Always verify packaging and text.'},
  {id:'ai-3',titleAr:'03 — بناء الـStoryboard',titleEn:'03 — Storyboarding',bodyAr:'قسّم الفكرة إلى 4 مشاهد: ظهور المنتج، لقطة تفاصيل، لقطة استخدام تخيلية، وخاتمة باللوجو. لكل مشهد اكتب هدفه، حركة الكاميرا، ومدته التقريبية.',bodyEn:'Build four beats: product reveal, detail shot, imagined usage and branded ending. Note each shot objective, camera movement and rough length.'},
  {id:'ai-4',titleAr:'04 — مراجعة وتسليم الإعلان',titleEn:'04 — Final review and delivery',bodyAr:'اجمع المشاهد في فيديو تجريبي قصير، وحافظ على نفس ألوان المنتج والحجم والإضاءة قدر الإمكان. راجع حقوق الأصول والعبارات الإعلانية، وبعدها ارفع رابطًا أو وصفًا للمشروع في مساحة المتدرب.',bodyEn:'Combine shots into a short sample ad with consistent color and scale. Check asset rights and factual claims, then submit a project link or description.'}
 ],
 'demo-course-brand':[
  {id:'brand-1',titleAr:'01 — ما هي الهوية البصرية؟',titleEn:'01 — What is visual identity?',bodyAr:'الهوية مش مجرد لوجو؛ هي مجموعة قرارات متكررة: الألوان، الخطوط، الصور، وطريقة استخدام العناصر. جرّب توصف شخصية براند تخيلي في 3 كلمات.',bodyEn:'Identity is more than a logo: color, type, imagery and consistent decisions. Describe an imaginary brand using three keywords.'},
  {id:'brand-2',titleAr:'02 — اختيار الألوان',titleEn:'02 — Choosing colors',bodyAr:'ابدأ بلون أساسي واضح ومعاه لون مساعد ومحايد. اختبر التباين بين النص والخلفية. اللون مش معناه ثابت لكل الناس، والأهم إنه يخدم شخصية البراند ويكون مقروءًا.',bodyEn:'Start with a core color, a supporting color and a neutral. Check contrast and use color to support the brand personality.'},
  {id:'brand-3',titleAr:'03 — الخطوط والتدرج البصري',titleEn:'03 — Typography hierarchy',bodyAr:'اختار خط عنوان وخط محتوى متوافقين. خلّي حجم العنوان أكبر بوضوح من التفاصيل، وما تكدّسش أنواع خطوط كتير في التصميم الواحد.',bodyEn:'Use compatible display and body typefaces. Make heading sizes distinctly larger and avoid too many font families.'},
  {id:'brand-4',titleAr:'04 — تطبيق عملي',titleEn:'04 — Mini brand project',bodyAr:'صمم Moodboard بسيط لبراند قهوة تخيلي: شعار مبدئي، 3 ألوان، خطين، وتطبيق لسوشيال ميديا. اكتب سبب اختيار كل عنصر.',bodyEn:'Create a mini moodboard for an imaginary coffee brand: a logo concept, three colors, two fonts and one social post. Explain your choices.'}
 ]
};
const copy=v=>JSON.parse(JSON.stringify(v));
let state={studentId:null,lessons:copy(seededLessons),progress:{}};
try{const saved=JSON.parse(localStorage.getItem(KEY)||'null');if(saved&&typeof saved==='object'){state.studentId=typeof saved.studentId==='string'?saved.studentId:null;state.lessons={...copy(seededLessons),...(saved.lessons&&typeof saved.lessons==='object'?saved.lessons:{})};state.progress=saved.progress&&typeof saved.progress==='object'?saved.progress:{};}}catch{ /* fresh demo */ }
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state));window.dispatchEvent(new CustomEvent('mo:v14-learning-updated'));}catch{alert('مساحة التخزين المحلية غير متاحة في المتصفح.')}};
const current=()=>M.list('students').find(s=>s.id===state.studentId&&s.active)||null;
const login=id=>{const user=M.list('students').find(s=>s.id===id&&s.active);if(!user)throw Error('اختار حساب تجريبي صالح');state.studentId=id;save();return user;};
const logout=()=>{state.studentId=null;save();};
const lessons=id=>copy(Array.isArray(state.lessons[id])?state.lessons[id]:[]);
const editLesson=(courseId,lesson)=>{if(!M.list('courses').some(c=>c.id===courseId))throw Error('الكورس غير موجود');const all=lessons(courseId),obj={...lesson,id:lesson.id||M.uid()};const at=all.findIndex(x=>x.id===obj.id);if(at<0)all.push(obj);else all[at]=obj;state.lessons[courseId]=all;save();return obj};
const deleteLesson=(courseId,lessonId)=>{state.lessons[courseId]=lessons(courseId).filter(x=>x.id!==lessonId);save();};
const ordersFor=(studentId=state.studentId)=>M.list('orders').filter(x=>x.studentId===studentId);
const hasAccess=(courseId,studentId=state.studentId)=>ordersFor(studentId).some(o=>o.courseId===courseId&&o.status==='approved');
const buy=(courseId,{couponCode='',method='vodafone',reference=''}={})=>{
 const user=current(),course=M.courseAvailable(courseId);if(!user)throw Error('ادخل بحساب المتدرب التجريبي الأول');if(!course||!M.academyIsLive())throw Error('الكورس مش متاح حاليًا');
 const existing=ordersFor().find(x=>x.courseId===courseId&&['pending','approved'].includes(x.status));if(existing)return {order:existing,existing:true};
 const result=M.priceFor(course,couponCode);
 if(couponCode.trim()&&!result.coupon)throw Error('كود الخصم غير صالح أو منتهي');
 if(!['vodafone','instapay'].includes(method))throw Error('اختار وسيلة دفع تجريبية');
 const id=M.upsert('orders',{studentId:user.id,courseId,amount:result.final,originalAmount:result.original,couponCode:result.coupon?.code||'',method,reference:result.final===0?'FREE-DEMO':String(reference||'DEMO-TRANSFER').slice(0,90),status:result.final===0?'approved':'pending',isDemo:true,createdAt:new Date().toISOString()});
 return {order:M.list('orders').find(x=>x.id===id),existing:false};
};
const decide=(id,status)=>{if(!['approved','rejected','pending'].includes(status))throw Error('Invalid review status');const o=M.list('orders').find(x=>x.id===id);if(!o)throw Error('الطلب مش موجود');M.upsert('orders',{...o,status,reviewedAt:new Date().toISOString()});return status};
const progress=(courseId,studentId=state.studentId)=>{const ids=lessons(courseId).map(x=>x.id),done=state.progress[studentId+'|'+courseId]||[];return {done:ids.filter(id=>done.includes(id)).length,total:ids.length,ids:done.filter(id=>ids.includes(id)),percent:ids.length?Math.round(ids.filter(id=>done.includes(id)).length/ids.length*100):0}};
const complete=(courseId,lessonId)=>{if(!current()||!hasAccess(courseId))throw Error('لازم يتوافق على الاشتراك الأول');if(!lessons(courseId).some(x=>x.id===lessonId))throw Error('الدرس مش موجود');const key=state.studentId+'|'+courseId;state.progress[key]=[...new Set([...(state.progress[key]||[]),lessonId])];save();return progress(courseId)};
const submitWork=({courseId,title,description,url})=>{const u=current();if(!u||!hasAccess(courseId))throw Error('لازم تكون مشترك في الكورس');if(!title?.trim()||!description?.trim())throw Error('اكتب عنوان ووصف المشروع');return M.upsert('works',{studentId:u.id,studentName:u.name,courseId,titleAr:title.trim().slice(0,120),titleEn:title.trim().slice(0,120),description:String(description).trim().slice(0,1500),image:M.link(url)||'',approved:false,demo:true,submittedAt:new Date().toISOString()});};
const submitReview=({courseId,rating,text})=>{const u=current();if(!u||!hasAccess(courseId))throw Error('لازم تكون مشترك في الكورس');if(!Number.isInteger(Number(rating))||Number(rating)<1||Number(rating)>5)throw Error('اختر تقييم من 1 إلى 5');if(!String(text).trim())throw Error('اكتب رأيك في الكورس');const existing=M.list('reviews').find(x=>x.studentId===u.id&&x.courseId===courseId);return M.upsert('reviews',{id:existing?.id,studentId:u.id,studentName:u.name,courseId,rating:Number(rating),textAr:String(text).trim().slice(0,1200),textEn:String(text).trim().slice(0,1200),approved:false,demo:true,submittedAt:new Date().toISOString()});};
const resetFlow=()=>{state={studentId:null,lessons:copy(seededLessons),progress:{}};save();};
window.MoV14Flow={current,login,logout,lessons,editLesson,deleteLesson,ordersFor,hasAccess,buy,decide,progress,complete,submitWork,submitReview,resetFlow};
})();
