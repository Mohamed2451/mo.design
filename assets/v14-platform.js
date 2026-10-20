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
const copy=x=>JSON.parse(JSON.stringify(x));
let state=copy(base);
try{const saved=JSON.parse(localStorage.getItem(KEY)||'null');if(saved&&typeof saved==='object'){state.settings={...base.settings,...(saved.settings||{}),sections:{...base.settings.sections,...(saved.settings?.sections||{})}};for(const n of names)state[n]=Array.isArray(saved[n])?saved[n].slice(0,500):[];}}catch(e){console.warn('V14 sandbox reset',e)}
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
window.MoV14={get:()=>copy(state),list,settings,upsert,remove,setSettings,reset,esc,link,uid,safeAmount,priceFor,academyIsLive,isApproved,courseAvailable,materialUrl,save:publish};
})();
