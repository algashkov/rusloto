(() => {
  const $ = s => document.querySelector(s);
  const QUESTIONS = buildQuestions();
  const STORE = 'rusloto-done';
  const BARREL_COLORS = ['#e63a2e', '#f4a93b', '#ffd66b', '#fff4dc', '#e63a2e', '#f4a93b', '#ffd66b', '#fff4dc'];
  if (window.GEN_IMAGES.barrel) document.documentElement.style.setProperty('--barrel-img', `url("${new URL(window.GEN_IMAGES.barrel, location.href).href}")`);

  let done = new Set();
  try { done = new Set(JSON.parse(localStorage.getItem(STORE) || '[]')); } catch (e) {}
  const save = () => { try { localStorage.setItem(STORE, JSON.stringify([...done])); } catch (e) {} };

  /* ---------- Фон: летающие бочонки ---------- */
  const bg = $('#bg');
  for (let i = 0; i < 10; i++) {
    const b = document.createElement('span');
    b.className = 'float-barrel';
    b.style.left = Math.random() * 100 + '%';
    b.style.setProperty('--s', 0.6 + Math.random() * 0.9);
    b.style.animationDuration = 14 + Math.random() * 16 + 's';
    b.style.animationDelay = -Math.random() * 30 + 's';
    bg.appendChild(b);
  }

  /* ---------- Логотип ---------- */
  const logo = $('#logo');
  if (window.GEN_IMAGES.logo) {
    logo.innerHTML = `<img src="${window.GEN_IMAGES.logo}" alt="РусЛото">`;
  } else {
    const letters = (w, cls) => [...w].map((ch, i) =>
      `<span class="l ${cls}" style="--i:${i};--c:${BARREL_COLORS[(i * 3 + (cls === 'b' ? 2 : 0)) % 8]}">${ch}</span>`).join('');
    logo.innerHTML = `<div class="logo-line">${letters('Рус', 'a')}</div>
      <div class="logo-line">${letters('Лото', 'b')}<span class="logo-barrel">40</span></div>`;
  }

  /* ---------- Звук ---------- */
  const soundBtn = $('#soundBtn');
  const paintSound = () => soundBtn.textContent = Sound.muted ? '🔇' : '🔊';
  paintSound();
  soundBtn.onclick = () => { Sound.toggle(); paintSound(); Sound.play('pop'); };
  const musicBtn = $('#musicBtn');
  const paintMusic = () => musicBtn.classList.toggle('off', !Sound.musicOn);
  paintMusic();
  musicBtn.onclick = () => { Sound.toggleMusic(); paintMusic(); };

  /* ---------- Экраны ---------- */
  function show(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === id));
  }
  $('#startBtn').onclick = () => {
    Sound.play('start');
    setTimeout(() => Sound.startMusic(), 900);
    burst(window.innerWidth / 2, window.innerHeight * 0.7, 60);
    setTimeout(() => show('board'), 350);
    setTimeout(() => grid.classList.add('ready'), 2000);
  };

  /* ---------- Поле ---------- */
  const grid = $('#grid');
  QUESTIONS.forEach((q, i) => {
    const n = i + 1;
    const cell = document.createElement('button');
    cell.className = 'barrel';
    cell.dataset.n = n;
    cell.style.setProperty('--d', (i * 0.025) + 's');
    cell.innerHTML = `<span class="barrel-num">${n}</span><span class="chip"></span>`;
    cell.onmouseenter = () => Sound.play('hover');
    cell.onclick = () => openCard(n);
    grid.appendChild(cell);
  });

  function paintDone() {
    grid.querySelectorAll('.barrel').forEach(c => c.classList.toggle('done', done.has(+c.dataset.n)));
  }
  paintDone();

  // Клик по логотипу — начать игру заново
  $('#boardLogo').onclick = () => {
    if (done.size && confirm('Начать игру заново? Все бочонки снова станут закрытыми.')) {
      done.clear(); save(); paintDone(); Sound.play('boing');
    }
  };

  /* ---------- Слайд ---------- */
  const modal = $('#modal'), card = modal.querySelector('.card');
  const answerBtn = $('#answerBtn');
  let current = null;

  function openCard(n) {
    current = n;
    const q = QUESTIONS[n - 1], cat = CATS[q.cat];
    $('#cardCat').textContent = `${cat.icon} ${cat.name}`;
    $('#cardNum').textContent = n;
    $('#cardBody').innerHTML = `<div class="side question">${q.q}</div>`;
    answerBtn.hidden = false;
    card.classList.remove('flipped');
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    Sound.play('open');
    Sound.duck(true);
    done.add(n); save(); paintDone();
  }

  answerBtn.onclick = () => {
    const q = QUESTIONS[current - 1];
    answerBtn.hidden = true;
    Sound.play('tada');
    card.classList.add('flipping');
    setTimeout(() => {
      $('#cardBody').innerHTML = `<div class="side answer"><div class="answer-label">Ответ</div>${q.a}</div>`;
      card.classList.remove('flipping');
      card.classList.add('flipped');
    }, 300);
    setTimeout(() => {
      const r = card.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 3, 120);
    }, 650);
  };

  function closeCard() {
    if (!modal.classList.contains('open')) return;
    Sound.play('close');
    Sound.duck(false);
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    const cell = grid.querySelector(`[data-n="${current}"]`);
    if (cell) { cell.classList.add('just'); setTimeout(() => cell.classList.remove('just'), 700); }
    if (done.size === QUESTIONS.length) setTimeout(finale, 500);
  }
  $('#closeBtn').onclick = closeCard;
  modal.onclick = e => { if (e.target === modal) closeCard(); };
  document.addEventListener('keydown', e => {
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape') closeCard();
    if ((e.key === 'Enter' || e.key === ' ') && !answerBtn.hidden) { e.preventDefault(); answerBtn.click(); }
  });

  function finale() {
    Sound.play('tada');
    for (let i = 0; i < 5; i++) setTimeout(() => burst(Math.random() * innerWidth, innerHeight * 0.4, 90), i * 300);
  }

  /* ---------- Конфетти ---------- */
  const cv = $('#confetti'), cx = cv.getContext('2d');
  let parts = [], raf = null;
  const resize = () => { cv.width = innerWidth * devicePixelRatio; cv.height = innerHeight * devicePixelRatio; };
  resize(); addEventListener('resize', resize);

  function burst(x0, y0, count) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2, v = 4 + Math.random() * 9;
      parts.push({
        x: x0, y: y0, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 6,
        w: 6 + Math.random() * 8, h: 4 + Math.random() * 6, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4,
        c: BARREL_COLORS[i % 8], life: 120 + Math.random() * 60,
      });
    }
    if (!raf) raf = requestAnimationFrame(tick);
  }
  function tick() {
    const d = devicePixelRatio;
    cx.clearRect(0, 0, cv.width, cv.height);
    parts = parts.filter(p => p.life-- > 0 && p.y < innerHeight + 40);
    for (const p of parts) {
      p.vy += 0.28; p.vx *= 0.985; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      cx.save(); cx.translate(p.x * d, p.y * d); cx.rotate(p.r);
      cx.fillStyle = p.c; cx.globalAlpha = Math.min(1, p.life / 40);
      cx.fillRect(-p.w * d / 2, -p.h * d / 2, p.w * d, p.h * d * Math.abs(Math.cos(p.r * 2)));
      cx.restore();
    }
    raf = parts.length ? requestAnimationFrame(tick) : (cx.clearRect(0, 0, cv.width, cv.height), null);
  }
})();
