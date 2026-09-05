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
      el.style.willChange = 'opacity, transform';
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
  const rule = root.querySelector('.filter__rule');
  const btns = [...root.querySelectorAll('.filter__btn')];
  const pairs = [...document.querySelectorAll('.pair')];
  if (!rule || !btns.length) return;

  // The rule only moves on interaction, so it holds a compositor layer only
  // between the press and the springs settling.
  const moving = { x: false, w: false };
  const release = () => {
    if (!moving.x && !moving.w) rule.style.willChange = 'auto';
  };

  // Two independent springs — X and width never share one spring.
  const xs = new Spring(0, {
    damping: 1.0,
    response: 0.36,
    onUpdate: (v) => { rule.style.transform = `translate3d(${v}px, 0, 0)`; },
    onRest: () => { moving.x = false; release(); },
  });
  const ws = new Spring(0, {
    damping: 1.0,
    response: 0.36,
    onUpdate: (v) => { rule.style.width = `${v}px`; },
    onRest: () => { moving.w = false; release(); },
  });

  function moveRule(btn, animate = true) {
    const x = btn.offsetLeft - root.clientLeft;
    const w = btn.offsetWidth;
    if (!animate || reduced()) {
      moving.x = moving.w = false;
      xs.set(x); ws.set(w);
      release();
    } else {
      rule.style.willChange = 'transform, width';
      moving.x = moving.w = true;
      // Re-target only — carries current value and velocity through.
      xs.setTarget(x);
      ws.setTarget(w);
    }
  }

  // Pairs are studio-pure, so a filter hides whole rows. Hiding one tile of an
  // asymmetric pair would leave the survivor stranded in a column sized for a
  // partner that is no longer there.
  function applyFilter(key) {
    pairs.forEach((pair) => {
      const match = key === 'all' || pair.dataset.studio === key;
      if (!match) {
        pair.hidden = true;
        pair.style.opacity = '0';
        return;
      }
      const wasHidden = pair.hidden;
      pair.hidden = false;
      if (reduced()) { pair.style.opacity = '1'; pair.style.transform = 'none'; return; }
      // Rows still below the fold belong to the reveal observer — don't fight it.
      if (!wasHidden && !pair.classList.contains('is-in')) return;
      // Start from the live on-screen value (apple-design §3), not a target.
      const current = parseFloat(getComputedStyle(pair).opacity) || 0;
      pair.style.willChange = 'opacity, transform';
      const s = new Spring(current, {
        damping: 1.0,
        response: 0.42,
        onUpdate: (v) => {
          pair.style.opacity = String(v);
          pair.style.transform = `translate3d(0, ${(1 - v) * 14}px, 0)`;
        },
        onRest: () => { pair.style.willChange = 'auto'; },
      });
      s.setTarget(1);
    });
  }

  btns.forEach((btn) => {
    // Feedback on pointer-down, not on release (apple-design §1).
    btn.addEventListener('pointerdown', () => moveRule(btn));
    btn.addEventListener('click', () => {
      btns.forEach((b) => b.setAttribute('aria-selected', String(b === btn)));
      moveRule(btn);
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
  requestAnimationFrame(() => moveRule(initial, false));

  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      const active = btns.find((b) => b.getAttribute('aria-selected') === 'true') || btns[0];
      moveRule(active, false);
    }, 120);
  });
}

/* ------------------------------------------------------------
   3b. Work tiles — the arrow affordance.
       Spring-driven, so a pointer moving in and out quickly
       reverses from wherever the arrow currently is instead of
       queueing two full animations.
   ------------------------------------------------------------ */

/* Contrast, measured rather than assumed. Parchment and Off-White are both
   about 95% luminance, so choosing between them is a warm/cool decision and
   neither survives a light image — over one, the ink has to go dark. */
const ARROW_INKS = [
  { token: 'var(--parchment)', lum: relLuminance(244, 241, 222), warm: true },
  { token: 'var(--offwhite)',  lum: relLuminance(248, 248, 248), warm: false },
  { token: 'var(--charcoal)',  lum: relLuminance(33, 33, 33),    warm: false },
];

function relLuminance(r, g, b) {
  const lin = (c) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrast(a, b) {
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

function pickArrowInk(tile) {
  const img = tile.querySelector('img');
  if (!img) return;

  const measure = () => {
    let sample;
    try {
      const c = document.createElement('canvas');
      c.width = 16; c.height = 16;
      const ctx = c.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0, 16, 16);
      // Only the middle, because that is the patch the arrow sits on.
      sample = ctx.getImageData(4, 4, 8, 8).data;
    } catch (err) {
      return;   // cross-origin image taints the canvas; the CSS default stands
    }

    let r = 0, g = 0, b = 0;
    const n = sample.length / 4;
    for (let i = 0; i < sample.length; i += 4) {
      r += sample[i]; g += sample[i + 1]; b += sample[i + 2];
    }
    r /= n; g /= n; b /= n;

    const bg = relLuminance(r, g, b);
    const warmImage = r >= b;
    // Prefer the light tokens the brief calls for, but only while they clear
    // the 4.5:1 floor; fall to charcoal when the image is too bright for them.
    const usable = ARROW_INKS.filter((ink) => contrast(ink.lum, bg) >= 4.5);
    const pool = usable.length ? usable : ARROW_INKS;
    let pick = pool.find((ink) => ink.warm === warmImage) || pool[0];
    if (!usable.length) {
      pick = ARROW_INKS.reduce((best, ink) =>
        contrast(ink.lum, bg) > contrast(best.lum, bg) ? ink : best);
    }
    tile.style.setProperty('--arrow-ink', pick.token);
  };

  if (img.complete && img.naturalWidth) measure();
  else img.addEventListener('load', measure, { once: true });
}

/* One affordance, two callers: the work tiles and the next-project handover.
   The tiles track the cursor; the handover sits still. Everything else — the
   spring, the reversal, the no-hover fallback, the keyboard path — is shared.

   On the 1:1 question: apple-design §2 asks that touch and content move
   together, but that governs content the user has grabbed. Nobody grabs this
   arrow, so it is free to trail, and §3's rule that 2D motion decomposes into
   independent X and Y springs is what actually applies here — one spring on a
   2D distance desyncs when the axes have different velocities. Damping stays
   at 1.0 per §4: a hover hands off no momentum, so there is nothing to bounce. */
function arrowAffordance(root, arrow, opts) {
  if (!root || !arrow) return;
  const { follow = false, focusRoot = root } = opts || {};

  const hoverable = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  // Following needs a real cursor, and reduced motion asks for no travel at all.
  const tracking = follow && hoverable && !reduced();

  let prog = 0, ax = 0, ay = 0;

  const centre = () => {
    const r = root.getBoundingClientRect();
    return [r.width / 2, r.height / 2];
  };

  const paint = follow
    ? () => {
        arrow.style.opacity = String(prog);
        arrow.style.transform =
          `translate3d(${ax.toFixed(1)}px, ${ay.toFixed(1)}px, 0) ` +
          `translate(-50%, -50%) scale(${(0.9 + prog * 0.1).toFixed(4)})`;
      }
    : () => {
        arrow.style.opacity = String(prog);
        arrow.style.transform =
          `translate(-50%, -50%) scale(${(0.9 + prog * 0.1).toFixed(4)})`;
      };

  // Fade and scale. Kept separate from position so that re-entering mid-exit
  // reverses the fade without disturbing where the arrow currently sits.
  const ps = new Spring(0, {
    damping: 1.0,
    response: 0.34,
    onUpdate: (v) => { prog = v; paint(); },
    onRest: () => { if (prog < 0.02) arrow.style.willChange = 'auto'; },
  });

  // Two springs, one per axis — never one spring on a 2D distance.
  // A slower response than the fade is what reads as give rather than glue.
  const xs = tracking ? new Spring(0, {
    damping: 1.0, response: 0.5, onUpdate: (v) => { ax = v; paint(); },
  }) : null;
  const ys = tracking ? new Spring(0, {
    damping: 1.0, response: 0.5, onUpdate: (v) => { ay = v; paint(); },
  }) : null;

  // Clamped to the frame so the arrow never hangs off an edge, whatever the
  // cursor is doing near one.
  function pointIn(e) {
    const r = root.getBoundingClientRect();
    const half = (arrow.offsetWidth || 64) / 2;
    return [
      Math.min(Math.max(e.clientX - r.left, half), Math.max(r.width - half, half)),
      Math.min(Math.max(e.clientY - r.top, half), Math.max(r.height - half, half)),
    ];
  }

  const show = (on) => {
    arrow.style.willChange = 'transform, opacity';
    ps.setTarget(on ? 1 : 0);   // re-target carries velocity through
  };

  if (tracking) {
    root.addEventListener('pointerenter', (e) => {
      const [x, y] = pointIn(e);
      // Hard-set on entry: it appears where the cursor already is, rather
      // than flying in from the middle of the card.
      ax = x; ay = y; xs.set(x); ys.set(y);
      show(true);
    });
    // setTarget is cheap — it moves the target and lets the spring's own rAF
    // do the work — so there is nothing to throttle here.
    root.addEventListener('pointermove', (e) => {
      const [x, y] = pointIn(e);
      xs.setTarget(x); ys.setTarget(y);
    });
    // Leaves the position where it is: the exit fades from wherever the arrow
    // had got to, and never snaps back to centre first.
    root.addEventListener('pointerleave', () => show(false));
  } else if (hoverable) {
    root.addEventListener('pointerenter', () => {
      if (follow) { [ax, ay] = centre(); }
      show(true);
    });
    root.addEventListener('pointerleave', () => show(false));
  } else {
    // No pointer: emphasise while the target holds the middle of the viewport.
    new IntersectionObserver(([e]) => {
      if (follow) { [ax, ay] = centre(); }
      show(e.isIntersecting);
    }, { rootMargin: '-35% 0px -35% 0px', threshold: 0 }).observe(root);
  }

  // Keyboard has no cursor, so the arrow shows centred.
  focusRoot.addEventListener('focus', () => {
    if (follow) { [ax, ay] = centre(); if (xs) { xs.set(ax); ys.set(ay); } }
    show(true);
  });
  focusRoot.addEventListener('blur', () => show(false));
}

function workTiles() {
  document.querySelectorAll('.tile').forEach((tile) => {
    pickArrowInk(tile);
    // The frame is the hover surface, not the whole tile — the caption below
    // is not part of the image the arrow belongs to.
    arrowAffordance(tile.querySelector('.tile__frame'), tile.querySelector('.tile__arrow'),
                    { follow: true, focusRoot: tile });
  });

  // The handover at the foot of a case study sits on a flat ground, so its
  // ink is known and it stays put over the word it belongs to.
  const next = document.querySelector('.next');
  if (next) arrowAffordance(next, next.querySelector('.next__arrow'));
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
  const moved = [plate, markline].filter(Boolean);

  // These two are the only elements on the site under continuous motion, and
  // even they are only in motion while the hero is on screen. So the hint is
  // held for exactly that window rather than for the page's lifetime.
  let armed = false;
  const arm = (on) => {
    if (on === armed) return;
    armed = on;
    moved.forEach((el) => { el.style.willChange = on ? 'transform' : 'auto'; });
  };
  new IntersectionObserver(([e]) => arm(e.isIntersecting), { threshold: 0 })
    .observe(hero);

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
   4b. Contact form — post in place, answer in place.
       The form is a plain Netlify form first: with JS off it posts
       normally and Netlify renders its own confirmation. This only
       upgrades that path so the visitor never loses the page.
   ------------------------------------------------------------ */
function contactForm() {
  const form = document.querySelector('.form');
  if (!form) return;

  const status = form.querySelector('.form__status');
  const submit = form.querySelector('[type="submit"]');
  const say = (msg, state) => {
    if (!status) return;
    status.textContent = msg;
    if (state) status.dataset.state = state;
    else delete status.dataset.state;
  };

  form.addEventListener('submit', async (e) => {
    // Let the browser run its own validation and messaging first.
    if (!form.checkValidity()) return;
    e.preventDefault();

    const label = submit ? submit.textContent : '';
    if (submit) { submit.disabled = true; submit.textContent = 'Sending…'; }
    say('', null);

    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)).toString(),
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);

      form.reset();
      say('Thank you — your message is in. We reply within two working days.', 'ok');
    } catch (err) {
      // Never swallow it: the visitor needs a route that still works.
      say('That did not send. Please try the email or WhatsApp button instead.', 'err');
    } finally {
      if (submit) { submit.disabled = false; submit.textContent = label; }
    }
  });
}

/* ------------------------------------------------------------
   5. Nav elevation on scroll
   ------------------------------------------------------------ */
function navTheme() {
  const nav = document.querySelector('.nav');
  // A case study opens on a full-bleed plate too, so it wants the same
  // treatment as the home hero: no material over the image, light material
  // once past it.
  const hero = document.querySelector('.hero, .phero');
  if (!nav) return;

  // No plate on this page — light material immediately.
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
  workTiles();
  heroParallax();
  contactForm();
  navTheme();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Re-evaluate if the user flips reduced-motion mid-session.
REDUCED.addEventListener?.('change', () => window.location.reload());
