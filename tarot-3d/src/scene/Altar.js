import * as THREE from 'three';
import { easing } from '../animation/easing.js';

const DOMAIN_STEP = Math.PI * 2 / 8;
const DRAW_STAR_POINTS_COMPACT = [
  [0, 1], [0.91, 0.7], [0.9, 0], [0.91, -0.7],
  [0, -1], [-0.91, -0.7], [-0.9, 0], [-0.91, 0.7]
];
const DRAW_STAR_POINTS_STANDARD = [
  [0, 1], [0.75, 0.78], [0.9, 0], [0.75, -0.72],
  [0, -0.78], [-0.75, -0.72], [-0.9, 0], [-0.75, 0.78]
];
export const NODE_VISUALS = Object.freeze({
  dormant: { opacity: 0.12, scale: 0.93, glow: 0.03 },
  preglow: { opacity: 0.43, scale: 1, glow: 0.43 },
  active: { opacity: 0.76, scale: 1.08, glow: 0.72 },
  filled: { opacity: 0.78, scale: 1.08, glow: 0.70 }
});

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const lerpVisual = (from, to, amount) => ({
  opacity: THREE.MathUtils.lerp(from.opacity, to.opacity, amount),
  scale: THREE.MathUtils.lerp(from.scale, to.scale, amount),
  glow: THREE.MathUtils.lerp(from.glow, to.glow, amount)
});

export const altarNodePose = (index, layout, frame = 'result') => {
  const angle = Math.PI / 2 - (index % 8) * DOMAIN_STEP;
  const radiusX = frame === 'draw' ? layout.nodeDrawRadiusX : layout.resultRadiusX;
  const radiusY = frame === 'draw' ? layout.nodeDrawRadiusY : layout.resultRadiusY;
  if (frame === 'draw') {
    if (layout.name === 'desktop') {
      return new THREE.Vector3(Math.cos(angle) * radiusX, layout.nodeDrawCenterY + Math.sin(angle) * radiusY, 0.1);
    }
    const points = layout.name === 'compact' ? DRAW_STAR_POINTS_COMPACT : DRAW_STAR_POINTS_STANDARD;
    const [x, y] = points[index % points.length];
    return new THREE.Vector3(
      x * radiusX,
      layout.nodeDrawCenterY + y * radiusY,
      0.1
    );
  }
  const horizontal = Math.abs(Math.cos(angle)) > 0.9;
  const vertical = Math.abs(Math.sin(angle)) > 0.9;
  const outset = vertical
    ? layout.nodeOutsetVertical
    : horizontal
      ? layout.nodeOutsetHorizontal
      : layout.nodeOutsetDiagonal;
  return new THREE.Vector3(
    Math.cos(angle) * (radiusX + outset),
    Math.sin(angle) * (radiusY + outset),
    0.1
  );
};

export const altarNodeWidthScale = (index, layout, frame = 'result') => (
  layout.name === 'standard-mobile' && frame === 'draw' && (index === 2 || index === 6) ? 0.45 : 1
);

const makeSprite = (texture, opacity) => {
  const material = new THREE.SpriteMaterial({
    map: texture,
    color: 0xffffff,
    transparent: true,
    opacity,
    depthWrite: false,
    fog: false,
    toneMapped: false
  });
  return { sprite: new THREE.Sprite(material), material };
};

const createNode = (texture) => {
  const { sprite, material } = makeSprite(texture, NODE_VISUALS.dormant.opacity);
  sprite.userData = {
    state: 'dormant',
    visual: { ...NODE_VISUALS.dormant },
    transition: null,
    positionTransition: null,
    width: 0.13,
    height: 0.235,
    widthScale: 1,
    layoutScale: 1
  };
  sprite.scale.set(sprite.userData.width, sprite.userData.height, 1);
  return sprite;
};

export const createAltar = async (textures) => {
  const [mainTexture, nodeTexture, glintTexture, crescentTexture] = await Promise.all([
    textures.getAltarAsset('altar-main'),
    textures.getAltarAsset('altar-node'),
    textures.getAltarAsset('altar-glint'),
    textures.getAltarAsset('altar-crescent')
  ]);

  const group = new THREE.Group();
  group.position.z = -0.7;
  const ornamentBase = new THREE.Group();
  group.add(ornamentBase);

  const mainMaterial = new THREE.MeshBasicMaterial({
    map: mainTexture,
    color: 0xf0dfc8,
    transparent: true,
    opacity: 0.25,
    depthWrite: false,
    fog: false,
    toneMapped: true
  });
  const mainArt = new THREE.Mesh(new THREE.PlaneGeometry(3.08, 3.08), mainMaterial);
  mainArt.position.z = -0.14;
  mainArt.renderOrder = -2;
  ornamentBase.add(mainArt);

  const crescent = makeSprite(crescentTexture, 0.08);
  crescent.sprite.position.set(-1.18, 0.86, -0.08);
  crescent.sprite.scale.set(0.35, 0.5, 1);
  ornamentBase.add(crescent.sprite);

  const glints = [
    [-1.25, -0.93, 0.12, 0.026],
    [1.28, 0.65, 0.1, 0.023],
    [0.85, -1.12, 0.085, 0.02]
  ].map(([x, y, size, opacity], index) => {
    const glint = makeSprite(glintTexture, opacity);
    glint.sprite.position.set(x, y, -0.06);
    glint.sprite.scale.set(size, size, 1);
    ornamentBase.add(glint.sprite);
    return { ...glint, baseOpacity: opacity, offset: index * 0.84 };
  });

  const sigil = new THREE.Group();
  const pearlMaterial = new THREE.MeshStandardMaterial({
    color: 0xe3d7ee,
    emissive: 0x4c345e,
    emissiveIntensity: 0.3,
    metalness: 0.28,
    roughness: 0.25,
    fog: false
  });
  const pearl = new THREE.Mesh(new THREE.SphereGeometry(0.038, 12, 8), pearlMaterial);
  pearl.scale.set(1, 0.78, 0.56);
  sigil.add(pearl);
  sigil.position.z = 0.12;
  ornamentBase.add(sigil);

  const nodes = Array.from({ length: 8 }, () => {
    const node = createNode(nodeTexture);
    group.add(node);
    return node;
  });

  let completion = 0;
  let readingMix = 0;
  let readingTarget = 0;
  let lastUpdate = 0;
  let layout = null;
  let nodeFrame = 'draw';
  let nodeFrameTransition = null;

  const applyNodeVisual = (node) => {
    const { visual, state, width, height, widthScale, layoutScale } = node.userData;
    const completionResponse = state === 'filled' ? completion : 0;
    const scale = visual.scale * layoutScale * (1 + completionResponse * 0.05);
    const brightness = 0.78 + visual.glow * 0.22 + completionResponse * 0.06;
    node.material.color.setScalar(brightness);
    node.material.opacity = (visual.opacity + completionResponse * 0.075) * (1 - readingMix * 0.62);
    node.scale.set(width * widthScale * scale, height * scale, 1);
  };

  const applyAtmosphere = () => {
    const normalMainOpacity = 0.28 + completion * 0.14;
    mainMaterial.opacity = THREE.MathUtils.lerp(normalMainOpacity, 0.15, readingMix);
    crescent.material.opacity = THREE.MathUtils.lerp(0.08 + completion * 0.04, 0.05, readingMix);
    pearlMaterial.emissiveIntensity = THREE.MathUtils.lerp(0.3 + completion * 0.18, 0.18, readingMix);
    glints.forEach(({ material, baseOpacity }) => {
      material.userData.baseOpacity = THREE.MathUtils.lerp(baseOpacity + completion * 0.02, baseOpacity * 0.45, readingMix);
      material.opacity = material.userData.baseOpacity;
    });
  };

  const transitionNode = (node, target, duration, onDone) => {
    if (reducedMotion()) {
      node.userData.visual = { ...target };
      node.userData.transition = null;
      applyNodeVisual(node);
      onDone?.();
      return;
    }
    node.userData.transition = {
      from: { ...node.userData.visual },
      target: { ...target },
      startedAt: performance.now(),
      duration,
      onDone
    };
  };

  const setNodeState = (index, nextState = 'dormant') => {
    const node = nodes[index];
    if (!node) return;
    const state = nextState === 'idle' ? 'dormant' : nextState;
    const target = NODE_VISUALS[state];
    if (!target) return;
    node.userData.state = state;
    transitionNode(node, target, state === 'dormant' ? 160 : state === 'filled' ? 240 : 180);
  };

  const awakenNode = (index) => {
    const node = nodes[index];
    if (!node) return;
    node.userData.state = 'awakening';
    transitionNode(node, NODE_VISUALS.preglow, 100, () => {
      if (node.userData.state !== 'awakening') return;
      transitionNode(node, NODE_VISUALS.active, 220, () => {
        if (node.userData.state === 'awakening') node.userData.state = 'active';
      });
    });
  };

  const updateNode = (node, now) => {
    const transition = node.userData.transition;
    if (transition) {
      const progress = Math.min(1, (now - transition.startedAt) / transition.duration);
      node.userData.visual = lerpVisual(transition.from, transition.target, easing.outCubic(progress));
      if (progress === 1) {
        node.userData.transition = null;
        transition.onDone?.();
      }
    }
    const positionTransition = node.userData.positionTransition;
    if (positionTransition) {
      const progress = Math.min(1, (now - positionTransition.startedAt) / positionTransition.duration);
      node.position.lerpVectors(positionTransition.from, positionTransition.target, easing.inOutCubic(progress));
      node.userData.widthScale = THREE.MathUtils.lerp(
        positionTransition.fromWidthScale,
        positionTransition.targetWidthScale,
        easing.inOutCubic(progress)
      );
      if (progress === 1) node.userData.positionTransition = null;
    }
    applyNodeVisual(node);
  };

  const refresh = () => {
    applyAtmosphere();
    nodes.forEach(applyNodeVisual);
  };

  const setCompletion = (amount) => {
    completion = THREE.MathUtils.clamp(amount, 0, 1);
    refresh();
  };

  const setReading = (open) => {
    readingTarget = open ? 1 : 0;
    if (reducedMotion()) readingMix = readingTarget;
    refresh();
  };

  const setNodeFrame = (frame, duration = 0) => {
    if (!layout || !['draw', 'result'].includes(frame)) return Promise.resolve();
    nodeFrameTransition?.resolve();
    nodeFrameTransition = null;
    nodeFrame = frame;
    if (duration <= 0 || reducedMotion()) {
      nodes.forEach((node, index) => {
        node.position.copy(altarNodePose(index, layout, frame));
        node.userData.widthScale = altarNodeWidthScale(index, layout, frame);
        node.userData.positionTransition = null;
      });
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      nodeFrameTransition = { resolve };
      nodes.forEach((node, index) => {
        const target = altarNodePose(index, layout, frame);
        node.userData.positionTransition = {
          from: node.position.clone(),
          target,
          fromWidthScale: node.userData.widthScale,
          targetWidthScale: altarNodeWidthScale(index, layout, frame),
          startedAt: performance.now(),
          duration
        };
      });
    });
  };

  const setLayout = (nextLayout) => {
    nodeFrameTransition?.resolve();
    nodeFrameTransition = null;
    layout = nextLayout;
    if (!layout) return;
    const scale = layout.name === 'desktop' ? 1.12 : layout.name === 'compact' ? 0.91 : 1;
    ornamentBase.scale.setScalar(scale);
    nodes.forEach((node, index) => {
      node.position.copy(altarNodePose(index, layout, nodeFrame));
      node.userData.widthScale = altarNodeWidthScale(index, layout, nodeFrame);
      node.userData.positionTransition = null;
      node.userData.layoutScale = layout.nodeScale;
    });
    refresh();
  };

  const update = (now, frozen) => {
    if (frozen) return;
    const elapsed = lastUpdate ? Math.min(0.05, (now - lastUpdate) / 1000) : 0.016;
    lastUpdate = now;
    readingMix = THREE.MathUtils.lerp(readingMix, readingTarget, 1 - Math.exp(-elapsed * 12));
    const breath = Math.sin(now * 0.00042);
    mainArt.scale.setScalar(1 + breath * 0.0025);
    sigil.position.y = breath * 0.003;
    applyAtmosphere();
    glints.forEach(({ material, offset }) => {
      material.opacity = Math.max(0, material.userData.baseOpacity + Math.sin(now * 0.001 + offset) * 0.002);
    });
    nodes.forEach((node) => updateNode(node, now));
    if (nodeFrameTransition && nodes.every((node) => !node.userData.positionTransition)) {
      nodeFrameTransition.resolve();
      nodeFrameTransition = null;
    }
  };

  refresh();

  return {
    group,
    nodes,
    sigil,
    awakenNode,
    setNodeState,
    setCompletion,
    setReading,
    setLayout,
    setNodeFrame,
    update
  };
};
