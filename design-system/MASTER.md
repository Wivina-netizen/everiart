# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---
> **PROJECT:** Everiart
> **Status:** Hand-authored. Locked. **Not** generator output.
> **Source of truth:** `css/tokens.css`

> ⚠️ **AUTHORITY RULE:** `css/tokens.css` is the single source of truth. This file
> mirrors it for skill consumption. If the two ever disagree, **`css/tokens.css` wins**
> and this file is the thing that is stale. Never edit one without the other.

> ⚠️ **DO NOT REGENERATE.** Running `search.py --design-system --persist` against this
> project will overwrite this file with a generic recommended palette and destroy the
> brand. This palette is not a suggestion to be re-derived — it is fixed. Use
> `search.py` for layout patterns, UX guidelines, and component reasoning only.

---

## Color — locked master palette

| Token | Hex | Name | Role |
|---|---|---|---|
| `--navy` | `#1C2541` | Midnight Navy | Dark anchor, primary surface |
| `--charcoal` | `#212121` | Deep Charcoal | Ink, body text on light |
| `--gunmetal` | `#3A506B` | Gunmetal | Accent, hover, rules |
| `--stone` | `#8E8E8E` | Stone Gray | Meta, secondary text |
| `--parchment` | `#F4F1DE` | Parchment | Warm light base |
| `--offwhite` | `#F8F8F8` | Soft Off-White | Cool light base |

Derived transparency layers for material surfaces: `--navy-a90`, `--navy-a60`,
`--offwhite-a70`, `--hairline`, `--hairline-dk`.

**Rules**
- Six colors. No sevenths. Do not introduce a new hue to solve a contrast or
  emphasis problem — solve it with weight, scale, or spacing instead.
- There is no saturated "CTA color." Emphasis comes from navy/parchment contrast
  and type weight. Reject any generated palette proposing an accent brand color.
- Warm base (`--parchment`) and cool base (`--offwhite`) are not interchangeable.
  Pick one per surface and hold it.

## Typography

- **Display / headings:** `--serif` — "Instrument Serif", Georgia, "Times New Roman", serif
- **Body / UI:** `--sans` — "Instrument Sans", system-ui, -apple-system, "Segoe UI", sans-serif
- Loaded via Google Fonts in `index.html`. Do not add a third family.

Scale is fluid (`clamp()`): `--fs-display`, `--fs-h1`, `--fs-h2`, `--fs-h3`,
`--fs-body`, `--fs-small`, `--fs-meta`.

**Tracking is size-specific** (apple-design §15) — large display carries negative
tracking, body sits at 0, small labels open up positive:
`--tr-display: -0.045em` → `--tr-h1: -0.03em` → `--tr-body: 0` → `--tr-meta: 0.06em`.

**Leading tightens as size grows:** `--lh-display: 0.90` → `--lh-h1: 1.02` →
`--lh-body: 1.6`.

Never set a raw `font-size`, `letter-spacing`, or `line-height`. Use the tokens.

## Layout

- `--gutter: clamp(1.25rem, 5vw, 5rem)`
- `--maxw: 84rem`
- `--measure: 68ch` — hard ceiling on line length, keep under 80 characters
- `--section-y: clamp(6rem, 14vh, 12rem)`

## Motion

Governed by **apple-design**. Springs live in `js/spring.js`; the CSS easing tokens
are the non-gesture, non-interruptible fallbacks only.

- Curves: `--ease-out-quart`, `--ease-in-out`
- Durations: `--t-fast: 120ms`, `--t-base: 240ms`, `--t-slow: 520ms`
- Spring constants: damping `1.0` critically damped for default UI; `0.8` for
  momentum/flick only. Response `0.36` UI / `0.34` momentum.

Anything gestural, interruptible, or physical is a spring — not a CSS transition.

## Accessibility

Honored signals already wired in `css/tokens.css`:
`prefers-reduced-transparency` (flattens the material layers to solid),
`prefers-contrast: more` (darkens `--stone`, strengthens hairlines).
Also honor `prefers-reduced-motion` in any new motion work.
