/* V14 sandbox data model. This is intentionally browser-local ONLY.
   Never treats local state as authenticated or as a trusted payment record.
   No network writes; production Supabase remains untouched. */
(function(){
'use strict';
const KEY='mo_design_v14_sandbox_1';
const base={
 settings:{academy:'coming_soon',sections:{videos:true,stats:true,team:true,academy:true,studentWorks:true,studentReviews:true},paymentVodafone:'',paymentInstapay:'',academyTitleAr:'من الفكرة لأول إنجاز.',academyTitleEn:'From ideas to real skills.'},
 stats:[],team:[],videos:[],courses:[],coupons:[],students:[],orders:[],works:[],reviews:[]
};
const names=['stats','team','videos','courses','coupons','students','orders','works','reviews'];
const demoFixture={
  stats:[
    {id:'demo-stat-projects',titleAr:'مشاريع تدريبية',titleEn:'Demo Projects',value:'24',suffix:'+',visible:true,demo:true},
    {id:'demo-stat-learners',titleAr:'متدرب تجريبي',titleEn:'Demo Learners',value:'3',suffix:'',visible:true,demo:true},
    {id:'demo-stat-years',titleAr:'سنوات خبرة (مثال)',titleEn:'Years of experience (sample)',value:'5',suffix:'+',visible:true,demo:true}
  ],
  team:[
    {id:'demo-team-1',nameAr:'آدم رامي',nameEn:'Adam Rami',roleAr:'مصمم هوية بصرية — شخصية تجريبية',roleEn:'Brand Designer — Fictional',image:'',url:'',visible:true,demo:true},
    {id:'demo-team-2',nameAr:'ليلى يوسف',nameEn:'Layla Youssef',roleAr:'مونتيرة وموشن جرافيك — شخصية تجريبية',roleEn:'Motion Editor — Fictional',image:'',url:'',visible:true,demo:true},
    {id:'demo-team-3',nameAr:'سيف نادر',nameEn:'Seif Nader',roleAr:'مصمم إبداعي بالذكاء الاصطناعي — شخصية تجريبية',roleEn:'AI Visual Artist — Fictional',image:'',url:'',visible:true,demo:true}
  ],
  videos:[
    {id:'demo-video-1',titleAr:'عرض الهوية البصرية — نموذج',titleEn:'Identity Showreel — Sample',url:'',poster:'',visible:true,demo:true}
  ],
  courses:[
    {id:'demo-course-motion',titleAr:'مونتاج الريلز من الصفر',titleEn:'Reels Editing from Scratch',descriptionAr:'تدريب تجريبي من 4 دروس في الإيقاع والمونتاج والإخراج.',descriptionEn:'A sample four-lesson journey through editing and rhythm.',image:'',price:1200,lessons:'1. فكرة الريل وبناء القصة\n2. المونتاج والإيقاع\n3. المؤثرات والصوت\n4. المشروع النهائي',published:true,demo:true},
    {id:'demo-course-ai',titleAr:'إعلانات المنتجات بالذكاء الاصطناعي',titleEn:'AI Product Advertising',descriptionAr:'4 دروس تجريبية من الفكرة إلى إعلان المنتج النهائي.',descriptionEn:'Four sample lessons from creative concept to final ad.',image:'',price:1800,lessons:'1. تحليل المنتج\n2. بناء البرومبت\n3. الصور والـ Storyboard\n4. الفيديو النهائي',published:true,demo:true},
    {id:'demo-course-brand',titleAr:'أساسيات الهوية البصرية',titleEn:'Brand Identity Essentials',descriptionAr:'مسار مجاني تجريبي للتعرف على مبادئ الهوية.',descriptionEn:'A free sample introduction to branding.',image:'',price:0,lessons:'1. مكونات الهوية\n2. اختيار الخطوط\n3. نظام الألوان\n4. تطبيق عملي',published:true,demo:true}
  ],
  coupons:[
    {id:'demo-coupon-20',code:'MO20',type:'percent',value:20,courseId:'',expires:'2030-12-31',enabled:true,demo:true},
    {id:'demo-coupon-200',code:'WELCOME200',type:'fixed',value:200,courseId:'',expires:'2030-12-31',enabled:true,demo:true}
  ],
  students:[
    {id:'demo-student',name:'مريم أحمد — متدربة تجريبية',email:'student@demo.mo',courseId:'demo-course-motion',active:true,demo:true},
    {id:'demo-student-two',name:'عمر سمير — متدرب تجريبي',email:'omar@demo.mo',courseId:'demo-course-ai',active:true,demo:true},
    {id:'demo-student-three',name:'نور سامح — متدربة تجريبية',email:'nour@demo.mo',courseId:'demo-course-brand',active:true,demo:true}
  ],
  orders:[],
  works:[
    {id:'demo-work-1',titleAr:'مشروع إعلان خيالي لمشروب',titleEn:'Imaginary beverage campaign',studentName:'عمر سمير (Demo)',studentId:'demo-student-two',courseId:'demo-course-ai',image:'',approved:true,demo:true}
  ],
  reviews:[
    {id:'demo-review-1',studentName:'نور سامح (Demo)',studentId:'demo-student-three',courseId:'demo-course-brand',rating:5,textAr:'تقييم تمثيلي للتجربة، مش رأي طالب حقيقي.',textEn:'A sample review, not real student feedback.',approved:true,demo:true}
  ]
};
const makeFixtures=()=>JSON.parse(JSON.stringify(demoFixture));
const copy=x=>JSON.parse(JSON.stringify(x));
let state=copy(base);
try{const saved=JSON.parse(localStorage.getItem(KEY)||'null');if(saved&&typeof saved==='object'){state.settings={...base.settings,...(saved.settings||{}),sections:{...base.settings.sections,...(saved.settings?.sections||{})}};for(const n of names)state[n]=Array.isArray(saved[n])?saved[n].slice(0,500):[];}}catch(e){console.warn('V14 sandbox reset',e)}
const seedDemo=({force=false}={})=>{
  if(!force && state.settings.demoSeeded)return false;
  const fixture=makeFixtures();
  for(const name of names){if(force)state[name]=fixture[name];else if(!state[name]?.length)state[name]=fixture[name];}
  state.settings={...state.settings,academy:'live',demoSeeded:true};
  publish();return true;
};

const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2,8);
const link=value=>{try{const v=new URL(String(value),location.origin);return ['https:','http:'].includes(v.protocol)?v.href:''}catch{return ''}};
const safeAmount=v=>Math.max(0,Math.round(Number(v)||0));
const publish=()=>{try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){alert('لم يتم حفظ التغييرات محليًا، قد تكون مساحة التخزين ممتلئة.')}window.dispatchEvent(new CustomEvent('mo:v14-sandbox'));};
const list=name=>copy(state[name]||[]);
const settings=()=>copy(state.settings);
const upsert=(name,item)=>{if(!names.includes(name))throw Error('Unsupported collection');const entry={...item,id:item.id||uid()};const n=state[name].findIndex(x=>x.id===entry.id);if(n<0)state[name].push(entry);else state[name][n]=entry;publish();return entry.id};
const remove=(name,id)=>{if(!names.includes(name))throw Error('Unsupported collection');state[name]=state[name].filter(x=>x.id!==id);publish()};
const setSettings=patch=>{state.settings={...state.settings,...patch,sections:{...state.settings.sections,...(patch.sections||{})}};publish()};
const reset=()=>{state=copy(base);publish()};
const couponFor=(code,courseId)=>state.coupons.find(c=>c.enabled&&String(c.code||'').trim().toUpperCase()===String(code||'').trim().toUpperCase()&&(!c.courseId||c.courseId===courseId)&&(!c.expires||new Date(c.expires+'T23:59:59').getTime()>Date.now()));
const priceFor=(course,code)=>{const original=safeAmount(course.price);const c=couponFor(code,course.id);return {original,final:c?Math.max(0,original-(c.type==='percent'?Math.round(original*Math.min(100,Math.max(0,Number(c.value)||0))/100):safeAmount(c.value))):original,coupon:c||null}};
const academyIsLive=()=>state.settings.academy==='live';
const isApproved=id=>state.orders.some(x=>x.courseId===id&&x.studentId==='demo-student'&&x.status==='approved');
const courseAvailable=id=>state.courses.find(x=>x.id===id&&x.published);
const materialUrl=link;
window.MoV14={get:()=>copy(state),list,settings,upsert,remove,setSettings,reset,seedDemo,esc,link,uid,safeAmount,priceFor,academyIsLive,isApproved,courseAvailable,materialUrl,save:publish};
if(!state.settings.demoSeeded)seedDemo();
})();
