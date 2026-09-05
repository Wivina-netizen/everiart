# Everiart

Static site. Plain HTML/CSS/JS, no build step. Deployed on Netlify (`netlify.toml`).

```
index.html
css/tokens.css   ← design tokens: SINGLE SOURCE OF TRUTH for the brand
css/base.css
css/site.css
js/
assets/
```

## Brand authority

`css/tokens.css` is the source of truth for every color, type, layout, and motion
value. `design-system/MASTER.md` mirrors it in prose for skills to read.

- Never hardcode a hex, font stack, size, tracking, leading, or duration. Use the
  CSS custom properties.
- The palette is **six locked colors** (navy, charcoal, gunmetal, stone, parchment,
  offwhite) and **two locked families** (Instrument Serif display / Instrument Sans
  body). Do not add a seventh color or a third family. Solve emphasis with weight,
  scale, and spacing.
- There is deliberately no saturated CTA color. Reject any tool or skill output
  that proposes one.
- Editing `css/tokens.css` means editing `design-system/MASTER.md` in the same
  commit, and vice versa.

## Design skill routing

Four design skills are active and their scopes do not overlap. Use the narrowest
one that fits:

| Skill | Owns | Do not use it for |
|---|---|---|
| **apple-design** | Motion, springs, gestures, drag/swipe/sheet, interruptible transitions, materials and depth, typographic optics (tracking/leading/optical sizing), reduced-motion | Static layout, color choice |
| **frontend-design** | Building and reviewing the actual responsive UI — components, pages, layout, states, accessibility | Motion physics, brand decisions |
| **ui-ux-pro-max** | Reasoning support only: layout patterns, UX guidelines, component specs, chart selection, stack conventions | **Color and font selection — the brand is already fixed** |
| **everiart-agency** | Client-facing work: proposals, pitches, scoping, brand strategy, campaign and content planning | Writing site code |

**`ui-ux-pro-max` constraint.** Query it for patterns and reasoning. Never run
`search.py --design-system --persist` against this project — it overwrites
`design-system/MASTER.md` with a generated generic palette and destroys the brand.
Its palette, font-pairing, and style-match outputs are **advisory only** and are
overridden by `css/tokens.css` without exception.

```bash
# safe — pattern and guideline lookup
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<query>"

# NOT safe here — regenerates and clobbers the locked brand
# python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<q>" --design-system --persist
```

When a request is ambiguous between site code and client deliverable, ask — the
same words mean different work in each.

## Conventions

- No framework, no bundler. Keep it that way unless explicitly asked.
- Motion: gestural and interruptible → spring (`js/spring.js`). Everything else →
  CSS transition using the duration and easing tokens.
- Honor `prefers-reduced-motion`, `prefers-reduced-transparency`, and
  `prefers-contrast: more`. The latter two are already wired in `css/tokens.css`.
- Keep line length under `--measure` (68ch).
