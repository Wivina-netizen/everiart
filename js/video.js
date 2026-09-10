/* ============================================================
   EVERIART — Video

   The case-study reel, and the fullscreen overlay it expands into.

   Hover-to-play on grid tiles used to live here too, and is gone: a tile is
   a still and a link, and the footage belongs on the project's own page
   where there is room to watch it.

   Built against the same contract as js/main.js: springs everywhere a user
   can touch, animating from the live on-screen value so an interrupted
   gesture continues rather than jumping (apple-design §3); CSS transitions
   only on the reduced-motion path (§4, §14).

   No <video controls> anywhere. Native controls carry a download item in
   the overflow menu on Chrome, so the chrome is not hidden — it is never
   created, and the controls in the overlay are ours.
   ============ */

import { Spring, prefersReducedMotion } from './spring.js?v=2';

const reduced = () => prefersReducedMotion();


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
        <!-- Sound is offered here and nowhere else. The inline reel has to be
             muted to autoplay at all, so this is the first point at which
             unmuting is even possible, and expanding is a deliberate act. -->
        <button class="vov__btn vov__mute" type="button" aria-label="Unmute">
          <svg class="vov__i-muted" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 9.5h3L11 6v12L7 14.5H4z"/>
            <path d="M15 9.5l5 5M20 9.5l-5 5" stroke="currentColor" stroke-width="1.6"
                  stroke-linecap="round" fill="none"/>
          </svg>
          <svg class="vov__i-sound" viewBox="0 0 24 24" aria-hidden="true" hidden>
            <path d="M4 9.5h3L11 6v12L7 14.5H4z"/>
            <path d="M14.5 9a4.2 4.2 0 0 1 0 6M17 6.5a7.5 7.5 0 0 1 0 11" stroke="currentColor"
                  stroke-width="1.6" stroke-linecap="round" fill="none"/>
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
  let mute, iMuted, iSound;
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
    mute = root.querySelector('.vov__mute');
    iMuted = root.querySelector('.vov__i-muted');
    iSound = root.querySelector('.vov__i-sound');

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
    mute.addEventListener('click', () => {
      if (!video) return;
      video.muted = !video.muted;
      paintMute();
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

  function paintMute() {
    if (!video) return;
    iMuted.hidden = !video.muted;
    iSound.hidden = video.muted;
    mute.setAttribute('aria-label', video.muted ? 'Unmute' : 'Mute');
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

    video = makeVideo(src, { loop: true, muted: true });
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
    paintMute();
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
   3. The case-study reel — inline, chromeless, expandable.

   It sits in the body after the first two stills, and it is meant to read as
   one more still until you touch it: muted, looped, autoplaying while it
   holds the viewport, cross-faded up from the thumbnail, and carrying no
   player chrome at all. No scrubber, no timeline, no play button, no
   Picture-in-Picture (makeVideo denies it and strips the remote-playback and
   download items with it).

   Autoplay is why it is muted, not a preference — a browser will refuse an
   unmuted autoplay, and there is no control here to recover with. Sound
   therefore lives in the overlay, which is opened deliberately.

   The one interaction is expand. Its control is built here rather than in the
   markup, because without JS there is no video to expand and a dead button is
   worse than no button; and it stays invisible until the frame is hovered or
   the control is focused, so the resting state really is just an image.
   ------------------------------------------------------------ */
const EXPAND_ICON =
  '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
  '<path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7" stroke="currentColor" ' +
  'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>';

export function caseStudyReel() {
  const section = document.querySelector('.preel[data-reel]');
  if (!section) return;

  const src = section.dataset.reel;
  const frame = section.querySelector('.preel__frame');
  if (!src || !frame) return;

  // Page identity for the overlay's caption — the reel belongs to whatever
  // project this page is.
  const title = document.querySelector('.phero__title')?.textContent?.trim() ?? '';
  const studio = document.querySelector('.phero__label')?.textContent?.trim() ?? '';

  let v = null;
  let spring = null;
  let openOverlay = null;

  /* Expand is offered even under reduced motion and Data Saver. Neither is a
     reason to withhold the footage — they are reasons not to start it
     unasked, and pressing this is asking. */
  const expand = document.createElement('button');
  expand.type = 'button';
  expand.className = 'preel__expand';
  expand.setAttribute('aria-label', title ? `Expand ${title} reel to fullscreen` : 'Expand reel to fullscreen');
  expand.innerHTML = EXPAND_ICON;
  expand.addEventListener('click', () => {
    if (!openOverlay) openOverlay = overlay();
    // Two decodes of the same file for one reader is waste, and the inline
    // one is about to be covered by a full-viewport panel anyway.
    if (v) v.pause();
    openOverlay({ src, title, studio, origin: expand });
  });
  frame.appendChild(expand);

  // Motion someone asked not to see, and data they may not want spent. The
  // still is already in place and simply stays — a real final state, with
  // expand still there for anyone who wants the reel.
  if (reduced() || saveData()) {
    section.dataset.videoState = reduced() ? 'reduced-motion' : 'save-data';
    return;
  }

  // Built on first approach, not at page load: this is below the fold on
  // every case study, and most of them are read without reaching it.
  function ensure() {
    if (v) return v;
    v = makeVideo(src, { loop: true, muted: true });
    v.className = 'preel__video';
    v.setAttribute('aria-hidden', 'true');
    // Before the expand control, so the control stays on top of it.
    frame.insertBefore(v, expand);

    spring = new Spring(0, {
      damping: 1.0,
      response: 0.5,           // a large surface, as reveals() treats one
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

  function set(on) {
    const el = ensure();
    el.style.willChange = 'opacity';
    if (on) {
      if (el.preload !== 'auto') { el.preload = 'auto'; el.load(); }
      safePlay(el);
      section.dataset.videoState = 'playing';
    } else {
      section.dataset.videoState = 'idle';
    }
    spring.setTarget(on ? 1 : 0);   // re-target carries velocity through
  }

  new IntersectionObserver(([e]) => {
    set(e.isIntersecting && e.intersectionRatio >= 0.4);
  }, { threshold: [0, 0.4, 0.75] }).observe(frame);

  // A backgrounded tab should not decode video.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && v) v.pause();
  });
}
