export class StoryUI {
  constructor(audioManager, cardModal, sceneManager) {
    this.audioManager = audioManager;
    this.cardModal = cardModal;
    this.sceneManager = sceneManager;

    // Elements
    this.startOverlay = document.getElementById('start-overlay');
    this.btnStart = document.getElementById('btn-start-journey');
    this.btnAudio = document.getElementById('btn-audio-toggle');
    this.audioLabel = document.getElementById('audio-label');
    this.btnAutoRotate = document.getElementById('btn-auto-rotate');
    this.btnOpenCardDirect = document.getElementById('btn-open-card-direct');
    this.btnQuickConfetti = document.getElementById('btn-quick-confetti');
    this.helperToast = document.getElementById('helper-toast');

    this.setupListeners();
  }

  setupListeners() {
    // Start Journey Button
    this.btnStart?.addEventListener('click', () => {
      this.startOverlay?.classList.remove('active');
      if (this.startOverlay) this.startOverlay.style.display = 'none';
      this.audioManager.start();
      this.updateAudioButtonState(true);
      this.showToast('🌻 ¡Bienvenida a tu jardín, vida mia! Toca la tarjeta para tu carta');
    });

    // Open Card Button
    this.btnOpenCardDirect?.addEventListener('click', () => {
      this.cardModal.open();
    });

    // Quick confetti
    this.btnQuickConfetti?.addEventListener('click', () => {
      this.cardModal.triggerRomanticConfetti();
      this.audioManager.playChimeSound();
    });

    // Audio toggle
    this.btnAudio?.addEventListener('click', () => {
      const playing = this.audioManager.toggle();
      this.updateAudioButtonState(playing);
    });

    // Auto-Rotate toggle
    this.btnAutoRotate?.addEventListener('click', () => {
      const isAuto = !this.sceneManager.controls.autoRotate;
      this.sceneManager.controls.autoRotate = isAuto;
      this.btnAutoRotate.classList.toggle('active', isAuto);
      this.showToast(isAuto ? '💫 Giro 360° activado' : '🛑 Giro 360° pausado');
    });
  }

  updateAudioButtonState(isPlaying) {
    if (this.btnAudio) {
      this.btnAudio.classList.toggle('active', isPlaying);
    }
    if (this.audioLabel) {
      this.audioLabel.textContent = isPlaying ? 'Pausar' : 'Me puedes pedir lo que sea';
    }
  }

  showToast(message, duration = 4000) {
    if (!this.helperToast) return;
    this.helperToast.textContent = message;
    this.helperToast.style.opacity = '1';

    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      if (this.helperToast) this.helperToast.style.opacity = '0';
    }, duration);
  }
}
