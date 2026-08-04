export class SoundEngine {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.masterGain = null;
    }

    init() {
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.3;
            this.masterGain.connect(this.ctx.destination);
        } catch (e) {
            console.warn("Web Audio API not supported:", e);
            this.enabled = false;
        }
    }

    resume() {
        if (this.ctx && this.ctx.state === "suspended") {
            this.ctx.resume();
        }
    }

    playTone(freq, duration, type = "square", vol = 0.1) {
        if (!this.enabled || !this.ctx) return;
        this.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.value = vol;
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playNoise(duration, vol = 0.05) {
        if (!this.enabled || !this.ctx) return;
        this.resume();
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const source = this.ctx.createBufferSource();
        const gain = this.ctx.createGain();
        source.buffer = buffer;
        gain.gain.value = vol;
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        source.connect(gain);
        gain.connect(this.masterGain);
        source.start();
    }

    spin() {
        this.playNoise(0.15, 0.03);
        this.playTone(200, 0.1, "sine", 0.05);
    }

    reelStop() {
        this.playTone(400, 0.05, "square", 0.04);
        setTimeout(() => this.playTone(300, 0.05, "square", 0.03), 50);
    }

    win() {
        this.playTone(523, 0.1, "sine", 0.08);
        setTimeout(() => this.playTone(659, 0.1, "sine", 0.08), 100);
        setTimeout(() => this.playTone(784, 0.15, "sine", 0.08), 200);
    }

    bigWin() {
        const notes = [523, 659, 784, 1047, 784, 1047];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.15, "sine", 0.1), i * 120);
        });
    }

    bonus() {
        this.playTone(392, 0.15, "triangle", 0.1);
        setTimeout(() => this.playTone(494, 0.15, "triangle", 0.1), 150);
        setTimeout(() => this.playTone(587, 0.2, "triangle", 0.1), 300);
        setTimeout(() => this.playTone(784, 0.3, "triangle", 0.12), 450);
    }

    click() {
        this.playTone(800, 0.03, "square", 0.02);
    }
}

export const soundEngine = new SoundEngine();
