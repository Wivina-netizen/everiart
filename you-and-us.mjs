import { nativeFilm } from './film-players.mjs';

const media = '/assets/you-and-us/';
const credit = 'A programme by Julius Holland and The Aysha Clothier, documented by ByEveriArt.';

function shortFilm() {
  return nativeFilm({
    src: media + 'film.mp4', poster: media + 'poster.jpg', captions: media + 'captions.vtt',
    label: 'U&US · Documentary portfolio short', caption: 'U&US · Documentary portfolio short', aspect: '4 / 3'
  });
}

export function programmeEntry(filmsPath) {
  return `<section id="u-and-us" class="house-section page-width">
    <div class="section-side"><p class="eyebrow">DOCUMENTARY · FASHION</p>
    <h2>U<i>&amp;</i>US</h2><p class="film-description">${credit}</p>
    <a class="text-link" href="${filmsPath}u-and-us/">Explore the programme and photographs</a></div>
    <div>${shortFilm()}</div></section>`;
}

export function programmePage(filmsPath) {
  return `<header class="film-heading page-width"><a class="back-link" href="${filmsPath}">Back to film production</a>
    <p class="eyebrow">BYEVERIART · DOCUMENTARY</p><h1>U<i>&amp;</i>US</h1>
    <p class="house-lede">${credit}</p></header>
    <section class="house-section page-width"><div class="section-side"><p class="eyebrow">THE PROGRAMME</p>
    <h2>Inside the <i>workshop.</i></h2>
    <p class="film-description">A speaker opens with the boubou. Three participants then describe developing a design, bringing an idea to life and finding room to experiment.</p><p class="film-description">ByEveriArt documented the programme with an eight-person media crew on site. The team handled all photography, documentary cinematography, logistics and procurement.</p>
    </div><div>${shortFilm()}</div></section>
    <section class="house-section page-width"><div class="section-side"><p class="eyebrow">PHOTOGRAPHY BY BYEVERIART</p><h2>Three days <i>in photographs.</i></h2></div>
    <div class="programme-gallery">
    <figure><img src="${media}day-1.jpg" loading="lazy" alt="Participants gather around a white table, with dress forms along the wall behind them."><figcaption>Day 1 · Around the workshop table</figcaption></figure>
    <figure><img src="${media}day-5.jpg" loading="lazy" alt="Folded red-and-gold printed cloth lies beside a pile of white paper pattern pieces, with three people around the table."><figcaption>Day 5 · Working with cloth and pattern pieces</figcaption></figure>
    <figure><img src="${media}garments.jpg" loading="lazy" alt="Five participants stand together wearing the finished patterned garments."><figcaption>Day 7 · The finished garments</figcaption></figure>
    </div></section>
    <section class="house-end page-width"><h2>Document <i>your programme.</i></h2>
    <p>Talk to us about photography, documentary coverage and on-site production support.</p><a class="solid-link" href="/contact/">Contact ByEveriArt</a></section>`;
}
