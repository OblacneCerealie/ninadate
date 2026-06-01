import './style.css';

const EMAIL_TO = 'bastymichalko@gmail.com';

const steps = {
  ask: document.getElementById('step-ask'),
  details: document.getElementById('step-details'),
  done: document.getElementById('step-done'),
};

const btnYes = document.getElementById('btn-yes');
const btnNo = document.getElementById('btn-no');
const btnSubmit = document.getElementById('btn-submit');
const celebration = document.getElementById('celebration');
const formHint = document.getElementById('form-hint');
const finalPickup = document.getElementById('final-pickup');
const finalMovie = document.getElementById('final-movie');
const inviteInner = document.getElementById('invite-inner');
const sketchFrame = document.getElementById('sketch-frame');
const cursorSparkles = document.getElementById('cursor-sparkles');
const finalCard = document.querySelector('.doodle-card--final');

const pickupTime = document.getElementById('pickup-time');
const movieRadios = document.querySelectorAll('input[name="movie-time"]');

const PICKUP_LABEL = 'Kedy pridem po teba?';
const MOVIE_LABEL = 'Ktory cas filmu?';
const STORAGE_KEY = 'ninadate-selections-v1';

let cachedPickupTime = '';

function syncPickupCache() {
  if (pickupTime?.value) {
    cachedPickupTime = pickupTime.value;
  }
}

pickupTime?.addEventListener('input', syncPickupCache);
pickupTime?.addEventListener('change', syncPickupCache);
pickupTime?.addEventListener('blur', syncPickupCache);

function setPageTheme(stepId) {
  const isInvite = stepId === 'step-ask';
  document.body.classList.toggle('page-invite', isInvite);
  document.body.classList.toggle('page-form', !isInvite);
}

// Subtle floating red hearts on invite page
function initHeartsCanvas() {
  const canvas = document.getElementById('hearts-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const hearts = [];
  const count = 18;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < count; i++) {
    hearts.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 8 + Math.random() * 10,
      speed: 0.15 + Math.random() * 0.35,
      drift: (Math.random() - 0.5) * 0.2,
      opacity: 0.06 + Math.random() * 0.1,
      phase: Math.random() * Math.PI * 2,
    });
  }

  function drawHeart(x, y, size, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = '#d32f2f';
    ctx.fillStyle = '#d32f2f';
    ctx.lineWidth = 1.5;
    const s = size / 14;
    ctx.beginPath();
    ctx.moveTo(x, y + 3 * s);
    ctx.bezierCurveTo(x, y, x - 5 * s, y, x - 5 * s, y + 3 * s);
    ctx.bezierCurveTo(x - 5 * s, y + 7 * s, x, y + 10 * s, x, y + 12 * s);
    ctx.bezierCurveTo(x, y + 10 * s, x + 5 * s, y + 7 * s, x + 5 * s, y + 3 * s);
    ctx.bezierCurveTo(x + 5 * s, y, x, y, x, y + 3 * s);
    ctx.stroke();
    ctx.restore();
  }

  function animate() {
    if (!document.body.classList.contains('page-invite')) {
      requestAnimationFrame(animate);
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const t = Date.now() * 0.001;
    hearts.forEach((h) => {
      h.y -= h.speed;
      h.x += h.drift + Math.sin(t + h.phase) * 0.12;
      if (h.y < -20) {
        h.y = canvas.height + 15;
        h.x = Math.random() * canvas.width;
      }
      drawHeart(h.x, h.y, h.size, h.opacity);
    });
    requestAnimationFrame(animate);
  }

  animate();
}

// "Nie" starts below "ano", dodges only in the lower area — never on title/art/ano
function initDodgeButton() {
  const pad = 12;
  const gapBelowYes = 22;
  const blockerPad = 16;

  const blockers = () =>
    document.querySelectorAll('.dodge-blocker');

  function rectWithPad(el) {
    const r = el.getBoundingClientRect();
    return {
      left: r.left - blockerPad,
      top: r.top - blockerPad,
      right: r.right + blockerPad,
      bottom: r.bottom + blockerPad,
    };
  }

  function getSafeBounds() {
    const yes = btnYes.getBoundingClientRect();
    const btnW = btnNo.offsetWidth;
    const btnH = btnNo.offsetHeight;
    const minY = yes.bottom + gapBelowYes;
    const maxY = window.innerHeight - btnH - pad;
    const minX = pad;
    const maxX = window.innerWidth - btnW - pad;
    return { minX, maxX, minY, maxY: Math.max(minY, maxY) };
  }

  function hitsBlocker(x, y) {
    const w = btnNo.offsetWidth;
    const h = btnNo.offsetHeight;
    const btn = { left: x, top: y, right: x + w, bottom: y + h };
    for (const el of blockers()) {
      const b = rectWithPad(el);
      if (
        btn.left < b.right &&
        btn.right > b.left &&
        btn.top < b.bottom &&
        btn.bottom > b.top
      ) {
        return true;
      }
    }
    return false;
  }

  function isValidPosition(x, y) {
    const { minX, maxX, minY, maxY } = getSafeBounds();
    if (x < minX || x > maxX || y < minY || y > maxY) return false;
    return !hitsBlocker(x, y);
  }

  function getStartPosition() {
    const yes = btnYes.getBoundingClientRect();
    const x = yes.left + (yes.width - btnNo.offsetWidth) / 2;
    const y = yes.bottom + gapBelowYes;
    return { x, y };
  }

  function randomFreePosition() {
    const { minX, maxX, minY, maxY } = getSafeBounds();
    if (minY > maxY) return getStartPosition();

    for (let i = 0; i < 50; i++) {
      const x = minX + Math.random() * Math.max(maxX - minX, 0);
      const y = minY + Math.random() * Math.max(maxY - minY, 0);
      if (isValidPosition(x, y)) return { x, y };
    }

    const start = getStartPosition();
    if (isValidPosition(start.x, start.y)) return start;

    const slots = [
      { x: minX, y: minY },
      { x: maxX, y: minY },
      { x: minX, y: maxY },
      { x: maxX, y: maxY },
      start,
    ];
    return slots.find((s) => isValidPosition(s.x, s.y)) || start;
  }

  function placeNo(x, y) {
    const { minX, maxX, minY, maxY } = getSafeBounds();
    let nx = Math.min(Math.max(x, minX), Math.max(maxX, minX));
    let ny = Math.min(Math.max(y, minY), Math.max(maxY, minY));
    if (!isValidPosition(nx, ny)) {
      const pos = randomFreePosition();
      nx = pos.x;
      ny = pos.y;
    }
    btnNo.style.left = `${nx}px`;
    btnNo.style.top = `${ny}px`;
  }

  function moveAway(clientX, clientY) {
    if (!steps.ask.classList.contains('step-active')) return;
    const r = btnNo.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    if (Math.hypot(clientX - cx, clientY - cy) < 100) {
      const pos = randomFreePosition();
      placeNo(pos.x, pos.y);
    }
  }

  document.addEventListener('mousemove', (e) => moveAway(e.clientX, e.clientY));
  document.addEventListener(
    'touchmove',
    (e) => {
      const touch = e.touches[0];
      if (touch) moveAway(touch.clientX, touch.clientY);
    },
    { passive: true }
  );

  btnNo.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
  });

  btnNo.addEventListener('mousedown', (e) => {
    e.preventDefault();
    moveAway(e.clientX, e.clientY);
  });

  function initPosition() {
    const start = getStartPosition();
    placeNo(start.x, start.y);
  }

  requestAnimationFrame(initPosition);
  window.addEventListener('resize', () => {
    if (steps.ask.classList.contains('step-active')) initPosition();
  });
}

function initCursorSparkles() {
  if (!cursorSparkles) return;
  let last = 0;
  const gap = 90;

  document.addEventListener('mousemove', (e) => {
    if (!document.body.classList.contains('page-invite')) return;
    const now = Date.now();
    if (now - last < gap) return;
    last = now;

    const dot = document.createElement('span');
    dot.className = 'cursor-dot';
    dot.style.left = `${e.clientX}px`;
    dot.style.top = `${e.clientY}px`;
    dot.style.width = `${4 + Math.random() * 4}px`;
    dot.style.height = dot.style.width;
    cursorSparkles.appendChild(dot);
    setTimeout(() => dot.remove(), 700);
  });
}

function flashCinema() {
  sketchFrame?.classList.add('cinema-flash');
  setTimeout(() => sketchFrame?.classList.remove('cinema-flash'), 500);
}

function playMiniCelebration() {
  const colors = ['#d32f2f', '#e57373', '#ffcdd2'];
  for (let i = 0; i < 24; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = `${40 + Math.random() * 20}%`;
    piece.style.top = `${30 + Math.random() * 20}%`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = `${1.2 + Math.random()}s`;
    piece.style.width = '5px';
    piece.style.height = '5px';
    celebration.appendChild(piece);
    setTimeout(() => piece.remove(), 2500);
  }
}

function playCelebration() {
  flashCinema();
  const colors = ['#d32f2f', '#e57373', '#fcf5e8', '#b71c1c', '#ffcdd2'];
  const marks = ['♥', '✦', '♥', '·', '♥'];

  for (let i = 0; i < 50; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = `${2 + Math.random() * 2}s`;
    piece.style.animationDelay = `${Math.random() * 0.3}s`;
    piece.style.width = `${5 + Math.random() * 6}px`;
    piece.style.height = `${5 + Math.random() * 6}px`;
    celebration.appendChild(piece);
    setTimeout(() => piece.remove(), 4500);
  }

  inviteInner?.classList.add('invite-pop');
  setTimeout(() => inviteInner?.classList.remove('invite-pop'), 600);

  btnYes.classList.add('is-picked');

  for (let i = 0; i < 10; i++) {
    const el = document.createElement('span');
    el.className = 'burst-heart';
    el.textContent = marks[Math.floor(Math.random() * marks.length)];
    const angle = (i / 10) * Math.PI * 2;
    const dist = 70 + Math.random() * 50;
    el.style.setProperty('--tx', `${Math.cos(angle) * dist}px`);
    el.style.setProperty('--ty', `${Math.sin(angle) * dist - 30}px`);
    el.style.left = '50%';
    el.style.top = '42%';
    celebration.appendChild(el);
    setTimeout(() => el.remove(), 1200);
  }
}

function goToStep(fromEl, toEl) {
  fromEl.classList.remove('step-active');
  fromEl.classList.add('step-exit');

  setTimeout(() => {
    fromEl.classList.remove('step-exit');
    toEl.classList.add('step-active');
    setPageTheme(toEl.id);

    if (toEl.id === 'step-done') {
      finalCard?.classList.add('is-reveal');
      restoreFinalSummary();
      playMiniCelebration();
    }
  }, 400);
}

function getPickupValue() {
  syncPickupCache();
  return (pickupTime?.value || cachedPickupTime || '').trim();
}

function getAllSelections() {
  const pickupRaw = getPickupValue();
  const movieRadio = [...movieRadios].find((r) => r.checked);
  const movieRaw = movieRadio?.value?.trim() ?? '';

  if (!pickupRaw && !movieRaw) {
    return { error: 'Vyber prosim cas vyzdvihnutia aj cas filmu' };
  }
  if (!pickupRaw) {
    return { error: 'Vyber prosim cas vyzdvihnutia' };
  }
  if (!movieRaw) {
    return { error: 'Vyber prosim cas filmu (17:30 alebo 20:00)' };
  }

  return {
    pickup: { label: PICKUP_LABEL, value: formatTime(pickupRaw), raw: pickupRaw },
    movie: { label: MOVIE_LABEL, value: movieRaw, raw: movieRaw },
  };
}

function formatSummary(selections) {
  return `${selections.pickup.label} → ${selections.pickup.value}\n${selections.movie.label} → ${selections.movie.value}`;
}

function renderFinalSummary(selections) {
  const pickupEl = document.getElementById('final-pickup');
  const movieEl = document.getElementById('final-movie');
  if (pickupEl) {
    pickupEl.textContent = `${selections.pickup.label} → ${selections.pickup.value}`;
  }
  if (movieEl) {
    movieEl.textContent = `${selections.movie.label} → ${selections.movie.value}`;
  }
}

function persistSelections(selections) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(selections));
  } catch {
    /* private mode etc. */
  }
}

function restoreFinalSummary() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) renderFinalSummary(JSON.parse(raw));
  } catch {
    /* ignore */
  }
}

function showFinalSummary(selections) {
  persistSelections(selections);
  renderFinalSummary(selections);
}

function formatTime(time24) {
  const [h, m] = time24.split(':');
  return `${h}:${m}`;
}

async function sendEmail(selections) {
  const summary = formatSummary(selections);
  const formData = new FormData();
  formData.append('_subject', '💕 Odpoved na pozvanku na date!');
  formData.append('_template', 'table');
  formData.append('_captcha', 'false');
  formData.append('pickup_time', selections.pickup.value);
  formData.append('movie_time', selections.movie.value);
  formData.append('message', `Povedala ano! 🎉\n\n${summary}`);

  const res = await fetch(`https://formsubmit.co/ajax/${EMAIL_TO}`, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: formData,
  });

  if (!res.ok) throw new Error('Email sa nepodarilo odoslat');
  return res.json();
}

function boot() {
  if (!document.getElementById('pickup-time') || !btnYes || !btnNo || !btnSubmit) {
    console.error('ninadate: form elements missing');
    return;
  }

  btnYes.addEventListener('click', () => {
    playCelebration();
    setTimeout(() => goToStep(steps.ask, steps.details), 1400);
  });

  btnSubmit.addEventListener('click', async () => {
    const result = getAllSelections();
    if (result.error) {
      formHint.hidden = false;
      formHint.textContent = result.error;
      if (!getPickupValue()) {
        pickupTime?.focus();
      }
      return;
    }

    formHint.hidden = true;
    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Odosielam...';

    showFinalSummary(result);

    try {
      await sendEmail(result);
    } catch {
      /* FormSubmit may need first-time activation */
    }

    goToStep(steps.details, steps.done);
    requestAnimationFrame(() => renderFinalSummary(result));
  });

  setPageTheme('step-ask');
  initHeartsCanvas();
  initDodgeButton();
  initCursorSparkles();
  movieRadios[0]?.click();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
