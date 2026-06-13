/**
 * SceneManager — orchestrates screen transitions and scenario loading.
 */

import { ProgressManager } from '../system/ProgressManager.js';

const SCREENS = {
  HOME:   'screen-home',
  GAME:   'screen-game',
  RESULT: 'screen-result',
  CARDS:  'screen-cards',
  MYPAGE: 'screen-mypage',
};

class SceneManagerClass {
  constructor() {
    this.currentScreen   = null;
    this.currentScenario = null;
    this._listeners      = {};
  }

  goto(screenId) {
    document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
    const target = document.getElementById(screenId);
    if (target) {
      target.classList.add('active');
      this.currentScreen = screenId;
      this._emit('screenChange', screenId);
    }
  }

  async startScenario(scenarioId) {
    try {
      const res = await fetch(`data/scenarios/${scenarioId}.json`);
      if (!res.ok) throw new Error(`Failed to load: ${scenarioId}`);
      this.currentScenario = await res.json();
      this._emit('scenarioLoaded', this.currentScenario);
      this.goto(SCREENS.GAME);
    } catch (err) {
      console.error('[SceneManager]', err);
    }
  }

  completeScenario(scenarioId, score) {
    ProgressManager.recordClear(scenarioId);
    this._emit('scenarioComplete', { scenarioId, score });
    this.goto(SCREENS.RESULT);
  }

  on(event, fn) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(fn);
  }

  _emit(event, data) {
    (this._listeners[event] || []).forEach(fn => fn(data));
  }
}

export const SceneManager = new SceneManagerClass();

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-game-back')?.addEventListener('click', () => {
    SceneManager.goto(SCREENS.HOME);
  });

  console.log('[SceneManager] Ready.');
});
