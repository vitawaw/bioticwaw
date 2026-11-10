/* BIOTICWAW · js/render.js
   Small shared pieces: the medical review stamp, a pharmacist's stamp, and a copy fallback for old browsers.
   Files are plain scripts loaded in order by index.html (shared global scope, no build step). */
const CHECK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/></svg>';
/** the medical review stamp chosen by the owner: «تمت المراجعة الطبية بواسطة الصيدلي سيف الدين · 2026-10-29» */
/** the review stamp's name; the old wording «الصيدلي سيف الدين» now reads «د. سيف الدين» */
const REV0=v=>{const n=(v&&v.n)||{ar:'',en:''};return n.ar==='الصيدلي سيف الدين'||n.ar==='الصيدلاني سيف الدين'?{ar:I18N.rv_owner[0],en:I18N.rv_owner[1]}:n};
const REV=()=>{const v=CFG.review||{},n=tx2(REV0(v));return {name:n?esc(n):'',date:v.date||''}};
/** a pharmacist's own stamp on an item he added or edited, once the owner approved it: «Reviewed by: name · date» */
const stampHTML=(by,at)=>by?`<div class="stamp">${CHECK}${esc(T('st_by'))} ${esc(by)}${at?` · <bdi>${esc(at)}</bdi>`:''}</div>`:'';
function reviewHTML0(){const v=REV();return v.name?`<div class="reviewed">${CHECK}${T('rev')} ${v.name}${v.date?' · <span dir="ltr">'+esc(v.date)+'</span>':''}</div>`:''}
function fallback(text,done){const t=document.createElement('textarea');t.value=text;t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();try{document.execCommand('copy');done()}catch(e){}t.remove()}

