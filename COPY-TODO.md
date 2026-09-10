# Copy still to be approved

Everything listed here is **draft**. It was written in EveriArt's voice from the
factual record only — the studio, category, year and discipline recorded in
`projects.json`, plus what is actually present for that project in
`media source/`. **No outcome, metric, result, quote or testimonial is asserted
anywhere on the site**, because none was known when this was written. Nothing
below has been seen, let alone approved, by a client.

## How the gate works

`projects.json` carries `copyStatus` per project. While it reads `"draft"`:

- `make_projects.mjs` stamps an HTML comment above the lede in that project's
  generated case study, so the draft is marked where it renders.
- Every build prints a warning listing each project still on draft copy.

Flip a project to `"approved"` once the wording is signed off, then re-run
`node make_projects.mjs`. When the last one flips, the warning disappears on its
own.

## What each draft is based on

| Project | Status | Written from |
| --- | --- | --- |
| `hope-for-her` | draft | Foundation name; the three source films — a World Mental Health Day piece, the Pad A Girl campaign video, and the spoken-word film used as the reel. |
| `regalia-pop-up-events` | draft | Source filenames show dated editions (Apr 13, Apr 26) and two jingle ads alongside the event film. |
| `maitro-tech` | draft | Discipline recorded as "Identity system"; sources are concept boards (`Maitro Concept 1`), not a logo pack. |
| `bmt-apparels` | draft | Branding artboards on a deep green ground; a black-and-gold direction exists in source and is deliberately excluded (see `make_media.mjs`). That it was set aside is recorded; **why** is not — so the copy does not say. |
| `agra` | draft | BeFrames stills for the event, plus a square-format film of the same event under ByEveriArt. |
| `azusa` | draft | Source has both HD (16:9) and square cuts of the same walk-through; gallery stills are frames pulled from the HD cut. |
| `hawthorn-real-estate` | **draft, thinnest** | Studio, category and discipline only. There is **no media at all** for this project — see below. Not reachable while `published:false`. |
| `grosource` | **draft, thinnest** | Studio, category and discipline only. There is **no media at all** for this project — see below. Not reachable while `published:false`. |

The last two are the ones to rewrite from scratch rather than edit. They are
near-contentless by necessity — there was nothing to write from.

## Not copy, but needs a decision: the client list

`index.html`, "Selected clients". The eight `Client One … Client Eight` slugs
that shipped there are placeholder vocabulary sitting in the same list as real
named work, which the pattern library rules out. They have been replaced with
names taken **only** from folders in `media source/` — i.e. work EveriArt
demonstrably holds footage for.

**These names have not been cleared for publication.** Being able to prove the
work happened is not the same as having permission to say so publicly, and some
of these are institutional clients where that distinction matters. Cut any that
should not be listed before this merges. See the comment above that block in
`index.html` for the per-name provenance.

## Blocked on media, not on copy

`hawthorn-real-estate` and `grosource` cannot be published at all: there is no
media for either anywhere in `media source/`. Both are still pointed at
generated placeholders from `make_placeholders.py` and remain `published:false`.
`bmt-apparels` is still missing gallery images 04–09 — the six moodboard pages
were deleted from source on 2026-09-06 and have not come back.
