/**
 * DialogueEngine — renders NPC dialogue with typewriter effect.
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
    this._timer = null;
  }

  /** Display dialogue from the new scene format. */
  showDialogueRaw(speakerName, text) {
    this._el.speaker.textContent = speakerName || '';
    this._typewrite(text);
  }

  /** Display a single dialogue step (legacy format support). */
  showDialogue(step) {
    this._el.speaker.textContent = step.speaker || '';
    this._typewrite(step.text);
    if (step.audio) AudioManager.playVoice(step.audio);
    if (step.npc)   this._el.npc.textContent = step.npc.emoji || '';
  }

  _typewrite(text, speed = 40) {
    if (this._timer) clearTimeout(this._timer);
    let i = 0;
    this._el.text.textContent = '';

    const tick = () => {
      if (i < text.length) {
        this._el.text.textContent += text[i++];
        this._timer = setTimeout(tick, speed);
      } else {
        this._timer = null;
        this.onStepComplete();
      }
    };
    tick();
  }

  skipTypewrite(text) {
    if (this._timer) clearTimeout(this._timer);
    this._el.text.textContent = text;
    this.onStepComplete();
  }
}
