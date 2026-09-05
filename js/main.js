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
  const pill = root.querySelector('.filter__pill');
  const btns = [...root.querySelectorAll('.filter__btn')];
  const cards = [...document.querySelectorAll('.card')];
  if (!pill || !btns.length) return;

  // The pill only moves on interaction, so it holds a compositor layer only
  // between a press and the springs settling — not for the page's lifetime.
  const moving = { x: false, w: false };
  const releasePill = () => {
    if (!moving.x && !moving.w) pill.style.willChange = 'auto';
  };

  // Two independent springs — X and width never share one spring.
  const xs = new Spring(0, {
    damping: 1.0,
    response: 0.36,
    onUpdate: (v) => { pill.style.transform = `translate3d(${v}px, 0, 0)`; },
    onRest: () => { moving.x = false; releasePill(); },
  });
  const ws = new Spring(0, {
    damping: 1.0,
    response: 0.36,
    onUpdate: (v) => { pill.style.width = `${v}px`; },
    onRest: () => { moving.w = false; releasePill(); },
  });

  function movePill(btn, animate = true) {
    const x = btn.offsetLeft - root.clientLeft;
    const w = btn.offsetWidth;
    if (!animate || reduced()) {
      // A hard set never animates, so it never needs the hint. set() also
      // stops the spring without firing onRest, hence clearing the flags here.
      moving.x = moving.w = false;
      xs.set(x); ws.set(w);
      releasePill();
    } else {
      pill.style.willChange = 'transform';
      moving.x = moving.w = true;
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
        card.style.willChange = 'opacity, transform';
        const s = new Spring(current, {
          damping: 1.0,
          response: 0.42,
          onUpdate: (v) => {
            card.style.opacity = String(v);
            card.style.transform = `translate3d(0, ${(1 - v) * 14}px, 0) scale(${0.985 + v * 0.015})`;
          },
          onRest: () => { card.style.willChange = 'auto'; },
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
