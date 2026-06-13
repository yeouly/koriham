/**
 * DialogueEngine — renders NPC dialogue and advances step-by-step narrative.
 */

import { AudioManager } from '../system/AudioManager.js';

export class DialogueEngine {
  constructor({ onStepComplete } = {}) {
    this.onStepComplete = onStepComplete || (() => {});
    this._el = {
      speaker: document.getElementById('dialogue-speaker'),
      text:    document.getElementById('dialogue-text'),
      npc:     document.getElementById('scene-npc'),
    };
  }

  /** Display a single dialogue step. */
  showDialogue(step) {
    this._el.speaker.textContent = step.speaker || '';
    this._el.text.textContent = '';
    this._typewrite(step.text);

    if (step.audio) {
      AudioManager.playVoice(step.audio);
    }

    if (step.npc) {
      this._el.npc.textContent = step.npc.emoji || '';
    }
  }

  /** Typewriter effect for dialogue text. */
  _typewrite(text, speed = 40) {
    let i = 0;
    this._el.text.textContent = '';
    const tick = () => {
      if (i < text.length) {
        this._el.text.textContent += text[i++];
        setTimeout(tick, speed);
      } else {
        this.onStepComplete();
      }
    };
    tick();
  }

  /** Skip typewriter and show full text immediately. */
  skipTypewrite(text) {
    this._el.text.textContent = text;
    this.onStepComplete();
  }

  /** Show vocabulary tooltip for a word. */
  showVocabHint(vocabList) {
    // TODO: render floating vocab chips above dialogue box
    console.log('[DialogueEngine] Vocab hints:', vocabList);
  }
}
