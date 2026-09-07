/* ============================================================
   EVERIART — /work/ lookbook

   The browsing layer: one near-full-viewport section per project. Two jobs
   here, both driven by the same observer:

     1. Play a section's reel while it holds the viewport, pause it when it
        does not. Sections are full-height, so intent is expressed by
        scrolling rather than by pointing — the armed/disarmed shape is the
        one reveals() already uses, with a higher threshold because a section
        being "on screen" means most of it, not a corner of it.
     2. Say where you are in the sequence.

   Nothing counts projects ahead of time: the total comes from however many
   sections the generator emitted, so six and sixty behave the same.
   ============================================================ */

import { prefersReducedMotion, Spring } from './spring.js';

const reduced = () => prefersReducedMotion();

/** As heroVideo(): a decorative loop is never worth someone's data plan. */
function saveData() {
  const c = navigator.connection;
  return !!(c && (c.saveData || /(^|-)2g$/.test(c.effectiveType || '')));
}

/** Above this many projects a dot per project stops being scannable. */
const RAIL_MAX = 12;

function sectionVideo(section) {
  const src = section.dataset.reel;
  const media = section.querySelector('.lb__media');
  if (!src || !media) return null;

  // Motion someone asked not to see, and data they may not want spent. The
  // still is already in place and simply stays.
  if (reduced() || saveData()) {
    section.dataset.videoState = reduced() ? 'reduced-motion' : 'save-data';
    return null;
  }

  let v = null;
  let spring = null;

  function ensure() {
    if (v) return v;
    v = document.createElement('video');
    v.className = 'lb__video';
    v.src = src;
    v.loop = true;
    v.muted = true;
    v.defaultMuted = true;
    v.playsInline = true;
    v.preload = 'none';
    v.controls = false;
    v.disablePictureInPicture = true;
    v.setAttribute('controlslist', 'nodownload noplaybackrate noremoteplayback');
    v.setAttribute('aria-hidden', 'true');
    v.addEventListener('contextmenu', (e) => e.preventDefault());
    media.appendChild(v);

    spring = new Spring(0, {
      damping: 1.0,
      response: 0.5,           // matches reveals(): a large surface, not a control
      onUpdate: (val) => { v.style.opacity = String(val); },
      onRest: (s) => {
        v.style.willChange = 'auto';
        // Only rewind once the still has fully covered it.
        if (s.value < 0.01) { v.pause(); try { v.currentTime = 0; } catch {} }
      },
    });
    return v;
  }

  return function set(on) {
    const el = ensure();
    el.style.willChange = 'opacity';
    if (on) {
      if (el.preload !== 'auto') { el.preload = 'auto'; el.load(); }
      const r = el.play();
      if (r && r.catch) r.catch((err) => {
        if (err.name !== 'NotAllowedError' && err.name !== 'AbortError') throw err;
      });
      section.dataset.videoState = 'playing';
    } else {
      section.dataset.videoState = 'idle';
    }
    spring.setTarget(on ? 1 : 0);   // re-target carries velocity through
  };
}

export function lookbook() {
  const root = document.querySelector('.lookbook');
  if (!root) return;

  const sections = [...root.querySelectorAll('.lb')];
  if (!sections.length) return;

  const total = sections.length;                    // never hardcoded
  const now = root.querySelector('.lb__now');
  const totalEl = root.querySelector('.lb__total');
  const rail = root.querySelector('.lb__rail');
  const pad = (n) => String(n).padStart(2, '0');

  if (totalEl) totalEl.textContent = pad(total);

  // A dot per project stops being scannable long before the catalogue stops
  // growing, so past RAIL_MAX the counter carries the position on its own.
  if (rail && total <= RAIL_MAX) {
    sections.forEach((s, i) => {
      const a = document.createElement('a');
      a.href = `#${s.id}`;
      a.setAttribute('aria-label', `Project ${i + 1}: ${s.dataset.slug}`);
      rail.appendChild(a);
    });
  } else if (rail) {
    rail.remove();
  }

  const setters = sections.map(sectionVideo);
  const links = rail ? [...rail.querySelectorAll('a')] : [];
  let current = -1;

  function mark(i) {
    if (i === current) return;
    current = i;
    if (now) now.textContent = pad(i + 1);
    links.forEach((a, k) =>
      a.setAttribute('aria-current', k === i ? 'true' : 'false'));
  }

  // One observer for both jobs. A section counts as current once most of it
  // is on screen; the reel starts on the same signal, so playback and the
  // counter can never disagree about which project you are looking at.
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const i = sections.indexOf(e.target);
      if (i < 0) return;
      const on = e.isIntersecting && e.intersectionRatio >= 0.5;
      setters[i]?.(on);
      if (on) mark(i);
    });
  }, { threshold: [0, 0.5, 0.75] });

  sections.forEach((s) => io.observe(s));

  // A backgrounded tab should not decode video.
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) return;
    root.querySelectorAll('video').forEach((v) => v.pause());
  });

  mark(0);
}
