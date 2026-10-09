# Mo Design — Creative Portfolio (V4)

موقع **Mo Design** الرسمي بتصميم عربي/إنجليزي، Dark / Light وواجهة متجاوبة، باسم **Mohamed Mahmoud**. المجالات: Social Media Ads، Video Editing & Motion، AI Visuals وBranding & Identity.

## ما الجديد في V4؟

- عدادات متحركة بالصياغة التي طلبها صاحب الموقع: **+100 مشروع مكتمل، +3 سنوات خبرة، 100% رضا العملاء**. هذه بيانات قدّمها صاحب الموقع ويجب التحقق منها قبل الإعلان النهائي، ويمكن تغييرها في `index.html` (خصائص `data-count`) وملف الترجمة `assets/data.js`.
- قسم **«مشاريع أعتز بيها»**: سلايدر ثلاثي البطاقات، أسهم، نقاط تنقل، أسهم لوحة المفاتيح، سحب باللمس، نافذة تفاصيل لكل مشروع. السلايدر يقرأ المشاريع `featured` المنشورة من نفس المصدر الذي يغذي شبكة الأعمال.
- **8 Concept Posters أصلية** بصيغة SVG محلية، قابلة للاستبدال. تم تصميمها لعرض شكل المعرض فقط؛ **ليست أعمالًا لعملاء، ولا شهادات على تنفيذ خدمات فعلية**. لا تعتمد صورها على خدمات أو روابط خارجية.
- قسم **آراء العملاء** بتصميم أخضر داكن وبطاقات مخصصة. قوالب المعاينة **غير موثّقة** وموسومة بذلك. عند ربط Supabase لا تظهر للعامة إلا الشهادات المنشورة والمعلّمة `is_verified=true` بعد إذن العميل.
- قسم دعوة تواصل مميز، وإتقان الـ Hover، واستخدام صورة محمد وشعاره ذي الوضعين.
- تغيير واتساب في **جميع الواجهة والبيانات وقاعدة البيانات الابتدائية** إلى: `https://wa.me/201097865616`.
- إضافة تبويب «آراء العملاء» في لوحة الإدارة لإنشاء مراجعة وتعديلها وحذفها والتحكم في نشرها وتوثيقها.

## الملفات

- `index.html` — واجهة العرض.
- `admin.html` — لوحة الإدارة (تجريبية بدون قاعدة بيانات، محمية بعد إعداد Supabase).
- `assets/images/concept-*.svg` — تصورات تصميمية تجريبية أصلية قابلة للاستبدال.
- `assets/images/mo-logo-white.webp`, `mo-logo-black.webp`, `mohamed-mahmoud.webp` — ملفات هوية المالك.
- `assets/data.js` — بيانات الواجهة الافتراضية والمشروعات التجريبية وترجمة المحتوى.
- `assets/app.js`, `assets/admin.js`, `assets/api.js`, `assets/styles.css` — منطق الواجهة ولوحة الإدارة والتصميم.
- `supabase/schema.sql` — قاعدة البيانات الجديدة كاملة مع RLS.
- `supabase/migrations/002_testimonials.sql` — **يُنفّذ فقط لمن سبق أن أنشأ قاعدة بيانات Mo Design من نسخة سابقة**.
- `.github/workflows/deploy.yml` — النشر الآلي على GitHub Pages.
- `config.js` — إعداد Supabase العام، بدون أي كلمة مرور أو مفتاح سري.

## المعاينة محليًا

من المجلد الذي يحتوي على `index.html`:

```bash
python -m http.server 8000
```

افتح `http://localhost:8000` و`http://localhost:8000/admin.html`. لوحة الإدارة في وضع المعاينة تحفظ التعديلات في **localStorage في نفس المتصفح فقط**. لا ترفع إضافة أعمال جديدة من لوحة المعاينة وتتوقع وصولها للزوار على الإنترنت؛ عدّل `assets/data.js` وأعد نشر الملفات، أو صِل Supabase للإدارة الحقيقية.

## نشر GitHub Pages مجاني

1. أنشئ مستودعًا **Public** باسم `mo-design-portfolio` في GitHub.
2. ارفع **محتويات مجلد المشروع** لجذر المستودع، مع المجلد المخفي `.github/workflows`.
3. من `Settings → Pages` اختر `GitHub Actions`.
4. بعد نجاح التشغيل في `Actions` يكون العنوان المعتاد `https://USERNAME.github.io/mo-design-portfolio/`.

GitHub Pages يخدم الواجهة الثابتة مجانًا، لكنه **ليس قاعدة بيانات** ولا يوفر لوحة إدارة آمنة بدون خدمة خارجية.

## تفعيل الإدارة ورسائل العملاء عبر Supabase

1. أنشئ مشروعًا على Supabase؛ في مشروع جديد نفّذ `supabase/schema.sql` داخل SQL Editor. لو عندك قاعدة النسخة القديمة، نفّذ **فقط** `supabase/migrations/002_testimonials.sql`.
2. من `Authentication → Users` أنشئ مستخدمًا إداريًا، وسجّل UUID له عبر SQL:

```sql
insert into public.admin_users(user_id) values ('YOUR-ADMIN-USER-UUID');
```

3. اكتب بيانات الاتصال **العامة فقط** داخل `config.js`:

```js
window.PORTFOLIO_CONFIG = {
  supabaseUrl: 'https://YOUR-PROJECT.supabase.co',
  supabasePublishableKey: 'YOUR-PUBLIC-ANON-KEY'
};
```

4. أعد النشر، وسجّل الدخول من `admin.html`. بعدها يمكن إدارة المشاريع والخدمات والآراء من حساب المشرف، واستقبال رسائل نموذج التواصل داخل جدول `inquiries`.

**هام:** لا تضع مفتاح `service_role` أو كلمات مرور داخل GitHub. تأكد من صلاحيات RLS، وأضف CAPTCHA أو rate limiting على رسائل الزوار قبل حملات التسويق الكبيرة، وسياسة خصوصية عند جمع بيانات المستخدمين.

**تنبيه:** عند ربط Supabase في قاعدة بيانات جديدة، يبدأ جدول المشاريع فارغًا عمدًا، فلا نعرض النماذج المفاهيمية على أنها أعمال حقيقية. أضف أعمالك الفعلية بعد الربط. رفع الملفات مباشرة من لوحة الإدارة غير مدمج بعد: استخدم روابط صور HTTPS أو انسخ الملفات إلى `assets/images/` وحدّث مساراتها مع إعادة النشر.

## الروابط المجهزة

WhatsApp: https://wa.me/201097865616  
Behance: https://www.behance.net/mode5  
LinkedIn: https://www.linkedin.com/in/mohamed-mahmoud-97638a211/  
Instagram: https://www.instagram.com/mo.design.official  
TikTok: https://www.tiktok.com/@mohamedmahmoud30  
Facebook: https://www.facebook.com/Mohame.Mahmoud11  
AI Community: https://chat.whatsapp.com/HvJGMrahSBFBmCxRMxD2Z5

لم يرد بريد تواصل حتى الآن، لذلك زر البريد والنسخ غير مفعّلين حتى تضيف عنوانك الصحيح. قبل النشر النهائي يُرجى مراجعة مؤشرات الأداء المذكورة وصور المشاريع والتقييمات وحقوق استخدام محتواها.
