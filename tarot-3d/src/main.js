import './ui/style.css';
import { DOMAINS } from './data/domains.js';
import { TarotState } from './state/tarot-state.js';
import { TarotScene } from './scene/TarotScene.js';
import { createUI } from './ui/ui.js';
import { pause } from './animation/tween.js';
import { AudioManager } from './audio/AudioManager.js';

const root = document.querySelector('#app');
let state;
let scene;
let busy = false;
const audio = new AudioManager();

const ui = createUI(root, {
  start: () => startReading(),
  'draw-current': () => drawCard(scene?.currentDrawCard()),
  'read-result': (index) => openReading(Number(index)),
  'toggle-audio': async () => {
    const requested = !audio.enabled;
    const enabled = await audio.setEnabled(requested);
    ui.setAudioEnabled(enabled, audio.available);
    if (requested && !enabled) ui.setStatus(audio.available ? '声音素材暂时无法加载。' : '当前浏览器无法播放声音。');
  },
  reset: () => resetReading(),
  'close-reading': () => closeReading()
});
ui.setAudioEnabled(audio.enabled, audio.available);

scene = new TarotScene(ui.sceneHost, null, {
  onDraw: (selectedCard) => drawCard(selectedCard),
  onReading: (index) => openReading(index),
  onSound: (cue) => audio.playCue(cue),
  onSoundStop: (cue) => audio.stopCue(cue)
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
  const audioReady = audio.prepareForInteraction();
  ui.showShuffle();
  try {
    const currentState = await ensureState();
    currentState.reset();
    scene.toHomeDeck();
    if (!(await audioReady)) ui.setAudioEnabled(false, audio.available);
    audio.playCue('ritual-start');
    await scene.beginShuffle();
    ui.showDraw(currentState.drawn.length, currentState.deck.length);
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
    ui.updateDraw(state.drawn.length, state.deck.length);
    if (state.drawn.length === 8) {
      await scene.completeSpread();
      await scene.toResults();
      ui.showResults(state.drawn);
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
}

function resetReading() {
  if (busy) return;
  audio.playCue('restart');
  state?.reset();
  scene.reset();
  ui.showHome();
}
