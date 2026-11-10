/* BIOTICWAW · js/config.js
   App settings: version, Supabase project (public anon key), default editable content (DEFAULT_CFG),
   clean() for every piece of data that comes from outside, mergeCfg() and the cached published copy.
   Files are plain scripts loaded in order by index.html (shared global scope, no build step). */
/* ===================== Medical review (fill in to show the stamp) ===================== */
const APP_VERSION='1.6.9';
/* the medical review stamp is set by the owner (menu → site → «ختم المراجعة الطبية») and published with the settings: CFG.review */

/* ===================== Supabase connection (fill after creating the project) ===================== */
/* the live site (production) uses the real project; the preview links (*.workers.dev other than production) use the separate
   free test project «bioticwaw-test», so saving and publishing on a preview never touches the live site (1.12.2) */
const SB_LIVE={url:'https://pxvytusjqpvuwsbiraia.supabase.co',key:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4dnl0dXNqcXB2dXdzYmlyYWlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQyMTQwNzksImV4cCI6MjEwOTc5MDA3OX0.BPAmId10hJEAEV3nKDOkMu7sUSyAkMAP3JzX4exprdY'}; // filled when the BIOTICWAW Supabase project exists
const SB_TEST={url:'https://ehmucaelvxrftspkqrtq.supabase.co',key:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVobXVjYWVsdnhyZnRzcGtxcnRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQyMTU4NjEsImV4cCI6MjEwOTc5MTg2MX0.0rT591287VaTPMb3R6GXRT6D54DGrHSqmZ_mkEyrh6w'}; // the BIOTICWAW test project
const IS_PREVIEW=/\.workers\.dev$/.test(location.hostname)&&!/^bioticwaw\./.test(location.hostname);
const SB=IS_PREVIEW?SB_TEST:SB_LIVE; // public anon keys only (data is protected by RLS); never the service_role key

/* ===================== editable configuration ===================== */
const DEFAULT_CFG={
  contact:{email:'',phone:''},
  refs:null,inter:null,nut:{hide:[],custom:[]},
  colors:{calc:['#0B2E5C','#12A37A'],abx:['#0a4a5c','#1592a8'],tools:['#00167a','#075BFF'],interactions:['#7a2e00','#d9731f'],sources:['#0a4a2c','#17915a'],roadmap:['#3a1678','#7c4dff'],meds:['#7a2e00','#d9731f'],sch:['#00167a','#075BFF'],labs:['#00167a','#075BFF'],ul:['#00167a','#075BFF']},
  /* owner only (1.12.0): main sections — order everywhere, the four in the bottom bar (and the top bar on computers), hidden ones */
  menus:{order:['calc','interactions','sources','abx','roadmap'],bar:['calc','interactions','sources'],hide:[]}, // 1.2.0: the structure: calculator, interactions, medicines, sources
  /* owner only (1.12.0): the tools page — order, hidden tools, names {id:{ar,en}} */
  tools:{order:[],hide:[],names:{}},
  text:{},
  /* 1.14.0 owner: fonts of the body text and the headings (self-hosted Tajawal / Cairo, or the device's own) and their sizes */
  look:{fb:'tajawal',fh:'cairo',sb:1,sh:1,st:1},
  medcat:null, /* 1.13.0: the medicines the site recognizes [{en, ar:[names], hide}]; null = the built-in list (lists.js DRUG_AR). Owner edits; pharmacists propose. */
  nutOrder:[], /* order of the vitamins (ids); empty = default order. Owner only. */
  brand:{l1:'',l2:'',url:''},
  review:{n:{ar:'د. سيف الدين',en:'Dr. Saifaldeen'},date:'2026-10-29'}, /* medical review stamp under each result; empty name = hidden. Owner only. */ /* footer logos: l1 = app logo (empty = built-in), l2 = parent company logo, url = company site */
  /* info pages in the side menu (☰ → معلومات). The owner can edit, hide, add and delete them. Plain text: an empty line starts a new paragraph. */
  pages:[
   {id:'about',t:{"ar": "حول التطبيق", "en": "About the app"},b:{"ar": "BIOTICWAW دليل مرجعي للمضادات الحيوية **للصيادلة**، مبني على مصادر طبية رسمية.\n\n## ماذا يقدّم\n- **الجرعات:** جرعات البالغين حسب نوع العدوى، مع تعديلها حسب وظيفة الكلى، ولكل جرعة مصدرها.\n- **التداخلات:** تداخلات المضادات مع الأدوية والمنتجات الأخرى، مع توقيت الأخذ.\n- **المصادر:** كل معلومة مرتبطة بمصدرها الرسمي.\n\n## مهم\nهذا الموقع للتثقيف والمراجعة المهنية، ولا يغني عن رأي الطبيب أو الصيدلي المختص.", "en": "BIOTICWAW is a reference guide to antibiotics **for pharmacists**, based on official medical sources.\n\n## What it offers\n- **Doses:** adult doses by infection, adjusted for kidney function, with a source for each dose.\n- **Interactions:** antibiotic interactions with other drugs and products, with timing.\n- **Sources:** every item is linked to its official source.\n\n## Important\nThis site is for education and professional review; it does not replace the advice of a doctor or a pharmacist."}},
   {id:'who',t:{"ar": "من نحن", "en": "About us"},b:{"ar": "BIOTICWAW مشروع أكاديمي في الصيدلة – جامعة الشرق الأوسط، بعنوان «حساب جرع المضادات».\n\n## فريق العمل\n- الصيدلي **سيف الدين يحيى خليفة** (قائد الفريق)\n- عبد الرزاق عبد الجليل علي\n- راكان علي شهاب\n- بلال خلف\n\n## هدفنا\nتبسيط الوصول إلى معلومات المضادات الحيوية للصيادلة، بالاعتماد على مصادر علمية رسمية يراجعها صيدلي قبل نشرها.\n\n## كيف نعمل\n- لكل رقم في الموقع مصدر رسمي يظهر رقمه بجانبه.\n- يضيف الصيادلة المدعوون المحتوى، ولا يظهر للزوار إلا بعد أن يعتمده الصيدلي المسؤول.\n- يُسجَّل كل تعديل في «سجل الإجراءات»: ماذا تغيّر، ومن غيّره، ومتى.", "en": "BIOTICWAW is an academic pharmacy project at Middle East University, titled «Antibiotic dose calculation».\n\n## Team\n- Pharmacist **Saifaldeen Yahya Khalifa** (team leader)\n- Abdulrazzaq Abduljaleel Ali\n- Rakan Ali Shehab\n- Bilal Khalaf\n\n## Our aim\nTo make antibiotic dosing information simpler for pharmacists, based on official scientific sources that a pharmacist reviews before they are published.\n\n## How we work\n- Every number on the site has an official source whose number appears next to it.\n- Invited pharmacists add content; visitors see it only after the responsible pharmacist approves it.\n- Every change is recorded in the «Activity log»: what changed, who changed it and when."}},
   {id:'privacy',t:{"ar": "سياسة الخصوصية", "en": "Privacy policy"},b:{"ar": "## لا نجمع بياناتك\nالعمر والوزن والطول والكرياتينين التي تدخلها في الحاسبة تبقى في صفحتك فقط، ولا تُحفظ ولا تُرسل لأي جهة. لا يحتاج الزائر حساباً.\n\n## بلا تتبّع ولا إعلانات\nلا نعدّ الزيارات، ولا أدوات تتبّع من شركات أخرى، ولا إعلانات، ولا ملفات تعريف (كوكي). الخطوط محمّلة من موقعنا نفسه.\n\n## ما يُحفظ على جهازك\n- إعداداتك فقط: اللغة والمظهر وآخر قسم فتحته واختصاراتك في القائمة.\n- تحذفها متى شئت من إعدادات المتصفح (مسح بيانات الموقع).\n\n## حسابات الفريق\nالحسابات للمالك والصيادلة المدعوين فقط، وتُحفظ في قاعدة بيانات محمية، ويُسجَّل ما يغيّرونه في المحتوى.", "en": "## We do not collect your data\nThe age, weight, height and creatinine you enter in the calculator stay on your page only; they are not stored or sent anywhere. Visitors need no account.\n\n## No tracking, no ads\nWe do not count visits, use no third-party trackers, no ads and no cookies. Fonts are served from our own site.\n\n## What is kept on your device\n- Only your settings: language, theme, the last section you opened and your menu shortcuts.\n- Delete them any time from your browser settings (clear site data).\n\n## Team accounts\nAccounts are only for the owner and invited pharmacists, kept in a protected database, and their content changes are logged."}},
   {id:'disclaimer',t:{"ar": "إخلاء المسؤولية", "en": "Disclaimer"},b:{"ar": "## للتثقيف ومساعدة الصيدلي\nالمعلومات في التطبيق للتثقيف ولمساعدة الصيدلي والطبيب، ولا تغني عن الاستشارة الطبية.\n\n## قبل أي جرعة علاجية\n- لا تبدأ جرعة علاجية ولا توقفها دون مراجعة الطبيب أو الصيدلي.\n- احرص أكثر في الحمل والأطفال ومرضى الكلى.\n- اتبع وصفة الطبيب إذا اختلفت عن النتيجة.", "en": "## For education and to support pharmacists\nThe information in this app is for education and to support pharmacists and doctors; it does not replace medical advice.\n\n## Before any treatment dose\n- Do not start or stop a treatment dose without a doctor or pharmacist.\n- Take extra care in pregnancy, children and kidney disease.\n- Follow the doctor's prescription if it differs from the result."}},
  ],
  roadmap:[
   {"st": "now", "go": "sources", "ic": "chart", "t": {"ar": "مصدر رسمي لكل رقم", "en": "An official source for every number"}, "d": {"ar": "كل جرعة وتداخل يحمل رقم مصدره من إرشادات ونشرات رسمية، وروابط المصادر تُفحص بانتظام.", "en": "Every dose and interaction carries the number of its source from official guidelines and labels, and the source links are checked regularly."}},
   {"st": "now", "go": "report", "ic": "share", "t": {"ar": "تقرير للطبيب وبطاقة للمريض", "en": "Doctor report and patient card"}, "d": {"ar": "ملف مفصّل بالنتيجة والخطة والمصادر للطبيب، وبطاقة مبسطة يسلّمها الصيدلي للمريض.", "en": "A detailed file with the result, plan and sources for the doctor, and a simple card the pharmacist hands to the patient."}},
   {"st": "now", "go": "calc", "ic": "plus", "t": {"ar": "واجهة أوضح", "en": "A clearer layout"}, "d": {"ar": "أربعة مربعات في كل سطر بالرمز والاسم، وبطاقات بارزة بحافة ملونة حسب الخطورة أو الحالة، على الهاتف والآيباد والكمبيوتر.", "en": "Four tiles per line with symbol and name, and cards that stand out with a coloured edge by severity or status, on phone, iPad and computer."}},
    {"st": "dev", "go": "calc", "ic": "plus", "t": {"ar": "حاسبة جرع المضادات", "en": "Antibiotic dose calculator"}, "d": {"ar": "حساب الجرعة حسب نوع العدوى والوزن ووظيفة الكلى، لعدد محدود من المضادات، ولكل قاعدة جرعة مصدرها الرسمي. يراجعها الصيدلي قبل النشر.", "en": "The dose by infection, weight and kidney function, for a limited set of antibiotics; every dose rule has its official source. A pharmacist reviews it before publishing."}},
    {"st": "plan", "go": "calc", "ic": "plus", "t": {"ar": "حاسبات مضادات إضافية", "en": "More antibiotic calculators"}, "d": {"ar": "إضافة حاسبات لمضادات أخرى بعد مراجعة مصادرها، حاسبة لكل مضاد أو لكل مجموعة، بنفس الطريقة والمصادر.", "en": "Add calculators for more antibiotics after their sources are reviewed, one per antibiotic or per group, with the same method and sources."}},
    {"st": "dev", "ic": "share", "t": {"ar": "تداخلات المضادات مع بعضها", "en": "Interactions between antibiotics"}, "d": {"ar": "تداخل كل مضاد مع المضادات الأخرى، مثل الجمع الذي يزيد السمية أو يقلل الفعالية، مع المصدر وتوقيت الأخذ.", "en": "How each antibiotic interacts with other antibiotics, such as combinations that raise toxicity or lower effect, with the source and timing."}},
    {"st": "plan", "ic": "pill", "t": {"ar": "تداخلات المضادات مع الأدوية الأخرى", "en": "Antibiotic interactions with other medicines"}, "d": {"ar": "تداخل كل مضاد مع الأدوية الشائعة، مثل مميعات الدم وأدوية الصرع، ومع الأطعمة والمنتجات، مع توقيت الأخذ ومصدر كل تداخل.", "en": "How each antibiotic interacts with common medicines, such as anticoagulants and antiepileptics, and with foods and products, with timing and the source of each interaction."}},
    {"st": "idea", "ic": "clock", "t": {"ar": "تذكير بمدة العلاج", "en": "Treatment duration reminder"}, "d": {"ar": "تذكير بمدة العلاج الموصى بها لكل عدوى، ومتابعة إكماله، حسب المصدر الرسمي.", "en": "A reminder of the recommended treatment duration for each infection, following the official source."}},
  ]
};
/* ===================== data safety =====================
   Everything that comes from the database or the browser cache goes through clean()
   before it is shown. It removes anything that could act as HTML or script:
   - "<" and ">" in any text become full-width ‹ › look-alikes (medical text like "<20" still reads fine)
   - links must start with http:// or https:// (blocks javascript: links)
   - ids, status and icon names may only contain letters, numbers, "_" and "-"
   - colors must be hex (#rrggbb), email and phone must look like an email and a phone number */
const SAFE_ID_KEYS=new Set(['k','id','st','ic','sev','uk','sx','go']);
function clean(v,key){
  if(typeof v==='string'){
    if(key==='url')return /^https?:\/\/[^\s"'<>]+$/i.test(v.trim())?v.trim():'';
    if(key==='l1'||key==='l2')return /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/.test(v)&&v.length<300000?v:''; // uploaded logo (small picture)
    if(SAFE_ID_KEYS.has(key))return v.replace(/[^\w-]/g,'');
    if(key==='email')return /^[^\s@"'<>]+@[^\s@"'<>]+\.[a-z]{2,}$/i.test(v.trim())?v.trim():'';
    if(key==='phone')return v.replace(/[^+\d\s()-]/g,'');
    return v.replace(/</g,'\u2039').replace(/>/g,'\u203A');
  }
  if(Array.isArray(v)){
    if(key==='calc'||key==='interactions'||key==='abx'||key==='sources'&&typeof v[0]==='string')
      return v.map(c=>/^#[0-9a-f]{3,8}$/i.test(c)?c:'#075BFF');
    return v.map(x=>clean(x,SAFE_ID_KEYS.has(key)||key==='hide'||key==='nutOrder'||key==='order'||key==='bar'?'id':undefined));
  }
  if(v&&typeof v==='object'){const o={};for(const[k,x]of Object.entries(v))o[k]=clean(x,k);return o}
  return v;
}
const clone=o=>JSON.parse(JSON.stringify(o));
function mergeCfg(base,over){const out=clone(base);if(!over)return out;over=clean(over);
  if(over.contact)Object.assign(out.contact,over.contact);
  if(over.colors)Object.assign(out.colors,over.colors);
  if(over.text)out.text=Object.assign({},over.text);
  if(Array.isArray(over.roadmap))out.roadmap=over.roadmap;
  if(over.look&&typeof over.look==='object'){const F=['tajawal','cairo','system'],l=over.look,S=v=>{const n=Math.round(+v*20)/20;return n>=0.85&&n<=1.3?n:1}; // 1.16.0: 85%–130% in 5% steps
    out.look={fb:F.includes(l.fb)?l.fb:'tajawal',fh:F.includes(l.fh)?l.fh:'cairo',sb:S(l.sb),sh:S(l.sh),st:S(l.st==null?1:l.st)}}
  if(Array.isArray(over.medcat))out.medcat=over.medcat.filter(m=>m&&typeof m.en==='string'&&/^[a-z0-9][a-z0-9 -]{1,40}$/.test(m.en.trim().toLowerCase())).map(m=>({en:m.en.trim().toLowerCase(),ar:(Array.isArray(m.ar)?m.ar:[]).filter(a=>typeof a==='string'&&a.trim()).map(a=>a.trim().slice(0,40)).slice(0,12),hide:!!m.hide})).slice(0,400);
  if(Array.isArray(over.pages))out.pages=over.pages;
  // approved antibiotics with their interactions. A draft never carries them (they come from publish_site), so the owner's
  // view falls back to the published list; before 1.5.0 the owner saw an empty interactions page after logging in.
  out.ab=Array.isArray(over.ab)?over.ab:(PUBLISHED&&Array.isArray(PUBLISHED.ab)?PUBLISHED.ab:(out.ab||[]));
  if(Array.isArray(over.nutOrder))out.nutOrder=over.nutOrder;
  if(over.review&&over.review.n)out.review={n:{ar:over.review.n.ar||'',en:over.review.n.en||''},date:/^\d{4}-\d{2}-\d{2}$/.test(over.review.date||'')?over.review.date:''};
  if(over.menus&&typeof over.menus==='object')out.menus={order:Array.isArray(over.menus.order)?over.menus.order:out.menus.order,bar:Array.isArray(over.menus.bar)?over.menus.bar:out.menus.bar,hide:Array.isArray(over.menus.hide)?over.menus.hide:[]};
  if(over.menus&&over.menus.groups&&typeof over.menus.groups==='object'){const g=over.menus.groups;out.menus.groups={order:Array.isArray(g.order)?g.order:[],names:g.names&&typeof g.names==='object'?g.names:{},items:g.items&&typeof g.items==='object'?g.items:{},off:Array.isArray(g.off)?g.off.filter(x=>typeof x==='string').slice(0,200):[]}}
  if(over.tools&&typeof over.tools==='object'){out.tools={order:Array.isArray(over.tools.order)?over.tools.order:[],hide:Array.isArray(over.tools.hide)?over.tools.hide:[],names:over.tools.names&&typeof over.tools.names==='object'?over.tools.names:{}};
    // 1.16.0 «follow-up tools»: tools, sections (p:…) and information pages (pg:…) the owner put there, in his order
    // 1.16.0: the owner's names, directions and hidden items inside the schedule (sch:), upper limit (ul:) and lab results (lab:)
    if(over.tools.items&&typeof over.tools.items==='object'){const it={},tx=o=>o&&typeof o==='object'?{ar:String(o.ar||'').slice(0,300),en:String(o.en||'').slice(0,300)}:undefined;
      Object.entries(over.tools.items).slice(0,120).forEach(([k,v])=>{if(/^(sch|ul|lab):[a-z0-9]{1,12}$/.test(k)&&v&&typeof v==='object')it[k]={...(v.n?{n:tx(v.n)}:{}),...(v.h?{h:tx(v.h)}:{}),...(v.off?{off:true}:{})}});out.tools.items=it}
    if(Array.isArray(over.tools.follow))out.tools.follow=[...new Set(over.tools.follow.filter(k=>typeof k==='string'&&/^(tool-[a-z]+|p:[a-z]+|pg:[A-Za-z0-9_-]{1,40}|x:[a-z]{1,20})$/.test(k)))].slice(0,40)}
  if(over.brand)out.brand={l1:over.brand.l1||'',l2:over.brand.l2||'',url:over.brand.url||''};
  if(Array.isArray(over.refs))out.refs=over.refs;
  if(Array.isArray(over.inter))out.inter=over.inter;
  if(over.nut)out.nut={hide:over.nut.hide||[],custom:over.nut.custom||[]};
  return out}
let PUBLISHED=null,CFG=clone(DEFAULT_CFG);
try{const c=localStorage.getItem('vw-cfg');if(c){PUBLISHED=JSON.parse(c);CFG=mergeCfg(DEFAULT_CFG,PUBLISHED)}}catch(e){}
const EMAILF=()=>CFG.contact.email||'';
const PHONEF=()=>(CFG.contact.phone||'').trim();
/** WhatsApp chat link for the contact phone (digits only, international format). */
const waLink=(text='')=>{const d=PHONEF().replace(/\D/g,'');return d?`https://wa.me/${d}${text?'?text='+encodeURIComponent(text):''}`:''};
const mailto=(subj,body='')=>`mailto:${encodeURIComponent(EMAILF()).replace('%40','@')}?subject=${encodeURIComponent(subj)}${body?'&body='+encodeURIComponent(body):''}`;
