import * as THREE from 'three';
import { Card3D } from '../cards/Card3D.js';
import { TextureManager } from '../cards/TextureManager.js';
import { easing } from '../animation/easing.js';
import { pause, reducedMotion, tween } from '../animation/tween.js';
import { createAltar } from './Altar.js';
import { createStarfield } from './Starfield.js';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const CARD_GAP = 0.058;
const SHUFFLE_CARD_COUNT = 16;
const DRAW_POOL_COUNT = 15;
const DOMAIN_STEP = Math.PI * 2 / 8;
const DRAG_THRESHOLD = 7;
export const FAN_INERTIA_FRICTION = 7.5;
export const FAN_INERTIA_STOP_VELOCITY = 0.25;
export const FAN_INERTIA_MAX_VELOCITY = 42;

const MOTION_TIMING = Object.freeze({
  readingCameraOpen: 500,
  readingCameraClose: 460
});

const pose = (x, y, z, rx = 0, ry = 0, rz = 0, scale = 1) => ({
  position: new THREE.Vector3(x, y, z),
  rotation: new THREE.Euler(rx, ry, rz),
  scale: new THREE.Vector3(scale, scale, scale)
});

const domainAngle = (index) => Math.PI / 2 - index * DOMAIN_STEP;

export const getLayoutProfile = (width, height) => {
  if (width <= 600 && height <= 700) {
    return {
      name: 'compact',
      homeCameraZ: 5.55,
      homeFov: 40,
      shuffleCameraZ: 5.4,
      drawCameraZ: 5.6,
      drawFov: 42,
      resultCameraZ: 7.6,
      resultFov: 46,
      resultTargetY: 0.02,
      readingTargetY: 0.1,
      fanY: -1.05,
      fanZ: 0.3,
      fanStepX: 0.33,
      fanDepthBase: 0.12,
      fanLayerStep: 0.2,
      fanCurve: 0.055,
      fanCenterLift: 0.04,
      fanScale: 0.75,
      fanMinScale: 0.55,
      fanScaleStep: 0.027,
      fanDragDistance: 62,
      revealX: 0,
      revealY: -0.34,
      revealZ: 0.94,
      revealScale: 0.94,
      stagingTopY: 0.64,
      stagingBottomY: 0.1,
      stagingStepX: 0.36,
      stagingScale: 0.29,
      stagingZ: -0.03,
      resultRadiusX: 1.06,
      resultRadiusY: 0.78,
      nodeDrawRadiusX: 0.66,
      nodeDrawRadiusY: 0.58,
      nodeDrawCenterY: 0.46,
      resultSpreadScale: 0.84,
      nodeOutsetVertical: 0.52,
      nodeOutsetDiagonal: 0.62,
      nodeOutsetHorizontal: 0.34,
      nodeScale: 0.84,
      resultBaseZ: -0.14,
      resultDepth: 0.18,
      readingRetreatZ: 0.22,
      readingRetreatScale: 0.978,
      readingSafePlaneGap: 0.34,
      readingY: 1.34,
      readingZ: 1.14,
      readingScale: 1.1
    };
  }

  if (width <= 600) {
    return {
      name: 'standard-mobile',
      homeCameraZ: 5.2,
      homeFov: 39,
      shuffleCameraZ: 5.15,
      drawCameraZ: 5.25,
      drawFov: 40,
      resultCameraZ: 7.65,
      resultFov: 45,
      resultTargetY: 0.02,
      readingTargetY: 0.11,
      fanY: -0.94,
      fanZ: 0.3,
      fanStepX: 0.36,
      fanDepthBase: 0.12,
      fanLayerStep: 0.2,
      fanCurve: 0.075,
      fanCenterLift: 0.045,
      fanScale: 0.78,
      fanMinScale: 0.59,
      fanScaleStep: 0.026,
      fanDragDistance: 68,
      revealX: 0,
      revealY: -0.34,
      revealZ: 0.94,
      revealScale: 1.07,
      stagingTopY: 0.76,
      stagingBottomY: 0.2,
      stagingStepX: 0.43,
      stagingScale: 0.34,
      stagingZ: -0.03,
      resultRadiusX: 1.06,
      resultRadiusY: 0.86,
      nodeDrawRadiusX: 0.76,
      nodeDrawRadiusY: 0.65,
      nodeDrawCenterY: 0.55,
      resultSpreadScale: 0.9,
      nodeOutsetVertical: 0.6,
      nodeOutsetDiagonal: 0.72,
      nodeOutsetHorizontal: 0.4,
      nodeScale: 0.92,
      resultBaseZ: -0.14,
      resultDepth: 0.2,
      readingRetreatZ: 0.22,
      readingRetreatScale: 0.978,
      readingSafePlaneGap: 0.34,
      readingY: 1.52,
      readingZ: 1.24,
      readingScale: 1.38
    };
  }

  return {
    name: 'desktop',
    homeCameraZ: 5.2,
    homeFov: 39,
    shuffleCameraZ: 5,
    drawCameraZ: 5.05,
    drawFov: 39,
    resultCameraZ: 7.45,
    resultFov: 44,
    resultTargetY: 0.02,
    readingTargetY: 0.12,
    fanY: -0.94,
    fanZ: 0.3,
    fanStepX: 0.43,
    fanDepthBase: 0.12,
    fanLayerStep: 0.2,
    fanCurve: 0.08,
    fanCenterLift: 0.05,
    fanScale: 0.94,
    fanMinScale: 0.7,
    fanScaleStep: 0.03,
    fanDragDistance: 72,
    revealX: 0,
    revealY: -0.3,
    revealZ: 0.94,
    revealScale: 1.14,
    stagingTopY: 0.72,
    stagingBottomY: 0.12,
    stagingStepX: 0.68,
    stagingScale: 0.53,
    stagingZ: -0.03,
    resultRadiusX: 1.34,
    resultRadiusY: 1.02,
    nodeDrawRadiusX: 1.48,
    nodeDrawRadiusY: 0.72,
    nodeDrawCenterY: 0.55,
    resultSpreadScale: 1,
    nodeOutsetVertical: 0.64,
    nodeOutsetDiagonal: 0.76,
    nodeOutsetHorizontal: 0.44,
    nodeScale: 1,
    resultBaseZ: -0.14,
    resultDepth: 0.22,
    readingRetreatZ: 0.24,
    readingRetreatScale: 0.978,
    readingSafePlaneGap: 0.36,
    readingY: 1.14,
    readingZ: 1.24,
    readingScale: 1.54
  };
};

export const rotateDrawPool = (pool, direction) => {
  if (pool.length < 2) return pool;
  if (direction > 0) pool.push(pool.shift());
  else pool.unshift(pool.pop());
  return pool;
};

export const normalizeDrawOffset = (offset) => {
  const steps = offset >= 0.5 ? Math.floor(offset + 0.5) : offset <= -0.5 ? Math.ceil(offset - 0.5) : 0;
  return { offset: offset - steps, steps };
};

export const advanceFanInertia = (offset, velocity, elapsedSeconds) => {
  const elapsed = clamp(elapsedSeconds, 0, 0.05);
  return {
    offset: offset + velocity * elapsed,
    velocity: velocity * Math.exp(-FAN_INERTIA_FRICTION * elapsed)
  };
};

export const replaceDrawPoolCard = (drawPool, unusedPool, card) => {
  const selectedIndex = drawPool.indexOf(card);
  if (selectedIndex < 0) return null;
  const entersFromRight = selectedIndex <= (drawPool.length - 1) / 2;
  drawPool.splice(selectedIndex, 1);
  const replacement = unusedPool.shift() || null;
  if (replacement) {
    if (entersFromRight) drawPool.push(replacement);
    else drawPool.unshift(replacement);
  }
  return { selectedIndex, replacement, entersFromRight };
};

export const drawStageSpreadPose = (index, layout) => {
  const column = index % 4;
  const row = Math.floor(index / 4);
  return pose(
    (column - 1.5) * layout.stagingStepX,
    row === 0 ? layout.stagingTopY : layout.stagingBottomY,
    layout.stagingZ - row * 0.012,
    0,
    Math.PI,
    (column - 1.5) * 0.004,
    layout.stagingScale
  );
};

export const revealPose = (layout) => pose(
  layout.revealX,
  layout.revealY,
  layout.revealZ,
  0,
  0,
  0,
  layout.revealScale
);

export const resultSpreadPose = (index, layout) => {
  const angle = domainAngle(index);
  const scale = layout.resultSpreadScale * (0.96 + ((1 - Math.sin(angle)) / 2) * 0.08);
  return pose(
    Math.cos(angle) * layout.resultRadiusX,
    Math.sin(angle) * layout.resultRadiusY,
    layout.resultBaseZ - Math.sin(angle) * layout.resultDepth,
    0,
    Math.PI,
    (index - 3.5) * 0.005,
    scale
  );
};

export const readingRetreatPose = (slot, layout) => pose(
  slot.position.x,
  slot.position.y,
  slot.position.z - layout.readingRetreatZ,
  slot.rotation.x,
  slot.rotation.y,
  slot.rotation.z,
  slot.scale.x * layout.readingRetreatScale
);

export const readingSafePlaneZ = (layout) => (
  Math.max(...Array.from({ length: 8 }, (_, index) => resultSpreadPose(index, layout).position.z))
  + layout.readingSafePlaneGap
);

export const readingExtractionPose = (slot, layout) => {
  return pose(
    slot.position.x,
    slot.position.y,
    readingSafePlaneZ(layout),
    slot.rotation.x,
    slot.rotation.y,
    slot.rotation.z,
    slot.scale.x
  );
};

export const readingPose = (layout) => pose(
  0,
  layout.readingY,
  layout.readingZ,
  0,
  Math.PI,
  0,
  layout.readingScale
);

const fanLayerForPhase = (phase) => [0, -1, 1][((phase % 3) + 3) % 3];

export const fanDepthForOffset = (offset, layout, phase = 0) => (
  layout.fanZ - Math.abs(offset) * layout.fanDepthBase + fanLayerForPhase(phase) * layout.fanLayerStep
);

export const fanLayerPose = (offset, layout, phase = 0) => {
  const distance = Math.abs(offset);
  const focus = Math.max(0, 1 - distance * 0.42);
  return pose(
    offset * layout.fanStepX,
    layout.fanY + focus * layout.fanCenterLift - Math.min(layout.fanCurve, distance * distance * 0.007),
    fanDepthForOffset(offset, layout, phase),
    0,
    -offset * 0.02,
    offset * 0.01,
    Math.max(layout.fanMinScale, layout.fanScale - distance * layout.fanScaleStep)
  );
};

const copyPose = (object) => ({
  position: object.position.clone(),
  rotation: object.rotation.clone(),
  scale: object.scale.clone()
});

const applyPose = (object, next) => {
  object.position.copy(next.position);
  object.rotation.copy(next.rotation);
  object.scale.copy(next.scale);
};

const lerpPose = (object, from, to, amount) => {
  object.position.lerpVectors(from.position, to.position, amount);
  object.rotation.set(
    THREE.MathUtils.lerp(from.rotation.x, to.rotation.x, amount),
    THREE.MathUtils.lerp(from.rotation.y, to.rotation.y, amount),
    THREE.MathUtils.lerp(from.rotation.z, to.rotation.z, amount)
  );
  object.scale.lerpVectors(from.scale, to.scale, amount);
};

export class TarotScene {
  constructor(host, textures, callbacks = {}) {
    this.host = host;
    this.textures = textures;
    this.callbacks = callbacks;
    this.stage = 'home';
    this.cards = [];
    this.drawPool = [];
    this.unusedPool = [];
    this.spreadCards = Array(8).fill(null);
    this.drawOffset = 0;
    this.viewportProfile = getLayoutProfile(390, 844);
    this.layoutVersion = 0;
    this.reading = null;
    this.pointer = null;
    this.fanVelocity = 0;
    this.fanMotionRaf = 0;
    this.fanNudging = false;
    this.drawBusy = false;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
  }

  async init() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.18;
    this.renderer.setClearColor(0x17101f, 1);
    this.renderer.domElement.className = 'scene-canvas';
    this.host.append(this.renderer.domElement);
    if (!this.textures) this.textures = new TextureManager(this.renderer);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x17101f, 0.11);
    this.camera = new THREE.PerspectiveCamera(39, 1, 0.1, 30);
    this.cameraTarget = new THREE.Vector3();
    this.cameraBaseTarget = new THREE.Vector3();
    this.cameraBasePosition = new THREE.Vector3(0, 0.05, 5.2);
    this.camera.position.copy(this.cameraBasePosition);
    this.camera.lookAt(this.cameraTarget);

    this.scene.add(new THREE.HemisphereLight(0x9c88ad, 0x201326, 1.7));
    const key = new THREE.DirectionalLight(0xe0c58d, 2.6);
    key.position.set(-2.4, 3.2, 4.2);
    this.scene.add(key);
    const fill = new THREE.DirectionalLight(0xb6a6d4, 0.52);
    fill.position.set(0, 1.4, 4.6);
    this.scene.add(fill);
    const moon = new THREE.PointLight(0x9b8fd2, 1.45, 8, 2);
    moon.position.set(2.1, 1.9, 3.1);
    this.scene.add(moon);
    const altarLight = new THREE.PointLight(0xcaa96d, 1.95, 4.5, 2);
    altarLight.position.set(0, 0, 0.5);
    this.scene.add(altarLight);

    this.stars = createStarfield();
    this.scene.add(this.stars);
    this.altar = await createAltar(this.textures);
    this.scene.add(this.altar.group);

    this.cardLayer = new THREE.Group();
    this.scene.add(this.cardLayer);
    const backTexture = await this.textures.getBack();
    this.cards = Array.from({ length: 24 }, () => {
      const card = new Card3D(backTexture);
      this.cardLayer.add(card.group);
      return card;
    });

    this.resize();
    this.toHomeDeck();
    window.addEventListener('resize', () => this.resize());
    document.addEventListener('visibilitychange', () => { this.hidden = document.hidden; });
    this.bindInput();
    this.renderLoop();
  }

  cameraPose(stage = this.stage) {
    const layout = this.viewportProfile;
    if (stage === 'shuffle') {
      return { position: new THREE.Vector3(0, 0.06, layout.shuffleCameraZ), target: new THREE.Vector3(0, 0.03, 0.18), fov: layout.homeFov };
    }
    if (stage === 'draw') {
      return { position: new THREE.Vector3(0, 0.06, layout.drawCameraZ), target: new THREE.Vector3(0, 0.14, 0), fov: layout.drawFov };
    }
    if (stage === 'reading') {
      return { position: new THREE.Vector3(0, 0.05, layout.resultCameraZ), target: new THREE.Vector3(0, layout.readingTargetY, 0), fov: layout.resultFov };
    }
    if (stage === 'results' || stage === 'completing') {
      return { position: new THREE.Vector3(0, 0.05, layout.resultCameraZ), target: new THREE.Vector3(0, layout.resultTargetY, 0), fov: layout.resultFov };
    }
    return { position: new THREE.Vector3(0, 0.05, layout.homeCameraZ), target: new THREE.Vector3(0, 0, 0), fov: layout.homeFov };
  }

  setCameraPose(next) {
    this.camera.position.copy(next.position);
    this.cameraTarget.copy(next.target);
    this.cameraBasePosition.copy(next.position);
    this.cameraBaseTarget.copy(next.target);
    this.camera.fov = next.fov;
    this.camera.updateProjectionMatrix();
  }

  async animateCameraPose(next, duration, ease = easing.inOutCubic, isCurrent = () => true) {
    const startPosition = this.camera.position.clone();
    const startTarget = this.cameraTarget.clone();
    const startFov = this.camera.fov;
    await tween(duration, (amount) => {
      if (!isCurrent()) return;
      this.camera.position.lerpVectors(startPosition, next.position, amount);
      this.cameraTarget.lerpVectors(startTarget, next.target, amount);
      this.camera.fov = THREE.MathUtils.lerp(startFov, next.fov, amount);
      this.camera.updateProjectionMatrix();
    }, ease);
    if (!isCurrent()) return;
    this.cameraBasePosition.copy(next.position);
    this.cameraBaseTarget.copy(next.target);
  }

  resize() {
    const { clientWidth: width, clientHeight: height } = this.host;
    if (!width || !height) return;
    this.layoutVersion += 1;
    const mobile = width <= 600;
    this.viewportProfile = getLayoutProfile(width, height);
    this.altar.setLayout?.(this.viewportProfile);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2));
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.setCameraPose(this.cameraPose(this.stage));
    if (this.stage === 'draw') {
      this.layoutDraw(false);
      this.spreadCards.forEach((card, index) => {
        if (!card) return;
        const target = this.drawStageSpreadPose(index);
        applyPose(card.group, target);
      });
    }
    if (this.stage === 'results' || this.stage === 'reading') {
      const slots = this.spreadCards.map((card, index) => (card ? this.resultSpreadPose(index) : null));
      if (this.stage === 'reading' && this.reading) {
        this.reading.slot = slots[this.reading.index];
        this.reading.others = this.spreadCards
          .map((card, index) => (card && card !== this.reading.card ? { card, slot: slots[index] } : null))
          .filter(Boolean);
        applyPose(this.reading.card.group, this.readingPose());
      }
      this.spreadCards.forEach((card, index) => {
        if (!card || card === this.reading?.card) return;
        const target = this.stage === 'reading' ? this.readingRetreatPose(slots[index]) : slots[index];
        applyPose(card.group, target);
      });
    }
  }

  renderLoop() {
    requestAnimationFrame(() => this.renderLoop());
    if (this.hidden) return;
    const now = performance.now();
    const frozen = reducedMotion();
    this.stars.update?.(now, frozen);
    this.altar.update?.(now, frozen);
    if (this.stage === 'home') {
      const breath = Math.sin(now * 0.00072);
      this.cardLayer.position.y = Math.sin(now * 0.0011) * 0.025;
      this.camera.position.y = this.cameraBasePosition.y + breath * 0.006;
      this.cameraTarget.y = this.cameraBaseTarget.y + breath * 0.004;
    } else this.cardLayer.position.y = 0;
    this.camera.lookAt(this.cameraTarget);
    this.renderer.render(this.scene, this.camera);
  }

  bindInput() {
    const canvas = this.renderer.domElement;
    canvas.addEventListener('pointerdown', (event) => {
      if (this.stage !== 'draw' && this.stage !== 'results') return;
      if (!event.isPrimary || this.pointer || this.drawBusy || this.fanNudging) return;
      if (this.stage === 'draw') this.cancelFanMotion();
      this.pointer = {
        startX: event.clientX,
        startY: event.clientY,
        lastX: event.clientX,
        lastTime: performance.now(),
        moved: false,
        velocity: 0,
        id: event.pointerId
      };
      canvas.setPointerCapture?.(event.pointerId);
    });
    canvas.addEventListener('pointermove', (event) => {
      if (!this.pointer || event.pointerId !== this.pointer.id || this.stage !== 'draw' || this.drawBusy) return;
      const distance = event.clientX - this.pointer.lastX;
      const now = performance.now();
      const elapsed = Math.max(1, now - this.pointer.lastTime);
      const offsetDelta = -distance / this.viewportProfile.fanDragDistance;
      const instantVelocity = offsetDelta / elapsed * 1000;
      this.pointer.lastX = event.clientX;
      this.pointer.lastTime = now;
      this.pointer.velocity = THREE.MathUtils.lerp(this.pointer.velocity, instantVelocity, 0.42);
      if (Math.hypot(event.clientX - this.pointer.startX, event.clientY - this.pointer.startY) > DRAG_THRESHOLD) this.pointer.moved = true;
      this.drawOffset += offsetDelta;
      this.recycleDrawPool();
      this.layoutDraw(false);
    });
    canvas.addEventListener('pointerup', async (event) => {
      const pointer = this.pointer;
      if (!pointer || event.pointerId !== pointer.id) return;
      this.pointer = null;
      if (canvas.hasPointerCapture?.(pointer.id)) canvas.releasePointerCapture(pointer.id);
      if (this.stage === 'draw') {
        if (pointer.moved) {
          this.startFanInertia(pointer.velocity);
          return;
        }
        const card = this.hitDrawCard(event);
        if (card) this.callbacks.onDraw?.(card);
      } else if (this.stage === 'results') {
        const index = this.hitSpreadCard(event);
        if (index >= 0) this.callbacks.onReading?.(index);
      }
    });
    const cancelPointer = (event) => {
      if (event && this.pointer?.id !== event.pointerId) return;
      this.pointer = null;
      if (this.stage === 'draw') {
        this.startFanSettle(140);
      }
    };
    canvas.addEventListener('pointercancel', cancelPointer);
    canvas.addEventListener('lostpointercapture', cancelPointer);
  }

  setRayFromEvent(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);
  }

  hitDrawCard(event) {
    this.setRayFromEvent(event);
    const hits = this.raycaster.intersectObjects(this.drawPool.map((card) => card.group), true);
    for (const hit of hits) {
      let object = hit.object;
      while (object && !object.userData.card3d) object = object.parent;
      const card = object?.userData.card3d;
      if (card?.group.visible && this.drawPool.includes(card)) return card;
    }
    return null;
  }

  hitSpreadCard(event) {
    this.setRayFromEvent(event);
    const hits = this.raycaster.intersectObjects(this.spreadCards.filter(Boolean).map((card) => card.group), true);
    for (const hit of hits) {
      let object = hit.object;
      while (object && !object.userData.card3d) object = object.parent;
      const card = object?.userData.card3d;
      const index = this.spreadCards.indexOf(card);
      if (index >= 0 && card?.group.visible) return index;
    }
    return -1;
  }

  async animateObject(object, next, duration, ease = easing.inOutCubic, isCurrent = () => true) {
    const from = copyPose(object);
    await tween(duration, (amount) => { if (isCurrent()) lerpPose(object, from, next, amount); }, ease);
  }

  async animateSet(entries, duration, stagger = 0, ease = easing.inOutCubic, isCurrent = () => true) {
    if (!entries.length) return;
    const from = entries.map(({ card }) => copyPose(card.group));
    const total = duration + stagger * (entries.length - 1);
    await tween(total, (amount) => {
      if (!isCurrent()) return;
      const elapsed = amount * total;
      entries.forEach(({ card, target }, index) => {
        const progress = clamp((elapsed - index * stagger) / duration, 0, 1);
        lerpPose(card.group, from[index], target, ease(progress));
      });
    }, (value) => value);
  }

  toHomeDeck() {
    this.cancelFanMotion();
    this.stage = 'home';
    this.reading = null;
    this.pointer = null;
    this.fanNudging = false;
    this.drawBusy = false;
    this.drawPool = [];
    this.unusedPool = [];
    this.spreadCards = Array(8).fill(null);
    this.drawOffset = 0;
    this.altar.setCompletion(0);
    this.altar.setReading?.(false);
    this.altar.setNodeFrame?.('draw');
    this.stars.setCompletion?.(0);
    this.cards.forEach((card, index) => {
      card.clearFront();
      card.setFaceDown();
      card.group.visible = index < SHUFFLE_CARD_COUNT;
      const angle = (index % 5 - 2) * 0.006;
      applyPose(card.group, pose((index % 3 - 1) * 0.006, -0.14 + index * 0.002, 0.2 + index * CARD_GAP, 0, 0, angle, 0.99));
    });
    this.spreadCards.forEach((_, index) => {
      this.altar.setNodeState(index, 'dormant');
    });
    this.setCameraPose(this.cameraPose('home'));
  }

  async beginShuffle() {
    this.stage = 'shuffle';
    const visualDeck = this.cards.slice(0, SHUFFLE_CARD_COUNT);
    visualDeck.forEach((card) => { card.group.visible = true; card.clearFront(); card.setFaceDown(); });
    await Promise.all([
      this.animateCameraPose(this.cameraPose('shuffle'), 520),
      this.animateSet(visualDeck.map((card, index) => ({ card, target: pose((index % 3 - 1) * 0.01, 0.04 + index * 0.004, 0.3 + index * CARD_GAP, 0, 0, (index % 5 - 2) * 0.012, 1) })), 520, 12, easing.outCubic)
    ]);

    await this.animateSet(visualDeck.map((card, index) => {
      const side = index % 2 ? 1 : -1;
      return { card, target: pose(side * (0.32 + (index % 4) * 0.018), 0.08 + (index % 5 - 2) * 0.045, 0.26 + index * CARD_GAP, 0, 0, side * 0.065, 0.84) };
    }), 570, 16, easing.inOutCubic);

    await this.animateSet(visualDeck.map((card, index) => ({
      card,
      target: pose((index % 2 ? 1 : -1) * (0.075 + (index % 3) * 0.018), (index - (SHUFFLE_CARD_COUNT - 1) / 2) * 0.016, 0.24 + index * CARD_GAP, 0, 0, (index - (SHUFFLE_CARD_COUNT - 1) / 2) * 0.012, 1)
    })), 760, 22, easing.inOutCubic);

    await this.animateSet(visualDeck.map((card, index) => ({ card, target: pose((index % 3 - 1) * 0.008, -0.12 + index * 0.003, 0.28 + index * CARD_GAP, 0, 0, (index % 5 - 2) * 0.005, 1) })), 510, 12, easing.outCubic);

    this.prepareDrawPool();
    await Promise.all([
      this.animateCameraPose(this.cameraPose('draw'), 540),
      this.layoutDraw(true, 540)
    ]);
    this.altar.setNodeFrame?.('draw');
    this.stage = 'draw';
  }

  prepareDrawPool() {
    this.drawPool = this.cards.slice(0, DRAW_POOL_COUNT);
    this.unusedPool = this.cards.slice(DRAW_POOL_COUNT);
    this.drawOffset = 0;
    const center = (this.drawPool.length - 1) / 2;
    this.drawPool.forEach((card, index) => {
      card.clearFront();
      card.setFaceDown();
      card.group.visible = true;
      card.group.userData.fanPhase = index - center;
    });
    this.unusedPool.forEach((card) => { card.clearFront(); card.group.visible = false; });
  }

  fanPose(index) {
    const center = (this.drawPool.length - 1) / 2;
    const card = this.drawPool[index];
    return fanLayerPose(index - center - this.drawOffset, this.viewportProfile, card?.group.userData.fanPhase || 0);
  }

  currentDrawCard() {
    if (!this.drawPool.length) return null;
    return this.drawPool[Math.floor(this.drawPool.length / 2)];
  }

  async layoutDraw(animate = false, duration = 300) {
    const entries = this.drawPool.map((card, index) => ({ card, target: this.fanPose(index) }));
    if (animate) await this.animateSet(entries, duration, 10, easing.outCubic);
    else entries.forEach(({ card, target }) => applyPose(card.group, target));
  }

  cancelFanMotion() {
    if (this.fanMotionRaf) cancelAnimationFrame(this.fanMotionRaf);
    this.fanMotionRaf = 0;
    this.fanVelocity = 0;
  }

  startFanSettle(duration = 140) {
    this.cancelFanMotion();
    const startOffset = this.drawOffset;
    if (reducedMotion() || Math.abs(startOffset) < 0.001) {
      this.drawOffset = 0;
      this.layoutDraw(false);
      return;
    }
    const startedAt = performance.now();
    const frame = (now) => {
      if (this.stage !== 'draw' || this.drawBusy) return;
      const progress = Math.min(1, (now - startedAt) / duration);
      this.drawOffset = THREE.MathUtils.lerp(startOffset, 0, easing.outCubic(progress));
      this.layoutDraw(false);
      if (progress < 1) this.fanMotionRaf = requestAnimationFrame(frame);
      else {
        this.drawOffset = 0;
        this.fanMotionRaf = 0;
        this.layoutDraw(false);
      }
    };
    this.fanMotionRaf = requestAnimationFrame(frame);
  }

  startFanInertia(velocity) {
    this.cancelFanMotion();
    this.fanVelocity = clamp(velocity, -FAN_INERTIA_MAX_VELOCITY, FAN_INERTIA_MAX_VELOCITY);
    if (reducedMotion() || Math.abs(this.fanVelocity) < FAN_INERTIA_STOP_VELOCITY) {
      this.startFanSettle();
      return;
    }
    let lastTime = performance.now();
    const frame = (now) => {
      if (this.stage !== 'draw' || this.drawBusy) return;
      const next = advanceFanInertia(this.drawOffset, this.fanVelocity, (now - lastTime) / 1000);
      lastTime = now;
      this.drawOffset = next.offset;
      this.fanVelocity = next.velocity;
      this.recycleDrawPool();
      this.layoutDraw(false);
      if (Math.abs(this.fanVelocity) >= FAN_INERTIA_STOP_VELOCITY) this.fanMotionRaf = requestAnimationFrame(frame);
      else {
        this.fanMotionRaf = 0;
        this.startFanSettle();
      }
    };
    this.fanMotionRaf = requestAnimationFrame(frame);
  }

  async nudgeFan(direction) {
    if (this.stage !== 'draw' || this.drawBusy || this.fanNudging) return;
    this.cancelFanMotion();
    this.fanNudging = true;
    this.rotateFan(direction);
    this.drawOffset = 0;
    try {
      await this.layoutDraw(true, 260);
    } finally {
      this.fanNudging = false;
    }
  }

  rotateFan(direction) {
    rotateDrawPool(this.drawPool, direction);
    const endpoint = direction > 0 ? this.drawPool.at(-1) : this.drawPool[0];
    const neighbor = direction > 0 ? this.drawPool.at(-2) : this.drawPool[1];
    endpoint.group.userData.fanPhase = neighbor.group.userData.fanPhase + (direction > 0 ? 1 : -1);
  }

  recycleDrawPool() {
    const { offset, steps } = normalizeDrawOffset(this.drawOffset);
    if (steps > 0) for (let step = 0; step < steps; step += 1) this.rotateFan(1);
    if (steps < 0) for (let step = 0; step > steps; step -= 1) this.rotateFan(-1);
    this.drawOffset = offset;
  }

  drawStageSpreadPose(index) {
    return drawStageSpreadPose(index, this.viewportProfile);
  }

  revealPose() {
    return revealPose(this.viewportProfile);
  }

  resultSpreadPose(index) {
    return resultSpreadPose(index, this.viewportProfile);
  }

  readingRetreatPose(slot) {
    return readingRetreatPose(slot, this.viewportProfile);
  }

  readingPose() {
    return readingPose(this.viewportProfile);
  }

  readingExtractionPose(slot) {
    return readingExtractionPose(slot, this.viewportProfile);
  }

  async animateFlight(card, target) {
    const from = copyPose(card.group);
    const arch = from.position.clone().lerp(target.position, 0.52).add(new THREE.Vector3(0, 0.58, 0.56));
    await tween(reducedMotion() ? 0 : 620, (amount) => {
      const t = easing.outCubic(amount);
      const inverse = 1 - t;
      card.group.position.set(
        inverse * inverse * from.position.x + 2 * inverse * t * arch.x + t * t * target.position.x,
        inverse * inverse * from.position.y + 2 * inverse * t * arch.y + t * t * target.position.y,
        inverse * inverse * from.position.z + 2 * inverse * t * arch.z + t * t * target.position.z
      );
      card.group.rotation.set(
        THREE.MathUtils.lerp(from.rotation.x, target.rotation.x, t),
        THREE.MathUtils.lerp(from.rotation.y, target.rotation.y, t),
        THREE.MathUtils.lerp(from.rotation.z, target.rotation.z, t)
      );
      card.group.scale.lerpVectors(from.scale, target.scale, t);
    }, (value) => value);
  }

  async animateReadingOpenPath(card, slot, isCurrent = () => true) {
    if (!isCurrent()) return;
    await this.animateObject(card.group, this.readingExtractionPose(slot), 190, easing.outCubic, isCurrent);
    if (!isCurrent()) return;
    await this.animateObject(card.group, this.readingPose(), 290, easing.inOutCubic, isCurrent);
  }

  async animateReadingReturnPath(card, slot, isCurrent = () => true) {
    if (!isCurrent()) return;
    await this.animateObject(card.group, this.readingExtractionPose(slot), 280, easing.inOutCubic, isCurrent);
    if (!isCurrent()) return;
    await this.animateObject(card.group, slot, 190, easing.inOutCubic, isCurrent);
    if (!isCurrent()) return;
    await this.settleCard(card, slot, isCurrent);
  }

  async settleCard(card, target, isCurrent = () => true) {
    const enlarged = { ...target, scale: target.scale.clone().multiplyScalar(1.01) };
    const compressed = { ...target, scale: target.scale.clone().multiplyScalar(0.998) };
    await this.animateObject(card.group, enlarged, 82, easing.outCubic, isCurrent);
    if (!isCurrent()) return;
    await this.animateObject(card.group, compressed, 70, easing.inOutCubic, isCurrent);
    if (!isCurrent()) return;
    await this.animateObject(card.group, target, 96, easing.outCubic, isCurrent);
  }

  async drawCard(cardData, positionIndex, selectedCard) {
    if (this.stage !== 'draw' || this.drawBusy) throw new Error('当前不在抽牌阶段');
    if (!selectedCard || !this.drawPool.includes(selectedCard)) throw new Error('牌扇中没有可选择的卡牌');
    this.drawBusy = true;
    this.cancelFanMotion();
    const card = selectedCard;
    const start = copyPose(card.group);
    const replacementEntry = replaceDrawPoolCard(this.drawPool, this.unusedPool, card);
    if (!replacementEntry) {
      this.drawBusy = false;
      throw new Error('牌扇中没有可选择的卡牌');
    }

    try {
      const { replacement, entersFromRight } = replacementEntry;
      if (replacement) {
        replacement.clearFront();
        replacement.setFaceDown();
        replacement.group.visible = true;
        const enteringIndex = entersFromRight ? this.drawPool.length - 1 : 0;
        const neighborIndex = entersFromRight ? this.drawPool.length - 2 : 1;
        replacement.group.userData.fanPhase = this.drawPool[neighborIndex].group.userData.fanPhase + (entersFromRight ? 1 : -1);
        const entering = this.fanPose(enteringIndex);
        entering.position.x += entersFromRight ? 0.28 : -0.28;
        entering.position.z -= 0.04;
        applyPose(replacement.group, entering);
      }

      this.drawOffset = 0;
      const frontTexture = this.textures.getFront(cardData.id);
      this.altar.awakenNode(positionIndex);
      const tactile = pose(
        start.position.x,
        start.position.y + 0.075,
        start.position.z + 0.1,
        0,
        start.rotation.y,
        start.rotation.z,
        start.scale.x * 1.02
      );
      await this.animateObject(card.group, tactile, 100, easing.outCubic);

      const reveal = this.revealPose();
      const drawCamera = this.cameraPose('draw');
      const revealCamera = {
        position: drawCamera.position,
        target: drawCamera.target.clone().add(new THREE.Vector3(clamp(start.position.x, -0.9, 0.9) * 0.035, 0.028, 0)),
        fov: drawCamera.fov
      };
      await Promise.all([
        this.animateObject(card.group, reveal, 300, easing.outQuint),
        this.layoutDraw(true, 300),
        this.animateCameraPose(revealCamera, 300, easing.outCubic)
      ]);

      card.setCard(cardData, await frontTexture);
      await Promise.all([
        this.animateObject(card.group, pose(reveal.position.x, reveal.position.y, reveal.position.z, 0, Math.PI, 0, reveal.scale.x), 390, easing.inOutCubic),
        this.animateCameraPose(drawCamera, 390)
      ]);
      await pause(110);
      const target = this.drawStageSpreadPose(positionIndex);
      await this.animateFlight(card, target);
      const landingTarget = this.drawStageSpreadPose(positionIndex);
      await this.settleCard(card, landingTarget);
      this.spreadCards[positionIndex] = card;
      card.group.userData.spreadIndex = positionIndex;
      this.altar.setNodeState(positionIndex, 'filled');
      if (positionIndex === 7) this.stage = 'completing';
      return card;
    } finally {
      this.drawBusy = false;
    }
  }

  async completeSpread() {
    this.stage = 'completing';
    await pause(120);
    await tween(260, (amount) => {
      this.altar.sigil.scale.setScalar(1 + amount * 0.045);
      this.altar.setCompletion(amount);
      this.stars.setCompletion?.(amount);
    }, easing.outCubic);
    this.altar.sigil.scale.setScalar(1);
  }

  async openReading(index) {
    if (this.stage !== 'results' || this.reading) return;
    const card = this.spreadCards[index];
    if (!card) return;
    const others = this.spreadCards
      .map((other) => (other && other !== card ? { card: other, slot: copyPose(other.group) } : null))
      .filter(Boolean);
    this.reading = { index, card, slot: copyPose(card.group), others };
    this.stage = 'reading';
    const layoutVersion = this.layoutVersion;
    const isCurrentLayout = () => layoutVersion === this.layoutVersion && this.reading?.card === card;
    this.altar.setReading?.(true);
    const clearing = others.map(({ card: other, slot }) => ({ card: other, target: this.readingRetreatPose(slot) }));
    await this.animateSet(clearing, 160, 0, easing.outCubic, isCurrentLayout);
    if (!isCurrentLayout()) return;
    await Promise.all([
      this.animateReadingOpenPath(card, this.reading.slot, isCurrentLayout),
      this.animateCameraPose(this.cameraPose('reading'), MOTION_TIMING.readingCameraOpen, easing.outCubic, isCurrentLayout)
    ]);
  }

  async closeReading() {
    if (!this.reading) return;
    const { card, slot, others } = this.reading;
    const layoutVersion = this.layoutVersion;
    const isCurrentLayout = () => layoutVersion === this.layoutVersion && this.reading?.card === card;
    const restoring = others.map(({ card: other, slot: otherSlot }) => ({ card: other, target: otherSlot }));
    this.altar.setReading?.(false);
    await Promise.all([
      this.animateReadingReturnPath(card, slot, isCurrentLayout),
      this.animateCameraPose(this.cameraPose('results'), MOTION_TIMING.readingCameraClose, easing.inOutCubic, isCurrentLayout)
    ]);
    if (isCurrentLayout()) await this.animateSet(restoring, 160, 0, easing.outCubic, isCurrentLayout);
    if (!isCurrentLayout()) {
      this.spreadCards.forEach((other, index) => {
        if (other) applyPose(other.group, this.resultSpreadPose(index));
      });
      this.setCameraPose(this.cameraPose('results'));
    }
    this.reading = null;
    this.stage = 'results';
  }

  async toResults() {
    this.stage = 'completing';
    this.drawPool.forEach((card) => { card.group.visible = false; });
    const targets = this.spreadCards.map((card, index) => ({ card, target: this.resultSpreadPose(index) })).filter(({ card }) => card);
    await Promise.all([
      this.animateCameraPose(this.cameraPose('results'), 780, easing.inOutCubic),
      this.animateSet(targets, 680, 14, easing.inOutCubic),
      this.altar.setNodeFrame?.('result', 780)
    ]);
    this.spreadCards.forEach((card, index) => {
      if (card) applyPose(card.group, this.resultSpreadPose(index));
    });
    this.setCameraPose(this.cameraPose('results'));
    this.altar.setCompletion(1);
    this.stars.setCompletion?.(1);
    this.stage = 'results';
  }

  reset() {
    this.toHomeDeck();
    void this.textures.clearFronts();
  }
}
