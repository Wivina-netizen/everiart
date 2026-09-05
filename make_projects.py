#!/usr/bin/env python3
"""Generate /work/ and the fifteen /work/<slug>/ case-study pages.

Dev utility, in the spirit of make_placeholders.py — the generated HTML is
committed and hand-editable. Re-run only when the PROJECTS table changes;
editing a generated page directly is fine until then.

Route shape is /work/<slug>/ (directory index), matching the existing
/contact/ so every page resolves on a plain static host without relying on
extensionless-URL rewriting.
"""
import os
import re

ROOT = os.path.dirname(os.path.abspath(__file__))

# NOTE: eight of these titles are real — six supplied directly, plus Hawthorn
# Real Estate and GroSource which already existed in this repo. The remaining
# seven keep the repo's own placeholder vocabulary rather than inventing client
# names, and are waiting on the real ones.
STUDIOS = {
    "byeveriart":  ("ByEveriArt",  "Film",
                    "Direction, Cinematography, Edit", "Director of photography"),
    "beframes":    ("BeFrames",    "Photography",
                    "Photography, Retouching",         "Photographer"),
    "everidesign": ("EveriDesign", "Identity",
                    "Identity system, Guidelines",     "Creative direction"),
}

PROJECTS = [
    # slug,                    title,                  studio,        year, hero
    ("hope-for-her",           "Hope For Her",         "byeveriart",  2026, "work-film-01.jpg"),
    ("regalia-pop-up-events",  "Regalia Pop-up Events","byeveriart",  2026, "work-film-02.jpg"),
    ("film-three",             "Film Three",           "byeveriart",  2025, "work-film-03.jpg"),
    ("film-four",              "Film Four",            "byeveriart",  2025, "work-film-04.jpg"),
    ("film-five",              "Film Five",            "byeveriart",  2025, "work-film-05.jpg"),
    ("agra",                   "AGRA",                 "beframes",    2026, "work-photo-01.jpg"),
    ("azusa",                  "Azusa",                "beframes",    2025, "work-photo-02.jpg"),
    ("series-three",           "Series Three",         "beframes",    2025, "work-photo-03.jpg"),
    ("series-four",            "Series Four",          "beframes",    2025, "work-photo-04.jpg"),
    ("series-five",            "Series Five",          "beframes",    2024, "work-photo-05.jpg"),
    ("bmt-apparels",           "BMT Apparels",         "everidesign", 2024, "work-identity-04.jpg"),
    ("maitro-tech",            "Maitro Tech",          "everidesign", 2025, "work-identity-03.jpg"),
    ("hawthorn-real-estate",   "Hawthorn Real Estate", "everidesign", 2025, "work-identity-01.jpg"),
    ("grosource",              "GroSource",            "everidesign", 2025, "work-identity-02.jpg"),
    ("identity-five",          "Identity Five",        "everidesign", 2024, "work-identity-05.jpg"),
]

LEDE = ("Placeholder copy. This is where the brief, the constraint and the "
        "decision that shaped the work get written — what the client needed, "
        "what we found when we looked, and why the work took the form it did.")

ARROW_SVG = """<svg viewBox="0 0 48 48" fill="none" focusable="false">
              <circle cx="24" cy="24" r="23.25" stroke="currentColor" stroke-width="1.5"/>
              <path d="M17.5 30.5 30.5 17.5M20 17.5h10.5V28" stroke="currentColor"
                    stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>"""


def head(title, desc, theme="#F8F8F8"):
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="{theme}">

<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/favicon.svg">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">

<link rel="stylesheet" href="/css/tokens.css">
<link rel="stylesheet" href="/css/base.css">
<link rel="stylesheet" href="/css/site.css">
</head>
<body>

<a class="sr-only" href="#main">Skip to content</a>
"""


def nav(current=None):
    def mark(href, label, key):
        cur = ' aria-current="page"' if key == current else ''
        return f'    <a class="nav__link" href="{href}"{cur}>{label}</a>'
    return f"""
<nav class="nav" aria-label="Primary">
  <a class="nav__mark" href="/" aria-label="Everiart — home">
    <span class="nav__ring" aria-hidden="true"></span>
    <span class="nav__word">Everiart<span class="nav__dot">.</span></span>
  </a>

  <div class="nav__links">
{mark("/#work", "Work", "work")}
{mark("/#studios", "Studios", "studios")}
{mark("/#process", "Process", "process")}
{mark("/contact/", "Contact", "contact")}
  </div>
</nav>
"""


FOOT = """
  <div class="wrap">
    <div class="foot">
      <span>&copy; 2026 EveriArt. All rights reserved.</span>
      <span>ByEveriArt &middot; EveriDesign &middot; BeFrames</span>
    </div>
  </div>
"""

TAIL = """
<script type="module" src="/js/main.js"></script>
</body>
</html>
"""


def tile(p, size, delay):
    slug, title, studio, _year, hero = p
    label, discipline, _d, _r = STUDIOS[studio]
    return f"""        <a class="tile tile--{size} reveal" href="/work/{slug}/" data-delay="{delay}">
          <span class="tile__frame">
            <img src="/assets/{hero}" alt="{title} — {discipline.lower()} project" loading="lazy" decoding="async">
            <span class="tile__arrow" aria-hidden="true">
              {ARROW_SVG}
            </span>
          </span>
          <h3 class="tile__title">{title}</h3>
          <p class="tile__studio">{label}</p>
        </a>"""


def build_index():
    """/work/ — every case study, same asymmetric pairing as the home page."""
    rows, i = [], 0
    flip = False
    while i + 1 < len(PROJECTS):
        a, b = PROJECTS[i], PROJECTS[i + 1]
        sizes = ("lg", "sm") if flip else ("sm", "lg")
        cls = "pair pair--flip" if flip else "pair"
        rows.append(f"""      <div class="{cls}">
{tile(a, sizes[0], 0)}
{tile(b, sizes[1], 80)}
      </div>""")
        i += 2
        flip = not flip
    # 15 is odd — the last one closes the page full width rather than sitting
    # in a column sized for a partner that does not exist.
    if i < len(PROJECTS):
        rows.append(f"""      <div class="pair pair--solo">
{tile(PROJECTS[i], "lg", 0)}
      </div>""")

    html = (head("Work — EveriArt", "Fifteen projects across three studios.")
            + nav("work") + f"""
<main id="main" class="page">
  <div class="wrap">

    <header class="page__head">
      <h1 class="page__title">Work</h1>
      <p class="page__lede">
        Fifteen projects across three studios — film, photography and identity.
      </p>
    </header>

    <div class="work">
""" + "\n\n".join(rows) + """
    </div>
  </div>
""" + FOOT + """</main>
""" + TAIL)
    out = os.path.join(ROOT, "work", "index.html")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    open(out, "w", encoding="utf-8").write(html)
    return out


def build_project(idx):
    slug, title, studio, year, hero = PROJECTS[idx]
    label, discipline, deliverables, role = STUDIOS[studio]
    # Sequence wraps, so the last project leads back to the first.
    nslug, ntitle, nstudio, _ny, _nh = PROJECTS[(idx + 1) % len(PROJECTS)]
    nlabel = STUDIOS[nstudio][0]

    body_imgs = ["studio-film.jpg", "studio-photo.jpg"]

    html = (head(f"{title} — EveriArt", f"{title}: {discipline.lower()} for {label}.", "#0B0B0C")
            + nav() + f"""
<main id="main" class="project">

  <!-- Full-bleed plate with the title over it, per the reference. The scrim
       is what keeps the overlay legible on any image. -->
  <header class="phero">
    <img class="phero__img" src="/assets/{hero}" alt="" fetchpriority="high" decoding="async">
    <div class="phero__scrim" aria-hidden="true"></div>
    <div class="wrap phero__inner">
      <p class="phero__label">{label} &middot; {discipline}</p>
      <h1 class="phero__title">{title}</h1>
    </div>
  </header>

  <section class="section">
    <div class="wrap pmeta">
      <p class="pmeta__lede">{LEDE}</p>
      <dl class="pmeta__facts">
        <div class="pmeta__row"><dt>Client</dt><dd>{title}</dd></div>
        <div class="pmeta__row"><dt>Year</dt><dd>{year}</dd></div>
        <div class="pmeta__row"><dt>Deliverables</dt><dd>{deliverables}</dd></div>
        <div class="pmeta__row"><dt>Role</dt><dd>{role}</dd></div>
      </dl>
    </div>
  </section>

  <section class="pbody">
    <div class="wrap">
""" + "\n".join(
        f"""      <figure class="pfig reveal">
        <img src="/assets/{im}" alt="{title} — placeholder still" loading="lazy" decoding="async">
      </figure>""" for im in body_imgs) + f"""
    </div>
  </section>

  <a class="next" href="/work/{nslug}/">
    <span class="next__inner">
      <span class="next__word">Next project</span>
      <span class="next__arrow" aria-hidden="true">
        {ARROW_SVG}
      </span>
    </span>
    <span class="next__meta">{ntitle} &middot; {nlabel}</span>
  </a>
""" + FOOT + """</main>
""" + TAIL)

    out = os.path.join(ROOT, "work", slug, "index.html")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    open(out, "w", encoding="utf-8").write(html)
    return out


def patch_home():
    """Point the six home-page tiles at their case studies."""
    path = os.path.join(ROOT, "index.html")
    src = open(path, encoding="utf-8").read()
    by_title = {t: s for s, t, _st, _y, _h in PROJECTS}
    n = 0
    for title, slug in by_title.items():
        pat = re.compile(
            r'(<a class="tile tile--\w+ reveal" href=")#(" data-delay="\d+">'
            r'(?:(?!</a>).)*?<h3 class="tile__title">' + re.escape(title) + r'</h3>)',
            re.S)
        src, k = pat.subn(lambda m: m.group(1) + f"/work/{slug}/" + m.group(2), src)
        n += k
    open(path, "w", encoding="utf-8").write(src)
    return n


if __name__ == "__main__":
    print("wrote", build_index())
    for i in range(len(PROJECTS)):
        build_project(i)
    print(f"wrote {len(PROJECTS)} project pages under work/")
    print(f"patched {patch_home()} home-page tile links")
