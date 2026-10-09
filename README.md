# Mo Design — Portfolio by Mohamed Mahmoud

**Mo Design** موقع أعمال شخصي عربي/إنجليزي لـ **Mohamed Mahmoud**، مصمم جرافيك ومونتير فيديو متخصص في تصميم إعلانات السوشيال ميديا، الموشن جرافيكس، البراندينج، والفيديوهات والمحتوى البصري باستخدام الذكاء الاصطناعي.

> نسخة مرحلة أولى قابلة للنشر على GitHub Pages: الموقع والعرض التجريبي يعملان مباشرة، لكن **الإدارة المتزامنة واستقبال الرسائل في لوحة التحكم يتطلبان ربط Supabase**. لا توجد بوابة دفع أو حسابات طلاب أو كورسات مفعّلة حاليًا.

## المحتويات

- `index.html` — موقع العرض الرئيسي: عربي/إنجليزي، Dark/Light، Responsive، صورة Mohamed Mahmoud وشعاره، أربعة فلاتر، بطاقات الأعمال، الخدمات، خطوات العمل، مجتمع AI والتواصل.
- `admin.html` — لوحة التحكم: إضافة/تعديل/حذف أعمال وخدمات، إدارة بيانات البراند وروابط التواصل، وعرض رسائل العملاء **عند ربط Supabase**.
- `assets/images/` — صورة شخصية وشعار أبيض وشعار داكن مستخرجة من الصور التي أرسلها مالك الموقع.
- `assets/data.js` — المحتوى الأولي ووضع العرض التجريبي، وروابط الحسابات الحقيقية.
- `assets/app.js` و `assets/admin.js` و `assets/api.js` — منطق الواجهة والإدارة واتصال Supabase.
- `assets/styles.css` — التصميم والحركة والتجاوب.
- `config.js` — مفاتيح اتصال Supabase **العامة فقط**؛ يحتوي الآن على قيم فارغة.
- `supabase/schema.sql` — إنشاء الجداول والسياسات الأمنية وتعبئة الخدمات الافتراضية.
- `.github/workflows/deploy.yml` — نشر GitHub Pages تلقائي من الفرع `main`.
- `PROJECT_PLAN_AR.md` — الخطة المعمارية والتوسع المستقبلي.

## تشغيل الموقع محليًا

أفضل تشغيل الملفات باستخدام سيرفر بسيط لأن JavaScript مبني باستخدام ES Modules:

```bash
cd mo-design-portfolio
python -m http.server 8000
```

ثم افتح `http://localhost:8000` للموقع و `http://localhost:8000/admin.html` للوحة التجريبية. لتعديل المعلومات الأساسية مبدئيًا يمكنك تعديل `assets/data.js` أو العمل محليًا من لوحة الإدارة. **لوحة الإدارة التجريبية تحفظ التغييرات في `localStorage` داخل المتصفح فقط**؛ لا تُحدّث ملفات المصدر ولا تظهر لباقي الزوار.

## النشر المجاني على GitHub Pages

1. أنشئ مستودعًا **Public** على GitHub، وليكن `mo-design-portfolio`.
2. ارفع **محتويات مجلد المشروع** إلى جذر المستودع، وليس مجلدًا إضافيًا بداخله. تأكد من ظهور `index.html` و`.github/workflows/deploy.yml` في الجذر.
3. من **Settings → Pages → Build and deployment** اختر المصدر **GitHub Actions**.
4. ادفع الملفات إلى الفرع `main` وتابع تنفيذ Workflow من تبويب **Actions**.
5. سيكون الرابط عادة: `https://USERNAME.github.io/mo-design-portfolio/` بعد اكتمال أول نشر.

GitHub Pages يستضيف الملفات الثابتة، **وليس قاعدة البيانات أو Backend**. إن كان هدفك أن تعدل الأعمال على الموقع المنشور من لوحة التحكم وأن تستقبل الرسائل، أكمل إعداد Supabase أدناه.

## تفعيل قاعدة البيانات وتسجيل دخول المشرف (Supabase)

1. أنشئ مشروعًا على [supabase.com](https://supabase.com) وانسخ **Project URL** و **Publishable (anon) key**.
2. افتح Supabase → SQL Editor، ثم نفّذ محتويات `supabase/schema.sql` **مرة واحدة في مشروع جديد**.
3. في Supabase → Authentication → Users، أنشئ مستخدمًا إداريًا بالبريد وكلمة مرور قوية (لا تفعّل التسجيل المفتوح لكل المستخدمين).
4. انسخ UUID الخاص بالمستخدم ونفّذ في SQL Editor:

```sql
insert into public.admin_users (user_id)
values ('PUT-ADMIN-USER-UUID-HERE');
```

5. افتح `config.js` وضع **عنوان المشروع والمفتاح العام فقط**:

```js
window.PORTFOLIO_CONFIG = {
  supabaseUrl: 'https://YOUR-PROJECT.supabase.co',
  supabasePublishableKey: 'YOUR-PUBLIC-KEY'
};
```

6. أعد النشر، وافتح `/admin.html` وسجّل الدخول. بعد الربط، سوف تقرأ الصفحة الرئيسية الأعمال والخدمات من Supabase، وسوف تُخزَّن رسائل النموذج في جدول `inquiries` وتظهر للمشرف فقط. لا تضع في GitHub مفاتيح `service_role` أو أسرار الإدارة مطلقًا.

**الأمان:** ملف SQL يفعّل Row Level Security (RLS). الزائر يرى الأعمال والخدمات المنشورة فقط، ويمكنه إضافة رسالة دون قراءة الرسائل الأخرى. الكتابة الإدارية محصورة بالمستخدمين في `admin_users`. قبل إطلاق تسويقي واسع، أضف حماية CAPTCHA وحدودًا لإرسال الرسائل وسياسة خصوصية مناسبة.

## تحديث أعمالك الحقيقية

هناك **4 بطاقات توضيحية صريحة بأنها DEMO** في الوضع المحلي، لأن صور الأعمال الفعلية لم تُقدَّم بعد. لا تُعرض هذه الأعمال الوهمية على أنها أعمال عملاء حقيقيين، كما أن قاعدة Supabase تبدأ **بدون أي مشاريع منشورة**. أضف مشاريعك من الإدارة في Supabase مع صور HTTPS وروابط فيديو/Behance أو أعمال حقيقية. الصور المرفوعة مباشرة من الكمبيوتر غير مفعلة بعد؛ يمكن لاحقًا دمج Supabase Storage.

## بيانات تم إعدادها

- العلامة: **Mo Design** — الاسم: **Mohamed Mahmoud**.
- WhatsApp: <https://wa.me/201015000036>
- AI Community: <https://chat.whatsapp.com/HvJGMrahSBFBmCxRMxD2Z5>
- Behance: <https://www.behance.net/mode5>
- LinkedIn: <https://www.linkedin.com/in/mohamed-mahmoud-97638a211/>
- Instagram: <https://www.instagram.com/mo.design.official>
- TikTok: <https://www.tiktok.com/@mohamedmahmoud30>
- Facebook: <https://www.facebook.com/Mohame.Mahmoud11>
- البريد الإلكتروني: **غير مُقدَّم بعد**؛ يمكنك إضافته من لوحة الإدارة، ولذلك زرّ إرساله/نسخه غير مفعّل بشكل كامل.
- مؤشرات الصفحة: 4 مجالات إبداع + 3 خطوات عمل + لغتان، **وليست أرقام مشاريع أو سنوات خبرة أو نسبة رضا مفترضة دون توثيق**.

## اختبار قبل الإطلاق

- [ ] إدخال عنوان بريد تواصل صحيح.
- [ ] إضافة أعمال فعلية وصور وفيديوهات بعد الحصول على الموافقة/الحقوق اللازمة.
- [ ] ربط Supabase وإنشاء المستخدم الإداري وتجربة ورود الرسائل.
- [ ] التأكد من روابط الشبكات الاجتماعية والحالة «متاح لمشاريع جديدة».
- [ ] اختبار الموبايل والكمبيوتر، العربية والإنجليزية، Dark وLight.
- [ ] إرفاق سياسة خصوصية قبل جمع بيانات المستخدمين على نطاق واسع.

© Mo Design / Mohamed Mahmoud — Original identity assets provided by the project owner.
