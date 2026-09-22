import * as THREE from 'three';

export class Flora {
  constructor(scene, meadow) {
    this.scene = scene;
    this.meadow = meadow;
    this.animatedSunflowers = [];
    this.sunflowerGroup = new THREE.Group();
    this.roseGroup = new THREE.Group();
    this.treesGroup = new THREE.Group();

    this.createMaterials();
    this.buildGrandFloralArch();
    this.buildLushSunflowerGarden();
    this.buildSurroundingNature();

    this.scene.add(this.sunflowerGroup);
    this.scene.add(this.roseGroup);
    this.scene.add(this.treesGroup);
  }

  createMaterials() {
    // 1. Sunflower Petal Texture & Gradient
    const petalCanvas = document.createElement('canvas');
    petalCanvas.width = 64;
    petalCanvas.height = 256;
    const pCtx = petalCanvas.getContext('2d');
    
    // Gradient from deep amber base to bright sunshine yellow tip
    const pGrad = pCtx.createLinearGradient(0, 0, 0, 256);
    pGrad.addColorStop(0, '#FF8F00');   // Deep amber base
    pGrad.addColorStop(0.2, '#FFA000'); // Warm orange-gold
    pGrad.addColorStop(0.5, '#FFD54F'); // Radiant yellow
    pGrad.addColorStop(0.9, '#FFEE58'); // Bright sunlight tip
    pGrad.addColorStop(1.0, '#FFF59D'); // Soft highlights
    pCtx.fillStyle = pGrad;
    pCtx.fillRect(0, 0, 64, 256);

    // Subtle petal vein lines
    pCtx.strokeStyle = 'rgba(230, 81, 0, 0.25)';
    pCtx.lineWidth = 1.5;
    for (let x = 12; x <= 52; x += 10) {
      pCtx.beginPath();
      pCtx.moveTo(x, 0);
      pCtx.quadraticCurveTo(x + (x > 32 ? 4 : -4), 140, x, 256);
      pCtx.stroke();
    }

    const petalTexture = new THREE.CanvasTexture(petalCanvas);

    // 2. Sunflower Center Disk Texture (Fibonacci Spiral pattern)
    const diskCanvas = document.createElement('canvas');
    diskCanvas.width = 512;
    diskCanvas.height = 512;
    const dCtx = diskCanvas.getContext('2d');

    // Rich dark chocolate center background
    const dGrad = dCtx.createRadialGradient(256, 256, 10, 256, 256, 256);
    dGrad.addColorStop(0, '#1c0f08');
    dGrad.addColorStop(0.65, '#2e190e');
    dGrad.addColorStop(0.85, '#4a2800');
    dGrad.addColorStop(0.96, '#d97706'); // Golden pollen edge
    dGrad.addColorStop(1.0, '#b45309');
    dCtx.fillStyle = dGrad;
    dCtx.fillRect(0, 0, 512, 512);

    // Draw Fibonacci seed spiral dots
    const numSeeds = 550;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~137.5 degrees
    for (let i = 0; i < numSeeds; i++) {
      const r = Math.sqrt(i) / Math.sqrt(numSeeds) * 235;
      const theta = i * goldenAngle;
      const sx = 256 + Math.cos(theta) * r;
      const sy = 256 + Math.sin(theta) * r;
      const seedSize = 1.8 + (r / 235) * 3.2;

      // Outer rings have golden floret pollen color
      if (r > 175) {
        dCtx.fillStyle = (i % 2 === 0) ? '#fde047' : '#ca8a04';
      } else {
        dCtx.fillStyle = (i % 2 === 0) ? '#1f1309' : '#382012';
      }
      dCtx.beginPath();
      dCtx.arc(sx, sy, seedSize, 0, Math.PI * 2);
      dCtx.fill();
    }

    const diskTexture = new THREE.CanvasTexture(diskCanvas);

    this.materials = {
      petal: new THREE.MeshStandardMaterial({
        map: petalTexture,
        roughness: 0.45,
        metalness: 0.08,
        side: THREE.DoubleSide
      }),
      centerDisk: new THREE.MeshStandardMaterial({
        map: diskTexture,
        roughness: 0.9,
        metalness: 0.05
      }),
      stem: new THREE.MeshStandardMaterial({
        color: 0x416A30,
        roughness: 0.8
      }),
      leaf: new THREE.MeshStandardMaterial({
        color: 0x387829,
        roughness: 0.65,
        side: THREE.DoubleSide
      }),
      sepal: new THREE.MeshStandardMaterial({
        color: 0x2E5B20,
        roughness: 0.85,
        side: THREE.DoubleSide
      }),
      woodArch: new THREE.MeshStandardMaterial({
        color: 0x543D2B,
        roughness: 0.85
      }),
      fairyLight: new THREE.MeshBasicMaterial({
        color: 0xFFF9C4
      }),
      yellowRose: new THREE.MeshStandardMaterial({
        color: 0xFFEE58,
        roughness: 0.4
      }),
      satinRibbon: new THREE.MeshStandardMaterial({
        color: 0xFFD54F,
        roughness: 0.3,
        metalness: 0.4
      })
    };
  }

  // Realistic Curved 3D Sunflower Petal
  createPetalGeometry(length = 1.2, width = 0.36) {
    const geo = new THREE.PlaneGeometry(width, length, 4, 8);
    const pos = geo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i); // along length (-length/2 to +length/2)
      const normY = (y + length / 2) / length; // 0 (base) to 1 (tip)
      let x = pos.getX(i);

      // Taper at base and tip, widest around 45%
      const taper = Math.sin(normY * Math.PI);
      pos.setX(i, x * (0.35 + taper * 0.75));

      // Longitudinal curve (cups inward at base, curls slightly outward at tip)
      const curveZ = -Math.sin(normY * Math.PI) * 0.14 + Math.pow(normY, 3) * 0.08;
      // Transverse curl (V-shape / curved across width)
      const widthCurl = (Math.abs(x) / (width / 2)) * 0.04;
      pos.setZ(i, curveZ + widthCurl);
    }

    geo.computeVertexNormals();
    geo.translate(0, length / 2, 0); // Pivot at the base
    return geo;
  }

  createRealisticSunflower(scale = 1.0) {
    const flower = new THREE.Group();

    // 1. Organic Curved Stem
    const stemPoints = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.04 * scale, 0.8 * scale, -0.02 * scale),
      new THREE.Vector3(-0.06 * scale, 1.8 * scale, 0.05 * scale),
      new THREE.Vector3(0, 2.6 * scale, 0.15 * scale)
    ];
    const stemCurve = new THREE.CatmullRomCurve3(stemPoints);
    const stemGeo = new THREE.TubeGeometry(stemCurve, 16, 0.075 * scale, 8, false);
    const stemMesh = new THREE.Mesh(stemGeo, this.materials.stem);
    stemMesh.castShadow = true;
    flower.add(stemMesh);

    // 2. Large Heart-shaped Leaves
    const leafGeo = new THREE.PlaneGeometry(0.7 * scale, 1.1 * scale, 6, 6);
    const leafPos = leafGeo.attributes.position;
    for (let i = 0; i < leafPos.count; i++) {
      const ly = leafPos.getY(i);
      const normY = (ly + 0.55 * scale) / (1.1 * scale);
      const taper = Math.sin(normY * Math.PI);
      leafPos.setX(i, leafPos.getX(i) * taper);
      leafPos.setZ(i, -Math.sin(normY * Math.PI) * 0.12);
    }
    leafGeo.computeVertexNormals();
    leafGeo.translate(0, 0.55 * scale, 0);

    const leaf1 = new THREE.Mesh(leafGeo, this.materials.leaf);
    leaf1.position.set(0.12 * scale, 1.1 * scale, 0);
    leaf1.rotation.set(0.6, 0.8, -0.7);
    flower.add(leaf1);

    const leaf2 = new THREE.Mesh(leafGeo, this.materials.leaf);
    leaf2.position.set(-0.12 * scale, 1.7 * scale, 0.05 * scale);
    leaf2.rotation.set(0.4, -1.1, 0.8);
    flower.add(leaf2);

    // 3. Flower Head Group
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 2.6 * scale, 0.15 * scale);
    headGroup.rotation.x = -0.38; // Tilted proudly towards the camera/sun

    // Green Calyx / Sepals behind petals
    const sepalCount = 20;
    const sepalGeo = new THREE.ConeGeometry(0.12 * scale, 0.55 * scale, 4);
    sepalGeo.rotateX(Math.PI / 2);
    sepalGeo.translate(0, 0, -0.1 * scale);

    for (let i = 0; i < sepalCount; i++) {
      const angle = (i / sepalCount) * Math.PI * 2;
      const sepal = new THREE.Mesh(sepalGeo, this.materials.sepal);
      sepal.position.set(Math.cos(angle) * 0.58 * scale, Math.sin(angle) * 0.58 * scale, -0.06 * scale);
      sepal.rotation.z = angle - Math.PI / 2;
      sepal.rotation.x = 0.25;
      headGroup.add(sepal);
    }

    // Center Fibonacci Disk Cushion
    const diskGeo = new THREE.CylinderGeometry(0.62 * scale, 0.58 * scale, 0.16 * scale, 32);
    diskGeo.rotateX(Math.PI / 2);
    const disk = new THREE.Mesh(diskGeo, this.materials.centerDisk);
    headGroup.add(disk);

    // Realistic Multi-Layered Petals
    const petalGeoOuter = this.createPetalGeometry(1.25 * scale, 0.38 * scale);
    const petalGeoMid = this.createPetalGeometry(1.05 * scale, 0.34 * scale);
    const petalGeoInner = this.createPetalGeometry(0.85 * scale, 0.28 * scale);

    // Layer 1: Outer Petals (26 petals)
    const numOuter = 26;
    for (let i = 0; i < numOuter; i++) {
      const angle = (i / numOuter) * Math.PI * 2;
      const petal = new THREE.Mesh(petalGeoOuter, this.materials.petal);
      petal.position.set(Math.cos(angle) * 0.58 * scale, Math.sin(angle) * 0.58 * scale, -0.02 * scale);
      petal.rotation.z = angle - Math.PI / 2;
      petal.rotation.x = 0.08 + (Math.sin(i * 3) * 0.05); // Organic slight angle variance
      headGroup.add(petal);
    }

    // Layer 2: Mid Petals (22 petals, offset)
    const numMid = 22;
    for (let i = 0; i < numMid; i++) {
      const angle = (i / numMid) * Math.PI * 2 + 0.14;
      const petal = new THREE.Mesh(petalGeoMid, this.materials.petal);
      petal.position.set(Math.cos(angle) * 0.52 * scale, Math.sin(angle) * 0.52 * scale, 0.03 * scale);
      petal.rotation.z = angle - Math.PI / 2;
      petal.rotation.x = 0.14 + (Math.cos(i * 2) * 0.04);
      headGroup.add(petal);
    }

    // Layer 3: Inner Petals (18 smaller petals hugging the center)
    const numInner = 18;
    for (let i = 0; i < numInner; i++) {
      const angle = (i / numInner) * Math.PI * 2 + 0.28;
      const petal = new THREE.Mesh(petalGeoInner, this.materials.petal);
      petal.position.set(Math.cos(angle) * 0.46 * scale, Math.sin(angle) * 0.46 * scale, 0.07 * scale);
      petal.rotation.z = angle - Math.PI / 2;
      petal.rotation.x = 0.22;
      headGroup.add(petal);
    }

    flower.add(headGroup);

    return {
      group: flower,
      head: headGroup,
      baseRotX: -0.38,
      swaySpeed: 1.0 + Math.random() * 0.8,
      swayPhase: Math.random() * Math.PI * 2
    };
  }

  buildGrandFloralArch() {
    const archGroup = new THREE.Group();
    const archZ = 0;
    const archX = 0;
    archGroup.position.set(archX, 0, archZ);

    // Rustic Pergola Posts
    const postGeo = new THREE.CylinderGeometry(0.18, 0.22, 5.4, 8);

    const leftPost = new THREE.Mesh(postGeo, this.materials.woodArch);
    leftPost.position.set(-3.0, 2.7, 0);
    leftPost.castShadow = true;
    archGroup.add(leftPost);

    const rightPost = new THREE.Mesh(postGeo, this.materials.woodArch);
    rightPost.position.set(3.0, 2.7, 0);
    rightPost.castShadow = true;
    archGroup.add(rightPost);

    // Top Cross Beam
    const beamGeo = new THREE.BoxGeometry(7.2, 0.28, 0.4);
    const topBeam = new THREE.Mesh(beamGeo, this.materials.woodArch);
    topBeam.position.set(0, 5.2, 0);
    topBeam.castShadow = true;
    archGroup.add(topBeam);

    // Curved Upper Trellis
    const archCurveGeo = new THREE.TorusGeometry(3.0, 0.12, 8, 32, Math.PI);
    const archTorus = new THREE.Mesh(archCurveGeo, this.materials.woodArch);
    archTorus.position.set(0, 3.4, 0);
    archGroup.add(archTorus);

    // Fairy String Lights & Yellow Climbing Roses
    const lightCount = 36;
    const lightBulbGeo = new THREE.SphereGeometry(0.07, 8, 8);

    for (let i = 0; i < lightCount; i++) {
      const angle = (i / (lightCount - 1)) * Math.PI;
      const lx = Math.cos(angle) * 3.0;
      const ly = 3.4 + Math.sin(angle) * 1.8;
      const lz = (Math.random() - 0.5) * 0.4;

      const bulb = new THREE.Mesh(lightBulbGeo, this.materials.fairyLight);
      bulb.position.set(lx, ly, lz);
      archGroup.add(bulb);

      // Yellow Climbing Roses
      if (i % 2 === 0) {
        const roseGeo = new THREE.DodecahedronGeometry(0.24, 1);
        const rose = new THREE.Mesh(roseGeo, this.materials.yellowRose);
        rose.position.set(lx + (Math.random() - 0.5) * 0.25, ly + (Math.random() - 0.5) * 0.25, lz);
        rose.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
        archGroup.add(rose);
      }
    }

    // Warm Romantic Point Light on the Arch & Card
    const archGlow = new THREE.PointLight(0xFFD54F, 2.4, 16);
    archGlow.position.set(0, 3.8, 1.4);
    archGroup.add(archGlow);

    this.scene.add(archGroup);
    this.archGroup = archGroup;
  }

  buildLushSunflowerGarden() {
    // 1. Front row featured sunflowers (Ultra detailed, surrounding the camera view)
    const frontPositions = [
      { x: -2.4, z: 2.2, scale: 1.15, rotY: 0.3 },
      { x: -1.3, z: 2.8, scale: 0.95, rotY: 0.1 },
      { x: 1.4, z: 2.9, scale: 1.05, rotY: -0.2 },
      { x: 2.5, z: 2.1, scale: 1.2, rotY: -0.4 },
      // Flanking the sides of the arch
      { x: -3.8, z: 0.8, scale: 1.3, rotY: 0.5 },
      { x: -4.5, z: -0.6, scale: 1.25, rotY: 0.4 },
      { x: 3.8, z: 0.8, scale: 1.35, rotY: -0.5 },
      { x: 4.6, z: -0.5, scale: 1.2, rotY: -0.4 },
      // Background sunflowers framing the card
      { x: -1.8, z: -1.8, scale: 1.1, rotY: 0.2 },
      { x: -0.9, z: -2.2, scale: 1.25, rotY: 0.1 },
      { x: 0.9, z: -2.2, scale: 1.2, rotY: -0.1 },
      { x: 1.8, z: -1.8, scale: 1.15, rotY: -0.2 },
      { x: 0.0, z: -2.6, scale: 1.3, rotY: 0.0 }
    ];

    frontPositions.forEach(p => {
      const flower = this.createRealisticSunflower(p.scale);
      flower.group.position.set(p.x, 0, p.z);
      flower.group.rotation.y = p.rotY;
      this.sunflowerGroup.add(flower.group);
      this.animatedSunflowers.push(flower);
    });

    // 2. Surrounding dense sunflower sea
    const gardenCount = 90;
    for (let i = 0; i < gardenCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 3.8 + Math.random() * 22;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      // Keep opening at the center front where Cindy looks
      if (Math.abs(x) < 1.4 && z > 0 && z < 7) continue;

      const scale = 0.75 + Math.random() * 0.55;
      const flower = this.createRealisticSunflower(scale);
      flower.group.position.set(x, 0, z);
      flower.group.rotation.y = Math.random() * Math.PI * 2;
      this.sunflowerGroup.add(flower.group);
      this.animatedSunflowers.push(flower);
    }
  }

  buildSurroundingNature() {
    // Warm romantic trees on background hills
    const treePositions = [
      { x: -18, z: -14, scale: 1.8 },
      { x: 19, z: -16, scale: 2.0 },
      { x: -26, z: 8, scale: 2.2 },
      { x: 28, z: 6, scale: 2.1 },
      { x: 0, z: -24, scale: 2.4 }
    ];

    treePositions.forEach(p => {
      const tree = this.createStylizedTree(p.scale);
      tree.position.set(p.x, 0, p.z);
      this.treesGroup.add(tree);
    });
  }

  createStylizedTree(scale = 1.0) {
    const tree = new THREE.Group();
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4A3525, roughness: 0.9 });
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x5C8E42, roughness: 0.8, flatShading: true });

    const trunkGeo = new THREE.CylinderGeometry(0.3 * scale, 0.5 * scale, 3.8 * scale, 8);
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = (3.8 * scale) / 2;
    trunk.castShadow = true;
    tree.add(trunk);

    const foliage1 = new THREE.Mesh(new THREE.DodecahedronGeometry(2.0 * scale, 1), foliageMat);
    foliage1.position.y = 3.6 * scale;
    foliage1.castShadow = true;
    tree.add(foliage1);

    const foliage2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.5 * scale, 1), foliageMat);
    foliage2.position.set(0.4 * scale, 5.0 * scale, 0.2 * scale);
    foliage2.castShadow = true;
    tree.add(foliage2);

    return tree;
  }

  update(time) {
    // Natural gentle wind sway across all sunflowers
    this.animatedSunflowers.forEach((f) => {
      const sway = Math.sin(time * f.swaySpeed + f.swayPhase) * 0.07;
      f.head.rotation.x = f.baseRotX + sway;
      f.head.rotation.z = sway * 0.5;
    });
  }
}
