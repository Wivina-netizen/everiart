const feed = document.querySelector('.reels-feed');
if (feed) {
  const cards = [...feed.querySelectorAll('.reel-card')];
  const videos = [...feed.querySelectorAll('video')];
  const previous = document.querySelector('[data-reel-prev]');
  const next = document.querySelector('[data-reel-next]');
  const position = document.querySelector('[data-reel-position]');
  let current = 0;
  const update = index => {
    current = index;
    previous.disabled = index === 0;
    next.disabled = index === cards.length - 1;
    position.textContent = `${index + 1} / ${cards.length}`;
  };
  const move = index => {
    index = Math.max(0, Math.min(cards.length - 1, index));
    feed.scrollTo({top:cards[index].offsetTop - cards[0].offsetTop,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  };
  previous.addEventListener('click', () => move(current - 1));
  next.addEventListener('click', () => move(current + 1));
  feed.addEventListener('keydown', event => {
    if (event.target !== feed) return;
    const target = {ArrowDown:current + 1, ArrowUp:current - 1, Home:0, End:cards.length - 1}[event.key];
    if (target !== undefined) { event.preventDefault(); move(target); }
  });
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.intersectionRatio > .6) update(Number(entry.target.dataset.reelIndex));
      else entry.target.querySelector('video').pause();
    }
  }, {root:feed,threshold:[0,.6]});
  cards.forEach(card => observer.observe(card));
  videos.forEach(video => {
    video.addEventListener('play', () => videos.forEach(other => { if (other !== video) other.pause(); }));
    const showError = () => { video.closest('.reel-card').querySelector('.reel-error').hidden = false; };
    video.addEventListener('error', showError);
    video.querySelector('source').addEventListener('error', showError);
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) videos.forEach(video => video.pause()); });
  update(0);
  document.querySelector('.reels-controls').hidden = cards.length < 2;
}
