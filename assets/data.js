export const STORAGE_KEY = 'mo_design_portfolio_demo_v4';

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
    contact_email: '', whatsapp_url: 'https://wa.me/201097865616',
    community_url:'https://chat.whatsapp.com/HvJGMrahSBFBmCxRMxD2Z5',
    behance_url:'https://www.behance.net/mode5', linkedin_url:'https://www.linkedin.com/in/mohamed-mahmoud-97638a211/', instagram_url:'https://www.instagram.com/mo.design.official',
    tiktok_url:'https://www.tiktok.com/@mohamedmahmoud30', facebook_url:'https://www.facebook.com/Mohame.Mahmoud11',
    availability: true
  },
  // All items below are clearly marked as DEMO placeholders; no fake client work is claimed.
  projects: [
    {id:'demo-glow',slug:'glow-beauty',title_ar:'GLOW LAB — حملة جمال عصرية',title_en:'GLOW LAB — Beauty Campaign',category_ar:'تصاميم السوشيال ميديا والإعلانات',category_en:'Social Media Ads',summary_ar:'مفهوم إعلاني تجريبي لمنتج عناية بالبشرة: فن إعلاني مستقبلي، تدرجات بنفسجية، وعرض المنتج كقطعة فنية.',summary_en:'Spec concept for a beauty brand — product visuals, bold typography and art direction. Not commissioned.',cover_style:'aurora',image_url:'./assets/images/concept-glow.svg',external_url:'',featured:true,is_published:true,sort_order:1},
    {id:'demo-vanta',slug:'vanta-ai',title_ar:'VANTA — عالم من الخيال',title_en:'VANTA — Beyond Reality',category_ar:'فنون وتوليد الذكاء الاصطناعي',category_en:'AI Visuals & Concepts',summary_ar:'تجربة بصرية افتراضية تستكشف المجرّات والهياكل المعدنيّة والإخراج السريالي؛ نموذج لتقديم أفكار AI Creative.',summary_en:'A conceptual AI-art direction study featuring surreal cosmic forms and futuristic lighting. Demo design.',cover_style:'aurora',image_url:'./assets/images/concept-vanta.svg',external_url:'',featured:true,is_published:true,sort_order:2},
    {id:'demo-pulse',slug:'pulse-motion',title_ar:'PULSE — هوية تتحرك',title_en:'PULSE — Motion in Every Frame',category_ar:'مونتاج وموشن جرافيكس',category_en:'Video Editing & Motion',summary_ar:'تصور بصري لمقدمة فيديو موشن جرافيك تعتمد على الإيقاع والديناميكية والتباين السينمائي. تصميم ثابت تجريبي وليس فيديو منشورًا.',summary_en:'Motion design key visual for a hypothetical brand film. Still preview, not a published video.',cover_style:'aurora',image_url:'./assets/images/concept-pulse.svg',external_url:'',featured:true,is_published:true,sort_order:3},
    {id:'demo-forme',slug:'forme-brand',title_ar:'FORME — براندينج له شخصية',title_en:'FORME — Identity System',category_ar:'براندينج وهوية بصرية',category_en:'Branding & Identity',summary_ar:'نظام هوية بصري افتراضي يجمع بين البساطة الهندسية والنظام الطباعي واللون الأخضر الجريء.',summary_en:'An experimental identity system with modern geometry, editorial typography and confident color.',cover_style:'aurora',image_url:'./assets/images/concept-forme.svg',external_url:'',featured:true,is_published:true,sort_order:4},
    {id:'demo-flash',slug:'flash-social',title_ar:'FLASH — إعلانات سوشيال جريئة',title_en:'FLASH — Social Campaign',category_ar:'تصاميم السوشيال ميديا والإعلانات',category_en:'Social Media Ads',summary_ar:'تصميمات Concept لإعلان خصومات بأسلوب سريع وشبابي، مع موك أب للهاتف وعبارات Call To Action واضحة.',summary_en:'A conceptual conversion-focused flash sale campaign featuring a mobile ad mockup and energetic color.',cover_style:'aurora',image_url:'./assets/images/concept-flash.svg',external_url:'',featured:true,is_published:true,sort_order:5},
    {id:'demo-solar',slug:'solar-product',title_ar:'SOLAR POP — إعلان منتج',title_en:'SOLAR POP — Product Art Direction',category_ar:'تصاميم السوشيال ميديا والإعلانات',category_en:'Social Media Ads',summary_ar:'تصور دعائي مبتكر لمشروب افتراضي بتفاصيل لونية دافئة وعرض Product Hero جذاب.',summary_en:'A bright, fictional beverage launch concept with vivid product art direction.',cover_style:'aurora',image_url:'./assets/images/concept-solar.svg',external_url:'',featured:true,is_published:true,sort_order:6},
    {id:'demo-neon',slug:'neon-ai',title_ar:'NEW REALITY — فنون AI',title_en:'NEW REALITY — AI Visual Experiment',category_ar:'فنون وتوليد الذكاء الاصطناعي',category_en:'AI Visuals & Concepts',summary_ar:'تجربة تصميم مفاهيمي عن مستقبل الإبداع، المعادن اللامعة، البوابات البصرية والخيال التوليدي.',summary_en:'Spec concept exploring chrome forms, dreamlike portals and generative art direction.',cover_style:'aurora',image_url:'./assets/images/concept-neon.svg',external_url:'',featured:true,is_published:true,sort_order:7},
    {id:'demo-noir',slug:'noir-identity',title_ar:'NOIR — هوية قهوة فاخرة',title_en:'NOIR — Coffee Brand Identity',category_ar:'براندينج وهوية بصرية',category_en:'Branding & Identity',summary_ar:'هوية تخيلية لعلامة قهوة، تعبر عن الأناقة من خلال التدرجات البنية والمشاهد الهادئة واللغة البصرية البسيطة.',summary_en:'A hypothetical premium coffee brand with warm, editorial visual identity elements.',cover_style:'aurora',image_url:'./assets/images/concept-noir.svg',external_url:'',featured:true,is_published:true,sort_order:8},
  ],
  services: [
    {id:'service-ads',title_ar:'إعلانات السوشيال ميديا',title_en:'Social Media & High-Converting Ads',description_ar:'بوستات وتصاميم وحملات بصرية جذّابة، مصممة عشان تلفت الانتباه وتساعد في رفع التحويلات.',description_en:'Attention-grabbing posts and campaigns designed to stop the scroll and support conversions.',icon:'target',sort_order:1,is_published:true},
    {id:'service-video',title_ar:'مونتاج الفيديو والموشن جرافيكس',title_en:'Video Editing & Motion Graphics',description_ar:'ريلز وإعلانات وموشن جرافيكس باستخدام Premiere Pro وDaVinci Resolve وAfter Effects.',description_en:'Reels, ads and motion graphics crafted with Premiere Pro, DaVinci Resolve and After Effects.',icon:'play',sort_order:2,is_published:true},
    {id:'service-ai',title_ar:'تصميم وإنتاج بالذكاء الاصطناعي',title_en:'AI-Powered Creative Production',description_ar:'صور وفيديوهات ومفاهيم إعلانية جديدة بأدوات الذكاء الاصطناعي التوليدي مع إشراف فني مدروس.',description_en:'Distinctive AI-powered campaign visuals, videos and concepts guided by thoughtful art direction.',icon:'sparkles',sort_order:3,is_published:true},
    {id:'service-brand',title_ar:'هوية بصرية وحملات متكاملة',title_en:'Branding & Campaign Art Direction',description_ar:'إدارة الشكل البصري للحملة من الفكرة والاتجاه الفني لحد الملفات النهائية الجاهزة للنشر.',description_en:'Visual direction for campaigns, from concept and brand system through final production-ready assets.',icon:'diamond',sort_order:4,is_published:true}
  ],
  testimonials: [
    {id:'review-demo-01',author_ar:'مكان اسم العميل',author_en:'Your client’s name',job_ar:'الهوية البصرية والتصميم',job_en:'Branding & Design',quote_ar:'مساحة أنيقة لتقييم عميل حقيقي عن جودة التعاون والإبداع والنتائج. استبدل هذا النص بشهادة موثّقة من صاحبها.',quote_en:'A beautifully designed space for an authentic client review. Replace this example with a verified testimonial.',rating:0,is_verified:false,is_published:true,sort_order:1},
    {id:'review-demo-02',author_ar:'تجربة عميل قادمة',author_en:'A real story coming soon',job_ar:'المونتاج والموشن جرافيكس',job_en:'Video & Motion',quote_ar:'هنا هنعرض تجربة عميل حقيقية مع المونتاج وتنفيذ الفيديو، بعد استلام رأيه وموافقته على النشر.',quote_en:'A space reserved for a genuine editing and motion design experience — pending client permission.',rating:0,is_verified:false,is_published:true,sort_order:2},
    {id:'review-demo-03',author_ar:'تقييم موثّق قريبًا',author_en:'Verified feedback coming',job_ar:'المحتوى الإعلاني وذكاء اصطناعي',job_en:'Advertising & AI',quote_ar:'كل مشروع ناجح بيحكي قصة. مكان شهادة عميل عن مشروع إعلاني أو AI Visuals هيتملأ بتقييمه الأصلي.',quote_en:'Every great project tells a story. This slot will feature original client feedback on creative campaigns.',rating:0,is_verified:false,is_published:true,sort_order:3}
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
  selected:'مختارات من عالمي الإبداعي',selected_sub:'ثمانية تصورات إبداعية متنوعة بتقدّم أسلوب العرض — قريبًا هتكون مكانها أعمالي الحقيقية.',
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
  stat1:'مشروع مكتمل',stat2:'سنوات خبرة',stat3:'رضا العملاء',copy_email:'انسخ البريد',copied:'تم نسخ البريد',email_missing:'البريد الإلكتروني لم يُضف بعد',whatsapp:'كلّمني واتساب',community:'انضم لمجتمع AI',
  feature_eyebrow:'CURATED CONCEPTS',feature_title:'مشاريع أعتز بيها.',feature_sub:'تصورات بصرية جريئة من عالمي الإبداعي — تخيل شغلك القادم بالمستوى ده.',feature_all:'شوف كل الأعمال',feature_disclaimer:'المشاريع المعروضة تصورات تصميمية تجريبية وليست أعمالًا منفذة لعملاء.',reviews_eyebrow:'CLIENT VOICES',reviews_title:'التفاصيل اللي بتفرق.',reviews_sub:'كل تعاون ليه حكاية. هنا قريبًا هتلاقي آراء العملاء الحقيقية.',reviews_note:'البطاقات الحالية نماذج توضيحية فقط، وليست تقييمات أو شهادات حقيقية.',review_placeholder:'نموذج توضيحي',review_verified:'تقييم موثّق',cta_title:'شغلك يستحق يتشاف.',cta_sub:'خلّي مشروعك الجاي تجربة بصرية مميزة تعلق في الذاكرة.',cta_button:'خلّينا نعمل حاجة عظيمة',  social_placeholder:'تابع أعمالي على حساباتي الرسمية',portfolio_note:'نماذج تصميمية لمعاينة طريقة عرض الأعمال',about_caption:'الإنسان وراء الأفكار',hero_pic_note:'MOHAMED / CREATIVE DIRECTOR',skip:'انتقل للمحتوى'
};
export const en = {
  nav_work:'Work',nav_services:'Services',nav_about:'About',nav_contact:'Contact',talk:'Start a project',explore:'Explore my work',scroll:'Keep scrolling',
  available:'Available for Freelance Projects',unavailable:'Currently unavailable',hero_card_title:'Creative Mind',hero_card_sub:'Design × Motion × AI',
  selected:'The creative playground',selected_sub:'Eight bold creative concepts preview the style of this gallery, soon to be replaced with real work.',
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
  stat1:'Completed projects',stat2:'Years of experience',stat3:'Client satisfaction',copy_email:'Copy email',copied:'Email copied',email_missing:'Email address has not been added',whatsapp:'WhatsApp me',community:'Join AI Community',
  feature_eyebrow:'CURATED CONCEPTS',feature_title:'Projects worth a second look.',feature_sub:'Bold creative concepts from my visual playground.',feature_all:'Explore all work',feature_disclaimer:'The showcased pieces are speculative portfolio concepts, not client commissions.',reviews_eyebrow:'CLIENT VOICES',reviews_title:'Details make the difference.',reviews_sub:'Every collaboration has a story. Real client feedback is coming soon.',reviews_note:'These are layout examples, not genuine client reviews or endorsements.',review_placeholder:'Preview template',review_verified:'Verified review',cta_title:'Your story deserves to be seen.',cta_sub:'Let’s make your next project something people remember.',cta_button:'Let’s create together',  social_placeholder:'See more of my work on my social accounts',portfolio_note:'Concepts showing how the project grid will look',about_caption:'The human behind the pixels',hero_pic_note:'MOHAMED / CREATIVE DIRECTOR',skip:'Skip to content'
};
export function tField(obj,base,lang) {return obj?.[`${base}_${lang}`] || obj?.[`${base}_${lang==='ar'?'en':'ar'}`] || '';}
export function safeUrl(value) {if(!value)return '';try{const u=new URL(value,window.location.href);return ['https:','http:','mailto:'].includes(u.protocol)?u.href:'';}catch{return '';}}
export function escapeHTML(s='') {return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
