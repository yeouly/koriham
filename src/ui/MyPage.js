import { SceneManager }   from '../game/SceneManager.js';
import { ProgressManager } from '../system/ProgressManager.js';
import { BadgeManager }   from '../system/BadgeManager.js';

const KORIHAM_MESSAGES = [
  "오늘도 같이 배워서 너무 좋아요!",
  "이렇게 열심히 하다니 정말 대단해요!",
  "한국어 마스터가 될 거예요, 믿어요!",
  "꾸준히 하고 있어서 코리햄도 너무 기뻐요!",
  "포기하지 마세요, 잘하고 있어요!",
];

const WEEK_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

function getTotalClears() {
  const progress = ProgressManager.getAll();
  return Object.values(progress).reduce((sum, p) => sum + (p.clears || 0), 0);
}

function getWeekDays() {
  const today = new Date().getDay();
  return WEEK_LABELS.map((label, i) => ({
    label,
    done: i === today || i === (today - 1 + 7) % 7,
    today: i === today,
  }));
}

async function renderMyPage() {
  const container = document.getElementById('mypage-content');
  if (!container) return;

  const total    = getTotalClears();
  const streak   = Math.max(1, total);
  const weekDays = getWeekDays();
  const badges   = await BadgeManager.getBadges();
  const koriMsg  = KORIHAM_MESSAGES[total % KORIHAM_MESSAGES.length];

  const weekHTML = weekDays.map(d => `
    <div class="week-day${d.done ? ' done' : ''}${d.today ? ' today' : ''}">
      <div class="week-circle">${d.done ? '✓' : ''}</div>
      <span class="week-label">${d.label}</span>
    </div>
  `).join('');

  const badgesHTML = badges.map(badge => {
    const prog = badge.requiresAll
      ? `${badge.currentClears} / 3 장소 클리어`
      : `${badge.currentClears} / ${badge.requiredClears}번 클리어`;
    return `
      <div class="badge-item ${badge.earned ? 'earned' : 'locked'}">
        <div class="badge-icon-wrap">${badge.icon}</div>
        <div class="badge-name">${badge.name}</div>
        <div class="badge-desc">${badge.description}</div>
        <div class="badge-progress-text">${badge.earned ? '획득 완료' : prog}</div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="streak-card">
      <div class="streak-top">
        <img src="assets/images/icon_star.png" class="streak-icon" alt="">
        <span class="streak-count">${streak}</span>
      </div>
      <p class="streak-msg">꾸준히 배우고 있어요!</p>
      <div class="week-tracker">${weekHTML}</div>
    </div>

    <div class="koriham-chat-card">
      <img class="koriham-avatar" src="assets/images/characters/koriham.jpeg" alt="코리햄">
      <div class="koriham-bubble">${koriMsg}</div>
    </div>

    <div class="mypage-section-label">획득한 뱃지</div>
    <div class="mypage-badges-grid">${badgesHTML}</div>
  `;
}

SceneManager.on('screenChange', (screenId) => {
  if (screenId === 'screen-mypage') renderMyPage();
});

document.addEventListener('DOMContentLoaded', () => {
  console.log('[MyPage] Ready.');
});
