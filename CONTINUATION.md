# Continuation — 3 October 2026

Review branch: `redesign/editorial-foundation` · PR: https://github.com/Wivina-netizen/everiart/pull/5

Fetched the review branch from GitHub at `3cf4d9d317bae570b55a2ee6c2a032945a85c5a4`.
This first refinement preserves the approved two-entry homepage, Instrument typography,
palette, studio identities, rounded media, glass controls and square Peaches composer.

## First QA fixes

- Removed Peaches' 480px minimum page height, which put the composer below a 375px-high
  viewport. The conversation scrolls independently and the composer retains its height.
- Added a navy focus border around the square composer. The textarea's existing
  `outline: none` had suppressed its own keyboard focus indicator.
- Increased the send button and conversation actions to at least 44px high.
- Added compact spacing for short windows and contained conversation overscroll.
- Disabled New conversation while a response is pending, matching its existing behavior.
  Starting again also resets the textarea height.
- Removed image hover scaling for reduced-motion and hoverless devices. Existing arrow
  motion remains bounded by the existing script and unchanged.

## Fresh validation

- `npm ci`: passed; no reported dependency vulnerabilities.
- `npm run build`: passed; regenerated pages have no content diff.
- `npm test`: all three existing backend policy tests passed.
- `node --check js/peaches.js`: passed.
- Inspected the hosted entrance, experience and Peaches pages in the in-app browser.
- Checked local Peaches at 1440×900, 812×375, 375×812 and 320×568.
  No horizontal overflow at those sizes; the composer remained inside the viewport.
- At 812×375, the page previously measured 480px high and the composer ended at 416px.
  After the fix, the page measures 375px and the composer ends at 327px.
- Verified composer focus styling, keyboard movement to Send, and the direct Contact link.
- Verified a local 503 response restores the visitor's message, displays an error,
  re-enables Send, and allows New conversation to reset the screen.

The local static preview does not run the Netlify AI function. The 503 test is a local
failure fixture, not a hosted service failure or a live AI evaluation. No contact form
was submitted. Physical phone keyboards, Safari, reduced-motion emulation and pointer
hover motion still need runtime checks; reduced-motion changes were reviewed in source.

## Next stages

Unify legacy Work, case studies and Contact with the approved experience. Expand copy
only from verified facts: the generator still flags all eight project records as draft
(six published, two withheld). Obtain the complete approved Brand Bible before expanding
Peaches' knowledge. Evaluate real AI briefs separately from this static preview.

These refinements use PR #5 as the review and Netlify deploy-preview path; production
has not been changed. The older README contains descriptions of the legacy homepage and
build process; use `package.json`, the generators and `PEACHES.md` for current behavior.

## Requested homepage and navigation refinement

- Moved the promise above the wordmark in a centered lockup; the trademark scales from
  22px to 34px. Both entrance links remain side by side, including at 320px wide.
- Renamed Experience Everiart to Studios in the entrance and navigation. The three
  shared navigation destinations are Studios, Ask Peaches and Contact us on all pages.
- Added a mobile hamburger and native dialog with a frosted glass surface, keyboard
  cycling, Escape/backdrop/close dismissal, and focus return. Navigation remains visible
  without JavaScript; the enhanced mobile menu activates only when its script runs.
- Strengthened the entrance buttons' glass, highlights, blur and border treatment.
- Added each studio's `/experience/<studio>/work/` and `/experience/<studio>/reels/`
  routes, linked from its studio page. The portfolio stays within that studio.
- Reels prefer existing `clips` in `projects.json`, otherwise use the project's `reel`.
  Add real portrait cuts to `clips` for full-height vertical media. The viewer preserves
  every source's framing, uses native playback/audio controls, and pauses off-screen
  media. There is no invented engagement data or autoplay audio.
- EveriDesign has no supplied video, so its Reels view points back to its portfolio.

Fresh checks: build and five tests pass; all local navigation links resolve across 20
generated pages. Entrance verified at 320×568, 375×812, 768×1024, 1440×900 and 812×375:
both buttons remain on the same row and within the initial viewport, without horizontal
overflow. Verified the glass menu and Contact navigation, film next/previous controls,
actual R2 clip playback, and the design studio's empty-reels-to-portfolio path.
Physical-device Safari and mobile keyboards still require separate QA.

Shared navigation lives in `navigation.mjs`, `css/navigation.css` and
`js/navigation.js`. `make_experience.mjs` refreshes only the marked shared navigation
block in Contact; its form remains in the original document. Portfolio generation lives
in `studio-portfolio.mjs`; browser playback coordination lives in `js/reels.js`.

### Button and tagline follow-up

Per the latest design feedback, entrance buttons are now 44px high on phones and
48px on desktop, in a narrower two-column group. All authored buttons share a pill
shape and glass finish, including menu, chat and legacy controls. This supersedes
the earlier square-button treatment; the Peaches composer itself remains square.
The tagline now scales from 23px to 54px with a tighter optical gap above the wordmark.
Build and whitespace checks pass. Checked desktop, portrait and landscape layouts,
including the 320px Peaches composer; no horizontal overflow was observed.

### Current finish: solid surfaces

The latest owner feedback removes glassmorphism entirely. Buttons retain the compact
rounded shape but now use opaque navy or parchment surfaces, simple borders and flat
hover colors. The mobile menu, project-card arrows, chat cards and legacy video surfaces
also drop backdrop blur and glossy highlights. This supersedes all glass styling above.
