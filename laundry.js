// WardrobeOS Laundry Mode
// This file extends the existing outfit engine without changing the core recommendation logic.

wardrobe.suits = [
  {id:'SU-001', brand:'British Cut Suit', color:'Navy Blue Double-Breasted', type:'Suit', hex:'#171c38', priority:10},
  {id:'SU-002', brand:'American Cut Suit', color:'Navy Blue Single-Breasted', type:'Suit', hex:'#202942', priority:7}
];

const laundryStoreKey = 'wardrobeos_laundry';
const modeKeysForLaundry = ['lecture', 'auditorium', 'presentationNoSuit', 'roamFormal', 'roamCasual', 'party'];

function laundryItems(){
  return [
    ...wardrobe.uppers.map(item => ({...item, group:'Uppers'})),
    ...wardrobe.lowers.map(item => ({...item, group:'Lowers'})),
    ...wardrobe.suits.map(item => ({...item, group:'Suits'})),
    ...wardrobe.ties.map(item => ({...item, group:'Ties'})),
    ...wardrobe.footwear.map(item => ({...item, group:'Footwear'}))
  ];
}

function getLaundryMap(){
  return JSON.parse(localStorage.getItem(laundryStoreKey) || '{}');
}

function setLaundryMap(map){
  localStorage.setItem(laundryStoreKey, JSON.stringify(map));
}

function getLaundryStatus(id){
  return getLaundryMap()[id] || 'washed';
}

function setLaundryStatus(id, status){
  const map = getLaundryMap();
  map[id] = status;
  setLaundryMap(map);
  renderLaundryMode();
  toast(status === 'needsWash' ? 'Marked needs wash' : 'Marked washed enough');
}

function laundryDependencyStats(){
  const stats = {};
  modeKeysForLaundry.forEach(mode => {
    generateTop(mode, 20).forEach(outfit => {
      const items = outfit.kind === 'suit'
        ? [outfit.suit, outfit.upper, outfit.tie, outfit.footwear]
        : [outfit.lower, outfit.upper, outfit.footwear];
      items.forEach(item => {
        if (!stats[item.id]) stats[item.id] = { count: 0, total: 0 };
        stats[item.id].count += 1;
        stats[item.id].total += outfit.score;
      });
    });
  });
  return stats;
}

function laundryPriority(item, stats){
  const dependency = stats[item.id] || { count: 0, total: 0 };
  const averageScore = dependency.count ? dependency.total / dependency.count : 60;
  let bonus = 0;
  if (item.white) bonus += 18;
  if (item.id === 'SU-001') bonus += 20;
  if (item.id === 'FW-003') bonus += 16;
  if (item.category === 'formalShoes') bonus += 12;
  if (item.category === 'jeans') bonus += 10;
  if (item.category === 'formal') bonus += 8;
  if (item.group === 'Ties') bonus -= 8;
  if (item.openToe) bonus -= 14;
  return Math.round((dependency.count * 9) + (averageScore * 0.45) + bonus);
}

function laundryCard(item){
  const isNeedsWash = item.status === 'needsWash';
  return `<div class="laundryCard">
    <div class="laundryCardTop">
      <span class="dot" style="background:${item.hex}"></span>
      <button class="statusPill ${isNeedsWash ? 'needs' : ''}" data-id="${item.id}">${isNeedsWash ? 'Needs wash' : 'Washed enough'}</button>
    </div>
    <h3>${label(item)}</h3>
    <p class="itemMeta">${item.group} · Priority ${item.priority} · Appears in ${item.dep} top outfit slots</p>
  </div>`;
}

function queueRow(item, index){
  return `<div class="queueRow">
    <div class="queueRank">#${index + 1}</div>
    <div>
      ${chip(item, item.group)}
      <p class="itemMeta">Used in ${item.dep} high-ranking outfit slots. Priority rises when a piece anchors many strong outfits.</p>
    </div>
    <div class="priorityBadge">${item.priority}</div>
  </div>`;
}

function renderLaundryMode(){
  const stats = laundryDependencyStats();
  const items = laundryItems().map(item => ({
    ...item,
    priority: laundryPriority(item, stats),
    dep: stats[item.id]?.count || 0,
    status: getLaundryStatus(item.id)
  }));
  const needsWash = items.filter(item => item.status === 'needsWash').sort((a, b) => b.priority - a.priority);
  const washed = items.length - needsWash.length;

  document.getElementById('laundrySummary').innerHTML = `
    <div class="summaryCard"><b>${items.length}</b><span>Total items</span></div>
    <div class="summaryCard"><b>${washed}</b><span>Washed enough</span></div>
    <div class="summaryCard"><b>${needsWash.length}</b><span>Need wash</span></div>
    <div class="summaryCard"><b>${needsWash[0]?.priority || 0}</b><span>Top priority</span></div>
  `;

  document.getElementById('washQueue').innerHTML = needsWash.length
    ? needsWash.slice(0, 30).map(queueRow).join('')
    : '<div class="miniCard"><h3>Everything is marked washed enough</h3><p>No urgent wash queue right now.</p></div>';

  renderLaundryGrid(items);

  document.getElementById('markAllWashedBtn').onclick = () => {
    const map = {};
    items.forEach(item => map[item.id] = 'washed');
    setLaundryMap(map);
    renderLaundryMode();
    toast('All marked washed');
  };
  document.getElementById('resetLaundryBtn').onclick = () => {
    localStorage.removeItem(laundryStoreKey);
    renderLaundryMode();
    toast('Laundry reset');
  };
  document.getElementById('laundrySearch').oninput = () => renderLaundryGrid(items);
}

function renderLaundryGrid(items){
  const query = (document.getElementById('laundrySearch')?.value || '').toLowerCase();
  const filtered = items.filter(item => label(item).toLowerCase().includes(query) || item.group.toLowerCase().includes(query));
  document.getElementById('laundryGrid').innerHTML = filtered.map(laundryCard).join('');
  document.querySelectorAll('.statusPill').forEach(button => {
    button.onclick = () => setLaundryStatus(button.dataset.id, button.classList.contains('needs') ? 'washed' : 'needsWash');
  });
}

function showOutfitMode(){
  document.getElementById('outfitView').classList.remove('hidden');
  document.getElementById('laundryView').classList.add('hidden');
  document.getElementById('outfitViewBtn').classList.add('active');
  document.getElementById('laundryViewBtn').classList.remove('active');
}

function showLaundryMode(){
  document.getElementById('outfitView').classList.add('hidden');
  document.getElementById('laundryView').classList.remove('hidden');
  document.getElementById('outfitViewBtn').classList.remove('active');
  document.getElementById('laundryViewBtn').classList.add('active');
  renderLaundryMode();
}

document.getElementById('outfitViewBtn').onclick = showOutfitMode;
document.getElementById('laundryViewBtn').onclick = showLaundryMode;

renderLaundryMode();
