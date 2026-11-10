/* BIOTICWAW · js/abcalc.js (1.6.0, test)
   One calculation engine for all antibiotic dose calculators. The drug rules are data in js/abrules.js (ABC_RULES).
   Creatinine clearance: Cockcroft-Gault (S10 in docs/antibiotics/SOURCES.md). Results are for professional review.
   Rule format (see js/abrules.js): rows of ordered rules {when, text}; the first rule whose `when` matches gives the text.
   `when` keys: an input id (equal, or one of an array of values), or a range on crcl (mL/min), age (years) or wt (kg): {gt, gte, lt, lte}.
   Text tokens: {mgkg:A} or {mgkg:A-B} = A (to B) mg per kg, optionally @act (actual, default) / @ibw / @adj weight and
   |max:M (mg, the label's maximum per dose); @lean = ideal weight when obese, else actual. {scrx:N} = serum creatinine × N. Plain script (no build step); loaded after abrules.js and lists.js. */
const ABC_SRC = {cg:'Cockcroft DW, Gault MH. Nephron 1976;16:31–41'};
/* ideal body weight (Devine) and the weight used for Cockcroft-Gault: actual, or adjusted when actual is over 120% of ideal */
function abWeights(sex,wKg,hCm){
  if(!(wKg>0&&hCm>0))return null;
  const ibw=(sex==='m'?50:45.5)+2.3*(hCm/2.54-60);
  const adj=wKg>1.2*ibw?ibw+0.4*(wKg-ibw):wKg;
  return {act:wKg,ibw,adj,obese:wKg>1.2*ibw};
}
/* MDRD eGFR (mL/min/1.73 m²) = 175 × creatinine^-1.154 × age^-0.203 × 0.742 if female (the race factor is not used) */
function abEgfr(age,sex,scr){return age>0&&scr>0?175*Math.pow(scr,-1.154)*Math.pow(age,-0.203)*(sex==='f'?0.742:1):null}
/* Cockcroft-Gault creatinine clearance (mL/min) */
function abCrCl(age,sex,wKg,hCm,scr){
  if(!(age>=0&&wKg>0&&hCm>0&&scr>0))return null;
  const W=abWeights(sex,wKg,hCm);
  const v=(140-age)*W.adj/(72*scr)*(sex==='f'?0.85:1);
  return {crcl:v, weight:W.adj, ibw:W.ibw, obese:W.obese};
}
const abIn=(v,b)=>v!=null&&!Number.isNaN(v)&&(b.gt===undefined||v>b.gt)&&(b.gte===undefined||v>=b.gte)&&(b.lt===undefined||v<b.lt)&&(b.lte===undefined||v<=b.lte);
/* does one `when` object match? x = the drug's own answers; ctx = {cr, age, wt}. Empty object = always. */
function abMatch(when,x,ctx){
  if(typeof ctx!=='object'||ctx===null)ctx={cr:ctx}; // older calls passed the clearance alone
  for(const key of Object.keys(when)){
    if(key==='crcl'){if(!abIn(ctx.cr,when.crcl))return false}
    else if(key==='age'){if(!abIn(ctx.age,when.age))return false}
    else if(key==='wt'){if(!abIn(ctx.wt,when.wt))return false}
    else if(key==='egfr'){if(!abIn(ctx.egfr,when.egfr))return false} // MDRD eGFR (mL/min/1.73 m²), for labels that use it
    else if(Array.isArray(when[key])){if(!when[key].includes(x[key]))return false} // one of several values
    else if(x[key]!==when[key]) return false;
  }
  return true;
}
/* mg per kg tokens → numbers (rounded like a prescription: 10 mg steps from 100 mg, 5 mg steps from 20 mg) */
const abRound=v=>v>=500?Math.round(v/10)*10:v>=20?Math.round(v/5)*5:Math.round(v*10)/10;
function abFill(t,ctx){
  // {scrx:N} = serum creatinine (mg/dL) × N, e.g. the gentamicin dosing interval in hours (creatinine × 8)
  t=String(t).replace(/\{scrx:([\d.]+)\}/g,(m,n)=>ctx&&ctx.scr>0?String(Math.round(ctx.scr*+n)):'—');
  return t.replace(/\{mgkg:([\d.]+)(?:-([\d.]+))?(?:@(act|ibw|adj|adj25|lean))?(?:\|max:([\d.]+))?\}/g,(m,a,b,basis,max)=>{
    const W=ctx&&ctx.W;if(!W)return '—';
    // lean = an estimate of lean body mass: the ideal weight when the patient is obese, otherwise the actual weight
    // adj25 = adjusted weight when actual is 25% or more over ideal (plazomicin label)
    const w=basis==='ibw'?W.ibw:basis==='adj'?W.adj:basis==='adj25'?(W.act>=1.25*W.ibw?W.ibw+0.4*(W.act-W.ibw):W.act):basis==='lean'?(W.obese?W.ibw:W.act):W.act, cap=v=>max?Math.min(v,+max):v;
    const lo=abRound(cap(+a*w));return b?lo+'–'+abRound(cap(+b*w)):String(lo);
  });
}
/* evaluate a drug: the rows to show (first matching rule per row; a row with no match is left out) */
function abEval(rule,x,cr,ctx){
  ctx=Object.assign({},ctx||{},{cr:typeof cr==='number'?cr:(ctx&&ctx.cr)});
  const rows=[];
  for(const row of rule.rows){
    const hit=row.rules.find(r=>abMatch(r.when,x,ctx));
    if(!hit) continue;
    rows.push({k:row.k,v:{ar:abFill(hit.text.ar,ctx),en:abFill(hit.text.en,ctx)},strong:!!row.strong,warn:!!(row.warn||hit.warn)});
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
  const common=c.noRenal?'':`<div class="f"><label class="l" for="abscr">${esc(L('الكرياتينين في الدم (مل/دل)','Serum creatinine (mg/dL)'))}</label><input type="number" id="abscr" min="0.2" max="15" step="0.1" inputmode="decimal" placeholder="${esc(L('مثال: 1.1','e.g. 1.1'))}"></div>`;
  const extra=c.inputs.map(fl=>fl.type==='select'?`<div class="f"><label class="l" for="ab_${fl.id}">${esc(L(fl.label.ar,fl.label.en))}</label><select id="ab_${fl.id}">${fl.options.map(o=>`<option value="${o[0]}">${esc(L(o[1].ar,o[1].en))}</option>`).join('')}</select></div>`:`<label class="chk"><input type="checkbox" id="ab_${fl.id}"><span>${esc(L(fl.label.ar,fl.label.en))}</span></label>`).join('');
  f.innerHTML=`<div class="grid">${common}${extra}</div><button type="button" class="btn pri" id="abcgo">${esc(L('احسب الجرعة','Calculate the dose'))}</button>`;
  f.hidden=false; document.getElementById('abcgo').onclick=abcRun;
}
function abcRun(){
  const c=ABC_RULES[ABC_SEL]; const g=id=>document.getElementById(id);
  const num=id=>{const e=g(id);return e&&e.value!==''?+e.value:NaN};
  const age=num('age'), sex=(g('sex')||{}).value||'f', w=num('wt'), h=num('ht'), scr=num('abscr');
  const out=document.getElementById('res');
  const W=abWeights(sex,w,h);
  const cg=c.noRenal?null:abCrCl(age,sex,w,h,scr);
  if(!(age>=0)||!W||(!c.noRenal&&!cg)){out.innerHTML=`<p class="inone">${esc(c.noRenal?L('أدخل العمر والوزن والطول.','Enter age, weight and height.'):L('أدخل العمر والوزن والطول والكرياتينين.','Enter age, weight, height and creatinine.'))}</p>`;return}
  const x={}; c.inputs.forEach(fl=>{const e=g('ab_'+fl.id); x[fl.id]=fl.type==='check'?!!(e&&e.checked):(e?e.value:'')});
  const egfr=c.egfr?abEgfr(age,sex==='m'?'m':'f',scr):null;
  const r=abEval(c,x,cg?cg.crcl:null,{age,wt:w,W,scr:scr>0?scr:null,egfr});
  // children: the calculators are for adults unless the drug carries its own rules for children
  if(age<18&&!c.peds)r.rows.unshift({k:{ar:'تنبيه',en:'Warning'},v:{ar:'هذه الحاسبة للبالغين (18 سنة فأكثر). جرعة الأطفال من الملصق'+(c.pedsRef?' ('+c.pedsRef+')':'')+' ويحددها الطبيب والصيدلي.',en:'This calculator is for adults (18 and over). The dose for children comes from the label'+(c.pedsRef?' ('+c.pedsRef+')':'')+' and is set by the doctor and pharmacist.'},warn:true});
  const rowsH=r.rows.map(rw=>`<div class="abcrow${rw.strong?' strong':''}${rw.warn?' warn':''}"><b>${esc(L(rw.k.ar,rw.k.en))}:</b> ${esc(L(rw.v.ar,rw.v.en))}</div>`).join('');
  const crH=cg?`<p class="hint">${esc(L('تصفية الكرياتينين (Cockcroft-Gault): ','Creatinine clearance (Cockcroft-Gault): '))}<b>${cg.crcl.toFixed(0)} ${esc(L('مل/دقيقة','mL/min'))}</b> · ${esc(cg.obese?L('بالوزن المعدّل ','with the adjusted weight '):L('بالوزن الفعلي ','with the actual weight '))}${cg.weight.toFixed(0)} ${esc(L('كغ','kg'))}</p>`:'';
  const egH=egfr?`<p class="hint">${esc(L('معدل الترشيح المقدّر (MDRD، كما يطلب الملصق): ','Estimated GFR (MDRD, as the label asks): '))}<b>${egfr.toFixed(0)} ${esc(L('مل/دقيقة/1.73 م²','mL/min/1.73 m²'))}</b></p>`:'';
  out.innerHTML=`<div class="abcres">${crH}${egH}${rowsH}<p class="hint">${esc(L(r.notes.ar,r.notes.en))}</p><p class="hint">${esc(L('المصدر: ','Source: '))}${esc(c.label)}${cg?' · '+esc(ABC_SRC.cg):''}</p><p class="hint"><b>${esc(L('هذه الحاسبة للمراجعة المهنية، وتؤكد النتيجة مع الصيدلي والملصق الكامل قبل أي وصفة.','For professional review; confirm the result with the pharmacist and the full label before any prescription.'))}</b></p></div>`+
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
