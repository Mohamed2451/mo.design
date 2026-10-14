// Mo Design — the four canonical portfolio categories and backwards-compatible aliases.
export const PORTFOLIO_CATEGORIES = Object.freeze([
  {id:'Social Media Ads',ar:'تصاميم السوشيال ميديا والإعلانات',en:'Social Media Ads'},
  {id:'Reels & Podcast Editing',ar:'مونتاج الريلز والبودكاست',en:'Reels & Podcast Editing'},
  {id:'AI Visuals & Concepts',ar:'فنون وتوليد الذكاء الاصطناعي',en:'AI Visuals & Concepts'},
  {id:'Branding & Identity',ar:'براندينج وهوية بصرية',en:'Branding & Identity'}
]);
export function categoryFor(project){
  const exact=PORTFOLIO_CATEGORIES.find(c=>c.id===project?.category_en||c.ar===project?.category_ar);
  if(exact)return exact;
  const raw=[project?.category_en,project?.category_ar].filter(Boolean).join(' ').toLowerCase().replace(/\s+/g,' ');
  if(/social|advert|campaign|سوشيال|إعلانات|اعلان/.test(raw)) return PORTFOLIO_CATEGORIES[0];
  if(/reels|podcast|editing|motion|مونتاج|ريلز|بودكاست|موشن/.test(raw))return PORTFOLIO_CATEGORIES[1];
  if(/artificial|ai visuals|concepts|generative|ذكاء|اصطناعي|توليد/.test(raw))return PORTFOLIO_CATEGORIES[2];
  if(/brand|identity|براند|هوية/.test(raw))return PORTFOLIO_CATEGORIES[3];
  return PORTFOLIO_CATEGORIES.find(c=>c.id===project?.category_en||c.ar===project?.category_ar)||null;
}
export function formatTools(raw){
 const tools=String(raw||'').split(/[,،\n|;]+/).map(s=>s.trim()).filter(Boolean);
 return [...new Set(tools)].slice(0,40);
}
