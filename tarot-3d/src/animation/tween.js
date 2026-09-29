import { easing } from './easing.js';

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const tween = (duration, update, ease = easing.inOutCubic) => new Promise((resolve) => {
  if (duration <= 0 || reducedMotion()) {
    update(1);
    resolve();
    return;
  }
  const start = performance.now();
  const frame = (now) => {
    const progress = Math.min(1, (now - start) / duration);
    update(ease(progress));
    if (progress < 1) requestAnimationFrame(frame);
    else resolve();
  };
  requestAnimationFrame(frame);
});

export const pause = (duration) => tween(duration, () => {}, easing.outCubic);
