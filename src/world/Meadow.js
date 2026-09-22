import * as THREE from 'three';

export class Meadow {
  constructor(scene) {
    this.scene = scene;
    this.createTerrain();
    this.createLushGrassField();
    this.createRomanticLanterns();
  }

  getTerrainElevation(x, z) {
    const dist = Math.sqrt(x * x + z * z);
    // Flat serene garden in the center, soft rolling hills around
    const hillFactor = Math.min(1.0, Math.max(0.0, (dist - 8) / 14));
    const wave = Math.sin(x * 0.08) * Math.cos(z * 0.08) * 2.5;
    return wave * hillFactor;
  }

  createTerrain() {
    const size = 120;
    const geo = new THREE.PlaneGeometry(size, size, 80, 80);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      pos.setY(i, this.getTerrainElevation(x, z));
    }
    geo.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({
      color: 0x4A7c34,
      roughness: 0.85,
      metalness: 0.05
    });

    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.receiveShadow = true;
    this.scene.add(this.mesh);
  }

  createLushGrassField() {
    const count = 3000;
    const bladeGeo = new THREE.ConeGeometry(0.08, 0.65, 3);
    bladeGeo.translate(0, 0.325, 0);

    const bladeMat = new THREE.MeshStandardMaterial({
      color: 0x689F38,
      roughness: 0.7,
      flatShading: true
    });

    const instancedGrass = new THREE.InstancedMesh(bladeGeo, bladeMat, count);
    instancedGrass.receiveShadow = true;

    const dummy = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.2 + Math.random() * 45;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = this.getTerrainElevation(x, z);

      const scale = 0.6 + Math.random() * 0.8;
      dummy.position.set(x, y, z);
      dummy.scale.set(scale, scale * (0.8 + Math.random() * 0.5), scale);
      dummy.rotation.set(
        (Math.random() - 0.5) * 0.3,
        Math.random() * Math.PI * 2,
        (Math.random() - 0.5) * 0.3
      );
      dummy.updateMatrix();

      instancedGrass.setMatrixAt(i, dummy.matrix);
    }

    instancedGrass.instanceMatrix.needsUpdate = true;
    this.scene.add(instancedGrass);
  }

  createRomanticLanterns() {
    const lanternPositions = [
      { x: -3.2, z: 2.2 },
      { x: 3.2, z: 2.2 },
      { x: -4.2, z: -1.8 },
      { x: 4.2, z: -1.8 }
    ];

    const postMat = new THREE.MeshStandardMaterial({ color: 0x3E2723, roughness: 0.8 });
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xFFE082 });
    this.lanterns = [];

    lanternPositions.forEach((p, idx) => {
      const group = new THREE.Group();
      const y = this.getTerrainElevation(p.x, p.z);
      group.position.set(p.x, y, p.z);

      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 1.4, 6), postMat);
      post.position.y = 0.7;
      post.castShadow = true;
      group.add(post);

      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), lightMat);
      bulb.position.y = 1.4;
      group.add(bulb);

      const pLight = new THREE.PointLight(0xFFD54F, 1.2, 7);
      pLight.position.y = 1.4;
      group.add(pLight);

      this.scene.add(group);
      this.lanterns.push({ light: pLight, offset: idx });
    });
  }

  update(time) {
    if (this.lanterns) {
      this.lanterns.forEach(l => {
        l.light.intensity = 1.2 + Math.sin(time * 3 + l.offset) * 0.2;
      });
    }
  }
}
