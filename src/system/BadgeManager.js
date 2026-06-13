/**
 * BadgeManager — evaluates badge unlock conditions.
 */

import { ProgressManager } from './ProgressManager.js';

let _allBadges = null;

async function loadBadgeData() {
  if (_allBadges) return _allBadges;
  const res = await fetch('data/collections/badges.json');
  const json = await res.json();
  _allBadges = json.badges;
  return _allBadges;
}

export const BadgeManager = {
  /** Get all badges with earned state and progress merged in. */
  async getBadges() {
    const badges = await loadBadgeData();
    const progress = ProgressManager.getAll();
    const allScenarioIds = ['CVS_001', 'SUBWAY_001', 'RESTAURANT_001'];

    return badges.map(badge => {
      let clears = 0;
      let earned = false;

      if (badge.requiresAll) {
        // Requires at least 1 clear in ALL scenarios
        const allCleared = allScenarioIds.every(id => (progress[id]?.clears || 0) >= 1);
        earned = allCleared;
        clears = allScenarioIds.filter(id => (progress[id]?.clears || 0) >= 1).length;
      } else {
        clears = progress[badge.scenarioId]?.clears || 0;
        earned = clears >= badge.requiredClears;
      }

      return { ...badge, earned, currentClears: clears };
    });
  },

  /** Check and return newly earned badges after a scenario clear. */
  async checkNewBadges(scenarioId) {
    const badges = await this.getBadges();
    return badges.filter(b => b.earned && (b.scenarioId === scenarioId || b.requiresAll));
  },
};
