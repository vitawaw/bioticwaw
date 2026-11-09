/* BIOTICWAW · js/abcalc.js (1.4.0, test)
   Dose calculators for three antibiotics, each built from its official label (FDA / DailyMed):
   amoxicillin (label 2.2 and 2.5), cefalexin (label 2.1 and 2.3), ciprofloxacin (label dose and kidney tables).
   Creatinine clearance: Cockcroft-Gault (S10 in docs/antibiotics/SOURCES.md). Results are for professional review.
   Plain script (no build step); loaded after lists.js. */
const ABC_SRC = {cg:'Cockcroft DW, Gault MH. Nephron 1976;16:31–41'};
/* Cockcroft-Gault creatinine clearance (mL/min). Weight: actual, or ideal / adjusted when obese (actual over 120% of ideal). */
function abCrCl(age,sex,wKg,hCm,scr){
  if(!(age>=0&&wKg>0&&hCm>0&&scr>0))return null;
  const inches=hCm/2.54, ibw=(sex==='m'?50:45.5)+2.3*(inches-60);
  let w=wKg; if(wKg>1.2*ibw) w=ibw+0.4*(wKg-ibw); else if(wKg<ibw) w=wKg;
  const v=(140-age)*w/(72*scr)*(sex==='f'?0.85:1);
  return {crcl:v, weight:w, ibw};
}
const ABC_CALC = {
  amox: {
    name:{ar:'أموكسيسيلين',en:'Amoxicillin'}, label:'DailyMed (setid bb7733f8…), 2.2 and 2.5', srcIds:[3],
    fields:[{id:'sev',type:'select',label:{ar:'شدة العدوى',en:'Infection severity'},options:[['mild',{ar:'خفيفة إلى متوسطة',en:'Mild to moderate'}],['severe',{ar:'شديدة',en:'Severe'}]]},
            {id:'hd',type:'check',label:{ar:'غسيل كلوي (دياليزا)',en:'On haemodialysis'}}],
    calc(x,cr){
      const sev=x.sev==='severe', rows=[];
      const usual=sev?'875 mg every 12 h or 500 mg every 8 h':'500 mg every 12 h or 250 mg every 8 h';
      rows.push({k:{ar:'الجرعة المعتادة (ملصق 2.2)',en:'Usual dose (label 2.2)'},v:{ar:usual,en:usual}});
      let adj;
      if(x.hd) adj={ar:(sev?'500':'250')+' ملغ كل 24 ساعة، مع جرعة إضافية أثناء الغسيل وفي نهايته',en:(sev?'500':'250')+' mg every 24 h, plus an extra dose during and at the end of dialysis'};
      else if(cr<10) adj={ar:(sev?'500':'250')+' ملغ كل 24 ساعة',en:(sev?'500':'250')+' mg every 24 h'};
      else if(cr<30) adj={ar:(sev?'500':'250')+' ملغ كل 12 ساعة',en:(sev?'500':'250')+' mg every 12 h'};
      else adj={ar:'لا تعديل (الجرعة المعتادة)',en:'No change (usual dose)'};
      rows.push({k:{ar:'الجرعة المعدّلة حسب الكلى',en:'Kidney-adjusted dose'},v:adj,strong:true});
      if(cr<30&&!x.hd) rows.push({k:{ar:'تنبيه',en:'Warning'},v:{ar:'لا تُستعمل جرعة 875 ملغ عند تصفية أقل من 30 مل/دقيقة.',en:'Do not use the 875 mg dose when clearance is under 30 mL/min.'},warn:true});
      rows.push({k:{ar:'المدة',en:'Duration'},v:{ar:'48 إلى 72 ساعة بعد زوال الأعراض، وعشرة أيام على الأقل لعدوى المكورات العقدية الحالّة',en:'48 to 72 h after symptoms stop; at least 10 days for Streptococcus pyogenes'}});
      return {rows,notes:{ar:'تحويل الشدة إلى جرعة محددة (250 أو 500 ملغ في الفئة الأولى) يُحدده الصيدلي من الملصق؛ هذه الحاسبة تعرض ما يذكره الملصق.',en:'The pharmacist sets the exact strength from the label; this calculator shows what the label states.'}};
    }},
  cefalex: {
    name:{ar:'سيفالكسين',en:'Cephalexin'}, label:'DailyMed capsule label (setid 11cfefee…), 2.1 and 2.3', srcIds:[7],
    fields:[],
    calc(x,cr){
      const rows=[{k:{ar:'الجرعة المعتادة (ملصق 2.1)',en:'Usual dose (label 2.1)'},v:{ar:'250 ملغ كل 6 ساعات أو 500 ملغ كل 12 ساعة، لمدة 7 إلى 14 يوماً',en:'250 mg every 6 h or 500 mg every 12 h, for 7 to 14 days'}}];
      let adj;
      if(cr>=60) adj={ar:'لا تعديل',en:'No change'};
      else if(cr>=30) adj={ar:'لا تعديل، مع حد أقصى 1 غرام يومياً',en:'No change; maximum 1 g a day'};
      else if(cr>=15) adj={ar:'250 ملغ كل 8 إلى 12 ساعة',en:'250 mg every 8 to 12 h'};
      else if(cr>=5) adj={ar:'250 ملغ كل 24 ساعة',en:'250 mg every 24 h'};
      else if(cr>=1) adj={ar:'250 ملغ كل 48 إلى 60 ساعة',en:'250 mg every 48 to 60 h'};
      else adj={ar:'غير محدد',en:'Not defined'};
      rows.push({k:{ar:'الجرعة المعدّلة حسب الكلى (ملصق 2.3)',en:'Kidney-adjusted dose (label 2.3)'},v:adj,strong:true});
      rows.push({k:{ar:'الغسيل الكلوي',en:'Haemodialysis'},v:{ar:'الملصق لا يحدد جرعة للغسيل الكلوي؛ يُستشار الصيدلي.',en:'The label gives no dose for haemodialysis; consult the pharmacist.'}});
      return {rows,notes:{ar:'تقييم الكلى بمعادلة Cockcroft-Gault.',en:'Kidney function by Cockcroft-Gault.'}};
    }},
  cipro: {
    name:{ar:'سيبروفلوكساسين',en:'Ciprofloxacin'}, label:'DailyMed tablet label (setid 178dc379…), indication and kidney tables', srcIds:[20,4],
    fields:[{id:'ind',type:'select',label:{ar:'نوع العدوى',en:'Type of infection'},options:[
      ['skin',{ar:'الجلد: 500–750 ملغ كل 12 ساعة، 7 إلى 14 يوماً',en:'Skin: 500–750 mg q12h, 7–14 days'}],
      ['bone',{ar:'العظام: 500–750 ملغ كل 12 ساعة، 4 إلى 8 أسابيع',en:'Bone: 500–750 mg q12h, 4–8 weeks'}],
      ['urinary',{ar:'المسالك البولية: 250–500 ملغ كل 12 ساعة، 7 إلى 14 يوماً',en:'Urinary: 250–500 mg q12h, 7–14 days'}],
      ['lower',{ar:'الجهاز التنفسي السفلي: 500–750 ملغ كل 12 ساعة، 7 إلى 14 يوماً',en:'Lower respiratory: 500–750 mg q12h, 7–14 days'}],
      ['cystitis',{ar:'التهاب المثانة غير المعقد: 250 ملغ كل 12 ساعة، 3 أيام',en:'Uncomplicated cystitis: 250 mg q12h, 3 days'}],
      ['sinus',{ar:'التهاب الجيوب: 500 ملغ كل 12 ساعة، 10 أيام',en:'Sinusitis: 500 mg q12h, 10 days'}],
      ['intra',{ar:'البطن (مع الميترونيدازول): 500 ملغ كل 12 ساعة، 7 إلى 14 يوماً',en:'Intra-abdominal (with metronidazole): 500 mg q12h, 7–14 days'}],
      ['diarr',{ar:'الإسهال المعدي: 500 ملغ كل 12 ساعة، 5 إلى 7 أيام',en:'Infectious diarrhoea: 500 mg q12h, 5–7 days'}],
      ['typhoid',{ar:'التيفوئيد: 500 ملغ كل 12 ساعة، 10 أيام',en:'Typhoid: 500 mg q12h, 10 days'}],
      ['prost',{ar:'التهاب البروستاتا المزمن: 500 ملغ كل 12 ساعة، 28 يوماً',en:'Chronic prostatitis: 500 mg q12h, 28 days'}]]}],
    calc(x,cr){
      const map={skin:{ar:'500 إلى 750 ملغ كل 12 ساعة لمدة 7 إلى 14 يوماً',en:'500 to 750 mg every 12 h for 7 to 14 days'},bone:{ar:'500 إلى 750 ملغ كل 12 ساعة لمدة 4 إلى 8 أسابيع',en:'500 to 750 mg every 12 h for 4 to 8 weeks'},urinary:{ar:'250 إلى 500 ملغ كل 12 ساعة لمدة 7 إلى 14 يوماً',en:'250 to 500 mg every 12 h for 7 to 14 days'},lower:{ar:'500 إلى 750 ملغ كل 12 ساعة لمدة 7 إلى 14 يوماً',en:'500 to 750 mg every 12 h for 7 to 14 days'},cystitis:{ar:'250 ملغ كل 12 ساعة لمدة 3 أيام',en:'250 mg every 12 h for 3 days'},sinus:{ar:'500 ملغ كل 12 ساعة لمدة 10 أيام',en:'500 mg every 12 h for 10 days'},intra:{ar:'500 ملغ كل 12 ساعة لمدة 7 إلى 14 يوماً، مع الميترونيدازول',en:'500 mg every 12 h for 7 to 14 days, with metronidazole'},diarr:{ar:'500 ملغ كل 12 ساعة لمدة 5 إلى 7 أيام',en:'500 mg every 12 h for 5 to 7 days'},typhoid:{ar:'500 ملغ كل 12 ساعة لمدة 10 أيام',en:'500 mg every 12 h for 10 days'},prost:{ar:'500 ملغ كل 12 ساعة لمدة 28 يوماً',en:'500 mg every 12 h for 28 days'}};
      const usual=map[x.ind]||map.urinary;
      const rows=[{k:{ar:'الجرعة المعتادة للعدوى (ملصق)',en:'Usual dose for this infection (label)'},v:usual}];
      let adj;
      if(cr>50) adj={ar:'الجرعة المعتادة',en:'Usual dose'};
      else if(cr>=30) adj={ar:'250 إلى 500 ملغ كل 12 ساعة',en:'250 to 500 mg every 12 h'};
      else if(cr>=5) adj={ar:'250 إلى 500 ملغ كل 18 ساعة',en:'250 to 500 mg every 18 h'};
      else adj={ar:'غير محدد',en:'Not defined'};
      rows.push({k:{ar:'الجرعة المعدّلة حسب الكلى (جدول الملصق)',en:'Kidney-adjusted dose (label table)'},v:adj,strong:true});
      rows.push({k:{ar:'الغسيل الكلوي',en:'Dialysis'},v:{ar:'250 إلى 500 ملغ كل 24 ساعة، بعد الغسيل',en:'250 to 500 mg every 24 h, after dialysis'}});
      rows.push({k:{ar:'توقيت الأخذ',en:'Timing'},v:{ar:'قبل مضادات الحموضة والكالسيوم والحديد والزنك ومنتجات الألبان بساعتين، أو بعدها بست ساعات.',en:'2 hours before or 6 hours after antacids, calcium, iron, zinc and dairy.'}});
      return {rows,notes:{ar:'جدول الكلى لهذا الملصق يذكر ارتفاع التصفية فوق 50 مل/دقيقة؛ تحت 5 يُطلب الصيدلي.',en:'The label kidney table starts above 50 mL/min; below 5 ask the pharmacist.'}};
    }},
};
let ABC_SEL=null;
function abcInit(){
  const pk=document.getElementById('picker'); if(!pk)return;
  // shown only for antibiotics that are approved and published (CFG.ab); the owner also sees the unpublished ones, marked
  const pub=new Set((CFG.ab||[]).map(x=>x.id)), own=typeof OWN!=='undefined'&&OWN.on;
  const keys=Object.keys(ABC_CALC).filter(k=>pub.has(k)||own);
  pk.innerHTML=keys.map(k=>`<button type="button" class="abcpick" data-abc="${k}">${esc(L(ABC_CALC[k].name.ar,ABC_CALC[k].name.en))}${pub.has(k)?'':' ·'+esc(L('غير منشور','not published'))}</button>`).join('')||`<p class="inone">${esc(L('لا توجد حاسبات منشورة بعد.','No calculators published yet.'))}</p>`;
  pk.onclick=e=>{const b=e.target.closest('[data-abc]');if(!b)return;ABC_SEL=b.dataset.abc;abcOpen();};
}
function abcOpen(){
  const f=document.getElementById('abcfields'), c=ABC_CALC[ABC_SEL]; if(!f||!c)return;
  const common=`<div class="f"><label class="l" for="abscr">${esc(L('الكرياتينين في الدم (مل/دل)','Serum creatinine (mg/dL)'))}</label><input type="number" id="abscr" min="0.2" max="15" step="0.1" inputmode="decimal" placeholder="${esc(L('مثال: 1.1','e.g. 1.1'))}"></div>`;
  const extra=c.fields.map(fl=>fl.type==='select'?`<div class="f"><label class="l" for="ab_${fl.id}">${esc(L(fl.label.ar,fl.label.en))}</label><select id="ab_${fl.id}">${fl.options.map(o=>`<option value="${o[0]}">${esc(L(o[1].ar,o[1].en))}</option>`).join('')}</select></div>`:`<label class="chk"><input type="checkbox" id="ab_${fl.id}"><span>${esc(L(fl.label.ar,fl.label.en))}</span></label>`).join('');
  f.innerHTML=`<h3 class="abch">${esc(L(c.name.ar,c.name.en))}</h3><div class="grid">${common}${extra}</div><button type="button" class="btn pri" id="abcgo">${esc(L('احسب الجرعة','Calculate the dose'))}</button>`;
  f.hidden=false; document.getElementById('abcgo').onclick=abcRun;
  const res=document.getElementById('res'); if(res)res.innerHTML='';
}
function abcRun(){
  const c=ABC_CALC[ABC_SEL]; const g=id=>document.getElementById(id);
  const age=+((g('age')||{}).value), sex=(g('sex')||{}).value||'f', w=+((g('wt')||{}).value), h=+((g('ht')||{}).value), scr=+((g('abscr')||{}).value);
  const out=document.getElementById('res');
  const cg=abCrCl(age,sex,w,h,scr);
  if(!cg){out.innerHTML=`<p class="inone">${esc(L('أدخل العمر والوزن والطول والكرياتينين.','Enter age, weight, height and creatinine.'))}</p>`;return}
  const x={}; c.fields.forEach(fl=>{const e=g('ab_'+fl.id); x[fl.id]=fl.type==='check'?!!(e&&e.checked):(e?e.value:'')});
  const r=c.calc(x,cg.crcl);
  const rowsH=r.rows.map(rw=>`<div class="abcrow${rw.strong?' strong':''}${rw.warn?' warn':''}"><b>${esc(L(rw.k.ar,rw.k.en))}:</b> ${esc(L(rw.v.ar,rw.v.en))}</div>`).join('');
  out.innerHTML=`<div class="abcres"><p class="hint">${esc(L('تصفية الكرياتينين (Cockcroft-Gault): ','Creatinine clearance (Cockcroft-Gault): '))}<b>${cg.crcl.toFixed(0)} ${esc(L('مل/دقيقة','mL/min'))}</b></p>${rowsH}<p class="hint">${esc(L(r.notes.ar,r.notes.en))}</p><p class="hint">${esc(L('المصدر: ','Source: '))}${esc(c.label)} · ${esc(ABC_SRC.cg)}</p><p class="hint"><b>${esc(L('هذه الحاسبة للمراجعة المهنية، وتؤكد النتيجة مع الصيدلي والملصق الكامل قبل أي وصفة.','For professional review; confirm the result with the pharmacist and the full label before any prescription.'))}</b></p></div>`;
}
document.addEventListener('DOMContentLoaded',()=>{try{abcInit()}catch(e){}});
if(document.readyState!=='loading'){try{abcInit()}catch(e){}}
