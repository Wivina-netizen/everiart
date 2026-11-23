export const sokotoTitle = 'A Visit to an IDP Camp in Sokoto';
const filmRoot = '/assets/sokoto/';

function postcards() {
  return `<figure class="film-player postcard-player" data-fps="24" data-start-frames="0,79,138,203,245,296,383,436,525">
    <video controls playsinline preload="metadata" poster="${filmRoot}poster.jpg" aria-label="${sokotoTitle} · Nine silent moving postcards">
      <source src="${filmRoot}postcards.mp4" type="video/mp4">
      <track kind="descriptions" src="${filmRoot}descriptions.vtt" srclang="en" label="English visual descriptions">
    </video>
    <figcaption>ByEveriArt · Nine moving postcards · Silent</figcaption>
    <div class="postcard-controls" hidden>
      <button type="button" data-previous aria-label="Previous postcard">Previous</button>
      <output aria-live="polite">1 of 9</output>
      <button type="button" data-next aria-label="Next postcard">Next</button>
    </div>
    <p class="postcard-hint" hidden>Each postcard pauses. Choose Next to continue.</p>
  </figure><script type="module" src="/js/postcards.js"></script>`;
}

export function sokotoEntry(filmsPath) {
  return `<section class="house-section page-width" id="sokoto"><div class="section-side">
    <p class="eyebrow">DOCUMENTARY POSTCARDS</p><h2>${sokotoTitle}</h2>
    <p class="film-description">A camp for internally displaced people in Sokoto, Nigeria.</p>
    <a class="text-link" href="${filmsPath}sokoto/">Open the postcard story</a></div><div>${postcards()}</div></section>`;
}

export function sokotoPage(filmsPath) {
  return `<header class="film-heading page-width"><a class="back-link" href="${filmsPath}">Back to film production</a>
    <p class="eyebrow">BYEVERIART · DOCUMENTARY POSTCARDS</p><h1>${sokotoTitle}</h1>
    <p class="house-lede">A camp for internally displaced people in Sokoto, Nigeria.</p></header>
    <div class="page-width postcard-page">${postcards()}</div>`;
}
