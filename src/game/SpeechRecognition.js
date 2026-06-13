/**
 * SpeechRecognition — wraps Web Speech API for Korean pronunciation practice.
 * Compares user's spoken text against a target string.
 */

export class KoriSpeech {
  constructor({ onResult, onError } = {}) {
    this.onResult = onResult || (() => {});
    this.onError  = onError  || (() => {});
    this._recognition = null;
    this._isListening = false;

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('[SpeechRecognition] Web Speech API not supported in this browser.');
      return;
    }

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    this._recognition = new SpeechRecognitionAPI();
    this._recognition.lang = 'ko-KR';
    this._recognition.interimResults = false;
    this._recognition.maxAlternatives = 3;

    this._recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript.trim();
      this.onResult(transcript);
    };

    this._recognition.onerror = (e) => {
      this.onError(e.error);
      this._isListening = false;
    };

    this._recognition.onend = () => {
      this._isListening = false;
    };
  }

  get isSupported() {
    return this._recognition !== null;
  }

  /** Start listening. */
  start() {
    if (!this._recognition || this._isListening) return;
    this._isListening = true;
    this._recognition.start();
  }

  /** Stop listening. */
  stop() {
    if (!this._recognition || !this._isListening) return;
    this._recognition.stop();
    this._isListening = false;
  }

  /**
   * Compare user's transcript to target string.
   * Returns a score 0–100 based on character overlap.
   */
  static compare(spoken, target) {
    const normalize = str => str.replace(/\s/g, '').toLowerCase();
    const a = normalize(spoken);
    const b = normalize(target);
    if (a === b) return 100;

    let matches = 0;
    for (const char of a) {
      if (b.includes(char)) matches++;
    }
    return Math.round((matches / Math.max(a.length, b.length)) * 100);
  }
}
