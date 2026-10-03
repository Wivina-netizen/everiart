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
