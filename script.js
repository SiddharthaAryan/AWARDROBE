const modes = [
  {id:'lecture', icon:'🎓', title:'To a Lecture', desc:'Smart casual. No toe-showing shoes. Jeans + sneakers get preference.'},
  {id:'auditorium', icon:'🏛️', title:'To the Auditorium', desc:'Suit mandatory. British cut preferred. White shirt first. Tie + black formal shoes.'},
  {id:'presentation', icon:'🎤', title:'To a Presentation', desc:'Asks whether suit is needed. Otherwise smart formal with jeans preferred.'},
  {id:'roam', icon:'🚶', title:'To Roam Around', desc:'Choose slightly formal or casual casual, then explore campus fits.'},
  {id:'party', icon:'🎉', title:'To a Party', desc:'Best looks mixing sharp, casual and bold pieces.'}
];

let state = { mode:'lecture', presentationSuit:false, roamVibe:'slightlyFormal' };
let currentTop = [];

const $ = s => document.querySelector(s);
const modeGrid = $('#modeGrid'), topGrid = $('#topGrid'), selectorGrid = $('#selectorGrid');

function label(item){ return `${item.brand} – ${item.color} – ${item.type}`; }
function roleEmoji(role){
  const r = role.toLowerCase();
  if(r.includes('lower')) return '👖';
  if(r.includes('shirt') || r.includes('upper')) return '👕';
  if(r.includes('footwear') || r.includes('shoe')) return '👟';
  if(r.includes('suit')) return '🧥';
  if(r.includes('tie')) return '👔';
  return '●';
}
function roleKind(role){
  const r = role.toLowerCase();
  if(r.includes('lower')) return 'lower';
  if(r.includes('shirt') || r.includes('upper')) return 'shirt';
  if(r.includes('footwear') || r.includes('shoe')) return 'shoe';
  if(r.includes('suit')) return 'suit';
  if(r.includes('tie')) return 'tie';
  return 'shirt';
}
function garmentIcon(item, role){
  const c = item.hex || '#222';
  const k = roleKind(role);
  const common = `fill="${c}" stroke="rgba(0,0,0,.42)" stroke-width="1.4" stroke-linejoin="round"`;
  const whiteDetail = c.toLowerCase()==='#ffffff' || c.toLowerCase()==='#f8f6f0' || c.toLowerCase()==='#f7f7f2' || c.toLowerCase()==='#f6f6f0' ? '#d8d2c8' : 'rgba(255,255,255,.42)';
  const svgs = {
    shirt:`<path ${common} d="M10 9l7-4h6l7 4 6 1-3 8-5-2v20H12V16l-5 2-3-8 6-1z"/><path d="M17 5l3 8 3-8" fill="none" stroke="${whiteDetail}" stroke-width="1.4"/>`,
    lower:`<path ${common} d="M13 5h14l2 31h-8l-2-19-2 19H9l2-31z"/><path d="M20 6v30" fill="none" stroke="${whiteDetail}" stroke-width="1.2"/>`,
    shoe:`<path ${common} d="M6 27c7 1 13-2 18-8 5 3 9 5 13 7 1 4-1 7-5 7H9c-3 0-5-2-3-6z"/><path d="M11 29h22" fill="none" stroke="${whiteDetail}" stroke-width="1.3"/>`,
    suit:`<path ${common} d="M12 5h7l3 7 3-7h7l5 6-4 25H11L7 11l5-6z"/><path d="M19 5l3 31M25 5l-3 31M16 15h4M24 15h4" fill="none" stroke="${whiteDetail}" stroke-width="1.35"/>`,
    tie:`<path ${common} d="M18 5h8l3 5-5 5 6 17-8 6-8-6 6-17-5-5 3-5z"/><path d="M17 27l10-10" fill="none" stroke="${whiteDetail}" stroke-width="1.4"/>`
  };
  return `<span class="garmentIcon" title="${item.color}"><svg viewBox="0 0 44 44" aria-hidden="true">${svgs[k]}</svg></span>`;
}
function chip(item, role){
  return `<div class="itemLine">${garmentIcon(item,role)}<span class="dot" title="${item.color}" style="background:${item.hex}"></span><div class="itemText"><b>${role}</b><span>${label(item)}</span></div></div>`;
}
function toast(msg){ const t=$('#toast'); t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),1400); }
function contrastScore(a,b){
  const darks=['Black','Jet Black','Navy','Midnight','Dark','Indigo','Charcoal'];
  const lights=['White','Mint','Sky','Light','Ice','Aqua','Pink'];
  const ad=darks.some(x=>a.color.includes(x)), bd=darks.some(x=>b.color.includes(x));
  const al=lights.some(x=>a.color.includes(x)), bl=lights.some(x=>b.color.includes(x));
  if((ad&&bl)||(bd&&al)) return 8;
  if(a.color.includes('Olive') && (b.color.includes('White')||b.color.includes('Black')||b.color.includes('Grey')||b.color.includes('Denim'))) return 7;
  if(a.color.includes('Blue') && (b.color.includes('White')||b.color.includes('Grey')||b.color.includes('Black')||b.color.includes('Mint'))) return 7;
  if(a.color.includes('Black') && b.color.includes('Black')) return 6;
  return 5;
}
function footwearScore(f, mode){
  if(mode==='auditorium') return f.category==='formalShoes'?10:0;
  if(['lecture','presentationNoSuit'].includes(mode)){ if(f.openToe) return -50; if(f.id==='FW-003') return 10; if(f.id==='FW-004') return 6; if(f.id==='FW-005') return 5; }
  if(mode==='party'){ if(f.openToe) return -30; if(f.id==='FW-003') return 10; if(f.id==='FW-005') return 7; return 5; }
  if(mode==='roamCasual') return f.openToe ? 4 : (f.id==='FW-003'?10:7);
  if(mode==='roamFormal') return f.openToe ? -10 : (f.id==='FW-003'?10:7);
  return 5;
}
function lowerEligible(l, mode){
  if(['lecture','presentationNoSuit'].includes(mode)) return !['joggers','shorts'].includes(l.category);
  if(mode==='party') return ['jeans','chinos','formal'].includes(l.category);
  if(mode==='roamFormal') return !['shorts'].includes(l.category);
  if(mode==='roamCasual') return true;
  return true;
}
function upperEligible(u, mode){
  if(mode==='lecture') return ['formal','casualShirt','polo','tee','outerwear'].includes(u.category);
  if(mode==='presentationNoSuit') return u.category==='formal' || u.category==='casualShirt';
  if(mode==='party') return ['formal','casualShirt','tee','graphicTee','outerwear'].includes(u.category);
  if(mode==='roamFormal') return ['formal','casualShirt','polo','tee','outerwear','kurta'].includes(u.category);
  if(mode==='roamCasual') return true;
  return true;
}
function pairScore(l,u,f,mode){
  let s=60;
  if(mode==='lecture'){
    s += l.category==='jeans'?14:l.category==='chinos'?10:l.category==='formal'?5:0;
    s += u.smart||0; s += footwearScore(f,'lecture'); s += contrastScore(l,u);
    if(u.category==='graphicTee'||u.category==='hoodie') s-=7;
  }
  if(mode==='presentationNoSuit'){
    s += l.category==='jeans'?12:l.category==='formal'?8:l.category==='chinos'?10:0;
    s += u.category==='formal'?14:u.category==='casualShirt'?6:0;
    s += u.solid?5:-2; s += footwearScore(f,'presentationNoSuit'); s += contrastScore(l,u);
  }
  if(mode==='party'){
    s += l.category==='jeans'?12:l.category==='chinos'?8:l.category==='formal'?6:0;
    s += u.party||0; s += footwearScore(f,'party'); s += contrastScore(l,u);
    if(u.category==='outerwear') s+=7; if(u.color.includes('Jet Black')||u.color.includes('Black')) s+=2;
  }
  if(mode==='roamFormal'){ s += (l.smart||0)+(u.smart||0)+footwearScore(f,'roamFormal')+contrastScore(l,u); }
  if(mode==='roamCasual'){ s += (l.casual||0)+(u.casual||0)+footwearScore(f,'roamCasual')+contrastScore(l,u); if(l.category==='shorts') s-=4; }
  return Math.max(0, Math.min(100, Math.round(s)));
}
function shirtSuitRank(shirt){
  if(shirt.white) return 100;
  if(shirt.color.includes('Mint') || shirt.color.includes('Sky') || shirt.color.includes('Light Grey')) return 72;
  if(shirt.color.includes('Steel Grey') || shirt.color.includes('Dusty Purple')) return 58;
  if(shirt.color.includes('Black') || shirt.color.includes('Jet Black')) return 25;
  return 45;
}
function suitScore(suit, shirt, tie, shoes){
  let s=58;
  s += suit.id==='SU-001'?22:12;
  s += shirt.white?30:shirt.solid?6:0;
  s += Math.round(shirtSuitRank(shirt) / 10);
  if(shirt.pattern) s-=30;
  if(shirt.color.includes('Black') || shirt.color.includes('Jet Black')) s-=28;
  s += tie.id==='TI-002'?8:tie.id==='TI-001'?7:5;
  s += shoes.category==='formalShoes'?10:-40;
  if(shirt.color.includes('White') && tie.id==='TI-002') s+=5;
  if(shirt.color.includes('Mint') && tie.id==='TI-002') s+=2;
  return Math.max(0, Math.min(100, Math.round(s)));
}
function activeModeKey(){ if(state.mode==='presentation') return state.presentationSuit?'auditorium':'presentationNoSuit'; if(state.mode==='roam') return state.roamVibe==='casualCasual'?'roamCasual':'roamFormal'; return state.mode; }
function reasonFor(mode){ return ({lecture:'Lecture-safe: no exposed toes, smart upper, jeans/sneaker bias.',auditorium:'Mandapam-safe: navy suit, white formal shirt priority, tie and black formal shoes. Black T-shirts and casual uppers are blocked here.',presentationNoSuit:'Presentation-ready without suit: formal shirt priority, clean footwear, jeans preferred.',roamFormal:'Campus roaming with a polished edge: relaxed but still sharp.',roamCasual:'Casual casual: comfort first, but still colour-aware.',party:'Party mode: strongest silhouette, contrast and confidence.'})[mode]||''; }
function getById(arr,id){return arr.find(x=>x.id===id)}

function generateTop(modeKey, limit=20){
  if(modeKey==='auditorium'){
    const shirts=wardrobe.uppers
      .filter(u=>u.category==='formal' && u.solid && !u.pattern)
      .sort((a,b)=>shirtSuitRank(b)-shirtSuitRank(a));
    const shoes=wardrobe.footwear.find(f=>f.category==='formalShoes');
    let combos=[];
    wardrobe.suits.forEach(suit=>shirts.forEach(shirt=>wardrobe.ties.forEach(tie=>{
      const score=suitScore(suit,shirt,tie,shoes);
      if(score>=70) combos.push({kind:'suit', suit, upper:shirt, tie, footwear:shoes, score});
    })));
    return combos.sort((a,b)=>b.score-a.score).slice(0,limit);
  }
  const lowers=wardrobe.lowers.filter(l=>lowerEligible(l,modeKey));
  const uppers=wardrobe.uppers.filter(u=>upperEligible(u,modeKey));
  const shoes=wardrobe.footwear.filter(f=>footwearScore(f,modeKey)>0); let combos=[];
  lowers.forEach(l=>uppers.forEach(u=>shoes.forEach(f=>{ const score=pairScore(l,u,f,modeKey); if(score>70) combos.push({kind:'regular', lower:l, upper:u, footwear:f, score}); })));
  return diversify(combos.sort((a,b)=>b.score-a.score),limit,'upper');
}
function diversify(list,limit,key){
  const chosen=[], seen=new Map();
  for(const c of list){ const id=c[key]?.id || c.suit?.id; const n=seen.get(id)||0; if(n<2){ chosen.push(c); seen.set(id,n+1); } if(chosen.length===limit) break; }
  return chosen.length>=limit ? chosen : list.slice(0,limit);
}
function comboText(o){
  if(o.kind==='suit') return `${roleEmoji('Suit')} ${label(o.suit)}\n${roleEmoji('Shirt')} ${label(o.upper)}\n${roleEmoji('Tie')} ${label(o.tie)}\n${roleEmoji('Footwear')} ${label(o.footwear)}\nScore: ${o.score}/100`;
  return `${roleEmoji('Lower')} ${label(o.lower)}\n${roleEmoji('Upper')} ${label(o.upper)}\n${roleEmoji('Footwear')} ${label(o.footwear)}\nScore: ${o.score}/100`;
}
function saveLook(o){ const saved=JSON.parse(localStorage.getItem('wardrobeos_saved')||'[]'); saved.unshift({...o, savedAt:new Date().toISOString()}); localStorage.setItem('wardrobeos_saved',JSON.stringify(saved.slice(0,24))); renderSaved(); toast('Look saved'); }
function copyLook(o){ navigator.clipboard?.writeText(comboText(o)); toast('Copied outfit'); }
function metricsFor(o,modeKey){
  if(o.kind==='suit') return [['Formality',98],['Suitability',o.score],['White Shirt Logic',o.upper.white?100:70]];
  return [['Harmony',70+contrastScore(o.lower,o.upper)*3],['Occasion',o.score],['Footwear',70+footwearScore(o.footwear,modeKey)*3]];
}

function renderModeGrid(){
  modeGrid.innerHTML=modes.map(m=>`<article class="modeCard ${state.mode===m.id?'active':''}" data-mode="${m.id}"><div class="modeIcon">${m.icon}</div><h3>${m.title}</h3><p>${m.desc}</p></article>`).join('');
  modeGrid.querySelectorAll('.modeCard').forEach(c=>c.onclick=()=>{state.mode=c.dataset.mode; renderAll();});
}
function renderHero(){
  $('#heroStats').innerHTML=`<span><b>${wardrobe.lowers.length}</b> Lowers</span><span><b>${wardrobe.uppers.length}</b> Uppers</span><span><b>${wardrobe.footwear.length}</b> Footwear</span><span><b>${wardrobe.ties.length}</b> Ties</span>`;
}
function renderQuestions(){
  const panel=$('#questionPanel');
  if(state.mode==='presentation'){
    panel.classList.remove('hidden');
    panel.innerHTML=`<div><p class="eyebrow">Presentation Question</p><h2>Will you be wearing a suit?</h2></div><div class="choiceRow"><button class="choiceBtn ${state.presentationSuit?'active':''}" data-val="yes">Yes, suit needed</button><button class="choiceBtn ${!state.presentationSuit?'active':''}" data-val="no">No suit</button></div>`;
    panel.querySelectorAll('.choiceBtn').forEach(b=>b.onclick=()=>{state.presentationSuit=b.dataset.val==='yes'; renderAll();});
  } else if(state.mode==='roam'){
    panel.classList.remove('hidden');
    panel.innerHTML=`<div><p class="eyebrow">Campus Vibe</p><h2>How do you want to look?</h2></div><div class="choiceRow"><button class="choiceBtn ${state.roamVibe==='slightlyFormal'?'active':''}" data-val="slightlyFormal">Slightly formal</button><button class="choiceBtn ${state.roamVibe==='casualCasual'?'active':''}" data-val="casualCasual">Casual casual</button></div>`;
    panel.querySelectorAll('.choiceBtn').forEach(b=>b.onclick=()=>{state.roamVibe=b.dataset.val; renderAll();});
  } else panel.classList.add('hidden');
}
function renderTop(){
  const modeKey=activeModeKey(); currentTop=generateTop(modeKey,20);
  $('#topTitle').textContent = state.mode==='auditorium'?'Top 20 Mandapam combinations': state.mode==='presentation'?(state.presentationSuit?'Top 20 suited presentation combinations':'Top 20 no-suit presentation combinations'): state.mode==='roam'?(state.roamVibe==='slightlyFormal'?'Top 20 polished campus looks':'Top 20 casual campus looks'): state.mode==='party'?'Top 20 party looks':'Top 20 lecture looks';
  $('#currentModeLabel').textContent=modes.find(m=>m.id===state.mode).title;
  $('#filterPills').innerHTML=currentTop.slice(0,4).map(o=>`<span class="pill">${o.score}/100</span>`).join('');
  topGrid.innerHTML=currentTop.map((o,i)=>cardHTML(o,i,modeKey)).join('');
  topGrid.querySelectorAll('[data-save]').forEach(b=>b.onclick=()=>saveLook(currentTop[+b.dataset.save]));
  topGrid.querySelectorAll('[data-copy]').forEach(b=>b.onclick=()=>copyLook(currentTop[+b.dataset.copy]));
}
function cardHTML(o,i,modeKey){
  const metricHTML=metricsFor(o,modeKey).map(m=>`<div class="metric"><b>${m[0]}</b><span>${Math.min(100,m[1])}</span></div>`).join('');
  const body=o.kind==='suit'?`${chip(o.suit,'Suit')}${chip(o.upper,'Shirt')}${chip(o.tie,'Tie')}${chip(o.footwear,'Footwear')}`:`${chip(o.lower,'Lower')}${chip(o.upper,'Upper')}${chip(o.footwear,'Footwear')}`;
  return `<article class="outfitCard"><div class="outfitTop"><div class="rank">#${i+1}</div><div class="score">${o.score}<small>score</small></div></div>${body}<div class="metrics">${metricHTML}</div><p class="reason">${reasonFor(modeKey)}</p><div class="cardActions"><button class="actionBtn" data-save="${i}">Save look</button><button class="actionBtn secondary" data-copy="${i}">Copy</button></div></article>`;
}
function optionHTML(items, placeholder){ return `<option value="">${placeholder}</option>` + items.map(i=>`<option value="${i.id}">${roleEmoji(i.type)} ${label(i)}</option>`).join(''); }
function renderBuilder(){
  const modeKey=activeModeKey();
  if(modeKey==='auditorium'){
    const suitShirts=wardrobe.uppers.filter(u=>u.category==='formal' && u.solid && !u.pattern).sort((a,b)=>shirtSuitRank(b)-shirtSuitRank(a));
    selectorGrid.innerHTML=`<div class="selectWrap"><label>Suit</label><select id="manualSuit">${optionHTML(wardrobe.suits,'Select suit')}</select></div><div class="selectWrap"><label>Shirt</label><select id="manualUpper">${optionHTML(suitShirts,'Select shirt')}</select></div><div class="selectWrap"><label>Tie</label><select id="manualTie">${optionHTML(wardrobe.ties,'Select tie')}</select></div><div class="selectWrap"><label>Footwear</label><select id="manualFoot">${optionHTML(wardrobe.footwear.filter(f=>f.category==='formalShoes'),'Select footwear')}</select></div>`;
    ['manualSuit','manualUpper','manualTie','manualFoot'].forEach(id=>$('#'+id).onchange=updateManual);
  } else {
    const lowers=wardrobe.lowers.filter(l=>lowerEligible(l,modeKey));
    selectorGrid.innerHTML=`<div class="selectWrap"><label>Lower</label><select id="manualLower">${optionHTML(lowers,'Select lower')}</select></div><div class="selectWrap"><label>Upper</label><select id="manualUpper"><option>Select lower first</option></select></div><div class="selectWrap"><label>Footwear</label><select id="manualFoot"><option>Select upper first</option></select></div><div class="selectWrap"><label>Mode</label><select disabled><option>${modes.find(m=>m.id===state.mode).title}</option></select></div>`;
    $('#manualLower').onchange=()=>{ const l=getById(wardrobe.lowers,$('#manualLower').value); let uppers=wardrobe.uppers.filter(u=>upperEligible(u,modeKey)); if(l) uppers=uppers.sort((a,b)=>pairScore(l,b,wardrobe.footwear.find(f=>f.id==='FW-003'),modeKey)-pairScore(l,a,wardrobe.footwear.find(f=>f.id==='FW-003'),modeKey)); $('#manualUpper').innerHTML=optionHTML(uppers,'Select upper'); $('#manualFoot').innerHTML='<option>Select upper first</option>'; updateManual(); };
    $('#manualUpper').onchange=()=>{ const l=getById(wardrobe.lowers,$('#manualLower').value), u=getById(wardrobe.uppers,$('#manualUpper').value); let feet=wardrobe.footwear.filter(f=>footwearScore(f,modeKey)>0); if(l&&u) feet=feet.sort((a,b)=>pairScore(l,u,b,modeKey)-pairScore(l,u,a,modeKey)); $('#manualFoot').innerHTML=optionHTML(feet,'Select footwear'); updateManual(); };
    $('#manualFoot').onchange=updateManual;
  }
  updateManual();
}
function updateManual(){
  const modeKey=activeModeKey(); const preview=$('#manualPreview'), scoreBadge=$('#manualScore');
  if(modeKey==='auditorium'){
    const suit=getById(wardrobe.suits,$('#manualSuit')?.value), upper=getById(wardrobe.uppers,$('#manualUpper')?.value), tie=getById(wardrobe.ties,$('#manualTie')?.value), foot=getById(wardrobe.footwear,$('#manualFoot')?.value);
    if(suit&&upper&&tie&&foot){ const s=suitScore(suit,upper,tie,foot); const o={kind:'suit',suit,upper,tie,footwear:foot,score:s}; scoreBadge.textContent=`${s}/100`; preview.innerHTML=`${chip(suit,'Suit')}${chip(upper,'Shirt')}${chip(tie,'Tie')}${chip(foot,'Footwear')}<p class="reason">${reasonFor('auditorium')}</p><div class="palette">${[suit,upper,tie,foot].map(x=>`<span class="dot" style="background:${x.hex}"></span>`).join('')}</div><div class="cardActions"><button class="actionBtn" id="saveManual">Save manual look</button></div>`; $('#saveManual').onclick=()=>saveLook(o); }
    else {scoreBadge.textContent='Score —'; preview.innerHTML='<p>Select suit, shirt, tie and footwear.</p>';}
  } else {
    const l=getById(wardrobe.lowers,$('#manualLower')?.value), u=getById(wardrobe.uppers,$('#manualUpper')?.value), f=getById(wardrobe.footwear,$('#manualFoot')?.value);
    if(l&&u&&f){ const s=pairScore(l,u,f,modeKey); const o={kind:'regular',lower:l,upper:u,footwear:f,score:s}; scoreBadge.textContent=`${s}/100`; preview.innerHTML=`${chip(l,'Lower')}${chip(u,'Upper')}${chip(f,'Footwear')}<p class="reason">${reasonFor(modeKey)}</p><div class="palette">${[l,u,f].map(x=>`<span class="dot" style="background:${x.hex}"></span>`).join('')}</div><div class="cardActions"><button class="actionBtn" id="saveManual">Save manual look</button></div>`; $('#saveManual').onclick=()=>saveLook(o); }
    else {scoreBadge.textContent='Score —'; preview.innerHTML='<p>Select items above to see colour harmony, occasion suitability and attractiveness score.</p>';}
  }
}
function renderSaved(){
  const saved=JSON.parse(localStorage.getItem('wardrobeos_saved')||'[]');
  const grid=$('#savedGrid'); if(!grid) return;
  grid.innerHTML=saved.length?saved.map((o,i)=>`<div class="miniCard"><h3>Saved Look ${i+1} · ${o.score}/100</h3><p>${comboText(o).replaceAll('\n','<br>')}</p></div>`).join(''):'<div class="miniCard"><h3>No saved looks yet</h3><p>Save a top look or manual combination and it will appear here.</p></div>';
  $('#clearSavedBtn').onclick=()=>{localStorage.removeItem('wardrobeos_saved'); renderSaved(); toast('Reset saved looks');};
}
function renderInventory(){
  const groups=[['Lowers',wardrobe.lowers],['Uppers',wardrobe.uppers],['Footwear',wardrobe.footwear],['Suits',wardrobe.suits],['Ties',wardrobe.ties]];
  $('#inventoryGrid').innerHTML=groups.map(([name,items])=>`<div class="miniCard"><h3>${name} · ${items.length}</h3><div class="inventoryList">${items.map(i=>`<div class="inventoryRow">${garmentIcon(i,name)}<span class="dot" style="background:${i.hex}"></span><span>${label(i)}</span></div>`).join('')}</div></div>`).join('');
}
function renderAll(){ renderHero(); renderModeGrid(); renderQuestions(); renderTop(); renderBuilder(); renderSaved(); renderInventory(); }
renderAll();
