import { KoriSpeech } from './SpeechRecognition.js';

export class ChoiceHandler {
  constructor({ onAnswer } = {}) {
    this.onAnswer   = onAnswer || (() => {});
    this._container = document.getElementById('choices-container');
    this._overlay   = document.getElementById('feedback-overlay');
    this._fbContent = document.getElementById('feedback-content');
    this._fbActions = document.getElementById('feedback-actions');
    this._scene     = null;
    this._speech    = new KoriSpeech({
      onResult: (t) => this._onSpeechResult(t),
      onError:  ()  => this._onSpeechError(),
    });
  }

  renderSceneOptions(scene) {
    this._scene = scene;
    this._container.innerHTML = '';
    this._container.style.display = 'flex';
    this._overlay.style.display = 'none';

    scene.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.innerHTML = `<span class="choice-letter">${opt.id}</span>${opt.text}`;
      btn.addEventListener('click', () => this._handleAnswer(opt, scene));
      this._container.appendChild(btn);
    });
  }

  clearChoices() {
    this._container.innerHTML = '';
    this._container.style.display = 'none';
  }

  _handleAnswer(chosen, scene) {
    const isCorrect = chosen.id === scene.correct_option;

    const btns = [...this._container.querySelectorAll('.choice-btn')];
    btns.forEach((btn, i) => {
      btn.disabled = true;
      const id = scene.options[i]?.id;
      if (id === chosen.id)                btn.classList.add(isCorrect ? 'correct' : 'wrong');
      if (!isCorrect && id === scene.correct_option) btn.classList.add('correct');
    });

    if (isCorrect) this._showCorrect(scene);
    else           this._showWrong(scene, chosen);

    this.onAnswer({ isCorrect, scene });
  }

  _showCorrect(scene) {
    const vp = scene.vocab_point;
    const correctText = scene.options.find(o => o.id === scene.correct_option)?.text || '';
    const audioSrc = `assets/audio/voices/${scene.scene_id.split('_').slice(0,2).join('_')}/${scene.scene_id}.mp3`;

    const wvBars = Array.from({length: 11}, () => '<span class="wv-bar"></span>').join('');

    this._fbContent.className = 'feedback-content correct';
    this._fbContent.innerHTML = `
      <p class="feedback-msg">정답!</p>
      <p class="feedback-explanation">${scene.feedback_correct}</p>
      <div class="listen-repeat-panel" id="lr-panel">
        <div class="listen-repeat-title">듣고 따라해보세요</div>
        <div class="audio-waveform" id="audio-waveform">${wvBars}</div>
        <div class="listen-answer-text">${correctText}</div>
        <div class="listen-repeat-btns">
          <button class="btn-listen" id="btn-listen" data-src="${audioSrc}">듣기</button>
          <button class="btn-repeat" id="btn-repeat">따라하기</button>
        </div>
        <div class="repeat-result" id="repeat-result"></div>
      </div>
    `;

    this._fbActions.innerHTML = '';
    const btnNext = this._makeBtn('다음', 'btn btn-primary', () => {
      this._overlay.style.display = 'none';
      this.clearChoices();
      if (window._gameScreen) window._gameScreen.onSceneAdvance(scene.next_scene_correct);
    });
    this._fbActions.appendChild(btnNext);
    this._overlay.style.display = 'flex';

    const btnListen = document.getElementById('btn-listen');
    const waveform  = document.getElementById('audio-waveform');
    const audio = new Audio(audioSrc);

    const startWave = () => waveform?.classList.add('playing');
    const stopWave  = () => waveform?.classList.remove('playing');

    audio.addEventListener('play',  startWave);
    audio.addEventListener('pause', stopWave);
    audio.addEventListener('ended', stopWave);
    audio.addEventListener('error', () => {
      btnListen.textContent = '준비 중';
      btnListen.classList.add('disabled');
    });

    btnListen.addEventListener('click', () => {
      if (btnListen.classList.contains('disabled')) return;
      audio.currentTime = 0;
      audio.play().catch(() => {});
    });

    const btnRepeat = document.getElementById('btn-repeat');
    const elResult  = document.getElementById('repeat-result');
    this._activeRepeatBtn    = btnRepeat;
    this._activeRepeatResult = elResult;
    this._repeatTarget       = correctText;

    btnRepeat.addEventListener('click', () => this._toggleRepeat(btnRepeat, elResult));
  }

  _showWrong(scene, chosen) {
    const englishFeedback = scene.wrong_feedback_english?.[chosen?.id];
    this._fbContent.className = 'feedback-content wrong';
    this._fbContent.innerHTML = `
      <p class="feedback-msg">아쉬워요</p>
      ${englishFeedback ? `<p class="feedback-english">${englishFeedback}</p>` : ''}
      <div class="hint-box">
        <span class="hint-label">힌트</span>
        <span class="hint-text">${scene.hint}</span>
      </div>
    `;

    this._fbActions.innerHTML = '';
    const btnRetry = this._makeBtn('다시 해볼게요', 'btn btn-primary', () => {
      this._overlay.style.display = 'none';
      this.renderSceneOptions(scene);
    });
    this._fbActions.appendChild(btnRetry);
    this._overlay.style.display = 'flex';
  }

  _toggleRepeat(btn, elResult) {
    if (btn.classList.contains('listening')) {
      this._speech.stop();
      btn.classList.remove('listening');
      btn.textContent = '따라하기';
      return;
    }
    if (!this._speech.isSupported) {
      elResult.textContent = '이 환경에서는 음성 인식을 지원하지 않아요.';
      return;
    }
    btn.classList.add('listening');
    btn.textContent = '듣는 중...';
    elResult.textContent = '';
    this._speech.start();
  }

  _onSpeechResult(transcript) {
    if (this._activeRepeatBtn) {
      this._activeRepeatBtn.classList.remove('listening');
      this._activeRepeatBtn.textContent = '따라하기';
    }
    if (this._activeRepeatResult && this._repeatTarget) {
      const score = KoriSpeech.compare(transcript, this._repeatTarget);
      if (score >= 80) {
        this._activeRepeatResult.textContent = `"${transcript}" — 완벽해요! (${score}점)`;
      } else if (score >= 55) {
        this._activeRepeatResult.textContent = `"${transcript}" — 좋아요! (${score}점)`;
      } else {
        this._activeRepeatResult.textContent = `"${transcript}" — 한 번 더 해볼까요? (${score}점)`;
      }
    }
  }

  _onSpeechError() {
    if (this._activeRepeatBtn) {
      this._activeRepeatBtn.classList.remove('listening');
      this._activeRepeatBtn.textContent = '따라하기';
    }
    if (this._activeRepeatResult) {
      this._activeRepeatResult.textContent = '인식 오류 — 다시 시도해보세요.';
    }
  }

  _makeBtn(label, cls, onClick) {
    const btn = document.createElement('button');
    btn.className = cls;
    btn.textContent = label;
    btn.addEventListener('click', onClick);
    return btn;
  }
}
