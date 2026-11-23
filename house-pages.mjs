import { sokotoEntry, sokotoPage } from './sokoto.mjs';
import { programmeEntry, programmePage } from './you-and-us.mjs';
import { nativeFilm, projectFilms, youtubeFilm } from './film-players.mjs';

const studioPath = '/experience/byeveriart/';
const filmsPath = studioPath + 'films/';
const featurePath = filmsPath + 'deadly-pursuit/';
const media = '/assets/deadly-pursuit/';
const casePhoto = media + 'hero.jpg';

export const filmTab = studio => studio === 'byeveriart'
  ? `<a href="${filmsPath}">Films</a>` : '';

const credits = [
  ['Executive producers', 'ByEveriArt and Ambrose Oseni'],
  ['Director and producer', 'Ambrose Profect'],
  ['Producer', 'John Chris'],
  ['Writer', 'Quinet'],
  ['Script editor', 'Rash Boheiman'],
  ['Director of photography', 'Bobo Ezii'],
  ['Film editor', 'John F. Nwokoro'],
  ['Production manager', 'Cynthia Obadan']
];

function about(studios) {
  const disciplines = [
    'Our full-service media production house offers film production, cinematography, videography and photography. We make full-length movies, documentaries and films for brands.',
    'Brand identities, art direction and visual systems for the places a brand meets its audience.',
    'Portraits, events and brand photography, with an eye for the people and details that give a place its character.'
  ];
  return `<header class="house-opening page-width">
    <div><p class="eyebrow">ABOUT US · ABUJA, NIGERIA</p>
    <h1>Welcome to<br><i>Everiart.</i></h1>
    <p class="house-lede">We’re a creative house in Abuja. We bring filmmakers, designers and photographers together around one question. What do you want people to see?</p></div>
    <figure><img src="${casePhoto}" alt="Behind the scenes on Deadly Pursuit" fetchpriority="high"><figcaption>On set · Deadly Pursuit</figcaption></figure>
  </header>
  <section class="house-section page-width"><div class="section-side"><p class="eyebrow">THE HOUSE</p><h2>Three studios.</h2></div>
    <div class="house-rows">${studios.map((s, i) => `<article><h3><a href="/experience/${s.id}/">${s.name}</a></h3><p>${disciplines[i]}</p><a class="text-link" href="/experience/${s.id}/">Explore ${s.name}</a></article>`).join('')}</div>
  </section>
  <section class="house-section page-width"><div class="section-side"><p class="eyebrow">PEOPLE</p><h2>Meet the house.</h2></div>
    <div class="house-rows"><article class="house-person"><span class="house-initials" aria-hidden="true">ARI</span><div><p class="eyebrow">MANAGING DIRECTOR</p><h3>Abdul Rahim Ibrahim</h3><p>Abdul Rahim Ibrahim leads Everiart Creative House in Abuja.</p></div></article>
    <article><p class="eyebrow">CREATIVE DIRECTION &amp; CINEMATOGRAPHY</p><h3>David Wivina</h3><p>An Abuja-based creative director and cinematographer, David works across film, logo design and visual storytelling.</p><a class="text-link" href="https://ng.linkedin.com/in/everiart">David on LinkedIn</a></article>
    <article><p class="eyebrow">STUDIO COLLABORATORS</p><h3>Perfecto Movies, Cine Magic<br>and Perfect Visuals</h3><p>ByEveriArt collaborated with Perfecto Movies on the Argungu and Gumel documentaries, handling logistics and procurement, cinematography and most of post-production. On <a class="inline-credit" href="${featurePath}">Deadly Pursuit</a>, a Profect Original Film, ByEveriArt was an executive producer.</p><a class="text-link" href="${filmsPath}#documentaries">Explore the documentary credits</a></article></div>
  </section>
  <section class="house-section page-width"><div class="section-side"><p class="eyebrow">GET IN TOUCH</p><h2>Find us.</h2></div><div class="house-rows"><article><h3>Wuse 2, Abuja</h3><p>170 Ademola Adetokunbo, Wuse 2, Abuja, Nigeria</p><p>Tell us where you plan to shoot. We can discuss local crew, travel requirements and relevant references for overseas work.</p><div class="house-links"><a class="text-link" href="/contact/">Contact the house</a><a class="text-link" href="https://www.instagram.com/byeveriart/">ByEveriArt on Instagram</a><a class="text-link" href="https://www.instagram.com/everidesign/">EveriDesign on Instagram</a><a class="text-link" href="https://everiart.com/">everiart.com</a></div></article></div></section>`;
}

function featureExcerpt() {
  return nativeFilm({ src: media + 'excerpt.mp4', poster: media + 'title.jpg',
    label: 'Deadly Pursuit · Work-in-progress excerpt', caption: 'Work-in-progress excerpt · 34 seconds · From the rough cut' });
}

function films(published) {
  const studioFilms = published.filter(p => p.studio === 'byeveriart' && (p.reel || p.clips?.length));
  const selected = studioFilms.map(p => `<article><p class="eyebrow">${p.discipline}</p><h3>${p.name}</h3>
    ${projectFilms(p)}<a class="text-link" href="/work/${p.slug}/">Explore the ${p.name} project</a></article>`).join('');
  return `<header class="film-heading page-width"><a class="back-link" href="${studioPath}">Back to ByEveriArt</a>
    <p class="eyebrow">BYEVERIART</p><h1>Film <i>production.</i></h1><p class="house-lede">Full-length movies and documentary work from our studio and the people we make films with.</p>
    <nav class="portfolio-views" aria-label="Portfolio view"><a href="${studioPath}work/">Portfolio</a><a href="${filmsPath}" aria-current="page">Films</a><a href="${studioPath}reels/">Reels</a></nav></header>
  <section class="house-section page-width"><div class="section-side"><p class="eyebrow">FEATURE FILM · CRIME THRILLER</p><h2>Deadly <i>Pursuit.</i></h2><p class="film-description">A Profect Original Film in collaboration with ByEveriArt.</p><a class="text-link" href="${featurePath}">Explore the production and crew</a></div><div>${featureExcerpt()}</div></section>
  ${programmeEntry(filmsPath)}
  ${sokotoEntry(filmsPath)}
  <section id="documentaries" class="house-section page-width"><div class="section-side"><p class="eyebrow">DOCUMENTARIES</p><h2>ByEveriArt <i>with</i><br>Perfecto Movies.</h2>
    </div>
    <div class="house-rows"><article><h3>Argungu Fishing Festival Documentary</h3><p>For the film about the Argungu Fishing Festival, ByEveriArt handled production logistics and procurement, filmed the festival and carried out most of post-production in collaboration with Perfecto Movies.</p><p>From Perfecto Movies’ festival series, <i>Homa (The Net)</i> offers a short look at the fishing tradition.</p>
    ${youtubeFilm('P66ZIpQIxms', 'Homa (The Net) · Related festival short by Perfecto Movies')}
    <a class="text-link" href="/contact/">Enquire about a documentary screening</a></article>
    <article><h3>Gumel Documentary</h3><p>ByEveriArt worked with Perfecto Movies to document the celebrations marking the Emir of Gumel’s 45th anniversary on the throne. ByEveriArt organised production logistics, procured what the shoot needed, handled cinematography and completed most of post-production for the documentary. The Gumel Emirate commissioned the project.</p>
    ${youtubeFilm('g9exVt_daOI', 'Gumel · Official highlight by Perfecto Movies')}</article></div></section>
  <section class="house-section page-width"><div class="section-side"><p class="eyebrow">BYEVERIART</p><h2>Studio films.</h2></div><div class="house-rows">${selected}</div></section>
  <section class="house-section page-width"><div class="section-side"><p class="eyebrow">FURTHER WORK</p><h2>From the archive.</h2></div>
    <div class="house-rows"><article><h3>Oga Friday &amp; Ovie Portrait</h3><p>Our wider portfolio also includes television commercials, highlight films and wedding work. Get in touch for project-specific credits, crew profiles and available viewing copies.</p><a class="text-link" href="/contact/">Request a viewing</a></article></div></section>`;
}

function feature() {
  return `<header class="film-heading page-width"><a class="back-link" href="${filmsPath}">Back to film production</a>
    <p class="eyebrow">BYEVERIART · FEATURE FILM</p><h1>Deadly <i>Pursuit.</i></h1>
    <p class="house-lede">A wounded agent crosses Jessica’s path and draws her into the hunt for a missing drive.</p></header>
    <div class="page-width">${featureExcerpt()}</div>
    <section class="house-section page-width"><div class="section-side"><p class="eyebrow">PRODUCTION</p><h2>Making the film.</h2></div><div class="house-rows"><article><p class="eyebrow">A PROFECT ORIGINAL FILM IN COLLABORATION WITH BYEVERIART</p><h3>A full-scale Nollywood production</h3><p>ByEveriArt served as an executive producer on this high-end crime thriller. A substantial production budget supported a full set, vehicles and a production crew that included assistant directors, camera operators and a dedicated sound team.</p></article></div></section>
    <section class="house-section page-width"><div class="section-side"><p class="eyebrow">CREW</p><h2>Selected credits.</h2></div><dl class="film-credits">${credits.map(([role, name]) => `<div><dt>${role}</dt><dd>${name}</dd></div>`).join('')}</dl></section>
    <section class="house-section page-width"><div class="section-side"><p class="eyebrow">BEHIND THE SCENES</p><h2>On set.</h2></div>
    <div class="film-gallery">${[
      ['office-set.jpg', 'Crew gathered around a desk with a boom microphone overhead.', 'The office set'],
      ['camera-rig.jpg', 'Camera operator working with a rig on the kitchen set.', 'Camera on location'],
      ['cast-on-set.jpg', 'A performer in pink between setups.', 'Between setups'],
      ['lighting-setup.jpg', 'A crew member adjusts a diffused light.', 'Lighting the scene']
    ].map(([image, alt, caption]) => `<figure><img src="${media}${image}" loading="lazy" alt="${alt}"><figcaption>${caption}</figcaption></figure>`).join('')}</div></section>
    <section class="house-end page-width"><h2>Planning <i>a film?</i></h2><p>Tell us about your script, your locations and the production support you need.</p><a class="solid-link" href="/contact/">Talk to the film team</a></section>`;
}

export function generateHousePages({ studios, published, head, nav, foot, tail, save }) {
  const pages = [
    ['about/', 'About us — Everiart Creative House', 'Meet our Abuja creative house, its three studios, leadership and film collaborators.', about(studios), 'about'],
    [filmsPath.slice(1), 'Film production — ByEveriArt', 'Explore full-length film production, documentary credits and public viewing links from ByEveriArt in Abuja.', films(published), 'experience'],
    [filmsPath.slice(1) + 'sokoto/', 'Sokoto — Moving postcards by ByEveriArt', 'Nine silent documentary postcards from a camp for internally displaced people in Sokoto, Nigeria.', sokotoPage(filmsPath), 'experience'],
    [filmsPath.slice(1) + 'u-and-us/', 'U&US — Julius Holland, The Aysha Clothier and ByEveriArt', 'Watch a short documentary portfolio edit and explore photographs from U&US, a programme by Julius Holland and The Aysha Clothier, documented by ByEveriArt.', programmePage(filmsPath), 'experience'],
    [featurePath.slice(1), 'Deadly Pursuit — ByEveriArt', 'Inside the making of Deadly Pursuit, a feature-length crime thriller. Watch the work-in-progress excerpt and explore the production photography and crew credits.', feature(), 'experience']
  ];
  for (const [path, title, description, body, active] of pages) {
    const meta = head(title, description).replace('</head>', '<link rel="stylesheet" href="/css/house.css"><link rel="stylesheet" href="/css/film-players.css"></head>');
    save(path + 'index.html', meta + `<body class="studio-page night">${nav(active)}<main id="main">${body}</main>${foot}${tail}`);
  }
}
