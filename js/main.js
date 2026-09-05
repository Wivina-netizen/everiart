/* ============================================================
   EVERIART — Interaction layer
   Built against apple-design: springs everywhere a user can touch,
   presentation-value animation, interruptible, reduced-motion aware.
   ============================================================ */

import { Spring, prefersReducedMotion, REDUCED } from './spring.js';

const reduced = () => prefersReducedMotion();

/* ------------------------------------------------------------
   1a. Hero plate — attach the right weight, then fade it up.
       The poster is a CSS background on .hero__media, so every
       bail-out below still lands on a real image, never a void.
   ------------------------------------------------------------ */
function heroVideo() {
  const v = document.querySelector('.hero__video');
  if (!v) return;

  // Motion-sensitive users get the still. So do metered connections —
  // a decorative loop is never worth someone's data plan.
  if (reduced()) return;
  const conn = navigator.connection;
  if (conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || ''))) return;

  // VP9 is ~55% lighter than the H.264 cut, and covers the Chromium builds
  // that ship without proprietary codecs. MP4 carries Safari and the rest.
  const webm = v.canPlayType('video/webm; codecs="vp9"') !== '';
  const hd = window.innerWidth * (window.devicePixelRatio || 1) >= 1100;
  const d = v.dataset;
  v.src = hd ? (webm ? d.hdWebm : d.hdMp4) : (webm ? d.sdWebm : d.sdMp4);
  v.preload = 'auto';
  v.load();          // preload="none" will not fetch on a src change alone

  const show = () => { v.dataset.ready = '1'; };
  if (v.readyState >= 2) show();
  else v.addEventListener('loadeddata', show, { once: true });

  // Autoplay can still be refused (low-power mode). The poster stays put.
  const played = v.play();
  if (played && played.catch) played.catch(() => {});

  // Don't burn cycles decoding video that isn't on screen.
  const io = new IntersectionObserver(([e]) => {
    if (!v.src) return;
    if (e.isIntersecting) { const r = v.play(); if (r && r.catch) r.catch(() => {}); }
    else v.pause();
  }, { threshold: 0.01 });
  io.observe(v);
}

/* ------------------------------------------------------------
   1b. Wordmark fit — set the type to the measure, exactly.
       A vw value can't do this: the wrap is capped at --maxw, so
       past that width vw keeps growing while the column doesn't.
   ------------------------------------------------------------ */
function fitWordmark() {
  const line = document.querySelector('.hero__markline');
  const word = document.querySelector('.hero__word');
  if (!line || !word) return () => {};

  const REF = 100;   // measure at a known size, then scale by ratio

  const fit = () => {
    const cs = getComputedStyle(line);
    const avail = line.clientWidth
      - parseFloat(cs.paddingInlineStart || cs.paddingLeft)
      - parseFloat(cs.paddingInlineEnd || cs.paddingRight);
    if (avail <= 0) return;

    // The share of the measure to occupy lives in CSS, so the breakpoint that
    // changes it sits next to every other breakpoint rather than in here.
    const fill = parseFloat(cs.getPropertyValue('--wordmark-fill')) || 1;

    word.style.fontSize = REF + 'px';
    word.style.width = 'max-content';
    const natural = word.getBoundingClientRect().width;
    word.style.width = '';
    if (!natural) return;

    word.style.fontSize = (REF * (avail * fill / natural)).toFixed(2) + 'px';
  };

  fit();
  // Web fonts land after first paint; the fallback's metrics are not ours.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);

  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(fit, 120);
  });

  return fit;
}

/* ------------------------------------------------------------
   1c. Hero — ONE orchestrated load sequence (not per-section fades)
   ------------------------------------------------------------ */
function heroSequence() {
  const segs = document.querySelectorAll('.hero__seg > span');
  const tm = document.querySelector('.hero__tm');
  const lead = document.querySelector('.hero__lead');
  const nav = document.querySelector('.nav');
  const cueLine = document.querySelector('.scroll-cue__line');

  if (reduced()) {
    [...segs, tm, lead, nav].forEach((el) => {
      if (el) { el.style.transform = 'none'; el.style.opacity = '1'; }
    });
    if (cueLine) cueLine.style.transform = 'scaleX(1)';
    return;
  }

  // Wordmark segments rise from their own clipped mask, staggered.
  segs.forEach((seg, i) => {
    seg.style.transform = 'translate3d(0, 108%, 0)';
    const s = new Spring(108, {
      damping: 1.0,
      response: 0.68,
      onUpdate: (v) => { seg.style.transform = `translate3d(0, ${v}%, 0)`; },
      onRest: () => { seg.style.willChange = 'auto'; },
    });
    setTimeout(() => s.setTarget(0), 160 + i * 110);
  });

  // The trademark mark settles after the word it belongs to.
  if (tm) {
    tm.style.opacity = '0';
    const s = new Spring(0, {
      damping: 1.0,
      response: 0.5,
      onUpdate: (v) => { tm.style.opacity = String(v); },
    });
    setTimeout(() => s.setTarget(1), 620);
  }

  // Chrome and copy follow the wordmark — they never compete with it.
  [nav, lead].forEach((el, i) => {
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translate3d(0, 14px, 0)';
    const s = new Spring(0, {
      damping: 1.0,
      response: 0.55,
      onUpdate: (v) => {
        el.style.opacity = String(v);
        el.style.transform = `translate3d(0, ${(1 - v) * 14}px, 0)`;
      },
      onRest: () => { el.style.transform = 'none'; el.style.willChange = 'auto'; },
    });
    setTimeout(() => s.setTarget(1), 420 + i * 120);
  });

  if (cueLine) {
    cueLine.style.transform = 'scaleX(0)';
    const s = new Spring(0, {
      damping: 1.0,
      response: 0.7,
      onUpdate: (v) => { cueLine.style.transform = `scaleX(${v})`; },
    });
    setTimeout(() => s.setTarget(1), 900);
  }
}

/* ------------------------------------------------------------
   2. Scroll reveals — spring-driven, single mechanism
   ------------------------------------------------------------ */
function reveals() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  if (reduced()) {
    // Cross-fade only, no travel.
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px' });
    items.forEach((el) => io.observe(el));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const delay = Number(el.dataset.delay || 0);
      const dist = Number(el.dataset.dist || 26);

      el.style.transform = `translate3d(0, ${dist}px, 0)`;
      const s = new Spring(0, {
        damping: 1.0,
        response: 0.5,
        onUpdate: (v) => {
          el.style.opacity = String(v);
          el.style.transform = `translate3d(0, ${(1 - v) * dist}px, 0)`;
        },
        onRest: () => {
          el.style.willChange = 'auto';
          el.classList.add('is-in');
        },
      });
      setTimeout(() => s.setTarget(1), delay);
      io.unobserve(el);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });

  items.forEach((el) => io.observe(el));
}

/* ------------------------------------------------------------
   3. Studio filter — a real control:
      instant press feedback, spring pill, interruptible re-target
   ------------------------------------------------------------ */
function studioFilter() {
  const root = document.querySelector('.filter');
  if (!root) return;
  const pill = root.querySelector('.filter__pill');
  const btns = [...root.querySelectorAll('.filter__btn')];
  const cards = [...document.querySelectorAll('.card')];
  if (!pill || !btns.length) return;

  // Two independent springs — X and width never share one spring.
  const xs = new Spring(0, {
    damping: 1.0,
    response: 0.36,
    onUpdate: (v) => { pill.style.transform = `translate3d(${v}px, 0, 0)`; },
  });
  const ws = new Spring(0, {
    damping: 1.0,
    response: 0.36,
    onUpdate: (v) => { pill.style.width = `${v}px`; },
  });

  function movePill(btn, animate = true) {
    const x = btn.offsetLeft - root.clientLeft;
    const w = btn.offsetWidth;
    if (!animate || reduced()) {
      xs.set(x); ws.set(w);
    } else {
      // Re-target only — carries current value and velocity through.
      xs.setTarget(x);
      ws.setTarget(w);
    }
  }

  function applyFilter(key) {
    cards.forEach((card) => {
      const match = key === 'all' || card.dataset.studio === key;
      if (match) {
        const wasHidden = card.hidden;
        card.hidden = false;
        if (reduced()) { card.style.opacity = '1'; card.style.transform = 'none'; return; }
        // Cards still below the fold are owned by the reveal observer — don't
        // fight it. Only animate cards that were actively filtered out.
        if (!wasHidden && !card.classList.contains('is-in')) return;
        // Start from the live on-screen value (apple-design §3), not a target.
        const current = parseFloat(getComputedStyle(card).opacity) || 0;
        const s = new Spring(current, {
          damping: 1.0,
          response: 0.42,
          onUpdate: (v) => {
            card.style.opacity = String(v);
            card.style.transform = `translate3d(0, ${(1 - v) * 14}px, 0) scale(${0.985 + v * 0.015})`;
          },
        });
        s.setTarget(1);
      } else {
        card.hidden = true;
        card.style.opacity = '0';
      }
    });
  }

  btns.forEach((btn) => {
    // Feedback on pointer-down, not on release (apple-design §1).
    btn.addEventListener('pointerdown', () => movePill(btn));
    btn.addEventListener('click', () => {
      btns.forEach((b) => b.setAttribute('aria-selected', String(b === btn)));
      movePill(btn);
      applyFilter(btn.dataset.filter);
    });
    btn.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      const i = btns.indexOf(btn);
      const next = btns[(i + (e.key === 'ArrowRight' ? 1 : -1) + btns.length) % btns.length];
      next.focus();
      next.click();
    });
  });

  const initial = btns.find((b) => b.getAttribute('aria-selected') === 'true') || btns[0];
  requestAnimationFrame(() => movePill(initial, false));

  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      const active = btns.find((b) => b.getAttribute('aria-selected') === 'true') || btns[0];
      movePill(active, false);
    }, 120);
  });
}

/* ------------------------------------------------------------
   4. Hero parallax — large moving surface, subtle, rAF-throttled.
      The plate lags the scroll; the wordmark runs slightly ahead of it.
      Two rates is what reads as depth — one rate just reads as drift.
   ------------------------------------------------------------ */
function heroParallax() {
  const hero = document.querySelector('.hero');
  if (!hero || reduced()) return;

  const plate = hero.querySelector('.hero__video');
  const markline = hero.querySelector('.hero__markline');

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      if (y < hero.offsetHeight * 1.2) {
        if (plate) plate.style.transform = `translate3d(0, ${y * 0.16}px, 0) scale(1.06)`;
        if (markline) markline.style.transform = `translate3d(0, ${y * -0.055}px, 0)`;
      }
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ------------------------------------------------------------
   5. Nav elevation on scroll
   ------------------------------------------------------------ */
function navTheme() {
  const nav = document.querySelector('.nav');
  const hero = document.querySelector('.hero');
  if (!nav) return;

  // No hero on this page — light material immediately.
  if (!hero) { nav.dataset.theme = 'light'; return; }

  // Switch the moment the hero's bottom edge passes under the nav bar.
  const sentinel = document.createElement('div');
  sentinel.setAttribute('aria-hidden', 'true');
  sentinel.style.cssText = 'position:absolute;bottom:0;left:0;width:1px;height:1px;pointer-events:none;';
  hero.style.position = 'relative';
  hero.appendChild(sentinel);

  const io = new IntersectionObserver(
    ([entry]) => {
      nav.dataset.theme = entry.isIntersecting ? 'dark' : 'light';
    },
    { rootMargin: '-56px 0px 0px 0px', threshold: 0 }
  );
  io.observe(sentinel);
}

/* ------------------------------------------------------------
   Boot
   ------------------------------------------------------------ */
function init() {
  heroVideo();
  fitWordmark();   // size the type before it is revealed, never after
  heroSequence();
  reveals();
  studioFilter();
  heroParallax();
  navTheme();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Re-evaluate if the user flips reduced-motion mid-session.
REDUCED.addEventListener?.('change', () => window.location.reload());
