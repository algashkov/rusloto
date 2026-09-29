// Весёлые звуки на Web Audio — без внешних файлов.
const Sound = (() => {
  let ctx = null;
  let muted = false;
  try { muted = localStorage.getItem('rusloto-muted') === '1'; } catch (e) {}

  function ac() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, start, dur, { type = 'sine', vol = 0.25, slide = 0, at = null, dest = null } = {}) {
    const c = ac(), t = at ?? c.currentTime + start;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(dest || c.destination);
    o.start(t); o.stop(t + dur + 0.05);
  }

  function noise(start, dur, { vol = 0.2, from = 400, to = 4000, at = null, dest = null } = {}) {
    const c = ac(), t = at ?? c.currentTime + start;
    const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource(); src.buffer = buf;
    const f = c.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 1.2;
    f.frequency.setValueAtTime(from, t); f.frequency.exponentialRampToValueAtTime(to, t + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.3);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(dest || c.destination);
    src.start(t);
  }

  const fx = {
    hover()  { tone(1200, 0, 0.05, { type: 'triangle', vol: 0.05 }); },
    pop()    { tone(500, 0, 0.12, { type: 'sine', vol: 0.35, slide: 700 }); },
    start()  { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.22, { type: 'square', vol: 0.09 }));
               tone(1047, 0.36, 0.5, { type: 'triangle', vol: 0.2 }); },
    open()   { noise(0, 0.35, { vol: 0.18, from: 300, to: 3000 }); tone(300, 0.05, 0.3, { type: 'triangle', vol: 0.15, slide: 600 }); },
    close()  { noise(0, 0.25, { vol: 0.14, from: 3000, to: 300 }); tone(700, 0, 0.2, { type: 'triangle', vol: 0.12, slide: -400 }); },
    boing()  { tone(180, 0, 0.35, { type: 'sine', vol: 0.3, slide: 500 }); tone(360, 0.08, 0.25, { type: 'sine', vol: 0.12, slide: -200 }); },
    drum() {
      for (let i = 0; i < 14; i++) noise(i * 0.045, 0.05, { vol: 0.08 + i * 0.01, from: 180, to: 260 });
    },
    tada() {
      fx.drum();
      const base = 0.65;
      [[523, 0], [659, 0.1], [784, 0.2], [1047, 0.3]].forEach(([f, s]) => tone(f, base + s, 0.18, { type: 'square', vol: 0.08 }));
      [523, 659, 784, 1047].forEach(f => tone(f, base + 0.45, 0.9, { type: 'triangle', vol: 0.12 }));
      for (let i = 0; i < 6; i++) tone(1800 + Math.random() * 1500, base + 0.5 + i * 0.07, 0.12, { type: 'sine', vol: 0.05 });
    },
    roll() { for (let i = 0; i < 10; i++) tone(400 + i * 60, i * 0.07, 0.06, { type: 'square', vol: 0.05 }); },
  };

  function play(name) {
    if (muted) return;
    try { fx[name] && fx[name](); } catch (e) {}
  }
  function toggle() {
    muted = !muted;
    try { localStorage.setItem('rusloto-muted', muted ? '1' : '0'); } catch (e) {}
    return muted;
  }
  /* ---------- Фоновая музыка: весёлая полька (своя мелодия) ---------- */
  const BPM = 138, STEP = 60 / BPM / 2;           // восьмые
  const _ = null;
  const MELODY = [
    72,_,76,79, 76,72,74,76,   74,_,71,74, 79,77,76,74,
    72,_,76,81, 79,76,72,76,   77,76,74,72, 74,_,_,_,
    79,79,76,72, 79,79,76,72,  74,76,77,79, 77,76,74,71,
    72,74,76,77, 79,77,74,71,  72,_,79,_, 72,_,_,_,
  ];
  const BASS = [48, 43, 45, 41, 48, 43, [41, 43], 48];
  const CHORD = { 48: [64, 67, 72], 43: [62, 67, 71], 45: [64, 69, 72], 41: [65, 69, 72] };
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);

  let musicOn = true;
  try { musicOn = localStorage.getItem('rusloto-music') !== '0'; } catch (e) {}
  let musicGain = null, timer = null, nextTime = 0, step = 0, loop = 0;

  function scheduleStep(t) {
    const bar = Math.floor(step / 8) % 8, beat = step % 8;
    let root = BASS[bar];
    if (Array.isArray(root)) root = root[beat < 4 ? 0 : 1];
    const opt = (o) => Object.assign({ at: t, dest: musicGain }, o);
    // «ум-па»: бас на сильные доли, аккорд на слабые
    if (beat % 4 === 0) {
      tone(hz(root), 0, STEP * 1.6, opt({ type: 'triangle', vol: 0.5 }));
      tone(90, 0, 0.12, opt({ type: 'sine', vol: 0.5, slide: -50 }));
    }
    if (beat % 4 === 2) CHORD[root].forEach(m => tone(hz(m), 0, STEP * 0.8, opt({ type: 'square', vol: 0.05 })));
    noise(0, 0.04, opt({ vol: beat % 2 ? 0.05 : 0.08, from: 6000, to: 9000 }));
    const m = MELODY[step % 64];
    if (m) {
      const alt = loop % 2 === 1;       // каждый второй проход — «колокольчики» октавой выше
      tone(hz(alt ? m + 12 : m), 0, STEP * 0.9, opt({ type: alt ? 'sine' : 'square', vol: alt ? 0.22 : 0.09 }));
      if (!alt) tone(hz(m), 0, STEP * 0.9, opt({ type: 'triangle', vol: 0.18 }));
    }
    step++;
    if (step % 64 === 0) loop++;
  }

  function startMusic() {
    if (timer || !musicOn) return;
    const c = ac();
    if (!musicGain) { musicGain = c.createGain(); musicGain.connect(c.destination); }
    musicGain.gain.setValueAtTime(0.0001, c.currentTime);
    musicGain.gain.exponentialRampToValueAtTime(0.35, c.currentTime + 1);
    nextTime = c.currentTime + 0.1;
    timer = setInterval(() => {
      while (nextTime < c.currentTime + 0.15) { scheduleStep(nextTime); nextTime += STEP; }
    }, 25);
  }
  function stopMusic() {
    if (!timer) return;
    clearInterval(timer); timer = null;
    const c = ac();
    musicGain.gain.cancelScheduledValues(c.currentTime);
    musicGain.gain.setTargetAtTime(0.0001, c.currentTime, 0.1);
  }
  function duck(on) {
    if (!musicGain) return;
    const c = ac();
    musicGain.gain.cancelScheduledValues(c.currentTime);
    musicGain.gain.setTargetAtTime(on ? 0.1 : 0.35, c.currentTime, 0.3);
  }
  function toggleMusic() {
    musicOn = !musicOn;
    try { localStorage.setItem('rusloto-music', musicOn ? '1' : '0'); } catch (e) {}
    musicOn ? startMusic() : stopMusic();
    return musicOn;
  }

  return { play, toggle, startMusic, toggleMusic, duck,
    get muted() { return muted; }, get musicOn() { return musicOn; } };
})();
