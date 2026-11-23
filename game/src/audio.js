export function createAudio() {
  let ctx = null;
  let music = null;
  let muted = false;
  const notes = [146.83, 174.61, 196, 220, 261.63, 293.66];
  const pattern = [0, 2, 3, 4, 3, 2, 4, 1];

  function context() {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function tone(freq, when, dur, type, gainValue) {
    const audio = context();
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(gainValue, when + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    osc.connect(gain).connect(audio.destination);
    osc.start(when);
    osc.stop(when + dur + 0.02);
  }

  function startMusic() {
    if (muted || music) return;
    const audio = context();
    let step = 0;
    const timer = setInterval(() => {
      if (muted || audio.state === "closed") return;
      const now = audio.currentTime;
      tone(notes[pattern[step % pattern.length]], now, 0.42, "triangle", 0.018);
      if (step % 2 === 0) tone(notes[0] / 2, now, 0.5, "sine", 0.02);
      step += 1;
    }, 520);
    music = timer;
  }

  return {
    unlock() {
      context();
      startMusic();
    },
    setMuted(next) {
      muted = next;
      if (muted && music) {
        clearInterval(music);
        music = null;
      } else startMusic();
    },
    spin() {
      if (muted) return;
      const audio = context();
      tone(180, audio.currentTime, 0.12, "sawtooth", 0.015);
    },
    stop(reel) {
      if (muted) return;
      const audio = context();
      tone(320 + reel * 40, audio.currentTime, 0.08, "square", 0.02);
    },
    anticipate() {
      if (muted) return;
      const audio = context();
      tone(520, audio.currentTime, 0.25, "sine", 0.03);
      tone(780, audio.currentTime + 0.08, 0.3, "triangle", 0.02);
    },
    win(level) {
      if (muted) return;
      const audio = context();
      const count = level >= 6 ? 6 : level >= 4 ? 4 : 3;
      for (let i = 0; i < count; i += 1) {
        tone(523 * 2 ** (i / 6), audio.currentTime + i * 0.07, 0.22, "triangle", 0.04);
      }
    },
    feature() {
      if (muted) return;
      const audio = context();
      [392, 494, 587, 784].forEach((freq, i) => tone(freq, audio.currentTime + i * 0.12, 0.35, "sine", 0.04));
    },
  };
}
