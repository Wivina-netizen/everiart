const film = document.querySelector('#entrance-film');
const motion = document.querySelector('#motion-toggle');
if (film && motion) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (!reduced.matches && !navigator.connection?.saveData) {
    film.src = film.dataset.src;
    film.play().then(() => { motion.hidden = false; }).catch(() => {});
  }
  motion.addEventListener('click', () => {
    if (film.paused) film.play().then(() => motion.textContent = 'Pause motion').catch(() => {});
    else { film.pause(); motion.textContent = 'Play motion'; }
  });
  reduced.addEventListener('change', () => { if (reduced.matches) { film.pause(); motion.textContent = 'Play motion'; } });
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
