/**
 * KoriSpeech — Korean pronunciation practice via Web Speech API.
 */

export class KoriSpeech {
  constructor({ onResult, onError } = {}) {
    this.onResult      = onResult || (() => {});
    this.onError       = onError  || (() => {});
    this._recognition  = null;
    this._isListening  = false;

    const SpeechAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechAPI) {
      console.warn('[KoriSpeech] Web Speech API not available.');
      return;
    }

    this._recognition = new SpeechAPI();
    this._recognition.lang             = 'ko-KR';
    this._recognition.interimResults   = false;
    this._recognition.maxAlternatives  = 3;
    this._recognition.continuous       = false;

    this._recognition.onresult = (e) => {
      this._isListening = false;
      const transcript = e.results[0][0].transcript.trim();
      this.onResult(transcript);
    };

    this._recognition.onerror = (e) => {
      this._isListening = false;
      console.warn('[KoriSpeech] Error:', e.error);
      // not-allowed = microphone denied; no-speech = silence
      if (e.error === 'not-allowed') {
        this.onError('마이크 사용 권한이 필요해요.');
      } else if (e.error === 'no-speech') {
        this.onError('목소리가 들리지 않아요. 다시 해볼까요?');
      } else if (e.error === 'network') {
        this.onError('인터넷 연결이 필요해요. (음성 인식은 온라인에서 동작해요)');
      } else {
        this.onError(`인식 오류: ${e.error}`);
      }
    };

    this._recognition.onend = () => {
      this._isListening = false;
    };
  }

  get isSupported() { return this._recognition !== null; }
  get isListening()  { return this._isListening; }

  start() {
    if (!this._recognition || this._isListening) return;
    this._isListening = true;
    try {
      this._recognition.start();
    } catch (e) {
      this._isListening = false;
      console.warn('[KoriSpeech] start() failed:', e);
    }
  }

  stop() {
    if (!this._recognition || !this._isListening) return;
    try { this._recognition.stop(); } catch (_) {}
    this._isListening = false;
  }

  /** Score 0–100 based on character-level overlap. */
  static compare(spoken, target) {
    const norm = s => s.replace(/[\s.,!?~]/g, '').toLowerCase();
    const a = norm(spoken);
    const b = norm(target);
    if (!a || !b) return 0;
    if (a === b)  return 100;

    let matches = 0;
    for (const ch of a) {
      if (b.includes(ch)) matches++;
    }
    return Math.round((matches / Math.max(a.length, b.length)) * 100);
  }
}
