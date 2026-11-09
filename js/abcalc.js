/* BIOTICWAW · js/abcalc.js (1.4.2, test)
   One calculation engine for all antibiotic dose calculators. The drug rules are data in js/abrules.js (ABC_RULES).
   Creatinine clearance: Cockcroft-Gault (S10 in docs/antibiotics/SOURCES.md). Results are for professional review.
   Plain script (no build step); loaded after abrules.js and lists.js. */
const ABC_SRC = {cg:'Cockcroft DW, Gault MH. Nephron 1976;16:31–41'};
/* Cockcroft-Gault creatinine clearance (mL/min). Weight: actual, or ideal / adjusted when obese (actual over 120% of ideal). */
function abCrCl(age,sex,wKg,hCm,scr){
  if(!(age>=0&&wKg>0&&hCm>0&&scr>0))return null;
  const inches=hCm/2.54, ibw=(sex==='m'?50:45.5)+2.3*(inches-60);
  let w=wKg; if(wKg>1.2*ibw) w=ibw+0.4*(wKg-ibw); else if(wKg<ibw) w=wKg;
  const v=(140-age)*w/(72*scr)*(sex==='f'?0.85:1);
  return {crcl:v, weight:w, ibw};
}
/* does one `when` object match the answers (x) and the clearance (cr)? Empty object = always. */
function abMatch(when,x,cr){
  for(const key of Object.keys(when)){
    if(key==='crcl'){
      const b=when.crcl;
      if(b.gt!==undefined&&!(cr>b.gt))return false;
      if(b.gte!==undefined&&!(cr>=b.gte))return false;
      if(b.lt!==undefined&&!(cr<b.lt))return false;
      if(b.lte!==undefined&&!(cr<=b.lte))return false;
    } else if(x[key]!==when[key]) return false;
  }
  return true;
}
/* evaluate a drug: returns the rows to show (first matching rule per row; a row with no match is left out) */
function abEval(rule,x,cr){
  const rows=[];
  for(const row of rule.rows){
    const hit=row.rules.find(r=>abMatch(r.when,x,cr));
    if(!hit) continue;
    rows.push({k:row.k,v:hit.text,strong:!!row.strong,warn:!!(row.warn||hit.warn)});
  }
  return {rows,notes:rule.notes};
}
function abcInit(){
  const pk=document.getElementById('picker'); if(!pk)return;
  // shown only for antibiotics that are approved and published (CFG.ab); the owner also sees the unpublished ones, marked
  const pub=new Set((CFG.ab||[]).map(x=>x.id)), own=typeof OWN!=='undefined'&&OWN.on;
  const keys=Object.keys(ABC_RULES).filter(k=>pub.has(k)||own);
  if(!keys.length){pk.innerHTML=`<p class="inone">${esc(L('لا توجد حاسبات منشورة بعد.','No calculators published yet.'))}</p>`;return}
  const cur=ABC_SEL&&keys.includes(ABC_SEL)?ABC_SEL:'';
  pk.innerHTML=`<div class="f"><label class="l" for="abcsel">${esc(L('اختر المضاد الحيوي','Choose the antibiotic'))}</label><select id="abcsel">`+
    `<option value="">${esc(L('— اختر دواءً —','— Choose a drug —'))}</option>`+
    keys.map(k=>`<option value="${k}"${k===cur?' selected':''}>${esc(L(ABC_RULES[k].name.ar,ABC_RULES[k].name.en))}${pub.has(k)?'':' ('+esc(L('غير منشور','not published'))+')'}</option>`).join('')+
    `</select></div>`;
  document.getElementById('abcsel').onchange=e=>{ABC_SEL=e.target.value||null;abcOpen();};
  if(ABC_SEL) abcOpen();
}
let ABC_SEL=null;
function abcOpen(){
  const f=document.getElementById('abcfields'), c=ABC_RULES[ABC_SEL];
  const res=document.getElementById('res'); if(res)res.innerHTML='';
  if(!f)return;
  if(!c){f.hidden=true;f.innerHTML='';return}
  const common=`<div class="f"><label class="l" for="abscr">${esc(L('الكرياتينين في الدم (مل/دل)','Serum creatinine (mg/dL)'))}</label><input type="number" id="abscr" min="0.2" max="15" step="0.1" inputmode="decimal" placeholder="${esc(L('مثال: 1.1','e.g. 1.1'))}"></div>`;
  const extra=c.inputs.map(fl=>fl.type==='select'?`<div class="f"><label class="l" for="ab_${fl.id}">${esc(L(fl.label.ar,fl.label.en))}</label><select id="ab_${fl.id}">${fl.options.map(o=>`<option value="${o[0]}">${esc(L(o[1].ar,o[1].en))}</option>`).join('')}</select></div>`:`<label class="chk"><input type="checkbox" id="ab_${fl.id}"><span>${esc(L(fl.label.ar,fl.label.en))}</span></label>`).join('');
  f.innerHTML=`<div class="grid">${common}${extra}</div><button type="button" class="btn pri" id="abcgo">${esc(L('احسب الجرعة','Calculate the dose'))}</button>`;
  f.hidden=false; document.getElementById('abcgo').onclick=abcRun;
}
function abcRun(){
  const c=ABC_RULES[ABC_SEL]; const g=id=>document.getElementById(id);
  const age=+((g('age')||{}).value), sex=(g('sex')||{}).value||'f', w=+((g('wt')||{}).value), h=+((g('ht')||{}).value), scr=+((g('abscr')||{}).value);
  const out=document.getElementById('res');
  const cg=abCrCl(age,sex,w,h,scr);
  if(!cg){out.innerHTML=`<p class="inone">${esc(L('أدخل العمر والوزن والطول والكرياتينين.','Enter age, weight, height and creatinine.'))}</p>`;return}
  const x={}; c.inputs.forEach(fl=>{const e=g('ab_'+fl.id); x[fl.id]=fl.type==='check'?!!(e&&e.checked):(e?e.value:'')});
  const r=abEval(c,x,cg.crcl);
  const rowsH=r.rows.map(rw=>`<div class="abcrow${rw.strong?' strong':''}${rw.warn?' warn':''}"><b>${esc(L(rw.k.ar,rw.k.en))}:</b> ${esc(L(rw.v.ar,rw.v.en))}</div>`).join('');
  out.innerHTML=`<div class="abcres"><p class="hint">${esc(L('تصفية الكرياتينين (Cockcroft-Gault): ','Creatinine clearance (Cockcroft-Gault): '))}<b>${cg.crcl.toFixed(0)} ${esc(L('مل/دقيقة','mL/min'))}</b></p>${rowsH}<p class="hint">${esc(L(r.notes.ar,r.notes.en))}</p><p class="hint">${esc(L('المصدر: ','Source: '))}${esc(c.label)} · ${esc(ABC_SRC.cg)}</p><p class="hint"><b>${esc(L('هذه الحاسبة للمراجعة المهنية، وتؤكد النتيجة مع الصيدلي والملصق الكامل قبل أي وصفة.','For professional review; confirm the result with the pharmacist and the full label before any prescription.'))}</b></p></div>`+
    `<div class="ract abcact"><button class="btn" type="button" id="abccopy">${esc(T('ab_copy'))}</button><button class="btn" type="button" id="abcprint">${esc(T('ab_print'))}</button></div>`;
  $('abccopy').onclick=abcCopy;$('abcprint').onclick=abcPrint;
}
/* 1.5.0: copy the result (for the patient file) or print only the result card. The heading carries the drug and the date. */
function abcHead(){const c=ABC_RULES[ABC_SEL];return (c?L(c.name.ar,c.name.en):'')+' · '+new Date().toISOString().slice(0,10)+' · BIOTICWAW'}
async function abcCopy(){
  const box=document.querySelector('#res .abcres');if(!box)return;
  const text=abcHead()+'\n\n'+box.innerText.trim();
  try{await navigator.clipboard.writeText(text)}catch(e){
    // older browsers or a page without HTTPS: copy through a hidden text box
    const t=document.createElement('textarea');t.value=text;t.setAttribute('readonly','');t.style.position='fixed';t.style.opacity='0';
    document.body.appendChild(t);t.select();try{document.execCommand('copy')}catch(e2){}t.remove();
  }
  toast(T('ab_copied'));
}
function abcPrint(){
  const box=document.querySelector('#res .abcres');if(!box)return;
  const p=document.createElement('div');p.id='abprint';
  p.innerHTML=`<h2>${esc(abcHead())}</h2>`+box.outerHTML;
  document.body.appendChild(p);document.body.classList.add('printab');
  const done=()=>{document.body.classList.remove('printab');p.remove();removeEventListener('afterprint',done)};
  addEventListener('afterprint',done);window.print();setTimeout(()=>{if(document.getElementById('abprint'))done()},1500);
}
document.addEventListener('DOMContentLoaded',()=>{try{abcInit()}catch(e){}});
if(document.readyState!=='loading'){try{abcInit()}catch(e){}}
