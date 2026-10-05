class SoundEngine {
    constructor() {
        this.ctx = null;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playTone(freq, duration, type = 'sine') {
        if (!this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {
            // Audio context policy fallback
        }
    }

    click() { this.playTone(400, 0.05, 'triangle'); }
    spin() { this.playTone(200, 0.15, 'sawtooth'); }
    reelStop() { this.playTone(150, 0.08, 'sine'); }
    win() { 
        this.playTone(523.25, 0.1); // C5
        setTimeout(() => this.playTone(659.25, 0.15), 100); // E5
    }
    bigWin() {
        [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
            setTimeout(() => this.playTone(f, 0.2), i * 120);
        });
    }
    bonus() {
        [440, 554.37, 659.25, 880].forEach((f, i) => {
            setTimeout(() => this.playTone(f, 0.25), i * 150);
        });
    }
}

export const soundEngine = new SoundEngine();
