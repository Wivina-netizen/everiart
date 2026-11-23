const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

export function nativeFilm({ src, poster, label, caption, aspect = '16 / 9', captions }) {
  return `<figure class="film-player"><video controls playsinline preload="none" controlslist="nodownload" style="--film-aspect: ${esc(aspect)}" poster="${esc(poster)}" aria-label="${esc(label)}"><source src="${esc(src)}" type="video/mp4">${captions ? `<track kind="captions" src="${esc(captions)}" srclang="en" label="English">` : ''}</video><figcaption>${esc(caption)}</figcaption></figure>`;
}

export function projectFilms(project) {
  const films = [];
  if (project.reel) films.push({ src: project.reel, caption: 'Project reel', aspect: project.reelAspect });
  for (const [index, src] of (project.clips || []).entries()) {
    if (!films.some(film => film.src === src)) films.push({ src, caption: `Cut ${index + 1}` });
  }
  return films.map(film => nativeFilm({
    ...film, poster: '/' + project.thumb, label: project.name + ' · ' + film.caption
  })).join('\n');
}

export function youtubeFilm(id, label) {
  return `<figure class="film-player"><iframe width="640" height="360" src="https://www.youtube-nocookie.com/embed/${id}?playsinline=1" title="${esc(label)}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="encrypted-media; fullscreen; picture-in-picture" allowfullscreen></iframe><figcaption>${esc(label)} · <a href="https://www.youtube.com/watch?v=${id}">Watch on YouTube</a></figcaption></figure>`;
}
