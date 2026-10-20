// Persistent browser-only media for Mo Design Cloudflare previews.
// Blobs are kept in IndexedDB rather than localStorage (which cannot handle videos).
// NEVER import this module into production upload code.
const DB_NAME='mo-design-studio-preview-files';
const STORE='media';
const PREFIX='preview-media:';
const cache=new Map();
export const isPreviewMediaRef=value=>typeof value==='string'&&/^preview-media:[0-9a-f-]{36}$/i.test(value);
export const isStudioPreviewHost=()=>location.hostname.endsWith('.pages.dev');
function openDb(){
 if(!isStudioPreviewHost())return Promise.reject(new Error('المعاينة المحلية فقط'));
 if(!('indexedDB' in window))return Promise.reject(new Error('المتصفح لا يدعم تخزين الملفات المحلي'));
 return new Promise((resolve,reject)=>{
  const request=indexedDB.open(DB_NAME,1);
  request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains(STORE))request.result.createObjectStore(STORE,{keyPath:'id'})};
  request.onerror=()=>reject(new Error('فشل فتح تخزين ملفات المعاينة. راجع وضع التصفح الخاص'));
  request.onsuccess=()=>resolve(request.result);
 });
}
function transaction(db,mode,operation){
 return new Promise((resolve,reject)=>{
  const tx=db.transaction(STORE,mode),store=tx.objectStore(STORE),req=operation(store);
  req.onsuccess=()=>resolve(req.result);
  req.onerror=()=>reject(req.error||new Error('تعذر الوصول للملف'));
  tx.oncomplete=()=>db.close();
  tx.onerror=()=>{db.close();reject(tx.error||new Error('فشل تخزين الملف'))};
 });
}
export async function storeStudioPreviewMedia(file,type){
 if(!(file instanceof File))throw new Error('اختار ملفًا من جهازك');
 const allowed=type==='video'?['video/mp4','video/webm']:['image/png','image/jpeg','image/webp','image/avif'];
 const limit=type==='video'?45*1024*1024:8*1024*1024;
 if(!allowed.includes(file.type))throw new Error(type==='video'?'الفيديو لازم يكون MP4 أو WebM':'الصورة لازم تكون PNG أو JPG أو WebP أو AVIF');
 if(file.size>limit)throw new Error(type==='video'?'الفيديو أكبر من 45 ميجابايت':'الصورة أكبر من 8 ميجابايت');
 const id=crypto.randomUUID(),db=await openDb();
 await transaction(db,'readwrite',store=>store.put({id,blob:file,type,name:file.name,created:Date.now()}));
 return PREFIX+id;
}
export async function resolveStudioPreviewMedia(value){
 if(!isPreviewMediaRef(value)||!isStudioPreviewHost())return '';
 if(cache.has(value))return cache.get(value);
 const db=await openDb();
 const item=await transaction(db,'readonly',store=>store.get(value.slice(PREFIX.length)));
 if(!item?.blob)return '';
 const url=URL.createObjectURL(item.blob);
 cache.set(value,url);
 return url;
}
export async function deleteStudioPreviewMedia(value){
 if(!isPreviewMediaRef(value)||!isStudioPreviewHost())return;
 const url=cache.get(value);if(url){URL.revokeObjectURL(url);cache.delete(value)}
 const db=await openDb();
 await transaction(db,'readwrite',store=>store.delete(value.slice(PREFIX.length)));
}
window.addEventListener('pagehide',()=>{for(const url of cache.values())URL.revokeObjectURL(url);cache.clear()});
