import { DOMAINS } from '../data/domains.js';

const panel = (root, name) => root.querySelector(`[data-panel="${name}"]`);

export const createUI = (root, actions) => {
  root.innerHTML = `
    <div class="tarot-shell">
      <div class="scene-host" aria-hidden="true"></div>
      <div class="atmosphere" aria-hidden="true"></div>
      <div class="ui-layer">
        <header class="top-bar"><span class="brand">☾ 月间</span><span class="brand-note">3D 塔罗圣坛</span></header>

        <section class="home-panel panel" data-panel="home">
          <p class="eyebrow">EIGHT CARDS · A QUIET MOMENT</p>
          <h1>与自己，轻轻相遇</h1>
          <p class="home-copy">静下心，想一想最近的生活。<br>让八张牌，陪你看见八个不同的角度。</p>
          <div class="domain-cloud" aria-label="八个占卜领域">${DOMAINS.map((domain) => `<span>${domain.name}</span>`).join('')}</div>
          <button class="primary start-button" type="button" data-action="start">开始抽取八张牌</button>
          <p class="quiet-note">78 张牌 · 正逆位解读 · 每次约 3 分钟</p>
        </section>

        <section class="shuffle-panel panel" data-panel="shuffle" hidden aria-live="polite">
          <p class="eyebrow">THE RITUAL BEGINS</p>
          <h2>正在重新整理牌组</h2>
          <p>让直觉慢慢靠近。</p>
        </section>

        <section class="draw-panel panel" data-panel="draw" hidden>
          <div class="draw-heading">
            <p class="eyebrow" data-draw-position>第 1 张 · 近期整体</p>
            <h2 data-draw-question>最近的生活，有什么值得看见？</h2>
            <p class="draw-note" data-draw-note>左右滑动牌扇，点击任意可见牌选择</p>
          </div>
          <div class="draw-status">
            <div class="progress" aria-label="抽牌进度" data-progress></div>
            <span class="deck-count" data-deck-count>牌堆剩余 78 张</span>
          </div>
          <button class="secondary-reset-button reset-draw" type="button" data-action="reset">重新开始</button>
        </section>

        <section class="result-panel panel" data-panel="results" hidden aria-live="polite">
          <h2>八个角度，已经落定</h2>
          <p>点一张牌查看解读</p>
          <button class="secondary-reset-button reset-result" type="button" data-action="reset">重新开始</button>
        </section>

        <button class="keyboard-action" type="button" data-action="draw-current" hidden>抽取当前牌扇中央的牌</button>
        <div class="result-card-actions" role="group" aria-label="逐张阅读结果牌" data-result-actions hidden></div>
        <div class="reading-dismiss-layer" data-action="close-reading" aria-hidden="true" hidden></div>
        <section class="reading-panel" data-panel="reading" hidden role="dialog" aria-modal="true" aria-labelledby="reading-title" tabindex="-1">
          <div class="reading-meta">
            <button class="close-button" type="button" data-action="close-reading" aria-label="关闭解读">×</button>
            <p class="eyebrow" data-reading-domain></p>
            <h2 id="reading-title" data-reading-name></h2>
            <p class="reading-en" data-reading-en></p>
            <div class="reading-summary">
              <p class="orientation" data-reading-orientation></p>
              <p class="tendency" data-reading-tendency>
                <span data-reading-tendency-label></span>
                <span class="intensity-stars" data-reading-intensity role="img"></span>
              </p>
            </div>
          </div>
          <div class="reading-copy" tabindex="0" aria-label="牌卡解读内容">
            <section><h3>此刻</h3><p data-reading-theme></p></section>
            <section><h3>留意</h3><p data-reading-caution></p></section>
            <section><h3>下一步</h3><p data-reading-advice></p></section>
          </div>
        </section>

        <p class="live-status" aria-live="polite" data-status></p>
        <footer>塔罗是一面镜子，生活的方向仍在你手中。</footer>
      </div>
    </div>`;

  const panels = ['home', 'shuffle', 'draw', 'results', 'reading'].reduce((all, name) => ({ ...all, [name]: panel(root, name) }), {});
  const status = root.querySelector('[data-status]');
  const drawPosition = root.querySelector('[data-draw-position]');
  const drawQuestion = root.querySelector('[data-draw-question]');
  const drawNote = root.querySelector('[data-draw-note]');
  const deckCount = root.querySelector('[data-deck-count]');
  const progress = root.querySelector('[data-progress]');
  const shell = root.querySelector('.tarot-shell');
  const readingDismiss = root.querySelector('.reading-dismiss-layer');
  const drawCurrent = root.querySelector('[data-action="draw-current"]');
  const resultActions = root.querySelector('[data-result-actions]');
  const closeReading = panels.reading.querySelector('[data-action="close-reading"]');
  const readingCopy = panels.reading.querySelector('.reading-copy');
  const resultReset = panels.results.querySelector('[data-action="reset"]');
  let readingCanDismiss = false;
  let readingReturnFocus = null;

  const setResultInert = (inert) => {
    panels.results.inert = inert;
    panels.results.toggleAttribute('aria-hidden', inert);
    resultActions.inert = inert;
    resultActions.toggleAttribute('aria-hidden', inert);
  };

  const clearReading = () => {
    readingCanDismiss = false;
    shell.classList.remove('is-reading');
    readingDismiss.hidden = true;
    closeReading.setAttribute('aria-disabled', 'true');
    panels.reading.classList.remove('is-open');
    panels.reading.hidden = true;
    setResultInert(false);
  };

  root.addEventListener('click', (event) => {
    const button = event.target.closest?.('[data-action]');
    if (!button || !root.contains(button)) return;
    if (button.dataset.action !== 'close-reading' || readingCanDismiss) {
      actions[button.dataset.action]?.(button.dataset.index);
    }
  });
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && readingCanDismiss && !panels.reading.hidden) actions['close-reading']?.();
    if (event.key === 'Tab' && !panels.reading.hidden) {
      event.preventDefault();
      const nextFocus = event.shiftKey
        ? (document.activeElement === closeReading ? readingCopy : closeReading)
        : (document.activeElement === readingCopy ? closeReading : readingCopy);
      nextFocus.focus({ preventScroll: true });
    }
  });

  const showOnly = (name) => {
    Object.entries(panels).forEach(([key, element]) => {
      element.hidden = key !== name && !(name === 'reading' && key === 'results');
    });
    drawCurrent.hidden = name !== 'draw';
    resultActions.hidden = name !== 'results';
    if (name !== 'reading') clearReading();
  };

  const setDraw = (drawn, deckLength) => {
    const domain = DOMAINS[Math.min(drawn, DOMAINS.length - 1)];
    drawPosition.textContent = drawn < 8 ? `第 ${drawn + 1} 张 · ${domain.name}` : '八张牌已经抽完';
    drawQuestion.textContent = drawn < 8 ? domain.question : '八个角度，已经落定';
    drawNote.textContent = drawn < 8 ? '左右滑动牌扇，点击任意可见牌选择' : '点击牌阵中的卡牌，阅读解读。';
    drawNote.hidden = drawn > 0;
    deckCount.textContent = `牌堆剩余 ${deckLength} 张`;
    progress.innerHTML = DOMAINS.map((domainItem, index) => `<span class="${index < drawn ? 'filled' : ''}" aria-label="${domainItem.name}${index < drawn ? '已抽取' : '待抽取'}"></span>`).join('');
  };

  const showReading = (card, domain, reading) => {
    shell.classList.add('is-reading');
    setResultInert(true);
    panels.reading.querySelector('[data-reading-domain]').textContent = `${domain.icon} ${domain.name}`;
    panels.reading.querySelector('[data-reading-name]').textContent = card.name;
    panels.reading.querySelector('[data-reading-en]').textContent = card.en;
    panels.reading.querySelector('[data-reading-orientation]').textContent = card.reversed ? '逆位' : '正位';
    const intensityStars = panels.reading.querySelector('[data-reading-intensity]');
    intensityStars.textContent = '★'.repeat(reading.intensity) + '☆'.repeat(5 - reading.intensity);
    intensityStars.setAttribute('aria-label', `信息强度 ${reading.intensity} 星，共五颗`);
    panels.reading.querySelector('[data-reading-tendency-label]').textContent = reading.tendency;
    panels.reading.querySelector('[data-reading-theme]').textContent = reading.theme;
    panels.reading.querySelector('[data-reading-caution]').textContent = reading.caution;
    panels.reading.querySelector('[data-reading-advice]').textContent = reading.advice;
    panels.reading.hidden = false;
    closeReading.setAttribute('aria-disabled', 'true');
    requestAnimationFrame(() => {
      panels.reading.classList.add('is-open');
      closeReading.focus({ preventScroll: true });
    });
    status.textContent = `${domain.name}：${card.name}${card.reversed ? '逆位' : '正位'}解读已展开。`;
  };

  const showResults = (cards) => {
    showOnly('results');
    resultActions.replaceChildren(...cards.map((card, index) => {
      const button = document.createElement('button');
      button.className = 'keyboard-action';
      button.type = 'button';
      button.dataset.action = 'read-result';
      button.dataset.index = String(index);
      button.textContent = '阅读第 ' + (index + 1) + ' 张 · ' + card.name + ' · ' + (card.reversed ? '逆位' : '正位');
      return button;
    }));
    status.textContent = '八张牌已经完成。';
  };

  return {
    sceneHost: root.querySelector('.scene-host'),
    showHome() { showOnly('home'); status.textContent = '3D 塔罗圣坛已准备好。'; },
    showShuffle() { showOnly('shuffle'); status.textContent = '正在洗牌。'; },
    showDraw(drawn, deckLength) { showOnly('draw'); setDraw(drawn, deckLength); status.textContent = '牌扇已展开。'; },
    updateDraw: setDraw,
    showResults,
    beginReading() {
      readingReturnFocus = document.activeElement;
      readingCanDismiss = false;
      readingDismiss.hidden = true;
      closeReading.setAttribute('aria-disabled', 'true');
      shell.classList.add('is-reading');
      setResultInert(true);
    },
    showReading,
    enableReadingDismiss() {
      readingCanDismiss = true;
      closeReading.removeAttribute('aria-disabled');
      if (!panels.reading.hidden) readingDismiss.hidden = false;
    },
    async hideReading() {
      readingCanDismiss = false;
      readingDismiss.hidden = true;
      closeReading.setAttribute('aria-disabled', 'true');
      panels.reading.classList.remove('is-open');
      const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 180;
      if (duration) await new Promise((resolve) => window.setTimeout(resolve, duration));
      panels.reading.hidden = true;
      status.textContent = '卡牌正在回到它的牌阵位置。';
    },
    finishReadingClose() {
      shell.classList.remove('is-reading');
      setResultInert(false);
      const returnFocus = readingReturnFocus && readingReturnFocus !== document.body && readingReturnFocus.isConnected
        ? readingReturnFocus
        : resultReset;
      returnFocus.focus({ preventScroll: true });
      readingReturnFocus = null;
      status.textContent = '卡牌已回到它的牌阵位置。';
    },
    cancelReading: clearReading,
    setStatus(message) { status.textContent = message; }
  };
};
