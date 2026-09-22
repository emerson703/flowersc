import * as THREE from 'three';

export class Symbols {
  constructor(scene, meadow) {
    this.scene = scene;
    this.meadow = meadow;
    this.group = new THREE.Group();
    this.animatedObjects = [];

    this.createMilestone1Symbol(); // El Inicio
    this.createMilestone2Symbol(); // Salud & Sistemas
    this.createMilestone3Symbol(); // 1 año y 4 meses (16 linternas doradas)

    this.scene.add(this.group);
  }

  createMilestone1Symbol() {
    // Milestone 1: El Inicio de Nuestra Historia (Floating Romantic Astrolabe / Compass)
    const m1Group = new THREE.Group();
    const x = -1.8;
    const z = 41.5;
    const y = this.meadow.getTerrainElevation(x, z) + 1.8;
    m1Group.position.set(x, y, z);

    // Outer Golden Rings
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xFFD54F,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x553C00
    });

    const ring1Geo = new THREE.TorusGeometry(0.9, 0.035, 12, 32);
    const ring1 = new THREE.Mesh(ring1Geo, ringMat);
    m1Group.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(0.68, 0.03, 12, 32);
    const ring2 = new THREE.Mesh(ring2Geo, ringMat);
    ring2.rotation.x = Math.PI / 3;
    m1Group.add(ring2);

    // Central Glowing Crystal Heart
    const heartShape = new THREE.Shape();
    const hx = 0, hy = 0;
    heartShape.moveTo(hx + 0.25, hy + 0.25);
    heartShape.bezierCurveTo(hx + 0.25, hy + 0.25, hx + 0.2, hy, hx, hy);
    heartShape.bezierCurveTo(hx - 0.3, hy, hx - 0.3, hy + 0.35, hx - 0.3, hy + 0.35);
    heartShape.bezierCurveTo(hx - 0.3, hy + 0.55, hx - 0.1, hy + 0.77, hx + 0.25, hy + 1.0);
    heartShape.bezierCurveTo(hx + 0.6, hy + 0.77, hx + 0.8, hy + 0.55, hx + 0.8, hy + 0.35);
    heartShape.bezierCurveTo(hx + 0.8, hy + 0.35, hx + 0.8, hy, hx + 0.5, hy);
    heartShape.bezierCurveTo(hx + 0.35, hy, hx + 0.25, hy + 0.25, hx + 0.25, hy + 0.25);

    const extrudeSettings = { depth: 0.15, bevelEnabled: true, bevelSegments: 3, steps: 2, bevelSize: 0.04, bevelThickness: 0.04 };
    const heartGeo = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
    heartGeo.center();
    heartGeo.scale(0.5, -0.5, 0.5); // Flip right-side up

    const heartMat = new THREE.MeshStandardMaterial({
      color: 0xFF5252,
      emissive: 0xB71C1C,
      roughness: 0.2,
      metalness: 0.4
    });

    const heart = new THREE.Mesh(heartGeo, heartMat);
    m1Group.add(heart);

    // Warm Point Light
    const pLight = new THREE.PointLight(0xFFD54F, 1.2, 5);
    m1Group.add(pLight);

    this.group.add(m1Group);
    this.animatedObjects.push({
      type: 'm1',
      group: m1Group,
      ring1,
      ring2,
      heart
    });
  }

  createMilestone2Symbol() {
    // Milestone 2: Salud & Sistemas (Health & Computer Systems Hologram)
    const m2Group = new THREE.Group();
    const x = -3.2;
    const z = 14;
    const y = this.meadow.getTerrainElevation(x, z) + 1.7;
    m2Group.position.set(x, y, z);

    // Glowing Heartbeat / EKG Pulse Curve
    const ekgPoints = [
      new THREE.Vector3(-1.2, 0, 0),
      new THREE.Vector3(-0.6, 0, 0),
      new THREE.Vector3(-0.4, 0.3, 0),
      new THREE.Vector3(-0.2, -0.4, 0),
      new THREE.Vector3(0.0, 0.9, 0),
      new THREE.Vector3(0.2, -0.7, 0),
      new THREE.Vector3(0.4, 0.2, 0),
      new THREE.Vector3(0.6, 0, 0),
      new THREE.Vector3(1.2, 0, 0)
    ];
    const ekgCurve = new THREE.CatmullRomCurve3(ekgPoints);
    const ekgGeo = new THREE.TubeGeometry(ekgCurve, 40, 0.035, 8, false);
    const ekgMat = new THREE.MeshBasicMaterial({ color: 0x00E676 }); // Medical emerald green glow
    const ekgMesh = new THREE.Mesh(ekgGeo, ekgMat);
    m2Group.add(ekgMesh);

    // Microchip / Binary Nodes & Circuit Core (Systems Engineering)
    const chipGeo = new THREE.BoxGeometry(0.7, 0.7, 0.08);
    const chipMat = new THREE.MeshStandardMaterial({
      color: 0x0D47A1,
      emissive: 0x1976D2,
      roughness: 0.3,
      metalness: 0.8
    });
    const chip = new THREE.Mesh(chipGeo, chipMat);
    chip.rotation.y = 0.4;
    m2Group.add(chip);

    // Binary Circuit Floating Nodes
    const nodeCount = 8;
    const nodeGeo = new THREE.SphereGeometry(0.06, 8, 8);
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0xFFD54F });
    const nodesGroup = new THREE.Group();

    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2;
      const radius = 1.05;
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      node.position.set(Math.cos(angle) * radius, Math.sin(angle) * 0.7, Math.sin(angle * 2) * 0.3);
      nodesGroup.add(node);
    }
    m2Group.add(nodesGroup);

    // Point lights for dual colors (Health Green + Tech Cyan/Gold)
    const healthLight = new THREE.PointLight(0x00E676, 0.8, 4);
    healthLight.position.set(-0.5, 0.4, 0.3);
    m2Group.add(healthLight);

    const techLight = new THREE.PointLight(0x29B6F6, 0.8, 4);
    techLight.position.set(0.5, -0.4, 0.3);
    m2Group.add(techLight);

    this.group.add(m2Group);
    this.animatedObjects.push({
      type: 'm2',
      group: m2Group,
      nodesGroup,
      chip
    });
  }

  createMilestone3Symbol() {
    // Milestone 3: 16 Floating Golden Lanterns representing 16 months (1 year and 4 months)
    const m3Group = new THREE.Group();
    const centerX = 3.6;
    const centerZ = -14;
    const groundY = this.meadow.getTerrainElevation(centerX, centerZ);
    m3Group.position.set(centerX, groundY + 1.2, centerZ);

    const lanternMat = new THREE.MeshStandardMaterial({
      color: 0xFFD54F,
      emissive: 0xFFA000,
      roughness: 0.3,
      metalness: 0.6
    });

    const lanternGeo = new THREE.OctahedronGeometry(0.16, 0);
    this.lanternArray = [];

    const numLanterns = 16;
    for (let i = 0; i < numLanterns; i++) {
      const t = i / numLanterns;
      const angle = t * Math.PI * 2 * 1.5;
      const radius = 1.2 + Math.sin(t * Math.PI) * 0.5;
      const height = t * 2.2;

      const lantern = new THREE.Mesh(lanternGeo, lanternMat);
      lantern.position.set(
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      );
      m3Group.add(lantern);

      this.lanternArray.push({
        mesh: lantern,
        baseY: height,
        phase: i * 0.4
      });
    }

    // Center Badge: 16 Meses de Amor
    const coreLight = new THREE.PointLight(0xFFD54F, 1.4, 6);
    coreLight.position.set(0, 1.1, 0);
    m3Group.add(coreLight);

    this.group.add(m3Group);
    this.animatedObjects.push({
      type: 'm3',
      group: m3Group,
      lanterns: this.lanternArray
    });
  }

  update(time) {
    this.animatedObjects.forEach((obj) => {
      if (obj.type === 'm1') {
        obj.ring1.rotation.y = time * 0.8;
        obj.ring1.rotation.x = time * 0.4;
        obj.ring2.rotation.y = -time * 0.6;
        obj.ring2.rotation.z = time * 0.5;
        obj.heart.position.y = Math.sin(time * 2) * 0.08;
      } else if (obj.type === 'm2') {
        obj.nodesGroup.rotation.z = time * 0.7;
        obj.chip.rotation.y = time * 0.9;
        obj.group.position.y += Math.sin(time * 1.5) * 0.002;
      } else if (obj.type === 'm3') {
        obj.group.rotation.y = time * 0.25;
        obj.lanterns.forEach((l) => {
          l.mesh.position.y = l.baseY + Math.sin(time * 2 + l.phase) * 0.1;
        });
      }
    });
  }
}
