export const STORAGE_KEY = 'mo_design_portfolio_demo_v3';

export const seed = {
  settings: {
    id: 1,
    brand_ar: 'Mo Design', brand_en: 'Mo Design',
    personal_name: 'Mohamed Mahmoud',
    role_ar: 'مصمم جرافيك ومونتير فيديو | إعلانات سوشيال • موشن • AI Visuals',
    role_en: 'Graphic Designer & Video Editor | Social Ads • Motion • AI Visuals',
    headline_ar: 'الخيال يتصمّم.\nوالأفكار تتحرّك.',
    headline_en: 'MAKE IT BOLD.\nMAKE IT MOVE.',
    subheadline_ar: 'أنا محمد محمود، مصمم جرافيك ومونتير. بساعد البراندات تحوّل أفكارها لإعلانات وتصاميم وفيديوهات إبداعية بتلفت الانتباه وتخدم أهدافها.',
    subheadline_en: 'I’m Mohamed Mahmoud, a graphic designer and video editor crafting scroll-stopping campaigns, motion and AI-powered visuals that help brands stand out.',
    bio_ar: 'مصمم جرافيك ومونتير شغوف بدمج الإبداع البصري مع أحدث أدوات الذكاء الاصطناعي التوليدي. أساعد العلامات التجارية وأصحاب الأعمال على ابتكار هويات وحملات إعلانية بصرية تترك أثرًا، وتهدف لزيادة المبيعات والتفاعل.',
    bio_en: 'I’m a graphic designer and video editor passionate about blending visual creativity with generative AI. I help brands and business owners craft distinctive identities and campaigns designed to make an impact, drive engagement and support sales.',
    contact_email: '', whatsapp_url: 'https://wa.me/201015000036',
    community_url:'https://chat.whatsapp.com/HvJGMrahSBFBmCxRMxD2Z5',
    behance_url:'https://www.behance.net/mode5', linkedin_url:'https://www.linkedin.com/in/mohamed-mahmoud-97638a211/', instagram_url:'https://www.instagram.com/mo.design.official',
    tiktok_url:'https://www.tiktok.com/@mohamedmahmoud30', facebook_url:'https://www.facebook.com/Mohame.Mahmoud11',
    availability: true
  },
  // All items below are clearly marked as DEMO placeholders; no fake client work is claimed.
  projects: [
    {id:'demo-social',slug:'social-media-ads',title_ar:'إعلانات توقف الـ Scroll',title_en:'Scroll-Stopping Ads',category_ar:'تصاميم السوشيال ميديا والإعلانات',category_en:'Social Media Ads',summary_ar:'مساحة تجريبية لعرض تصاميم الإعلانات والسوشيال ميديا. أضف هنا مشروعك الحقيقي مع الصور وتفاصيل النتيجة.',summary_en:'Portfolio layout placeholder. Replace with your actual social campaign, visuals and project results.',cover_style:'aurora',image_url:'',external_url:'',featured:true,is_published:true,sort_order:1},
    {id:'demo-motion',slug:'video-motion',title_ar:'حكايات تتحرك',title_en:'Stories in Motion',category_ar:'مونتاج وموشن جرافيكس',category_en:'Video Editing & Motion',summary_ar:'مساحة تجريبية لفيديوهات الريلز والمونتاج والموشن. استبدلها بفيديوهاتك وروابط المشاهدة الحقيقية.',summary_en:'Portfolio layout placeholder for reels, video editing and motion graphics. Add your real films and watch links.',cover_style:'orbit',image_url:'',external_url:'',featured:true,is_published:true,sort_order:2},
    {id:'demo-ai',slug:'ai-visuals',title_ar:'إبداع بلا حدود',title_en:'Beyond the Prompt',category_ar:'فنون وتوليد الذكاء الاصطناعي',category_en:'AI Visuals & Concepts',summary_ar:'مساحة تجريبية لأعمالك في توليد الصور والفيديو والإخراج بالذكاء الاصطناعي؛ أضف أعمالك الأصلية هنا.',summary_en:'Placeholder for generative AI artwork, campaigns and AI videos. Replace with original projects.',cover_style:'pop',image_url:'',external_url:'',featured:true,is_published:true,sort_order:3},
    {id:'demo-brand',slug:'branding-identity',title_ar:'هوية بتسيب بصمة',title_en:'Identity with Impact',category_ar:'براندينج وهوية بصرية',category_en:'Branding & Identity',summary_ar:'مساحة تجريبية لعرض أنظمة الهويات والشعارات والحملات المتكاملة الخاصة بك.',summary_en:'Brand identity presentation placeholder. Add your own logos, identity systems and case studies.',cover_style:'type',image_url:'',external_url:'',featured:true,is_published:true,sort_order:4}
  ],
  services: [
    {id:'service-ads',title_ar:'إعلانات السوشيال ميديا',title_en:'Social Media & High-Converting Ads',description_ar:'بوستات وتصاميم وحملات بصرية جذّابة، مصممة عشان تلفت الانتباه وتساعد في رفع التحويلات.',description_en:'Attention-grabbing posts and campaigns designed to stop the scroll and support conversions.',icon:'target',sort_order:1,is_published:true},
    {id:'service-video',title_ar:'مونتاج الفيديو والموشن جرافيكس',title_en:'Video Editing & Motion Graphics',description_ar:'ريلز وإعلانات وموشن جرافيكس باستخدام Premiere Pro وDaVinci Resolve وAfter Effects.',description_en:'Reels, ads and motion graphics crafted with Premiere Pro, DaVinci Resolve and After Effects.',icon:'play',sort_order:2,is_published:true},
    {id:'service-ai',title_ar:'تصميم وإنتاج بالذكاء الاصطناعي',title_en:'AI-Powered Creative Production',description_ar:'صور وفيديوهات ومفاهيم إعلانية جديدة بأدوات الذكاء الاصطناعي التوليدي مع إشراف فني مدروس.',description_en:'Distinctive AI-powered campaign visuals, videos and concepts guided by thoughtful art direction.',icon:'sparkles',sort_order:3,is_published:true},
    {id:'service-brand',title_ar:'هوية بصرية وحملات متكاملة',title_en:'Branding & Campaign Art Direction',description_ar:'إدارة الشكل البصري للحملة من الفكرة والاتجاه الفني لحد الملفات النهائية الجاهزة للنشر.',description_en:'Visual direction for campaigns, from concept and brand system through final production-ready assets.',icon:'diamond',sort_order:4,is_published:true}
  ]
};

export function readDemo() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (p && p.settings && Array.isArray(p.projects) && Array.isArray(p.services)) return p;
    }
  } catch(err) { console.warn('Local preview content unavailable',err); }
  return structuredClone(seed);
}
export function saveDemo(data) { localStorage.setItem(STORAGE_KEY,JSON.stringify(data)); }

export const ar = {
  nav_work:'الأعمال',nav_services:'الخدمات',nav_about:'عني',nav_contact:'تواصل',talk:'ابدأ مشروعك',explore:'شوف أعمالي',scroll:'اكتشف اللي بعده',
  available:'متاح لمشاريع جديدة',unavailable:'غير متاح لمشاريع حاليًا',hero_card_title:'Creative Mind',hero_card_sub:'Design × Motion × AI',
  selected:'مختارات من عالمي الإبداعي',selected_sub:'أربع مساحات للإبداع. قريبًا هنا هتشوف مشاريعي الحقيقية بالتفاصيل.',
  all_work:'كل الأعمال',all:'كل الأعمال',featured:'المميز',demo_notice:'هذه البطاقات قوالب عرض تجريبية، وليست أعمالًا أو مشروعات عملاء. أضف مشروعاتك الحقيقية من لوحة الإدارة.',
  services_eyebrow:'إيه اللي أقدر أقدمه؟',services_title:'من الفكرة للانبهار.',services_sub:'خدمات تصميم ومحتوى بصري مصنوعة عشان تحكي قصة براندك وتحقق هدفه.',
  about_eyebrow:'خلف الكواليس',about_title:'أنا محمد محمود.\nودي طريقتي في الإبداع.',about_card_1:'فكر بصري مميز',about_card_2:'تفاصيل محسوبة',about_card_3:'AI + Human Creativity',
  process_label:'من أول رسالة لآخر تسليم',step1:'نفهم فكرتك',step1d:'نتناقش في أهداف البراند والجمهور المستهدف ونحدد اتجاه واضح للمشروع.',
  step2:'ننفّذ ونراجع',step2d:'بنحوّل الفكرة لتنفيذ إبداعي، مع مراجعات مرنة للوصول لأفضل نتيجة.',step3:'نسلّم بثقة',step3d:'تستلم الملفات النهائية بأعلى جودة ممكنة وجاهزة للنشر والاستخدام.',
  learn_eyebrow:'المعرفة للجميع',learn_title:'المعرفة الجاية أقرب.',learn_desc:'بخطط لمحتوى تعليمي وكورسات مجانية ومدفوعة عن التصميم والمونتاج والذكاء الاصطناعي. لسه مش متاحة.',learn_tag:'قريبًا — مجتمع وتعلّم',
  contact_eyebrow:'LET’S CREATE',contact_title:'عندك فكرة؟\nخلّيها مشروع.',contact_desc:'ابعت تفاصيل مشروعك عبر النموذج، أو تواصل مباشرة على واتساب. الرسائل بتوصل للوحة التحكم بعد ربط Supabase.',
  name:'اسمك',email:'بريدك الإلكتروني',subject:'نوع المشروع',message:'قولّي بتفكر في إيه',
  subject_options:['اختار نوع الخدمة','تصميمات سوشيال وإعلانات','مونتاج وموشن جرافيكس','فنون وفيديوهات بالذكاء الاصطناعي','هوية بصرية وبراندينج','مشاركة أو استفسار آخر'],
  submit:'إرسال تفاصيل المشروع',submitting:'جارٍ الإرسال...',email_open:'لم يتم ربط قاعدة البيانات بعد. سيتم فتح واتساب لإرسال طلبك مباشرة.',sent:'رسالتك وصلت، شكرًا ليك!',send_error:'في مشكلة مؤقتة. تواصل معايا مباشرة على واتساب.',
  footer_line:'Designed with intention. Made to move.',rights:'جميع الحقوق محفوظة.',admin:'لوحة الإدارة',view:'اكتشف',details:'تفاصيل العمل',close:'إغلاق',visit:'شاهد المشروع',no_link:'أضف رابط المشروع عند نشر عملك الحقيقي.',
  email_me:'البريد الإلكتروني',demo_chip:'نموذج للعرض',no_projects:'مفيش أعمال منشورة في التصنيف ده.',connect:'تواصل عبر',made:'الإبداع له عنوان.',required:'راجع البيانات المطلوبة.',
  stat1:'مجالات إبداع',stat2:'خطوات بسيطة',stat3:'لغتان',copy_email:'انسخ البريد',copied:'تم نسخ البريد',email_missing:'البريد الإلكتروني لم يُضف بعد',whatsapp:'كلّمني واتساب',community:'انضم لمجتمع AI',
  social_placeholder:'تابع أعمالي على حساباتي الرسمية',portfolio_note:'نماذج تصميمية لمعاينة طريقة عرض الأعمال',about_caption:'الإنسان وراء الأفكار',hero_pic_note:'MOHAMED / CREATIVE DIRECTOR',skip:'انتقل للمحتوى'
};
export const en = {
  nav_work:'Work',nav_services:'Services',nav_about:'About',nav_contact:'Contact',talk:'Start a project',explore:'Explore my work',scroll:'Keep scrolling',
  available:'Available for Freelance Projects',unavailable:'Currently unavailable',hero_card_title:'Creative Mind',hero_card_sub:'Design × Motion × AI',
  selected:'The creative playground',selected_sub:'Four creative disciplines. Real case studies will be added here soon.',
  all_work:'All projects',all:'All work',featured:'Featured',demo_notice:'These cards are demo layouts, not completed client projects. Replace them with your real portfolio in the dashboard.',
  services_eyebrow:'What I bring to the table',services_title:'From concept to impact.',services_sub:'Visual services built to tell your brand’s story and support real business goals.',
  about_eyebrow:'Behind the visuals',about_title:'I’m Mohamed Mahmoud.\nThis is how I create.',about_card_1:'Bold visual thinking',about_card_2:'Details that matter',about_card_3:'AI + Human Creativity',
  process_label:'A simple creative process',step1:'Discover the brief',step1d:'We discuss your brand goals, target audience and the direction that fits your message.',
  step2:'Create & collaborate',step2d:'I turn the concept into polished visuals, with flexible rounds of feedback.',step3:'Deliver with confidence',step3d:'Receive high-quality final files, ready to publish and put to work.',
  learn_eyebrow:'Share the craft',learn_title:'Learning is on the way.',learn_desc:'Future free and paid content about design, editing and AI is in the works. Courses aren’t live yet.',learn_tag:'Coming later — community & courses',
  contact_eyebrow:'LET’S CREATE',contact_title:'Got a vision?\nLet’s make it real.',contact_desc:'Share your brief via the form or reach out on WhatsApp. Dashboard inbox works once Supabase is connected.',
  name:'Your name',email:'Email address',subject:'What do you need?',message:'Tell me about your idea',
  subject_options:['Choose a service','Social & advertising designs','Video editing & motion','AI visuals & videos','Branding & identity','Other enquiry / collaboration'],
  submit:'Send project details',submitting:'Sending...',email_open:'The database isn’t connected yet. WhatsApp will open with your project brief.',sent:'Message received. Thank you!',send_error:'Something went wrong. Please reach me on WhatsApp.',
  footer_line:'Designed with intention. Made to move.',rights:'All rights reserved.',admin:'Dashboard',view:'Explore',details:'Project details',close:'Close',visit:'View project',no_link:'Add a live portfolio link when you publish the work.',
  email_me:'Email me',demo_chip:'Display concept',no_projects:'Nothing is published in this category yet.',connect:'Connect via',made:'Creativity has a new address.',required:'Please complete the required fields.',
  stat1:'Creative fields',stat2:'Easy steps',stat3:'Languages',copy_email:'Copy email',copied:'Email copied',email_missing:'Email address has not been added',whatsapp:'WhatsApp me',community:'Join AI Community',
  social_placeholder:'See more of my work on my social accounts',portfolio_note:'Concepts showing how the project grid will look',about_caption:'The human behind the pixels',hero_pic_note:'MOHAMED / CREATIVE DIRECTOR',skip:'Skip to content'
};
export function tField(obj,base,lang) {return obj?.[`${base}_${lang}`] || obj?.[`${base}_${lang==='ar'?'en':'ar'}`] || '';}
export function safeUrl(value) {if(!value)return '';try{const u=new URL(value,window.location.href);return ['https:','http:','mailto:'].includes(u.protocol)?u.href:'';}catch{return '';}}
export function escapeHTML(s='') {return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
