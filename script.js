/* ============================================================
   SOZLAMALAR — shu yerni o'zgartir
   ============================================================ */

// Birga bo'lgan kuningiz (YIL-OY-KUN). Buni o'zingizning sanangizga almashtir.
const START_DATE = new Date('2025-01-01T00:00:00');

// "Bir narsa ayt" tugmasi bosilganda chiqadigan so'zlar
const LOVE_MESSAGES = [
  'Gozal, seni juda yaxshi ko‘raman ❤',
  'Sen mening eng go‘zal baxtimsan ✨',
  'Yaxshiki sen borsan 💗',
  'Har kuni seni ko‘proq sevaman 🌹',
  'Sen kulganingda dunyo yorishadi 🌸',
  'Seni deb yuragim tez uradi 💓'
];

// "Yulduz uchir" tugmasi bosilganda chiqadigan so'zlar
const STAR_MESSAGES = [
  'Orzu qil, Gozal... u albatta ro‘yobga chiqadi 🌠',
  'Bu yulduz sening baxting uchun uchdi ✨',
  'Men esa orzu qildim: seni doim baxtli ko‘rish 💫'
];

/* ============================================================
   Elementlar
   ============================================================ */
const body = document.body;
const intro = document.getElementById('intro');
const envelope = document.getElementById('envelope');
const letter = document.getElementById('letter');
const loveBtn = document.getElementById('loveBtn');
const starBtn = document.getElementById('starBtn');
const loveMsg = document.getElementById('loveMsg');
const replayBtn = document.getElementById('replay');
const progress = document.getElementById('progress');
const shootingStar = document.getElementById('shootingStar');
const reveals = document.querySelectorAll('.reveal');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============================================================
   Orqa fon: yulduzlar
   ============================================================ */
(function makeStars() {
  const starsEl = document.getElementById('stars');
  for (let i = 0; i < 70; i++) {
    const s = document.createElement('i');
    const size = 1 + Math.random() * 2;
    s.className = 'star';
    s.style.left = Math.random() * 100 + '%';
    s.style.top = Math.random() * 100 + '%';
    s.style.width = size + 'px';
    s.style.height = size + 'px';
    s.style.animationDelay = Math.random() * 4 + 's';
    s.style.animationDuration = 2 + Math.random() * 3 + 's';
    starsEl.appendChild(s);
  }
})();

/* ============================================================
   Yuraklar va gul barglari (canvas)
   ============================================================ */
const canvas = document.getElementById('hearts');
const ctx = canvas.getContext('2d');
let W = 0, H = 0;
const particles = [];
const COLORS = ['#ff7a96', '#e0607f', '#ffc2d1', '#ff4d6d', '#f9a8c0'];
const PETAL_COLORS = ['#ff9db5', '#ff7a96', '#ffc2d1', '#f06292', '#ffb3c6'];

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resize);
resize();

function drawHeart(x, y, size, color, alpha, rot) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  const s = size / 30;
  ctx.scale(s, s);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 10);
  ctx.bezierCurveTo(-20, -4, -12, -20, 0, -8);
  ctx.bezierCurveTo(12, -20, 20, -4, 0, 10);
  ctx.fill();
  ctx.restore();
}

function drawPetal(x, y, s, color, alpha, rot) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.bezierCurveTo(s * 0.9, -s * 0.6, s * 0.7, s * 0.7, 0, s);
  ctx.bezierCurveTo(-s * 0.7, s * 0.7, -s * 0.9, -s * 0.6, 0, -s);
  ctx.fill();
  ctx.restore();
}

function spawnHeart() {
  particles.push({
    type: 'ambient',
    x: Math.random() * W,
    y: H + 30,
    vy: -(0.4 + Math.random() * 0.9),
    sway: Math.random() * Math.PI * 2,
    swaySpeed: 0.01 + Math.random() * 0.02,
    size: 10 + Math.random() * 20,
    alpha: 0.1 + Math.random() * 0.3,
    rot: (Math.random() - 0.5) * 0.6,
    color: COLORS[(Math.random() * COLORS.length) | 0]
  });
}

function spawnPetal() {
  particles.push({
    type: 'petal',
    x: Math.random() * W,
    y: -20,
    vy: 0.6 + Math.random() * 0.9,
    sway: Math.random() * Math.PI * 2,
    swaySpeed: 0.015 + Math.random() * 0.02,
    size: 6 + Math.random() * 7,
    alpha: 0.25 + Math.random() * 0.35,
    rot: Math.random() * 6,
    vr: (Math.random() - 0.5) * 0.06,
    color: PETAL_COLORS[(Math.random() * PETAL_COLORS.length) | 0]
  });
}

function burst(x, y, count = 40) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 5;
    particles.push({
      type: 'burst',
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      size: 10 + Math.random() * 18,
      rot: Math.random() * 6,
      vr: (Math.random() - 0.5) * 0.2,
      life: 1,
      color: COLORS[(Math.random() * COLORS.length) | 0]
    });
  }
}

let lastSpawn = 0;
function loop(t) {
  ctx.clearRect(0, 0, W, H);

  if (!reduceMotion && t - lastSpawn > 380 && particles.length < 80) {
    if (Math.random() < 0.6) spawnHeart(); else spawnPetal();
    lastSpawn = t;
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];

    if (p.type === 'ambient') {
      p.y += p.vy;
      p.sway += p.swaySpeed;
      p.x += Math.sin(p.sway) * 0.5;
      drawHeart(p.x, p.y, p.size, p.color, p.alpha, p.rot);
      if (p.y < -40) particles.splice(i, 1);
    } else if (p.type === 'petal') {
      p.y += p.vy;
      p.sway += p.swaySpeed;
      p.x += Math.sin(p.sway) * 0.9;
      p.rot += p.vr;
      drawPetal(p.x, p.y, p.size, p.color, p.alpha, p.rot);
      if (p.y > H + 30) particles.splice(i, 1);
    } else {
      p.vy += 0.12;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life -= 0.012;
      drawHeart(p.x, p.y, p.size, p.color, Math.max(p.life, 0), p.rot);
      if (p.life <= 0) particles.splice(i, 1);
    }
  }

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

/* ============================================================
   Musiqa (music.mp3 fayli bo'lsa ishlaydi)
   ============================================================ */
const bgm = document.getElementById('bgm');
const musicBtn = document.getElementById('musicBtn');
let musicReady = false;
bgm.volume = 0.6;

function updateMusicBtn() {
  if (musicReady && !letter.classList.contains('hidden')) {
    musicBtn.classList.remove('hidden');
  }
}
bgm.addEventListener('loadedmetadata', () => { musicReady = true; updateMusicBtn(); });
bgm.addEventListener('play', () => musicBtn.classList.add('playing'));
bgm.addEventListener('pause', () => musicBtn.classList.remove('playing'));
if (bgm.readyState >= 1) musicReady = true;

musicBtn.addEventListener('click', () => {
  if (bgm.paused) bgm.play().catch(() => {});
  else bgm.pause();
});

/* ============================================================
   Pushti kirish ekrani: "Gozal uchun maxsus"
   ============================================================ */
const splash = document.getElementById('splash');
const splashBtn = document.getElementById('splashBtn');
const splashHearts = document.getElementById('splashHearts');
const themeMeta = document.querySelector('meta[name="theme-color"]');

(function buildSplash() {
  // Harflar birin-ketin paydo bo'lishi uchun
  let idx = 0;
  document.querySelectorAll('.sp-line').forEach((line, li) => {
    const words = line.dataset.text.split(' ');
    line.textContent = '';
    words.forEach((word, wi) => {
      const w = document.createElement('span');
      w.className = 'sp-word';
      Array.from(word).forEach((ch) => {
        const s = document.createElement('span');
        s.className = 'sp-letter';
        s.textContent = ch;
        s.style.animationDelay = (0.5 + idx * 0.075 + li * 0.35) + 's';
        idx++;
        w.appendChild(s);
      });
      line.appendChild(w);
      if (wi < words.length - 1) line.appendChild(document.createTextNode(' '));
    });
  });

  // Suzib yuruvchi yuraklar
  for (let i = 0; i < 22; i++) {
    const h = document.createElement('span');
    h.className = 'sp-heart';
    h.textContent = Math.random() < 0.7 ? '❤' : '✦';
    h.style.left = Math.random() * 100 + '%';
    h.style.fontSize = 12 + Math.random() * 24 + 'px';
    h.style.animationDuration = 6 + Math.random() * 7 + 's';
    h.style.animationDelay = -Math.random() * 10 + 's';
    splashHearts.appendChild(h);
  }

  // Yozuv tugagach tugma paydo bo'ladi
  setTimeout(() => splashBtn.classList.add('ready'), reduceMotion ? 200 : 4200);
})();

splashBtn.addEventListener('click', () => {
  bgm.play().catch(() => {}); // foydalanuvchi bosganda musiqa boshlanadi
  splash.classList.add('leave');
  if (themeMeta) themeMeta.setAttribute('content', '#2a0a1a');
  setTimeout(() => splash.classList.add('hidden'), 1150);
});

/* ============================================================
   Konvertni ochish
   ============================================================ */
let opened = false;

envelope.addEventListener('click', () => {
  if (opened) return;
  opened = true;
  envelope.classList.add('open');

  bgm.play().catch(() => {});

  const r = envelope.getBoundingClientRect();
  burst(r.left + r.width / 2, r.top + r.height / 2, 30);

  setTimeout(() => intro.classList.add('fade'), 1700);
  setTimeout(showLetter, 2500);
});

function showLetter() {
  intro.classList.add('hidden');
  body.classList.remove('locked');
  letter.classList.remove('hidden');
  window.scrollTo(0, 0);
  updateMusicBtn();
  requestAnimationFrame(() => {
    letter.classList.add('show');
    observeReveals();
    observeMeter();
  });
}

/* ============================================================
   Scroll paytida paydo bo'lish va scroll chizig'i
   ============================================================ */
let observer;
function observeReveals() {
  if (observer) observer.disconnect();
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  reveals.forEach((el) => observer.observe(el));
}

window.addEventListener('scroll', () => {
  const h = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
}, { passive: true });

/* ============================================================
   Sevgi o'lchagichi
   ============================================================ */
const meterEl = document.getElementById('meter');
const meterFill = document.getElementById('meterFill');
const meterNum = document.getElementById('meterNum');
const meterUnit = document.getElementById('meterUnit');
const meterNote = document.getElementById('meterNote');
let meterDone = false;
let meterObserver;

function runMeter() {
  if (meterDone) return;
  meterDone = true;
  const start = performance.now();
  const dur = 2600;

  function step(t) {
    const p = Math.min(1, (t - start) / dur);
    const eased = 1 - Math.pow(1 - p, 3);
    const v = Math.round(eased * 100);
    meterNum.textContent = v;
    meterFill.style.width = v + '%';
    if (p < 1) {
      requestAnimationFrame(step);
    } else {
      setTimeout(() => {
        meterNum.textContent = '∞';
        meterUnit.textContent = '';
        meterFill.classList.add('full');
        meterNote.textContent = 'Bu o‘lchagich meni sig‘dira olmaydi 😄';
        const r = meterFill.getBoundingClientRect();
        burst(r.left + r.width / 2, r.top + r.height / 2, 24);
      }, 500);
    }
  }
  requestAnimationFrame(step);
}

function observeMeter() {
  if (meterObserver) meterObserver.disconnect();
  meterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        runMeter();
        meterObserver.disconnect();
      }
    });
  }, { threshold: 0.6 });
  meterObserver.observe(meterEl);
}

function resetMeter() {
  meterDone = false;
  meterNum.textContent = '0';
  meterUnit.textContent = '%';
  meterFill.style.width = '0%';
  meterFill.classList.remove('full');
  meterNote.textContent = '';
}

/* ============================================================
   Kartochkalar va kuponlar (bosganda aylanadi)
   ============================================================ */
document.querySelectorAll('.card').forEach((card) => {
  card.addEventListener('click', () => card.classList.toggle('flipped'));
});

/* ============================================================
   Xotiralar: rasm topilmasa, o'zi yashirinadi
   ============================================================ */
const gallery = document.getElementById('gallery');

function dropPolaroid(p) {
  p.remove();
  if (!gallery.querySelector('.polaroid')) gallery.remove();
}
gallery.querySelectorAll('.polaroid').forEach((p) => {
  const img = p.querySelector('img');
  if (img.complete && img.naturalWidth === 0) dropPolaroid(p);
  else img.addEventListener('error', () => dropPolaroid(p));
});

/* ============================================================
   Orzular ro'yxati
   ============================================================ */
const wishBtns = document.querySelectorAll('.wish');
const wishMsg = document.getElementById('wishMsg');

wishBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    btn.classList.toggle('done');
    if (btn.classList.contains('done')) {
      const r = btn.querySelector('.check').getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, 14);
    }
    const all = Array.from(wishBtns).every((b) => b.classList.contains('done'));
    wishMsg.textContent = all ? 'Hammasini albatta birga bajaramiz ❤' : '';
    if (all) burst(window.innerWidth / 2, window.innerHeight / 2, 70);
  });
});

/* ============================================================
   Sovg'a qutisi
   ============================================================ */
const giftBox = document.getElementById('giftBox');
const giftMsg = document.getElementById('giftMsg');

giftBox.addEventListener('click', () => {
  if (giftBox.classList.contains('open')) return;
  giftBox.classList.add('open');

  const r = giftBox.getBoundingClientRect();
  burst(r.left + r.width / 2, r.top + r.height / 3, 70);
  if (navigator.vibrate) navigator.vibrate([40, 30, 40]);

  setTimeout(() => {
    giftMsg.textContent = 'Bu sovg‘aning ichida — mening butun yuragim ❤';
    giftMsg.classList.add('show');
  }, 700);
});

function resetGift() {
  giftBox.classList.remove('open');
  giftMsg.classList.remove('show');
  giftMsg.textContent = '';
}

/* ============================================================
   Birga bo'lgan vaqt hisoblagichi
   ============================================================ */
const cDays = document.getElementById('cDays');
const cHours = document.getElementById('cHours');
const cMins = document.getElementById('cMins');
const cSecs = document.getElementById('cSecs');

function updateCounter() {
  let diff = Math.max(0, Date.now() - START_DATE.getTime());
  const days = Math.floor(diff / 86400000);
  diff -= days * 86400000;
  const hours = Math.floor(diff / 3600000);
  diff -= hours * 3600000;
  const mins = Math.floor(diff / 60000);
  diff -= mins * 60000;
  const secs = Math.floor(diff / 1000);

  cDays.textContent = days;
  cHours.textContent = hours;
  cMins.textContent = mins;
  cSecs.textContent = secs;
}
updateCounter();
setInterval(updateCounter, 1000);

/* ============================================================
   Yurak zarbasi
   ============================================================ */
const bigHeart = document.getElementById('bigHeart');
const beatCount = document.getElementById('beatCount');
const beatMsg = document.getElementById('beatMsg');
const BEAT_MSGS = {
  5: 'Yuragim tezlashyapti 💓',
  15: 'Seni o‘ylasam, doim shunday uradi 🥰',
  30: 'Bas, bas, yuragim chiqib ketadi 😄',
  50: 'Bu yurak butunlay sening, Gozal ❤'
};
let beats = 0;

bigHeart.addEventListener('click', () => {
  beats++;
  beatCount.textContent = beats;

  bigHeart.classList.add('tap');
  setTimeout(() => bigHeart.classList.remove('tap'), 120);

  const r = bigHeart.getBoundingClientRect();
  burst(r.left + r.width / 2, r.top + r.height / 2, 6);
  if (navigator.vibrate) navigator.vibrate(20);

  if (BEAT_MSGS[beats]) {
    beatMsg.textContent = BEAT_MSGS[beats];
    if (beats === 50) burst(r.left + r.width / 2, r.top + r.height / 2, 80);
  }
});

function resetBeats() {
  beats = 0;
  beatCount.textContent = '0';
  beatMsg.textContent = '';
}

/* ============================================================
   "Men seni yaxshi ko'raman" — qochuvchi "Yo'q" tugmasi
   ============================================================ */
const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const qButtons = document.getElementById('qButtons');
const qHint = document.getElementById('qHint');
const yesOverlay = document.getElementById('yesOverlay');
const closeYes = document.getElementById('closeYes');

const NO_TEXTS = [
  'Yo‘q',
  'Aniq yo‘qmi? 🤨',
  'Qayta o‘yla 🥺',
  'Bosolmaysan 😜',
  'Qochib ketdim 😅',
  'Ha de, bos 🥰',
  'Yo‘q deganing yolg‘on 😭',
  'Charchamadingmi? 😄'
];
const NO_HINTS = [
  'Yo‘q tugmasi bosilishni xohlamayapti 😄',
  'Unga qo‘l tekkizib bo‘lmaydi 😜',
  '“Men ham” tugmasi kattalashib boryapti, sezdingmi? 🥰',
  'Taslim bo‘l, “Men ham”ni bos ❤'
];

let noEscapes = 0;
let lastDodge = 0;

function overlaps(x, y, w, h, rect) {
  return x < rect.right + 10 && x + w > rect.left - 10 &&
         y < rect.bottom + 10 && y + h > rect.top - 10;
}

function dodgeNo(e) {
  if (e && e.cancelable) e.preventDefault();

  const now = performance.now();
  if (now - lastDodge < 120) return;
  lastDodge = now;
  noEscapes++;

  // Birinchi qochishda tugma body ichiga o'tadi va butun ekran bo'ylab yuradi
  if (!noBtn.classList.contains('flying')) {
    const r = noBtn.getBoundingClientRect();
    document.body.appendChild(noBtn);
    noBtn.classList.add('flying');
    noBtn.style.left = r.left + 'px';
    noBtn.style.top = r.top + 'px';
    void noBtn.offsetWidth; // animatsiya silliq boshlanishi uchun
  }

  noBtn.textContent = NO_TEXTS[noEscapes % NO_TEXTS.length];
  noBtn.style.transform = 'scale(' + Math.max(0.65, 1 - noEscapes * 0.04) + ')';
  yesBtn.style.transform = 'scale(' + Math.min(1.7, 1 + noEscapes * 0.07) + ')';

  const bw = noBtn.offsetWidth;
  const bh = noBtn.offsetHeight;
  const m = 14;
  const maxX = Math.max(m, window.innerWidth - bw - m);
  const maxY = Math.max(m, window.innerHeight - bh - m);
  const yesRect = yesBtn.getBoundingClientRect();
  const curX = parseFloat(noBtn.style.left) || 0;
  const curY = parseFloat(noBtn.style.top) || 0;

  let x, y, tries = 0;
  do {
    x = m + Math.random() * (maxX - m);
    y = m + Math.random() * (maxY - m);
    tries++;
  } while (tries < 25 && (overlaps(x, y, bw, bh, yesRect) || Math.hypot(x - curX, y - curY) < 120));

  noBtn.style.left = x + 'px';
  noBtn.style.top = y + 'px';

  if (noEscapes >= 2) {
    qHint.textContent = NO_HINTS[Math.min(NO_HINTS.length - 1, Math.floor(noEscapes / 3))];
  }
  if (navigator.vibrate) navigator.vibrate(15);
}

noBtn.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') dodgeNo(e); });
noBtn.addEventListener('touchstart', dodgeNo, { passive: false });
noBtn.addEventListener('click', dodgeNo); // klaviatura uchun

yesBtn.addEventListener('click', () => {
  noBtn.style.display = 'none';
  yesOverlay.classList.remove('hidden');
  canvas.style.zIndex = '40';

  burst(window.innerWidth / 2, window.innerHeight / 2, 80);
  [300, 700, 1100, 1600].forEach((delay) => {
    setTimeout(() => {
      burst(Math.random() * window.innerWidth, window.innerHeight * (0.25 + Math.random() * 0.4), 50);
    }, delay);
  });
  if (navigator.vibrate) navigator.vibrate([60, 40, 60]);
});

closeYes.addEventListener('click', () => {
  yesOverlay.classList.add('hidden');
  canvas.style.zIndex = '';
  yesBtn.style.transform = '';
  qHint.textContent = 'Men ham seni yaxshi ko‘raman, Gozal ❤';
});

function resetQuestion() {
  noEscapes = 0;
  if (noBtn.parentNode !== qButtons) qButtons.appendChild(noBtn);
  noBtn.classList.remove('flying');
  noBtn.removeAttribute('style');
  noBtn.textContent = NO_TEXTS[0];
  yesBtn.style.transform = '';
  qHint.textContent = '';
}

/* ============================================================
   Ekranga tekkanda / sichqoncha yurganda yuraklar
   ============================================================ */
let lastTrail = 0;

document.addEventListener('pointerdown', (e) => {
  if (letter.classList.contains('hidden')) return;
  if (e.target.closest('button')) return;
  burst(e.clientX, e.clientY, 8);
});

document.addEventListener('pointermove', (e) => {
  if (e.pointerType !== 'mouse' || letter.classList.contains('hidden')) return;
  const now = performance.now();
  if (now - lastTrail < 70) return;
  lastTrail = now;
  burst(e.clientX, e.clientY, 1);
});

/* ============================================================
   Yakuniy tugmalar: so'z aytish va yulduz uchirish
   ============================================================ */
let msgIndex = 0;
let starIndex = 0;

function showLove(text) {
  loveMsg.classList.remove('show');
  setTimeout(() => {
    loveMsg.textContent = text;
    loveMsg.classList.add('show');
  }, 200);
}

loveBtn.addEventListener('click', () => {
  const r = loveBtn.getBoundingClientRect();
  burst(r.left + r.width / 2, r.top + r.height / 2, 60);
  showLove(LOVE_MESSAGES[msgIndex % LOVE_MESSAGES.length]);
  msgIndex++;
  if (navigator.vibrate) navigator.vibrate(40);
});

starBtn.addEventListener('click', () => {
  shootingStar.classList.remove('go');
  void shootingStar.offsetWidth; // animatsiyani qaytadan boshlash uchun
  shootingStar.classList.add('go');

  const r = starBtn.getBoundingClientRect();
  burst(r.left + r.width / 2, r.top + r.height / 2, 20);
  showLove(STAR_MESSAGES[starIndex % STAR_MESSAGES.length]);
  starIndex++;
});

replayBtn.addEventListener('click', () => {
  resetQuestion();
  resetMeter();
  resetGift();
  resetBeats();
  document.querySelectorAll('.card.flipped').forEach((c) => c.classList.remove('flipped'));
  wishBtns.forEach((b) => b.classList.remove('done'));
  wishMsg.textContent = '';

  window.scrollTo({ top: 0, behavior: 'smooth' });
  setTimeout(() => {
    reveals.forEach((el) => el.classList.remove('visible'));
    loveMsg.classList.remove('show');
    loveMsg.textContent = '';
    observeReveals();
    observeMeter();
  }, 600);
});