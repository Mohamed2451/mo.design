export const LEGAL_KEY='mo_legal_pages_v1';
export const DEFAULT_LEGAL=[{id:'privacy',url:'privacy.html',ar:'سياسة الخصوصية',en:'Privacy Policy'},{id:'terms',url:'terms.html',ar:'الشروط والأحكام',en:'Terms & Conditions'},{id:'copyright',url:'copyright.html',ar:'حقوق النشر',en:'Copyright'}];
export function legalPages(settings){
 let saved=[];try{saved=JSON.parse(settings?.content_ar?.[LEGAL_KEY]||'[]')}catch{}
 if(!Array.isArray(saved))saved=[];
 return [...DEFAULT_LEGAL.map(d=>({...d,...(saved.find(x=>x.id===d.id)||{}),url:d.url})),...saved.filter(x=>!DEFAULT_LEGAL.some(d=>d.id===x.id)).slice(0,12).map(x=>({...x,url:'legal-page.html?id='+encodeURIComponent(x.id)}))];
}
