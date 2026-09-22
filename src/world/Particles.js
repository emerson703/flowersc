import * as THREE from 'three';

export class Particles {
  constructor(scene) {
    this.scene = scene;
    this.butterflies = [];

    this.createFallingPetals();
    this.createFireflies();
    this.createButterflies();
  }

  createFallingPetals() {
    this.petalCount = 300;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.petalCount * 3);
    const speeds = new Float32Array(this.petalCount);

    for (let i = 0; i < this.petalCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 22;
      positions[i * 3 + 1] = 0.5 + Math.random() * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 22;
      speeds[i] = 0.3 + Math.random() * 0.7;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.petalPositions = positions;
    this.petalSpeeds = speeds;

    const singlePetalGeo = new THREE.CylinderGeometry(0.09, 0.02, 0.24, 5);
    singlePetalGeo.scale(1.2, 0.15, 1);

    const petalMat = new THREE.MeshStandardMaterial({
      color: 0xFFD54F,
      roughness: 0.45,
      metalness: 0.1,
      side: THREE.DoubleSide
    });

    this.petalsMesh = new THREE.InstancedMesh(singlePetalGeo, petalMat, this.petalCount);
    this.dummy = new THREE.Object3D();
    this.scene.add(this.petalsMesh);
  }

  createFireflies() {
    this.fireflyCount = 100;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.fireflyCount * 3);

    for (let i = 0; i < this.fireflyCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = 0.8 + Math.random() * 6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255, 235, 120, 1)');
    grad.addColorStop(0.4, 'rgba(255, 193, 7, 0.6)');
    grad.addColorStop(1, 'rgba(255, 193, 7, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.PointsMaterial({
      size: 0.42,
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.fireflies = new THREE.Points(geometry, material);
    this.scene.add(this.fireflies);
  }

  createButterflies() {
    const butterflyCount = 6;
    const wingGeo = new THREE.PlaneGeometry(0.32, 0.32);
    wingGeo.translate(0.16, 0, 0);

    const wingMat = new THREE.MeshStandardMaterial({
      color: 0xFFE082,
      emissive: 0xFFA000,
      roughness: 0.35,
      side: THREE.DoubleSide
    });

    for (let i = 0; i < butterflyCount; i++) {
      const bfGroup = new THREE.Group();

      const leftWing = new THREE.Mesh(wingGeo, wingMat);
      const rightWing = new THREE.Mesh(wingGeo, wingMat);
      rightWing.scale.x = -1;

      bfGroup.add(leftWing);
      bfGroup.add(rightWing);

      const radius = 2.5 + Math.random() * 4.5;
      const height = 1.6 + Math.random() * 2.2;

      bfGroup.position.set(Math.sin(i) * radius, height, Math.cos(i) * radius);
      this.scene.add(bfGroup);

      this.butterflies.push({
        group: bfGroup,
        leftWing,
        rightWing,
        centerX: 0,
        centerZ: 0,
        radius: radius,
        height: height,
        speed: 0.7 + Math.random() * 0.6,
        flapSpeed: 14 + Math.random() * 5,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  update(time) {
    // 1. Petals
    for (let i = 0; i < this.petalCount; i++) {
      let x = this.petalPositions[i * 3];
      let y = this.petalPositions[i * 3 + 1];
      let z = this.petalPositions[i * 3 + 2];

      y -= this.petalSpeeds[i] * 0.035;
      x += Math.sin(time * 1.5 + i) * 0.015;
      z += Math.cos(time * 1.2 + i) * 0.015;

      if (y < 0) {
        y = 10 + Math.random() * 3;
        x = (Math.random() - 0.5) * 22;
        z = (Math.random() - 0.5) * 22;
      }

      this.petalPositions[i * 3] = x;
      this.petalPositions[i * 3 + 1] = y;
      this.petalPositions[i * 3 + 2] = z;

      this.dummy.position.set(x, y, z);
      this.dummy.rotation.set(time + i * 0.4, time * 1.2 + i, time * 0.8);
      this.dummy.scale.setScalar(0.75 + Math.sin(i) * 0.25);
      this.dummy.updateMatrix();

      this.petalsMesh.setMatrixAt(i, this.dummy.matrix);
    }
    this.petalsMesh.instanceMatrix.needsUpdate = true;

    // 2. Fireflies
    if (this.fireflies) {
      const pos = this.fireflies.geometry.attributes.position.array;
      for (let i = 0; i < this.fireflyCount; i++) {
        pos[i * 3 + 1] += Math.sin(time * 2 + i) * 0.012;
        pos[i * 3] += Math.cos(time * 1.5 + i) * 0.008;
      }
      this.fireflies.geometry.attributes.position.needsUpdate = true;
    }

    // 3. Butterflies
    this.butterflies.forEach((bf) => {
      const angle = time * bf.speed + bf.phase;
      const x = bf.centerX + Math.cos(angle) * bf.radius;
      const z = bf.centerZ + Math.sin(angle) * bf.radius;
      const y = bf.height + Math.sin(time * 2.5 + bf.phase) * 0.4;

      bf.group.position.set(x, y, z);
      bf.group.rotation.y = -angle + Math.PI / 2;

      const wingAngle = Math.sin(time * bf.flapSpeed) * 0.75;
      bf.leftWing.rotation.y = wingAngle;
      bf.rightWing.rotation.y = -wingAngle;
    });
  }
}
