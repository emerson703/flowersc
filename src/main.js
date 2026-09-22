import './style.css';
import { SceneManager } from './world/SceneManager.js';
import { Meadow } from './world/Meadow.js';
import { Flora } from './world/Flora.js';
import { HangingCard } from './world/HangingCard.js';
import { Particles } from './world/Particles.js';
import { AudioManager } from './audio/AudioManager.js';
import { CardModal } from './ui/CardModal.js';
import { StoryUI } from './ui/StoryUI.js';

class App {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.init();
  }

  init() {
    // 1. Core 3D Scene
    this.sceneManager = new SceneManager(this.container);

    // 2. Garden & Sunflowers
    this.meadow = new Meadow(this.sceneManager.scene);
    this.flora = new Flora(this.sceneManager.scene, this.meadow);
    this.particles = new Particles(this.sceneManager.scene);

    // 3. Audio & Modals
    this.audioManager = new AudioManager();
    this.cardModal = new CardModal(
      this.audioManager,
      () => {
        // Modal opened
      },
      () => {
        // Modal closed
      }
    );

    // 4. Interactive 3D Hanging Love Card
    this.hangingCard = new HangingCard(
      this.sceneManager.scene,
      this.meadow,
      this.sceneManager.camera,
      this.sceneManager.renderer,
      () => {
        this.cardModal.open();
      }
    );

    // 5. Story & Interaction UI
    this.storyUI = new StoryUI(
      this.audioManager,
      this.cardModal,
      this.sceneManager
    );

    // 6. Start Render Loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  animate() {
    requestAnimationFrame(this.animate);

    const elapsedTime = this.sceneManager.clock.getElapsedTime();

    // Update animations
    this.meadow.update(elapsedTime);
    this.flora.update(elapsedTime);
    this.hangingCard.update(elapsedTime);
    this.particles.update(elapsedTime);

    // Render frame
    this.sceneManager.render();
  }
}

// Start application when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  new App();
});
