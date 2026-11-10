# BIOTICWAW — بطاقة المشروع لموقع Wixa

انسخ كل حقل كما هو في نموذج «تعديل مشروع».

---

## العنوان والتصنيف

**اسم المشروع — عربي**
BIOTICWAW — مرجع المضادات الحيوية وحاسبة الجرعات

**اسم المشروع — English**
BIOTICWAW — Antibiotic reference and dose calculator

**التصنيف — عربي**
منصة صحية / أداة للصيادلة

**التصنيف — English**
Healthcare platform / Pharmacist tool

---

## الوصف

**وصف مختصر — عربي**
مرجع رقمي للمضادات الحيوية مبني على النشرات الرسمية: يحسب الصيدلي جرعة 100 مضاد حيوي حسب نوع العدوى ووظيفة الكلى، ويرى 294 تداخلاً دوائياً، ولكل رقم مصدره الرسمي. يعمل على الهاتف والآيباد والكمبيوتر بالعربية والإنجليزية.

**وصف مختصر — English**
A digital antibiotic reference built from official drug labels: pharmacists calculate the dose of 100 antibiotics by infection and kidney function, review 294 drug interactions, and every number links to its official source. Works on phone, tablet and computer in Arabic and English.

**رابط المشروع**
https://bioticwaw.bioticwaw26.workers.dev

---

## الصور

| الحقل | الملف |
|---|---|
| صورة الشاشة — أفقية 16:10 | `01-desktop-calculator-ar.png` |
| صورة شاشة الجوال — عمودية | `02-mobile-calculator-ar.png` |
| صور إضافية للمعرض | `03-desktop-interactions-ar.png` · `04-desktop-calculator-en-dark.png` · `05-desktop-sources-ar.png` · `06-mobile-medicines-ar-dark.png` · `07-mobile-interactions-en.png` · `08-desktop-how-it-works-ar.png` |

---

## دراسة الحالة

**التحدي — عربي**
معلومات جرعات المضادات الحيوية وتعديلها حسب وظيفة الكلى متفرقة في نشرات طويلة وبلغات مختلفة، والحساب اليدوي لتصفية الكرياتينين يستهلك وقت الصيدلي ويحتمل الخطأ، ولا توجد أداة عربية تربط كل جرعة بمصدرها الرسمي.

**التحدي — English**
Antibiotic doses and their kidney adjustments are scattered across long labels in different languages, calculating creatinine clearance by hand takes the pharmacist's time and invites errors, and there was no Arabic tool that ties every dose to its official source.

**الحل — عربي**
بنينا مرجعاً موحداً: حاسبة تحسب تصفية الكرياتينين (Cockcroft-Gault) والوزن المثالي والمعدّل، ثم تختار الجرعة من قواعد مأخوذة من نشرة كل دواء (FDA / DailyMed أولاً)، مع صفحة للتداخلات وصفحة للأدوية وقائمة مصادر مرقّمة. كل محتوى طبي يمر بمراجعة الصيدلي المسؤول قبل أن يظهر للزوار.

**الحل — English**
We built one reference: a calculator that works out creatinine clearance (Cockcroft-Gault) with ideal and adjusted weight, then picks the dose from rules taken from each drug's label (FDA / DailyMed first), plus an interactions page, a medicines page and a numbered sources list. Every medical item is reviewed by the responsible pharmacist before visitors see it.

**النتيجة — عربي**
100 مضاد حيوي بحاسبة لكل منها، و294 تداخلاً، و126 مصدراً رسمياً، ونتيجة الجرعة في ثوانٍ مع رقم مصدرها. يعمل على كل الأجهزة بالعربية والإنجليزية، مع الوضع الليلي، وبلا تتبّع أو جمع لبيانات المرضى.

**النتيجة — English**
100 antibiotics, each with its own calculator, 294 interactions and 126 official sources; the dose appears in seconds with its source number. Works on every device in Arabic and English, with dark mode, and with no tracking or patient data collection.

---

## صفحة التفاصيل

**التفاصيل — عربي**

```
التحدي
جرعات المضادات الحيوية وتعديلها حسب وظيفة الكلى موزّعة في نشرات رسمية طويلة وبلغات مختلفة. الحساب اليدوي لتصفية الكرياتينين يأخذ وقتاً ويحتمل الخطأ، ولم تكن هناك أداة عربية تربط كل جرعة بمصدرها.

الحل
مرجع رقمي واحد للصيادلة، مبني على النشرات الرسمية للأدوية، يحسب الجرعة ويعرض التداخلات ويذكر مصدر كل رقم.

المزايا
• حاسبة جرعات لـ 100 مضاد حيوي حسب نوع العدوى والعمر والوزن ووظيفة الكلى
• تصفية الكرياتينين بمعادلة Cockcroft-Gault مع الوزن المثالي والمعدّل، وeGFR بمعادلة MDRD عند الحاجة
• 294 تداخلاً دوائياً مع توقيت الأخذ، في بطاقة لكل مضاد مع بحث بالاسم أو الصنف
• تصنيف منظمة الصحة العالمية AWaRe (وصول، مراقبة، احتياط) بلون لكل فئة
• 126 مصدراً رسمياً مرقّماً (FDA / DailyMed، EMA، eMC، ANSM، WHO)، والنقر على الرقم يفتح المصدر
• نسخ النتيجة وطباعتها
• واجهة عربية وإنجليزية، ووضع نهاري وليلي، على الهاتف والآيباد والكمبيوتر
• لوحة للمالك: إضافة وتعديل الأدوية، ومراجعة الصيادلة واعتمادها قبل النشر

الأمان والخصوصية
• لا تُحفظ بيانات المريض ولا تُرسل، وبلا تتبّع أو إعلانات
• حسابات الفريق بالدعوة فقط، والصلاحيات مفروضة في قاعدة البيانات
• كل محتوى طبي جديد لا يظهر للزوار حتى يعتمده الصيدلي المسؤول

التقنيات
• واجهة ويب سريعة تعمل كتطبيق (PWA) على Cloudflare
• قاعدة بيانات Supabase (PostgreSQL) مع سياسات أمان على مستوى الصفوف
• اختبارات آلية قبل كل إصدار: نحو 2000 فحص لقواعد الجرعات، وفحص الواجهة على ثلاثة أحجام بلغتين
```

**التفاصيل — English**

```
The challenge
Antibiotic doses and their kidney adjustments are spread across long official labels in different languages. Calculating creatinine clearance by hand takes time and invites errors, and there was no Arabic tool tying each dose to its source.

The solution
One digital reference for pharmacists, built from the official drug labels, that calculates the dose, shows the interactions and names the source of every number.

Features
• Dose calculator for 100 antibiotics by infection, age, weight and kidney function
• Creatinine clearance by Cockcroft-Gault with ideal and adjusted weight, and eGFR by MDRD where the label needs it
• 294 drug interactions with timing, one card per antibiotic with search by name or class
• WHO AWaRe group (Access, Watch, Reserve) with a colour for each
• 126 numbered official sources (FDA / DailyMed, EMA, eMC, ANSM, WHO); tapping a number opens the source
• Copy and print the result
• Arabic and English interface, light and dark mode, on phone, tablet and computer
• Owner dashboard: add and edit medicines, review pharmacists' changes and approve them before publishing

Security and privacy
• Patient data is never stored or sent; no tracking, no ads
• Team accounts by invitation only, with permissions enforced in the database
• New medical content stays hidden from visitors until the responsible pharmacist approves it

Technology
• Fast web app that installs like an app (PWA), hosted on Cloudflare
• Supabase (PostgreSQL) database with row-level security policies
• Automated tests before every release: about 2,000 dose-rule checks and interface checks on three screen sizes in two languages
```

---

## أرقام المشروع

| الرقم | الوصف — عربي | الوصف — English |
|---|---|---|
| 100 | مضاد حيوي بحاسبة جرعات | Antibiotics with a dose calculator |
| 294 | تداخلاً دوائياً | Drug interactions |
| 126 | مصدراً رسمياً | Official sources |
| AR / EN | واجهة ثنائية اللغة | Bilingual |

---

## النشر
فعّل «منشور ويظهر في الموقع».
