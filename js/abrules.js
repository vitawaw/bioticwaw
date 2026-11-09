/* BIOTICWAW · js/abrules.js (1.4.2, test)
   Dosing rules for each antibiotic, as data. The engine (js/abcalc.js) reads these; no drug-specific code.
   Each drug: inputs (questions shown to the user), rows (what the result shows, in order).
   A row has rules; the FIRST rule whose `when` matches gives the text. A row with no match is left out.
   `when` keys: an input id (must equal the input's value), or crcl: {gt, gte, lt, lte} on creatinine clearance (mL/min).
   Empty `when` = always matches (use it last as the fallback). `warn:true` marks a warning; `strong:true` marks the main row.
   Medical content: every number is copied from the label named in `label` (FDA / DailyMed). Change only with a pharmacist's review. */
const ABC_RULES = {
  amox: {
    name:{ar:'أموكسيسيلين',en:'Amoxicillin'},
    label:'DailyMed (setid bb7733f8…), 2.2 and 2.5', srcIds:[3],
    inputs:[
      {id:'sev',type:'select',label:{ar:'شدة العدوى',en:'Infection severity'},options:[['mild',{ar:'خفيفة إلى متوسطة',en:'Mild to moderate'}],['severe',{ar:'شديدة',en:'Severe'}]]},
      {id:'hd',type:'check',label:{ar:'غسيل كلوي (دياليزا)',en:'On haemodialysis'}}
    ],
    rows:[
      {k:{ar:'الجرعة المعتادة (ملصق 2.2)',en:'Usual dose (label 2.2)'},rules:[
        {when:{sev:'severe'},text:{ar:'875 mg every 12 h or 500 mg every 8 h',en:'875 mg every 12 h or 500 mg every 8 h'}},
        {when:{},text:{ar:'500 mg every 12 h or 250 mg every 8 h',en:'500 mg every 12 h or 250 mg every 8 h'}}
      ]},
      {k:{ar:'الجرعة المعدّلة حسب الكلى',en:'Kidney-adjusted dose'},strong:true,rules:[
        {when:{hd:true,sev:'severe'},text:{ar:'500 ملغ كل 24 ساعة، مع جرعة إضافية أثناء الغسيل وفي نهايته',en:'500 mg every 24 h, plus an extra dose during and at the end of dialysis'}},
        {when:{hd:true},text:{ar:'250 ملغ كل 24 ساعة، مع جرعة إضافية أثناء الغسيل وفي نهايته',en:'250 mg every 24 h, plus an extra dose during and at the end of dialysis'}},
        {when:{crcl:{lt:10},sev:'severe'},text:{ar:'500 ملغ كل 24 ساعة',en:'500 mg every 24 h'}},
        {when:{crcl:{lt:10}},text:{ar:'250 ملغ كل 24 ساعة',en:'250 mg every 24 h'}},
        {when:{crcl:{lt:30},sev:'severe'},text:{ar:'500 ملغ كل 12 ساعة',en:'500 mg every 12 h'}},
        {when:{crcl:{lt:30}},text:{ar:'250 ملغ كل 12 ساعة',en:'250 mg every 12 h'}},
        {when:{},text:{ar:'لا تعديل (الجرعة المعتادة)',en:'No change (usual dose)'}}
      ]},
      {k:{ar:'تنبيه',en:'Warning'},warn:true,rules:[
        {when:{crcl:{lt:30},hd:false},text:{ar:'لا تُستعمل جرعة 875 ملغ عند تصفية أقل من 30 مل/دقيقة.',en:'Do not use the 875 mg dose when clearance is under 30 mL/min.'}}
      ]},
      {k:{ar:'المدة',en:'Duration'},rules:[
        {when:{},text:{ar:'48 إلى 72 ساعة بعد زوال الأعراض، وعشرة أيام على الأقل لعدوى المكورات العقدية الحالّة',en:'48 to 72 h after symptoms stop; at least 10 days for Streptococcus pyogenes'}}
      ]}
    ],
    notes:{ar:'تحويل الشدة إلى جرعة محددة (250 أو 500 ملغ في الفئة الأولى) يُحدده الصيدلي من الملصق؛ هذه الحاسبة تعرض ما يذكره الملصق.',en:'The pharmacist sets the exact strength from the label; this calculator shows what the label states.'}
  },

  cefalex: {
    name:{ar:'سيفالكسين',en:'Cephalexin'},
    label:'DailyMed capsule label (setid 11cfefee…), 2.1 and 2.3', srcIds:[7],
    inputs:[],
    rows:[
      {k:{ar:'الجرعة المعتادة (ملصق 2.1)',en:'Usual dose (label 2.1)'},rules:[
        {when:{},text:{ar:'250 ملغ كل 6 ساعات أو 500 ملغ كل 12 ساعة، لمدة 7 إلى 14 يوماً',en:'250 mg every 6 h or 500 mg every 12 h, for 7 to 14 days'}}
      ]},
      {k:{ar:'الجرعة المعدّلة حسب الكلى (ملصق 2.3)',en:'Kidney-adjusted dose (label 2.3)'},strong:true,rules:[
        {when:{crcl:{gte:60}},text:{ar:'لا تعديل',en:'No change'}},
        {when:{crcl:{gte:30}},text:{ar:'لا تعديل، مع حد أقصى 1 غرام يومياً',en:'No change; maximum 1 g a day'}},
        {when:{crcl:{gte:15}},text:{ar:'250 ملغ كل 8 إلى 12 ساعة',en:'250 mg every 8 to 12 h'}},
        {when:{crcl:{gte:5}},text:{ar:'250 ملغ كل 24 ساعة',en:'250 mg every 24 h'}},
        {when:{crcl:{gte:1}},text:{ar:'250 ملغ كل 48 إلى 60 ساعة',en:'250 mg every 48 to 60 h'}},
        {when:{},text:{ar:'غير محدد',en:'Not defined'}}
      ]},
      {k:{ar:'الغسيل الكلوي',en:'Haemodialysis'},rules:[
        {when:{},text:{ar:'الملصق لا يحدد جرعة للغسيل الكلوي؛ يُستشار الصيدلي.',en:'The label gives no dose for haemodialysis; consult the pharmacist.'}}
      ]}
    ],
    notes:{ar:'تقييم الكلى بمعادلة Cockcroft-Gault.',en:'Kidney function by Cockcroft-Gault.'}
  },

  cipro: {
    name:{ar:'سيبروفلوكساسين',en:'Ciprofloxacin'},
    label:'DailyMed tablet label (setid 178dc379…), indication and kidney tables', srcIds:[20,4],
    inputs:[
      {id:'ind',type:'select',label:{ar:'نوع العدوى',en:'Type of infection'},options:[
        ['skin',{ar:'الجلد: 500–750 ملغ كل 12 ساعة، 7 إلى 14 يوماً',en:'Skin: 500–750 mg q12h, 7–14 days'}],
        ['bone',{ar:'العظام: 500–750 ملغ كل 12 ساعة، 4 إلى 8 أسابيع',en:'Bone: 500–750 mg q12h, 4–8 weeks'}],
        ['urinary',{ar:'المسالك البولية: 250–500 ملغ كل 12 ساعة، 7 إلى 14 يوماً',en:'Urinary: 250–500 mg q12h, 7–14 days'}],
        ['lower',{ar:'الجهاز التنفسي السفلي: 500–750 ملغ كل 12 ساعة، 7 إلى 14 يوماً',en:'Lower respiratory: 500–750 mg q12h, 7–14 days'}],
        ['cystitis',{ar:'التهاب المثانة غير المعقد: 250 ملغ كل 12 ساعة، 3 أيام',en:'Uncomplicated cystitis: 250 mg q12h, 3 days'}],
        ['sinus',{ar:'التهاب الجيوب: 500 ملغ كل 12 ساعة، 10 أيام',en:'Sinusitis: 500 mg q12h, 10 days'}],
        ['intra',{ar:'البطن (مع الميترونيدازول): 500 ملغ كل 12 ساعة، 7 إلى 14 يوماً',en:'Intra-abdominal (with metronidazole): 500 mg q12h, 7–14 days'}],
        ['diarr',{ar:'الإسهال المعدي: 500 ملغ كل 12 ساعة، 5 إلى 7 أيام',en:'Infectious diarrhoea: 500 mg q12h, 5–7 days'}],
        ['typhoid',{ar:'التيفوئيد: 500 ملغ كل 12 ساعة، 10 أيام',en:'Typhoid: 500 mg q12h, 10 days'}],
        ['prost',{ar:'التهاب البروستاتا المزمن: 500 ملغ كل 12 ساعة، 28 يوماً',en:'Chronic prostatitis: 500 mg q12h, 28 days'}]
      ]}
    ],
    rows:[
      {k:{ar:'الجرعة المعتادة للعدوى (ملصق)',en:'Usual dose for this infection (label)'},rules:[
        {when:{ind:'skin'},text:{ar:'500 إلى 750 ملغ كل 12 ساعة لمدة 7 إلى 14 يوماً',en:'500 to 750 mg every 12 h for 7 to 14 days'}},
        {when:{ind:'bone'},text:{ar:'500 إلى 750 ملغ كل 12 ساعة لمدة 4 إلى 8 أسابيع',en:'500 to 750 mg every 12 h for 4 to 8 weeks'}},
        {when:{ind:'lower'},text:{ar:'500 إلى 750 ملغ كل 12 ساعة لمدة 7 إلى 14 يوماً',en:'500 to 750 mg every 12 h for 7 to 14 days'}},
        {when:{ind:'cystitis'},text:{ar:'250 ملغ كل 12 ساعة لمدة 3 أيام',en:'250 mg every 12 h for 3 days'}},
        {when:{ind:'sinus'},text:{ar:'500 ملغ كل 12 ساعة لمدة 10 أيام',en:'500 mg every 12 h for 10 days'}},
        {when:{ind:'intra'},text:{ar:'500 ملغ كل 12 ساعة لمدة 7 إلى 14 يوماً، مع الميترونيدازول',en:'500 mg every 12 h for 7 to 14 days, with metronidazole'}},
        {when:{ind:'diarr'},text:{ar:'500 ملغ كل 12 ساعة لمدة 5 إلى 7 أيام',en:'500 mg every 12 h for 5 to 7 days'}},
        {when:{ind:'typhoid'},text:{ar:'500 ملغ كل 12 ساعة لمدة 10 أيام',en:'500 mg every 12 h for 10 days'}},
        {when:{ind:'prost'},text:{ar:'500 ملغ كل 12 ساعة لمدة 28 يوماً',en:'500 mg every 12 h for 28 days'}},
        {when:{},text:{ar:'250 إلى 500 ملغ كل 12 ساعة لمدة 7 إلى 14 يوماً',en:'250 to 500 mg every 12 h for 7 to 14 days'}}
      ]},
      {k:{ar:'الجرعة المعدّلة حسب الكلى (جدول الملصق)',en:'Kidney-adjusted dose (label table)'},strong:true,rules:[
        {when:{crcl:{gt:50}},text:{ar:'الجرعة المعتادة',en:'Usual dose'}},
        {when:{crcl:{gte:30}},text:{ar:'250 إلى 500 ملغ كل 12 ساعة',en:'250 to 500 mg every 12 h'}},
        {when:{crcl:{gte:5}},text:{ar:'250 إلى 500 ملغ كل 18 ساعة',en:'250 to 500 mg every 18 h'}},
        {when:{},text:{ar:'غير محدد',en:'Not defined'}}
      ]},
      {k:{ar:'الغسيل الكلوي',en:'Dialysis'},rules:[
        {when:{},text:{ar:'250 إلى 500 ملغ كل 24 ساعة، بعد الغسيل',en:'250 to 500 mg every 24 h, after dialysis'}}
      ]},
      {k:{ar:'توقيت الأخذ',en:'Timing'},rules:[
        {when:{},text:{ar:'قبل مضادات الحموضة والكالسيوم والحديد والزنك ومنتجات الألبان بساعتين، أو بعدها بست ساعات.',en:'2 hours before or 6 hours after antacids, calcium, iron, zinc and dairy.'}}
      ]}
    ],
    notes:{ar:'جدول الكلى لهذا الملصق يذكر ارتفاع التصفية فوق 50 مل/دقيقة؛ تحت 5 يُطلب الصيدلي.',en:'The label kidney table starts above 50 mL/min; below 5 ask the pharmacist.'}
  }
};
