/* ============================================================
   EVERIART — Interaction layer
   Built against apple-design: springs everywhere a user can touch,
   presentation-value animation, interruptible, reduced-motion aware.
   ============================================================ */

import { Spring, prefersReducedMotion, REDUCED } from './spring.js?v=2';
import { caseStudyReel } from './video.js?v=2';

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
  const d = v.dataset;

  // Why the plate is or isn't running, readable from the DOM. Four separate
  // conditions used to produce an identical silent poster, which made a report
  // of "it doesn't play" impossible to act on.
  const setState = (state) => { if (media) media.dataset.videoState = state; };

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
  let gestureArmed = false;

  function tryPlay(token) {
    const r = v.play();
    if (!r || !r.catch) return;
    r.catch((err) => {
      // NotAllowedError is the only rejection that means "the browser refused
      // to autoplay". AbortError is our own load() superseding this attempt,
      // and NotSupportedError is a source problem the 'error' handler owns —
      // reporting either as a refusal puts recovery on a video that cannot
      // play at all.
      if (token !== attempt || err.name !== 'NotAllowedError') return;
      setState('autoplay-blocked');
      armGesture();
    });
  }

  /* There is no play control any more, so a refusal is recovered from by the
     next thing the reader does rather than by asking them to press something.
     A scroll is the gesture the hero is already asking for, and it carries the
     activation a refusing browser was holding out for. Once only, and
     passively — this must not sit in the scroll path for the whole session. */
  function armGesture() {
    if (gestureArmed) return;
    gestureArmed = true;
    // One handler, torn down as a set. Three separate { once: true }
    // listeners only remove the one that fires, leaving the other two armed
    // to call this again later — and if the plate has not reached
    // readyState 2 by then (likely, on the slow connection that blocked
    // autoplay in the first place) the second call re-enters attach() and
    // restarts the video from frame zero under the reader.
    const events = ['scroll', 'pointerdown', 'keydown'];
    const go = () => {
      events.forEach((t) => window.removeEventListener(t, go));
      attempt += 1;
      if (v.src && v.readyState >= 2 && !v.error) tryPlay(attempt);
      else attach();
    };
    events.forEach((t) =>
      window.addEventListener(t, go, { passive: true }));
  }

  function attach() {
    attempt += 1;
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
  });

  // Only once frames are actually running is the plate faded up. Waiting on
  // 'playing' rather than 'loadeddata' matters: a blocked video still fires
  // loadeddata, and revealing its first frame would swap the composed poster
  // for a frozen near-black one.
  v.addEventListener('playing', () => {
    v.dataset.ready = '1';
    setState('playing');
  });

  // A motion-sensitive user gets the still, and nothing invites them to start
  // motion they have explicitly asked not to see.
  if (reduced()) { setState('reduced-motion'); return; }

  // A decorative loop is never worth someone's data plan. This used to offer
  // an opt-in button; with the button gone the still simply stands, which is
  // the answer reduced motion already gets.
  const conn = navigator.connection;
  if (conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || ''))) {
    setState('save-data');
    return;
  }

  /* Playback is owned entirely by where the plate is on screen — the same
     armed/disarmed observer the rest of the site's motion runs on. The hero
     holds the viewport at load, so it starts there; scroll past and it stops
     decoding; scroll back and it resumes. There is no manual control. */
  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) {
      if (!v.src) attach();
      else if (!v.error) { attempt += 1; tryPlay(attempt); }
    } else if (v.src) {
      v.pause();
    }
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

  /* The two offsets that seat the mark on the corner.
   *
   * The mark is bottom- and left-aligned on spacing derived the way the rest
   * of the site's spacing is: --gutter supplies the inset itself, on both
   * edges (see .hero__markline). What CSS cannot know is how far the word's
   * ink sits inside its layout box — and insetting a box edge nobody can see
   * is what leaves large type looking high and indented:
   *
   *   --word-ink-left   the serif E's left side bearing. The lead copy above
   *                     has almost none, so without this the two are out of
   *                     line by exactly that bearing.
   *   --word-ink-below  the gap between the box bottom and the letterforms.
   *                     "Everiart" has no descenders, so its ink bottom is
   *                     its baseline and what is left below it is leading.
   *
   * Both come off the font's own metrics at the size actually rendered, so
   * they follow a font swap, a resize and the fit below without being told.
   */
  const measureInk = () => {
    let g;
    try { g = document.createElement('canvas').getContext('2d'); } catch { return; }
    if (!g) return;

    const cw = getComputedStyle(word);
    const px = parseFloat(cw.fontSize);
    if (!px) return;
    g.font = cw.fontStyle + ' ' + cw.fontWeight + ' ' + px + 'px ' + cw.fontFamily;

    const m = g.measureText((word.textContent || '').replace(/\s+/g, ''));
    // TextMetrics' ink box is optional in the spec. Where it is missing the
    // custom properties stay unset and the CSS falls back to 0 — the mark
    // then sits on its layout box, which is where it sat before this existed.
    if (!m || typeof m.actualBoundingBoxLeft !== 'number'
           || typeof m.fontBoundingBoxAscent !== 'number') return;

    const lh = parseFloat(cw.lineHeight) || px;
    const halfLeading =
      (lh - (m.fontBoundingBoxAscent + m.fontBoundingBoxDescent)) / 2;
    const inkBelow =
      lh - (halfLeading + m.fontBoundingBoxAscent + m.actualBoundingBoxDescent);

    line.style.setProperty('--word-ink-below', inkBelow.toFixed(2) + 'px');
    word.style.setProperty('--word-ink-left',
      Math.max(0, -m.actualBoundingBoxLeft).toFixed(2) + 'px');
  };

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
    measureInk();   // the offsets are size-dependent, so they follow the fit
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
   1c. Hero — ONE staggered load sequence (not per-section fades)
   ------------------------------------------------------------ */
/* The one stagger interval on the site, read from CSS so the hero's load
   sequence and the scroll reveals cannot drift apart. See --stagger-step in
   tokens.css for where the value comes from. */
function staggerStep() {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue('--stagger-step').trim();
  const n = parseFloat(raw);
  if (!n) return 60;
  return /ms$/.test(raw) ? n : n * 1000;
}

/* One subject per step, in reading order, each fading up behind the last.
 *
 * Everything here is opacity. The two wordmark segments do not travel: the
 * mark is the largest type on the site and the case-study title already
 * establishes that display type fades and is never translated. The smaller
 * subjects carry the same 14px rise the scroll reveals use, so the hero's
 * entrance and the rest of the page read as one mechanism.
 */
function heroSequence() {
  const nav = document.querySelector('.nav');
  const sub = document.querySelector('.hero__sub');
  const cta = document.querySelector('.hero__cta');
  const segs = [...document.querySelectorAll('.hero__seg > span')];
  const tm = document.querySelector('.hero__tm');
  const cue = document.querySelector('.scroll-cue');
  const cueLine = document.querySelector('.scroll-cue__line');

  // The word's two segments are separate subjects on purpose — it assembles
  // left to right rather than arriving whole.
  const steps = [
    { el: nav, rise: 14 },
    { el: sub, rise: 14 },
    { el: cta, rise: 14 },
    ...segs.map((el) => ({ el, rise: 0 })),
    { el: tm, rise: 0 },
    { el: cue, rise: 14 },
  ].filter((s) => s.el);

  if (reduced()) {
    steps.forEach(({ el }) => { el.style.opacity = '1'; el.style.transform = 'none'; });
    if (cueLine) cueLine.style.transform = 'scaleX(1)';
    return;
  }

  const step = staggerStep();

  steps.forEach(({ el, rise }, idx) => {
    el.style.opacity = '0';
    if (rise) el.style.transform = `translate3d(0, ${rise}px, 0)`;
    el.style.willChange = rise ? 'opacity, transform' : 'opacity';

    const s = new Spring(0, {
      damping: 1.0,
      response: 0.5,   // the documented reveal response: this IS a reveal
      onUpdate: (v) => {
        el.style.opacity = String(v);
        if (rise) {
          el.style.transform = `translate3d(0, ${((1 - v) * rise).toFixed(2)}px, 0)`;
        }
      },
      onRest: () => {
        if (rise) el.style.transform = 'none';
        el.style.willChange = 'auto';
      },
    });
    setTimeout(() => s.setTarget(1), idx * step);
  });

  // The cue's rule draws itself last, once the thing it belongs to is up.
  if (cueLine) {
    cueLine.style.transform = 'scaleX(0)';
    cueLine.style.willChange = 'transform';
    const s = new Spring(0, {
      damping: 1.0,
      response: 0.5,
      onUpdate: (v) => { cueLine.style.transform = `scaleX(${v})`; },
      onRest: () => { cueLine.style.willChange = 'auto'; },
    });
    setTimeout(() => s.setTarget(1), steps.length * step);
  }
}

/* ------------------------------------------------------------
   2. Scroll reveals — spring-driven, one mechanism, one cascade

   Everything that crosses the threshold on the same frame is one group, and
   a group arrives in document order one --stagger-step apart rather than all
   at once. That is the whole difference: a pair of tiles, a row of client
   cells or a run of figures used to fade up together, which reads as a
   single block changing state instead of a sequence of things arriving.

   Grouping by observer batch rather than by container is deliberate. It
   needs no per-section markup, it works for a two-tile pair and a nine-cell
   grid alike, and it can never stagger two elements that are not on screen
   together — the batch IS what the reader just saw appear.

   The tail is capped: past CASCADE_MAX steps the delay stops growing, so a
   tall viewport that admits a dozen elements at once cannot leave the last
   of them waiting most of a second for its turn.
   ------------------------------------------------------------ */
const CASCADE_MAX = 6;

function reveals() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  // Document order for whatever arrived together. compareDocumentPosition is
  // the only ordering that survives the grid being reordered by the filter.
  const inOrder = (els) => els.sort((a, b) =>
    (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) ? -1 : 1);

  if (reduced()) {
    // Cross-fade only, no travel — and no cascade either: a stagger is
    // motion, and the ask is for the final readable state (apple-design §14).
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px' });
    items.forEach((el) => io.observe(el));
    return;
  }

  const step = staggerStep();

  const run = (el, delay) => {
    const dist = Number(el.dataset.dist || 26);

    el.style.transform = `translate3d(0, ${dist}px, 0)`;
    el.style.willChange = 'opacity, transform';
    const s = new Spring(0, {
      damping: 1.0,
      response: 0.5,
      onUpdate: (v) => {
        el.style.opacity = String(v);
        el.style.transform = `translate3d(0, ${((1 - v) * dist).toFixed(2)}px, 0)`;
      },
      onRest: () => {
        el.style.willChange = 'auto';
        el.style.transform = 'none';
        el.classList.add('is-in');
      },
    });
    setTimeout(() => s.setTarget(1), delay);
  };

  /* Everything that crosses within one frame is one group.
     IntersectionObserver does not promise to deliver simultaneous crossings
     in a single callback, and on load it does not: a six-tile grid produced
     six callbacks of one entry each, so a per-callback index handed every
     tile a delay of zero and the pair rose together. Queueing and flushing
     on the next frame is what makes "arrived together" and "cascades
     together" the same thing. */
  let queue = [];
  let queued = false;

  const flush = () => {
    const batch = inOrder(queue);
    queue = [];
    queued = false;
    batch.forEach((el, i) => run(el, Math.min(i, CASCADE_MAX) * step));
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);   // one reveal per element, ever
      queue.push(e.target);
    });
    if (queue.length && !queued) { queued = true; requestAnimationFrame(flush); }
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

  /* Position and extent stay two springs — one spring over a 2D quantity
     desyncs when the axes carry different velocities (apple-design §3) — but
     they now write through one composed transform instead of one property
     each. The extent spring carries the button's width in px and is applied
     as scaleX against a 1px rule (see .filter__rule), so nothing here
     touches layout. */
  let x = 0, w = 0;
  const paint = () => {
    rule.style.transform =
      `translate3d(${x.toFixed(2)}px, 0, 0) scaleX(${w.toFixed(2)})`;
  };

  const xs = new Spring(0, {
    damping: 1.0,
    response: 0.36,
    onUpdate: (v) => { x = v; paint(); },
    onRest: () => { moving.x = false; release(); },
  });
  const ws = new Spring(0, {
    damping: 1.0,
    response: 0.36,
    onUpdate: (v) => { w = v; paint(); },
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
      rule.style.willChange = 'transform';
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

/* Geometry epoch. Every tile's cached rect is stamped with this; anything
   that could have moved a tile bumps it, and the tile re-measures lazily on
   its next pointer event.
 *
 * One listener for the page, not one per tile: the whole point of caching the
 * rect is to keep scroll cheap, and N tiles each attaching their own scroll
 * handler to invalidate themselves gives that back as the grid grows.
 */
let geomEpoch = 0;
const bumpEpoch = () => { geomEpoch += 1; };
window.addEventListener('scroll', bumpEpoch, { passive: true });
window.addEventListener('resize', bumpEpoch);

/* One affordance, two callers: the work tiles and the next-project handover.
   Both want the same spring, the same tracking and the same exit, so neither
   gets its own copy of it.

   The contract, and it is deliberately narrow:

     invisible by default;
     visible only while the cursor is inside THIS element;
     following the cursor with spring lag while it is;
     gone the instant the cursor leaves.

   That last clause is why there is no exit spring and no cross-element
   handover any more. Both are documented below where they were removed,
   because both looked correct in isolation and were the reason the arrow
   read as distracting.

   `follow` is the one thing the two callers disagree on. On a tile the arrow
   tracks the cursor. On the next-project handover it stays put, because
   there it is composed to overlap the word — dragging it off the type by the
   pointer would break the one thing that composition is for. */
function arrowAffordance(root, arrow, { follow = false } = {}) {
  if (!root || !arrow) return;

  /* No cursor, no arrow.
     There used to be an IntersectionObserver fallback here that lit the
     arrow while the tile held the middle of the viewport, standing in for
     hover on touch. But the affordance is defined as "the cursor is over
     this card", and on a touch screen that is never true — so the fallback
     put an arrow on screen with nothing pointing at it, on every tile, as
     you scrolled. A tile on touch is a link with a picture on it, and it
     does not need an arrow to say so. */
  const hoverable = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  let show;

  if (reduced()) {
    // Cross-fade in, cut out. No travel, no spring, no tracking
    // (apple-design §14) — but the exit is still immediate, because that is
    // the affordance's contract rather than a motion decision.
    show = (on) => {
      arrow.style.transition = on
        ? 'opacity 160ms var(--ease-out-quart, cubic-bezier(0.165, 0.84, 0.44, 1))'
        : 'none';
      arrow.style.opacity = on ? '1' : '0';
    };
  } else {
    // Three springs, never one: opacity, and X and Y decomposed, because a
    // single spring over a 2D distance desyncs when the axes carry different
    // velocities (apple-design §3).
    let x = 0, y = 0, o = 0;
    const paint = () => {
      arrow.style.opacity = String(o);
      // The px offset is applied before the -50% centring, so an offset of
      // zero is the frame's centre — which is what the CSS resting position
      // and the keyboard path both resolve to.
      arrow.style.transform =
        `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) ` +
        `translate(-50%, -50%) scale(${(0.9 + o * 0.1).toFixed(4)})`;
    };

    const os = new Spring(0, {
      damping: 1.0,
      response: 0.34,
      onUpdate: (v) => { o = v; paint(); },
    });
    const xs = new Spring(0, { damping: 1.0, response: 0.34,
      onUpdate: (v) => { x = v; paint(); } });
    const ys = new Spring(0, { damping: 1.0, response: 0.34,
      onUpdate: (v) => { y = v; paint(); } });

    /* Clamped to the frame, so the arrow can lead the cursor toward an edge
       without ever hanging off the image it is drawn against.

       The geometry is cached rather than measured per move. Reading the rect
       inside pointermove while three springs write transform from rAF is a
       layout read/write pair on every pointer event — 120+ times a second on
       a high-refresh pointer, on the most-touched interaction on the site.
       It is re-read on entry and, lazily, after anything that could have
       moved the tile. */
    const frame = root.querySelector('.tile__frame') || root;
    let box = null;
    let boxEpoch = -1;

    const offsetFor = (e) => {
      if (!box || boxEpoch !== geomEpoch) {
        boxEpoch = geomEpoch;
        const r = frame.getBoundingClientRect();
        const aw = arrow.offsetWidth || 0;
        const ah = arrow.offsetHeight || aw;
        box = {
          cx: r.left + r.width / 2,
          cy: r.top + r.height / 2,
          maxX: Math.max(0, (r.width - aw) / 2),
          maxY: Math.max(0, (r.height - ah) / 2),
        };
      }
      return {
        x: Math.max(-box.maxX, Math.min(box.maxX, e.clientX - box.cx)),
        y: Math.max(-box.maxY, Math.min(box.maxY, e.clientY - box.cy)),
      };
    };

    show = (on, e) => {
      if (on) {
        // Seed the position hard, never animate it in: the arrow belongs at
        // the point the cursor entered, not flying out from the centre.
        if (follow && e) {
          const p = offsetFor(e);
          xs.set(p.x); ys.set(p.y);
        } else if (follow) {
          // Activated with no pointer — keyboard focus. Centre it rather
          // than leaving it wherever a previous hover abandoned it.
          xs.set(0); ys.set(0);
        }
        arrow.style.willChange = 'transform, opacity';
        os.setTarget(1);
        return;
      }

      /* Immediate, not sprung.
         The exit used to be os.setTarget(0) at the same 0.34 response as the
         entry, which left the arrow hanging over a card the cursor had
         already left — and, crossing between two adjacent tiles, meant a
         page-level registry had to hand the outgoing arrow's live opacity
         and velocity to the incoming one to stop two arrows cross-fading
         past each other. All of that machinery existed to manage a fade
         that should not be there. With the exit cut, leaving a card ends
         that card's arrow, entering the next one starts its own, and
         "exactly one arrow on the page" falls out for free. */
      os.set(0);
      arrow.style.willChange = 'auto';
    };

    if (follow && hoverable) {
      root.addEventListener('pointermove', (e) => {
        if (o <= 0) return;         // not this card's turn
        const p = offsetFor(e);
        xs.setTarget(p.x);          // spring lag, deliberately not 1:1
        ys.setTarget(p.y);
      });
    }
  }

  if (hoverable) {
    root.addEventListener('pointerenter', (e) => show(true, e));
    root.addEventListener('pointerleave', () => show(false));
  }

  /* Keyboard reaches the affordance too — centred, since there is no pointer
     position to answer to. This is the one deliberate exception to
     "only while the cursor is over the card": a keyboard user gets no cursor
     and no hover, and dropping it would leave the focused tile with no
     affordance at all. */
  root.addEventListener('focus', () => show(true));
  root.addEventListener('blur', () => show(false));
}

/* ------------------------------------------------------------
   3c. Work tiles — the arrow, and nothing else.
   ------------------------------------------------------------ */
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
   4a. Case study — the scroll sequence.

   Three movements, and they are deliberately not all the same kind of motion:

     1. The title arrives over the plate. Discrete, so it is a spring — the
        documented 0.34, which is the fastest response in the contract. That
        is not a 340ms fade: a critically damped spring at response 0.34 is
        88% of the way there at 200ms and visually in, which is the bar the
        brief set. Opacity only — no travel, no blur — and one spring over
        one box holding both lines, so there is nothing to stagger.

     2. The plate shrinks away as you scroll. Scroll-linked, so it is mapped
        directly from the scroll position and NOT sprung. A spring here would
        put lag between the scrollbar and the image, which is the one thing
        continuous scroll-driven motion must never do (apple-design §1).

     3. The gallery below fades up from the bottom edge. That is reveals(),
        unchanged — the same armed/disarmed observer at response 0.5.

   Accessibility, confirmed against ui-ux-pro-max (Accessibility / Motion
   Sensitivity, severity High: "Parallax/Scroll-jacking causes nausea. Honor
   prefers-reduced-motion and present the final readable state"):

     - Under reduced motion the plate does not move at all and the title is
       simply there. The final state is the readable one, never a blank.
     - The parallax is on the plate only. The title is faded but never
       translated — the same source is explicit that parallax belongs on
       background layers and never on text.
     - The scale delta is 12%, inside the 5–15% band that source gives, and
       the plate is fully faded before its shrunken edge could become
       visible against the ground.
     - will-change is armed on enter and dropped on exit, never standing.
   ------------------------------------------------------------ */
function caseStudy() {
  const phero = document.querySelector('.phero');
  if (!phero) return;

  const intro = phero.querySelector('.phero__intro');
  const plate = phero.querySelector('.phero__plate');
  const inner = phero.querySelector('.phero__inner');

  /* --- 1. Title in --- */
  if (intro) {
    if (reduced()) {
      intro.style.opacity = '1';
    } else {
      intro.style.opacity = '0';
      const s = new Spring(0, {
        damping: 1.0,
        response: 0.34,
        onUpdate: (v) => { intro.style.opacity = String(v); },
        onRest: () => { intro.style.willChange = 'auto'; },
      });
      const go = () => { intro.style.willChange = 'opacity'; s.setTarget(1); };

      // Over the image, not before it: the transition is composed against the
      // plate. But a title that never arrives because a hero 404'd is worse
      // than one that arrives early, so every path ends at go().
      const img = phero.querySelector('.phero__img');
      if (!img || (img.complete && img.naturalWidth)) go();
      else {
        img.addEventListener('load', go, { once: true });
        img.addEventListener('error', go, { once: true });
        window.setTimeout(go, 1200);
      }
    }
  }

  /* --- 2. Plate shrinks away on scroll --- */
  if (!plate || reduced()) return;

  let armed = false;
  const arm = (on) => {
    if (on === armed) return;
    armed = on;
    plate.style.willChange = on ? 'transform, opacity' : 'auto';
    if (inner) inner.style.willChange = on ? 'opacity' : 'auto';
  };
  new IntersectionObserver(([e]) => arm(e.isIntersecting), { threshold: 0 })
    .observe(phero);

  // Measured on resize, not per frame. Reading offsetHeight inside the rAF
  // and then writing transform is a layout read/write pair on every scroll
  // frame, and the height only changes when the viewport does.
  let h = phero.offsetHeight || 1;
  let ticking = false;
  let last = -1;
  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      h = phero.offsetHeight || 1;
      // The travel term is scaled by h, so a new height needs a repaint even
      // when the scroll position resolves to the same p.
      last = -1;
      onScroll();
    }, 120);
  });

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const p = Math.min(1, Math.max(0, window.scrollY / h));

      // A case study runs several viewports past its hero. Once the plate has
      // finished leaving, every further scroll frame would otherwise rewrite
      // two properties on an element that is off-screen and no longer moving.
      if (p === last) return;
      last = p;

      // Travel is slower than the scroll, so the plate lags the page and
      // reads as receding rather than sliding.
      plate.style.transform =
        `translate3d(0, ${(p * h * 0.12).toFixed(1)}px, 0) ` +
        `scale(${(1.06 - p * 0.12).toFixed(4)})`;
      // Gone by 80% of the hero's height, which is before the shrunken edge
      // could be read against the ground behind it.
      plate.style.opacity = Math.max(0, 1 - p * 1.25).toFixed(3);
      // The type fades, and only fades. It is never translated.
      if (inner) inner.style.opacity = Math.max(0, 1 - p * 1.8).toFixed(3);
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
  caseStudyReel();      // /work/<slug>/: reel plays while it holds the view
  heroParallax();
  caseStudy();          // /work/<slug>/: title in, plate out on scroll
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
