import './ui/style.css';
import { DOMAINS } from './data/domains.js';
import { TarotState } from './state/tarot-state.js';
import { TarotScene } from './scene/TarotScene.js';
import { createUI } from './ui/ui.js';
import { pause } from './animation/tween.js';
import { track } from './analytics/analytics.js';

const root = document.querySelector('#app');
let state;
let scene;
let busy = false;

const ui = createUI(root, {
  start: () => startReading(),
  previous: () => scene?.nudgeFan(-1),
  next: () => scene?.nudgeFan(1),
  'draw-current': () => drawCard(scene?.currentDrawCard()),
  'read-result': (index) => openReading(Number(index)),
  reset: () => resetReading(),
  'close-reading': () => closeReading()
});

scene = new TarotScene(ui.sceneHost, null, {
  onDraw: (selectedCard) => drawCard(selectedCard),
  onReading: (index) => openReading(index)
});

await scene.init();
ui.showHome();

async function ensureState() {
  if (!state) {
    const { TAROT_CARDS } = await import('./data/cards.js');
    state = new TarotState(TAROT_CARDS);
  }
  return state;
}

async function startReading() {
  if (busy) return;
  busy = true;
  ui.showShuffle();
  try {
    const currentState = await ensureState();
    currentState.reset();
    scene.toHomeDeck();
    await scene.beginShuffle();
    ui.showDraw(currentState.drawn.length, currentState.deck.length);
    track('tarot_start');
  } finally {
    busy = false;
  }
}

async function drawCard(selectedCard) {
  if (busy || state.drawn.length >= 8 || scene.stage !== 'draw') return;
  busy = true;
  const positionIndex = state.drawn.length;
  const card = state.draw();
  const domain = DOMAINS[positionIndex];
  ui.setStatus(`正在翻开第 ${positionIndex + 1} 张牌：${domain.name}。`);
  try {
    await scene.drawCard(card, positionIndex, selectedCard);
    track('tarot_draw', { position: positionIndex + 1 });
    ui.updateDraw(state.drawn.length, state.deck.length);
    if (state.drawn.length === 8) {
      await scene.completeSpread();
      await scene.toResults();
      ui.showResults(state.drawn);
      track('tarot_complete');
    } else {
      ui.setStatus('第 ' + state.drawn.length + ' 张已落位。接下来：' + DOMAINS[state.drawn.length].name + '。');
    }
  } finally {
    busy = false;
  }
}

async function openReading(index) {
  if (busy || scene.stage !== 'results') return;
  busy = true;
  const card = state.drawn[index];
  ui.beginReading();
  try {
    const opening = scene.openReading(index);
    await Promise.race([opening, pause(520)]);
    ui.showReading(card, DOMAINS[index], state.readingAt(index));
    await opening;
    ui.enableReadingDismiss();
    track('tarot_reading_open', { position: index + 1 });
  } catch (error) {
    ui.cancelReading();
    throw error;
  } finally {
    busy = false;
  }
}

async function closeReading() {
  if (busy || scene.stage !== 'reading') return;
  busy = true;
  try {
    await Promise.all([ui.hideReading(), scene.closeReading()]);
  } finally {
    ui.finishReadingClose();
    busy = false;
  }
  track('tarot_reading_close');
}

function resetReading() {
  if (busy) return;
  const stage = scene.stage === 'draw' ? 'draw' : scene.stage === 'results' || scene.stage === 'reading' ? 'results' : null;
  if (!stage) return;
  state?.reset();
  scene.reset();
  ui.showHome();
  track('tarot_restart', { stage });
}
