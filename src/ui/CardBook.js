/**
 * CardBook — renders the expression card collection grid.
 */

import { CardCollection } from '../system/CardCollection.js';
import { SceneManager }   from '../game/SceneManager.js';

async function renderCards() {
  const grid = document.getElementById('cards-grid');
  if (!grid) return;

  const cards = await CardCollection.getCards();
  grid.innerHTML = '';

  cards.forEach(card => {
    const el = document.createElement('div');
    el.className = `expr-card ${card.unlocked ? '' : 'locked'} ${card.rarity === 'rare' ? 'rare' : ''}`;
    el.innerHTML = card.unlocked ? `
      <div class="card-icon">${card.icon}</div>
      <div class="card-body">
        <span class="card-korean">${card.korean}</span>
        <span class="card-romanization">${card.romanization}</span>
        <span class="card-meaning">${card.meaning}</span>
      </div>
      <span class="card-scenario-tag">${card.scenarioId}</span>
    ` : `
      <div class="card-icon">🔒</div>
      <div class="card-body">
        <span class="card-korean">???</span>
        <span class="card-meaning">미션을 클리어하면 해금!</span>
      </div>
    `;
    grid.appendChild(el);
  });
}

SceneManager.on('screenChange', (screenId) => {
  if (screenId === 'screen-cards') renderCards();
});

document.addEventListener('DOMContentLoaded', () => {
  console.log('[CardBook] Ready.');
});
