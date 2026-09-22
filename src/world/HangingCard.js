import * as THREE from 'three';

export class HangingCard {
  constructor(scene, meadow, camera, renderer, onCardClick) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.onCardClick = onCardClick;

    this.group = new THREE.Group();
    this.isHovered = false;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.buildHangingCard();
    this.setupInteraction();
  }

  buildHangingCard() {
    // Hanging centered under the floral arch
    this.group.position.set(0, 3.1, 0);

    // 1. Silk Hanging Ribbon from top beam
    const ribbonGeo = new THREE.CylinderGeometry(0.018, 0.018, 1.8, 8);
    const ribbonMat = new THREE.MeshStandardMaterial({
      color: 0xFFD54F,
      roughness: 0.35,
      metalness: 0.5
    });
    const ribbon = new THREE.Mesh(ribbonGeo, ribbonMat);
    ribbon.position.set(0, 0.9, 0);
    this.group.add(ribbon);

    // Ribbon Bow Knot
    const knotGeo = new THREE.TorusGeometry(0.12, 0.035, 8, 16);
    const knot1 = new THREE.Mesh(knotGeo, ribbonMat);
    knot1.position.set(-0.12, 0.08, 0.02);
    knot1.rotation.set(0.2, 0.4, 0.4);
    this.group.add(knot1);

    const knot2 = new THREE.Mesh(knotGeo, ribbonMat);
    knot2.position.set(0.12, 0.08, 0.02);
    knot2.rotation.set(0.2, -0.4, -0.4);
    this.group.add(knot2);

    // 2. Main Love Letter Card / Envelope (Parchment Gold)
    const cardGeo = new THREE.BoxGeometry(1.6, 1.1, 0.08);
    const cardMat = new THREE.MeshStandardMaterial({
      color: 0xFFFBEA,
      roughness: 0.35,
      metalness: 0.15
    });
    this.cardMesh = new THREE.Mesh(cardGeo, cardMat);
    this.cardMesh.position.set(0, -0.45, 0);
    this.cardMesh.castShadow = true;
    this.group.add(this.cardMesh);

    // Golden Outer Border Frame
    const frameGeo = new THREE.BoxGeometry(1.66, 1.16, 0.06);
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0xF59E0B,
      metalness: 0.8,
      roughness: 0.25
    });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.copy(this.cardMesh.position);
    this.group.add(frame);

    // Inscription / Title on the Card front
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFDF5';
    ctx.fillRect(0, 0, 512, 256);

    // Border line
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 6;
    ctx.strokeRect(16, 16, 480, 224);

    // Text
    ctx.fillStyle = '#9A3412';
    ctx.font = 'bold 36px "Playfair Display", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('Para Mi Amada Cindy', 256, 80);

    ctx.fillStyle = '#CA8A04';
    ctx.font = '24px "Montserrat", sans-serif';
    ctx.fillText('🌻 1 Año y 4 Meses 🌻', 256, 125);

    ctx.fillStyle = '#451A03';
    ctx.font = 'italic 20px "Caveat", cursive, sans-serif';
    ctx.fillText('Toca aquí para leer mi carta...', 256, 185);

    const texture = new THREE.CanvasTexture(canvas);
    const labelGeo = new THREE.PlaneGeometry(1.5, 0.98);
    const labelMat = new THREE.MeshBasicMaterial({ map: texture });
    const labelMesh = new THREE.Mesh(labelGeo, labelMat);
    labelMesh.position.set(0, -0.45, 0.045);
    this.group.add(labelMesh);

    // 3. Glowing Heart & Sunflower Wax Seal
    const sealGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.06, 20);
    sealGeo.rotateX(Math.PI / 2);
    const sealMat = new THREE.MeshStandardMaterial({
      color: 0xDC2626,
      roughness: 0.3,
      metalness: 0.3
    });
    const seal = new THREE.Mesh(sealGeo, sealMat);
    seal.position.set(0, -0.45, 0.07);
    this.group.add(seal);

    // 4. Romantic Glowing Particle Halo
    const haloGeo = new THREE.PlaneGeometry(3.0, 2.2);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xFDE047,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    this.halo = new THREE.Mesh(haloGeo, haloMat);
    this.halo.position.set(0, -0.45, -0.04);
    this.group.add(this.halo);

    // Point Light Illuminating the Card
    this.cardLight = new THREE.PointLight(0xFFD54F, 2.2, 5);
    this.cardLight.position.set(0, -0.45, 0.8);
    this.group.add(this.cardLight);

    this.scene.add(this.group);
  }

  setupInteraction() {
    const onPointerMove = (e) => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects([this.cardMesh], false);

      if (intersects.length > 0) {
        if (!this.isHovered) {
          this.isHovered = true;
          document.body.style.cursor = 'pointer';
        }
      } else {
        if (this.isHovered) {
          this.isHovered = false;
          document.body.style.cursor = 'default';
        }
      }
    };

    const onClick = (e) => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects([this.cardMesh], false);

      if (intersects.length > 0 && this.onCardClick) {
        this.onCardClick();
      }
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('click', onClick);
  }

  update(time) {
    // Gentle floating and swaying pendular breeze
    const swayZ = Math.sin(time * 1.5) * 0.07;
    const swayY = Math.cos(time * 1.1) * 0.05;
    this.group.rotation.z = swayZ;
    this.group.rotation.y = swayY;

    // Pulse halo
    const pulse = 0.25 + (Math.sin(time * 3) + 1) * 0.15;
    this.halo.material.opacity = this.isHovered ? pulse * 2 : pulse;
    this.cardLight.intensity = this.isHovered ? 3.0 : 2.0;
  }
}
