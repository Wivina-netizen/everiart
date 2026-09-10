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


**One cascade rhythm: `--stagger-step`, 60ms.** Nothing on this site reveals
as a block. Everything that arrives together arrives in document order, one
step apart — the hero's load sequence and every scroll reveal read the same
token, so the two cannot drift.

The value is derived from the response it staggers rather than picked: at
response 0.5 a critically damped spring is ~90% in by 300ms, and six
subjects at 60ms span exactly that, so the last starts as the first arrives.
Halve it and a group reads as simultaneous; double it and a six-tile row
takes most of a second. The tail is capped at six steps, so a tall viewport
cannot strand the last element.

Grouping is **per animation frame, not per observer callback**.
IntersectionObserver does not deliver simultaneous crossings in a single
callback — on a six-tile grid it delivers six callbacks of one entry each —
so indexing per callback silently staggers nothing at all. Queue the
crossings and flush on the next frame.

Under reduced motion there is no cascade: a stagger is motion, and that path
owes the reader the final state.
**Compositor layer discipline:** any element using `will-change` or GPU
compositing must be armed on `IntersectionObserver` enter and disarmed on
exit — never a standing/permanent layer. This was a real performance bug
caught and fixed once already; don't reintroduce it.

**Reduced motion:** always resolve to a real, complete final state — never
a blank or broken one. Silent stills are acceptable where a video would
have played; parallax and decorative motion simply disable.

---

## Established interaction patterns

**Hero load sequence**
One ordered list of subjects — nav, positioning line, CTA, the two wordmark
segments, the TM, the scroll cue — each fading up behind the last at
`--stagger-step`, on the 0.5 reveal response. Not four different motions at
four hand-written delays, which is what shipped first and read as separate
events rather than one entrance.

The wordmark **fades without travelling**. Display type on this site fades
and is never translated; the case-study title already set that rule, and a
clip-mask rise on the hero was the only thing breaking it.

**No play control anywhere.** The hero plate's playback is owned entirely by
its own IntersectionObserver — in view it runs, out of view it stops
decoding. Where a browser refuses muted autoplay, the next scroll,
pointerdown or keypress retries it once, passively: a scroll is the gesture
the hero is already asking for, so nothing has to be pressed. Data Saver and
reduced motion both keep the still, with nothing offered.

**The wordmark is seated by its ink, not its box.** It is bottom- and
left-aligned on `--gutter` — the same token that sets the content column
everywhere else, so both insets come from the site's one spacing primitive.
But an inset is only worth the edge it is measured to, and a large serif's
layout box is not its letterforms: the E carries a left side bearing, and
there is leading below the baseline. Both are measured off the font's own
metrics at the rendered size and subtracted in CSS, so the stem lands on the
same column as the copy above it and the baseline lands exactly `--gutter`
above the hero's bottom edge. Never pick a bleed by eye — an earlier
`-0.16em` did, and it cut the baseline off the viewport.

**Cursor-following arrow** (project card hover)
A circle-outline arrow (single diagonal stroke, ~45°) with a deliberately
narrow contract:

> invisible by default; visible only while the cursor is inside **that one
> card**; following the cursor with spring lag (not 1:1) while it is; and
> **gone the instant the cursor leaves**.

It appears at the cursor's entry position within the card, is clamped to the
card's bounds, and follows via two springs, X and Y, never one over the 2D
distance. Same `arrowAffordance()` for both grid tiles and the next-project
handover — one shared implementation. Following is opt-in per call site: the
next-project arrow is composed to sit over the word and deliberately stays
put.

**The exit is a cut, not a fade, and that is load-bearing.** A sprung exit
shipped first, and with it a page-level registry that handed the outgoing
arrow's live opacity and velocity to the incoming one when the cursor
crossed between adjacent tiles — built so the gutter between tiles would not
read as a dead zone. What it actually produced was an arrow that appeared to
travel between cards rather than belonging to the one under the cursor.
Cutting the exit removed the registry's entire reason to exist, and "exactly
one arrow on the page" now falls out of the contract instead of being
enforced by shared state. Don't reintroduce either.

There is **no touch fallback**. An in-view fallback used to light the arrow
on every tile as you scrolled a phone; there is no cursor there, so there is
nothing for the arrow to be about. Keyboard focus is the one deliberate
exception — it centres the arrow, because a keyboard user has no pointer and
would otherwise get no affordance at all.

Stroke colour adapts per image from measured luminance, against a 4.5:1
floor. It is measured once per tile at image load, never per hover.

**Retired: hover-to-play video tiles.** Tiles cross-faded to a muted loop on
hover, played in-view on touch, and opened a fullscreen preview on click.
All of it shipped, and all of it has been removed — on the home grid and on
`/work` alike, since both run through the same tile builder.

A tile is a **still and a link**. Nothing on either grid plays video, on any
input. The footage belongs on the project's own page, where there is room to
watch it, and where clicking a tile again does the one thing a tile should
do: go to the case study.

**Fullscreen overlay** — reached only from a case-study reel
One shared overlay element, opened by the reel's expand control. It used to
be opened by clicking a grid tile, which also meant intercepting the tile's
own link; both are gone. Custom controls only, never native `<video
controls>`, since Chrome's default set carries a download item in its
overflow menu: play/pause, and a **mute control that exists here and nowhere
else**. It opens muted and lets the reader turn sound on, rather than
starting audio at them as the panel springs open.

`controlsList="nodownload"`, `disablePictureInPicture`, and a suppressed
context menu as a deterrent, never claimed as true download prevention.
Spring-driven open/close, interruptible, focus trapped and restored, dismiss
via X/backdrop/Escape. The "view full case study" link is hidden when the
reader is already on that page.

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

**Retired: ambient tile motion.** Every tile's image carried a slow,
continuous Ken Burns drift, phase-derived per slug so no two were in step,
armed and disarmed by observer. It shipped and has been removed. It lived
inside the same wrapper the hover reel did — one animated element, so the
still and the reel stayed framed identically through the cross-fade — and
when the reel went, its reason went with it. It was also the one piece of
motion on the site with no functional justification, which is precisely why
it was the first thing cut. Kept here so it isn't proposed again as new.

A tile now has **one** hover behaviour: the cursor-following arrow. Nothing
else on a tile moves.

**Case-study scroll sequence** (`/work/<slug>/`)
Title cross-fades in over the plate on the fastest documented response, both
lines as one box so there is nothing to stagger. The plate then shrinks away
scroll-linked — mapped directly from scroll position, never sprung, because
a spring puts lag between the scrollbar and the image. Springs are for the
discrete transitions on either side of it; scroll-linked motion is 1:1.
Parallax stays on the plate; the type fades but is never translated. The
sections below fade up from the bottom edge on the standard reveal.

**Video on a case study** — the only place video appears
Where a project has footage, the reel sits **inside the body, after the first
two stills**, so the page reads still, still, motion, then the rest of the
stills. It is not a section of its own and it does not sit above the
gallery; both of those shipped and were replaced. Projects without footage
don't get an empty slot — they simply don't get one, the same rule the tiles
follow.

Inline, it reads as one more image until it is touched: muted, looped,
autoplaying on the armed/disarmed observer while it holds the viewport,
cross-faded up from the thumbnail, and carrying **no player chrome at all** —
no scrubber, no timeline, no play button, no Picture-in-Picture. Muted is
not a preference: a browser refuses an unmuted autoplay, and there is no
inline control to recover with.

The one interaction is **expand to fullscreen**. Its control is built in JS
rather than markup — without JS there is no video to expand, and a dead
button is worse than none — and it stays invisible until the frame is
hovered or the control itself takes focus, so the resting state really is
just an image. On touch, with no hover to reveal it, it simply stands. Sound
lives only in the overlay, which is the first point at which unmuting is
possible and which is reached deliberately.


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
