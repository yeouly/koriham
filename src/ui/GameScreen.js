import { SceneManager }   from '../game/SceneManager.js';
import { DialogueEngine } from '../game/DialogueEngine.js';
import { ChoiceHandler }  from '../game/ChoiceHandler.js';
import { CardCollection } from '../system/CardCollection.js';

const SCENARIO_ASSETS = {
  CVS_001: {
    scene: 'assets/images/scenes/cvs_scene.jpeg',
  },
  RESTAURANT_001: {
    scene: 'assets/images/scenes/restaurant_scene.jpeg',
  },
  SUBWAY_001: {
    scene: 'assets/images/characters/subway_koriham.jpeg',
  },
};

class GameScreenClass {
  constructor() {
    this._scenario     = null;
    this._sceneMap     = {};
    this._currentScene = null;
    this._sceneCount   = 0;
    this._sceneIndex   = 0;
    this._correctCount = 0;

    this._dialogue = new DialogueEngine({ onStepComplete: () => {} });
    this._choices  = new ChoiceHandler({ onAnswer: (r) => this._onAnswer(r) });

    this._elTitle    = document.getElementById('game-scenario-title');
    this._elProgress = document.getElementById('game-progress');
    this._elEnglish  = document.getElementById('dialogue-english');
    this._elWrap     = document.getElementById('game-scene-wrap');

    SceneManager.on('scenarioLoaded', (scenario) => this._startScenario(scenario));
  }

  _startScenario(scenario) {
    this._scenario     = scenario;
    this._sceneMap     = {};
    this._correctCount = 0;

    const scenes = scenario.scenes || [];
    this._sceneCount = scenes.length;
    scenes.forEach(s => { this._sceneMap[s.scene_id] = s; });

    this._elTitle.textContent = scenario.scenario_title || scenario.title || '';

    const id     = scenario.scenario_id || scenario.id;
    const assets = SCENARIO_ASSETS[id] || {};
    this._buildSceneWrap(assets);

    this._showScene(scenes[0]?.scene_id);
  }

  _buildSceneWrap(assets) {
    this._elWrap.innerHTML = '';
    this._elWrap.style.height = '';

    if (assets.scene) {
      const img = document.createElement('img');
      img.className = 'game-scene-img';
      img.src = assets.scene;
      this._elWrap.appendChild(img);
    } else {
      this._elWrap.style.height = '400px';

      const bg = document.createElement('div');
      bg.className = 'game-bg';
      if (assets.background) bg.style.backgroundImage = `url('${assets.background}')`;
      this._elWrap.appendChild(bg);

      const stage = document.createElement('div');
      stage.className = 'game-stage';

      if (assets.character) {
        const img = document.createElement('img');
        img.className = 'stage-character';
        img.src = assets.character;
        stage.appendChild(img);
      }
      this._elWrap.appendChild(stage);
    }
  }

  _showScene(sceneId) {
    if (!sceneId || sceneId === 'end') { this._endScenario(); return; }

    const scene = this._sceneMap[sceneId];
    if (!scene) { this._endScenario(); return; }

    this._currentScene = scene;
    this._sceneIndex   = Object.keys(this._sceneMap).indexOf(sceneId);
    this._updateProgress();

    this._dialogue.showDialogueRaw(scene.npc_name, scene.npc_dialogue);
    this._elEnglish.textContent = scene.npc_dialogue_english || '';

    this._choices.renderSceneOptions(scene);
  }

  _onAnswer({ isCorrect, scene }) {
    if (isCorrect) {
      this._correctCount += 1;
    } else if (scene.next_scene_wrong !== 'hint_and_retry') {
      setTimeout(() => this._showScene(scene.next_scene_wrong), 100);
    }
  }

  onSceneAdvance(sceneId) {
    this._showScene(sceneId);
  }

  _updateProgress() {
    this._elProgress.textContent = `${this._sceneIndex + 1} / ${this._sceneCount}`;
  }

  async _endScenario() {
    const id = this._scenario?.scenario_id || this._scenario?.id;
    if (id) await CardCollection.unlockForScenario(id);
    SceneManager.completeScenario(id, { correct: this._correctCount, total: this._sceneCount });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const gs = new GameScreenClass();
  window._gameScreen = gs;
  console.log('[GameScreen] Ready.');
});
