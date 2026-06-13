/**
 * ChoiceHandler — renders multiple-choice options and processes answers.
 */

export class ChoiceHandler {
  constructor({ onAnswer } = {}) {
    this.onAnswer = onAnswer || (() => {});
    this._container = document.getElementById('choices-container');
    this._feedback  = document.getElementById('feedback-overlay');
    this._feedbackContent = document.getElementById('feedback-content');
    this._btnNext   = document.getElementById('btn-feedback-next');
  }

  /** Render 3 choice buttons for a choice-type step. */
  renderChoices(step) {
    this._container.innerHTML = '';
    this._container.style.display = 'flex';

    step.choices.forEach((choice, idx) => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.innerHTML = `<span class="choice-number">${idx + 1}</span>${choice.text}`;
      btn.addEventListener('click', () => this._handleAnswer(choice, btn, step.choices));
      this._container.appendChild(btn);
    });
  }

  /** Hide the choices container. */
  clearChoices() {
    this._container.innerHTML = '';
    this._container.style.display = 'none';
  }

  _handleAnswer(choice, btn, allChoices) {
    // Disable all buttons
    this._container.querySelectorAll('.choice-btn').forEach(b => {
      b.disabled = true;
    });

    // Highlight correct / wrong
    btn.classList.add(choice.isCorrect ? 'correct' : 'wrong');

    if (!choice.isCorrect) {
      const correctBtn = [...this._container.querySelectorAll('.choice-btn')]
        .find((b, i) => allChoices[i]?.isCorrect);
      if (correctBtn) correctBtn.classList.add('correct');
    }

    this._showFeedback(choice);
    this.onAnswer({ choice, isCorrect: choice.isCorrect });
  }

  _showFeedback(choice) {
    const isCorrect = choice.isCorrect;
    this._feedbackContent.className = `feedback-content ${isCorrect ? 'correct' : 'wrong'}`;
    this._feedbackContent.innerHTML = `
      <span class="feedback-emoji">${isCorrect ? '🎉' : '😅'}</span>
      <p class="feedback-msg">${isCorrect ? '정답!' : '아쉬워요~'}</p>
      <p class="feedback-explanation">${choice.feedback}</p>
    `;
    this._feedback.style.display = 'flex';

    const onNext = () => {
      this._feedback.style.display = 'none';
      this._btnNext.removeEventListener('click', onNext);
      this.clearChoices();
    };
    this._btnNext.addEventListener('click', onNext);
  }
}
