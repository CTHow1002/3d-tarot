import * as THREE from 'three';

const WIDTH = 0.78;
const HEIGHT = 1.17;
const THICKNESS = 0.045;
const FACE_EPSILON = 0.005;

const bodyGeometry = new THREE.BoxGeometry(WIDTH, HEIGHT, THICKNESS);
const edgeGeometry = new THREE.BoxGeometry(WIDTH + 0.026, HEIGHT + 0.026, THICKNESS * 0.72);
const faceGeometry = new THREE.PlaneGeometry(WIDTH - 0.045, HEIGHT - 0.045);
const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x31203b, metalness: 0.22, roughness: 0.55 });
const edgeMaterial = new THREE.MeshStandardMaterial({ color: 0xbe965e, metalness: 0.68, roughness: 0.38 });

export class Card3D {
  constructor(backTexture) {
    this.group = new THREE.Group();
    this.group.userData.card3d = this;
    this.group.renderOrder = 2;

    const edge = new THREE.Mesh(edgeGeometry, edgeMaterial);
    edge.position.z = -0.002;
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    this.group.add(edge, body);

    this.backMaterial = new THREE.MeshStandardMaterial({
      map: backTexture,
      emissive: 0x493551,
      emissiveMap: backTexture,
      emissiveIntensity: 0.14,
      roughness: 0.58,
      metalness: 0.06
    });
    this.back = new THREE.Mesh(faceGeometry, this.backMaterial);
    this.back.position.z = THICKNESS / 2 + FACE_EPSILON;
    this.group.add(this.back);

    this.frontHolder = new THREE.Group();
    this.frontHolder.position.z = -THICKNESS / 2 - FACE_EPSILON;
    this.frontHolder.rotation.y = Math.PI;
    this.frontMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(1.08, 1.06, 1.03), fog: false, toneMapped: false });
    this.front = new THREE.Mesh(faceGeometry, this.frontMaterial);
    this.frontHolder.add(this.front);
    this.group.add(this.frontHolder);

    this.cardId = null;
    this.reversed = false;
    this.group.visible = true;
  }

  setFront(texture, reversed) {
    this.cardId = texture ? this.cardId : null;
    this.frontMaterial.map = texture;
    this.frontMaterial.needsUpdate = true;
    this.reversed = reversed;
    this.front.rotation.z = reversed ? Math.PI : 0;
  }

  setCard(card, texture) {
    this.cardId = card.id;
    this.setFront(texture, card.reversed);
  }

  clearFront() {
    this.cardId = null;
    this.reversed = false;
    this.front.rotation.z = 0;
    this.frontMaterial.map = null;
    this.frontMaterial.needsUpdate = true;
  }

  setFaceDown() {
    this.group.rotation.y = 0;
  }
}
