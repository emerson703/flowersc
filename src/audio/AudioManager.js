// Audio Manager: Reproducción de audio.mp3 ("Me puedes pedir lo que sea") y efectos sonoros
export class AudioManager {
  constructor() {
    this.audio = new Audio('/audio.mp3');
    this.audio.loop = true;
    this.audio.volume = 0.85;
    this.isPlaying = false;
    this.ctx = null;
    this.initialized = false;

    // Web Audio Context for chime / special sound effects
    this.initWebAudioOnGesture();
  }

  initWebAudioOnGesture() {
    const unlock = () => {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      window.removeEventListener('click', unlock);
      window.removeEventListener('touchstart', unlock);
    };

    window.addEventListener('click', unlock, { once: true });
    window.addEventListener('touchstart', unlock, { once: true });
  }

  start() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const playPromise = this.audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.isPlaying = true;
        })
        .catch((error) => {
          console.log('Autoplay prevent or waiting for user gesture:', error);
          this.isPlaying = false;
        });
    }
  }

  stop() {
    this.audio.pause();
    this.isPlaying = false;
  }

  toggle() {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  playChimeSound() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

    notes.forEach((freq, idx) => {
      const noteTime = now + idx * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.linearRampToValueAtTime(0.18, noteTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 1.2);
    });
  }
}
