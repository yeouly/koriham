/**
 * GameScreen — drives the gameplay loop using DialogueEngine, ChoiceHandler,
 * and KoriSpeech. Wired to SceneManager's scenarioLoaded event.
 */

import { SceneManager }   from '../game/SceneManager.js';
import { DialogueEngine } from '../game/DialogueEngine.js';
import { ChoiceHandler }  from '../game/ChoiceHandler.js';
import { KoriSpeech }     from '../game/SpeechRecognition.js';
import { CardCollection } from '../system/CardCollection.js';

class GameScreenClass {
  constructor() {
    this._scenario  = null;
    this._stepIndex = 0;
    this._score     = { correct: 0, total: 0 };

    this._dialogue = new DialogueEngine({
      onStepComplete: () => this._onDialogueComplete(),
    });

    this._choices = new ChoiceHandler({
      onAnswer: ({ isCorrect }) => this._onAnswer(isCorrect),
    });

    this._speech = new KoriSpeech({
      onResult: (transcript) => this._onSpeechResult(transcript),
      onError:  (err)        => console.warn('[Speech]', err),
    });

    this._elTitle    = document.getElementById('game-scenario-title');
    this._elProgress = document.getElementById('game-progress');
    this._elSpeech   = document.getElementById('speech-panel');
    this._btnSpeech  = document.getElementById('btn-speech');
    this._elSpeechResult = document.getElementById('speech-result');

    this._btnSpeech?.addEventListener('click', () => this._toggleSpeech());

    SceneManager.on('scenarioLoaded', (scenario) => this._startScenario(scenario));
  }

  _startScenario(scenario) {
    this._scenario  = scenario;
    this._stepIndex = 0;
    this._score     = { correct: 0, total: 0 };

    this._elTitle.textContent = scenario.title;
    this._updateProgress();
    this._playStep();
  }

  _playStep() {
    const step = this._scenario.steps[this._stepIndex];
    if (!step) { this._endScenario(); return; }

    this._updateProgress();

    const npcInfo = this._scenario.npc;
    document.getElementById('scene-npc').textContent = npcInfo?.emoji || '';

    if (step.type === 'dialogue') {
      this._choices.clearChoices();
      this._elSpeech.style.display = 'none';
      this._dialogue.showDialogue({ ...step, npc: npcInfo });

    } else if (step.type === 'choice') {
      this._score.total += 1;
      this._dialogue.showDialogue({ ...step, npc: npcInfo });
      this._choices.renderChoices(step);

    } else if (step.type === 'speech') {
      this._choices.clearChoices();
      this._dialogue.showDialogue({ ...step, npc: npcInfo });
      this._elSpeech.style.display = 'flex';
      this._elSpeechResult.textContent = step.instruction || 'Try speaking!';
      this._currentSpeechStep = step;
    }
  }

  _onDialogueComplete() {
    const step = this._scenario?.steps[this._stepIndex];
    if (!step) return;
    if (step.type === 'dialogue') {
      // Auto-advance after short delay for plain dialogue
      setTimeout(() => this._advance(), step.isEnd ? 1200 : 800);
    }
  }

  _onAnswer(isCorrect) {
    if (isCorrect) this._score.correct += 1;
    // ChoiceHandler shows feedback; user clicks "다음" to advance
    // We listen for feedback dismiss via the feedback-next button indirectly
    // by having ChoiceHandler's clearChoices trigger this advance
    setTimeout(() => this._advance(), 100);
  }

  _toggleSpeech() {
    if (!this._speech.isSupported) {
      this._elSpeechResult.textContent = '이 브라우저는 음성 인식을 지원하지 않아요.';
      return;
    }
    this._btnSpeech.classList.toggle('listening');
    if (this._btnSpeech.classList.contains('listening')) {
      this._speech.start();
      this._elSpeechResult.textContent = '듣고 있어요… 🎙️';
    } else {
      this._speech.stop();
    }
  }

  _onSpeechResult(transcript) {
    this._btnSpeech.classList.remove('listening');
    const target = this._currentSpeechStep?.prompt || '';
    const score  = KoriSpeech.compare(transcript, target);

    this._elSpeechResult.textContent =
      score >= 70
        ? `"${transcript}" — 잘했어요! (${score}점) 🎉`
        : `"${transcript}" — 다시 한번 해볼까요? (${score}점)`;

    if (score >= 70) {
      setTimeout(() => { this._elSpeech.style.display = 'none'; this._advance(); }, 1500);
    }
  }

  _advance() {
    this._stepIndex += 1;
    this._playStep();
  }

  _updateProgress() {
    const total = this._scenario?.steps.length || 0;
    this._elProgress.textContent = `${this._stepIndex + 1} / ${total}`;
  }

  async _endScenario() {
    await CardCollection.unlockForScenario(this._scenario.id);
    SceneManager.completeScenario(this._scenario.id, this._score);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new GameScreenClass();
  console.log('[GameScreen] Ready.');
});
