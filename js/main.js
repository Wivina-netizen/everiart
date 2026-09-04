/* ============================================================
   EVERIART — Interaction layer
   Built against apple-design: springs everywhere a user can touch,
   presentation-value animation, interruptible, reduced-motion aware.
   ============================================================ */

import { Spring, prefersReducedMotion, REDUCED } from './spring.js';

const reduced = () => prefersReducedMotion();

/* ------------------------------------------------------------
   1. Hero — ONE orchestrated load sequence (not per-section fades)
   ------------------------------------------------------------ */
function heroSequence() {
  const segs = document.querySelectorAll('.hero__seg > span');
  const sub = document.querySelector('.hero__sub');
  const foot = document.querySelector('.hero__foot');
  const cueLine = document.querySelector('.scroll-cue__line');

  if (reduced()) {
    [...segs, sub, foot].forEach((el) => {
      if (el) { el.style.transform = 'none'; el.style.opacity = '1'; }
    });
    if (cueLine) cueLine.style.transform = 'scaleX(1)';
    return;
  }

  // Wordmark segments rise from their own clipped mask, staggered.
  segs.forEach((seg, i) => {
    seg.style.transform = 'translate3d(0, 105%, 0)';
    const s = new Spring(105, {
      damping: 1.0,
      response: 0.62,
      onUpdate: (v) => { seg.style.transform = `translate3d(0, ${v}%, 0)`; },
    });
    setTimeout(() => s.setTarget(0), 120 + i * 95);
  });

  // Supporting copy follows the wordmark, never competes with it.
  [sub, foot].forEach((el, i) => {
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translate3d(0, 18px, 0)';
    const s = new Spring(0, {
      damping: 1.0,
      response: 0.55,
      onUpdate: (v) => {
        el.style.opacity = String(v);
        el.style.transform = `translate3d(0, ${(1 - v) * 18}px, 0)`;
      },
    });
    setTimeout(() => s.setTarget(1), 520 + i * 110);
  });

  if (cueLine) {
    cueLine.style.transform = 'scaleX(0)';
    const s = new Spring(0, {
      damping: 1.0,
      response: 0.7,
      onUpdate: (v) => { cueLine.style.transform = `scaleX(${v})`; },
    });
    setTimeout(() => s.setTarget(1), 820);
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
   4. Hero parallax — large moving surface, subtle, rAF-throttled
   ------------------------------------------------------------ */
function heroParallax() {
  const img = document.querySelector('.hero__media img');
  if (!img || reduced()) return;

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      if (y < window.innerHeight * 1.2) {
        img.style.transform = `translate3d(0, ${y * 0.16}px, 0) scale(1.08)`;
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
