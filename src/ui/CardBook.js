import { CardCollection } from '../system/CardCollection.js';
import { SceneManager }   from '../game/SceneManager.js';

const SCENARIO_LABELS = {
  CVS_001:        '편의점',
  RESTAURANT_001: '식당',
  SUBWAY_001:     '지하철',
};

let _currentType = 'word';

async function renderCards(type) {
  _currentType = type;
  const body = document.getElementById('cards-body');
  if (!body) return;

  const all      = await CardCollection.getCards();
  const filtered = all.filter(c => c.type === type);
  const unlocked = filtered.filter(c => c.unlocked);
  const locked   = filtered.filter(c => !c.unlocked);

  body.innerHTML = '';

  if (filtered.length === 0) {
    body.innerHTML = '<div class="cards-empty">카드가 없어요</div>';
    return;
  }

  if (unlocked.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'cards-empty';
    empty.textContent = '미션을 클리어하면\n표현 카드를 얻을 수 있어요';
    body.appendChild(empty);
  }

  const grid = document.createElement('div');
  grid.className = 'cards-grid';
  unlocked.forEach(card => grid.appendChild(makeCard(card, true)));
  locked.forEach(card => grid.appendChild(makeCard(card, false)));
  body.appendChild(grid);
}

function makeCard(card, unlocked) {
  const el = document.createElement('div');
  el.className = `expr-card${!unlocked ? ' locked' : ''}`;

  const tag = SCENARIO_LABELS[card.scenarioId] || card.scenarioId;

  if (unlocked) {
    el.innerHTML = `
      <span class="card-scenario-tag">${tag}</span>
      <span class="card-korean">${card.korean}</span>
      <span class="card-romanization">${card.romanization}</span>
      <span class="card-meaning">${card.meaning}</span>
    `;
  } else {
    el.innerHTML = `
      <span class="card-scenario-tag">${tag}</span>
      <span class="card-korean" style="color:var(--color-text-ter)">???</span>
      <span class="card-locked-text">미션 클리어 후 해금</span>
    `;
  }

  return el;
}

function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderCards(btn.dataset.type);
    });
  });
}

SceneManager.on('screenChange', (screenId) => {
  if (screenId === 'screen-cards') renderCards(_currentType);
});

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  console.log('[CardBook] Ready.');
});
