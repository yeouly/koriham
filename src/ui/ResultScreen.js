/**
 * ResultScreen — shows score, newly earned card, and badges after a scenario.
 */

import { SceneManager }  from '../game/SceneManager.js';
import { BadgeManager }  from '../system/BadgeManager.js';
import { CardCollection } from '../system/CardCollection.js';

SceneManager.on('scenarioComplete', async ({ scenarioId, score }) => {
  const container = document.getElementById('result-content');
  if (!container) return;

  const pct = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 100;
  const emoji = pct >= 80 ? '🎉' : pct >= 50 ? '😊' : '😅';

  // Check for new card
  const cards = await CardCollection.getCards();
  const newCard = cards.find(c => c.scenarioId === scenarioId && c.unlocked);

  // Check for badges earned
  const newBadges = await BadgeManager.checkNewBadges(scenarioId);

  container.innerHTML = `
    <div class="result-hero">
      <span class="result-emoji">${emoji}</span>
      <h2 class="result-title">미션 클리어!</h2>
      <p class="result-score">${score.correct} / ${score.total} 정답 (${pct}점)</p>
    </div>

    ${newCard ? `
    <div class="result-card-earned">
      <p class="result-section-label">📖 표현 카드 획득!</p>
      <div class="result-card-preview">
        <span>${newCard.icon}</span>
        <span class="card-korean">${newCard.korean}</span>
        <span class="card-meaning">${newCard.meaning}</span>
      </div>
    </div>` : ''}

    ${newBadges.length > 0 ? `
    <div class="result-badges-earned">
      <p class="result-section-label">🏅 뱃지 획득!</p>
      <div class="result-badges-list">
        ${newBadges.map(b => `
          <div class="result-badge">
            <span>${b.icon}</span>
            <span>${b.name}</span>
          </div>
        `).join('')}
      </div>
    </div>` : ''}

    <div class="result-actions">
      <button class="btn btn-primary" id="btn-result-map">지도로 돌아가기 🗺️</button>
      <button class="btn btn-secondary" id="btn-result-retry">다시 도전 🔄</button>
    </div>
  `;

  document.getElementById('btn-result-map')?.addEventListener('click', () => {
    SceneManager.goto('screen-map');
  });

  document.getElementById('btn-result-retry')?.addEventListener('click', () => {
    SceneManager.startScenario(scenarioId);
  });
});

document.addEventListener('DOMContentLoaded', () => {
  console.log('[ResultScreen] Ready.');
});
