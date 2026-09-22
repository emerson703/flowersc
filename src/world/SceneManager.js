import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class SceneManager {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    
    // Warm golden sunset fog and sky
    this.scene.fog = new THREE.FogExp2(0xE5A868, 0.018);
    this.scene.background = new THREE.Color(0xF5BA88);

    this.camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      400
    );
    this.adjustCameraForDevice();

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.container.appendChild(this.renderer.domElement);

    // Smooth & Responsive Orbit Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableRotate = true;
    this.controls.rotateSpeed = 0.9;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.target.set(0, 2.4, 0); // Focus on hanging card
    this.controls.maxPolarAngle = Math.PI / 2 - 0.03; // Prevent dipping below ground
    this.controls.minDistance = 2.0;
    this.controls.maxDistance = 28;
    this.controls.autoRotate = false;
    this.controls.autoRotateSpeed = 0.7;
    this.controls.enablePan = false;
    this.controls.enableZoom = true;
    this.controls.zoomSpeed = 1.0;

    // Multi-touch and mouse configuration
    this.controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN
    };
    this.controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.ROTATE
    };

    this.clock = new THREE.Clock();

    this.setupLighting();
    this.setupSkyDome();
    this.setupSunDisc();

    window.addEventListener('resize', this.onResize.bind(this));
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.onResize(), 150);
    });
  }

  adjustCameraForDevice() {
    const aspect = window.innerWidth / window.innerHeight;
    if (aspect < 0.8) {
      // Mobile portrait mode
      this.camera.fov = 62;
      this.camera.position.set(0, 2.5, 9.2);
    } else if (aspect < 1.2) {
      // Tablets / square screens
      this.camera.fov = 55;
      this.camera.position.set(0, 2.6, 8.4);
    } else {
      // Desktop / landscape screens
      this.camera.fov = 50;
      this.camera.position.set(0, 2.6, 7.8);
    }
    this.camera.updateProjectionMatrix();
  }

  setupLighting() {
    // Soft golden ambient light
    const ambientLight = new THREE.AmbientLight(0xFFE8D0, 0.85);
    this.scene.add(ambientLight);

    // Warm Hemisphere light (Sky gold + Grass bounce)
    const hemiLight = new THREE.HemisphereLight(0xFFE5B4, 0x4E7A42, 0.7);
    this.scene.add(hemiLight);

    // Warm Sunset Directional Light (Golden hour)
    this.sunLight = new THREE.DirectionalLight(0xFFD580, 2.0);
    this.sunLight.position.set(25, 35, 20);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 120;
    
    const d = 25;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0003;
    this.scene.add(this.sunLight);

    // Rim light for golden petal edges
    const backRim = new THREE.DirectionalLight(0xFFA000, 1.0);
    backRim.position.set(-20, 15, -20);
    this.scene.add(backRim);
  }

  setupSkyDome() {
    const skyGeo = new THREE.SphereGeometry(300, 32, 16);
    const skyMat = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(0x3B627E) },
        middleColor: { value: new THREE.Color(0xFFA07A) },
        bottomColor: { value: new THREE.Color(0xFFE4B5) },
        offset: { value: 10 },
        exponent: { value: 0.6 }
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 middleColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition + offset).y;
          vec3 col = mix(bottomColor, middleColor, max(pow(max(h, 0.0), exponent), 0.0));
          col = mix(col, topColor, max(pow(max(h - 0.2, 0.0), exponent * 1.5), 0.0));
          gl_FragColor = vec4(col, 1.0);
        }
      `,
      side: THREE.BackSide
    });

    const sky = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(sky);
  }

  setupSunDisc() {
    const sunGeo = new THREE.CircleGeometry(14, 32);
    const sunMat = new THREE.MeshBasicMaterial({
      color: 0xFFF9C4,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide
    });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    sun.position.set(70, 40, -100);
    sun.lookAt(0, 10, 0);
    this.scene.add(sun);

    const glowGeo = new THREE.CircleGeometry(32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xFFB74D,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.copy(sun.position);
    glow.position.z += 0.4;
    glow.lookAt(0, 10, 0);
    this.scene.add(glow);
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.adjustCameraForDevice();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  render() {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
