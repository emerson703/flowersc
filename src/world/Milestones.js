import gsap from 'gsap';
import * as THREE from 'three';

export class Milestones {
  constructor(sceneManager, onMilestoneChange) {
    this.sm = sceneManager;
    this.onMilestoneChange = onMilestoneChange;
    this.currentIndex = 0;
    this.isTransitioning = false;

    this.steps = [
      {
        index: 0,
        badge: 'Paso 1 de 4',
        title: 'El Inicio de Nuestra Historia',
        description: 'Cindy, cada gran historia de amor comienza con una chispa mágica. Hace 1 año y 4 meses tomamos la decisión más hermosa de caminar juntos, iluminando mi vida desde el primer instante.',
        cameraPos: new THREE.Vector3(0.5, 3.2, 45.5),
        targetPos: new THREE.Vector3(-1.8, 1.8, 41.5)
      },
      {
        index: 1,
        badge: 'Paso 2 de 4',
        title: 'Salud & Sistemas • Unión Perfecta',
        description: 'Tú salvas y cuidas vidas con tu admirable vocación en el área de la salud 🩺❤️, y yo construyo y programo sistemas 💻⚡. Dos mundos distintos pero perfectamente sincronizados por un mismo latido.',
        cameraPos: new THREE.Vector3(-2.0, 3.0, 18.5),
        targetPos: new THREE.Vector3(-3.2, 1.7, 14.0)
      },
      {
        index: 2,
        badge: 'Paso 3 de 4',
        title: '1 Año y 4 Meses de Amor Mágico',
        description: '16 meses compartidos, representados en cada una de estas linternas de luz dorada. 16 meses de risas, complicidad, apoyo incondicional y un amor que no para de crecer.',
        cameraPos: new THREE.Vector3(2.8, 3.3, -9.5),
        targetPos: new THREE.Vector3(3.6, 2.0, -14.0)
      },
      {
        index: 3,
        badge: 'Paso 4 de 4',
        title: 'Tus Flores Amarillas & Carta de Amor',
        description: '¡Llegamos a tu santuario de Flores Amarillas! 🌻💛 Símbolo de luz, admiración y promesa eterna. Toca la tarjeta dorada que cuelga en el centro para abrir tu dedicatoria especial.',
        cameraPos: new THREE.Vector3(0, 3.3, -29.5),
        targetPos: new THREE.Vector3(0, 3.1, -35.0)
      }
    ];
  }

  getCurrentStep() {
    return this.steps[this.currentIndex];
  }

  goToStep(index, immediate = false) {
    if (index < 0 || index >= this.steps.length) return;
    this.currentIndex = index;
    const step = this.steps[index];

    // Disable free orbit during guided travel
    this.sm.setFreeOrbit(false);

    if (immediate) {
      this.sm.camera.position.copy(step.cameraPos);
      this.sm.controls.target.copy(step.targetPos);
      this.sm.camera.lookAt(step.targetPos);
      if (this.onMilestoneChange) this.onMilestoneChange(step);
      return;
    }

    this.isTransitioning = true;
    const currentTarget = this.sm.controls.target.clone();

    gsap.to(this.sm.camera.position, {
      x: step.cameraPos.x,
      y: step.cameraPos.y,
      z: step.cameraPos.z,
      duration: 2.2,
      ease: 'power2.inOut'
    });

    gsap.to(currentTarget, {
      x: step.targetPos.x,
      y: step.targetPos.y,
      z: step.targetPos.z,
      duration: 2.2,
      ease: 'power2.inOut',
      onUpdate: () => {
        this.sm.controls.target.copy(currentTarget);
        this.sm.camera.lookAt(currentTarget);
      },
      onComplete: () => {
        this.isTransitioning = false;
        if (this.onMilestoneChange) this.onMilestoneChange(step);
      }
    });

    if (this.onMilestoneChange) this.onMilestoneChange(step);
  }

  next() {
    if (this.currentIndex < this.steps.length - 1) {
      this.goToStep(this.currentIndex + 1);
    }
  }

  prev() {
    if (this.currentIndex > 0) {
      this.goToStep(this.currentIndex - 1);
    }
  }

  zoomToCard() {
    // Cinematic close-up on the hanging card when opening
    this.sm.setFreeOrbit(false);
    const cardCloseCam = new THREE.Vector3(0, 3.1, -33.2);
    const cardLookAt = new THREE.Vector3(0, 3.1, -35.0);

    gsap.to(this.sm.camera.position, {
      x: cardCloseCam.x,
      y: cardCloseCam.y,
      z: cardCloseCam.z,
      duration: 1.4,
      ease: 'power3.inOut'
    });

    const currentTarget = this.sm.controls.target.clone();
    gsap.to(currentTarget, {
      x: cardLookAt.x,
      y: cardLookAt.y,
      z: cardLookAt.z,
      duration: 1.4,
      ease: 'power3.inOut',
      onUpdate: () => {
        this.sm.controls.target.copy(currentTarget);
        this.sm.camera.lookAt(currentTarget);
      }
    });
  }
}
