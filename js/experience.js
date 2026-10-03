const film = document.querySelector('#entrance-film');
if (film) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  // Fade to the existing dark background on both sides of each native video loop.
  const speed = 0.65;
  let frame;
  const canPlay = () => !reduced.matches && !navigator.connection?.saveData && !document.hidden;
  const fade = () => {
    if (Number.isFinite(film.duration) && film.duration > 0) {
      const fadeLength = Math.min(1.2 * speed, film.duration / 4);
      const progress = Math.max(0, Math.min(1, film.currentTime / fadeLength, (film.duration - film.currentTime) / fadeLength));
      const eased = progress * progress * (3 - 2 * progress);
      film.style.opacity = String(0.65 * eased);
    }
    if (!film.paused) frame = requestAnimationFrame(fade);
  };
  const syncPlayback = () => {
    if (!canPlay()) {
      film.pause();
      cancelAnimationFrame(frame);
      film.style.removeProperty('opacity');
      return;
    }
    if (!film.getAttribute('src')) {
      film.style.opacity = '0';
      film.src = film.dataset.src;
    }
    film.defaultPlaybackRate = speed;
    film.playbackRate = speed;
    film.play().catch(() => { film.style.removeProperty('opacity'); });
  };
  film.addEventListener('playing', () => {
    cancelAnimationFrame(frame);
    fade();
  });
  film.addEventListener('pause', () => cancelAnimationFrame(frame));
  film.addEventListener('error', () => {
    cancelAnimationFrame(frame);
    film.style.removeProperty('opacity');
  });
  reduced.addEventListener('change', syncPlayback);
  navigator.connection?.addEventListener('change', syncPlayback);
  document.addEventListener('visibilitychange', syncPlayback);
  syncPlayback();
}

// One-time marketing reveals; chat and controls remain immediately responsive.
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
if (!reduceMotion.matches && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.08 });
  document.querySelectorAll('.studio-grid, .project-grid, .process-strip').forEach(group => {
    [...group.children].forEach((item, index) => {
      item.classList.add('reveal-item');
      item.style.setProperty('--reveal-delay', `${Math.min(index, 3) * 60}ms`);
      observer.observe(item);
    });
  });
  reduceMotion.addEventListener('change', event => {
    if (!event.matches) return;
    observer.disconnect();
    document.querySelectorAll('.reveal-item').forEach(item => item.classList.add('is-visible'));
  });
}

// Local, bounded arrow response. Touch and reduced-motion users keep a stable control.
const arrowMotion = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
const arrowCards = [...document.querySelectorAll('.studio-door, .project-card')];
function resetArrow(card) {
  const arrow = card.querySelector('.image-arrow');
  arrow?.style.removeProperty('--arrow-x');
  arrow?.style.removeProperty('--arrow-y');
}
for (const card of arrowCards) {
  card.addEventListener('pointermove', event => {
    if (!arrowMotion.matches || event.pointerType !== 'mouse') return;
    const arrow = card.querySelector('.image-arrow');
    const area = card.getBoundingClientRect();
    if (!arrow || !area.width || !area.height) return;
    const clamp = value => Math.max(-6, Math.min(6, value));
    arrow.style.setProperty('--arrow-x', `${clamp(((event.clientX-area.left)/area.width-.5)*12)}px`);
    arrow.style.setProperty('--arrow-y', `${clamp(((event.clientY-area.top)/area.height-.5)*12)}px`);
  });
  card.addEventListener('pointerleave', () => resetArrow(card));
  card.addEventListener('pointercancel', () => resetArrow(card));
}
arrowMotion.addEventListener('change', () => arrowCards.forEach(resetArrow));
