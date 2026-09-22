import confetti from 'canvas-confetti';

export class CardModal {
  constructor(audioManager, onModalOpen, onModalClose) {
    this.audioManager = audioManager;
    this.onModalOpen = onModalOpen;
    this.onModalClose = onModalClose;

    this.modalEl = document.getElementById('letter-modal');
    this.scrollArea = document.getElementById('letter-scroll-area');
    this.scrollHint = document.getElementById('scroll-hint-badge');
    this.closeBtn = document.getElementById('btn-close-letter');
    this.confettiBtn = document.getElementById('btn-confetti-rain');

    this.setupListeners();
  }

  setupListeners() {
    this.closeBtn?.addEventListener('click', () => this.close());
    
    // Close on backdrop click
    this.modalEl?.querySelector('.modal-backdrop')?.addEventListener('click', () => this.close());

    this.confettiBtn?.addEventListener('click', () => {
      this.triggerRomanticConfetti();
      this.audioManager?.playChimeSound();
    });

    // Hide scroll hint when user scrolls down
    this.scrollArea?.addEventListener('scroll', () => {
      if (this.scrollArea.scrollTop > 30) {
        this.scrollHint?.classList.add('hidden');
      }
    }, { passive: true });
  }

  open() {
    if (!this.modalEl) return;
    this.modalEl.classList.remove('hidden');
    
    // Reset scroll to top
    if (this.scrollArea) {
      this.scrollArea.scrollTop = 0;
    }
    this.scrollHint?.classList.remove('hidden');

    // Play romantic chimes and burst confetti
    this.audioManager?.playChimeSound();
    this.triggerRomanticConfetti();

    if (this.onModalOpen) this.onModalOpen();
  }

  close() {
    if (!this.modalEl) return;
    this.modalEl.classList.add('hidden');
    if (this.onModalClose) this.onModalClose();
  }

  triggerRomanticConfetti() {
    // 1. Golden Yellow Sunflower Petals
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFD54F', '#FFE082', '#FFC107', '#FFA000', '#FFF59D'],
      shapes: ['circle', 'square'],
      scalar: 1.2
    });

    // 2. Romantic Sky Blue & Gold Confetti Burst
    setTimeout(() => {
      confetti({
        particleCount: 45,
        angle: 60,
        spread: 55,
        origin: { x: 0.1, y: 0.65 },
        colors: ['#29B6F6', '#81D4FA', '#0288D1', '#FFD54F'],
        scalar: 1.15
      });
      confetti({
        particleCount: 45,
        angle: 120,
        spread: 55,
        origin: { x: 0.9, y: 0.65 },
        colors: ['#29B6F6', '#81D4FA', '#0288D1', '#FFD54F'],
        scalar: 1.15
      });
    }, 220);
  }
}
