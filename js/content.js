/* BIOTICWAW · js/content.js
   Turns CFG (published or owner draft) into the sources list REFS (buildData), and the owner's shared edit buttons.
   Files are plain scripts loaded in order by index.html (shared global scope, no build step). */
/* ===================== editable content (sources) ===================== */
let REFS={};
const SHOWALL=()=>typeof OWN!=='undefined'&&OWN.on&&!OWN.preview;
const bulkBar=(t,n)=>n&&CANAPPROVE()?`<div class="oedit bulk"><span class="pend">${n} ${T('o_pendn')}</span><button class="btn" type="button" data-gonotif="1">${T('nt_open')}</button></div>`:'';
const CANAPPROVE=()=>typeof OWN!=='undefined'&&(OWN.role==='owner'||OWN.local);
/** 1.16.0: every editable item carries the same two buttons — ⋮⋮ to drag it and ✎ to open its floating window, which holds
   everything about it (Arabic and English name, description, hide/show, delete). A waiting item shows «awaiting review»
   (for the owner it opens 🔔 notifications, where changes are approved or rejected).
   kind: r = source, m = roadmap feature. The database checks every change. */
/** 1.16.0: ⋮⋮ and ✎ show only after «تعديل وترتيب» is pressed (body.textedit); the normal view stays as visitors see it */
const EDITING=()=>typeof OWN!=='undefined'&&OWN.on&&!OWN.preview&&document.body.classList.contains('textedit');
const EPEN=(attrs,lbl)=>`<button class="btn epen" type="button" ${attrs} aria-label="${esc(lbl||T('o_editall'))}" title="${esc(lbl||T('o_editall'))}">${PEN}</button>`;
function actBtns(kind,id,{rv=true,hidden=false,edit=true,drag=false}={}){
  const ed=EDITING();
  return (drag&&ed?DRAG(T('o_drag')):'')+(rv?'':CANAPPROVE()?`<button class="pend" type="button" data-gonotif="1">${T('o_pending')} ›</button>`:`<span class="pend">${T('o_pending')}</span>`)+(hidden?`<span class="hidb">${T('o_hiddenb')}</span>`:'')+
    (edit&&ed?EPEN(`data-act="edit" data-kind="${kind}" data-id="${esc(String(id))}"`):'');
}
/** the buttons at the bottom of an item's floating window: hide/show · delete · (reset) · cancel · save */
const EDB=({hidden=false,hide=true,del=true,reset=false,isNew=false}={})=>[...(!isNew&&hide?[{label:T(hidden?'o_nshow':'o_nhide'),action:'hide'}]:[]),...(!isNew&&del?[{label:T('o_del'),action:'del',danger:1}]:[]),
  ...(reset?[{label:T('o_reset'),action:'reset'}]:[]),{label:T('o_cancel'),action:'cancel'},{label:T('ed_save'),action:'ok',pri:1}];
const actBar=(kind,id,o)=>`<div class="oedit acts">${actBtns(kind,id,o)}</div>`;
const NHIDE=()=>(CFG.nut&&CFG.nut.hide)||[];
const NCUST=()=>(CFG.nut&&CFG.nut.custom)||[];
function buildData(){
  const all=SHOWALL();
  // preview / visitors: an item a pharmacist changed shows its approved version, and a proposed deletion is still shown
  const ver=x=>!all&&x.rv===false&&x.pv?x.pv:x,DL=k=>all?[]:DELS()[k]||[];
  REFS=Array.isArray(CFG.refs)?Object.fromEntries([...CFG.refs.map(ver),...DL('refs')].filter(o=>all||(o.rv!==false&&!o.hidden)).map(o=>[o.id,[o.org||'',o.title||'',o.url||'',o.ar||'',o.en||o.ar||'',o.rv!==false,!!o.hidden,o.kind||'',o.at||'',o.sb||'',o.sa||'']])):{};
}
