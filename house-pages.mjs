const studioPath = '/experience/byeveriart/';
const filmsPath = studioPath + 'films/';
const featurePath = filmsPath + 'deadly-pursuit/';
const media = '/assets/deadly-pursuit/';
const casePhoto = media + 'hero.jpg';

export const filmTab = studio => studio === 'byeveriart'
  ? `<a href="${filmsPath}">Films</a>` : '';

const credits = [
  ['Executive producer', 'Ambrose Oseni'],
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
    'Full-length movies, documentaries and films for brands, from work on location to the edit.',
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
    <article><p class="eyebrow">STUDIO COLLABORATORS</p><h3>Perfecto Movies, Cine Magic<br>and Perfect Visuals</h3><p>Our work with Perfecto Movies includes the Argungu and Gumel documentaries. Everiart handled logistics and procurement, cinematography and most of post-production on both projects.</p><a class="text-link" href="${filmsPath}#documentaries">Explore the documentary credits</a></article></div>
  </section>
  <section class="house-section page-width"><div class="section-side"><p class="eyebrow">GET IN TOUCH</p><h2>Find us.</h2></div><div class="house-rows"><article><h3>Wuse 2, Abuja</h3><p>170 Ademola Adetokunbo, Wuse 2, Abuja, Nigeria</p><p>Tell us where you plan to shoot. We can discuss local crew, travel requirements and relevant references for overseas work.</p><div class="house-links"><a class="text-link" href="/contact/">Contact the house</a><a class="text-link" href="https://www.instagram.com/byeveriart/">ByEveriArt on Instagram</a><a class="text-link" href="https://www.instagram.com/everidesign/">EveriDesign on Instagram</a><a class="text-link" href="https://everiart.com/">everiart.com</a></div></article></div></section>`;
}

function films() {
  return `<header class="film-heading page-width"><a class="back-link" href="${studioPath}">Back to ByEveriArt</a>
    <p class="eyebrow">BYEVERIART</p><h1>Film <i>production.</i></h1><p class="house-lede">Full-length movies and documentary work from our studio and the people we make films with.</p>
    <nav class="portfolio-views" aria-label="Portfolio view"><a href="${studioPath}work/">Portfolio</a><a href="${filmsPath}" aria-current="page">Films</a><a href="${studioPath}reels/">Reels</a></nav></header>
  <div class="page-width"><a href="${featurePath}" class="feature-plate">
    <img src="${casePhoto}" alt="On set during the production of Deadly Pursuit" fetchpriority="high">
    <div><p class="eyebrow">FEATURE FILM · CRIME THRILLER</p><h2>Deadly <i>Pursuit.</i></h2><span class="plate-link">Explore the production</span></div></a></div>
  <section id="documentaries" class="house-section page-width"><div class="section-side"><p class="eyebrow">NONFICTION</p><h2>Documentaries.</h2></div>
    <div class="house-rows"><article><p class="eyebrow">WITH PERFECTO MOVIES</p><h3>Argungu Fishing Festival Documentary</h3><p>Everiart handled logistics and procurement, cinematography and most of post-production.</p><a class="text-link" href="/contact/">Enquire about a screening</a><p>Related viewing from Perfecto Movies</p><a class="text-link" href="https://www.youtube.com/watch?v=P66ZIpQIxms">Homa (The Net) · Festival short</a></article>
    <article><p class="eyebrow">WITH PERFECTO MOVIES</p><h3>Gumel Documentary</h3><p>Everiart handled logistics and procurement, cinematography and most of post-production. The Gumel Emirate commissioned Perfecto Movies to document the Emir’s anniversary celebrations. Perfecto Movies shares a short highlight from the celebrations below.</p><a class="text-link" href="https://www.youtube.com/watch?v=g9exVt_daOI">Watch Perfecto Movies’ official highlight</a></article>
    <article><p class="eyebrow">BYEVERIART</p><h3>Hope for Her</h3><p>View the documentary reel and selected frames in our studio portfolio.</p><a class="text-link" href="/work/hope-for-her/">View Hope for Her</a></article></div></section>
  <section class="house-section page-width"><div class="section-side"><p class="eyebrow">FURTHER WORK</p><h2>From the archive.</h2></div>
    <div class="house-rows"><article><h3>Oga Friday &amp; Ovie Portrait</h3><p>Our wider portfolio also includes television commercials, highlight films and wedding work. Get in touch for project-specific credits, crew profiles and available viewing copies.</p><a class="text-link" href="/contact/">Request a viewing</a></article></div></section>`;
}

function feature() {
  return `<header class="film-heading page-width"><a class="back-link" href="${filmsPath}">Back to film production</a>
    <p class="eyebrow">BYEVERIART · FEATURE FILM</p><h1>Deadly <i>Pursuit.</i></h1>
    <p class="house-lede">A wounded agent crosses Jessica’s path and draws her into the hunt for a missing drive.</p></header>
    <div class="page-width"><figure class="feature-frame">
      <video controls playsinline preload="none" poster="${media}title.jpg" aria-label="Deadly Pursuit, 34-second work-in-progress excerpt"><source src="${media}excerpt.mp4" type="video/mp4"></video>
      <figcaption>Work-in-progress excerpt · 34 seconds · From the rough cut</figcaption></figure></div>
    <section class="house-section page-width"><div class="section-side"><p class="eyebrow">PRODUCTION</p><h2>Making the film.</h2></div><div class="house-rows"><article><p class="eyebrow">A PROFECT ORIGINAL FILM</p><h3>A two-camera shoot</h3><p>The production archive documents three shooting days, with A- and B-camera footage and separately recorded production sound.</p></article>
    <article><h3>Just under ₦10 million</h3><p>The approximate total production budget for <i>Deadly Pursuit</i>. For a breakdown of the production companies’ responsibilities, budget management or comparable work, please contact the team.</p></article></div></section>
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

export function generateHousePages({ studios, head, nav, foot, tail, save }) {
  const pages = [
    ['about/', 'About us — Everiart Creative House', 'Meet our Abuja creative house, its three studios, leadership and film collaborators.', about(studios), 'about'],
    [filmsPath.slice(1), 'Film production — ByEveriArt', 'Explore full-length film production, documentary credits and public viewing links from ByEveriArt in Abuja.', films(), 'experience'],
    [featurePath.slice(1), 'Deadly Pursuit — ByEveriArt', 'Inside the making of Deadly Pursuit, a feature-length crime thriller. Explore production photography, budget context and crew credits.', feature(), 'experience']
  ];
  for (const [path, title, description, body, active] of pages) {
    const meta = head(title, description).replace('</head>', '<link rel="stylesheet" href="/css/house.css"></head>');
    save(path + 'index.html', meta + `<body class="studio-page night">${nav(active)}<main id="main">${body}</main>${foot}${tail}`);
  }
}
