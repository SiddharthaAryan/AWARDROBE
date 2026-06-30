const modes = [
  {id:'lecture', icon:'🎓', title:'To a Lecture', desc:'Smart casual. No toe-showing shoes. Jeans + sneakers get preference.'},
  {id:'auditorium', icon:'🏛️', title:'To the Auditorium', desc:'Suit mandatory. British cut preferred. Tie + black formal shoes.'},
  {id:'presentation', icon:'🎤', title:'To a Presentation', desc:'Asks whether suit is needed. Otherwise smart formal with jeans preferred.'},
  {id:'roam', icon:'🚶', title:'To Roam Around', desc:'Choose slightly formal or casual casual, then explore campus fits.'},
  {id:'party', icon:'🎉', title:'To a Party', desc:'Best looks mixing sharp, casual and bold pieces.'}
];

let state = { mode:'lecture', presentationSuit:false, roamVibe:'slightlyFormal' };

const $ = s => document.querySelector(s);
const modeGrid = $('#modeGrid'), topGrid = $('#topGrid'), selectorGrid = $('#selectorGrid');

function label(item){ return `${item.brand} – ${item.color} – ${item.type}`; }
function chip(item, role){
  return `<div class="itemLine">
    <span class="dot" style="background:${item.hex}"></span>
    <div class="itemText"><b>${role}</b><span>${label(item)}</span></div>
  </div>`;
}
function scoreClass(score){ return score>=94?'elite':score>=88?'strong':'good'; }

function contrastScore(a,b){
  const darks=['Black','Jet Black','Navy','Midnight','Dark','Indigo','Charcoal'];
  const lights=['White','Mint','Sky','Light','Ice','Aqua','Pink'];
  const ad = darks.some(x=>a.color.includes(x)), bd = darks.some(x=>b.color.includes(x));
  const al = lights.some(x=>a.color.includes(x)), bl = lights.some(x=>b.color.includes(x));
  if((ad&&bl)||(bd&&al)) return 8;
  if(a.color.includes('Olive') && (b.color.includes('White')||b.color.includes('Black')||b.color.includes('Grey')||b.color.includes('Denim'))) return 7;
  if(a.color.includes('Blue') && (b.color.includes('White')||b.color.includes('Grey')||b.color.includes('Black')||b.color.includes('Mint'))) return 7;
  if(a.color.includes('Black') && b.color.includes('Black')) return 6;
  return 5;
}
function footwearScore(f, mode){
  if(mode==='auditorium') return f.category==='formalShoes'?10:0;
  if(['lecture','presentationNoSuit'].includes(mode)) {
    if(f.openToe) return -50;
    if(f.id==='FW-003') return 10;
    if(f.id==='FW-004') return 6;
    if(f.id==='FW-005') return 5;
  }
  if(mode==='party') {
    if(f.openToe) return -30;
    if(f.id==='FW-003') return 10;
    if(f.id==='FW-005') return 7;
    return 5;
  }
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
  if(mode==='presentationNoSuit') return u.category==='formal' || ['casualShirt'].includes(u.category);
  if(mode==='party') return ['formal','casualShirt','tee','graphicTee','outerwear'].includes(u.category);
  if(mode==='roamFormal') return ['formal','casualShirt','polo','tee','outerwear','kurta'].includes(u.category);
  if(mode==='roamCasual') return true;
  return true;
}
function pairScore(l,u,f,mode){
  let s = 60;
  if(mode==='lecture'){
    s += l.category==='jeans'?14:l.category==='chinos'?10:l.category==='formal'?5:0;
    s += u.smart || 0;
    s += footwearScore(f,'lecture');
    s += contrastScore(l,u);
    if(u.category==='graphicTee' || u.category==='hoodie') s -= 7;
  }
  if(mode==='presentationNoSuit'){
    s += l.category==='jeans'?12:l.category==='formal'?8:l.category==='chinos'?10:0;
    s += u.category==='formal'?14:u.category==='casualShirt'?6:0;
    s += u.solid?5:-2;
    s += footwearScore(f,'presentationNoSuit');
    s += contrastScore(l,u);
  }
  if(mode==='party'){
    s += l.category==='jeans'?12:l.category==='chinos'?8:l.category==='formal'?6:0;
    s += u.party || 0;
    s += footwearScore(f,'party');
    s += contrastScore(l,u);
    if(u.category==='outerwear') s += 7;
    if(u.color.includes('Jet Black')||u.color.includes('Black')) s += 2;
  }
  if(mode==='roamFormal'){
    s += l.smart || 0;
    s += u.smart || 0;
    s += footwearScore(f,'roamFormal');
    s += contrastScore(l,u);
  }
  if(mode==='roamCasual'){
    s += l.casual || 0;
    s += u.casual || 0;
    s += footwearScore(f,'roamCasual');
    s += contrastScore(l,u);
    if(l.category==='shorts') s -= 4;
  }
  return Math.max(0, Math.min(100, Math.round(s)));
}
function suitScore(suit, shirt, tie, shoes){
  let s = 64;
  s += suit.id==='SU-001'?16:10;
  s += shirt.white?12:shirt.solid?7:0;
  if(shirt.pattern) s -= 10;
  s += tie.id==='TI-002'?8:tie.id==='TI-001'?7:5;
  s += shoes.category==='formalShoes'?10:-30;
  if(shirt.color.includes('White') && tie.id==='TI-002') s += 3;
  if(shirt.color.includes('Mint') && tie.id==='TI-002') s += 2;
  return Math.max(0, Math.min(100, Math.round(s)));
}
function reasonFor(mode){
  const r = {
    lecture:'Lecture-safe: no exposed toes, smart upper, jeans/sneaker bias.',
    auditorium:'Mandapam-safe: suit, tie, solid formal shirt and black shoes.',
    presentationNoSuit:'Presentation-ready without suit: formal shirt priority, clean footwear, jeans preferred.',
    roamFormal:'Campus roaming with a polished edge: relaxed but still sharp.',
    roamCasual:'Casual casual: comfort first, but still colour-aware.',
    party:'Party mode: strongest silhouette, contrast and confidence.'
  };
  return r[mode] || '';
}
function activeModeKey(){
  if(state.mode==='presentation') return state.presentationSuit?'auditorium':'presentationNoSuit';
  if(state.mode==='roam') return state.roamVibe==='casualCasual'?'roamCasual':'roamFormal';
  return state.mode;
}

function generateTop(modeKey, limit=20){
  if(modeKey==='auditorium'){
    const shirts = wardrobe.uppers.filter(u=>u.category==='formal' && (u.white || (u.solid && !u.pattern)));
    const shoes = wardrobe.footwear.find(f=>f.category==='formalShoes');
    let combos=[];
    wardrobe.suits.forEach(suit=>shirts.forEach(shirt=>wardrobe.ties.forEach(tie=>{
      combos.push({kind:'suit', suit, upper:shirt, tie, footwear:shoes, score:suitScore(suit,shirt,tie,shoes)});
    })));
    return combos.sort((a,b)=>b.score-a.score).slice(0,limit);
  }
  const lowers = wardrobe.lowers.filter(l=>lowerEligible(l,modeKey));
  const uppers = wardrobe.uppers.filter(u=>upperEligible(u,modeKey));
  const shoes = wardrobe.footwear.filter(f=>footwearScore(f,modeKey)>0);
  let combos=[];
  lowers.forEach(l=>uppers.forEach(u=>shoes.forEach(f=>{
    const score=pairScore(l,u,f,modeKey);
    if(score>70) combos.push({kind:'regular', lower:l, upper:u, footwear:f, score});
  })));
  return combos.sort((a,b)=>b.score-a.score).slice(0,limit);
}

function renderModeGrid(){
  modeGrid.innerHTML = modes.map(m=>`
    <article class="modeCard ${state.mode===m.id?'active':''}" data-mode="${m.id}">
      <div class="modeIcon">${m.icon}</div><h3>${m.title}</h3><p>${m.desc}</p>
    </article>`).join('');
  modeGrid.querySelectorAll('.modeCard').forEach(c=>c.onclick=()=>{state.mode=c.dataset.mode; renderAll();});
}
function renderQuestions(){
  const panel=$('#questionPanel');
  if(state.mode==='presentation'){
    panel.classList.remove('hidden');
    panel.innerHTML=`<div><p class="eyebrow">Presentation Question</p><h2>Will you be wearing a suit?</h2></div>
      <div class="choiceRow">
      <button class="choiceBtn ${state.presentationSuit?'active':''}" data-val="yes">Yes, suit needed</button>
      <button class="choiceBtn ${!state.presentationSuit?'active':''}" data-val="no">No suit</button></div>`;
    panel.querySelectorAll('.choiceBtn').forEach(b=>b.onclick=()=>{state.presentationSuit=b.dataset.val==='yes'; renderAll();});
  } else if(state.mode==='roam'){
    panel.classList.remove('hidden');
    panel.innerHTML=`<div><p class="eyebrow">Campus Vibe</p><h2>How do you want to look?</h2></div>
      <div class="choiceRow">
      <button class="choiceBtn ${state.roamVibe==='slightlyFormal'?'active':''}" data-val="slightlyFormal">Slightly formal</button>
      <button class="choiceBtn ${state.roamVibe==='casualCasual'?'active':''}" data-val="casualCasual">Casual casual</button></div>`;
    panel.querySelectorAll('.choiceBtn').forEach(b=>b.onclick=()=>{state.roamVibe=b.dataset.val; renderAll();});
  } else panel.classList.add('hidden');
}
function renderTop(){
  const modeKey=activeModeKey();
  const top=generateTop(modeKey,20);
  const title = state.mode==='auditorium'?'Top 20 Mandapam combinations':
    state.mode==='presentation' ? (state.presentationSuit?'Top 20 suited presentation combinations':'Top 20 no-suit presentation combinations') :
    state.mode==='roam' ? (state.roamVibe==='slightlyFormal'?'Top 20 polished campus looks':'Top 20 casual campus looks') :
    state.mode==='party'?'Top 20 party looks':'Top 20 lecture looks';
  $('#topTitle').textContent=title;
  $('#currentModeLabel').textContent=modes.find(m=>m.id===state.mode).title;
  $('#filterPills').innerHTML = top.slice(0,4).map(o=>`<span class="pill">${o.score}/100</span>`).join('');
  topGrid.innerHTML=top.map((o,i)=>{
    if(o.kind==='suit') return `<article class="outfitCard">
      <div class="outfitTop"><div class="rank">#${i+1}</div><div class="score">${o.score}<small>score</small></div></div>
      ${chip(o.suit,'Suit')}${chip(o.upper,'Shirt')}${chip(o.tie,'Tie')}${chip(o.footwear,'Footwear')}
      <p class="reason">${reasonFor('auditorium')}</p></article>`;
    return `<article class="outfitCard">
      <div class="outfitTop"><div class="rank">#${i+1}</div><div class="score">${o.score}<small>score</small></div></div>
      ${chip(o.lower,'Lower')}${chip(o.upper,'Upper')}${chip(o.footwear,'Footwear')}
      <p class="reason">${reasonFor(modeKey)}</p></article>`;
  }).join('');
}
function optionHTML(items, placeholder){
  return `<option value="">${placeholder}</option>` + items.map(i=>`<option value="${i.id}">● ${label(i)}</option>`).join('');
}
function getById(arr,id){return arr.find(x=>x.id===id)}
function renderBuilder(){
  const modeKey=activeModeKey();
  if(modeKey==='auditorium'){
    selectorGrid.innerHTML = `
      <div class="selectWrap"><label>Suit</label><select id="manualSuit">${optionHTML(wardrobe.suits,'Select suit')}</select></div>
      <div class="selectWrap"><label>Shirt</label><select id="manualUpper">${optionHTML(wardrobe.uppers.filter(u=>u.category==='formal' && (u.white || (u.solid && !u.pattern))),'Select shirt')}</select></div>
      <div class="selectWrap"><label>Tie</label><select id="manualTie">${optionHTML(wardrobe.ties,'Select tie')}</select></div>
      <div class="selectWrap"><label>Footwear</label><select id="manualFoot">${optionHTML(wardrobe.footwear.filter(f=>f.category==='formalShoes'),'Select footwear')}</select></div>`;
    ['manualSuit','manualUpper','manualTie','manualFoot'].forEach(id=>$('#'+id).onchange=updateManual);
  } else {
    const lowers=wardrobe.lowers.filter(l=>lowerEligible(l,modeKey));
    selectorGrid.innerHTML = `
      <div class="selectWrap"><label>Lower</label><select id="manualLower">${optionHTML(lowers,'Select lower')}</select></div>
      <div class="selectWrap"><label>Upper</label><select id="manualUpper"><option>Select lower first</option></select></div>
      <div class="selectWrap"><label>Footwear</label><select id="manualFoot"><option>Select upper first</option></select></div>
      <div class="selectWrap"><label>Mode</label><select disabled><option>${modes.find(m=>m.id===state.mode).title}</option></select></div>`;
    $('#manualLower').onchange=()=>{
      const l=getById(wardrobe.lowers,$('#manualLower').value);
      let uppers=wardrobe.uppers.filter(u=>upperEligible(u,modeKey));
      if(l) uppers=uppers.sort((a,b)=>pairScore(l,b,wardrobe.footwear.find(f=>f.id==='FW-003'),modeKey)-pairScore(l,a,wardrobe.footwear.find(f=>f.id==='FW-003'),modeKey));
      $('#manualUpper').innerHTML=optionHTML(uppers,'Select upper');
      $('#manualFoot').innerHTML='<option>Select upper first</option>';
      updateManual();
    };
    $('#manualUpper').onchange=()=>{
      const l=getById(wardrobe.lowers,$('#manualLower').value), u=getById(wardrobe.uppers,$('#manualUpper').value);
      let feet=wardrobe.footwear.filter(f=>footwearScore(f,modeKey)>0);
      if(l&&u) feet=feet.sort((a,b)=>pairScore(l,u,b,modeKey)-pairScore(l,u,a,modeKey));
      $('#manualFoot').innerHTML=optionHTML(feet,'Select footwear');
      updateManual();
    };
    $('#manualFoot').onchange=updateManual;
  }
  updateManual();
}
function updateManual(){
  const modeKey=activeModeKey();
  const preview=$('#manualPreview'), scoreBadge=$('#manualScore');
  if(modeKey==='auditorium'){
    const suit=getById(wardrobe.suits,$('#manualSuit')?.value);
    const upper=getById(wardrobe.uppers,$('#manualUpper')?.value);
    const tie=getById(wardrobe.ties,$('#manualTie')?.value);
    const foot=getById(wardrobe.footwear,$('#manualFoot')?.value);
    if(suit&&upper&&tie&&foot){
      const s=suitScore(suit,upper,tie,foot);
      scoreBadge.textContent=`${s}/100`;
      preview.innerHTML=`${chip(suit,'Suit')}${chip(upper,'Shirt')}${chip(tie,'Tie')}${chip(foot,'Footwear')}<p class="reason">${reasonFor('auditorium')}</p><div class="palette">${[suit,upper,tie,foot].map(x=>`<span class="dot" style="background:${x.hex}"></span>`).join('')}</div>`;
    } else {scoreBadge.textContent='Score —'; preview.innerHTML='<p>Select suit, shirt, tie and footwear.</p>';}
  } else {
    const l=getById(wardrobe.lowers,$('#manualLower')?.value);
    const u=getById(wardrobe.uppers,$('#manualUpper')?.value);
    const f=getById(wardrobe.footwear,$('#manualFoot')?.value);
    if(l&&u&&f){
      const s=pairScore(l,u,f,modeKey);
      scoreBadge.textContent=`${s}/100`;
      preview.innerHTML=`${chip(l,'Lower')}${chip(u,'Upper')}${chip(f,'Footwear')}<p class="reason">${reasonFor(modeKey)}</p><div class="palette">${[l,u,f].map(x=>`<span class="dot" style="background:${x.hex}"></span>`).join('')}</div>`;
    } else {scoreBadge.textContent='Score —'; preview.innerHTML='<p>Select items above to see colour harmony, occasion suitability and attractiveness score.</p>';}
  }
}
function renderAll(){ renderModeGrid(); renderQuestions(); renderTop(); renderBuilder(); }
renderAll();
