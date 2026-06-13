import { SceneManager }   from '../game/SceneManager.js';
import { ProgressManager } from '../system/ProgressManager.js';
import { AudioManager }   from '../system/AudioManager.js';

const SCENARIOS = [
  { id: 'CVS_001',        label: '편의점', sub: '편의점에서 물건 사기', diff: '입문', icon: 'assets/images/scenes/cvs_scene.jpeg' },
  { id: 'RESTAURANT_001', label: '식당',   sub: '식당에서 밥 먹기',     diff: '초급', icon: 'assets/images/scenes/restaurant_scene.jpeg' },
  { id: 'SUBWAY_001',     label: '지하철', sub: '지하철 타기',           diff: '초급', icon: 'assets/images/characters/subway_koriham.jpeg' },
];

const MOTIVATIONS = [
  "오늘도 잘하고 있어요! 계속 배우면 금방 유창해져요.",
  "한 문장씩 배우다 보면 어느새 대화가 돼요!",
  "꾸준함이 최고의 공부법이에요. 잘하고 있어요!",
  "매일 조금씩 쌓이면 나중에 큰 실력이 돼요!",
  "포기하지 마세요, 코리햄이 응원하고 있어요!",
];

const NAV_SCREENS = new Set(['screen-home', 'screen-cards', 'screen-mypage']);
const BGM_SRC = 'assets/audio/bgm/afternoon_porch.mp3';

function enterScenario(scenarioId) {
  AudioManager.playBGM(BGM_SRC);
  SceneManager.startScenario(scenarioId);
}

function renderMissions() {
  const container = document.getElementById('home-missions');
  if (!container) return;
  container.innerHTML = '';
  const progress = ProgressManager.getAll();

  SCENARIOS.forEach(s => {
    const clears  = progress[s.id]?.clears || 0;
    const cleared = clears >= 1;

    const card = document.createElement('div');
    card.className = `mission-card${cleared ? ' cleared' : ''}`;
    card.innerHTML = `
      <div class="mission-icon-box${cleared ? ' done' : ''}">
        <img class="mission-icon-img" src="${s.icon}" alt="${s.label}">
      </div>
      <div class="mission-info">
        <div class="mission-name">${s.label}</div>
        <div class="mission-sub">
          <span class="mission-diff-chip">${s.diff}</span>
          ${cleared
            ? `<span class="mission-status-chip done">${clears}회 완료</span>`
            : `<span class="mission-status-chip pending">도전</span>`}
        </div>
      </div>
      <button class="btn-mission-enter">${cleared ? '재도전' : '시작'}</button>
    `;
    card.querySelector('.btn-mission-enter').addEventListener('click', (e) => { e.stopPropagation(); enterScenario(s.id); });
    card.addEventListener('click', () => enterScenario(s.id));
    container.appendChild(card);
  });
}

function updateNav(screenId) {
  const nav = document.getElementById('global-bottom-nav');
  if (!nav) return;
  if (NAV_SCREENS.has(screenId)) {
    nav.classList.remove('hidden');
    nav.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.screen === screenId);
    });
  } else {
    nav.classList.add('hidden');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Hero button
  document.getElementById('btn-hero-start')?.addEventListener('click', () => {
    const progress = ProgressManager.getAll();
    const first = SCENARIOS.find(s => !(progress[s.id]?.clears >= 1)) || SCENARIOS[0];
    enterScenario(first.id);
  });

  // Bottom nav
  document.getElementById('nav-home')?.addEventListener('click', () => SceneManager.goto('screen-home'));
  document.getElementById('nav-cards')?.addEventListener('click', () => SceneManager.goto('screen-cards'));
  document.getElementById('nav-mypage')?.addEventListener('click', () => SceneManager.goto('screen-mypage'));

  // Bell notification — all screens
  let toastTimer = null;
  const showToast = () => {
    const toast = document.getElementById('motivational-toast');
    if (!toast) return;
    const msg = MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)];
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
  };
  document.querySelectorAll('.btn-bell').forEach(btn => {
    btn.addEventListener('click', showToast);
  });

  SceneManager.on('screenChange', id => {
    updateNav(id);
    if (id === 'screen-home') renderMissions();
  });

  renderMissions();
  console.log('[HomeScreen] Ready.');
});
