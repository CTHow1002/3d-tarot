export const AUDIO_MIX = Object.freeze({ music: 0.1, effects: 0.82 });

export const AUDIO_CUES = Object.freeze({
  'ritual-start': [{ file: '/audio/glass-bell-1.wav', gain: 1.35 }],
  'deck-shuffle': [{ file: '/audio/riffle-bridge.mp3', gain: 0.62 }],
  'fan-swipe': [{ file: '/audio/card-slide.mp3', gain: 1.7 }],
  'card-selection': [{ file: '/audio/contact1.wav', gain: 3.2 }],
  'card-lift': [{ file: '/audio/card-pickup.mp3', gain: 0.58 }],
  'card-flip': [{ file: '/audio/card-flip.mp3', gain: 1.05 }],
  'card-flight': [{ file: '/audio/card-slide-right.mp3', gain: 2.55 }],
  'card-landing': [{ file: '/audio/card-deal.mp3', gain: 0.72 }],
  'eighth-completion': [{ file: '/audio/glass-bell-5.wav', gain: 0.72 }],
  'reading-open': [{ file: '/audio/card-slide-left.mp3', gain: 1.5 }],
  'reading-close': [{ file: '/audio/card-slide-right.mp3', gain: 1.25 }],
  restart: [{ file: '/audio/cut.wav', gain: 2.7 }]
});

export const MUSIC_ASSET = '/audio/calm-track-loop.mp3';

const PREFERENCE_KEY = 'moonlit-audio-enabled';
const FAN_SWIPE_COOLDOWN = 0.16;
const MAX_EFFECT_VOICES = 5;
const FADE_SECONDS = 0.28;

const readPreference = () => {
  try {
    return globalThis.localStorage?.getItem(PREFERENCE_KEY) === 'true';
  } catch {
    return false;
  }
};

const savePreference = (enabled) => {
  try {
    globalThis.localStorage?.setItem(PREFERENCE_KEY, String(enabled));
  } catch {
    // Storage can be unavailable in private browsing; audio still works for this session.
  }
};

export class AudioManager {
  constructor() {
    this.enabled = readPreference();
    this.available = Boolean(globalThis.AudioContext || globalThis.webkitAudioContext);
    this.visible = !globalThis.document?.hidden;
    this.context = null;
    this.musicGain = null;
    this.effectsGain = null;
    this.musicElement = null;
    this.effectsLimiter = null;
    this.buffers = new Map();
    this.effectsPromise = null;
    this.effectVoices = new Set();
    this.lastFanSwipeAt = -Infinity;
    this.suspendTimer = 0;
    this.onVisibilityChange = () => this.setPageVisible(!document.hidden);
    globalThis.document?.addEventListener?.('visibilitychange', this.onVisibilityChange);
  }

  async setEnabled(enabled) {
    if (!enabled) {
      this.enabled = false;
      savePreference(false);
      this.fadeOut();
      this.scheduleSuspend();
      return false;
    }

    if (!this.ensureContext()) {
      this.enabled = false;
      savePreference(false);
      return false;
    }
    this.enabled = true;
    this.activate();
    try {
      await this.prepareEffects();
      if (!this.enabled) return false;
      savePreference(true);
      return true;
    } catch {
      this.enabled = false;
      savePreference(false);
      this.fadeOut();
      this.scheduleSuspend();
      return false;
    }
  }

  async prepareForInteraction() {
    if (!this.enabled) return true;
    if (!this.ensureContext()) return false;
    this.activate();
    try {
      await this.prepareEffects();
      return this.enabled;
    } catch {
      this.enabled = false;
      savePreference(false);
      this.fadeOut();
      this.scheduleSuspend();
      return false;
    }
  }

  setPageVisible(visible) {
    this.visible = visible;
    if (!visible) {
      this.fadeOut();
      this.scheduleSuspend();
    } else if (this.enabled) this.activate();
  }

  playCue(name) {
    const cue = AUDIO_CUES[name];
    if (!this.enabled || !this.visible || !cue || !this.context || !this.buffers.size) return false;
    if (this.context.state !== 'running') this.activate();
    if (name === 'fan-swipe') {
      if (this.context.currentTime - this.lastFanSwipeAt < FAN_SWIPE_COOLDOWN) return false;
      this.lastFanSwipeAt = this.context.currentTime;
    }
    if (this.effectVoices.size + cue.length > MAX_EFFECT_VOICES) return false;

    for (const layer of cue) {
      const source = this.context.createBufferSource();
      const envelope = this.context.createGain();
      source.buffer = this.buffers.get(layer.file);
      envelope.gain.value = layer.gain;
      source.connect(envelope);
      envelope.connect(this.effectsGain);
      const voice = { name, source, envelope, stopping: false };
      this.effectVoices.add(voice);
      source.onended = () => {
        this.effectVoices.delete(voice);
        source.disconnect();
        envelope.disconnect();
      };
      source.start(this.context.currentTime);
    }
    return true;
  }

  stopCue(name, fade = 0.08) {
    if (!this.context) return 0;
    let stopped = 0;
    for (const voice of this.effectVoices) {
      if (voice.name !== name || voice.stopping) continue;
      voice.stopping = true;
      this.ramp(voice.envelope.gain, 0, fade);
      try { voice.source.stop(this.context.currentTime + fade); } catch { /* Already stopped. */ }
      stopped += 1;
    }
    return stopped;
  }

  ensureContext() {
    if (this.context?.state !== 'closed' && this.context) return this.context;
    const AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AudioContextClass) {
      this.available = false;
      return null;
    }

    try {
      const context = new AudioContextClass();
      const musicGain = context.createGain();
      const effectsGain = context.createGain();
      const effectsLimiter = context.createDynamicsCompressor();
      musicGain.gain.value = 0;
      effectsGain.gain.value = 0;
      effectsLimiter.threshold.value = -8;
      effectsLimiter.knee.value = 6;
      effectsLimiter.ratio.value = 8;
      effectsLimiter.attack.value = 0.003;
      effectsLimiter.release.value = 0.12;
      musicGain.connect(context.destination);
      effectsGain.connect(effectsLimiter);
      effectsLimiter.connect(context.destination);

      const musicElement = new globalThis.Audio();
      musicElement.preload = 'none';
      musicElement.loop = true;
      musicElement.src = MUSIC_ASSET;
      context.createMediaElementSource(musicElement).connect(musicGain);

      this.context = context;
      this.musicGain = musicGain;
      this.effectsGain = effectsGain;
      this.effectsLimiter = effectsLimiter;
      this.musicElement = musicElement;
      this.available = true;
      return context;
    } catch {
      this.context?.close?.().catch?.(() => {});
      this.context = null;
      this.musicGain = null;
      this.effectsGain = null;
      this.effectsLimiter = null;
      this.musicElement = null;
      this.available = false;
      return null;
    }
  }

  prepareEffects() {
    if (this.effectsPromise) return this.effectsPromise;
    const files = new Set(Object.values(AUDIO_CUES).flatMap((cue) => cue.map(({ file }) => file)));
    this.effectsPromise = Promise.all([...files].map(async (file) => {
      const response = await globalThis.fetch(file);
      if (!response.ok) throw new Error(`Audio asset unavailable: ${file}`);
      return [file, await this.context.decodeAudioData(await response.arrayBuffer())];
    })).then((entries) => {
      this.buffers = new Map(entries);
      return this.buffers;
    }).catch((error) => {
      this.effectsPromise = null;
      throw error;
    });
    return this.effectsPromise;
  }

  activate() {
    if (!this.context || !this.enabled || !this.visible) return;
    clearTimeout(this.suspendTimer);
    this.suspendTimer = 0;
    try {
      if (this.context.state !== 'running') this.context.resume()?.catch?.(() => {});
      this.musicElement.play()?.catch?.(() => {});
    } catch {
      return;
    }
    this.ramp(this.musicGain.gain, AUDIO_MIX.music, 0.85);
    this.ramp(this.effectsGain.gain, AUDIO_MIX.effects, 0.22);
  }

  fadeOut() {
    if (!this.context) return;
    this.ramp(this.musicGain.gain, 0, FADE_SECONDS);
    this.ramp(this.effectsGain.gain, 0, 0.08);
    for (const voice of this.effectVoices) {
      const { source, envelope } = voice;
      voice.stopping = true;
      this.ramp(envelope.gain, 0, 0.06);
      try { source.stop(this.context.currentTime + 0.08); } catch { /* Already stopping. */ }
    }
  }

  ramp(param, target, duration) {
    if (!param || !this.context) return;
    const now = this.context.currentTime;
    if (typeof param.cancelAndHoldAtTime === 'function') param.cancelAndHoldAtTime(now);
    else {
      param.cancelScheduledValues(now);
      param.setValueAtTime(param.value, now);
    }
    param.linearRampToValueAtTime(target, now + duration);
  }

  scheduleSuspend() {
    clearTimeout(this.suspendTimer);
    this.suspendTimer = setTimeout(() => {
      this.suspendTimer = 0;
      if ((this.enabled && this.visible) || !this.context) return;
      this.musicElement?.pause();
      try { this.context.suspend()?.catch?.(() => {}); } catch { /* Browser audio may close during navigation. */ }
    }, 360);
  }
}
