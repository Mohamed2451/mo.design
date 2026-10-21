// Preview-only shared browser store. Real production moderation requires a separate secured backend.
export const KEY='mo_design_community_preview_v1';
export function readCommunity(){try{const x=JSON.parse(localStorage.getItem(KEY)||'{}');return {reviews:Array.isArray(x.reviews)?x.reviews:[],brands:Array.isArray(x.brands)?x.brands:[],brands_visible:x.brands_visible===true}}catch{return {reviews:[],brands:[],brands_visible:false}}}
export function writeCommunity(x){localStorage.setItem(KEY,JSON.stringify(x));window.dispatchEvent(new Event('mo-community-change'))}
export const htmlEscape=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\x27':'&#39;'}[c]));
export function validHttps(value){try{const u=new URL(String(value));return u.protocol==='https:'?u.href:''}catch{return ''}}
