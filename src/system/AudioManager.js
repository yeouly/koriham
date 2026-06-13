/**
 * AudioManager — handles BGM, SFX, and voice playback.
 */

const DEFAULT_BGM_VOLUME  = 0.35;
const DEFAULT_SFX_VOLUME  = 0.7;
const DEFAULT_VOICE_VOLUME = 0.9;

class AudioManagerClass {
  constructor() {
    this._bgm   = null;
    this._muted = false;
  }

  /** Play background music. Loops automatically. */
  playBGM(src) {
    if (this._bgm) this.stopBGM();
    this._bgm = new Audio(src);
    this._bgm.loop = true;
    this._bgm.volume = DEFAULT_BGM_VOLUME;
    if (!this._muted) this._bgm.play().catch(() => {});
  }

  stopBGM() {
    if (!this._bgm) return;
    this._bgm.pause();
    this._bgm.currentTime = 0;
    this._bgm = null;
  }

  /** Play a one-shot SFX. */
  playSFX(src) {
    if (this._muted) return;
    const sfx = new Audio(src);
    sfx.volume = DEFAULT_SFX_VOLUME;
    sfx.play().catch(() => {});
  }

  /** Play NPC voice line. */
  playVoice(src) {
    if (this._muted) return;
    const voice = new Audio(src);
    voice.volume = DEFAULT_VOICE_VOLUME;
    voice.play().catch(() => {});
  }

  /** Toggle global mute. */
  toggleMute() {
    this._muted = !this._muted;
    if (this._bgm) {
      if (this._muted) this._bgm.pause();
      else this._bgm.play().catch(() => {});
    }
    return this._muted;
  }

  get isMuted() {
    return this._muted;
  }
}

export const AudioManager = new AudioManagerClass();
