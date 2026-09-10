/* ============================================================
   EVERIART — Interaction layer
   Built against apple-design: springs everywhere a user can touch,
   presentation-value animation, interruptible, reduced-motion aware.
   ============================================================ */

import { Spring, prefersReducedMotion, REDUCED } from './spring.js';
import { videoAffordances } from './video.js';

const reduced = () => prefersReducedMotion();

/* ------------------------------------------------------------
   1a. Hero plate — attach the right weight, then fade it up.
       The poster is a CSS background on .hero__media, so every
       bail-out below still lands on a real image, never a void.
   ------------------------------------------------------------ */
function heroVideo() {
  const v = document.querySelector('.hero__video');
  if (!v) return;

  const media = v.closest('.hero__media');
  const play = document.querySelector('.hero__play');
  const d = v.dataset;

  // Why the plate is or isn't running, readable from the DOM. Four separate
  // conditions used to produce an identical silent poster, which made a report
  // of "it doesn't play" impossible to act on.
  const setState = (state) => { if (media) media.dataset.videoState = state; };

  // Offered only where a click can actually help. If nothing decodes, a play
  // button would just fail again, so the still is left to stand on its own.
  const offer = (label) => {
    if (!play) return;
    const text = play.querySelector('.hero__play-label');
    if (text && label) text.textContent = label;
    play.hidden = false;
  };

  // Built before any early return below, so the Data Saver opt-in can use it.
  // canPlayType is advisory only — Safari reports WebM support it cannot
  // always decode — so the MP4 stays queued behind the WebM rather than being
  // discarded on the strength of that claim.
  const hd = window.innerWidth * (window.devicePixelRatio || 1) >= 1100;
  const sources = [];
  if (v.canPlayType('video/webm; codecs="vp9"') !== '') {
    sources.push(hd ? d.hdWebm : d.sdWebm);
  }
  sources.push(hd ? d.hdMp4 : d.sdMp4);

  let i = 0;
  let attempt = 0;   // guards against a superseded attempt reporting state

  function tryPlay(token) {
    const r = v.play();
    if (!r || !r.catch) return;
    r.catch((err) => {
      // NotAllowedError is the only rejection that means "the browser refused
      // to autoplay". AbortError is our own load() superseding this attempt,
      // and NotSupportedError is a source problem the 'error' handler owns —
      // reporting either as a refusal puts a play button on a video that
      // cannot play at all.
      if (token !== attempt || err.name !== 'NotAllowedError') return;
      setState('autoplay-blocked');
      offer('Play background');
    });
  }

  function attach() {
    attempt += 1;
    if (play) play.hidden = true;
    setState('loading');
    v.src = sources[i];
    v.preload = 'auto';
    v.load();   // preload="none" will not fetch on a src change alone
    tryPlay(attempt);
  }

  v.addEventListener('error', () => {
    if (!v.src) return;
    if (i + 1 < sources.length) {
      i += 1;
      attach();          // the format the browser claimed it could play, could not
      return;
    }
    setState('undecodable');
    if (play) play.hidden = true;
  });

  // Only once frames are actually running is the plate faded up. Waiting on
  // 'playing' rather than 'loadeddata' matters: a blocked video still fires
  // loadeddata, and revealing its first frame would swap the composed poster
  // for a frozen near-black one.
  v.addEventListener('playing', () => {
    v.dataset.ready = '1';
    setState('playing');
    if (play) play.hidden = true;
  });

  if (play) {
    play.addEventListener('click', () => {
      // Already buffered and merely refused — the gesture is all that was
      // missing, so don't re-download it.
      if (v.src && v.readyState >= 2 && !v.error) { attempt += 1; tryPlay(attempt); }
      else attach();
    });
  }

  // A motion-sensitive user gets the still, and no invitation to start motion
  // they have explicitly asked not to see.
  if (reduced()) { setState('reduced-motion'); return; }

  // A decorative loop is never worth someone's data plan — but it is their
  // call to make, so the button is offered with the reason written on it.
  const conn = navigator.connection;
  if (conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || ''))) {
    setState('save-data');
    offer('Data Saver is on — play background');
    return;
  }

  attach();

  // Don't burn cycles decoding video that isn't on screen.
  const io = new IntersectionObserver(([e]) => {
    if (!v.src || v.error) return;
    if (e.isIntersecting) { attempt += 1; tryPlay(attempt); }
    else v.pause();
  }, { threshold: 0.01 });
  io.observe(v);

  // One line, only when the plate is not running, so the next report of
  // "the video doesn't play" arrives with its cause attached.
  window.setTimeout(() => {
    const state = media && media.dataset.videoState;
    if (state !== 'playing') {
      console.info('[everiart] hero plate not playing — state:', state,
                   '| src:', v.getAttribute('src'),
                   '| mediaError:', v.error && v.error.code);
    }
  }, 5000);
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

/* Exactly one arrow may be visible on the page at a time.
 *
 * Adjacent tiles are separate elements with separate arrows, so a pointer
 * crossing from one into the next fires leave-then-enter and, left alone,
 * cross-fades two arrows past each other. This registry makes the crossing a
 * handover instead: the incoming arrow inherits the outgoing one's live
 * opacity AND velocity (apple-design §3 — carry velocity through a re-target,
 * never hard-cut it), and the outgoing one is dropped in the same frame.
 *
 * The consequence is that the gutter between two tiles stops reading as a
 * dead zone. Crossing it at a normal pointer speed takes ~40ms, over which
 * the outgoing arrow has only fallen to ~0.83; the incoming arrow picks up
 * from there rather than from zero, so there is no dip out and back.
 */
let liveArrow = null;

/* One affordance, two callers: the work tiles and the next-project handover.
   Both want the same spring, the same reversal behaviour and the same
   no-hover fallback, so neither gets its own copy of it.

   `follow` is the one thing they disagree on. On a tile the arrow tracks the
   cursor. On the next-project handover it stays put, because there it is
   composed to overlap the word — dragging it off the type by the pointer
   would break the one thing that composition is for. */
function arrowAffordance(root, arrow, { follow = false } = {}) {
  if (!root || !arrow) return;

  // Hover is not available everywhere, and a hover-only affordance is
  // invisible on touch. Where there is no fine pointer, the arrow is
  // emphasised while its target holds the middle of the viewport.
  const hoverable = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  let show;
  let handoff = null;

  if (reduced()) {
    // Cross-fade only — no travel, no spring, no tracking (apple-design §14).
    arrow.style.transition = 'opacity 160ms ease';
    show = (on) => {
      if (on) { if (liveArrow && liveArrow !== api) liveArrow.dismiss(); liveArrow = api; }
      else if (liveArrow === api) liveArrow = null;
      arrow.style.opacity = on ? '1' : '0';
    };
    handoff = { read: () => ({ value: parseFloat(arrow.style.opacity) || 0, velocity: 0 }),
                dismiss: () => { arrow.style.opacity = '0'; } };
  } else {
    // Three springs, never one: opacity, and X and Y decomposed, because a
    // single spring over a 2D distance desyncs when the axes carry different
    // velocities (apple-design §3).
    let x = 0, y = 0, o = 0;
    const paint = () => {
      arrow.style.opacity = String(o);
      // The px offset is applied before the -50% centring, so an offset of
      // zero is the frame's centre — which is what the CSS resting position,
      // the keyboard path and the reduced-motion path all resolve to.
      arrow.style.transform =
        `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) ` +
        `translate(-50%, -50%) scale(${(0.9 + o * 0.1).toFixed(4)})`;
    };

    const os = new Spring(0, {
      damping: 1.0,
      response: 0.34,
      onUpdate: (v) => { o = v; paint(); },
      onRest: (s) => {
        // The layer is held for as long as the arrow is up, not dropped the
        // moment it finishes fading in — it is still being moved by the
        // pointer at that point. Dropped only once it is actually gone.
        if (s.value < 0.01) arrow.style.willChange = 'auto';
      },
    });
    const xs = new Spring(0, { damping: 1.0, response: 0.34,
      onUpdate: (v) => { x = v; paint(); } });
    const ys = new Spring(0, { damping: 1.0, response: 0.34,
      onUpdate: (v) => { y = v; paint(); } });

    /* Clamped to the frame, so the arrow can lead the cursor toward an edge
       without ever hanging off the image it is drawn against. */
    const offsetFor = (e) => {
      const r = (root.querySelector('.tile__frame') || root).getBoundingClientRect();
      const aw = arrow.offsetWidth || 0;
      const ah = arrow.offsetHeight || aw;
      const maxX = Math.max(0, (r.width - aw) / 2);
      const maxY = Math.max(0, (r.height - ah) / 2);
      return {
        x: Math.max(-maxX, Math.min(maxX, e.clientX - (r.left + r.width / 2))),
        y: Math.max(-maxY, Math.min(maxY, e.clientY - (r.top + r.height / 2))),
      };
    };

    show = (on, e) => {
      if (on) {
        // Seed the position hard, never animate it in: the arrow belongs at
        // the point the cursor entered, not flying out from the centre.
        if (follow && e && liveArrow !== api) {
          const p = offsetFor(e);
          xs.set(p.x); ys.set(p.y);
        }
        if (liveArrow && liveArrow !== api) {
          const prev = liveArrow.read();
          liveArrow.dismiss();
          os.value = prev.value;
          os.velocity = prev.velocity;
        }
        liveArrow = api;
        arrow.style.willChange = 'transform, opacity';
      } else if (liveArrow === api) {
        liveArrow = null;
      }
      // Exit leaves X and Y exactly where they are: the arrow springs back
      // out from wherever it last was, it never returns to centre first.
      os.setTarget(on ? 1 : 0);   // re-target carries velocity through
    };

    handoff = {
      read: () => ({ value: os.value, velocity: os.velocity }),
      dismiss: () => { os.set(0); arrow.style.willChange = 'auto'; },
    };

    if (follow && hoverable) {
      root.addEventListener('pointermove', (e) => {
        if (liveArrow !== api) return;
        const p = offsetFor(e);
        xs.setTarget(p.x);        // spring lag, deliberately not 1:1
        ys.setTarget(p.y);
      });
    }
  }

  const api = { read: () => handoff.read(), dismiss: () => handoff.dismiss() };

  if (hoverable) {
    root.addEventListener('pointerenter', (e) => show(true, e));
    root.addEventListener('pointerleave', () => show(false));
  } else {
    new IntersectionObserver(([e]) => show(e.isIntersecting),
      { rootMargin: '-35% 0px -35% 0px', threshold: 0 }).observe(root);
  }

  // Keyboard reaches the same affordance on both — centred, since there is
  // no pointer position to answer to.
  root.addEventListener('focus', () => show(true));
  root.addEventListener('blur', () => show(false));
}

/* ------------------------------------------------------------
   3c. Ambient tile motion — armed, never standing.

   The drift itself is CSS (see .tile__zoom). All this does is decide when
   it is allowed to run, because a continuous transform animation holds a
   compositor layer for as long as it runs, and a standing layer per tile is
   exactly the regression the motion contract already caught once.

   So: paused by default in CSS, running only while the tile is on screen and
   the tab is visible. Off-screen tiles cost nothing, and a backgrounded tab
   composites nothing.
   ------------------------------------------------------------ */
function ambientTileZoom() {
  const zooms = [...document.querySelectorAll('.tile__zoom')];
  if (!zooms.length || reduced()) return;   // CSS already stopped it

  const onScreen = new Set();

  const paint = () => {
    const hidden = document.hidden;
    zooms.forEach((z) => {
      const run = !hidden && onScreen.has(z);
      z.style.animationPlayState = run ? 'running' : 'paused';
      z.style.willChange = run ? 'transform' : 'auto';
    });
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) onScreen.add(e.target);
      else onScreen.delete(e.target);
    });
    paint();
  }, { threshold: 0 });

  zooms.forEach((z) => io.observe(z));
  document.addEventListener('visibilitychange', paint);
}

function workTiles() {
  document.querySelectorAll('.tile').forEach((tile) => {
    // Measured once per tile at image load, not per hover — so the ink is
    // already correct on the frame the arrow becomes visible, including on a
    // tile-to-tile handover where there is no time to measure anything.
    pickArrowInk(tile);
    arrowAffordance(tile, tile.querySelector('.tile__arrow'), { follow: true });
  });

  // The handover at the foot of a case study sits on a flat ground, so its
  // ink is known — no image to measure. It does not follow the cursor: the
  // arrow is composed to sit over the word, which is the point of it.
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
  ambientTileZoom();    // continuous drift, independent of hover
  videoAffordances();   // hover-to-play + fullscreen preview, home tiles
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
