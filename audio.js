/* ===================== Save Jolli — sound =====================
   All sound is synthesized with the Web Audio API (no files needed,
   works offline). A cheerful melody loops in the background, plus
   little blips for attacks/wins. There's a mute toggle (persisted).  */

const Sound = (function () {
  let ctx = null, master = null;
  let muted = localStorage.getItem("sj_muted") === "1";
  let musicTimer = null, step = 0;

  const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);

  // a bright, simple loop (midi note, beats); 0 = rest
  const MELODY = [
    [72, 1], [76, 1], [79, 1], [76, 1], [74, 1], [77, 1], [74, 1], [71, 1],
    [72, 1], [79, 1], [84, 1], [79, 1], [76, 1], [79, 1], [72, 1], [0, 1],
    [69, 1], [72, 1], [76, 1], [72, 1], [74, 1], [77, 1], [74, 1], [71, 1],
    [72, 2], [67, 1], [72, 1], [76, 2], [72, 2],
  ];
  const BEAT = 0.26;

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = muted ? 0 : 0.5;
      master.connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume();
    return true;
  }

  function tone(f, dur, type, vol, when) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, when);
    g.gain.linearRampToValueAtTime(vol, when + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    o.connect(g); g.connect(master);
    o.start(when); o.stop(when + dur + 0.03);
  }

  function sweep(f1, f2, dur, type, vol) {
    if (!ensure()) return;
    const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f1, t);
    o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.03);
  }

  function fart() {
    if (!ensure()) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(175, t);
    o.frequency.linearRampToValueAtTime(75, t + 0.3);
    // wobble gives it the "braap"
    const lfo = ctx.createOscillator(), lg = ctx.createGain();
    lfo.type = "square"; lfo.frequency.value = 22; lg.gain.value = 30;
    lfo.connect(lg); lg.connect(o.frequency);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.3, t + 0.03);
    g.gain.setValueAtTime(0.28, t + 0.24);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.38);
    o.connect(g); g.connect(master);
    o.start(t); lfo.start(t);
    o.stop(t + 0.4); lfo.stop(t + 0.4);
  }

  function playStep() {
    if (!ctx) return;
    const note = MELODY[step];
    const dur = note[1] * BEAT;
    const now = ctx.currentTime;
    if (note[0] > 0) {
      tone(midi(note[0]), dur * 0.92, "triangle", 0.16, now);
      if (step % 2 === 0) tone(midi(note[0] - 24), dur * 0.92, "sine", 0.12, now); // soft bass
    }
    step = (step + 1) % MELODY.length;
    musicTimer = setTimeout(playStep, dur * 1000);
  }

  function startMusic() {
    if (!ensure()) return;
    if (musicTimer) return;
    step = 0;
    playStep();
  }

  function stopMusic() {
    if (musicTimer) { clearTimeout(musicTimer); musicTimer = null; }
  }

  return {
    start() { if (ensure() && !muted) startMusic(); },
    tap() { if (ensure()) tone(880, 0.05, "square", 0.10, ctx.currentTime); },
    power() { fart(); },
    hit() { if (ensure()) tone(200, 0.07, "sawtooth", 0.14, ctx.currentTime); },
    enemyHit() { sweep(300, 120, 0.22, "sawtooth", 0.2); },
    win() {
      if (!ensure()) return;
      const t = ctx.currentTime;
      [72, 76, 79, 84].forEach((n, i) => tone(midi(n), 0.5, "triangle", 0.22, t + i * 0.12));
    },
    lose() {
      if (!ensure()) return;
      const t = ctx.currentTime;
      [67, 63, 60].forEach((n, i) => tone(midi(n), 0.35, "sawtooth", 0.18, t + i * 0.14));
    },
    toggleMute() {
      muted = !muted;
      localStorage.setItem("sj_muted", muted ? "1" : "0");
      if (master) master.gain.value = muted ? 0 : 0.5;
      if (muted) stopMusic(); else startMusic();
      return muted; // true when now muted
    },
    isMuted() { return muted; },
  };
})();
