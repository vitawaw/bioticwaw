// Cross-check: every drug in tools/abx.py has batch data and a calculator that cites its own saved label (source 27 + place, label date) and the same name.
// Run: node tests/data_check.cjs   (exit 1 on any problem)
const fs=require('fs'),vm=require('vm');const R=require('path').join(__dirname,'..')+'/';
const c=vm.createContext({});vm.runInContext(fs.readFileSync(R+'js/abrules.js','utf8')+';this.X=ABC_RULES',c);const X=c.X;
const order=[...fs.readFileSync(R+'tools/abx.py','utf8').match(/ORDER = \[([\s\S]*?)\]\nassert/)[1].matchAll(/'([a-z0-9_]+)'/g)].map(m=>m[1]);
const drugs={};for(let n=1;n<=10;n++)for(const d of JSON.parse(fs.readFileSync(R+`docs/antibiotics/batch${n}.json`)).drugs)drugs[d.id]=d;
const prob=[];
order.forEach((id,i)=>{const src=27+i,d=drugs[id],r=X[id];
 if(!d)prob.push(id+': no batch entry');if(!r)prob.push(id+': no calculator');if(!d||!r)return;
 if(!(r.srcIds||[]).includes(src))prob.push(`${id}: calculator srcIds ${r.srcIds} lacks ${src}`);
 if(d.n.en.split(' (')[0].toLowerCase()!==r.name.en.split(' (')[0].toLowerCase())prob.push(`${id}: name ${d.n.en} vs ${r.name.en}`);
 if(d.n.ar.split(' (')[0]!==r.name.ar.split(' (')[0])prob.push(`${id}: ar name ${d.n.ar} vs ${r.name.ar}`);
 const L=JSON.parse(fs.readFileSync(R+`docs/antibiotics/labels/${id}.json`));const et=L.effective_time||'';
 if(/^\d{8}$/.test(et)){const ymd=`${et.slice(0,4)}-${et.slice(4,6)}-${et.slice(6)}`;if(!r.label.includes(ymd))prob.push(`${id}: label date ${ymd} not in "${r.label}"`)}
});
Object.keys(X).filter(k=>!order.includes(k)).forEach(k=>prob.push('extra calculator '+k));
console.log("data check: "+prob.length+" problems");prob.forEach(p=>console.log("  "+p));process.exit(prob.length?1:0);
