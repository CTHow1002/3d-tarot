import * as THREE from 'three';

export class TextureManager {
  constructor(renderer) {
    this.renderer = renderer;
    this.loader = new THREE.TextureLoader();
    this.cache = new Map();
    this.fallback = this.createFallbackTexture();
  }

  createFallbackTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 4;
    canvas.height = 6;
    const context = canvas.getContext('2d');
    context.fillStyle = '#3a2343';
    context.fillRect(0, 0, 4, 6);
    context.strokeStyle = '#caa96d';
    context.strokeRect(0.5, 0.5, 3, 5);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  load(key, url) {
    if (this.cache.has(key)) return this.cache.get(key);
    const task = new Promise((resolve) => {
      this.loader.load(
        url,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.anisotropy = Math.min(2, this.renderer.capabilities.getMaxAnisotropy());
          texture.needsUpdate = true;
          resolve(texture);
        },
        undefined,
        () => resolve(this.fallback)
      );
    });
    this.cache.set(key, task);
    return task;
  }

  getBack() {
    return this.load('back', '/card-back.png');
  }

  getAltarAsset(name) {
    return this.load(`altar:${name}`, `/altar/${name}.png`);
  }

  getFront(id) {
    return this.load(`front:${id}`, `/cards/${id}.webp`);
  }

  async clearFronts() {
    const fronts = [...this.cache.entries()].filter(([key]) => key.startsWith('front:'));
    fronts.forEach(([key]) => this.cache.delete(key));
    const textures = await Promise.all(fronts.map(([, task]) => task));
    textures.filter((texture) => texture !== this.fallback).forEach((texture) => texture.dispose());
  }

  dispose() {
    this.clearFronts();
    this.fallback.dispose();
  }
}
