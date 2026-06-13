/**
 * SceneManager — orchestrates screen transitions and scenario loading.
 * Central hub that other modules communicate through.
 */

import { ProgressManager } from '../system/ProgressManager.js';
import { AudioManager } from '../system/AudioManager.js';

const SCREENS = {
  TITLE:      'screen-title',
  MAP:        'screen-map',
  GAME:       'screen-game',
  RESULT:     'screen-result',
  CARDS:      'screen-cards',
  BADGES:     'screen-badges',
};

class SceneManagerClass {
  constructor() {
    this.currentScreen = null;
    this.currentScenario = null;
    this._listeners = {};
  }

  /** Switch the visible screen. */
  goto(screenId) {
    document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
    const target = document.getElementById(screenId);
    if (target) {
      target.classList.add('active');
      this.currentScreen = screenId;
      this._emit('screenChange', screenId);
    }
  }

  /** Load a scenario JSON and start the game screen. */
  async startScenario(scenarioId) {
    try {
      const res = await fetch(`data/scenarios/${scenarioId}.json`);
      if (!res.ok) throw new Error(`Failed to load scenario: ${scenarioId}`);
      this.currentScenario = await res.json();
      console.log(`[SceneManager] Scenario loaded:`, this.currentScenario.id);
      this._emit('scenarioLoaded', this.currentScenario);
      this.goto(SCREENS.GAME);
    } catch (err) {
      console.error('[SceneManager]', err);
    }
  }

  /** Called when a scenario is fully completed. */
  completeScenario(scenarioId, score) {
    ProgressManager.recordClear(scenarioId);
    this._emit('scenarioComplete', { scenarioId, score });
    this.goto(SCREENS.RESULT);
  }

  /** Simple event bus. */
  on(event, fn) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(fn);
  }

  _emit(event, data) {
    (this._listeners[event] || []).forEach(fn => fn(data));
  }
}

export const SceneManager = new SceneManagerClass();

// ── Wire up title-screen buttons on DOM ready ──
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-start')?.addEventListener('click', () => {
    SceneManager.goto(SCREENS.MAP);
  });

  document.getElementById('btn-collection')?.addEventListener('click', () => {
    SceneManager.goto(SCREENS.CARDS);
  });

  document.getElementById('btn-badges')?.addEventListener('click', () => {
    SceneManager.goto(SCREENS.BADGES);
  });

  // Map header buttons
  document.getElementById('btn-map-home')?.addEventListener('click', () => {
    SceneManager.goto(SCREENS.TITLE);
  });

  document.getElementById('btn-map-cards')?.addEventListener('click', () => {
    SceneManager.goto(SCREENS.CARDS);
  });

  document.getElementById('btn-map-badges')?.addEventListener('click', () => {
    SceneManager.goto(SCREENS.BADGES);
  });

  // Back buttons
  document.getElementById('btn-game-back')?.addEventListener('click', () => {
    SceneManager.goto(SCREENS.MAP);
  });

  document.getElementById('btn-cards-back')?.addEventListener('click', () => {
    SceneManager.goto(SCREENS.MAP);
  });

  document.getElementById('btn-badges-back')?.addEventListener('click', () => {
    SceneManager.goto(SCREENS.MAP);
  });

  console.log('[SceneManager] Ready.');
});
