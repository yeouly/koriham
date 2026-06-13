/**
 * ProgressManager — persists and queries player progress via LocalStorage.
 */

const STORAGE_KEY = 'koriham_progress';

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export const ProgressManager = {
  /** Record a scenario clear. */
  recordClear(scenarioId) {
    const state = loadState();
    if (!state[scenarioId]) state[scenarioId] = { clears: 0, cardEarned: false };
    state[scenarioId].clears += 1;
    saveState(state);
    console.log(`[ProgressManager] ${scenarioId} clears: ${state[scenarioId].clears}`);
  },

  /** Get clear count for a scenario. */
  getClears(scenarioId) {
    return loadState()[scenarioId]?.clears || 0;
  },

  /** Mark a card as earned for a scenario. */
  earnCard(scenarioId) {
    const state = loadState();
    if (!state[scenarioId]) state[scenarioId] = { clears: 0, cardEarned: false };
    state[scenarioId].cardEarned = true;
    saveState(state);
  },

  /** Check if card has been earned for a scenario. */
  hasCard(scenarioId) {
    return loadState()[scenarioId]?.cardEarned === true;
  },

  /** Get full state snapshot. */
  getAll() {
    return loadState();
  },

  /** Reset all progress (for dev/debug). */
  reset() {
    localStorage.removeItem(STORAGE_KEY);
    console.log('[ProgressManager] Progress reset.');
  },
};
