---
name: everiart-design-patterns
description: >
  EveriArt's shipped UI and motion patterns — brand tokens, spring-based
  motion, and established interactions. Use BEFORE any external inspiration
  source when building or extending UI for EveriArt, byEveriArt, EveriDesign,
  or BeFrames.
---

# EveriArt Design Pattern Library

This is the house style, captured from what's actually shipped — not
aspiration, not inspiration. When in doubt, check here first.

If a pattern for the current need already exists below, extend it — don't
invent a parallel solution or import an external one. This is EveriArt's
visual and interaction fingerprint; protecting it from drifting toward
generic or borrowed patterns is the entire purpose of this file.

---

## Brand constant

Identity layer: Authority Navy #0D132D · Champagne Gold #B79B62 (accent
only, never a fill) · Warm Off-White #F5F5F0
Supporting neutrals: Midnight Navy #1C2541 · Deep Charcoal #212121 ·
Gunmetal #3A506B · Stone Gray #8E8E8E · Parchment #F4F1DE
Type: Instrument Serif (display, negative tracking as size increases) ·
Instrument Sans (body/UI, near-zero tracking, opens up slightly at small
sizes)

**The site has no light surface anywhere.** Authority Navy is the ground on
`<body>`; a section declares a background only when it means to sit a step
*above* it, which is what Midnight Navy is for. The two read as base vs.
raised, not dark vs. light. Cinematic black #0B0B0C is reserved for
photographic plates — the home hero and a case-study hero — because navy
behind a plate tints its warm highlights cold.

So Parchment and Off-White are **ink**, never backgrounds, and Deep
Charcoal is effectively retired as a text colour. Two consequences that
bite: Gunmetal fails as a focus ring here (2.2:1 on Authority Navy, under
the 3:1 floor — rings are Parchment), and any promoted button has to be a
light fill, because a navy fill on a navy ground is an invisible action.
Check contrast against the navy you are actually on: Stone Gray is 5.6:1 on
Authority Navy but only 4.6:1 on Midnight Navy.

---

## Motion system — the spring engine, not CSS transitions

All motion runs on a hand-written spring integrator (critically damped,
`damping: 1.0`, no overshoot — nothing here is momentum-driven unless a
gesture explicitly preceded it). Every spring animates from its CURRENT
value and velocity, never resets to a start state — so re-targeting
mid-flight never jumps.

Documented response values in use: **0.34s / 0.36s / 0.5s**. Reuse one of
these for any new motion rather than inventing a new timing value —
consistency across the site matters more than a "more correct" custom
number.

**Compositor layer discipline:** any element using `will-change` or GPU
compositing must be armed on `IntersectionObserver` enter and disarmed on
exit — never a standing/permanent layer. This was a real performance bug
caught and fixed once already; don't reintroduce it.

**Reduced motion:** always resolve to a real, complete final state — never
a blank or broken one. Silent stills are acceptable where a video would
have played; parallax and decorative motion simply disable.

---

## Established interaction patterns

**Magnetic cursor-following arrow** (project card hover)
A circle-outline arrow (single diagonal stroke, ~45°) that appears at the
cursor's entry position within a card, follows the cursor with spring lag
(not 1:1 tracking), clamped to the card's bounds, and springs back out
from wherever it last was on exit — never resets to center first. Position
is two springs, X and Y, never one over the 2D distance. Same
`arrowAffordance()` logic reused for both grid tiles and the next-project
handover — one shared implementation, not one per context. Following is
opt-in per call site: the next-project arrow is composed to sit over the
word and deliberately stays put.

**Exactly one arrow is visible on the page at any moment.** Adjacent tiles
own separate arrows, so a pointer crossing between them fires leave-then-
enter and will cross-fade two arrows past each other unless something stops
it. A page-level registry makes the crossing a handover: the incoming arrow
inherits the outgoing one's live opacity *and velocity*, and the outgoing
one is dropped in the same frame. That is also what keeps the gutter between
tiles from reading as a dead zone — the incoming arrow resumes from where
the outgoing one got to rather than from zero.

Stroke colour adapts per image from measured luminance, against a 4.5:1
floor. It is measured once per tile at image load, never per hover — which
is why it is already correct on a tile-to-tile handover, where there is no
time to measure anything.

Activated without a pointer (keyboard focus, or the in-view fallback on
touch), the arrow centres rather than reappearing wherever a previous hover
abandoned it.

**Hover-to-play video tiles**
Default state: static thumbnail. On hover (desktop) / in-view (touch):
cross-fade to muted, looped video with zero native chrome — no visible
play button, scrubber, or timeline. Pause and reset to first frame on
exit. Applies only where a project actually has video — static-only
projects (e.g. identity/branding work) simply keep their thumbnail; this
is expected, not a gap to fill.

**Fullscreen preview overlay**
One shared overlay element (not one instance per tile). Custom play/pause
control only — no native `<video controls>`, since Chrome's default set
carries a download option in its overflow menu. `controlsList="nodownload"`,
`disablePictureInPicture`, and a suppressed context menu as a deterrent,
never claimed as true download prevention. Spring-driven open/close,
interruptible, focus trapped and restored, dismiss via X/backdrop/Escape.

**Asymmetric grid pairing** — the only project grid
Project grids avoid uniform identical cards. Pair a smaller image beside a
larger one, alternating which side is larger down the page, full-bleed,
no card chrome (no border/shadow/rounded frame — the image is the tile).
Each studio's tile treatment reflects its own discipline rather than
sharing one generic template (film = motion-led, identity = systems-led,
photography = image-led).

This is the pattern on **both** project surfaces. The home page and `/work`
run through the same tile and row builders over the same pairing rules, and
differ only in how much of the catalogue they show: home is a capped teaser
(2 per studio, then "See all work"), `/work` is every published project.
A change to the tile is a change to both — don't fork them.

Pairs are studio-pure, which is what makes the discipline filter safe: it
hides a whole row, so a filtered discipline can never orphan half of an
asymmetric pair. A studio with an odd count closes on a solo full-width
tile rather than borrowing a partner from the next studio. Nothing is sized
to the current project count.

**Ambient tile motion**
Every tile's image carries a slow, continuous Ken Burns drift — always
running, never gated on hover or any pointer state. The cursor-following
arrow is the only hover-exclusive behaviour a tile has. Phase, duration and
direction are derived per tile from its slug, so tiles are never in
lockstep (lockstep reads as one moving background instead of separate
images). The still and the hover reel share one animated element so they
stay framed identically through the cross-fade.

The sweep is 30–42s (~0.013 Hz), an order of magnitude clear of the ~0.2 Hz
slow-oscillation band that causes trouble; the pan never exceeds what the
baseline scale already hides. It is paused in CSS and armed by observer —
continuous motion is exactly where a standing compositor layer creeps back.

Note this is the one piece of motion on the site with no functional
justification — it is atmosphere, not feedback, state or continuity. It is a
deliberate exception, not licence for more; new decorative motion still has
to argue for itself.

**Case-study scroll sequence** (`/work/<slug>/`)
Title cross-fades in over the plate on the fastest documented response, both
lines as one box so there is nothing to stagger. The plate then shrinks away
scroll-linked — mapped directly from scroll position, never sprung, because
a spring puts lag between the scrollbar and the image. Springs are for the
discrete transitions on either side of it; scroll-linked motion is 1:1.
Parallax stays on the plate; the type fades but is never translated. The
sections below fade up from the bottom edge on the standard reveal.

**Video on a case study**
Where a project has footage, the reel gets its own section between the brief
and the gallery — motion first, then stills. Plays while it holds the
viewport on the armed/disarmed observer. Projects without footage don't get
an empty section; they simply don't get the section, the same rule the tiles
follow.

Reel aspect ratios are **not** uniform (currently 1/1, 4/3 and 16/9 — the
encoder preserves each source's shape). The ratio is recorded per project
and drives the frame, which also reserves the box before the video loads.
Never assume a house ratio for footage.

**Retired: the `/work` lookbook.** One project per near-full-viewport
section in sequence, with a position counter and rail, shipped and was then
replaced by the asymmetric grid above. Its position indicator existed only
because a sequence gives you no way to see where you are — a grid doesn't
have that problem, so don't reintroduce one. Kept here so the pattern isn't
proposed again as if it were new.

**Numbering discipline**
Only number things that are a literal sequence (e.g. a process/steps
section). Sections like "Selected Work" or "Studios" are not steps — don't
apply "[01] [02] [03]" styling to non-sequential content. This was
identified and removed once already as a templated tell.

---

## Content/copy discipline

- Placeholder content is clearly placeholder — never fabricate real
  client names, testimonials, or case-study narratives.
- Real client names get used as soon as they're confirmed; placeholder
  vocabulary (e.g. generic project labels) never sits alongside real
  named work in the same list.
- Trademark symbols (®) are a legal claim, not a style choice — only used
  where registration is actually confirmed; ™ otherwise.

---

## When this skill doesn't have an answer

If a genuinely new UI problem doesn't map to anything above, that's the
signal to design something new — deliberately, checked against
ui-ux-pro-max for broader pattern grounding, but the result
gets added back to THIS file afterward so it becomes precedent rather than
a one-off. This file should keep growing from EveriArt's own work, not
from what other products do.
