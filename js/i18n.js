/* BIOTICWAW · js/i18n.js
   Languages. L(ar,en) picks a string; T(key) reads the I18N dictionary (owner overrides in CFG.text win).
   To add a text: add  key:['عربي','English']  to I18N and use data-t="key" in HTML or T('key') in JS.
   Files are plain scripts loaded in order by index.html (shared global scope, no build step). */
/* ===================== i18n ===================== */
let LANG='ar';
const L=(a,e)=>LANG==='ar'?a:e;
/** texts the owner (or a pharmacist with the text permission) can change from the page; no other key can be replaced */
const EDITABLE=['hc_t','hc_l','ht_t','ht_l','ti_t','hi_l','ts_t','hs_l','rm_t','rm_l','sg_t','sg_l','by','priv','w_t','tab_calc','tab_int','tab_tools','tab_src','tab_rm'];
/** 1.13.0: the owner can reword ANY interface text (CFG.text[key]); texts that carry HTML (links to sources) stay as in the code */
const TXOK=k=>!!I18N[k]&&!/[<>]/.test(I18N[k][0]+I18N[k][1]);
const T0=k=>{const o=(EDITABLE.includes(k)||TXOK(k))&&CFG.text&&CFG.text[k];if(o){const v=LANG==='ar'?o.ar:(o.en||'');if(v)return v}const d=I18N[k];return d?d[LANG==='ar'?0:1]:''};
const T=k=>{const v=T0(k);return LANG==='ar'&&typeof bidiFix==='function'?bidiFix(v):v};
const I18N={

st_by:['راجعه:','Reviewed by:'],pwr_len:['8 أحرف على الأقل','At least 8 characters'],pwr_up:['حرف كبير (A–Z)','A capital letter (A–Z)'],pwr_low:['حرف صغير (a–z)','A small letter (a–z)'],pwr_num:['رقم (0–9)','A number (0–9)'],pwr_sym:['رمز مثل ! @ # $','A symbol such as ! @ # $'],pw_weak:['كلمة المرور لا تحقق كل الشروط تحتها.','The password does not meet all the rules under it.'],rv_owner:['د. سيف الدين','Dr. Saifaldeen'],rv_who:['المراجِع','Reviewer'],rv_other:['اسم آخر (اكتبه في الخانة التالية)','Another name (type it below)'],rv_none:['بدون ختم','No stamp'],rv_needname:['اكتب الاسم.','Enter the name.'],cd_t:['امسح بياناتي من هذا الجهاز','Clear my data from this device'],ph_ss:['ابحث باسم المصدر أو الجهة أو رقمه','Search by source, publisher or number'],mg_help:['المساعدة والمعلومات','Help and information'],lk_ok_h:['هذه المصادر روابطها تعمل ولا تحتاج مراجعة:','These sources have working links and need no review:'],lk_broken_h:['هذه المصادر روابطها لا تعمل (الصفحة غير موجودة). اضغط ✎ على المصدر لتعديل رابطه:','These sources have broken links (page not found). Tap ✎ on a source to fix its link:'],lk_ok:['تعمل','working'],lk_bad:['لا تعمل','not working'],lk_hand:['افتحها بنفسك','check by hand'],lk_blocked_h:['هذه المواقع ترفض الفحص الآلي، افتحها بنفسك للتأكد:','These sites refuse automatic checks; open them yourself to confirm:'],lk_all:['عرض كل المصادر','Show all sources'],
nv_order:['تعديل وترتيب القوائم','Edit and arrange the menus'],
nv_hint:['اسحب ⋮⋮ لتغيير الترتيب، فيتغير في كل التطبيق. «في الشريط» = يظهر في الشريط السفلي على الهاتف والآيباد وفي الشريط العلوي على الكمبيوتر (حتى 4)، والباقي في القائمة. احفظ ثم انشر.','Drag ⋮⋮ to change the order everywhere in the app. «In the bar» = shown in the bottom bar on phones and iPads and in the top bar on computers (up to 4); the rest are in the menu. Save, then publish.'],
nv_bar:['في الشريط','In the bar'],nv_inbar:['في الشريط','In the bar'],nv_min:['يجب أن يبقى قسم واحد على الأقل في الشريط.','At least one section must stay in the bar.'],nv_max:['الشريط يتسع لأربعة أقسام فقط. أخرج واحداً أولاً.','The bar holds only four sections. Remove one first.'],
nv_hidbar:['أظهر القسم أولاً ثم ضعه في الشريط.','Show the section first, then put it in the bar.'],nv_name:['الاسم في القوائم','Name in the menus'],nv_name_en:['الاسم (English)','Name (English)'],
pw_show:['إظهار كلمة المرور','Show password'],pw_hide:['إخفاء كلمة المرور','Hide password'],pw_forgot:['نسيت كلمة المرور','Forgot password'],
pw_needmail:['اكتب بريدك الإلكتروني أولاً.','Enter your e-mail first.'],pw_sent:['إن كان هذا البريد مسجلاً فسيصله رابط لاختيار كلمة مرور جديدة. افتح الرابط من نفس الجهاز.','If this e-mail is registered, a link to choose a new password will arrive. Open it on this device.'],
pw_expired:['انتهت صلاحية الرابط أو استُخدم من قبل. اطلب رابطاً جديداً من «نسيت كلمة المرور».','The link has expired or was already used. Ask for a new one from «Forgot password».'],pw_new_t:['اختر كلمة مرور جديدة','Choose a new password'],
pw_need2:['حسابك محمي بالتحقق بخطوتين: سجّل الدخول ثم غيّر كلمة المرور من «الحساب والأمان».','Your account uses two-step verification: sign in, then change the password in «Account and security».'],
ma_contact:['التواصل','Contact'],tm_page_h:['ادعُ صيدلياً بالبريد، فيصله رابط يفتح صفحة إنشاء حسابه بكلمة مرور يختارها بنفسه. بعد قبول الدعوة يظهر في «الحسابات» وتحدد صلاحياته.','Invite a pharmacist by e-mail: they get a link that opens the create-account page, where they choose their own password. Once they accept, they appear under «Accounts» and you set their permissions.'],gs_short:['بحث','Search'],
ad_look:['مظهر الموقع','Site appearance'],ad_contact:['التواصل','Contact'],ad_pub:['النشر','Publishing'],
mn_recent:['اختصاراتك','Your shortcuts'],

nn_new:['جديد في BIOTICWAW','New in BIOTICWAW'],
tab_calc:['الحاسبة','Calculator'],tab_tools:['الأدوات','Tools'],tab_int:['التداخلات','Interactions'],tab_src:['المصادر','Sources'],tab_rm:['القادم','Coming next'],sg_t:['اقترح ميزة أو أبلغ عن خطأ','Suggest a feature or report an error'],sg_l:['نقرأ كل رسالة. أخبرنا بما تحتاجه في الحاسبة، أو إذا لاحظت رقماً يحتاج مراجعة.','We read every message. Tell us what you need, or if you notice a number that needs checking.'],
cpm:['نسخ البريد','Copy email'],cpd:['تم النسخ','Copied'],mailh:['إن لم يفتح تطبيق البريد، انسخ العنوان وأرسل منه.','If your mail app does not open, copy the address and write to it.'],

priv:['بياناتك تبقى على جهازك فقط، ولا تُحفظ ولا تُرسل لأي جهة.','Your data stays on your device only. It is not saved or sent anywhere.'],
card:['بطاقة المريض','Patient card'],


ph_age:['مثال: 35','e.g. 35'],ph_wt:['مثال: 70','e.g. 70'],ph_ht:['مثال: 165','e.g. 165'],
wa:['واتساب','WhatsApp'],rtp_g:['إرشادات سريرية','Clinical guidelines'],rtp_o:['مراجع رسمية','Official references'],rtp_d:['نشرات أدوية','Drug labels'],rtp_s:['دراسات','Studies'],rtp_c:['مراجع سريرية','Clinical references'],rtp_x:['مصادر أخرى','Other sources'],rt_g:['إرشاد سريري','Clinical guideline'],rt_o:['مرجع رسمي','Official reference'],rt_d:['نشرة دواء','Drug label'],rt_s:['دراسة أو مراجعة منهجية','Study or systematic review'],rt_c:['مرجع سريري','Clinical reference'],rt_x:['مصدر','Source'],rt_note:['مرتبة من الأقوى: الإرشادات السريرية، ثم المراجع الرسمية، ثم نشرات الأدوية، ثم الدراسات، ثم المراجع السريرية.','Ordered strongest first: clinical guidelines, official references, drug labels, studies, then clinical references.'],o_contact_need:['اكتب البريد أو الرقم على الأقل','Enter an email or a phone number'],cpp:['نسخ الرقم','Copy number'],
o_owner:['المالك','Owner'],o_editor:['الصيدلي','Pharmacist'],o_local:['تجربة محلية','Local test'],o_clean:['لا تغييرات غير محفوظة','No unsaved changes'],o_dirty:['تغييرات غير محفوظة','Unsaved changes'],o_saved:['المسودة محفوظة، لم تُنشر بعد','Draft saved, not published yet'],
ed_save:['حفظ','Save'],o_editall:['تعديل','Edit'],
o_preview:['معاينة','Preview'],o_pvexit:['إنهاء المعاينة','End preview'],o_discard:['إلغاء التغييرات','Discard changes'],o_save:['حفظ المسودة','Save draft'],o_publish:['نشر','Publish'],
o_login:['تسجيل الدخول','Sign in'],o_email:['البريد الإلكتروني','Email'],o_pass:['كلمة المرور','Password'],o_in:['دخول','Log in'],o_cancel:['إلغاء','Cancel'],o_ok:['حفظ','Save'],o_del:['حذف','Delete'],o_edit:['تعديل','Edit'],
o_nosb:['لم يُربط التطبيق بـ Supabase بعد. يمكنك تجربة وضع المالك على هذا الجهاز فقط، والتعديلات لن يراها غيرك.','The app is not connected to Supabase yet. You can try owner mode on this device only; nobody else will see the changes.'],
o_trylocal:['تجربة محلية','Try locally'],o_nhide:['إخفاء','Hide'],o_nshow:['إظهار','Show'],o_radd:['إضافة مصدر','Add source'],o_redit:['تعديل المصدر','Edit source'],o_rinfo:['رقم المصدر يُعطى تلقائياً ولا يتغير حتى تبقى الروابط صحيحة.','The source number is assigned automatically and never changes, so links stay correct.'],o_rorg:['الجهة (مثل Medscape أو NIH)','Publisher (e.g. Medscape, NIH)'],o_rtitle:['عنوان المرجع','Reference title'],o_rurl:['الرابط (يبدأ بـ https://)','Link (starts with https://)'],o_ruse:['ماذا يُستخدم منه (اختياري)','What it is used for (optional)'],o_rneed:['اكتب الجهة والعنوان.','Enter the publisher and title.'],o_rbadurl:['الرابط يجب أن يبدأ بـ https://','The link must start with https://'],o_rused:['هذا المصدر مستخدم في:','This source is used in:'],o_radded:['أُضيف المصدر رقم','Added source number'],o_pending:['بانتظار مراجعتك','Awaiting your review'],o_approveall_i:['سيتم اعتماد {n} عنصراً. اعتمد فقط بعد مراجعة كل عنصر ومصدره؛ لن تظهر للزوار إلا بعد النشر.','{n} items will be approved. Approve only after reviewing each item and its source; visitors see them only after you publish.'],o_approve:['اعتماد','Approve'],o_approved:['اعتُمد. احفظ ثم انشر ليظهر للزوار.','Approved. Save, then publish to show it to visitors.'],o_pendn:['بانتظار المراجعة','awaiting review'],o_saveerr:['لم يُحفظ. تحقق من الاتصال وأعد المحاولة.','Not saved. Check the connection and try again.'],o_chpass:['كلمة المرور','Password'],o_chpt:['تغيير كلمة المرور','Change password'],o_newpass:['كلمة المرور الجديدة','New password'],o_chdone:['تم تغيير كلمة المرور.','Password changed.'],o_first:['لديّ دعوة: إنشاء حساب','I have an invitation: create account'],o_firstt:['إنشاء حساب','Create account'],o_firsti:['يعمل فقط للبريد الذي وصلته دعوة من المالك. اختر كلمة مرور لا تقل عن 8 أحرف.','Works only for an email the owner has invited. Choose a password of at least 8 characters.'],o_pass2:['تأكيد كلمة المرور','Confirm password'],o_mismatch:['كلمتا المرور غير متطابقتين.','Passwords do not match.'],o_notinvited:['لم يتم إنشاء الحساب. تأكد أنه نفس البريد الذي وصلته الدعوة، وأن الدعوة لم تُلغَ، وأن الحساب غير موجود مسبقاً.','Account not created. Use the same email the invitation was sent to, check the invitation was not cancelled, and that the account does not already exist.'],o_badlogin:['البريد أو كلمة المرور غير صحيحة.','Wrong email or password.'],o_norole:['هذا الحساب ليس له صلاحية تعديل.','This account has no editing permission.'],o_neterr:['تعذّر الاتصال. تحقق من الإنترنت وحاول مرة أخرى.','Could not connect. Check the internet and try again.'],
o_enwarn:['تذكير: عدّلت النص العربي فقط، حدّث النص الإنكليزي أيضاً','Reminder: you changed only the Arabic text; update the English text too'],o_pubq:['نشر التعديلات للجميع؟','Publish changes to everyone?'],o_note:['ملاحظة (اختياري)','Note (optional)'],
o_pubdone:['تم النشر','Published'],o_savedone:['تم حفظ المسودة','Draft saved'],o_discq:['إلغاء كل التغييرات غير المنشورة؟','Discard all unpublished changes?'],o_discdone:['تم إلغاء التغييرات','Changes discarded'],o_onlyowner:['النشر للمالك فقط. احفظ المسودة ليراجعها المالك.','Only the owner can publish. Save the draft for the owner to review.'],
o_text:['النص (عربي)','Text (Arabic)'],o_texten:['النص الإنجليزي (اختياري)','English text (optional)'],o_colors:['ألوان البنر','Banner colors'],o_c1:['اللون الأول','First color'],o_c2:['اللون الثاني','Second color'],o_reset:['استعادة الافتراضي','Reset to default'],
o_contact:['معلومات التواصل','Contact details'],o_phone:['رقم الهاتف (بالصيغة الدولية، مثل +9647xxxxxxxxx)','Phone number (international, e.g. +9647xxxxxxxxx)'],
o_feat:['ميزة في «القادم»','“Coming next” feature'],o_ftitle:['العنوان','Title'],o_fdesc:['الوصف','Description'],o_fst:['الحالة','Status'],o_fic:['الأيقونة','Icon'],o_add:['إضافة ميزة','Add a feature'],
o_leave:['لديك تغييرات غير محفوظة.','You have unsaved changes.'],
tab_calc_s:['الحاسبة','Calc'],tab_int_s:['التداخلات','Interact'],tab_src_s:['المصادر','Refs'],
hc_t:['حاسبة الجرعات','Dose calculator'],hc_l:['اختر المضاد الحيوي وأدخل بيانات المريض، فتظهر الجرعة والتحذيرات ومصدر كل معلومة.','Choose an antibiotic and enter patient details to see the dose, warnings and the source of each item.'],
ht_t:['أدوات المراجعة','Review tools'],ht_l:['راجع الجرعات حسب الكلى، وتوقيت الأخذ، والتداخلات قبل أي وصفة.','Check doses by kidney function, timing and interactions before any prescription.'],
hi_l:['بعض المضادات تتفاعل مع أدوية أخرى، أو يقل امتصاصها مع الحليب ومضادات الحموضة. هنا الفواصل الزمنية الموصى بها.','Some antibiotics interact with other drugs, or absorb less with milk and antacids. Recommended time gaps are shown here.'],
hs_l:['كل جرعة في الحاسبة مأخوذة من مصدر طبي موثوق: الإرشادات السريرية (Endocrine Society وNICE وWHO وAAP وBSG وASMBS)، وNIH وNHS، ونشرات الأدوية الرسمية، ومراجعات Cochrane.','Every dose in the calculator comes from a trusted medical source: clinical guidelines (Endocrine Society, NICE, WHO, AAP, BSG, ASMBS), the NIH and NHS, official drug labels and Cochrane reviews.'],
rm_t:['BIOTICWAW يتطوّر باستمرار','BIOTICWAW keeps growing'],rm_l:['نعمل على إضافة ميزات تجعل متابعة العلاج أسهل وأدق. هذه أبرز الأفكار القادمة.','We are adding features that make following treatment easier and more precise. Here is what is coming.'],st_dev:['قيد التطوير','In development'],st_plan:['مخطط له','Planned'],st_idea:['قيد الدراسة','Under consideration'],
w_t:['أهلاً بك في BIOTICWAW','Welcome to BIOTICWAW'],w_1:['اختر المضاد الحيوي','Choose an antibiotic'],w_2:['أدخل العمر والوزن والطول والكرياتينين','Enter age, weight, height and creatinine'],w_3:['تظهر الجرعة وتعديل الكلى ومصدرها','See the dose, the kidney adjustment and its source'],
s1:['اختر المضاد الحيوي','Choose an antibiotic'],s2:['بيانات المريض','Patient details'],s3:['النتيجة','Result'],















st_now:['متوفر الآن','Available now'],rm_try:['جرّبه','Try it'],rm_go_none:['بدون زر','No button'],o_fgo:['زر «جرّبه» يفتح','«Try it» opens'],







gs_t:['البحث','Search'],gs_ph:['ابحث في BIOTICWAW: مضاد حيوي، دواء، تداخل، مصدر','Search BIOTICWAW: antibiotic, medicine, interaction, source'],gs_none:['لا توجد نتائج. جرّب اسماً آخر.','No results. Try another name.'],

ckd:['قصور كلوي مزمن متقدم','Advanced chronic kidney disease'],
su_in:['يُستخدم في:','Used in:'],su_at:['رُوجع:','Reviewed:'],
lk_t:['فحص المصادر','Source check'],lk_box:['حالة الروابط','Link status'],lks_ok:['✓ الرابط يعمل','✓ Link works'],lks_broken:['✗ الرابط لا يعمل','✗ Link broken'],lks_blocked:['⚠ يُفتح يدوياً','⚠ Open by hand'],lks_none:['بلا رابط','No link'],lks_new:['لم يُفحص بعد','Not checked yet'],lk_busy:['جارٍ فحص الروابط…','Checking the links…'],lk_last:['آخر فحص {d}: {n} رابطاً. يُعاد الفحص تلقائياً كل أسبوع.','Last check {d}: {n} links. Checked again automatically every week.'],
lk_never:['لم تُفحص الروابط بعد.','The links have not been checked yet.'],lk_broken:['روابط معطلة (الصفحة غير موجودة):','Broken links (page not found):'],lk_okall:['لا توجد روابط معطلة.','No broken links.'],
lk_blocked:['{n} مواقع ترفض الفحص الآلي، افتحها بنفسك للتأكد','{n} sites refuse automatic checks; open them yourself to confirm'],lk_now:['افحص الآن','Check now'],lk_open:['افتح الرابط','Open the link'],





st_dev:['الأجهزة (الأشخاص)','Devices (people)'],


mm_t:['أدوية المريض','Patient medicines'],mc_sent:['أُرسل تعديل الأدوية للمالك للموافقة.','The medicine edit was sent to the owner for approval.'],nt_med_n:['{n} دواء','{n} medicines'],mg_noname:['(بدون عنوان)','(no title)'],lk_title:['الخطوط وأحجامها','Fonts and sizes'],ib_t:['ثبّت تطبيق BIOTICWAW الآن','Install the BIOTICWAW app now'],lg_t:['سجل الإجراءات','Activity log'],lg_i_own:['كل ما فعله الفريق في الموقع: ماذا تغيّر، ومن غيّره، ومتى. تكتبه قاعدة البيانات بنفسها ولا يمكن تعديله.','Everything the team did on the site: what changed, who changed it and when. The database writes it itself and it cannot be edited.'],lg_i_team:['إجراءاتك في الموقع: ماذا غيّرت ومتى.','Your actions on the site: what you changed and when.'],lg_nodb:['سجل الإجراءات يحتاج ملف قاعدة البيانات activity_log_1_16_0.sql. بعد تشغيله يبدأ التسجيل من تلك اللحظة.','The activity log needs the database file activity_log_1_16_0.sql. Once it is run, actions are recorded from that moment.'],lg_none:['لا توجد إجراءات بعد.','No actions yet.'],lg_by:['بواسطة','By'],lg_unknown:['غير معروف','Unknown'],lg_who:['الشخص','Person'],lg_what:['ما تغيّر:','What changed:'],lg_perms:['الصلاحيات:','Permissions:'],
lg_f_all:['الكل','All'],lg_f_content:['المحتوى','Content'],lg_f_set:['الإعدادات','Settings'],lg_f_pub:['النشر','Publishing'],lg_f_team:['الفريق','Team'],
lk_src:['مصدر','Source'],lk_int:['تداخل','Interaction'],lk_draft:['المسودة','Draft'],lk_publish:['نشر','Publish'],lk_team:['الفريق','Team'],
la_add:['إضافة','Added'],la_edit:['تعديل','Edited'],la_del:['حذف','Deleted'],la_hide:['إخفاء','Hidden'],la_show:['إظهار','Shown'],la_restore:['استعادة','Restored'],la_approve:['اعتماد','Approved'],la_reject:['رفض','Rejected'],la_save:['حفظ المسودة','Draft saved'],la_publish:['نشر للزوار','Published'],la_invite:['دعوة صيدلي','Pharmacist invited'],la_join:['انضمام','Joined'],la_perms:['تغيير الصلاحيات','Permissions changed'],la_status:['تغيير الحالة','Status changed'],la_rename:['تغيير الاسم','Name changed'],
lf_org:['الجهة','organisation'],lf_title:['العنوان','title'],lf_url:['الرابط','link'],lf_use:['الاستخدام','use'],lf_kind:['النوع','type'],lf_nut:['المكمّل','supplement'],lf_with:['الدواء','medicine'],lf_desc:['الشرح','description'],lf_sev:['الخطورة','severity'],lf_src:['المصادر','sources'],lf_gap:['الفاصل الزمني','time gap'],lf_hidden:['الإظهار','visibility'],lf_name:['الاسم','name'],lf_hint:['الوصف','description'],lf_unit:['الوحدة','unit'],lf_rows:['جدول الجرعات','dose table'],lf_plan:['الخطة','plan'],lf_note:['الملاحظة','note'],lf_text:['نصوص الواجهة','interface texts'],lf_pages:['الصفحات','pages'],lf_nhide:['إخفاء الفيتامينات','hidden vitamins'],lf_team:['اقتراحات صيدلي','a pharmacist\'s proposals'],lf_teamdone:['قرار المالك على الاقتراحات','the owner\'s decision on proposals'],pb_list:['ما سيتغير عند الزوار','What will change for visitors'],pb_go:['اذهب إليه','Show me'],pb_add:['إضافة:','Added:'],pb_chg:['تعديل:','Changed:'],pb_del:['حذف:','Removed:'],pb_nhide:['إخفاء أو إظهار فيتامينات','Hidden or shown vitamins'],pb_page:['صفحة','Page'],pb_rm:['القادم (خارطة الطريق)','Coming next (roadmap)'],pb_menus:['ترتيب القوائم وأسماؤها','Menu order and names'],pb_tools:['الأدوات (الترتيب والأسماء والإخفاء)','Tools (order, names, hiding)'],pb_review:['ختم المراجعة الطبية','Medical review stamp'],pb_order:['ترتيب الفيتامينات','Vitamin order'],pb_medcat:['قائمة الأدوية','Medicine list'],ud_t:['تراجع عن آخر تعديل','Undo the last change'],ud_s:['تراجع','Undo'],ud_none:['لا يوجد تعديل للتراجع عنه.','Nothing to undo.'],ud_done:['تم التراجع عن آخر تعديل.','The last change was undone.'],as_done:['حُفظت المسودة تلقائياً','Draft saved automatically'],sz_btn:['3 أحجام','3 sizes'],sz_t:['كيف يراه الزائر بعد النشر','How visitors will see it after publishing'],sz_phone:['هاتف','Phone'],sz_ipad:['آيباد','iPad'],sz_pc:['كمبيوتر','Computer'],md_bar:['تنسيق النص','Text formatting'],md_h:['عنوان','Heading'],md_b:['عريض','Bold'],md_l:['نقطة','Bullet'],md_btxt:['نص عريض','bold text'],md_prev:['معاينة الصفحة','Page preview'],lk_win:['الخطوط والأحجام والألوان','Fonts, sizes and colours'],lk_win_s:['مع الشعار، وترى التغيير مباشرة على الصفحة','With the logo; see each change at once on the page'],lk_cols:['ألوان الأقسام','Section colours'],lk_s_h:['عنوان تجريبي','Sample heading'],lk_s_p:['هكذا يظهر نص الصفحات بالخط والحجم الذي تختاره.','This is how page text looks in the font and size you choose.'],lk_fonts:['الخطوط','Fonts'],lk_sizes:['الأحجام','Sizes'],lk_st:['حجم أسماء المربعات','Tile name size'],lk_logos:['الشعاران ورابط الشركة','The two logos and the company link'],lk_undo:['تراجع','Undo'],lk_done:['تم','Done'],lk_sub:['نوع الخط وحجمه للنصوص والعناوين','Font and size for text and headings'],lk_info:['يتغيّر الخط في كل الموقع. «خط الجهاز» أخف وأسرع، وTajawal وCairo من موقعنا نفسه. احفظ ثم انشر.','The font changes across the whole site. «Device font» is lightest and fastest; Tajawal and Cairo are served from our own site. Save, then publish.'],lk_fb:['خط النصوص','Text font'],lk_fh:['خط العناوين والأزرار','Heading and button font'],lk_sb:['حجم النصوص','Text size'],lk_sh:['حجم العناوين','Heading size'],lk_sys:['خط الجهاز','Device font'],lk_s09:['أصغر (90%)','Smaller (90%)'],lk_s1:['عادي (100%)','Normal (100%)'],lk_s11:['أكبر (110%)','Larger (110%)'],lk_s12:['كبير جداً (120%)','Extra large (120%)'],tx_all_s:['ابحث عن أي كلمة تراها في التطبيق وغيّرها بالعربي والإنجليزي','Find any wording you see in the app and change it in Arabic and English'],tx_q:['اكتب كلمة من النص الذي تريد تغييره','Type a word from the text you want to change'],tx_n:['{n} نص، يظهر أول 40','{n} texts, the first 40 shown'],tx_changed:['معدّل','Changed'],tx_ph:['يجب أن يبقى في النص: {p}','The text must keep: {p}'],tx_num:['في هذا النص أرقام طبية: غيّر الصياغة فقط، فالحساب نفسه في الكود ومصدره ثابت.','This text has medical numbers: change the wording only; the calculation itself is in the code with its source.'],














age:['العمر (سنة، 0 للرضيع)','Age (years, 0 = infant)'],sex:['الجنس','Sex'],
sx_m:['ذكر','Male'],sx_f:['أنثى','Female'],
wt:['الوزن (كغم)','Weight (kg)'],ht:['الطول (سم)','Height (cm)'],




neuro:['توجد أعراض عصبية','Neurological symptoms present'],




clr:['مسح البيانات','Clear'],















ab_pub_none:['لا توجد تداخلات منشورة بعد.','No published interactions yet.'],ab_choose:['— اختر دواءً —','— Choose a drug —'],ab_pick_hint:['اختر مضاداً لعرض تداخلاته.','Choose an antibiotic to see its interactions.'],i_res:['التداخلات','Interactions'],ab_no_inter:['لا توجد تداخلات منشورة لهذا المضاد بعد.','No published interactions for this antibiotic yet.'],ab_savebtn:['حفظ','Save'],ab_copy:['نسخ النتيجة','Copy result'],ab_print:['طباعة','Print'],ab_copied:['نُسخت النتيجة','Result copied'],
ti_t:['التداخلات وفواصل الأخذ','Interactions and dose spacing'],
ts_t:['المصادر العلمية','Scientific sources'],ts_m:['كل رقم أزرق في الحاسبة يشير إلى أحد هذه المصادر، وتحت كل مصدر تاريخ آخر مراجعة له.','Every blue number in the calculator points to one of these sources; each source shows the date it was last reviewed.'],
back:['رجوع','Back'],
by:['بواسطة سيف الدين','Powered by Saifaldeen'],vno:['الإصدار','Version'],
copy:['نسخ النتيجة','Copy result'],all:['الكل','All'],
plan:['خطة العلاج','Treatment plan'],
rev:['تمت المراجعة الطبية بواسطة','Medically reviewed by'],
rv_t:['ختم المراجعة الطبية','Medical review stamp'],rv_i:['يظهر تحت كل نتيجة وفي بطاقة المريض وصفحة المصادر. اترك الاسم فارغاً لإخفائه.','Shown under every result, on the patient card and on the sources page. Leave the name empty to hide it.'],rv_n:['الاسم والصفة (عربي)','Name and title (Arabic)'],rv_ne:['الاسم والصفة (إنجليزي)','Name and title (English)'],rv_d:['تاريخ المراجعة','Review date'],rv_ph:['الصيدلي سيف الدين','Pharmacist Saifaldeen'],rv_bad:['اكتب التاريخ بالشكل 2026-10-29','Write the date as 2026-10-29'],
};
/* ----- 1.6.0: side menu (☰), More menu (⋯), info pages, pharmacist accounts ----- */
Object.assign(I18N,{
nav_menu:['القائمة','Menu'],mr_settings:['الإعدادات','Settings'],br_t:['الشعارات','Logos'],br_i:['يظهر الشعاران في دائرتين أسفل الصفحة. اختر صورة PNG أو JPG أو WebP (تُصغّر تلقائياً). الضغط على الشعار يفتح رابط الشركة.','The two logos appear in circles at the bottom of the page. Choose a PNG, JPG or WebP picture (made small automatically). Tapping a logo opens the company link.'],
br_l1:['شعار التطبيق (فارغ = الشعار الأصلي)','App logo (empty = the original logo)'],br_l2:['شعار الشركة المطوّرة','Logo of the company that made the app'],br_url:['رابط موقع الشركة','Company website link'],br_remove:['إزالة','Remove'],br_bad:['تعذّر قراءة الصورة، جرّب صورة أخرى','The picture could not be read; try another one'],br_done:['تم تحديث الشعارات (احفظ ثم انشر)','Logos updated (save, then publish)'],tm_edit:['تعديل الاسم والصلاحيات','Edit name and permissions'],o_drag:['اسحب لتغيير الترتيب','Drag to reorder'],ac_t:['الحساب والأمان','Account & security'],ac_pass:['كلمة المرور','Password'],ac_curpass:['كلمة المرور الحالية','Current password'],ac_badcur:['كلمة المرور الحالية غير صحيحة','The current password is not correct'],
ac_mfa:['التحقق بخطوتين','Two-step verification'],ac_on:['مفعّل','On'],ac_off:['غير مفعّل','Off'],ac_mfa_on:['تفعيل التحقق بخطوتين','Turn on two-step verification'],ac_mfa_off:['إيقاف التحقق بخطوتين','Turn off two-step verification'],
ac_mfa_i:['عند الدخول يُطلب رمز من 6 أرقام من تطبيق على هاتفك (Google Authenticator أو Microsoft Authenticator). حتى لو عرف أحد كلمة المرور لا يستطيع الدخول أو التعديل دون الرمز.','When you sign in you also enter a 6-digit code from an app on your phone (Google Authenticator or Microsoft Authenticator). Even with your password, nobody can sign in or edit without the code.'],
ac_scan:['1) افتح تطبيق المصادقة على هاتفك وامسح الرمز (أو اكتب المفتاح).\n2) اكتب الرمز المكوّن من 6 أرقام الذي يظهر في التطبيق.','1) Open the authenticator app on your phone and scan the code (or type the key).\n2) Enter the 6-digit code the app shows.'],
ac_code:['الرمز (6 أرقام)','Code (6 digits)'],ac_code_t:['رمز التحقق','Verification code'],ac_code_i:['اكتب الرمز المكوّن من 6 أرقام من تطبيق المصادقة على هاتفك.','Enter the 6-digit code from the authenticator app on your phone.'],ac_badcode:['الرمز غير صحيح أو انتهت صلاحيته، جرّب الرمز الجديد','The code is wrong or expired; try the new code'],
ac_activate:['تفعيل','Turn on'],ac_mfa_done:['تم تفعيل التحقق بخطوتين','Two-step verification is on'],ac_mfa_off_i:['سيكفي البريد وكلمة المرور للدخول. ننصح بإبقائه مفعّلاً.','Your email and password alone will be enough to sign in. We recommend keeping it on.'],ac_mfa_offdone:['تم إيقاف التحقق بخطوتين','Two-step verification is off'],
ac_devices:['الأجهزة','Devices'],ac_devices_i:['إذا دخلت من جهاز لم يعد معك، أخرجه من هنا.','If you signed in on a device you no longer have, sign it out here.'],ac_others:['تسجيل الخروج من الأجهزة الأخرى','Sign out of other devices'],ac_others_done:['تم تسجيل الخروج من الأجهزة الأخرى','Signed out of other devices'],nt_texts:['تعديل نصوص الصفحات وصفحات المعلومات','Page texts and info pages'],nt_texts_k:['النصوص','Texts'],nt_tx_n:['نصوص معدّلة: {n}','Changed texts: {n}'],nt_pg_n:['صفحات معلومات: {n}','Info pages: {n}'],nt_was:['كان:','Was:'],
tm_needkey:['لإنشاء حسابك افتح رابط الدعوة الذي أرسله لك المالك (فيه مفتاح خاص بك).','To create your account, open the invitation link the owner sent you (it contains your personal key).'],o_back:['رجوع','Back'],o_yesdel:['نعم، احذف','Yes, delete'],o_discyes:['تجاهل التغييرات','Discard changes'],o_disc_i:['تُلغى التعديلات غير المحفوظة وتعود آخر نسخة محفوظة.','Unsaved edits are dropped and the last saved version comes back.'],
o_leaveyes:['خروج دون حفظ','Leave without saving'],o_discard_s:['تجاهل','Discard'],o_dirty_s:['غير محفوظ','Unsaved'],o_saved_s:['لم يُنشر','Not published'],o_save_s:['حفظ','Save'],o_clean_s:['منشور','Published'],
o_texts:['تعديل وترتيب','Edit and arrange'],o_texts_t:['تعديل النصوص بالقلم ✎ وترتيب القائمة بالسحب ⋮⋮','Edit texts with ✎ and arrange the menu by dragging ⋮⋮'],
o_pub_will:['سيُنشر للزوار: {n} تغيير.','Will go live: {n} change(s).'],o_pub_none:['لا توجد تغييرات جديدة للنشر.','There are no new changes to publish.'],o_pub_wait:['لن يُنشر: {n} بانتظار مراجعتك.','Not published: {n} waiting for your review.'],o_busy:['جارٍ الحفظ…','Saving…'],o_reload:['تحديث المحتوى','Reload content'],o_conflict_t:['تغيّر المحتوى من جهاز آخر','Content changed elsewhere'],
o_conflict_i:['حفظ صيدلي أو جهاز آخر تغييرات بعد أن فتحت هذه الصفحة، فلم نحفظ حتى لا نمسح عمله. حدّث المحتوى ثم أعد تعديلك.','A pharmacist or another device saved changes after you opened this page, so nothing was saved to avoid erasing their work. Reload the content, then redo your edit.'],nt_t:['الإشعارات','Notifications'],nt_new:['إضافة جديدة','New item'],nt_edit:['تعديل على محتوى معتمد','Edit of approved content'],nt_del:['طلب حذف','Deletion request'],nt_by:['بواسطة','by'],
nt_none:['لا توجد إشعارات جديدة','No new notifications'],nt_hint:['قرارك هنا يُحفظ فوراً، ويظهر للزوار بعد «نشر». الزوار يرون النسخة المعتمدة حتى تقرر.','Your decision here is saved at once and reaches visitors after «Publish». Until then visitors see the approved version.'],
nt_waiting:['تغييراً بانتظار قرارك','changes waiting for you'],nt_all:['اعتماد الكل','Approve all'],nt_reject:['رفض','Reject'],nt_view:['عرض','View'],nt_open:['افتح الإشعارات','Open notifications'],
nt_rejq:['رفض هذا التغيير؟','Reject this change?'],nt_rej_i:['تعود النسخة المعتمدة السابقة، أو يُحذف العنصر إذا كان جديداً (حذف مؤقت يمكن استرجاعه).','The previous approved version comes back, or the item is removed if it is new (soft delete, can be restored).'],
nt_restore_i:['يبقى العنصر ظاهراً للزوار ويُلغى طلب الحذف.','The item stays visible to visitors and the deletion request is cancelled.'],
nt_mine:['قرارات المالك على تغييراتك','The owner\'s decisions on your changes'],nt_wait:['بانتظار موافقة المالك','Waiting for the owner'],nt_nowait:['لا شيء بانتظار الموافقة','Nothing is waiting'],nt_ok:['اعتُمد','Approved'],nt_no:['رُفض','Rejected'],o_hiddenb:['مخفي عن الزوار','Hidden from visitors'],o_delq2:['حذف هذا العنصر؟','Delete this item?'],o_rtype:['نوع المصدر','Source type'],o_rt_auto:['تلقائي (حسب الجهة)','Automatic (from the publisher)'],
o_ruse_en:['ماذا يُستخدم منه (English)','What it is used for (English)'],
o_ftitle_en:['العنوان (English)','Title (English)'],o_fdesc_en:['الوصف (English)','Description (English)'],mn_short:['الأقسام','Sections'],
tx_all:['كل نصوص الموقع (بحث)','All texts of the site (search)'],ab_edit_hint:['لتعديل مضاد أو إخفائه اضغط «تعديل وترتيب» في الشريط العلوي.','To edit or hide an antibiotic, press «Edit and arrange» in the top bar.'],mg_admin:['إدارة الموقع','Site management'],mg_texts:['تعديل النصوص (✎ على كل نص)','Edit texts (✎ on every text)'],nv_info:['معلومات','Information'],nv_admin:['الإدارة','Management'],
mr_lang:['اللغة','Language'],mr_theme:['المظهر','Appearance'],
mr_share:['مشاركة التطبيق','Share the app'],mr_install:['تثبيت على الهاتف','Install on phone'],
mr_wa:['واتساب','WhatsApp'],mr_mail:['البريد','Email'],mr_call:['اتصال','Call'],
mr_savemine:['حفظ مسودتي','Save my draft'],
inst_t:['تثبيت التطبيق','Install the app'],
inst_b:['آيفون وآيباد: افتح الموقع في Safari، اضغط زر المشاركة ثم «إضافة إلى الشاشة الرئيسية».\n\nأندرويد: افتح الموقع في Chrome، اضغط ⋮ ثم «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية».\n\nالحاسوب: في Chrome أو Edge اضغط أيقونة التثبيت في شريط العنوان.','iPhone and iPad: open the site in Safari, tap Share, then "Add to Home Screen".\n\nAndroid: open the site in Chrome, tap ⋮, then "Install app" or "Add to Home screen".\n\nComputer: in Chrome or Edge, click the install icon in the address bar.'],
ad_vit:['الفيتامينات','Vitamins'],ad_pages:['صفحات المعلومات','Info pages'],
ad_team:['الصيادلة','Pharmacists'],ad_invite:['＋ دعوة صيدلي','+ Invite a pharmacist'],ad_accounts:['الحسابات والصلاحيات','Accounts and permissions'],ad_invites:['الدعوات المرسلة','Sent invitations'],
rc_was:['المعتمد حالياً:','Approved now:'],rc_okdel:['تأكيد الحذف','Confirm deletion'],rc_restore:['استرجاع','Restore'],
rc_restored:['أعيدت النسخة المعتمدة','The approved version is back'],
ad_colors:['الألوان','Colors'],
pg_new:['صفحة جديدة','New page'],pg_edit:['تعديل الصفحة','Edit page'],pg_t:['العنوان (عربي)','Title (Arabic)'],pg_ten:['العنوان (English)','Title (English)'],
pg_b:['النص (عربي). اترك سطراً فارغاً بين الفقرات','Text (Arabic). Leave an empty line between paragraphs'],pg_ben:['النص (English)','Text (English)'],
pg_vis:['الظهور','Visibility'],pg_shown:['ظاهرة للزوار','Shown to visitors'],pg_hiddenv:['مخفية عن الزوار','Hidden from visitors'],pg_hidden:['مخفية','Hidden'],
pg_need:['اكتب العنوان والنص بالعربية على الأقل','Write at least the Arabic title and text'],
tm_inv_t:['دعوة صيدلي','Invite a pharmacist'],
tm_inv_i:['اختر صلاحياته الآن. الدعوة تكفي: يفتح الصيدلي الرابط وينشئ كلمة مروره ويدخل مباشرة بهذه الصلاحيات، وتستطيع تغييرها أو إيقاف الحساب في أي وقت.','Choose the permissions now. The invitation is enough: the pharmacist opens the link, creates a password and signs in with these permissions. You can change them or suspend the account at any time.'],
tm_name:['الاسم','Name'],tm_email:['البريد الإلكتروني','Email'],tm_perms:['الصلاحيات','Permissions'],
p_inter:['التداخلات','Interactions'],p_refs:['المصادر','Sources'],p_text:['النصوص والصفحات','Texts and pages'],
pl_inter:['إضافة وتعديل التداخلات','Add and edit interactions'],pl_refs:['إضافة وتعديل المصادر','Add and edit sources'],pl_text:['تعديل نصوص الصفحات وصفحات المعلومات','Edit page texts and info pages'],
tm_never:['الصيدلي لا يستطيع أبداً: الاعتماد، النشر، الحذف النهائي، إدارة الحسابات، تغيير التواصل والألوان. كل ما يضيفه يبقى «بانتظار مراجعتك».','A pharmacist can never approve, publish, delete permanently, manage accounts, or change contact details and colors. Everything they add stays "awaiting your review".'],
tm_send:['إنشاء الدعوة','Create invitation'],tm_link_t:['الدعوة جاهزة','Invitation ready'],
tm_link_i:['أرسل الرابط للصيدلي. يفتحه ويختار «إنشاء حساب» بنفس البريد: {email}','Send the link to the pharmacist. They open it and choose "Create account" with the same email: {email}'],
tm_copy:['نسخ الرابط','Copy link'],tm_wa:['واتساب','WhatsApp'],tm_mail:['البريد','Email'],tm_done:['تم','Done'],tm_copied:['تم نسخ الرابط','Link copied'],
tm_msg:['مرحباً {name}، دعوتك لتكون صيدلياً في تطبيق BIOTICWAW.\nافتح الرابط واختر «إنشاء حساب» بهذا البريد: {email}\n{link}','Hello {name}, you are invited to join BIOTICWAW as a pharmacist.\nOpen the link and choose "Create account" with this email: {email}\n{link}'],
tm_subj:['دعوة إلى BIOTICWAW','Invitation to BIOTICWAW'],
tm_active:['نشط','Active'],tm_susp:['موقوف','Suspended'],tm_suspend:['إيقاف','Suspend'],tm_resume:['تفعيل','Activate'],tm_remove:['إزالة','Remove'],
tm_removeq:['إزالة هذا الحساب؟ لن يستطيع الدخول، وتبقى إضافاته محفوظة.','Remove this account? They will no longer be able to sign in; their additions are kept.'],
tm_last:['آخر دخول:','Last sign-in:'],tm_notyet:['لم يدخل بعد','Not signed in yet'],tm_pend:['بانتظار مراجعتك','awaiting your review'],
tm_none:['لا يوجد صيادلة بعد. ابدأ بـ«دعوة صيدلي».','No pharmacists yet. Start with "Invite a pharmacist".'],tm_noinv:['لا توجد دعوات لم تُستخدم بعد','No unused invitations'],
tm_cancel:['إلغاء الدعوة','Cancel invitation'],tm_resend:['إرسال الرابط','Send link'],tm_saved:['تم الحفظ','Saved'],tm_invited:['دُعي','Invited'],
tm_err_member:['هذا البريد لديه حساب مسبقاً','This email already has an account'],tm_err_email:['البريد غير صحيح','Invalid email'],tm_err_name:['اكتب اسم الصيدلي','Write the pharmacist\'s name'],
tm_susp_msg:['حسابك موقوف حالياً. تواصل مع المالك.','Your account is suspended. Contact the owner.'],
tm_noperm:['ليست لديك صلاحية لهذا. يمكن للمالك تفعيلها.','You do not have permission for this. The owner can turn it on.'],
tm_tap:['اضغط على الصلاحية لتشغيلها أو إطفائها','Tap a permission to turn it on or off'],
abx_h:['معلومات من مصادر رسمية: الجرعات حسب العدوى، وتعديل الكلى، وتوقيت الأخذ، والتداخلات. راجع الصيدلي قبل أي وصفة.','Information from official sources: doses by infection, kidney adjustment, timing and interactions. Check with the pharmacist before any prescription.'],
abx_none:['لم تُعتمد المضادات بعد. تظهر هنا بعد مراجعة الصيدلي واعتمادها.','No antibiotics approved yet. They appear here once reviewed and approved.'],
abx_aware:['تصنيف AWaRe','AWaRe group'],abx_uses:['الاستخدام','Use'],abx_dose:['الجرعة','Dose'],abx_renal:['الكلى','Kidney'],
abx_timing:['توقيت الأخذ','Timing'],abx_inter:['التداخلات','Interactions'],abx_src:['المصادر','Sources'],
ab_add:['＋ إضافة مضاد حيوي','＋ Add an antibiotic'],
ab_edit:['تعديل','Edit'],
ab_loading:['جارٍ التحميل…','Loading…'],
ab_id:['المعرّف (أحرف إنجليزية صغيرة وأرقام)','ID (lowercase English letters and digits)'],
ab_name_ar:['الاسم بالعربية','Name in Arabic'],ab_name_en:['الاسم بالإنجليزية','Name in English'],
ab_aware:['تصنيف AWaRe','AWaRe group'],ab_aw_none:['بدون تصنيف','No group'],
ab_cls_ar:['الفئة بالعربية','Class in Arabic'],ab_cls_en:['الفئة بالإنجليزية','Class in English'],
ab_uses_ar:['الاستخدام بالعربية','Use in Arabic'],ab_uses_en:['الاستخدام بالإنجليزية','Use in English'],
ab_dose_ar:['الجرعة بالعربية','Dose in Arabic'],ab_dose_en:['الجرعة بالإنجليزية','Dose in English'],
ab_renal_ar:['تعديل الكلى بالعربية','Kidney adjustment in Arabic'],ab_renal_en:['تعديل الكلى بالإنجليزية','Kidney adjustment in English'],
ab_timing_ar:['توقيت الأخذ بالعربية','Timing in Arabic'],ab_timing_en:['توقيت الأخذ بالإنجليزية','Timing in English'],
ab_src:['أرقام المصادر (مفصولة بفاصلة)','Source numbers (comma separated)'],
ab_need:['الاسم بالعربية والمعرّف مطلوبان. المعرّف أحرف إنجليزية صغيرة وأرقام فقط.','Arabic name and ID are required. The ID uses only lowercase English letters and digits.'],
ab_saved:['تم حفظ المضاد. يظهر للزوار بعد النشر.','Saved. Visitors see it after publishing.'],
ab_hidden_on:['إخفاء','Hide'],ab_hidden_off:['إظهار','Show'],
up_t:['القادم','Upcoming'],
up_now:['متوفر الآن','Available now'],
up_dev:['قيد التطوير','In development'],
up_plan:['مخطط','Planned'],
up_idea:['فكرة','Idea'],
nav_login:['دخول المالك','Owner sign in'],
nav_logout:['خروج','Sign out'],
ab_addbtn:['إضافة مضاد حيوي','Add an antibiotic'],
med_t:['الأدوية','Medicines'],
abx_pend_t:['مضادات بانتظار الاعتماد','Antibiotics awaiting approval'],
abx_all_btn:['اعتماد الكل ({n})','Approve all ({n})'],abx_all_q:['سيُعتمد كل مضاد حيوي ينتظر مع تداخلاته، ثم يظهر للزوار بعد «نشر». اعتمد فقط ما راجعته طبياً.','Every waiting antibiotic is approved with its interactions, and reaches visitors after «Publish». Approve only what you have reviewed medically.'],abx_all_done:['اعتُمد {n}','{n} approved'],abx_ok_btn:['اعتماد','Approve'],
abx_pend_h:['تُعرض هنا المضادات التي حُفظت ولم تُعتمد بعد. الاعتماد يجعلها جاهزة للنشر.','Antibiotics saved but not yet approved are listed here. Approval makes them ready to publish.'],
});
