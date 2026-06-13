import { ProgressManager } from './ProgressManager.js';

let _allCards = null;

async function loadCardData() {
  if (_allCards) return _allCards;
  const res = await fetch('data/collections/cards.json');
  const json = await res.json();
  _allCards = json.cards;
  return _allCards;
}

export const CardCollection = {
  async getCards() {
    const cards = await loadCardData();
    const progress = ProgressManager.getAll();

    return cards.map(card => ({
      ...card,
      unlocked: (progress[card.scenarioId]?.clears || 0) >= 1,
    }));
  },

  async unlockForScenario(scenarioId) {
    ProgressManager.earnCard(scenarioId);
    console.log(`[CardCollection] Cards unlocked for: ${scenarioId}`);
  },
};
