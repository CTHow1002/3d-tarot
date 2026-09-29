import * as THREE from 'three';

const makeMoteTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 64;
  const context = canvas.getContext('2d');
  const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255,255,245,1)');
  gradient.addColorStop(0.18, 'rgba(255,239,203,0.78)');
  gradient.addColorStop(0.48, 'rgba(208,172,234,0.2)');
  gradient.addColorStop(1, 'rgba(120,85,150,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 64, 64);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

const createLayer = (count, radiusRange, zRange, palette) => {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  for (let index = 0; index < count; index += 1) {
    const radius = radiusRange[0] + Math.random() * (radiusRange[1] - radiusRange[0]);
    const angle = Math.random() * Math.PI * 2;
    const color = palette[index % palette.length];
    positions[index * 3] = Math.cos(angle) * radius;
    positions[index * 3 + 1] = Math.sin(angle) * radius * (0.62 + Math.random() * 0.2);
    positions[index * 3 + 2] = zRange[0] + Math.random() * (zRange[1] - zRange[0]);
    colors[index * 3] = color.r;
    colors[index * 3 + 1] = color.g;
    colors[index * 3 + 2] = color.b;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return geometry;
};

export const createStarfield = () => {
  const group = new THREE.Group();
  const distantGeometry = createLayer(260, [2.1, 5.6], [-4.8, -1.9], [
    new THREE.Color(0xcfc7e3),
    new THREE.Color(0x9e93c4),
    new THREE.Color(0xe5d9ca)
  ]);
  const distantMaterial = new THREE.PointsMaterial({
    size: 0.014,
    vertexColors: true,
    transparent: true,
    opacity: 0.42,
    depthWrite: false,
    sizeAttenuation: true
  });
  const distant = new THREE.Points(distantGeometry, distantMaterial);
  group.add(distant);

  const motesGeometry = createLayer(42, [0.75, 3.65], [-2.3, -0.82], [
    new THREE.Color(0xf0ddae),
    new THREE.Color(0xd7c4e4),
    new THREE.Color(0xcda775)
  ]);
  const moteMaterial = new THREE.PointsMaterial({
    map: makeMoteTexture(),
    size: 0.085,
    vertexColors: true,
    transparent: true,
    opacity: 0.33,
    depthWrite: false,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending
  });
  const motes = new THREE.Points(motesGeometry, moteMaterial);
  group.add(motes);

  const setCompletion = (amount) => {
    const level = THREE.MathUtils.clamp(amount, 0, 1);
    distantMaterial.opacity = 0.42 + level * 0.025;
    moteMaterial.opacity = 0.33 + level * 0.035;
  };

  const update = (now, frozen) => {
    if (frozen) return;
    distant.rotation.z = now * 0.000006;
    motes.rotation.z = -now * 0.000018;
    motes.position.y = Math.sin(now * 0.00022) * 0.025;
  };

  setCompletion(0);
  return Object.assign(group, { setCompletion, update });
};
