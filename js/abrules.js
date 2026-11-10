/* BIOTICWAW · js/abrules.js (1.4.2, test)
   Dosing rules for each antibiotic, as data. The engine (js/abcalc.js) reads these; no drug-specific code.
   Each drug: inputs (questions shown to the user), rows (what the result shows, in order).
   A row has rules; the FIRST rule whose `when` matches gives the text. A row with no match is left out.
   `when` keys: an input id (must equal the input's value), or crcl: {gt, gte, lt, lte} on creatinine clearance (mL/min).
   Empty `when` = always matches (use it last as the fallback). `warn:true` marks a warning; `strong:true` marks the main row;
   `opt:true` marks a row that may stay empty (shown only when one of its rules matches).
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
  },
  amox_clav: {
    name:{ar:'أموكسيسيلين–كلافولانات',en:'Amoxicillin–clavulanate'},
    label:'DailyMed, amoxicillin and clavulanate potassium tablets (2026-08-29), sections 2.1, 2.2 and 2.4', srcIds:[28], pedsRef:'2.3',
    inputs:[
      {id:'sev',type:'select',label:{ar:'نوع العدوى',en:'Type of infection'},options:[['severe',{ar:'شديدة أو في الجهاز التنفسي',en:'Severe, or respiratory tract'}],['mild',{ar:'أقل شدة',en:'Less severe'}]]},
      {id:'hd',type:'check',label:{ar:'غسيل كلوي (دياليزا)',en:'On haemodialysis'}}
    ],
    rows:[
      {k:{ar:'الجرعة المعتادة (ملصق 2.2)',en:'Usual dose (label 2.2)'},rules:[
        {when:{sev:'severe'},text:{ar:'قرص 875/125 ملغ كل 12 ساعة، أو قرص 500/125 ملغ كل 8 ساعات',en:'one 875/125 mg tablet every 12 h, or one 500/125 mg tablet every 8 h'}},
        {when:{},text:{ar:'قرص 500/125 ملغ كل 12 ساعة، أو قرص 250/125 ملغ كل 8 ساعات',en:'one 500/125 mg tablet every 12 h, or one 250/125 mg tablet every 8 h'}}
      ]},
      {k:{ar:'الجرعة حسب الكلى (ملصق 2.4)',en:'Kidney-adjusted dose (label 2.4)'},strong:true,rules:[
        {when:{hd:true},text:{ar:'500 أو 250 ملغ (أموكسيسيلين) كل 24 ساعة حسب شدة العدوى، مع جرعة إضافية أثناء الغسيل وفي نهايته',en:'500 or 250 mg (amoxicillin) every 24 h by severity, plus an extra dose during and at the end of dialysis'}},
        {when:{crcl:{lt:10}},text:{ar:'500 أو 250 ملغ كل 24 ساعة حسب شدة العدوى',en:'500 or 250 mg every 24 h by severity'}},
        {when:{crcl:{lt:30}},text:{ar:'500 أو 250 ملغ كل 12 ساعة حسب شدة العدوى',en:'500 or 250 mg every 12 h by severity'}},
        {when:{},text:{ar:'لا تعديل (الجرعة المعتادة)',en:'No change (usual dose)'}}
      ]},
      {k:{ar:'تنبيه',en:'Warning'},warn:true,rules:[
        {when:{crcl:{lt:30}},text:{ar:'لا تُستعمل جرعة 875 ملغ عند معدل ترشيح أقل من 30 مل/دقيقة.',en:'Do not use the 875 mg dose when the filtration rate is under 30 mL/min.'}}
      ]},
      {k:{ar:'طريقة الأخذ',en:'How to take'},rules:[
        {when:{},text:{ar:'في بداية الوجبة. قرصان 250/125 لا يساويان قرص 500/125 (كمية الكلافولانات مختلفة).',en:'At the start of a meal. Two 250/125 tablets are not the same as one 500/125 tablet (different clavulanate amount).'}}
      ]}
    ],
    notes:{ar:'جدول الكلى في الملصق بمعدل الترشيح (GFR)؛ الحاسبة تستعمل تصفية الكرياتينين تقديراً له.',en:'The label kidney table uses GFR; the calculator uses creatinine clearance as its estimate.'}
  },

  doxy: {
    name:{ar:'دوكسيسيكلين',en:'Doxycycline'},
    label:'DailyMed, doxycycline hyclate tablets (2026-08-18), Dosage and Administration', srcIds:[30], noRenal:true, pedsRef:'Dosage and Administration',
    inputs:[
      {id:'sev',type:'select',label:{ar:'شدة العدوى',en:'Infection severity'},options:[['usual',{ar:'معتادة',en:'Usual'}],['severe',{ar:'أشد (خاصة المسالك البولية المزمنة)',en:'More severe (especially chronic urinary infection)'}]]}
    ],
    rows:[
      {k:{ar:'الجرعة المعتادة',en:'Usual dose'},strong:true,rules:[
        {when:{sev:'severe'},text:{ar:'100 ملغ كل 12 ساعة',en:'100 mg every 12 h'}},
        {when:{},text:{ar:'200 ملغ في اليوم الأول (100 ملغ كل 12 ساعة)، ثم 100 ملغ يومياً',en:'200 mg on day 1 (100 mg every 12 h), then 100 mg a day'}}
      ]},
      {k:{ar:'الكلى',en:'Kidney'},rules:[
        {when:{},text:{ar:'لا تعديل: الجرعة المعتادة لا تتراكم في القصور الكلوي، والغسيل لا يغيّر عمر النصف.',en:'No change: usual doses do not accumulate in kidney impairment, and dialysis does not change the half-life.'}}
      ]},
      {k:{ar:'طريقة الأخذ',en:'How to take'},rules:[
        {when:{},text:{ar:'مع كمية كافية من الماء لتجنب تهيج المريء. مع الطعام أو الحليب عند تهيج المعدة. مضادات الحموضة (ألمنيوم، كالسيوم، مغنيسيوم) والحديد والبزموت تقلل امتصاصه.',en:'With plenty of water to avoid oesophageal irritation. With food or milk if the stomach is upset. Antacids (aluminium, calcium, magnesium), iron and bismuth reduce its absorption.'}}
      ]},
      {k:{ar:'المدة',en:'Duration'},rules:[
        {when:{},text:{ar:'عشرة أيام لعدوى المكورات العقدية.',en:'10 days for streptococcal infections.'}}
      ]}
    ],
    notes:{ar:'جرعات الأمراض الخاصة (السيلان، الكلاميديا، الجمرة الخبيثة…) في الملصق.',en:'Doses for specific diseases (gonorrhoea, chlamydia, anthrax…) are in the label.'}
  },

  nitro: {
    name:{ar:'نيتروفورانتوين',en:'Nitrofurantoin'},
    label:'DailyMed, nitrofurantoin macrocrystals capsules (2026-06-24), Dosage and Administration and Contraindications', srcIds:[33], pedsRef:'Dosage and Administration',
    inputs:[
      {id:'use',type:'select',label:{ar:'الاستعمال',en:'Use'},options:[['treat',{ar:'علاج التهاب المسالك البولية',en:'Treat a urinary tract infection'}],['supp',{ar:'وقاية طويلة',en:'Long-term suppression'}]]}
    ],
    rows:[
      {k:{ar:'الجرعة',en:'Dose'},strong:true,rules:[
        {when:{crcl:{lt:60}},text:{ar:'لا يُستعمل: الملصق يمنعه عند تصفية الكرياتينين أقل من 60 مل/دقيقة.',en:'Do not use: the label contraindicates it when creatinine clearance is under 60 mL/min.'},warn:true},
        {when:{use:'supp'},text:{ar:'50 إلى 100 ملغ عند النوم',en:'50 to 100 mg at bedtime'}},
        {when:{},text:{ar:'50 إلى 100 ملغ أربع مرات يومياً (الجرعة الأقل لالتهاب المسالك غير المعقد)',en:'50 to 100 mg four times a day (the lower dose for uncomplicated infection)'}}
      ]},
      {k:{ar:'المدة',en:'Duration'},opt:true,rules:[
        {when:{use:'treat'},text:{ar:'أسبوع، أو 3 أيام على الأقل بعد تعقيم البول.',en:'One week, or at least 3 days after the urine is sterile.'}}
      ]},
      {k:{ar:'طريقة الأخذ',en:'How to take'},rules:[
        {when:{},text:{ar:'مع الطعام. لا تُستعمل مضادات الحموضة التي تحتوي ثلاثي سيليكات المغنيسيوم.',en:'With food. Avoid antacids containing magnesium trisilicate.'}}
      ]}
    ],
    notes:{ar:'لا يعالج التهاب الحويضة والكلية. ممنوع في الحمل عند الأسابيع 38 إلى 42 وللرضع أقل من شهر.',en:'Not for pyelonephritis. Contraindicated at 38 to 42 weeks of pregnancy and under one month of age.'}
  },

  metro: {
    name:{ar:'ميترونيدازول',en:'Metronidazole'},
    label:'DailyMed, metronidazole tablets (2026-07-01), Dosage and Administration', srcIds:[34], noRenal:true, pedsRef:'Dosage and Administration',
    inputs:[
      {id:'ind',type:'select',label:{ar:'الاستعمال',en:'Use'},options:[
        ['trich1',{ar:'داء المشعرات: يوم واحد',en:'Trichomoniasis: one day'}],
        ['trich7',{ar:'داء المشعرات: سبعة أيام',en:'Trichomoniasis: seven days'}],
        ['amoeba',{ar:'الزحار الأميبي الحاد',en:'Acute amoebic dysentery'}],
        ['abscess',{ar:'خراج الكبد الأميبي',en:'Amoebic liver abscess'}],
        ['anaer',{ar:'عدوى لاهوائية',en:'Anaerobic infection'}]]},
      {id:'hep',type:'check',label:{ar:'قصور كبدي شديد (Child-Pugh C)',en:'Severe liver impairment (Child-Pugh C)'}},
      {id:'hd',type:'check',label:{ar:'غسيل كلوي (دياليزا)',en:'On haemodialysis'}}
    ],
    rows:[
      {k:{ar:'الجرعة المعتادة',en:'Usual dose'},strong:true,rules:[
        {when:{ind:'trich1'},text:{ar:'2 غرام مرة واحدة، أو 1 غرام مرتين في اليوم نفسه',en:'2 g once, or 1 g twice on the same day'}},
        {when:{ind:'trich7'},text:{ar:'250 ملغ ثلاث مرات يومياً لسبعة أيام',en:'250 mg three times a day for 7 days'}},
        {when:{ind:'amoeba'},text:{ar:'750 ملغ ثلاث مرات يومياً لـ5 إلى 10 أيام',en:'750 mg three times a day for 5 to 10 days'}},
        {when:{ind:'abscess'},text:{ar:'500 أو 750 ملغ ثلاث مرات يومياً لـ5 إلى 10 أيام',en:'500 or 750 mg three times a day for 5 to 10 days'}},
        {when:{},text:{ar:'{mgkg:7.5|max:1000} ملغ كل 6 ساعات (7.5 ملغ/كغ)، بحد أقصى 4 غرام في اليوم، لـ7 إلى 10 أيام',en:'{mgkg:7.5|max:1000} mg every 6 h (7.5 mg/kg), at most 4 g a day, for 7 to 10 days'}}
      ]},
      {k:{ar:'الكبد',en:'Liver'},warn:true,rules:[
        {when:{hep:true},text:{ar:'قصور كبدي شديد: تُخفض الجرعة إلى النصف.',en:'Severe liver impairment: reduce the dose by 50%.'}}
      ]},
      {k:{ar:'الكلى والغسيل',en:'Kidney and dialysis'},rules:[
        {when:{hd:true},text:{ar:'الغسيل يزيل كمية كبيرة منه: إن لم يمكن فصل الجرعة عن جلسة الغسيل، تُعطى جرعة إضافية بعدها حسب حالة المريض.',en:'Dialysis removes a large amount: if the dose cannot be kept apart from the session, consider an extra dose after it.'}},
        {when:{},text:{ar:'لا تعديل للكلى في الملصق.',en:'The label gives no kidney adjustment.'}}
      ]},
      {k:{ar:'تنبيه',en:'Warning'},warn:true,rules:[
        {when:{},text:{ar:'لا كحول ولا منتجات البروبيلين غلايكول أثناء العلاج و3 أيام بعده. لا يُعطى لمن أخذ الديسلفيرام خلال أسبوعين.',en:'No alcohol or propylene glycol products during treatment and for 3 days after. Not for patients who took disulfiram in the last two weeks.'}}
      ]}
    ],
    notes:{ar:'داء المشعرات: لا يُعالج في الثلث الأول من الحمل.',en:'Trichomoniasis: not treated in the first trimester of pregnancy.'}
  },

  azithro: {
    name:{ar:'أزيثروميسين',en:'Azithromycin'},
    label:'DailyMed, azithromycin (2026-09-03), section 2.1 Table 1', srcIds:[32], noRenal:true, pedsRef:'2.2',
    inputs:[
      {id:'ind',type:'select',label:{ar:'نوع العدوى',en:'Type of infection'},options:[
        ['cap',{ar:'التهاب رئة مجتمعي خفيف، أو البلعوم (خيار ثانٍ)، أو الجلد',en:'Mild community pneumonia, pharyngitis (second line) or skin'}],
        ['copd',{ar:'تفاقم التهاب القصبات المزمن',en:'Exacerbation of chronic bronchitis'}],
        ['sinus',{ar:'التهاب الجيوب الحاد',en:'Acute sinusitis'}],
        ['ngu',{ar:'التهاب الإحليل أو عنق الرحم غير السيلاني، أو القرحة التناسلية',en:'Non-gonococcal urethritis or cervicitis, or chancroid'}],
        ['gono',{ar:'التهاب الإحليل أو عنق الرحم السيلاني',en:'Gonococcal urethritis or cervicitis'}]]}
    ],
    rows:[
      {k:{ar:'الجرعة (ملصق 2.1)',en:'Dose (label 2.1)'},strong:true,rules:[
        {when:{ind:'copd'},text:{ar:'500 ملغ في اليوم الأول ثم 250 ملغ يومياً من اليوم 2 إلى 5، أو 500 ملغ يومياً لثلاثة أيام',en:'500 mg on day 1 then 250 mg daily on days 2 to 5, or 500 mg daily for 3 days'}},
        {when:{ind:'sinus'},text:{ar:'500 ملغ يومياً لثلاثة أيام',en:'500 mg daily for 3 days'}},
        {when:{ind:'ngu'},text:{ar:'جرعة واحدة 1 غرام',en:'a single 1 g dose'}},
        {when:{ind:'gono'},text:{ar:'جرعة واحدة 2 غرام',en:'a single 2 g dose'}},
        {when:{},text:{ar:'500 ملغ في اليوم الأول ثم 250 ملغ يومياً من اليوم 2 إلى 5',en:'500 mg on day 1 then 250 mg daily on days 2 to 5'}}
      ]},
      {k:{ar:'الكلى',en:'Kidney'},rules:[
        {when:{},text:{ar:'الملصق لا يذكر تعديل جرعة للكلى.',en:'The label gives no kidney adjustment.'}}
      ]},
      {k:{ar:'طريقة الأخذ',en:'How to take'},rules:[
        {when:{},text:{ar:'مع الطعام أو بدونه.',en:'With or without food.'}}
      ]}
    ],
    notes:{ar:'لا يُستعمل في التهاب الرئة المتوسط أو الشديد الذي يحتاج علاجاً وريدياً.',en:'Not for moderate or severe pneumonia that needs intravenous treatment.'}
  },

  ceftriaxone: {
    name:{ar:'سيفترياكسون',en:'Ceftriaxone'},
    label:'DailyMed, ceftriaxone for injection (2026-07-23), Dosage and Administration', srcIds:[35], noRenal:true, pedsRef:'Dosage and Administration',
    inputs:[
      {id:'ind',type:'select',label:{ar:'الاستعمال',en:'Use'},options:[
        ['usual',{ar:'عدوى عامة',en:'General infection'}],
        ['gono',{ar:'السيلان غير المعقد',en:'Uncomplicated gonorrhoea'}],
        ['proph',{ar:'وقاية قبل الجراحة',en:'Before surgery (prophylaxis)'}]]},
      {id:'hk',type:'check',label:{ar:'قصور كبدي مع مرض كلوي واضح',en:'Liver disease and significant kidney disease'}}
    ],
    rows:[
      {k:{ar:'الجرعة',en:'Dose'},strong:true,rules:[
        {when:{ind:'gono'},text:{ar:'250 ملغ عضلياً مرة واحدة (حسب الملصق)',en:'250 mg intramuscular, once (as in the label)'}},
        {when:{ind:'proph'},text:{ar:'1 غرام وريدياً مرة واحدة، قبل الجراحة بنصف ساعة إلى ساعتين',en:'1 g intravenous once, 30 min to 2 h before surgery'}},
        {when:{hk:true},text:{ar:'1 إلى 2 غرام يومياً، ولا تتجاوز 2 غرام في اليوم',en:'1 to 2 g a day, not more than 2 g a day'}},
        {when:{},text:{ar:'1 إلى 2 غرام مرة يومياً (أو مقسمة على جرعتين) حسب نوع العدوى وشدتها؛ بحد أقصى 4 غرام يومياً',en:'1 to 2 g once a day (or in two divided doses) by type and severity; at most 4 g a day'}}
      ]},
      {k:{ar:'الكلى والغسيل',en:'Kidney and dialysis'},rules:[
        {when:{},text:{ar:'لا تعديل للكلى أو الكبد وحدهما. لا يزول بالغسيل ولا يحتاج جرعة بعده.',en:'No change for kidney or liver impairment alone. Not removed by dialysis; no dose after it.'}}
      ]},
      {k:{ar:'تنبيه',en:'Warning'},warn:true,rules:[
        {when:{},text:{ar:'لا يُخلط مع محاليل الكالسيوم الوريدية ولا يُعطى معها في الخط نفسه في الوقت نفسه.',en:'Do not mix with intravenous calcium solutions or give them together in the same line.'}}
      ]},
      {k:{ar:'المدة',en:'Duration'},rules:[
        {when:{},text:{ar:'يومان على الأقل بعد زوال الأعراض؛ عادة 4 إلى 14 يوماً.',en:'At least 2 days after symptoms stop; usually 4 to 14 days.'}}
      ]}
    ],
    notes:{ar:'إذا اشتُبه بالكلاميديا تُضاف تغطية لها.',en:'Add chlamydia cover if it is suspected.'}
  },

  smx_tmp: {
    name:{ar:'سلفاميثوكسازول–تريميثوبريم',en:'Sulfamethoxazole–trimethoprim'},
    label:'DailyMed, sulfamethoxazole and trimethoprim (2026-09-02), Dosage and Administration', srcIds:[36], pedsRef:'Dosage and Administration',
    inputs:[
      {id:'ind',type:'select',label:{ar:'الاستعمال',en:'Use'},options:[
        ['uti',{ar:'التهاب المسالك البولية',en:'Urinary tract infection'}],
        ['shig',{ar:'الشيغيلا',en:'Shigellosis'}],
        ['copd',{ar:'تفاقم التهاب القصبات المزمن',en:'Exacerbation of chronic bronchitis'}],
        ['trav',{ar:'إسهال المسافرين',en:"Traveller's diarrhoea"}],
        ['pcp',{ar:'علاج التهاب الرئة بالمتكيسة الرئوية',en:'Pneumocystis pneumonia, treatment'}],
        ['proph',{ar:'الوقاية من المتكيسة الرئوية',en:'Pneumocystis prophylaxis'}]]}
    ],
    rows:[
      {k:{ar:'الجرعة المعتادة',en:'Usual dose'},rules:[
        {when:{ind:'shig'},text:{ar:'800/160 ملغ كل 12 ساعة لخمسة أيام',en:'800/160 mg every 12 h for 5 days'}},
        {when:{ind:'copd'},text:{ar:'800/160 ملغ كل 12 ساعة لـ14 يوماً',en:'800/160 mg every 12 h for 14 days'}},
        {when:{ind:'trav'},text:{ar:'800/160 ملغ كل 12 ساعة لخمسة أيام',en:'800/160 mg every 12 h for 5 days'}},
        {when:{ind:'pcp'},text:{ar:'تريميثوبريم {mgkg:15-20} ملغ في اليوم (15 إلى 20 ملغ/كغ) مقسمة كل 6 ساعات، لـ14 إلى 21 يوماً',en:'trimethoprim {mgkg:15-20} mg a day (15 to 20 mg/kg) divided every 6 h, for 14 to 21 days'}},
        {when:{ind:'proph'},text:{ar:'800/160 ملغ مرة يومياً',en:'800/160 mg once a day'}},
        {when:{},text:{ar:'800/160 ملغ كل 12 ساعة لـ10 إلى 14 يوماً',en:'800/160 mg every 12 h for 10 to 14 days'}}
      ]},
      {k:{ar:'حسب الكلى (جدول الملصق)',en:'By kidney function (label table)'},strong:true,rules:[
        {when:{crcl:{lt:15}},text:{ar:'لا يُنصح باستعماله (تصفية أقل من 15 مل/دقيقة)',en:'Use not recommended (clearance under 15 mL/min)'},warn:true},
        {when:{crcl:{lte:30}},text:{ar:'نصف الجرعة المعتادة (تصفية 15 إلى 30 مل/دقيقة)',en:'Half the usual regimen (clearance 15 to 30 mL/min)'}},
        {when:{},text:{ar:'الجرعة المعتادة (تصفية أكثر من 30 مل/دقيقة)',en:'Usual regimen (clearance over 30 mL/min)'}}
      ]}
    ],
    notes:{ar:'800/160 ملغ = قرص قوي واحد (DS) = 20 مل من المعلق.',en:'800/160 mg = one double-strength tablet = 20 mL of the suspension.'}
  },
  clarith: {
    name:{ar:'كلاريثروميسين',en:'Clarithromycin'},
    label:'DailyMed, clarithromycin tablets (2026-04-17), sections 2.2, 2.3 and 2.6', srcIds:[37], pedsRef:'2.4',
    inputs:[
      {id:'ind',type:'select',label:{ar:'نوع العدوى',en:'Type of infection'},options:[
        ['aecb',{ar:'تفاقم التهاب القصبات المزمن',en:'Exacerbation of chronic bronchitis'}],
        ['sinus',{ar:'التهاب الجيوب الفكية الحاد',en:'Acute maxillary sinusitis'}],
        ['cap',{ar:'التهاب الرئة المجتمعي',en:'Community-acquired pneumonia'}],
        ['phar',{ar:'التهاب البلعوم واللوزتين',en:'Pharyngitis or tonsillitis'}],
        ['skin',{ar:'عدوى الجلد غير المعقدة',en:'Uncomplicated skin infection'}],
        ['mac',{ar:'المتفطرة الطيرية المنتشرة (علاج أو وقاية)',en:'Disseminated Mycobacterium avium (treatment or prevention)'}],
        ['hp3',{ar:'جرثومة المعدة مع أموكسيسيلين ومثبط مضخة',en:'H. pylori with amoxicillin and a PPI'}],
        ['hp2',{ar:'جرثومة المعدة مع أوميبرازول فقط',en:'H. pylori with omeprazole only'}]]},
      {id:'pi',type:'check',label:{ar:'يأخذ أتازانافير أو نظاماً يحتوي ريتونافير',en:'Takes atazanavir or a ritonavir regimen'}}
    ],
    rows:[
      {k:{ar:'الجرعة المعتادة (ملصق 2.2)',en:'Usual dose (label 2.2)'},rules:[
        {when:{ind:'aecb'},text:{ar:'250 إلى 500 ملغ كل 12 ساعة لـ7 إلى 14 يوماً',en:'250 to 500 mg every 12 h for 7 to 14 days'}},
        {when:{ind:'sinus'},text:{ar:'500 ملغ كل 12 ساعة لـ14 يوماً',en:'500 mg every 12 h for 14 days'}},
        {when:{ind:'cap'},text:{ar:'250 ملغ كل 12 ساعة لـ7 إلى 14 يوماً',en:'250 mg every 12 h for 7 to 14 days'}},
        {when:{ind:'phar'},text:{ar:'250 ملغ كل 12 ساعة لـ10 أيام',en:'250 mg every 12 h for 10 days'}},
        {when:{ind:'skin'},text:{ar:'250 ملغ كل 12 ساعة لـ7 إلى 14 يوماً',en:'250 mg every 12 h for 7 to 14 days'}},
        {when:{ind:'mac'},text:{ar:'500 ملغ كل 12 ساعة',en:'500 mg every 12 h'}},
        {when:{ind:'hp3'},text:{ar:'500 ملغ كل 12 ساعة لـ10 إلى 14 يوماً مع الأموكسيسيلين ومثبط المضخة',en:'500 mg every 12 h for 10 to 14 days with amoxicillin and the PPI'}},
        {when:{},text:{ar:'500 ملغ كل 8 ساعات لـ14 يوماً مع الأوميبرازول',en:'500 mg every 8 h for 14 days with omeprazole'}}
      ]},
      {k:{ar:'تعديل الكلى (ملصق 2.6)',en:'Kidney adjustment (label 2.6)'},strong:true,rules:[
        {when:{pi:true,crcl:{lt:30}},text:{ar:'تُخفض الجرعة 75%',en:'Reduce the dose by 75%'}},
        {when:{pi:true,crcl:{lte:60}},text:{ar:'تُخفض الجرعة 50%',en:'Reduce the dose by 50%'}},
        {when:{crcl:{lt:30}},text:{ar:'تُخفض الجرعة 50%',en:'Reduce the dose by 50%'}},
        {when:{},text:{ar:'لا تعديل',en:'No change'}}
      ]},
      {k:{ar:'تنبيه',en:'Warning'},warn:true,rules:[
        {when:{},text:{ar:'ممنوع مع السيسابريد والبيموزيد واللوفاستاتين والسيمفاستاتين وقلويدات الإرغوت واللوراسيدون، ومع الكولشيسين عند القصور الكلوي أو الكبدي.',en:'Contraindicated with cisapride, pimozide, lovastatin, simvastatin, ergot alkaloids and lurasidone, and with colchicine in kidney or liver impairment.'}}
      ]}
    ],
    notes:{ar:'مع الطعام أو بدونه.',en:'With or without food.'}
  },

  levo: {
    name:{ar:'ليفوفلوكساسين',en:'Levofloxacin'},
    label:'DailyMed, levofloxacin tablets (2026-07-18), sections 2.1, 2.3 and 2.4', srcIds:[38], pedsRef:'2.2',
    inputs:[
      {id:'ind',type:'select',label:{ar:'نوع العدوى',en:'Type of infection'},options:[
        ['hap',{ar:'التهاب الرئة المكتسب في المستشفى (750 ملغ)',en:'Hospital-acquired pneumonia (750 mg)'}],
        ['cap5',{ar:'التهاب الرئة المجتمعي، 5 أيام (750 ملغ)',en:'Community pneumonia, 5 days (750 mg)'}],
        ['cssi',{ar:'عدوى الجلد المعقدة (750 ملغ)',en:'Complicated skin infection (750 mg)'}],
        ['cuti5',{ar:'المسالك المعقدة أو الحويضة، 5 أيام (750 ملغ)',en:'Complicated urinary or pyelonephritis, 5 days (750 mg)'}],
        ['sinus5',{ar:'التهاب الجيوب، 5 أيام (750 ملغ)',en:'Sinusitis, 5 days (750 mg)'}],
        ['cap',{ar:'التهاب الرئة المجتمعي، 7 إلى 14 يوماً (500 ملغ)',en:'Community pneumonia, 7 to 14 days (500 mg)'}],
        ['ussi',{ar:'عدوى الجلد غير المعقدة (500 ملغ)',en:'Uncomplicated skin infection (500 mg)'}],
        ['prost',{ar:'التهاب البروستاتا المزمن (500 ملغ)',en:'Chronic prostatitis (500 mg)'}],
        ['aecb',{ar:'تفاقم التهاب القصبات المزمن (500 ملغ)',en:'Exacerbation of chronic bronchitis (500 mg)'}],
        ['sinus14',{ar:'التهاب الجيوب، 10 إلى 14 يوماً (500 ملغ)',en:'Sinusitis, 10 to 14 days (500 mg)'}],
        ['anthrax',{ar:'الجمرة الخبيثة الاستنشاقية بعد التعرض (500 ملغ)',en:'Inhalational anthrax, post-exposure (500 mg)'}],
        ['plague',{ar:'الطاعون (500 ملغ)',en:'Plague (500 mg)'}],
        ['cuti10',{ar:'المسالك المعقدة أو الحويضة، 10 أيام (250 ملغ)',en:'Complicated urinary or pyelonephritis, 10 days (250 mg)'}],
        ['uuti',{ar:'المسالك غير المعقدة (250 ملغ)',en:'Uncomplicated urinary infection (250 mg)'}]]},
      {id:'hd',type:'check',label:{ar:'غسيل كلوي دموي أو بريتوني مستمر',en:'Haemodialysis or continuous peritoneal dialysis'}}
    ],
    rows:[
      {k:{ar:'الجرعة المعتادة (تصفية 50 فأكثر)',en:'Usual dose (clearance 50 or more)'},rules:[
        {when:{ind:'hap'},text:{ar:'750 ملغ كل 24 ساعة لـ7 إلى 14 يوماً',en:'750 mg every 24 h for 7 to 14 days'}},
        {when:{ind:['cap5','cuti5','sinus5']},text:{ar:'750 ملغ كل 24 ساعة لـ5 أيام',en:'750 mg every 24 h for 5 days'}},
        {when:{ind:'cssi'},text:{ar:'750 ملغ كل 24 ساعة لـ7 إلى 14 يوماً',en:'750 mg every 24 h for 7 to 14 days'}},
        {when:{ind:'cap'},text:{ar:'500 ملغ كل 24 ساعة لـ7 إلى 14 يوماً',en:'500 mg every 24 h for 7 to 14 days'}},
        {when:{ind:'ussi'},text:{ar:'500 ملغ كل 24 ساعة لـ7 إلى 10 أيام',en:'500 mg every 24 h for 7 to 10 days'}},
        {when:{ind:'prost'},text:{ar:'500 ملغ كل 24 ساعة لـ28 يوماً',en:'500 mg every 24 h for 28 days'}},
        {when:{ind:'aecb'},text:{ar:'500 ملغ كل 24 ساعة لـ7 أيام',en:'500 mg every 24 h for 7 days'}},
        {when:{ind:'sinus14'},text:{ar:'500 ملغ كل 24 ساعة لـ10 إلى 14 يوماً',en:'500 mg every 24 h for 10 to 14 days'}},
        {when:{ind:'anthrax'},text:{ar:'500 ملغ كل 24 ساعة لـ60 يوماً',en:'500 mg every 24 h for 60 days'}},
        {when:{ind:'plague'},text:{ar:'500 ملغ كل 24 ساعة لـ10 إلى 14 يوماً',en:'500 mg every 24 h for 10 to 14 days'}},
        {when:{ind:'cuti10'},text:{ar:'250 ملغ كل 24 ساعة لـ10 أيام',en:'250 mg every 24 h for 10 days'}},
        {when:{},text:{ar:'250 ملغ كل 24 ساعة لـ3 أيام',en:'250 mg every 24 h for 3 days'}}
      ]},
      {k:{ar:'تعديل الكلى (ملصق 2.3)',en:'Kidney adjustment (label 2.3)'},strong:true,rules:[
        {when:{hd:true,ind:['hap','cap5','cssi','cuti5','sinus5']},text:{ar:'750 ملغ أولاً، ثم 500 ملغ كل 48 ساعة',en:'750 mg first, then 500 mg every 48 h'}},
        {when:{hd:true,ind:['cuti10','uuti']},text:{ar:'لا توجد معلومات تعديل في الملصق',en:'No adjustment information in the label'}},
        {when:{hd:true},text:{ar:'500 ملغ أولاً، ثم 250 ملغ كل 48 ساعة',en:'500 mg first, then 250 mg every 48 h'}},
        {when:{crcl:{lt:10}},text:{ar:'الملصق لا يذكر جرعة لتصفية أقل من 10 بلا غسيل؛ يُستشار الصيدلي.',en:'The label gives no dose under 10 mL/min without dialysis; ask the pharmacist.'},warn:true},
        {when:{crcl:{lt:20},ind:['hap','cap5','cssi','cuti5','sinus5']},text:{ar:'750 ملغ أولاً، ثم 500 ملغ كل 48 ساعة',en:'750 mg first, then 500 mg every 48 h'}},
        {when:{crcl:{lt:20},ind:'uuti'},text:{ar:'لا تعديل (المسالك غير المعقدة)',en:'No change (uncomplicated urinary infection)'}},
        {when:{crcl:{lt:20},ind:'cuti10'},text:{ar:'250 ملغ كل 48 ساعة',en:'250 mg every 48 h'}},
        {when:{crcl:{lt:20}},text:{ar:'500 ملغ أولاً، ثم 250 ملغ كل 48 ساعة',en:'500 mg first, then 250 mg every 48 h'}},
        {when:{crcl:{lt:50},ind:['hap','cap5','cssi','cuti5','sinus5']},text:{ar:'750 ملغ كل 48 ساعة',en:'750 mg every 48 h'}},
        {when:{crcl:{lt:50},ind:['cuti10','uuti']},text:{ar:'لا تعديل',en:'No change'}},
        {when:{crcl:{lt:50}},text:{ar:'500 ملغ أولاً، ثم 250 ملغ كل 24 ساعة',en:'500 mg first, then 250 mg every 24 h'}},
        {when:{},text:{ar:'لا تعديل (تصفية 50 فأكثر)',en:'No change (clearance 50 or more)'}}
      ]},
      {k:{ar:'طريقة الأخذ',en:'How to take'},rules:[
        {when:{},text:{ar:'مع الطعام أو بدونه. قبل مضادات الحموضة والسكرالفات والحديد والزنك بساعتين أو بعدها بساعتين. شرب سوائل كافية.',en:'With or without food. 2 h before or after antacids, sucralfate, iron and zinc. Drink enough fluids.'}}
      ]},
      {k:{ar:'تنبيه',en:'Warning'},warn:true,rules:[
        {when:{},text:{ar:'تحذير مؤطر: التهاب الأوتار وتمزقها، اعتلال الأعصاب الطرفية، آثار عصبية مركزية، وتفاقم الوهن العضلي الوبيل.',en:'Boxed warning: tendinitis and tendon rupture, peripheral neuropathy, central nervous system effects, and worsening myasthenia gravis.'}}
      ]}
    ],
    notes:{ar:'أقراص الليفوفلوكساسين للأطفال من 30 كغ فقط.',en:'Levofloxacin tablets are for children of 30 kg or more only.'}
  },

  cefurox: {
    name:{ar:'سيفوروكسيم أكسيتيل',en:'Cefuroxime axetil'},
    label:'DailyMed, cefuroxime axetil tablets (2026-08-05), sections 2.2 and 2.5', srcIds:[39], pedsRef:'2.2',
    inputs:[
      {id:'ind',type:'select',label:{ar:'نوع العدوى',en:'Type of infection'},options:[
        ['phar',{ar:'البلعوم واللوزتين',en:'Pharyngitis or tonsillitis'}],
        ['sinus',{ar:'الجيوب الفكية',en:'Maxillary sinusitis'}],
        ['aecb',{ar:'تفاقم التهاب القصبات المزمن',en:'Exacerbation of chronic bronchitis'}],
        ['skin',{ar:'الجلد غير المعقد',en:'Uncomplicated skin infection'}],
        ['uti',{ar:'المسالك البولية غير المعقدة',en:'Uncomplicated urinary infection'}],
        ['gono',{ar:'السيلان غير المعقد',en:'Uncomplicated gonorrhoea'}],
        ['lyme',{ar:'داء لايم المبكر',en:'Early Lyme disease'}]]},
      {id:'hd',type:'check',label:{ar:'غسيل كلوي (دياليزا)',en:'On haemodialysis'}}
    ],
    rows:[
      {k:{ar:'الجرعة المعتادة (ملصق 2.2)',en:'Usual dose (label 2.2)'},rules:[
        {when:{ind:['phar','sinus']},text:{ar:'250 ملغ كل 12 ساعة لـ10 أيام',en:'250 mg every 12 h for 10 days'}},
        {when:{ind:['aecb','skin']},text:{ar:'250 أو 500 ملغ كل 12 ساعة لـ10 أيام',en:'250 or 500 mg every 12 h for 10 days'}},
        {when:{ind:'uti'},text:{ar:'250 ملغ كل 12 ساعة لـ7 إلى 10 أيام',en:'250 mg every 12 h for 7 to 10 days'}},
        {when:{ind:'gono'},text:{ar:'1000 ملغ مرة واحدة',en:'1000 mg once'}},
        {when:{},text:{ar:'500 ملغ كل 12 ساعة لـ20 يوماً',en:'500 mg every 12 h for 20 days'}}
      ]},
      {k:{ar:'تعديل الكلى (ملصق 2.5)',en:'Kidney adjustment (label 2.5)'},strong:true,rules:[
        {when:{hd:true},text:{ar:'جرعة معتادة إضافية واحدة في نهاية كل جلسة غسيل',en:'One extra standard dose at the end of each dialysis session'}},
        {when:{crcl:{lt:10}},text:{ar:'الجرعة المعتادة كل 48 ساعة',en:'The standard dose every 48 h'}},
        {when:{crcl:{lt:30}},text:{ar:'الجرعة المعتادة كل 24 ساعة',en:'The standard dose every 24 h'}},
        {when:{},text:{ar:'لا تعديل (تصفية 30 فأكثر)',en:'No change (clearance 30 or more)'}}
      ]}
    ],
    notes:{ar:'الأقراص مع الطعام أو بدونه. الأقراص والمعلق ليسا متكافئين ملغاً بملغ.',en:'Tablets with or without food. Tablets and suspension are not interchangeable milligram for milligram.'}
  },

  cefixime: {
    name:{ar:'سيفيكسيم',en:'Cefixime'},
    label:'DailyMed, cefixime tablets (2026-08-05), sections 2.1 and 2.3', srcIds:[40], pedsRef:'2.2',
    inputs:[
      {id:'ind',type:'select',label:{ar:'الاستعمال',en:'Use'},options:[['usual',{ar:'عدوى معتادة',en:'Usual infection'}],['gono',{ar:'السيلان غير المعقد',en:'Uncomplicated gonorrhoea'}]]},
      {id:'dial',type:'select',label:{ar:'الغسيل الكلوي',en:'Dialysis'},options:[['none',{ar:'لا',en:'None'}],['hd',{ar:'غسيل دموي',en:'Haemodialysis'}],['capd',{ar:'غسيل بريتوني مستمر',en:'Continuous peritoneal dialysis'}]]}
    ],
    rows:[
      {k:{ar:'الجرعة المعتادة',en:'Usual dose'},rules:[
        {when:{ind:'gono'},text:{ar:'400 ملغ مرة واحدة',en:'400 mg once'}},
        {when:{},text:{ar:'400 ملغ يومياً (قرص، أو نصف قرص كل 12 ساعة)؛ 10 أيام على الأقل للمكورات العقدية الحالّة',en:'400 mg a day (one tablet, or half every 12 h); at least 10 days for Streptococcus pyogenes'}}
      ]},
      {k:{ar:'القرص حسب الكلى (جدول الملصق)',en:'Tablet by kidney function (label table)'},strong:true,rules:[
        {when:{dial:'capd'},text:{ar:'نصف قرص (200 ملغ) يومياً',en:'Half a tablet (200 mg) a day'}},
        {when:{dial:'hd'},text:{ar:'قرص 400 ملغ غير مناسب؛ يُستعمل شكل آخر حسب جدول الملصق',en:'The 400 mg tablet is not appropriate; use another form as in the label table'},warn:true},
        {when:{crcl:{lte:20}},text:{ar:'نصف قرص (200 ملغ) يومياً',en:'Half a tablet (200 mg) a day'}},
        {when:{crcl:{lt:60}},text:{ar:'قرص 400 ملغ غير مناسب (تصفية 21 إلى 59)؛ يُستعمل شكل آخر حسب جدول الملصق',en:'The 400 mg tablet is not appropriate (clearance 21 to 59); use another form as in the label table'},warn:true},
        {when:{},text:{ar:'الجرعة المعتادة (تصفية 60 فأكثر)',en:'Usual dose (clearance 60 or more)'}}
      ]}
    ],
    notes:{ar:'مع الطعام أو بدونه. الغسيل لا يزيله بكمية مهمة.',en:'With or without food. Dialysis does not remove much.'}
  },

  clinda: {
    name:{ar:'كليندامايسين',en:'Clindamycin'},
    label:'DailyMed, clindamycin hydrochloride capsules (2026-07-17), Dosage and Administration', srcIds:[41], noRenal:true, pedsRef:'Dosage and Administration',
    inputs:[
      {id:'sev',type:'select',label:{ar:'شدة العدوى',en:'Severity'},options:[['serious',{ar:'خطيرة',en:'Serious'}],['more',{ar:'أشد',en:'More severe'}]]}
    ],
    rows:[
      {k:{ar:'الجرعة',en:'Dose'},strong:true,rules:[
        {when:{sev:'more'},text:{ar:'300 إلى 450 ملغ كل 6 ساعات',en:'300 to 450 mg every 6 h'}},
        {when:{},text:{ar:'150 إلى 300 ملغ كل 6 ساعات',en:'150 to 300 mg every 6 h'}}
      ]},
      {k:{ar:'الكلى',en:'Kidney'},rules:[
        {when:{},text:{ar:'لا تعديل للجرعة. قد يضر الكلى: مراقبة وظيفتها.',en:'No dose change. It can harm the kidney: monitor kidney function.'}}
      ]},
      {k:{ar:'طريقة الأخذ',en:'How to take'},rules:[
        {when:{},text:{ar:'مع كوب ماء كامل، وقبل الاستلقاء بنصف ساعة على الأقل.',en:'With a full glass of water, at least 30 minutes before lying down.'}}
      ]},
      {k:{ar:'تنبيه',en:'Warning'},warn:true,rules:[
        {when:{},text:{ar:'إسهال شديد أثناء العلاج: يُوقف الدواء (التهاب القولون بالمطثية العسيرة).',en:'Significant diarrhoea during treatment: stop the drug (Clostridioides difficile colitis).'}}
      ]}
    ],
    notes:{ar:'المكورات العقدية الحالّة بيتا: 10 أيام على الأقل.',en:'Beta-haemolytic streptococci: at least 10 days.'}
  },

  fluclox: {
    name:{ar:'فلوكلوكساسيلين',en:'Flucloxacillin'},
    label:'UK SmPC (eMC), flucloxacillin 500 mg capsules (2025-06-19), section 4.2', srcIds:[42], pedsRef:'4.2',
    inputs:[
      {id:'sev',type:'select',label:{ar:'نوع العدوى',en:'Type of infection'},options:[['usual',{ar:'معتادة',en:'Usual'}],['serious',{ar:'خطيرة',en:'Serious'}],['bone',{ar:'التهاب العظم أو الشغاف',en:'Osteomyelitis or endocarditis'}]]}
    ],
    rows:[
      {k:{ar:'الجرعة للبالغين',en:'Adult dose'},rules:[
        {when:{sev:'serious'},text:{ar:'500 ملغ أربع مرات يومياً (ضعف الجرعة المعتادة)',en:'500 mg four times a day (double the usual dose)'}},
        {when:{sev:'bone'},text:{ar:'حتى 8 غرام يومياً مقسمة كل 6 إلى 8 ساعات',en:'Up to 8 g a day divided every 6 to 8 h'}},
        {when:{},text:{ar:'250 ملغ أربع مرات يومياً',en:'250 mg four times a day'}}
      ]},
      {k:{ar:'الكلى',en:'Kidney'},strong:true,rules:[
        {when:{crcl:{lt:10}},text:{ar:'قصور شديد: يُنظر في تخفيض الجرعة أو إطالة الفاصل؛ الحد الأقصى 1 غرام كل 8 إلى 12 ساعة.',en:'Severe failure: consider a lower dose or longer interval; maximum 1 g every 8 to 12 h.'}},
        {when:{},text:{ar:'لا يحتاج عادة تخفيضاً.',en:'Usually no reduction.'}}
      ]},
      {k:{ar:'طريقة الأخذ',en:'How to take'},rules:[
        {when:{},text:{ar:'على معدة فارغة: قبل الطعام بساعة أو بعده بساعتين، مع كوب ماء كامل.',en:'On an empty stomach: 1 h before or 2 h after food, with a full glass of water.'}}
      ]}
    ],
    notes:{ar:'لا يزول بالغسيل، ولا يحتاج جرعة إضافية بعده. ملصق بريطاني لعدم وجود ملصق أمريكي.',en:'Not removed by dialysis; no extra dose after it. UK label, as there is no US label.'}
  },

  cefazolin: {
    name:{ar:'سيفازولين',en:'Cefazolin'},
    label:'DailyMed, cefazolin for injection (2026-05-14), Dosage and Administration', srcIds:[43], pedsRef:'Dosage and Administration',
    inputs:[
      {id:'ind',type:'select',label:{ar:'نوع العدوى',en:'Type of infection'},options:[
        ['modsev',{ar:'متوسطة إلى شديدة',en:'Moderate to severe'}],
        ['mild',{ar:'خفيفة بالمكورات موجبة الغرام',en:'Mild, Gram-positive cocci'}],
        ['uti',{ar:'المسالك البولية الحادة غير المعقدة',en:'Acute uncomplicated urinary infection'}],
        ['pneumo',{ar:'الالتهاب الرئوي بالمكورات الرئوية',en:'Pneumococcal pneumonia'}],
        ['severe',{ar:'شديدة مهددة للحياة (التهاب الشغاف، تسمم الدم)',en:'Severe, life-threatening (endocarditis, septicaemia)'}],
        ['proph',{ar:'الوقاية حول الجراحة',en:'Perioperative prophylaxis'}]]}
    ],
    rows:[
      {k:{ar:'الجرعة المعتادة',en:'Usual dose'},rules:[
        {when:{ind:'mild'},text:{ar:'250 إلى 500 ملغ كل 8 ساعات',en:'250 to 500 mg every 8 h'}},
        {when:{ind:'uti'},text:{ar:'1 غرام كل 12 ساعة',en:'1 g every 12 h'}},
        {when:{ind:'pneumo'},text:{ar:'500 ملغ كل 12 ساعة',en:'500 mg every 12 h'}},
        {when:{ind:'severe'},text:{ar:'1 إلى 1.5 غرام كل 6 ساعات',en:'1 to 1.5 g every 6 h'}},
        {when:{ind:'proph'},text:{ar:'1 غرام قبل الجراحة بنصف ساعة إلى ساعة؛ 500 ملغ إلى 1 غرام أثناء الجراحات الطويلة؛ ثم 500 ملغ إلى 1 غرام كل 6 إلى 8 ساعات لـ24 ساعة',en:'1 g 30 to 60 min before surgery; 500 mg to 1 g during long operations; then 500 mg to 1 g every 6 to 8 h for 24 h'}},
        {when:{},text:{ar:'500 ملغ إلى 1 غرام كل 6 إلى 8 ساعات',en:'500 mg to 1 g every 6 to 8 h'}}
      ]},
      {k:{ar:'حسب الكلى (بعد جرعة تحميل)',en:'By kidney function (after a loading dose)'},strong:true,rules:[
        {when:{crcl:{lte:10}},text:{ar:'نصف الجرعة المعتادة كل 18 إلى 24 ساعة',en:'Half the usual dose every 18 to 24 h'}},
        {when:{crcl:{lt:35}},text:{ar:'نصف الجرعة المعتادة كل 12 ساعة',en:'Half the usual dose every 12 h'}},
        {when:{crcl:{lt:55}},text:{ar:'جرعة كاملة بفاصل 8 ساعات على الأقل',en:'Full dose, at least 8 h apart'}},
        {when:{},text:{ar:'جرعة كاملة (تصفية 55 فأكثر)',en:'Full dose (clearance 55 or more)'}}
      ]}
    ],
    notes:{ar:'كل تخفيضات الكلى تأتي بعد جرعة تحميل أولى مناسبة لشدة العدوى.',en:'Every kidney reduction follows a first loading dose suited to the severity.'}
  },

  genta: {
    name:{ar:'جنتاميسين',en:'Gentamicin'},
    label:'DailyMed, gentamicin sulfate injection (2026-05-20), Dosage and Administration', srcIds:[44], pedsRef:'Dosage and Administration',
    inputs:[
      {id:'sev',type:'select',label:{ar:'شدة العدوى',en:'Severity'},options:[['serious',{ar:'خطيرة',en:'Serious'}],['life',{ar:'مهددة للحياة',en:'Life-threatening'}]]}
    ],
    rows:[
      {k:{ar:'الجرعة مع كلى سليمة',en:'Dose with normal kidneys'},strong:true,rules:[
        {when:{sev:'life'},text:{ar:'{mgkg:1.7@lean} ملغ كل 8 ساعات (5 ملغ/كغ يومياً)، ثم تُخفض إلى 3 ملغ/كغ يومياً عندما يسمح الوضع',en:'{mgkg:1.7@lean} mg every 8 h (5 mg/kg a day), then back to 3 mg/kg a day as soon as possible'}},
        {when:{},text:{ar:'{mgkg:1@lean} ملغ كل 8 ساعات (3 ملغ/كغ يومياً)',en:'{mgkg:1@lean} mg every 8 h (3 mg/kg a day)'}}
      ]},
      {k:{ar:'إذا كانت الكلى ضعيفة (طريقة الملصق)',en:'If the kidneys are impaired (label method)'},rules:[
        {when:{},text:{ar:'الجرعة المعتادة كل {scrx:8} ساعة تقريباً (كرياتينين الدم × 8)، مع قياس المستوى',en:'the usual dose about every {scrx:8} h (serum creatinine × 8), with level monitoring'}}
      ]},
      {k:{ar:'المراقبة',en:'Monitoring'},rules:[
        {when:{},text:{ar:'الذروة 4 إلى 6 مكغ/مل وتجنب أكثر من 12؛ القاع: تجنب أكثر من 2 مكغ/مل.',en:'Peak 4 to 6 mcg/mL, avoid over 12; trough: avoid over 2 mcg/mL.'}}
      ]},
      {k:{ar:'تنبيه',en:'Warning'},warn:true,rules:[
        {when:{},text:{ar:'سمية للأذن والكلى: تجنب الأدوية السامة للكلى أو الأعصاب ومدرات البول القوية.',en:'Ear and kidney toxicity: avoid other nephrotoxic or neurotoxic drugs and potent diuretics.'}}
      ]}
    ],
    notes:{ar:'الوزن: الوزن الفعلي، أو الوزن المثالي عند السمنة تقديراً للكتلة الخالية من الدهون كما يطلب الملصق.',en:'Weight: actual, or ideal weight when obese as an estimate of lean body mass, as the label asks.'}
  },

  vanco: {
    name:{ar:'فانكومايسين (وريدي)',en:'Vancomycin (intravenous)'},
    label:'DailyMed, vancomycin injection (2026-08-19), sections 2.2 and 2.4', srcIds:[45], pedsRef:'2.3',
    inputs:[
      {id:'anephric',type:'check',label:{ar:'بلا وظيفة كلوية (فشل كلوي تام أو غسيل)',en:'Functionally anephric (no kidney function, or dialysis)'}}
    ],
    rows:[
      {k:{ar:'الجرعة مع كلى سليمة',en:'Dose with normal kidneys'},rules:[
        {when:{},text:{ar:'2 غرام يومياً: 500 ملغ كل 6 ساعات أو 1 غرام كل 12 ساعة',en:'2 g a day: 500 mg every 6 h or 1 g every 12 h'}}
      ]},
      {k:{ar:'بلا وظيفة كلوية',en:'Functionally anephric'},strong:true,opt:true,rules:[
        {when:{anephric:true},text:{ar:'{mgkg:15} ملغ أولاً (15 ملغ/كغ)، ثم {mgkg:1.9} ملغ كل 24 ساعة (1.9 ملغ/كغ)، مع قياس المستوى بعد 24 ساعة',en:'{mgkg:15} mg first (15 mg/kg), then {mgkg:1.9} mg every 24 h (1.9 mg/kg), with a level at 24 h'}}
      ]},
      {k:{ar:'إذا كانت الكلى ضعيفة',en:'If the kidneys are impaired'},rules:[
        {when:{},text:{ar:'الجرعة الأولى لا تقل عن {mgkg:15} ملغ (15 ملغ/كغ)، ثم حسب مستوى القاع',en:'First dose at least {mgkg:15} mg (15 mg/kg), then by trough level'}}
      ]},
      {k:{ar:'طريقة الإعطاء',en:'How to give'},rules:[
        {when:{},text:{ar:'تسريب وريدي خلال 60 دقيقة على الأقل، بسرعة 10 ملغ/دقيقة أو أقل.',en:'Intravenous infusion over at least 60 minutes, at 10 mg/min or slower.'}}
      ]}
    ],
    notes:{ar:'مع بيبيراسيلين–تازوباكتام تزيد إصابة الكلى: مراقبة وظيفتها.',en:'With piperacillin–tazobactam, kidney injury is more common: monitor kidney function.'}
  },

  linezolid: {
    name:{ar:'لينيزوليد',en:'Linezolid'},
    label:'DailyMed, linezolid tablets (2026-09-03), section 2.1 Table 1', srcIds:[46], noRenal:true, pedsRef:'2.1',
    inputs:[
      {id:'ind',type:'select',label:{ar:'نوع العدوى',en:'Type of infection'},options:[
        ['pneu',{ar:'التهاب الرئة (مستشفى أو مجتمع) أو الجلد المعقد',en:'Pneumonia (hospital or community) or complicated skin'}],
        ['vre',{ar:'المكورات المعوية المقاومة للفانكومايسين',en:'Vancomycin-resistant enterococci'}],
        ['ussi',{ar:'الجلد غير المعقد',en:'Uncomplicated skin infection'}]]}
    ],
    rows:[
      {k:{ar:'الجرعة للبالغين',en:'Adult dose'},strong:true,rules:[
        {when:{ind:'vre'},text:{ar:'600 ملغ وريدياً أو فموياً كل 12 ساعة لـ14 إلى 28 يوماً',en:'600 mg IV or oral every 12 h for 14 to 28 days'}},
        {when:{ind:'ussi'},text:{ar:'400 ملغ فموياً كل 12 ساعة لـ10 إلى 14 يوماً',en:'400 mg oral every 12 h for 10 to 14 days'}},
        {when:{},text:{ar:'600 ملغ وريدياً أو فموياً كل 12 ساعة لـ10 إلى 14 يوماً',en:'600 mg IV or oral every 12 h for 10 to 14 days'}}
      ]},
      {k:{ar:'الكلى',en:'Kidney'},rules:[
        {when:{},text:{ar:'لا تعديل للجرعة. الغسيل يزيل نحو 30% منها في 3 ساعات.',en:'No dose change. Dialysis removes about 30% in 3 hours.'}}
      ]},
      {k:{ar:'تنبيه',en:'Warning'},warn:true,rules:[
        {when:{},text:{ar:'ممنوع مع مثبطات MAO أو خلال أسبوعين منها. خطر متلازمة السيروتونين. تجنب كميات كبيرة من الأطعمة الغنية بالتيرامين. عدّ الدم أسبوعياً.',en:'Contraindicated with MAOIs or within two weeks of them. Serotonin syndrome risk. Avoid large amounts of tyramine-rich foods. Weekly blood counts.'}}
      ]}
    ],
    notes:{ar:'لا تعديل عند الانتقال من الوريد إلى الفم.',en:'No change when switching from IV to oral.'}
  },
  ampicillin: {
    name:{ar:'أمبيسيلين',en:'Ampicillin'},
    label:'DailyMed, ampicillin for injection (2026-07-27), Dosage and Administration', srcIds:[47], noRenal:true, pedsRef:'Dosage and Administration',
    inputs:[
      {id:'ind',type:'select',label:{ar:'نوع العدوى',en:'Type of infection'},options:[
        ['resp',{ar:'الجهاز التنفسي والأنسجة الرخوة',en:'Respiratory tract and soft tissue'}],
        ['gigu',{ar:'الجهاز الهضمي والبولي التناسلي',en:'Gastrointestinal and genitourinary'}],
        ['gono',{ar:'التهاب الإحليل السيلاني عند الرجال',en:'Gonococcal urethritis in men'}],
        ['mening',{ar:'التهاب السحايا الجرثومي',en:'Bacterial meningitis'}]]}
    ],
    rows:[
      {k:{ar:'الجرعة (40 كغ فأكثر)',en:'Dose (40 kg or more)'},strong:true,rules:[
        {when:{ind:'gigu'},text:{ar:'500 ملغ كل 6 ساعات',en:'500 mg every 6 h'}},
        {when:{ind:'gono'},text:{ar:'جرعتان 500 ملغ بينهما 8 إلى 12 ساعة',en:'two 500 mg doses 8 to 12 h apart'}},
        {when:{ind:'mening'},text:{ar:'{mgkg:150-200} ملغ يومياً (150 إلى 200 ملغ/كغ) مقسمة كل 3 إلى 4 ساعات',en:'{mgkg:150-200} mg a day (150 to 200 mg/kg) divided every 3 to 4 h'}},
        {when:{},text:{ar:'250 إلى 500 ملغ كل 6 ساعات',en:'250 to 500 mg every 6 h'}}
      ]},
      {k:{ar:'الكلى',en:'Kidney'},rules:[
        {when:{},text:{ar:'الملصق لا يعطي جدولاً للكلى. يزيله الغسيل الدموي لا البريتوني.',en:'The label gives no kidney table. Haemodialysis removes it; peritoneal dialysis does not.'}}
      ]}
    ],
    notes:{ar:'لا تُستعمل جرعات أصغر من الموصى بها؛ الجرعات الأعلى للعدوى العنيدة أو الشديدة.',en:'Do not use smaller doses than recommended; higher doses for stubborn or severe infections.'}
  },

  amp_sulb: {
    name:{ar:'أمبيسيلين–سولباكتام',en:'Ampicillin–sulbactam'},
    label:'DailyMed, ampicillin and sulbactam for injection (2026-07-23), Dosage and Administration, Table 3', srcIds:[48], pedsRef:'Dosage and Administration',
    inputs:[],
    rows:[
      {k:{ar:'الجرعة المعتادة',en:'Usual dose'},rules:[
        {when:{},text:{ar:'1.5 إلى 3 غرام (أمبيسيلين + سولباكتام) كل 6 ساعات؛ السولباكتام حتى 4 غرام يومياً',en:'1.5 to 3 g (ampicillin + sulbactam) every 6 h; sulbactam at most 4 g a day'}}
      ]},
      {k:{ar:'حسب الكلى (جدول 3)',en:'By kidney function (Table 3)'},strong:true,rules:[
        {when:{crcl:{lt:5}},text:{ar:'الملصق لا يذكر جرعة لتصفية أقل من 5؛ يُستشار الصيدلي.',en:'The label gives no dose under 5 mL/min; ask the pharmacist.'},warn:true},
        {when:{crcl:{lt:15}},text:{ar:'1.5 إلى 3 غرام كل 24 ساعة',en:'1.5 to 3 g every 24 h'}},
        {when:{crcl:{lt:30}},text:{ar:'1.5 إلى 3 غرام كل 12 ساعة',en:'1.5 to 3 g every 12 h'}},
        {when:{},text:{ar:'1.5 إلى 3 غرام كل 6 إلى 8 ساعات',en:'1.5 to 3 g every 6 to 8 h'}}
      ]},
      {k:{ar:'طريقة الإعطاء',en:'How to give'},rules:[
        {when:{},text:{ar:'تسريب وريدي خلال 15 إلى 30 دقيقة. لا يُخلط مع الأمينوغليكوزيدات.',en:'IV infusion over 15 to 30 minutes. Do not mix with aminoglycosides.'}}
      ]}
    ],
    notes:{ar:'مدة الحقن عادة لا تتجاوز 14 يوماً.',en:'IV course usually not over 14 days.'}
  },

  pen_v: {
    name:{ar:'بنسلين V',en:'Penicillin V'},
    label:'DailyMed, penicillin V potassium (2026-07-23), Dosage and Administration', srcIds:[49], noRenal:true, pedsRef:'Dosage and Administration',
    inputs:[
      {id:'ind',type:'select',label:{ar:'الاستعمال',en:'Use'},options:[
        ['strep',{ar:'المكورات العقدية (البلعوم، الحمى القرمزية، الحمرة)',en:'Streptococcal (throat, scarlet fever, erysipelas)'}],
        ['pneumo',{ar:'المكورات الرئوية',en:'Pneumococcal'}],
        ['staph',{ar:'عدوى جلد عنقودية خفيفة',en:'Mild staphylococcal skin infection'}],
        ['vincent',{ar:'التهاب فنسان',en:"Vincent's infection"}],
        ['rheum',{ar:'الوقاية من تكرار الحمى الرثوية',en:'Prevention of recurrent rheumatic fever'}]]}
    ],
    rows:[
      {k:{ar:'الجرعة (12 سنة فأكثر)',en:'Dose (12 and over)'},strong:true,rules:[
        {when:{ind:'strep'},text:{ar:'125 إلى 250 ملغ كل 6 إلى 8 ساعات لـ10 أيام',en:'125 to 250 mg every 6 to 8 h for 10 days'}},
        {when:{ind:'pneumo'},text:{ar:'250 إلى 500 ملغ كل 6 ساعات حتى زوال الحمى بيومين على الأقل',en:'250 to 500 mg every 6 h until at least 2 days without fever'}},
        {when:{ind:'rheum'},text:{ar:'125 إلى 250 ملغ مرتين يومياً بشكل مستمر',en:'125 to 250 mg twice a day, continuing'}},
        {when:{},text:{ar:'250 إلى 500 ملغ كل 6 إلى 8 ساعات',en:'250 to 500 mg every 6 to 8 h'}}
      ]},
      {k:{ar:'الكلى',en:'Kidney'},rules:[
        {when:{},text:{ar:'الملصق لا يعطي تعديلاً للكلى.',en:'The label gives no kidney adjustment.'}}
      ]}
    ],
    notes:{ar:'المستوى أعلى قليلاً على معدة فارغة. لا يُعالج به الالتهاب الرئوي الشديد أو السحايا في المرحلة الحادة.',en:'Levels are slightly higher on an empty stomach. Not for severe pneumonia or meningitis in the acute stage.'}
  },

  benz_pen: {
    name:{ar:'بنزاثين بنزيل بنسلين',en:'Benzathine benzylpenicillin'},
    label:'DailyMed, Bicillin L-A (Pfizer, 2026-07-21), Dosage and Administration', srcIds:[50], noRenal:true, pedsRef:'Dosage and Administration',
    inputs:[
      {id:'ind',type:'select',label:{ar:'الاستعمال',en:'Use'},options:[
        ['strep',{ar:'التهاب الجهاز التنفسي العلوي بالمكورات العقدية (أ)',en:'Group A streptococcal upper respiratory infection'}],
        ['syph',{ar:'الزهري الأولي أو الثانوي أو الكامن',en:'Primary, secondary or latent syphilis'}],
        ['late',{ar:'الزهري المتأخر',en:'Late syphilis'}],
        ['yaws',{ar:'الداء العليقي والبجل والبنتا',en:'Yaws, bejel and pinta'}],
        ['rheum',{ar:'الوقاية من الحمى الرثوية',en:'Rheumatic fever prophylaxis'}]]}
    ],
    rows:[
      {k:{ar:'الجرعة للبالغين',en:'Adult dose'},strong:true,rules:[
        {when:{ind:['strep','yaws']},text:{ar:'1.2 مليون وحدة مرة واحدة',en:'1.2 million units once'}},
        {when:{ind:'syph'},text:{ar:'2.4 مليون وحدة مرة واحدة',en:'2.4 million units once'}},
        {when:{ind:'late'},text:{ar:'2.4 مليون وحدة أسبوعياً لثلاث جرعات',en:'2.4 million units weekly for 3 doses'}},
        {when:{},text:{ar:'1.2 مليون وحدة شهرياً، أو 600 ألف وحدة كل أسبوعين',en:'1.2 million units monthly, or 600,000 units every 2 weeks'}}
      ]},
      {k:{ar:'تنبيه',en:'Warning'},warn:true,rules:[
        {when:{},text:{ar:'حقن عضلي عميق فقط. لا يُعطى وريدياً ولا قرب شريان أو عصب.',en:'Deep intramuscular only. Never intravenous, and never near an artery or nerve.'}}
      ]}
    ],
    notes:{ar:'الملصق لا يعطي تعديلاً للكلى.',en:'The label gives no kidney adjustment.'}
  },

  pen_g: {
    name:{ar:'بنسلين G البوتاسيوم',en:'Penicillin G potassium'},
    label:'DailyMed, Pfizerpen (Pfizer, 2025-12-16), Dosage and Administration', srcIds:[51], pedsRef:'Dosage and Administration',
    inputs:[
      {id:'ind',type:'select',label:{ar:'العدوى',en:'Infection'},options:[
        ['strep',{ar:'عدوى خطيرة بالمكورات العقدية (ومنها الرئوية)',en:'Serious streptococcal infection (including pneumococcal)'}],
        ['staph',{ar:'عدوى خطيرة بالعنقوديات',en:'Serious staphylococcal infection'}],
        ['anthrax',{ar:'الجمرة الخبيثة',en:'Anthrax'}],
        ['actcf',{ar:'الفطار الشعي الوجهي العنقي',en:'Cervicofacial actinomycosis'}],
        ['actta',{ar:'الفطار الشعي الصدري والبطني',en:'Thoracic and abdominal actinomycosis'}],
        ['clost',{ar:'التسمم الوشيقي، الغنغرينا الغازية، الكزاز',en:'Botulism, gas gangrene, tetanus'}],
        ['diph',{ar:'الدفتيريا',en:'Diphtheria'}],
        ['listm',{ar:'التهاب السحايا بالليستيريا',en:'Listeria meningitis'}],
        ['liste',{ar:'التهاب الشغاف بالليستيريا',en:'Listeria endocarditis'}],
        ['dgi',{ar:'عدوى السيلان المنتشرة',en:'Disseminated gonococcal infection'}],
        ['neuro',{ar:'الزهري العصبي',en:'Neurosyphilis'}],
        ['mening',{ar:'التهاب السحايا أو تسمم الدم بالمكورات السحائية',en:'Meningococcal meningitis or septicaemia'}]]}
    ],
    rows:[
      {k:{ar:'الجرعة للبالغين',en:'Adult dose'},rules:[
        {when:{ind:'strep'},text:{ar:'12 إلى 24 مليون وحدة يومياً مقسمة كل 4 إلى 6 ساعات',en:'12 to 24 million units a day divided every 4 to 6 h'}},
        {when:{ind:'staph'},text:{ar:'5 إلى 24 مليون وحدة يومياً مقسمة كل 4 إلى 6 ساعات',en:'5 to 24 million units a day divided every 4 to 6 h'}},
        {when:{ind:'anthrax'},text:{ar:'8 ملايين وحدة يومياً على الأقل مقسمة كل 6 ساعات',en:'at least 8 million units a day divided every 6 h'}},
        {when:{ind:'actcf'},text:{ar:'1 إلى 6 ملايين وحدة يومياً',en:'1 to 6 million units a day'}},
        {when:{ind:'actta'},text:{ar:'10 إلى 20 مليون وحدة يومياً',en:'10 to 20 million units a day'}},
        {when:{ind:'clost'},text:{ar:'20 مليون وحدة يومياً (مع العلاج الأساسي)',en:'20 million units a day (with the main treatment)'}},
        {when:{ind:'diph'},text:{ar:'2 إلى 3 ملايين وحدة يومياً مقسمة لـ10 إلى 12 يوماً',en:'2 to 3 million units a day divided, for 10 to 12 days'}},
        {when:{ind:'listm'},text:{ar:'15 إلى 20 مليون وحدة يومياً لأسبوعين',en:'15 to 20 million units a day for 2 weeks'}},
        {when:{ind:'liste'},text:{ar:'15 إلى 20 مليون وحدة يومياً لـ4 أسابيع',en:'15 to 20 million units a day for 4 weeks'}},
        {when:{ind:'dgi'},text:{ar:'10 ملايين وحدة يومياً؛ المدة حسب نوع العدوى',en:'10 million units a day; duration by type of infection'}},
        {when:{ind:'neuro'},text:{ar:'12 إلى 24 مليون وحدة يومياً: 2 إلى 4 ملايين كل 4 ساعات لـ10 إلى 14 يوماً',en:'12 to 24 million units a day: 2 to 4 million every 4 h for 10 to 14 days'}},
        {when:{},text:{ar:'24 مليون وحدة يومياً: 2 مليون كل ساعتين',en:'24 million units a day: 2 million every 2 h'}}
      ]},
      {k:{ar:'الكلى',en:'Kidney'},strong:true,rules:[
        {when:{crcl:{lt:10}},text:{ar:'جرعة تحميل كاملة، ثم نصفها كل 8 إلى 10 ساعات',en:'A full loading dose, then half of it every 8 to 10 h'}},
        {when:{},text:{ar:'لا تعديل عادة. مرضى اليوريميا بتصفية أكثر من 10: جرعة تحميل كاملة ثم نصفها كل 4 إلى 5 ساعات.',en:'Usually no change. Uraemic patients with clearance over 10: a full loading dose, then half of it every 4 to 5 h.'}}
      ]}
    ],
    notes:{ar:'الجرعات فوق 10 ملايين وحدة وريدياً ببطء بسبب البوتاسيوم (1.68 ملي مكافئ لكل مليون وحدة).',en:'IV doses over 10 million units slowly, because of the potassium (1.68 mEq per million units).'}
  },

  dicloxa: {
    name:{ar:'ديكلوكساسيلين',en:'Dicloxacillin'},
    label:'DailyMed, dicloxacillin sodium capsules (2023-12-27), Dosage and Administration', srcIds:[52], noRenal:true, pedsRef:'Dosage and Administration',
    inputs:[
      {id:'sev',type:'select',label:{ar:'شدة العدوى',en:'Severity'},options:[['mild',{ar:'خفيفة إلى متوسطة',en:'Mild to moderate'}],['severe',{ar:'شديدة',en:'Severe'}]]}
    ],
    rows:[
      {k:{ar:'الجرعة للبالغين',en:'Adult dose'},strong:true,rules:[
        {when:{sev:'severe'},text:{ar:'250 ملغ كل 6 ساعات',en:'250 mg every 6 h'}},
        {when:{},text:{ar:'125 ملغ كل 6 ساعات',en:'125 mg every 6 h'}}
      ]},
      {k:{ar:'طريقة الأخذ',en:'How to take'},rules:[
        {when:{},text:{ar:'على معدة فارغة (قبل الطعام بساعة أو بعده بساعتين)، مع 120 مل ماء على الأقل، وليس قبل النوم مباشرة.',en:'On an empty stomach (1 h before or 2 h after meals), with at least 120 mL of water, not right before bed.'}}
      ]}
    ],
    notes:{ar:'لا يُبدأ به في العدوى الخطيرة المهددة للحياة. الملصق لا يعطي تعديلاً للكلى.',en:'Not for starting treatment of serious life-threatening infection. The label gives no kidney adjustment.'}
  },

  pip_tazo: {
    name:{ar:'بيبيراسيلين–تازوباكتام',en:'Piperacillin–tazobactam'},
    label:'DailyMed, Zosyn (2026-05-15), sections 2.2 to 2.4, Table 1', srcIds:[53], pedsRef:'2.5',
    inputs:[
      {id:'ind',type:'select',label:{ar:'نوع العدوى',en:'Type of infection'},options:[['other',{ar:'كل العدوى عدا التهاب الرئة في المستشفى',en:'All infections except hospital pneumonia'}],['hap',{ar:'التهاب الرئة المكتسب في المستشفى',en:'Hospital-acquired pneumonia'}]]},
      {id:'dial',type:'select',label:{ar:'الغسيل الكلوي',en:'Dialysis'},options:[['none',{ar:'لا',en:'None'}],['hd',{ar:'غسيل دموي',en:'Haemodialysis'}],['capd',{ar:'غسيل بريتوني مستمر',en:'Continuous peritoneal dialysis'}]]}
    ],
    rows:[
      {k:{ar:'الجرعة (جدول 1)',en:'Dose (Table 1)'},strong:true,rules:[
        {when:{dial:'hd',ind:'hap'},text:{ar:'2.25 غرام كل 8 ساعات، مع 0.75 غرام بعد كل جلسة غسيل',en:'2.25 g every 8 h, plus 0.75 g after each dialysis session'}},
        {when:{dial:'hd'},text:{ar:'2.25 غرام كل 12 ساعة، مع 0.75 غرام بعد كل جلسة غسيل',en:'2.25 g every 12 h, plus 0.75 g after each dialysis session'}},
        {when:{dial:'capd',ind:'hap'},text:{ar:'2.25 غرام كل 8 ساعات',en:'2.25 g every 8 h'}},
        {when:{dial:'capd'},text:{ar:'2.25 غرام كل 12 ساعة',en:'2.25 g every 12 h'}},
        {when:{crcl:{lt:20},ind:'hap'},text:{ar:'2.25 غرام كل 6 ساعات',en:'2.25 g every 6 h'}},
        {when:{crcl:{lt:20}},text:{ar:'2.25 غرام كل 8 ساعات',en:'2.25 g every 8 h'}},
        {when:{crcl:{lte:40},ind:'hap'},text:{ar:'3.375 غرام كل 6 ساعات',en:'3.375 g every 6 h'}},
        {when:{crcl:{lte:40}},text:{ar:'2.25 غرام كل 6 ساعات',en:'2.25 g every 6 h'}},
        {when:{ind:'hap'},text:{ar:'4.5 غرام كل 6 ساعات مع أمينوغليكوزيد',en:'4.5 g every 6 h with an aminoglycoside'}},
        {when:{},text:{ar:'3.375 غرام كل 6 ساعات',en:'3.375 g every 6 h'}}
      ]},
      {k:{ar:'طريقة الإعطاء',en:'How to give'},rules:[
        {when:{},text:{ar:'تسريب وريدي خلال 30 دقيقة، منفصلاً عن الأمينوغليكوزيدات.',en:'IV infusion over 30 minutes, separate from aminoglycosides.'}}
      ]}
    ],
    notes:{ar:'الجرعات بالغرامات الكلية (بيبيراسيلين + تازوباكتام). مع الفانكومايسين: مراقبة الكلى.',en:'Doses in total grams (piperacillin + tazobactam). With vancomycin: monitor the kidneys.'}
  },

  temocillin: {
    name:{ar:'تيموسيلين',en:'Temocillin'},
    label:'French RCP, NEGABAN 1 g (French public medicines database), section 4.2', srcIds:[54], pedsRef:'4.2',
    inputs:[
      {id:'dose',type:'select',label:{ar:'الجرعة',en:'Regimen'},options:[['std',{ar:'معيارية',en:'Standard'}],['high',{ar:'عالية (مريض حرج)',en:'High (critically ill)'}]]},
      {id:'hd',type:'check',label:{ar:'غسيل كلوي دموي',en:'On haemodialysis'}}
    ],
    rows:[
      {k:{ar:'الجرعة مع كلى سليمة',en:'Dose with normal kidneys'},rules:[
        {when:{dose:'high'},text:{ar:'6 غرام يومياً على 3 جرعات، أو تسريب مستمر بعد جرعة تحميل 2 غرام',en:'6 g a day in 3 doses, or a continuous infusion after a 2 g loading dose'}},
        {when:{},text:{ar:'4 غرام يومياً: 2 غرام كل 12 ساعة',en:'4 g a day: 2 g every 12 h'}}
      ]},
      {k:{ar:'الجرعة المعيارية حسب الكلى',en:'Standard dose by kidney function'},strong:true,rules:[
        {when:{hd:true},text:{ar:'1 غرام وريدياً لكل 24 ساعة بين الجلسات، ويفضل في نهاية الغسيل (1 غرام كل 24، 2 كل 48، 3 كل 72 ساعة)',en:'1 g IV for each 24 h between sessions, preferably at the end of dialysis (1 g per 24 h, 2 g per 48 h, 3 g per 72 h)'}},
        {when:{crcl:{lt:10}},text:{ar:'الملصق لا يذكر جرعة لتصفية أقل من 10 بلا غسيل؛ يُستشار الصيدلي.',en:'The label gives no dose under 10 mL/min without dialysis; ask the pharmacist.'},warn:true},
        {when:{crcl:{lt:30}},text:{ar:'1 غرام كل 24 ساعة',en:'1 g every 24 h'}},
        {when:{crcl:{lte:60}},text:{ar:'1 غرام كل 12 ساعة',en:'1 g every 12 h'}},
        {when:{},text:{ar:'2 غرام كل 12 ساعة',en:'2 g every 12 h'}}
      ]}
    ],
    notes:{ar:'ملصق فرنسي (لا يوجد ملصق أمريكي). الملصق يذكر عدم يقين حول الجرعة المثلى، خاصة الجرعات العالية وفي القصور الكلوي.',en:'French label (no US label). The label notes uncertainty about the best dose, especially high doses and in kidney impairment.'}
  },

  sul_dur: {
    name:{ar:'سولباكتام–دورلوباكتام',en:'Sulbactam–durlobactam'},
    label:'DailyMed, Xacduro (2025-11-26), sections 2.1 and 2.2, Table 1', srcIds:[55], pedsRef:'1.1',
    inputs:[
      {id:'start',type:'select',label:{ar:'عند تصفية أقل من 15',en:'If clearance is under 15'},options:[['new',{ar:'يبدأ العلاج الآن',en:'Starting treatment now'}],['on',{ar:'على العلاج وانخفضت التصفية',en:'Already on it and clearance fell'}]]},
      {id:'hd',type:'check',label:{ar:'غسيل كلوي دموي',en:'On haemodialysis'}}
    ],
    rows:[
      {k:{ar:'الجرعة حسب الكلى (جدول 1)',en:'Dose by kidney function (Table 1)'},strong:true,rules:[
        {when:{crcl:{gte:130}},text:{ar:'1 غرام سولباكتام + 1 غرام دورلوباكتام كل 4 ساعات',en:'1 g sulbactam + 1 g durlobactam every 4 h'}},
        {when:{crcl:{gte:45}},text:{ar:'1 + 1 غرام كل 6 ساعات',en:'1 + 1 g every 6 h'}},
        {when:{crcl:{gte:30}},text:{ar:'1 + 1 غرام كل 8 ساعات',en:'1 + 1 g every 8 h'}},
        {when:{crcl:{gte:15}},text:{ar:'1 + 1 غرام كل 12 ساعة',en:'1 + 1 g every 12 h'}},
        {when:{start:'on'},text:{ar:'1 + 1 غرام كل 24 ساعة',en:'1 + 1 g every 24 h'}},
        {when:{},text:{ar:'1 + 1 غرام كل 12 ساعة لأول 3 جرعات (0 و12 و24 ساعة)، ثم كل 24 ساعة',en:'1 + 1 g every 12 h for the first 3 doses (0, 12 and 24 h), then every 24 h'}}
      ]},
      {k:{ar:'الغسيل',en:'Dialysis'},opt:true,rules:[
        {when:{hd:true},text:{ar:'تُعطى الجرعة بعد انتهاء جلسة الغسيل.',en:'Give the dose after the dialysis session ends.'}}
      ]},
      {k:{ar:'طريقة الإعطاء',en:'How to give'},rules:[
        {when:{},text:{ar:'تسريب وريدي خلال 3 ساعات لكل جرعة، لـ7 إلى 14 يوماً.',en:'Each dose by IV infusion over 3 hours, for 7 to 14 days.'}}
      ]}
    ],
    notes:{ar:'للبالغين فقط (18 سنة فأكثر). التصفية بمعادلة Cockcroft-Gault كما في الملصق.',en:'Adults only (18 and over). Clearance by Cockcroft-Gault, as in the label.'}
  },

  cefadroxil: {
    name:{ar:'سيفادروكسيل',en:'Cefadroxil'},
    label:'DailyMed, cefadroxil capsules (2025-10-10), Dosage and Administration', srcIds:[56], pedsRef:'Dosage and Administration',
    inputs:[
      {id:'ind',type:'select',label:{ar:'نوع العدوى',en:'Type of infection'},options:[
        ['cyst',{ar:'التهاب المثانة غير المعقد',en:'Uncomplicated cystitis'}],
        ['uti',{ar:'عدوى المسالك البولية الأخرى',en:'Other urinary tract infection'}],
        ['skin',{ar:'عدوى الجلد',en:'Skin infection'}],
        ['phar',{ar:'التهاب البلعوم واللوزتين',en:'Pharyngitis or tonsillitis'}]]}
    ],
    rows:[
      {k:{ar:'الجرعة المعتادة',en:'Usual dose'},rules:[
        {when:{ind:'cyst'},text:{ar:'1 أو 2 غرام يومياً، مرة واحدة أو مقسمة مرتين',en:'1 or 2 g a day, once or in 2 doses'}},
        {when:{ind:'uti'},text:{ar:'2 غرام يومياً مقسمة مرتين',en:'2 g a day in 2 doses'}},
        {when:{ind:'skin'},text:{ar:'1 غرام يومياً، مرة واحدة أو مقسمة مرتين',en:'1 g a day, once or in 2 doses'}},
        {when:{},text:{ar:'1 غرام يومياً لـ10 أيام',en:'1 g a day for 10 days'}}
      ]},
      {k:{ar:'حسب الكلى',en:'By kidney function'},strong:true,rules:[
        {when:{crcl:{lt:10}},text:{ar:'1000 ملغ أولاً، ثم 500 ملغ كل 36 ساعة',en:'1000 mg first, then 500 mg every 36 h'}},
        {when:{crcl:{lt:25}},text:{ar:'1000 ملغ أولاً، ثم 500 ملغ كل 24 ساعة',en:'1000 mg first, then 500 mg every 24 h'}},
        {when:{crcl:{lte:50}},text:{ar:'1000 ملغ أولاً، ثم 500 ملغ كل 12 ساعة',en:'1000 mg first, then 500 mg every 12 h'}},
        {when:{},text:{ar:'لا تعديل (تصفية أكثر من 50)',en:'No change (clearance over 50)'}}
      ]}
    ],
    notes:{ar:'مع الطعام أو بدونه. المكورات العقدية الحالّة بيتا: 10 أيام على الأقل.',en:'With or without food. Beta-haemolytic streptococci: at least 10 days.'}
  },
  oxacillin: {
    name:{ar:'أوكساسيلين',en:'Oxacillin'},
    label:'DailyMed, oxacillin injection (2026-08-31), Dosage and Administration', srcIds:[57], noRenal:true, pedsRef:'Dosage and Administration',
    inputs:[{id:'sev',type:'select',label:{ar:'شدة العدوى',en:'Severity'},options:[['mild',{ar:'خفيفة إلى متوسطة',en:'Mild to moderate'}],['severe',{ar:'شديدة',en:'Severe'}]]}],
    rows:[
      {k:{ar:'الجرعة للبالغين (وريدي)',en:'Adult dose (IV)'},strong:true,rules:[
        {when:{sev:'severe'},text:{ar:'1 غرام كل 4 إلى 6 ساعات',en:'1 g every 4 to 6 h'}},
        {when:{},text:{ar:'250 إلى 500 ملغ كل 4 إلى 6 ساعات',en:'250 to 500 mg every 4 to 6 h'}}
      ]},
      {k:{ar:'الكلى',en:'Kidney'},rules:[
        {when:{},text:{ar:'مع قصور كلوي معروف أو مشتبه به: يُنظر في تخفيض الجرعة الكلية ومراقبة المستوى (لا جدول في الملصق).',en:'With known or suspected kidney impairment: consider a lower total dose and monitor levels (no table in the label).'}}
      ]},
      {k:{ar:'المدة',en:'Duration'},rules:[
        {when:{},text:{ar:'العنقوديات الشديدة: 14 يوماً على الأقل، و48 ساعة بعد زوال الحمى والأعراض وسلبية الزرع.',en:'Severe staphylococcal infection: at least 14 days, and 48 h after fever and symptoms stop and cultures are negative.'}}
      ]}
    ],
    notes:{ar:'الحذر من التهاب الوريد خاصة عند كبار السن.',en:'Watch for thrombophlebitis, especially in older people.'}
  },

  cefaclor: {
    name:{ar:'سيفاكلور',en:'Cefaclor'},
    label:'DailyMed, cefaclor (2025-05-01), Dosage and Administration', srcIds:[58], noRenal:true, pedsRef:'Dosage and Administration',
    inputs:[{id:'sev',type:'select',label:{ar:'شدة العدوى',en:'Severity'},options:[['usual',{ar:'معتادة',en:'Usual'}],['severe',{ar:'أشد (مثل الالتهاب الرئوي)',en:'More severe (such as pneumonia)'}]]}],
    rows:[
      {k:{ar:'الجرعة للبالغين',en:'Adult dose'},strong:true,rules:[
        {when:{sev:'severe'},text:{ar:'500 ملغ كل 8 ساعات (ضعف الجرعة المعتادة)',en:'500 mg every 8 h (double the usual dose)'}},
        {when:{},text:{ar:'250 ملغ كل 8 ساعات',en:'250 mg every 8 h'}}
      ]},
      {k:{ar:'الكلى',en:'Kidney'},rules:[
        {when:{},text:{ar:'الجرعة عادة دون تغيير في القصور الكلوي.',en:'The dose is usually unchanged in kidney impairment.'}}
      ]}
    ],
    notes:{ar:'المكورات العقدية الحالّة بيتا: 10 أيام على الأقل. مع الطعام أو بدونه.',en:'Beta-haemolytic streptococci: at least 10 days. With or without food.'}
  },

  cefprozil: {
    name:{ar:'سيفبروزيل',en:'Cefprozil'},
    label:'DailyMed, cefprozil (2026-07-09), Dosage and Administration', srcIds:[59], pedsRef:'Dosage and Administration',
    inputs:[
      {id:'ind',type:'select',label:{ar:'نوع العدوى',en:'Type of infection'},options:[
        ['phar',{ar:'البلعوم واللوزتين',en:'Pharyngitis or tonsillitis'}],
        ['sinus',{ar:'التهاب الجيوب الحاد',en:'Acute sinusitis'}],
        ['aecb',{ar:'تفاقم التهاب القصبات المزمن',en:'Exacerbation of chronic bronchitis'}],
        ['skin',{ar:'الجلد غير المعقد',en:'Uncomplicated skin infection'}]]},
      {id:'hd',type:'check',label:{ar:'غسيل كلوي دموي',en:'On haemodialysis'}}
    ],
    rows:[
      {k:{ar:'الجرعة المعتادة (13 سنة فأكثر)',en:'Usual dose (13 and over)'},rules:[
        {when:{ind:'phar'},text:{ar:'500 ملغ كل 24 ساعة لـ10 أيام',en:'500 mg every 24 h for 10 days'}},
        {when:{ind:'sinus'},text:{ar:'250 أو 500 ملغ كل 12 ساعة لـ10 أيام (الأعلى للمتوسطة إلى الشديدة)',en:'250 or 500 mg every 12 h for 10 days (the higher dose for moderate to severe)'}},
        {when:{ind:'aecb'},text:{ar:'500 ملغ كل 12 ساعة لـ10 أيام',en:'500 mg every 12 h for 10 days'}},
        {when:{},text:{ar:'250 ملغ كل 12 ساعة، أو 500 ملغ كل 24 أو كل 12 ساعة، لـ10 أيام',en:'250 mg every 12 h, or 500 mg every 24 or 12 h, for 10 days'}}
      ]},
      {k:{ar:'حسب الكلى',en:'By kidney function'},strong:true,rules:[
        {when:{crcl:{lt:30}},text:{ar:'50% من الجرعة المعتادة بالفاصل نفسه',en:'50% of the usual dose at the same interval'}},
        {when:{},text:{ar:'الجرعة المعتادة (تصفية 30 فأكثر)',en:'Usual dose (clearance 30 or more)'}}
      ]},
      {k:{ar:'الغسيل',en:'Dialysis'},opt:true,rules:[
        {when:{hd:true},text:{ar:'يُعطى بعد انتهاء جلسة الغسيل.',en:'Give after the dialysis session ends.'}}
      ]}
    ],
    notes:{ar:'الطعام لا يؤثر على امتصاصه. لا تعديل للكبد.',en:'Food does not affect its absorption. No liver adjustment.'}
  },

  cefpodox: {
    name:{ar:'سيفبودوكسيم بروكسيتيل',en:'Cefpodoxime proxetil'},
    label:'DailyMed, cefpodoxime proxetil tablets (2026-07-30), Dosage and Administration', srcIds:[60], pedsRef:'Dosage and Administration',
    inputs:[
      {id:'ind',type:'select',label:{ar:'نوع العدوى',en:'Type of infection'},options:[
        ['phar',{ar:'البلعوم واللوزتين',en:'Pharyngitis or tonsillitis'}],
        ['cap',{ar:'التهاب الرئة المجتمعي',en:'Community pneumonia'}],
        ['aecb',{ar:'تفاقم التهاب القصبات المزمن',en:'Exacerbation of chronic bronchitis'}],
        ['gono',{ar:'السيلان غير المعقد',en:'Uncomplicated gonorrhoea'}],
        ['skin',{ar:'الجلد',en:'Skin infection'}],
        ['sinus',{ar:'التهاب الجيوب الفكية الحاد',en:'Acute maxillary sinusitis'}],
        ['uti',{ar:'المسالك البولية غير المعقدة',en:'Uncomplicated urinary infection'}]]},
      {id:'hd',type:'check',label:{ar:'غسيل كلوي دموي',en:'On haemodialysis'}}
    ],
    rows:[
      {k:{ar:'الجرعة المعتادة (12 سنة فأكثر)',en:'Usual dose (12 and over)'},rules:[
        {when:{ind:'phar'},text:{ar:'100 ملغ كل 12 ساعة لـ5 إلى 10 أيام',en:'100 mg every 12 h for 5 to 10 days'}},
        {when:{ind:'cap'},text:{ar:'200 ملغ كل 12 ساعة لـ14 يوماً',en:'200 mg every 12 h for 14 days'}},
        {when:{ind:['aecb','sinus']},text:{ar:'200 ملغ كل 12 ساعة لـ10 أيام',en:'200 mg every 12 h for 10 days'}},
        {when:{ind:'gono'},text:{ar:'200 ملغ مرة واحدة',en:'200 mg once'}},
        {when:{ind:'skin'},text:{ar:'400 ملغ كل 12 ساعة لـ7 إلى 14 يوماً',en:'400 mg every 12 h for 7 to 14 days'}},
        {when:{},text:{ar:'100 ملغ كل 12 ساعة لـ7 أيام',en:'100 mg every 12 h for 7 days'}}
      ]},
      {k:{ar:'حسب الكلى',en:'By kidney function'},strong:true,rules:[
        {when:{hd:true},text:{ar:'الجرعة 3 مرات أسبوعياً بعد الغسيل',en:'The dose 3 times a week after dialysis'}},
        {when:{crcl:{lt:30}},text:{ar:'الجرعة نفسها كل 24 ساعة',en:'The same dose every 24 h'}},
        {when:{},text:{ar:'لا تعديل (تصفية 30 فأكثر)',en:'No change (clearance 30 or more)'}}
      ]}
    ],
    notes:{ar:'الأقراص مع الطعام. مضادات الحموضة بجرعات عالية ومضادات H2 تقلل امتصاصه.',en:'Tablets with food. High-dose antacids and H2 blockers reduce its absorption.'}
  },

  cefdinir: {
    name:{ar:'سيفدينير',en:'Cefdinir'},
    label:'DailyMed, cefdinir capsules (2025-10-14), Dosage and Administration', srcIds:[61], pedsRef:'Dosage and Administration',
    inputs:[
      {id:'ind',type:'select',label:{ar:'نوع العدوى',en:'Type of infection'},options:[
        ['cap',{ar:'التهاب الرئة المجتمعي',en:'Community pneumonia'}],
        ['skin',{ar:'الجلد غير المعقد',en:'Uncomplicated skin infection'}],
        ['aecb',{ar:'تفاقم التهاب القصبات المزمن',en:'Exacerbation of chronic bronchitis'}],
        ['sinus',{ar:'التهاب الجيوب الفكية الحاد',en:'Acute maxillary sinusitis'}],
        ['phar',{ar:'البلعوم واللوزتين',en:'Pharyngitis or tonsillitis'}]]},
      {id:'hd',type:'check',label:{ar:'غسيل كلوي دموي',en:'On haemodialysis'}}
    ],
    rows:[
      {k:{ar:'الجرعة المعتادة',en:'Usual dose'},rules:[
        {when:{ind:['cap','skin']},text:{ar:'300 ملغ كل 12 ساعة لـ10 أيام',en:'300 mg every 12 h for 10 days'}},
        {when:{ind:'sinus'},text:{ar:'300 ملغ كل 12 ساعة أو 600 ملغ كل 24 ساعة لـ10 أيام',en:'300 mg every 12 h or 600 mg every 24 h for 10 days'}},
        {when:{},text:{ar:'300 ملغ كل 12 ساعة لـ5 إلى 10 أيام، أو 600 ملغ كل 24 ساعة لـ10 أيام',en:'300 mg every 12 h for 5 to 10 days, or 600 mg every 24 h for 10 days'}}
      ]},
      {k:{ar:'حسب الكلى',en:'By kidney function'},strong:true,rules:[
        {when:{hd:true},text:{ar:'300 ملغ يوماً بعد يوم، و300 ملغ في نهاية كل جلسة غسيل',en:'300 mg every other day, and 300 mg at the end of each dialysis session'}},
        {when:{crcl:{lt:30}},text:{ar:'300 ملغ مرة يومياً',en:'300 mg once a day'}},
        {when:{},text:{ar:'لا تعديل (تصفية 30 فأكثر)',en:'No change (clearance 30 or more)'}}
      ]},
      {k:{ar:'طريقة الأخذ',en:'How to take'},rules:[
        {when:{},text:{ar:'مع الطعام أو بدونه. قبل مضادات الحموضة أو الحديد بساعتين أو بعدها بساعتين.',en:'With or without food. 2 h before or after antacids or iron.'}}
      ]}
    ],
    notes:{ar:'المرة الواحدة يومياً لم تُدرس في الالتهاب الرئوي وعدوى الجلد: مرتين يومياً فيهما.',en:'Once-daily dosing was not studied in pneumonia and skin infection: twice a day for those.'}
  },

  cefditoren: {
    name:{ar:'سيفديتورين بيفوكسيل',en:'Cefditoren pivoxil'},
    label:'DailyMed, Spectracef (2013-06-04, last US label), Dosage and Administration', srcIds:[62], pedsRef:'Dosage and Administration',
    inputs:[{id:'ind',type:'select',label:{ar:'نوع العدوى',en:'Type of infection'},options:[
      ['cap',{ar:'التهاب الرئة المجتمعي',en:'Community pneumonia'}],['aecb',{ar:'تفاقم التهاب القصبات المزمن',en:'Exacerbation of chronic bronchitis'}],
      ['phar',{ar:'البلعوم أو الجلد غير المعقد',en:'Pharyngitis or uncomplicated skin'}]]}],
    rows:[
      {k:{ar:'الجرعة المعتادة (12 سنة فأكثر)',en:'Usual dose (12 and over)'},rules:[
        {when:{ind:'cap'},text:{ar:'400 ملغ مرتين يومياً لـ14 يوماً',en:'400 mg twice a day for 14 days'}},
        {when:{ind:'aecb'},text:{ar:'400 ملغ مرتين يومياً لـ10 أيام',en:'400 mg twice a day for 10 days'}},
        {when:{},text:{ar:'200 ملغ مرتين يومياً',en:'200 mg twice a day'}}
      ]},
      {k:{ar:'حسب الكلى',en:'By kidney function'},strong:true,rules:[
        {when:{crcl:{lt:30}},text:{ar:'200 ملغ مرة يومياً (الفشل الكلوي النهائي: الجرعة غير محددة)',en:'200 mg once a day (end-stage kidney disease: dose not determined)'}},
        {when:{crcl:{lt:50}},text:{ar:'لا يزيد على 200 ملغ مرتين يومياً',en:'Not more than 200 mg twice a day'}},
        {when:{},text:{ar:'لا تعديل',en:'No change'}}
      ]}
    ],
    notes:{ar:'مع الوجبات، وليس مع مضادات الحموضة أو مضادات H2. ممنوع مع نقص الكارنيتين وحساسية بروتين الحليب (كازينات). آخر ملصق أمريكي 2013.',en:'With meals, not with antacids or H2 blockers. Contraindicated in carnitine deficiency and milk protein (caseinate) allergy. Last US label 2013.'}
  },

  cefoxitin: {
    name:{ar:'سيفوكسيتين',en:'Cefoxitin'},
    label:'DailyMed, cefoxitin for injection (2026-08-24), Dosage and Administration, Tables 1 and 2', srcIds:[63], pedsRef:'Dosage and Administration',
    inputs:[
      {id:'sev',type:'select',label:{ar:'نوع العدوى',en:'Type of infection'},options:[['unc',{ar:'غير معقدة',en:'Uncomplicated'}],['mod',{ar:'متوسطة الشدة إلى شديدة',en:'Moderately severe to severe'}],['high',{ar:'تحتاج جرعات أعلى (مثل الغنغرينا الغازية)',en:'Needs higher doses (e.g. gas gangrene)'}]]},
      {id:'hd',type:'check',label:{ar:'غسيل كلوي دموي',en:'On haemodialysis'}}
    ],
    rows:[
      {k:{ar:'الجرعة مع كلى سليمة (جدول 1)',en:'Dose with normal kidneys (Table 1)'},rules:[
        {when:{sev:'mod'},text:{ar:'1 غرام كل 4 ساعات أو 2 غرام كل 6 إلى 8 ساعات (6 إلى 8 غرام يومياً)',en:'1 g every 4 h or 2 g every 6 to 8 h (6 to 8 g a day)'}},
        {when:{sev:'high'},text:{ar:'2 غرام كل 4 ساعات أو 3 غرام كل 6 ساعات (12 غرام يومياً)',en:'2 g every 4 h or 3 g every 6 h (12 g a day)'}},
        {when:{},text:{ar:'1 غرام كل 6 إلى 8 ساعات (3 إلى 4 غرام يومياً)',en:'1 g every 6 to 8 h (3 to 4 g a day)'}}
      ]},
      {k:{ar:'حسب الكلى بعد تحميل 1 إلى 2 غرام (جدول 2)',en:'By kidney function after a 1 to 2 g load (Table 2)'},strong:true,rules:[
        {when:{hd:true},text:{ar:'جرعة التحميل 1 إلى 2 غرام بعد كل جلسة غسيل، ثم الصيانة حسب التصفية',en:'The 1 to 2 g loading dose after each dialysis session, then maintenance by clearance'}},
        {when:{crcl:{lt:5}},text:{ar:'0.5 إلى 1 غرام كل 24 إلى 48 ساعة',en:'0.5 to 1 g every 24 to 48 h'}},
        {when:{crcl:{lt:10}},text:{ar:'0.5 إلى 1 غرام كل 12 إلى 24 ساعة',en:'0.5 to 1 g every 12 to 24 h'}},
        {when:{crcl:{lt:30}},text:{ar:'1 إلى 2 غرام كل 12 إلى 24 ساعة',en:'1 to 2 g every 12 to 24 h'}},
        {when:{crcl:{lte:50}},text:{ar:'1 إلى 2 غرام كل 8 إلى 12 ساعة',en:'1 to 2 g every 8 to 12 h'}},
        {when:{},text:{ar:'لا تعديل (تصفية أكثر من 50)',en:'No change (clearance over 50)'}}
      ]}
    ],
    notes:{ar:'إذا اشتُبه بالكلاميديا تُضاف تغطية لها. المكورات العقدية الحالّة بيتا: 10 أيام على الأقل.',en:'Add chlamydia cover if suspected. Beta-haemolytic streptococci: at least 10 days.'}
  },

  cefotetan: {
    name:{ar:'سيفوتيتان',en:'Cefotetan'},
    label:'DailyMed, cefotetan for injection (2025-01-08), Dosage and Administration', srcIds:[64], pedsRef:'Dosage and Administration',
    inputs:[
      {id:'ind',type:'select',label:{ar:'نوع العدوى',en:'Type of infection'},options:[
        ['usual',{ar:'معظم العدوى (المسالك، الجلد، مواقع أخرى)',en:'Most infections (urinary, skin, other sites)'}],
        ['severe',{ar:'شديدة',en:'Severe'}],['life',{ar:'مهددة للحياة',en:'Life-threatening'}],['proph',{ar:'وقاية جراحية',en:'Surgical prophylaxis'}]]},
      {id:'hd',type:'check',label:{ar:'غسيل كلوي دموي متقطع',en:'Intermittent haemodialysis'}}
    ],
    rows:[
      {k:{ar:'الجرعة المعتادة',en:'Usual dose'},rules:[
        {when:{ind:'severe'},text:{ar:'2 غرام وريدياً كل 12 ساعة',en:'2 g IV every 12 h'}},
        {when:{ind:'life'},text:{ar:'3 غرام وريدياً كل 12 ساعة (حد أقصى 6 غرام يومياً)',en:'3 g IV every 12 h (at most 6 g a day)'}},
        {when:{ind:'proph'},text:{ar:'1 أو 2 غرام وريدياً مرة واحدة قبل الجراحة بـ30 إلى 60 دقيقة',en:'1 or 2 g IV once, 30 to 60 minutes before surgery'}},
        {when:{},text:{ar:'1 أو 2 غرام كل 12 ساعة وريدياً أو عضلياً (المسالك: 500 ملغ كل 12، أو 1 إلى 2 غرام كل 24 أو 12 ساعة)',en:'1 or 2 g every 12 h IV or IM (urinary: 500 mg every 12 h, or 1 to 2 g every 24 or 12 h)'}}
      ]},
      {k:{ar:'حسب الكلى',en:'By kidney function'},strong:true,rules:[
        {when:{hd:true},text:{ar:'ربع الجرعة المعتادة كل 24 ساعة بين الجلسات، ونصفها يوم الغسيل',en:'A quarter of the usual dose every 24 h between sessions, and half on the dialysis day'}},
        {when:{crcl:{lt:10}},text:{ar:'الجرعة المعتادة كل 48 ساعة (أو ربع الجرعة كل 12 ساعة)',en:'The usual dose every 48 h (or a quarter of the dose every 12 h)'}},
        {when:{crcl:{lte:30}},text:{ar:'الجرعة المعتادة كل 24 ساعة (أو نصف الجرعة كل 12 ساعة)',en:'The usual dose every 24 h (or half the dose every 12 h)'}},
        {when:{},text:{ar:'الجرعة المعتادة كل 12 ساعة',en:'The usual dose every 12 h'}}
      ]}
    ],
    notes:{ar:'لا يُخلط مع الأمينوغليكوزيدات في حقنة واحدة. إذا اشتُبه بالكلاميديا في العدوى النسائية تُضاف تغطية لها.',en:'Do not mix with aminoglycosides in one injection. In gynaecological infection, add chlamydia cover if suspected.'}
  },

  cefotaxime: {
    name:{ar:'سيفوتاكسيم',en:'Cefotaxime'},
    label:'DailyMed, cefotaxime for injection (2024-04-11), Dosage and Administration', srcIds:[65], pedsRef:'Dosage and Administration',
    inputs:[{id:'ind',type:'select',label:{ar:'نوع العدوى',en:'Type of infection'},options:[
      ['gono',{ar:'السيلان (الإحليل أو عنق الرحم، أو الشرج عند النساء)',en:'Gonorrhoea (urethra or cervix, or rectal in women)'}],['rgm',{ar:'السيلان الشرجي عند الرجال',en:'Rectal gonorrhoea in men'}],
      ['unc',{ar:'غير معقدة',en:'Uncomplicated'}],['mod',{ar:'متوسطة إلى شديدة',en:'Moderate to severe'}],['sep',{ar:'تحتاج جرعات أعلى (مثل تسمم الدم)',en:'Needs higher doses (e.g. septicaemia)'}],
      ['life',{ar:'مهددة للحياة',en:'Life-threatening'}],['proph',{ar:'وقاية جراحية',en:'Surgical prophylaxis'}]]}],
    rows:[
      {k:{ar:'الجرعة المعتادة',en:'Usual dose'},rules:[
        {when:{ind:'gono'},text:{ar:'0.5 غرام عضلياً مرة واحدة',en:'0.5 g IM once'}},
        {when:{ind:'rgm'},text:{ar:'1 غرام عضلياً مرة واحدة',en:'1 g IM once'}},
        {when:{ind:'unc'},text:{ar:'1 غرام كل 12 ساعة',en:'1 g every 12 h'}},
        {when:{ind:'sep'},text:{ar:'2 غرام وريدياً كل 6 إلى 8 ساعات',en:'2 g IV every 6 to 8 h'}},
        {when:{ind:'life'},text:{ar:'2 غرام وريدياً كل 4 ساعات (حد أقصى 12 غرام يومياً)',en:'2 g IV every 4 h (at most 12 g a day)'}},
        {when:{ind:'proph'},text:{ar:'1 غرام مرة واحدة قبل الجراحة بـ30 إلى 90 دقيقة',en:'1 g once, 30 to 90 minutes before surgery'}},
        {when:{},text:{ar:'1 إلى 2 غرام كل 8 ساعات',en:'1 to 2 g every 8 h'}}
      ]},
      {k:{ar:'حسب الكلى',en:'By kidney function'},strong:true,rules:[
        {when:{crcl:{lt:20}},text:{ar:'نصف الجرعة',en:'Half the dose'}},
        {when:{},text:{ar:'لا تعديل (تصفية 20 فأكثر)',en:'No change (clearance 20 or more)'}}
      ]}
    ],
    notes:{ar:'إذا اشتُبه بالكلاميديا تُضاف تغطية لها.',en:'Add chlamydia cover if suspected.'}
  },

  ceftaz: {
    name:{ar:'سيفتازيديم',en:'Ceftazidime'},
    label:'DailyMed, ceftazidime for injection (2026-08-03), Dosage and Administration, Table 3 and renal table', srcIds:[66], pedsRef:'Dosage and Administration',
    inputs:[
      {id:'ind',type:'select',label:{ar:'نوع العدوى',en:'Type of infection'},options:[
        ['usual',{ar:'الجرعة المعتادة',en:'Usual'}],['uuti',{ar:'المسالك غير المعقدة',en:'Uncomplicated urinary'}],['cuti',{ar:'المسالك المعقدة',en:'Complicated urinary'}],
        ['bone',{ar:'العظام والمفاصل',en:'Bone and joint'}],['pneu',{ar:'التهاب رئة غير معقد أو جلد خفيف',en:'Uncomplicated pneumonia or mild skin'}],
        ['sev',{ar:'نسائية أو بطنية خطيرة، سحايا، أو مهددة للحياة',en:'Serious gynaecological or abdominal, meningitis, or life-threatening'}]]},
      {id:'dial',type:'select',label:{ar:'الغسيل الكلوي',en:'Dialysis'},options:[['none',{ar:'لا',en:'None'}],['hd',{ar:'غسيل دموي',en:'Haemodialysis'}],['pd',{ar:'غسيل بريتوني',en:'Peritoneal dialysis'}]]}
    ],
    rows:[
      {k:{ar:'الجرعة مع كلى سليمة (جدول 3)',en:'Dose with normal kidneys (Table 3)'},rules:[
        {when:{ind:'uuti'},text:{ar:'250 ملغ كل 12 ساعة',en:'250 mg every 12 h'}},
        {when:{ind:'cuti'},text:{ar:'500 ملغ كل 8 إلى 12 ساعة',en:'500 mg every 8 to 12 h'}},
        {when:{ind:'bone'},text:{ar:'2 غرام وريدياً كل 12 ساعة',en:'2 g IV every 12 h'}},
        {when:{ind:'pneu'},text:{ar:'500 ملغ إلى 1 غرام كل 8 ساعات',en:'500 mg to 1 g every 8 h'}},
        {when:{ind:'sev'},text:{ar:'2 غرام وريدياً كل 8 ساعات',en:'2 g IV every 8 h'}},
        {when:{},text:{ar:'1 غرام كل 8 إلى 12 ساعة',en:'1 g every 8 to 12 h'}}
      ]},
      {k:{ar:'حسب الكلى (بعد تحميل 1 غرام)',en:'By kidney function (after a 1 g load)'},strong:true,rules:[
        {when:{dial:'hd'},text:{ar:'1 غرام تحميل، ثم 1 غرام بعد كل جلسة غسيل',en:'1 g loading, then 1 g after each dialysis session'}},
        {when:{dial:'pd'},text:{ar:'1 غرام تحميل، ثم 500 ملغ كل 24 ساعة',en:'1 g loading, then 500 mg every 24 h'}},
        {when:{crcl:{lt:6}},text:{ar:'500 ملغ كل 48 ساعة',en:'500 mg every 48 h'}},
        {when:{crcl:{lt:16}},text:{ar:'500 ملغ كل 24 ساعة',en:'500 mg every 24 h'}},
        {when:{crcl:{lt:31}},text:{ar:'1 غرام كل 24 ساعة',en:'1 g every 24 h'}},
        {when:{crcl:{lte:50}},text:{ar:'1 غرام كل 12 ساعة',en:'1 g every 12 h'}},
        {when:{},text:{ar:'لا تعديل (تصفية أكثر من 50)',en:'No change (clearance over 50)'}}
      ]}
    ],
    notes:{ar:'في العدوى الشديدة التي تحتاج 6 غرام يومياً مع القصور الكلوي، يمكن زيادة جرعة الجدول 50% أو تقريب الفواصل.',en:'In severe infection that would need 6 g a day, the table dose may be increased by 50% or given more often.'}
  },
  cefepime: {
    name:{ar:'سيفيبيم',en:'Cefepime'},
    label:'DailyMed, cefepime injection (2026-06-25), sections 2.1 and 2.3, Tables 1 and 2', srcIds:[67], pedsRef:'2.2',
    inputs:[
      {id:'reg',type:'select',label:{ar:'الجرعة المعتادة (حسب العدوى)',en:'Usual regimen (by infection)'},options:[
        ['a',{ar:'500 ملغ كل 12 ساعة (المسالك الخفيفة)',en:'500 mg every 12 h (mild urinary)'}],
        ['b',{ar:'1 غرام كل 12 ساعة (المسالك، الرئة)',en:'1 g every 12 h (urinary, pneumonia)'}],
        ['c',{ar:'2 غرام كل 12 ساعة (المسالك الشديدة، الجلد، الرئة)',en:'2 g every 12 h (severe urinary, skin, pneumonia)'}],
        ['d',{ar:'2 غرام كل 8 ساعات (نقص العدلات مع الحمى، الزائفة، البطن)',en:'2 g every 8 h (febrile neutropenia, Pseudomonas, abdominal)'}]]},
      {id:'dial',type:'select',label:{ar:'الغسيل الكلوي',en:'Dialysis'},options:[['none',{ar:'لا',en:'None'}],['hd',{ar:'غسيل دموي',en:'Haemodialysis'}],['capd',{ar:'غسيل بريتوني مستمر',en:'Continuous peritoneal dialysis'}]]}
    ],
    rows:[
      {k:{ar:'الصيانة حسب الكلى (جدول 2)',en:'Maintenance by kidney function (Table 2)'},strong:true,rules:[
        {when:{dial:'hd',reg:['a','b','c']},text:{ar:'1 غرام في اليوم الأول ثم 500 ملغ كل 24 ساعة، بعد الغسيل',en:'1 g on day 1, then 500 mg every 24 h, after dialysis'}},
        {when:{dial:'hd'},text:{ar:'1 غرام كل 24 ساعة، بعد الغسيل',en:'1 g every 24 h, after dialysis'}},
        {when:{dial:'capd',reg:'a'},text:{ar:'500 ملغ كل 48 ساعة',en:'500 mg every 48 h'}},
        {when:{dial:'capd',reg:'b'},text:{ar:'1 غرام كل 48 ساعة',en:'1 g every 48 h'}},
        {when:{dial:'capd'},text:{ar:'2 غرام كل 48 ساعة',en:'2 g every 48 h'}},
        {when:{crcl:{lt:11},reg:['a','b']},text:{ar:'250 ملغ كل 24 ساعة',en:'250 mg every 24 h'}},
        {when:{crcl:{lt:11},reg:'c'},text:{ar:'500 ملغ كل 24 ساعة',en:'500 mg every 24 h'}},
        {when:{crcl:{lt:11}},text:{ar:'1 غرام كل 24 ساعة',en:'1 g every 24 h'}},
        {when:{crcl:{lt:30},reg:['a','b']},text:{ar:'500 ملغ كل 24 ساعة',en:'500 mg every 24 h'}},
        {when:{crcl:{lt:30},reg:'c'},text:{ar:'1 غرام كل 24 ساعة',en:'1 g every 24 h'}},
        {when:{crcl:{lt:30}},text:{ar:'2 غرام كل 24 ساعة',en:'2 g every 24 h'}},
        {when:{crcl:{lte:60},reg:'a'},text:{ar:'500 ملغ كل 24 ساعة',en:'500 mg every 24 h'}},
        {when:{crcl:{lte:60},reg:'b'},text:{ar:'1 غرام كل 24 ساعة',en:'1 g every 24 h'}},
        {when:{crcl:{lte:60},reg:'c'},text:{ar:'2 غرام كل 24 ساعة',en:'2 g every 24 h'}},
        {when:{crcl:{lte:60}},text:{ar:'2 غرام كل 12 ساعة',en:'2 g every 12 h'}},
        {when:{},text:{ar:'لا تعديل (تصفية أكثر من 60)',en:'No change (clearance over 60)'}}
      ]},
      {k:{ar:'الجرعة الأولى',en:'First dose'},rules:[
        {when:{dial:'hd'},text:{ar:'كما في الصف أعلاه',en:'As in the row above'}},
        {when:{},text:{ar:'كالجرعة المعتادة، ثم الصيانة',en:'The usual dose, then maintenance'}}
      ]}
    ],
    notes:{ar:'تسريب وريدي خلال 30 دقيقة. يوم الغسيل يُعطى بعده، وفي الوقت نفسه كل يوم.',en:'IV over 30 minutes. On dialysis days give it after dialysis, at the same time each day.'}
  },

  ceftaroline: {
    name:{ar:'سيفتارولين فوساميل',en:'Ceftaroline fosamil'},
    label:'DailyMed, ceftaroline fosamil for injection (2026-05-29), sections 2.1 and 2.3', srcIds:[68], pedsRef:'2.2',
    inputs:[{id:'ind',type:'select',label:{ar:'العدوى',en:'Infection'},options:[['skin',{ar:'عدوى الجلد الحادة',en:'Acute skin infection'}],['cap',{ar:'التهاب الرئة المجتمعي',en:'Community pneumonia'}]]}],
    rows:[
      {k:{ar:'الجرعة حسب الكلى',en:'Dose by kidney function'},strong:true,rules:[
        {when:{crcl:{lt:15}},text:{ar:'200 ملغ كل 12 ساعة (الفشل النهائي ومنه الغسيل)',en:'200 mg every 12 h (end-stage, including dialysis)'}},
        {when:{crcl:{lte:30}},text:{ar:'300 ملغ كل 12 ساعة',en:'300 mg every 12 h'}},
        {when:{crcl:{lte:50}},text:{ar:'400 ملغ كل 12 ساعة',en:'400 mg every 12 h'}},
        {when:{},text:{ar:'600 ملغ كل 12 ساعة',en:'600 mg every 12 h'}}
      ]},
      {k:{ar:'المدة',en:'Duration'},rules:[
        {when:{ind:'cap'},text:{ar:'5 إلى 7 أيام',en:'5 to 7 days'}},
        {when:{},text:{ar:'5 إلى 14 يوماً',en:'5 to 14 days'}}
      ]}
    ],
    notes:{ar:'تسريب وريدي خلال 5 إلى 60 دقيقة.',en:'IV infusion over 5 to 60 minutes.'}
  },

  ceftobiprole: {
    name:{ar:'سيفتوبيبرول',en:'Ceftobiprole'},
    label:'DailyMed, Zevtera (2026-10-13), sections 2.1 and 2.3, Table 3', srcIds:[69], pedsRef:'2.2',
    inputs:[{id:'ind',type:'select',label:{ar:'العدوى',en:'Infection'},options:[['sab',{ar:'تجرثم الدم بالعنقودية الذهبية',en:'S. aureus bacteraemia'}],['other',{ar:'الجلد الحادة أو الرئة المجتمعي',en:'Acute skin or community pneumonia'}]]}],
    rows:[
      {k:{ar:'الجرعة حسب الكلى',en:'Dose by kidney function'},strong:true,rules:[
        {when:{crcl:{gt:150}},text:{ar:'667 ملغ كل 6 ساعات (تصفية أكثر من 150)',en:'667 mg every 6 h (clearance over 150)'}},
        {when:{crcl:{lt:15}},text:{ar:'333 ملغ كل 24 ساعة (يوم الغسيل: بعده)',en:'333 mg every 24 h (dialysis days: after it)'}},
        {when:{crcl:{lt:30},ind:'sab'},text:{ar:'333 ملغ كل 8 ساعات في الأيام 1 إلى 8، ثم كل 12 ساعة',en:'333 mg every 8 h on days 1 to 8, then every 12 h'}},
        {when:{crcl:{lt:30}},text:{ar:'333 ملغ كل 12 ساعة',en:'333 mg every 12 h'}},
        {when:{crcl:{lt:50},ind:'sab'},text:{ar:'667 ملغ كل 8 ساعات في الأيام 1 إلى 8، ثم كل 12 ساعة',en:'667 mg every 8 h on days 1 to 8, then every 12 h'}},
        {when:{crcl:{lt:50}},text:{ar:'667 ملغ كل 12 ساعة',en:'667 mg every 12 h'}},
        {when:{ind:'sab'},text:{ar:'667 ملغ كل 6 ساعات في الأيام 1 إلى 8، ثم كل 8 ساعات',en:'667 mg every 6 h on days 1 to 8, then every 8 h'}},
        {when:{},text:{ar:'667 ملغ كل 8 ساعات',en:'667 mg every 8 h'}}
      ]},
      {k:{ar:'المدة',en:'Duration'},rules:[
        {when:{ind:'sab'},text:{ar:'حتى 42 يوماً',en:'Up to 42 days'}},
        {when:{},text:{ar:'5 إلى 14 يوماً',en:'5 to 14 days'}}
      ]}
    ],
    notes:{ar:'تسريب وريدي خلال ساعتين بتركيز 2.67 ملغ/مل.',en:'IV infusion over 2 hours at 2.67 mg/mL.'}
  },

  cefiderocol: {
    name:{ar:'سيفيديروكول',en:'Cefiderocol'},
    label:'DailyMed, Fetroja (2026-02-24), sections 2.1 and 2.2, Table 1', srcIds:[70], pedsRef:'1',
    inputs:[],
    rows:[
      {k:{ar:'الجرعة حسب الكلى',en:'Dose by kidney function'},strong:true,rules:[
        {when:{crcl:{gte:120}},text:{ar:'2 غرام كل 6 ساعات',en:'2 g every 6 h'}},
        {when:{crcl:{gte:60}},text:{ar:'2 غرام كل 8 ساعات',en:'2 g every 8 h'}},
        {when:{crcl:{gte:30}},text:{ar:'1.5 غرام كل 8 ساعات',en:'1.5 g every 8 h'}},
        {when:{crcl:{gte:15}},text:{ar:'1 غرام كل 8 ساعات',en:'1 g every 8 h'}},
        {when:{},text:{ar:'0.75 غرام كل 12 ساعة (مع الغسيل: بعده مباشرة)',en:'0.75 g every 12 h (on dialysis: right after it)'}}
      ]},
      {k:{ar:'طريقة الإعطاء',en:'How to give'},rules:[
        {when:{},text:{ar:'تسريب وريدي خلال 3 ساعات، لـ7 إلى 14 يوماً.',en:'IV infusion over 3 hours, for 7 to 14 days.'}}
      ]}
    ],
    notes:{ar:'للبالغين فقط. الغسيل المستمر (CRRT): الجرعة حسب معدل التدفق في الملصق.',en:'Adults only. Continuous renal replacement (CRRT): dose by effluent flow in the label.'}
  },

  ceftolo_tazo: {
    name:{ar:'سيفتولوزان–تازوباكتام',en:'Ceftolozane–tazobactam'},
    label:'DailyMed, Zerbaxa (2026-05-12), sections 2.1 and 2.3, Tables 1 and 3', srcIds:[71], pedsRef:'2.2',
    inputs:[
      {id:'ind',type:'select',label:{ar:'العدوى',en:'Infection'},options:[['ciai',{ar:'البطن المعقدة (مع الميترونيدازول)',en:'Complicated intra-abdominal (with metronidazole)'}],['cuti',{ar:'المسالك المعقدة أو الحويضة',en:'Complicated urinary or pyelonephritis'}],['hap',{ar:'التهاب الرئة في المستشفى أو على جهاز التنفس',en:'Hospital or ventilator pneumonia'}]]},
      {id:'hd',type:'check',label:{ar:'غسيل كلوي دموي متقطع',en:'Intermittent haemodialysis'}}
    ],
    rows:[
      {k:{ar:'الجرعة كل 8 ساعات حسب الكلى',en:'Dose every 8 h by kidney function'},strong:true,rules:[
        {when:{hd:true,ind:'hap'},text:{ar:'تحميل 2.25 غرام، ثم 450 ملغ كل 8 ساعات (بعد الغسيل)',en:'2.25 g loading, then 450 mg every 8 h (after dialysis)'}},
        {when:{hd:true},text:{ar:'تحميل 750 ملغ، ثم 150 ملغ كل 8 ساعات (بعد الغسيل)',en:'750 mg loading, then 150 mg every 8 h (after dialysis)'}},
        {when:{crcl:{lt:15}},text:{ar:'الجرعة غير محددة في الملصق (أقل من 15 بلا غسيل)',en:'Dose not established in the label (under 15 without dialysis)'},warn:true},
        {when:{crcl:{lt:30},ind:'hap'},text:{ar:'750 ملغ',en:'750 mg'}},
        {when:{crcl:{lt:30}},text:{ar:'375 ملغ',en:'375 mg'}},
        {when:{crcl:{lte:50},ind:'hap'},text:{ar:'1.5 غرام',en:'1.5 g'}},
        {when:{crcl:{lte:50}},text:{ar:'750 ملغ',en:'750 mg'}},
        {when:{ind:'hap'},text:{ar:'3 غرام',en:'3 g'}},
        {when:{},text:{ar:'1.5 غرام',en:'1.5 g'}}
      ]},
      {k:{ar:'المدة',en:'Duration'},rules:[
        {when:{ind:'ciai'},text:{ar:'4 إلى 14 يوماً',en:'4 to 14 days'}},
        {when:{ind:'cuti'},text:{ar:'7 أيام',en:'7 days'}},
        {when:{},text:{ar:'8 إلى 14 يوماً',en:'8 to 14 days'}}
      ]}
    ],
    notes:{ar:'تسريب وريدي خلال ساعة. مع تغيّر وظيفة الكلى تُحسب التصفية يومياً على الأقل.',en:'IV infusion over 1 hour. With changing kidney function, check clearance at least daily.'}
  },

  ceftaz_avi: {
    name:{ar:'سيفتازيديم–أفيباكتام',en:'Ceftazidime–avibactam'},
    label:'DailyMed, Avycaz (2025-04-30), sections 2.1 and 2.3, Tables 1 and 3', srcIds:[72], pedsRef:'2.2',
    inputs:[{id:'ind',type:'select',label:{ar:'العدوى',en:'Infection'},options:[['ciai',{ar:'البطن المعقدة (مع الميترونيدازول)',en:'Complicated intra-abdominal (with metronidazole)'}],['cuti',{ar:'المسالك المعقدة أو الحويضة',en:'Complicated urinary or pyelonephritis'}],['hap',{ar:'التهاب الرئة في المستشفى أو على جهاز التنفس',en:'Hospital or ventilator pneumonia'}]]}],
    rows:[
      {k:{ar:'الجرعة حسب الكلى',en:'Dose by kidney function'},strong:true,rules:[
        {when:{crcl:{lte:5}},text:{ar:'0.94 غرام كل 48 ساعة',en:'0.94 g every 48 h'}},
        {when:{crcl:{lte:15}},text:{ar:'0.94 غرام كل 24 ساعة',en:'0.94 g every 24 h'}},
        {when:{crcl:{lte:30}},text:{ar:'0.94 غرام كل 12 ساعة',en:'0.94 g every 12 h'}},
        {when:{crcl:{lte:50}},text:{ar:'1.25 غرام كل 8 ساعات',en:'1.25 g every 8 h'}},
        {when:{},text:{ar:'2.5 غرام كل 8 ساعات',en:'2.5 g every 8 h'}}
      ]},
      {k:{ar:'المدة',en:'Duration'},rules:[
        {when:{ind:'ciai'},text:{ar:'5 إلى 14 يوماً',en:'5 to 14 days'}},
        {when:{},text:{ar:'7 إلى 14 يوماً',en:'7 to 14 days'}}
      ]}
    ],
    notes:{ar:'تسريب وريدي خلال ساعتين. يوم الغسيل يُعطى بعده.',en:'IV infusion over 2 hours. On dialysis days give it after dialysis.'}
  },

  imi_cila: {
    name:{ar:'إيميبينيم–سيلاستاتين',en:'Imipenem–cilastatin'},
    label:'DailyMed, imipenem and cilastatin for injection (2025-01-16), sections 2.1 and 2.3, Tables 1 and 3', srcIds:[73], pedsRef:'2.2',
    inputs:[{id:'reg',type:'select',label:{ar:'الجرعة المعتادة',en:'Usual regimen'},options:[
      ['a',{ar:'500 ملغ كل 6 ساعات (حساسة)',en:'500 mg every 6 h (susceptible)'}],['b',{ar:'1000 ملغ كل 8 ساعات (حساسة)',en:'1000 mg every 8 h (susceptible)'}],['c',{ar:'1000 ملغ كل 6 ساعات (متوسطة الحساسية)',en:'1000 mg every 6 h (intermediate)'}]]}],
    rows:[
      {k:{ar:'الجرعة حسب الكلى (جدول 3)',en:'Dose by kidney function (Table 3)'},strong:true,rules:[
        {when:{crcl:{lt:15}},text:{ar:'لا يُعطى إلا إذا بدأ الغسيل خلال 48 ساعة',en:'Not unless dialysis starts within 48 h'},warn:true},
        {when:{crcl:{lt:30},reg:'a'},text:{ar:'200 ملغ كل 6 ساعات',en:'200 mg every 6 h'}},
        {when:{crcl:{lt:30}},text:{ar:'500 ملغ كل 12 ساعة',en:'500 mg every 12 h'}},
        {when:{crcl:{lt:60},reg:'a'},text:{ar:'300 ملغ كل 6 ساعات',en:'300 mg every 6 h'}},
        {when:{crcl:{lt:60},reg:'b'},text:{ar:'500 ملغ كل 8 ساعات',en:'500 mg every 8 h'}},
        {when:{crcl:{lt:60}},text:{ar:'500 ملغ كل 6 ساعات',en:'500 mg every 6 h'}},
        {when:{crcl:{lt:90},reg:'a'},text:{ar:'400 ملغ كل 6 ساعات',en:'400 mg every 6 h'}},
        {when:{crcl:{lt:90},reg:'b'},text:{ar:'500 ملغ كل 6 ساعات',en:'500 mg every 6 h'}},
        {when:{crcl:{lt:90}},text:{ar:'750 ملغ كل 8 ساعات',en:'750 mg every 8 h'}},
        {when:{reg:'a'},text:{ar:'500 ملغ كل 6 ساعات',en:'500 mg every 6 h'}},
        {when:{reg:'b'},text:{ar:'1000 ملغ كل 8 ساعات',en:'1000 mg every 8 h'}},
        {when:{},text:{ar:'1000 ملغ كل 6 ساعات',en:'1000 mg every 6 h'}}
      ]},
      {k:{ar:'تنبيه',en:'Warning'},warn:true,opt:true,rules:[
        {when:{crcl:{lt:30}},text:{ar:'التصفية 15 إلى 29: خطر نوبات صرع أعلى.',en:'Clearance 15 to 29: higher seizure risk.'}}
      ]}
    ],
    notes:{ar:'الجرعات بالإيميبينيم. 500 ملغ أو أقل خلال 20 إلى 30 دقيقة، والأكثر خلال 40 إلى 60 دقيقة.',en:'Doses as imipenem. 500 mg or less over 20 to 30 minutes, more over 40 to 60 minutes.'}
  },

  meropenem: {
    name:{ar:'ميروبينيم',en:'Meropenem'},
    label:'DailyMed, meropenem for injection (2026-08-26), sections 2.1 and 2.2', srcIds:[74], pedsRef:'2.3',
    inputs:[{id:'ind',type:'select',label:{ar:'العدوى',en:'Infection'},options:[['skin',{ar:'الجلد المعقد',en:'Complicated skin'}],['skinp',{ar:'الجلد المعقد بالزائفة الزنجارية',en:'Complicated skin, Pseudomonas'}],['ciai',{ar:'البطن',en:'Intra-abdominal'}]]}],
    rows:[
      {k:{ar:'الجرعة حسب الكلى',en:'Dose by kidney function'},strong:true,rules:[
        {when:{crcl:{lt:10},ind:'skin'},text:{ar:'250 ملغ كل 24 ساعة (نصف الجرعة)',en:'250 mg every 24 h (half dose)'}},
        {when:{crcl:{lt:10}},text:{ar:'500 ملغ كل 24 ساعة (نصف الجرعة)',en:'500 mg every 24 h (half dose)'}},
        {when:{crcl:{lte:25},ind:'skin'},text:{ar:'250 ملغ كل 12 ساعة (نصف الجرعة)',en:'250 mg every 12 h (half dose)'}},
        {when:{crcl:{lte:25}},text:{ar:'500 ملغ كل 12 ساعة (نصف الجرعة)',en:'500 mg every 12 h (half dose)'}},
        {when:{crcl:{lte:50},ind:'skin'},text:{ar:'500 ملغ كل 12 ساعة',en:'500 mg every 12 h'}},
        {when:{crcl:{lte:50}},text:{ar:'1 غرام كل 12 ساعة',en:'1 g every 12 h'}},
        {when:{ind:'skin'},text:{ar:'500 ملغ كل 8 ساعات',en:'500 mg every 8 h'}},
        {when:{},text:{ar:'1 غرام كل 8 ساعات',en:'1 g every 8 h'}}
      ]}
    ],
    notes:{ar:'تسريب خلال 15 إلى 30 دقيقة أو حقن بطيء خلال 3 إلى 5 دقائق. لا يُجمع مع الفالبرويك عموماً.',en:'Infusion over 15 to 30 minutes, or bolus over 3 to 5 minutes. Generally not with valproic acid.'}
  },

  ertapenem: {
    name:{ar:'إرتابينيم',en:'Ertapenem'},
    label:'DailyMed, ertapenem for injection (2026-03-02), sections 2.2 to 2.5', srcIds:[75], pedsRef:'2.2',
    inputs:[
      {id:'ind',type:'select',label:{ar:'الاستعمال',en:'Use'},options:[['treat',{ar:'علاج',en:'Treatment'}],['proph',{ar:'وقاية في جراحة القولون',en:'Colorectal surgery prophylaxis'}]]},
      {id:'hd',type:'check',label:{ar:'غسيل كلوي دموي',en:'On haemodialysis'}}
    ],
    rows:[
      {k:{ar:'الجرعة',en:'Dose'},strong:true,rules:[
        {when:{ind:'proph'},text:{ar:'1 غرام مرة واحدة قبل الجراحة بساعة',en:'1 g once, 1 hour before surgery'}},
        {when:{crcl:{lte:30}},text:{ar:'500 ملغ مرة يومياً',en:'500 mg once a day'}},
        {when:{},text:{ar:'1 غرام مرة يومياً',en:'1 g once a day'}}
      ]},
      {k:{ar:'الغسيل',en:'Dialysis'},opt:true,rules:[
        {when:{hd:true},text:{ar:'إذا أُعطي خلال 6 ساعات قبل الغسيل: 150 ملغ إضافية بعده.',en:'If given within 6 h before dialysis: an extra 150 mg after it.'}}
      ]}
    ],
    notes:{ar:'وريدي خلال 30 دقيقة (حتى 14 يوماً) أو عضلي (حتى 7 أيام). لا يُخلط مع أدوية أخرى أو الدكستروز.',en:'IV over 30 minutes (up to 14 days) or IM (up to 7 days). Do not mix with other drugs or dextrose.'}
  },

  imi_rele: {
    name:{ar:'إيميبينيم–سيلاستاتين–ريليباكتام',en:'Imipenem–cilastatin–relebactam'},
    label:'DailyMed, Recarbrio (2025-12-09), sections 2.1 and 2.3, Table 2', srcIds:[76], pedsRef:'2.2',
    inputs:[{id:'hd',type:'check',label:{ar:'غسيل كلوي دموي',en:'On haemodialysis'}}],
    rows:[
      {k:{ar:'الجرعة حسب الكلى',en:'Dose by kidney function'},strong:true,rules:[
        {when:{hd:true},text:{ar:'0.5 غرام كل 6 ساعات، بعد الغسيل',en:'0.5 g every 6 h, after dialysis'}},
        {when:{crcl:{lt:15}},text:{ar:'لا يُعطى إلا إذا بدأ الغسيل خلال 48 ساعة',en:'Not unless dialysis starts within 48 h'},warn:true},
        {when:{crcl:{lt:30}},text:{ar:'0.5 غرام كل 6 ساعات',en:'0.5 g every 6 h'}},
        {when:{crcl:{lt:60}},text:{ar:'0.75 غرام كل 6 ساعات',en:'0.75 g every 6 h'}},
        {when:{crcl:{lt:90}},text:{ar:'1 غرام كل 6 ساعات',en:'1 g every 6 h'}},
        {when:{},text:{ar:'1.25 غرام كل 6 ساعات',en:'1.25 g every 6 h'}}
      ]}
    ],
    notes:{ar:'تسريب وريدي خلال 30 دقيقة. يُتجنب الغانسيكلوفير والفالبرويك.',en:'IV infusion over 30 minutes. Avoid ganciclovir and valproic acid.'}
  },

  aztreonam: {
    name:{ar:'أزتريونام',en:'Aztreonam'},
    label:'DailyMed, Azactam (2025-12-15), Dosage and Administration, Tables 2 and 3', srcIds:[77], pedsRef:'Table 3',
    inputs:[
      {id:'ind',type:'select',label:{ar:'العدوى',en:'Infection'},options:[['uti',{ar:'المسالك البولية',en:'Urinary tract'}],['mod',{ar:'جهازية متوسطة الشدة',en:'Moderately severe systemic'}],['sev',{ar:'شديدة أو مهددة للحياة أو الزائفة الزنجارية',en:'Severe, life-threatening, or Pseudomonas'}]]},
      {id:'hd',type:'check',label:{ar:'غسيل كلوي دموي',en:'On haemodialysis'}}
    ],
    rows:[
      {k:{ar:'الجرعة المعتادة',en:'Usual dose'},strong:true,rules:[
        {when:{ind:'uti'},text:{ar:'500 ملغ أو 1 غرام كل 8 أو 12 ساعة',en:'500 mg or 1 g every 8 or 12 h'}},
        {when:{ind:'mod'},text:{ar:'1 أو 2 غرام كل 8 أو 12 ساعة',en:'1 or 2 g every 8 or 12 h'}},
        {when:{},text:{ar:'2 غرام كل 6 أو 8 ساعات',en:'2 g every 6 or 8 h'}}
      ]},
      {k:{ar:'حسب الكلى',en:'By kidney function'},rules:[
        {when:{hd:true},text:{ar:'الجرعة الأولى المعتادة، ثم ربعها على الفاصل نفسه؛ وفي العدوى الخطيرة ثُمن الجرعة الأولى بعد كل غسيل',en:'The usual first dose, then a quarter of it at the same interval; in serious infection, one eighth of the first dose after each dialysis'}},
        {when:{crcl:{lt:10}},text:{ar:'الجرعة الأولى المعتادة، ثم ربعها على الفاصل نفسه',en:'The usual first dose, then a quarter of it at the same interval'}},
        {when:{crcl:{lte:30}},text:{ar:'جرعة أولى 1 أو 2 غرام، ثم نصف الجرعة',en:'A first dose of 1 or 2 g, then half the dose'}},
        {when:{},text:{ar:'بلا تعديل',en:'No change'}}
      ]}
    ],
    notes:{ar:'الحد الأقصى 8 غرامات يومياً. حدود الملصق بالمل/دقيقة/1.73 م². الوريدي أفضل للجرعات أكثر من 1 غرام.',en:'Maximum 8 g a day. The label limits are in mL/min/1.73 m². IV is preferred for single doses over 1 g.'}
  },

  mero_vabor: {
    name:{ar:'ميروبينيم–فابورباكتام',en:'Meropenem–vaborbactam'},
    label:'DailyMed, Vabomere (2026-02-27), sections 2.1 and 2.2, Table 1', srcIds:[78], pedsRef:'8.4', egfr:true,
    inputs:[{id:'hd',type:'check',label:{ar:'غسيل كلوي دموي',en:'On haemodialysis'}}],
    rows:[
      {k:{ar:'الجرعة حسب معدل الترشيح',en:'Dose by eGFR'},strong:true,rules:[
        {when:{hd:true},text:{ar:'1 غرام كل 12 ساعة، بعد الغسيل',en:'1 g every 12 h, after dialysis'}},
        {when:{egfr:{lt:15}},text:{ar:'1 غرام (ميروبينيم 0.5 + فابورباكتام 0.5) كل 12 ساعة',en:'1 g (meropenem 0.5 + vaborbactam 0.5) every 12 h'}},
        {when:{egfr:{lt:30}},text:{ar:'2 غرام (ميروبينيم 1 + فابورباكتام 1) كل 12 ساعة',en:'2 g (meropenem 1 + vaborbactam 1) every 12 h'}},
        {when:{egfr:{lt:50}},text:{ar:'2 غرام (ميروبينيم 1 + فابورباكتام 1) كل 8 ساعات',en:'2 g (meropenem 1 + vaborbactam 1) every 8 h'}},
        {when:{},text:{ar:'4 غرامات (ميروبينيم 2 + فابورباكتام 2) كل 8 ساعات',en:'4 g (meropenem 2 + vaborbactam 2) every 8 h'}}
      ]}
    ],
    notes:{ar:'تسريب وريدي خلال 3 ساعات، حتى 14 يوماً. الملصق يستعمل معدل الترشيح (MDRD) لا تصفية كوكروفت-غولت؛ يُراجع يومياً إذا تغيرت الكلى.',en:'IV infusion over 3 hours, for up to 14 days. The label uses eGFR (MDRD), not Cockcroft-Gault; recheck daily if kidney function changes.'}
  },

  amikacin: {
    name:{ar:'أميكاسين',en:'Amikacin'},
    label:'DailyMed, amikacin sulfate injection (2026-07-27), Dosage and Administration', srcIds:[79], pedsRef:'Dosage and Administration',
    inputs:[{id:'reg',type:'select',label:{ar:'النظام',en:'Regimen'},options:[['q12',{ar:'كل 12 ساعة',en:'Every 12 h'}],['q8',{ar:'كل 8 ساعات',en:'Every 8 h'}],['uuti',{ar:'المسالك البولية غير المعقدة',en:'Uncomplicated urinary infection'}]]}],
    rows:[
      {k:{ar:'الجرعة مع كلى سليمة',en:'Dose with normal kidneys'},strong:true,rules:[
        {when:{reg:'uuti'},text:{ar:'250 ملغ مرتين يومياً',en:'250 mg twice a day'}},
        {when:{reg:'q8'},text:{ar:'{mgkg:5|max:500} ملغ كل 8 ساعات (5 ملغ/كغ؛ لا تتجاوز 1.5 غرام يومياً)',en:'{mgkg:5|max:500} mg every 8 h (5 mg/kg; not over 1.5 g a day)'}},
        {when:{},text:{ar:'{mgkg:7.5|max:750} ملغ كل 12 ساعة (7.5 ملغ/كغ؛ لا تتجاوز 1.5 غرام يومياً)',en:'{mgkg:7.5|max:750} mg every 12 h (7.5 mg/kg; not over 1.5 g a day)'}}
      ]},
      {k:{ar:'إذا كانت الكلى ضعيفة (طريقة الملصق)',en:'If the kidneys are impaired (label method)'},rules:[
        {when:{},text:{ar:'جرعة 7.5 ملغ/كغ كل {scrx:9} ساعة تقريباً (كرياتينين الدم × 9)، مع قياس المستوى',en:'7.5 mg/kg about every {scrx:9} h (serum creatinine × 9), with level monitoring'}}
      ]},
      {k:{ar:'المراقبة',en:'Monitoring'},rules:[
        {when:{},text:{ar:'تجنب ذروة أكثر من 35 وقاع أكثر من 10 مكغ/مل. المدة عادة 7 إلى 10 أيام.',en:'Avoid a peak over 35 and a trough over 10 mcg/mL. Usually 7 to 10 days.'}}
      ]},
      {k:{ar:'تنبيه',en:'Warning'},warn:true,rules:[
        {when:{},text:{ar:'سمية للأذن والكلى والأعصاب: تجنب الأدوية السامة للكلى ومدرات البول القوية.',en:'Ear, kidney and nerve toxicity: avoid nephrotoxic drugs and potent diuretics.'}}
      ]}
    ],
    notes:{ar:'الوزن قبل العلاج (الفعلي). طريقة الكرياتينين × 9 لا تُستعمل مع الغسيل.',en:'Pre-treatment (actual) weight. The creatinine × 9 method is not for patients on dialysis.'}
  },

  tobra: {
    name:{ar:'توبراميسين (حقن)',en:'Tobramycin (injection)'},
    label:'DailyMed, tobramycin injection (2026-04-13), Dosage and Administration, Table 1', srcIds:[80], pedsRef:'Dosage and Administration',
    inputs:[{id:'sev',type:'select',label:{ar:'شدة العدوى',en:'Severity'},options:[['serious',{ar:'خطيرة',en:'Serious'}],['life',{ar:'مهددة للحياة',en:'Life-threatening'}]]}],
    rows:[
      {k:{ar:'الجرعة مع كلى سليمة',en:'Dose with normal kidneys'},strong:true,rules:[
        {when:{sev:'life'},text:{ar:'حتى {mgkg:1.66@adj} ملغ كل 8 ساعات (5 ملغ/كغ يومياً)، ثم تُخفض إلى 3 ملغ/كغ يومياً بأسرع وقت',en:'up to {mgkg:1.66@adj} mg every 8 h (5 mg/kg a day), then back to 3 mg/kg a day as soon as possible'}},
        {when:{},text:{ar:'{mgkg:1@adj} ملغ كل 8 ساعات (3 ملغ/كغ يومياً)',en:'{mgkg:1@adj} mg every 8 h (3 mg/kg a day)'}}
      ]},
      {k:{ar:'إذا كانت الكلى ضعيفة (طريقة الملصق)',en:'If the kidneys are impaired (label method)'},rules:[
        {when:{},text:{ar:'جرعة أولى 1 ملغ/كغ، ثم الجرعة المعتادة كل {scrx:6} ساعة تقريباً (كرياتينين الدم × 6)، مع قياس المستوى',en:'a first dose of 1 mg/kg, then the usual dose about every {scrx:6} h (serum creatinine × 6), with level monitoring'}}
      ]},
      {k:{ar:'المراقبة',en:'Monitoring'},rules:[
        {when:{},text:{ar:'تجنب مستوى أكثر من 12 مكغ/مل لفترة طويلة، وقاع أكثر من 2 مكغ/مل.',en:'Avoid prolonged levels over 12 mcg/mL and a trough over 2 mcg/mL.'}}
      ]},
      {k:{ar:'تنبيه',en:'Warning'},warn:true,rules:[
        {when:{},text:{ar:'سمية للأذن والكلى: تجنب الأدوية السامة للكلى أو الأعصاب ومدرات البول القوية.',en:'Ear and kidney toxicity: avoid other nephrotoxic or neurotoxic drugs and potent diuretics.'}}
      ]}
    ],
    notes:{ar:'الوزن: الفعلي، وعند السمنة الوزن المعدّل (المثالي + 40% من الزيادة) كما يطلب الملصق. طريقة الكرياتينين × 6 لا تُستعمل مع الغسيل.',en:'Weight: actual, or the adjusted weight when obese (ideal plus 40% of the excess), as the label asks. The creatinine × 6 method is not for patients on dialysis.'}
  },

  strepto: {
    name:{ar:'ستربتومايسين',en:'Streptomycin'},
    label:'DailyMed, streptomycin for injection (2026-01-21), Dosage and Administration', srcIds:[81], pedsRef:'Dosage and Administration',
    inputs:[{id:'ind',type:'select',label:{ar:'الاستعمال',en:'Use'},options:[['tbd',{ar:'السل، يومياً',en:'Tuberculosis, daily'}],['tbw',{ar:'السل، مرتين أو 3 مرات أسبوعياً',en:'Tuberculosis, two or three times a week'}],['tul',{ar:'التولاريميا',en:'Tularaemia'}],['plague',{ar:'الطاعون',en:'Plague'}],['endo',{ar:'التهاب الشغاف بالعقديات (مع البنسلين)',en:'Streptococcal endocarditis (with penicillin)'}],['other',{ar:'عدوى أخرى',en:'Other infections'}]]}],
    rows:[
      {k:{ar:'الجرعة (عضلياً)',en:'Dose (IM)'},strong:true,rules:[
        {when:{ind:'tbd'},text:{ar:'{mgkg:15|max:1000} ملغ مرة يومياً (15 ملغ/كغ، حد أقصى 1 غرام)',en:'{mgkg:15|max:1000} mg once a day (15 mg/kg, maximum 1 g)'}},
        {when:{ind:'tbw'},text:{ar:'{mgkg:25-30|max:1500} ملغ في كل جرعة (25 إلى 30 ملغ/كغ، حد أقصى 1.5 غرام)',en:'{mgkg:25-30|max:1500} mg per dose (25 to 30 mg/kg, maximum 1.5 g)'}},
        {when:{ind:'tul'},text:{ar:'1 إلى 2 غرام يومياً مقسمة، 7 إلى 14 يوماً',en:'1 to 2 g a day divided, for 7 to 14 days'}},
        {when:{ind:'plague'},text:{ar:'1 غرام مرتين يومياً، 10 أيام على الأقل',en:'1 g twice a day, for at least 10 days'}},
        {when:{ind:'endo',age:{gt:60}},text:{ar:'500 ملغ مرتين يومياً لمدة أسبوعين',en:'500 mg twice a day for 2 weeks'}},
        {when:{ind:'endo'},text:{ar:'1 غرام مرتين يومياً أسبوعاً، ثم 500 ملغ مرتين يومياً أسبوعاً',en:'1 g twice a day for a week, then 500 mg twice a day for a week'}},
        {when:{},text:{ar:'1 إلى 2 غرام يومياً مقسمة كل 6 إلى 12 ساعة، لا تتجاوز 2 غرام',en:'1 to 2 g a day divided every 6 to 12 h, not over 2 g'}}
      ]},
      {k:{ar:'تنبيه',en:'Warning'},warn:true,rules:[
        {when:{crcl:{lt:60}},text:{ar:'ضعف الكلى: جرعات مخفضة (لا يعطي الملصق جدولاً)، مع قياس المستوى؛ خطر السمية العصبية أعلى بكثير.',en:'Kidney impairment: reduced doses (the label gives no table), with levels; the risk of nerve toxicity is much higher.'}},
        {when:{age:{gt:60}},text:{ar:'فوق 60 سنة: جرعة أقل بسبب خطر السمية.',en:'Over 60: a lower dose because of the toxicity risk.'}}
      ]}
    ],
    notes:{ar:'عضلياً فقط. لا يتجاوز المجموع 120 غراماً خلال العلاج إلا عند عدم وجود بديل. سمية للأذن والكلى.',en:'IM only. Not over 120 g in total over the course unless there is no other option. Ear and kidney toxicity.'}
  },

  plazomicin: {
    name:{ar:'بلازوميسين',en:'Plazomicin'},
    label:'DailyMed, Zemdri (2024-12-20), sections 2.1 to 2.3, Tables 1 and 2', srcIds:[82], pedsRef:'8.4',
    inputs:[],
    rows:[
      {k:{ar:'الجرعة الأولى حسب الكلى',en:'Starting dose by kidney function'},strong:true,rules:[
        {when:{crcl:{lt:15}},text:{ar:'لا توصية في الملصق (تصفية أقل من 15 أو غسيل)',en:'No recommendation in the label (clearance under 15 or dialysis)'},warn:true},
        {when:{crcl:{lt:30}},text:{ar:'{mgkg:10@adj25} ملغ كل 48 ساعة (10 ملغ/كغ)',en:'{mgkg:10@adj25} mg every 48 h (10 mg/kg)'}},
        {when:{crcl:{lt:60}},text:{ar:'{mgkg:10@adj25} ملغ كل 24 ساعة (10 ملغ/كغ)',en:'{mgkg:10@adj25} mg every 24 h (10 mg/kg)'}},
        {when:{},text:{ar:'{mgkg:15@adj25} ملغ كل 24 ساعة (15 ملغ/كغ)',en:'{mgkg:15@adj25} mg every 24 h (15 mg/kg)'}}
      ]},
      {k:{ar:'المراقبة',en:'Monitoring'},rules:[
        {when:{crcl:{lt:90}},text:{ar:'قياس المستوى: القاع أقل من 3 مكغ/مل؛ التصفية يومياً.',en:'Level monitoring: trough under 3 mcg/mL; clearance every day.'}},
        {when:{},text:{ar:'التصفية يومياً أثناء العلاج.',en:'Clearance every day during treatment.'}}
      ]}
    ],
    notes:{ar:'تسريب خلال 30 دقيقة، 4 إلى 7 أيام. الوزن الفعلي، أو المعدّل إذا زاد الفعلي على المثالي بـ 25% أو أكثر.',en:'Infusion over 30 minutes, 4 to 7 days. Actual weight, or the adjusted weight when actual is 25% or more over ideal.'}
  },

  erythro: {
    name:{ar:'إريثرومايسين (إيثيل سكسينات)',en:'Erythromycin (ethylsuccinate)'},
    label:'DailyMed, erythromycin ethylsuccinate for oral suspension (2026-04-08), Dosage and Administration', srcIds:[83], pedsRef:'Dosage and Administration', noRenal:true,
    inputs:[{id:'ind',type:'select',label:{ar:'الاستعمال',en:'Use'},options:[['usual',{ar:'العدوى المعتادة',en:'Usual infections'}],['chl',{ar:'التهاب الإحليل بالكلاميديا أو اليوريابلازما',en:'Urethritis (Chlamydia or Ureaplasma)'}],['ameb',{ar:'الأميبا المعوية',en:'Intestinal amoebiasis'}],['rf',{ar:'الوقاية من الحمى الرثوية',en:'Rheumatic fever prevention'}]]}],
    rows:[
      {k:{ar:'الجرعة للبالغين',en:'Adult dose'},strong:true,rules:[
        {when:{ind:'chl'},text:{ar:'800 ملغ 3 مرات يومياً لمدة 7 أيام',en:'800 mg three times a day for 7 days'}},
        {when:{ind:'ameb'},text:{ar:'400 ملغ 4 مرات يومياً لمدة 10 إلى 14 يوماً',en:'400 mg four times a day for 10 to 14 days'}},
        {when:{ind:'rf'},text:{ar:'400 ملغ مرتين يومياً',en:'400 mg twice a day'}},
        {when:{},text:{ar:'400 ملغ كل 6 ساعات (حتى 4 غرامات يومياً حسب الشدة)',en:'400 mg every 6 h (up to 4 g a day by severity)'}}
      ]},
      {k:{ar:'تنبيه',en:'Warning'},warn:true,rules:[
        {when:{},text:{ar:'ممنوع مع التيرفينادين والأستيميزول والبيموزيد والسيزابريد واللوفاستاتين والسيمفاستاتين والإرغوتامين. يطيل QT.',en:'Contraindicated with terfenadine, astemizole, pimozide, cisapride, lovastatin, simvastatin and ergotamine. Prolongs QT.'}}
      ]}
    ],
    notes:{ar:'الجرعات بالإيثيل سكسينات (400 ملغ منه تقابل نحو 250 ملغ من الإريثرومايسين القاعدي). مع الطعام أو بدونه. لا تعديل كلوي في الملصق.',en:'Doses as ethylsuccinate (400 mg of it is about 250 mg of erythromycin base). With or without food. No kidney adjustment in the label.'}
  },

  roxithro: {
    name:{ar:'روكسيثرومايسين',en:'Roxithromycin'},
    label:'French RCP, RULID 150 mg (French public medicines database, 2026-01-05), sections 4.2 and 4.4', srcIds:[84], pedsRef:'4.2', noRenal:true,
    inputs:[{id:'hep',type:'select',label:{ar:'الكبد',en:'Liver'},options:[['ok',{ar:'سليم',en:'Normal'}],['mild',{ar:'ضعف خفيف إلى متوسط',en:'Mild to moderate impairment'}],['sev',{ar:'ضعف شديد',en:'Severe impairment'}]]}],
    rows:[
      {k:{ar:'الجرعة للبالغين',en:'Adult dose'},strong:true,rules:[
        {when:{hep:'sev'},text:{ar:'لا يُنصح به في ضعف الكبد الشديد',en:'Not recommended in severe liver impairment'},warn:true},
        {when:{hep:'mild'},text:{ar:'150 ملغ مرتين يومياً بحذر، مع مراقبة الكبد وربما خفض الجرعة',en:'150 mg twice a day with caution, with liver tests and perhaps a lower dose'}},
        {when:{},text:{ar:'150 ملغ مرتين يومياً (300 ملغ يومياً)',en:'150 mg twice a day (300 mg a day)'}}
      ]}
    ],
    notes:{ar:'يفضل قبل الوجبات. التهاب اللوزتين 10 أيام. لا تعديل للكلى ولا لكبار السن. ممنوع مع الإرغوتامين والكولشيسين والسيزابريد.',en:'Preferably before meals. Tonsillitis 10 days. No change for the kidneys or the elderly. Contraindicated with ergotamine, colchicine and cisapride.'}
  },

  josamycin: {
    name:{ar:'جوزاميسين',en:'Josamycin'},
    label:'French RCP, JOSACINE 500 mg (French public medicines database, 2024-05-14), section 4.2', srcIds:[85], pedsRef:'4.2', noRenal:true,
    inputs:[{id:'ind',type:'select',label:{ar:'العدوى',en:'Infection'},options:[['usual',{ar:'العدوى المعتادة',en:'Usual infections'}],['ton',{ar:'التهاب اللوزتين',en:'Tonsillitis'}]]}],
    rows:[
      {k:{ar:'الجرعة (البالغون والأطفال فوق 40 كغ)',en:'Dose (adults and children over 40 kg)'},strong:true,rules:[
        {when:{wt:{lt:40}},text:{ar:'هذا الشكل (500 ملغ) لمن هم فوق 6 سنوات و40 كغ فقط',en:'This form (500 mg) is only for over 6 years and 40 kg'},warn:true},
        {when:{ind:'ton'},text:{ar:'1 غرام مرتين يومياً لمدة 5 أيام',en:'1 g twice a day for 5 days'}},
        {when:{},text:{ar:'1 إلى 2 غرام يومياً على جرعتين، حسب الوزن والشدة',en:'1 to 2 g a day in two doses, by weight and severity'}}
      ]}
    ],
    notes:{ar:'فموياً صباحاً ومساءً. ضعف الكبد: لا يُنصح به. ممنوع مع الإرغوتامين والبيموزيد والإيفابرادين والكولشيسين.',en:'By mouth, morning and evening. Liver impairment: not recommended. Contraindicated with ergotamine, pimozide, ivabradine and colchicine.'}
  },

  telithro: {
    name:{ar:'تيليثرومايسين',en:'Telithromycin'},
    label:'DailyMed, Ketek (2012-05-02, last US label), Dosage and Administration', srcIds:[86], pedsRef:'Pediatric Use',
    inputs:[
      {id:'hep',type:'check',label:{ar:'ضعف كبدي أيضاً',en:'Liver impairment as well'}},
      {id:'hd',type:'check',label:{ar:'غسيل كلوي دموي',en:'On haemodialysis'}}
    ],
    rows:[
      {k:{ar:'الجرعة',en:'Dose'},strong:true,rules:[
        {when:{hd:true,hep:true},text:{ar:'400 ملغ مرة يومياً، بعد الغسيل في أيامه',en:'400 mg once a day, after dialysis on dialysis days'}},
        {when:{hd:true},text:{ar:'600 ملغ مرة يومياً، بعد الغسيل في أيامه',en:'600 mg once a day, after dialysis on dialysis days'}},
        {when:{crcl:{lt:30},hep:true},text:{ar:'400 ملغ مرة يومياً',en:'400 mg once a day'}},
        {when:{crcl:{lt:30}},text:{ar:'600 ملغ مرة يومياً',en:'600 mg once a day'}},
        {when:{},text:{ar:'800 ملغ مرة يومياً، 7 إلى 10 أيام',en:'800 mg once a day, for 7 to 10 days'}}
      ]},
      {k:{ar:'تنبيه',en:'Warning'},warn:true,rules:[
        {when:{},text:{ar:'ممنوع في الوهن العضلي الوبيل ومع السيزابريد والبيموزيد. خطر أذى كبدي شديد. لم يعد يُسوَّق في الولايات المتحدة.',en:'Contraindicated in myasthenia gravis and with cisapride and pimozide. Risk of severe liver injury. No longer marketed in the United States.'}}
      ]}
    ],
    notes:{ar:'مع الطعام أو بدونه. لا تعديل في ضعف الكبد وحده.',en:'With or without food. No change for liver impairment alone.'}
  }
};
