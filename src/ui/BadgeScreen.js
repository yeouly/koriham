/**
 * BadgeScreen — renders the badge collection with progress indicators.
 */

import { BadgeManager } from '../system/BadgeManager.js';
import { SceneManager } from '../game/SceneManager.js';

async function renderBadges() {
  const grid = document.getElementById('badges-grid');
  if (!grid) return;

  const badges = await BadgeManager.getBadges();
  grid.innerHTML = '';

  badges.forEach(badge => {
    const progress = badge.requiresAll
      ? `${badge.currentClears} / 3 장소 클리어`
      : `${badge.currentClears} / ${badge.requiredClears}번 클리어`;

    const el = document.createElement('div');
    el.className = `badge-item ${badge.earned ? 'earned' : 'locked'}`;
    el.innerHTML = `
      <div class="badge-icon-wrap">${badge.icon}</div>
      <div class="badge-name">${badge.name}</div>
      <div class="badge-desc">${badge.description}</div>
      ${!badge.earned ? `<div class="badge-progress-text">${progress}</div>` : '<div class="badge-progress-text">획득 완료! ✓</div>'}
    `;
    grid.appendChild(el);
  });
}

SceneManager.on('screenChange', (screenId) => {
  if (screenId === 'screen-badges') renderBadges();
});

document.addEventListener('DOMContentLoaded', () => {
  console.log('[BadgeScreen] Ready.');
});
