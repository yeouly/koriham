/**
 * MapScreen — renders the neighbourhood map with buildings and clear status.
 */

import { ProgressManager } from '../system/ProgressManager.js';
import { SceneManager } from '../game/SceneManager.js';

const BUILDINGS = [
  { id: 'CVS_001',        label: '편의점',   emoji: '🏪', x: '15%', y: '25%' },
  { id: 'SUBWAY_001',     label: '지하철역', emoji: '🚇', x: '55%', y: '15%' },
  { id: 'RESTAURANT_001', label: '식당',     emoji: '🍜', x: '35%', y: '55%' },
];

function renderMap() {
  const container = document.getElementById('map-container');
  if (!container) return;

  container.innerHTML = '';
  const progress = ProgressManager.getAll();

  BUILDINGS.forEach(building => {
    const clears  = progress[building.id]?.clears || 0;
    const cleared = clears >= 1;

    const el = document.createElement('div');
    el.className = `map-building ${cleared ? 'cleared' : ''}`;
    el.style.left = building.x;
    el.style.top  = building.y;
    el.innerHTML = `
      <div class="building-icon">${building.emoji}</div>
      <div class="building-name">${building.label}</div>
      <div class="building-status">${cleared ? `${clears}번 클리어 ✓` : '도전해보세요!'}</div>
    `;

    el.addEventListener('click', () => {
      SceneManager.startScenario(building.id);
    });

    container.appendChild(el);
  });
}

// Re-render whenever map screen becomes active
SceneManager.on('screenChange', (screenId) => {
  if (screenId === 'screen-map') renderMap();
});

document.addEventListener('DOMContentLoaded', () => {
  console.log('[MapScreen] Ready.');
});
