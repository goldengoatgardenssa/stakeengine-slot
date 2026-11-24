const BASE_NOTES = [196, 247, 294, 330, 294, 247, 220, 196];
const BONUS_NOTES = [262, 330, 392, 440, 392, 349, 330, 294];

export function createAudio() {
  let ctx = null;
  let timer = null;
  let muted = false;
  let sfxVol = 0.8;
  let musicVol = 0.55;
  let theme = "base";

  function context() {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function tone(freq, when, dur, type, gainValue, destinationVol) {
    const audio = context();
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const peak = Math.max(0.0001, gainValue * destinationVol);
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(peak, when + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    osc.connect(gain).connect(audio.destination);
    osc.start(when);
    osc.stop(when + dur + 0.02);
  }

  function loop() {
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
      if (muted) return;
      const notes = theme === "bonus" ? BONUS_NOTES : BASE_NOTES;
      const step = Math.floor(context().currentTime * 2) % notes.length;
      const now = context().currentTime;
      tone(notes[step], now, 0.28, "triangle", 0.05, musicVol);
      if (step % 2 === 0) tone(notes[0] / 2, now, 0.36, "sine", 0.04, musicVol);
    }, theme === "bonus" ? 280 : 360);
  }

  function sting(notes, type, gainValue) {
    if (muted) return;
    const audio = context();
    notes.forEach((freq, index) => tone(freq, audio.currentTime + index * 0.07, 0.18, type, gainValue, sfxVol));
  }

  return {
    unlock() {
      context();
      if (!timer) loop();
    },
    setTheme(next) {
      theme = next === "bonus" ? "bonus" : "base";
      if (timer) loop();
    },
    setMuted(next) {
      muted = next;
      if (muted && timer) {
        clearInterval(timer);
        timer = null;
      } else if (!muted) loop();
    },
    setLevels({ sfx, musicLevel, sound }) {
      if (typeof sfx === "number") sfxVol = sfx;
      if (typeof musicLevel === "number") musicVol = musicLevel;
      if (typeof sound === "boolean") this.setMuted(!sound);
      try {
        localStorage.setItem("le-goaty-audio", JSON.stringify({ sfx: sfxVol, music: musicVol, soundOn: !muted }));
      } catch { /* ignore */ }
    },
    land() { sting([320], "square", 0.03); },
    coin() { sting([660, 880], "sine", 0.04); },
    sack() { sting([196, 262, 392], "triangle", 0.05); },
    bell() { sting([523, 784, 1046], "sine", 0.06); },
    tumble() { sting([140], "sawtooth", 0.02); },
    win(level) {
      const count = level === "legendary" ? 8 : level === "epic" || level === "mega" ? 6 : 4;
      const notes = [];
      for (let i = 0; i < count; i += 1) notes.push(392 * 2 ** (i / 8));
      sting(notes, "triangle", 0.05);
    },
    feature() { sting([349, 440, 523, 698], "sine", 0.06); },
  };
}
