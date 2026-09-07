/* ============================================================
   EVERIART — Video affordances

   Two behaviours, one module, because they share a source and a tile:

     1. Hover-to-play  — a tile with data-reel swaps its still for a muted
                         loop while pointed at, and rewinds on exit.
     2. Fullscreen     — clicking that tile opens one shared overlay with
                         the reel at full size and play/pause only.

   Built against the same contract as js/main.js: springs everywhere a user
   can touch, animating from the live on-screen value so an interrupted
   gesture continues rather than jumping (apple-design §3); CSS transitions
   only on the reduced-motion path (§4, §14).

   No <video controls> anywhere. Native controls carry a download item in
   the overflow menu on Chrome, so the chrome is not hidden — it is never
   created, and the play/pause button below is ours.
   ============================================================ */

import { Spring, prefersReducedMotion } from './spring.js';

const reduced = () => prefersReducedMotion();

const HOVERABLE = () =>
  window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/** A decorative loop is never worth someone's data plan (as heroVideo). */
function saveData() {
  const c = navigator.connection;
  return !!(c && (c.saveData || /(^|-)2g$/.test(c.effectiveType || '')));
}

/**
 * Every <video> this module creates, configured identically.
 * playsInline keeps iOS from hijacking it into its own fullscreen player,
 * which would hand the user native controls we deliberately do not offer.
 */
function makeVideo(src, { loop, muted }) {
  const v = document.createElement('video');
  v.src = src;
  v.loop = loop;
  v.muted = muted;
  v.defaultMuted = muted;
  v.playsInline = true;
  v.preload = 'none';
  v.controls = false;
  v.disablePictureInPicture = true;
  v.setAttribute('controlslist', 'nodownload noplaybackrate noremoteplayback');
  v.setAttribute('tabindex', '-1');
  // Right-click offers "Save video as…" even with no controls rendered.
  v.addEventListener('contextmenu', (e) => e.preventDefault());
  return v;
}

/** play() rejects for several reasons; only one of them is a refusal. */
function safePlay(v) {
  const r = v.play();
  if (r && r.catch) r.catch((err) => {
    if (err.name !== 'NotAllowedError' && err.name !== 'AbortError') throw err;
  });
}

/* ------------------------------------------------------------
   1. Hover-to-play
   ------------------------------------------------------------ */
function hoverPlay(tile, openOverlay) {
  const src = tile.dataset.reel;
  const frame = tile.querySelector('.tile__frame');
  if (!src || !frame) return;

  bindOpen(tile, src, openOverlay);

  // Motion someone asked not to see, and data they may not want spent — the
  // still stands on its own in both cases. Only the *hover* loop is skipped:
  // the fullscreen preview stays reachable, because opening it is a deliberate
  // act rather than something that happens to you on the way past.
  if (reduced() || saveData()) {
    tile.dataset.videoState = reduced() ? 'reduced-motion' : 'save-data';
    return;
  }

  let v = null;
  let spring = null;

  // Built on first intent, not at page load: four tiles preloading metadata
  // costs four requests before anyone has expressed interest in any of them.
  function ensure() {
    if (v) return v;
    v = makeVideo(src, { loop: true, muted: true });
    v.className = 'tile__video';
    v.setAttribute('aria-hidden', 'true');
    frame.insertBefore(v, frame.querySelector('.tile__arrow'));

    spring = new Spring(0, {
      damping: 1.0,
      response: 0.34,          // matches the arrow it sits under
      onUpdate: (val) => { v.style.opacity = String(val); },
      onRest: (s) => {
        v.style.willChange = 'auto';
        // Rewind only once the still has fully covered it, so the reset to
        // frame zero is never visible.
        if (s.value < 0.01) { v.pause(); try { v.currentTime = 0; } catch {} }
      },
    });
    return v;
  }

  function show(on) {
    const el = ensure();
    el.style.willChange = 'opacity';
    if (on) {
      if (el.preload !== 'auto') { el.preload = 'auto'; el.load(); }
      safePlay(el);
      tile.dataset.videoState = 'playing';
    } else {
      tile.dataset.videoState = 'idle';
    }
    spring.setTarget(on ? 1 : 0);   // re-target carries velocity through
  }

  if (HOVERABLE()) {
    tile.addEventListener('pointerenter', () => show(true));
    tile.addEventListener('pointerleave', () => show(false));
    tile.addEventListener('focus', () => show(true));
    tile.addEventListener('blur', () => show(false));
  } else {
    // No hover to speak of: the reel runs while the tile holds the middle of
    // the viewport, mirroring how the arrow announces itself on touch.
    new IntersectionObserver(([e]) => show(e.isIntersecting), {
      rootMargin: '-35% 0px -35% 0px',
      threshold: 0,
    }).observe(tile);
  }

  // Pause whenever the page is hidden — a backgrounded tab should not decode.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && v) v.pause();
  });
}

/**
 * Clicking a video tile opens the preview instead of following the link.
 *
 * NOTE: this replaces the tile's only route to its case study, so the overlay
 * carries a "View full case study" link to the same href. Modifier and middle
 * clicks are left alone, so open-in-new-tab still reaches the case study.
 */
function bindOpen(tile, src, openOverlay) {
  tile.addEventListener('click', (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    tile.querySelector('.tile__video')?.pause();
    openOverlay({
      src,
      title: tile.querySelector('.tile__title')?.textContent ?? '',
      studio: tile.querySelector('.tile__studio')?.textContent ?? '',
      href: tile.getAttribute('href'),
      origin: tile,
    });
  });
}

/* ------------------------------------------------------------
   2. Fullscreen preview — one overlay, reused
   ------------------------------------------------------------ */
function buildOverlay() {
  const root = document.createElement('div');
  root.className = 'vov';
  root.hidden = true;
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-label', 'Project preview');

  root.innerHTML = `
    <div class="vov__scrim" data-close></div>
    <div class="vov__panel">
      <div class="vov__stage"></div>
      <div class="vov__bar">
        <button class="vov__btn vov__toggle" type="button" aria-label="Pause">
          <svg class="vov__i-pause" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>
          </svg>
          <svg class="vov__i-play" viewBox="0 0 24 24" aria-hidden="true" hidden>
            <path d="M8 5.5v13l11-6.5z"/>
          </svg>
        </button>
        <p class="vov__meta"><span class="vov__title"></span><span class="vov__studio"></span></p>
        <a class="vov__case" href="#">View full case study</a>
      </div>
      <button class="vov__btn vov__close" type="button" aria-label="Close preview" data-close>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.6"
                stroke-linecap="round" fill="none"/>
        </svg>
      </button>
    </div>`;

  document.body.appendChild(root);
  return root;
}

function overlay() {
  let root = null;
  let stage, panel, scrim, toggle, iPlay, iPause, titleEl, studioEl, caseEl;
  let spring = null;
  let video = null;
  let lastFocus = null;
  let open = false;

  function mount() {
    if (root) return;
    root = buildOverlay();
    stage = root.querySelector('.vov__stage');
    panel = root.querySelector('.vov__panel');
    scrim = root.querySelector('.vov__scrim');
    toggle = root.querySelector('.vov__toggle');
    iPlay = root.querySelector('.vov__i-play');
    iPause = root.querySelector('.vov__i-pause');
    titleEl = root.querySelector('.vov__title');
    studioEl = root.querySelector('.vov__studio');
    caseEl = root.querySelector('.vov__case');

    if (reduced()) {
      // Cross-fade only — no travel, no spring (apple-design §14).
      root.style.transition = 'opacity 200ms ease';
      root.style.opacity = '0';
    } else {
      spring = new Spring(0, {
        damping: 1.0,
        // EXTRAPOLATED: the contract documents 0.36 (UI), 0.34 (arrow) and
        // 0.5 (reveals) but nothing for a full-viewport surface. 0.42 sits
        // between the UI value and the reveal value.
        response: 0.42,
        onUpdate: (v) => {
          root.style.opacity = String(v);
          // EXTRAPOLATED: scale on a full-viewport panel is a larger gesture
          // than anything else in this codebase.
          panel.style.transform = `scale(${(0.92 + v * 0.08).toFixed(4)})`;
        },
        onRest: (s) => {
          panel.style.willChange = 'auto';
          if (s.value < 0.01) finish();
        },
      });
    }

    root.addEventListener('click', (e) => {
      if (e.target.closest('[data-close]')) close();
    });
    toggle.addEventListener('click', () => {
      if (!video) return;
      if (video.paused) { safePlay(video); } else { video.pause(); }
    });
    document.addEventListener('keydown', (e) => {
      if (!open) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key === 'Tab') trap(e);
    });
  }

  /** Keep focus inside the dialog while it is modal. */
  function trap(e) {
    const f = [...root.querySelectorAll('button, a[href]')].filter((el) => !el.hidden);
    if (!f.length) return;
    const first = f[0];
    const last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function paintToggle() {
    if (!video) return;
    const paused = video.paused;
    iPlay.hidden = !paused;
    iPause.hidden = paused;
    toggle.setAttribute('aria-label', paused ? 'Play' : 'Pause');
  }

  /** Torn down only once the overlay is fully invisible, never mid-fade. */
  function finish() {
    root.hidden = true;
    document.documentElement.style.overflow = '';
    if (video) { video.pause(); video.remove(); video = null; }
    stage.innerHTML = '';
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
    lastFocus = null;
  }

  function show({ src, title, studio, href, origin }) {
    mount();
    // Reopening while the previous close is still fading would otherwise
    // stack a second <video> on the stage behind the first.
    if (video) { video.pause(); video.remove(); video = null; }
    stage.innerHTML = '';
    lastFocus = origin ?? document.activeElement;
    open = true;

    titleEl.textContent = title;
    studioEl.textContent = studio;
    if (href) { caseEl.href = href; caseEl.hidden = false; }
    else caseEl.hidden = true;

    video = makeVideo(src, { loop: false, muted: false });
    video.className = 'vov__video';
    video.preload = 'auto';
    video.addEventListener('play', paintToggle);
    video.addEventListener('pause', paintToggle);
    video.addEventListener('ended', paintToggle);
    stage.appendChild(video);

    root.hidden = false;
    // The page behind must not scroll while a modal owns the viewport.
    document.documentElement.style.overflow = 'hidden';

    safePlay(video);
    paintToggle();
    toggle.focus();

    if (reduced()) {
      requestAnimationFrame(() => { root.style.opacity = '1'; });
    } else {
      panel.style.willChange = 'transform';
      spring.setTarget(1);
    }
  }

  function close() {
    if (!open) return;
    open = false;
    if (video) video.pause();
    if (reduced()) {
      root.style.opacity = '0';
      window.setTimeout(finish, 200);
    } else {
      panel.style.willChange = 'transform';
      spring.setTarget(0);   // interruptible: reopening mid-close resumes
    }
  }

  return show;
}

/* ------------------------------------------------------------
   Boot
   ------------------------------------------------------------ */
export function videoAffordances() {
  const tiles = [...document.querySelectorAll('.tile[data-reel]')];
  if (!tiles.length) return;
  const show = overlay();
  tiles.forEach((t) => hoverPlay(t, show));
}
