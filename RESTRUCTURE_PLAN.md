# Everiart website restructure

Prepared 3 October 2026. Repository reviewed: `Wivina-netizen/everiart`, default branch. This is an implementation plan based on source inspection, recovered brand guidance and the published homepage HTML. Rendered desktop/mobile interaction testing is still required; no claim of measured frame rate or visual QA is made. No production changes have been deployed.

## Direction

Build an editorial creative house with cinematic depth, clear hierarchy, warmth and personality. Preserve Instrument Serif and Instrument Sans, the current fonts the owner wants to keep. Use the White House reference as the owner's stated reference for authority, hierarchy and confidence. Avoid ornamental historicism, futuristic interface styling and animation that competes with the work.

Recovered sources: `EVERIART_FABLE5_MASTER_BRIEF.md` and `EVERIART_V2_FABLE5_MASTER_SPECIFICATION.md`; earlier brand-philosophy conversation retrieved separately. A complete document explicitly titled Brand Bible was not located. The recovered philosophy describes thoughtful creative problem-solving, intentionality, simplicity, craftsmanship and long-term trust. Earlier assistant wording is working material, not automatically an approved mission or vision.

The master brief makes documentary the emotional heart of the business while preserving film, identity and photography as a coherent ecosystem. The website should communicate that through the selected projects, editorial copy and real people shown in the imagery.

Working positioning: **Thoughtful creative solutions, expressed through film, identity and photography.** Keep the public wording concise and grounded in project evidence. Develop the final mission and vision from the recovered philosophy instead of manufacturing a new corporate story.

## Findings and corrections

| Source finding | Why it matters | Planned correction |
| --- | --- | --- |
| Home contains work, studios, process and contact, but little founder story or explicit philosophy | The craft is categorized, but the reason to choose Everiart is underdeveloped | Add a compact philosophy section and a substantive About page |
| Six published projects have `copyStatus: draft`; that status produces comments/warnings, not a publication block | Draft content is already public | Separate internal approval state from publish readiness; review factual statements before publishing new copy |
| Case studies largely contain a lede, generic facts, gallery, reel and next-project link | They do not deliver the challenge/process/results structure requested in the brief | Introduce an adaptable case-study template with real narrative and credits |
| `make_projects.mjs` assigns role through studio metadata | A person's contribution can differ between projects | Store actual roles and credits on each project |
| Azusa is assigned to photography while its description/media include a property film | Discipline classification can mislead visitors | Allow multiple disciplines and identify the lead studio separately |
| `.js` is set inline before the module loads, and `.js .reveal` hides content | A failed module/import can leave content permanently invisible | Arm visibility only when reveal initialization succeeds; provide an explicit fail-open path |
| `.pbody.reveal` contains `.pfig.reveal` | Parent/child opacity multiplies and movement adds, creating heavier entrances | Reveal individual media items once; keep gallery containers stationary |
| `heroSequence()` includes navigation and runs on every route | Inner-page navigation fades even where the page heading stays static | Keep navigation immediately available; scope hero choreography to Home |
| Home uses a seven-subject sequence; scroll items default to 26px travel, and gallery wrapper requests 48px | The hierarchy and rhythm vary; the gallery can move more than intended | Define a small shared vocabulary with restrained travel and capped delays |
| Case-study plate shrinks and fades; heading opacity reaches zero around 56% of hero scroll | Reading can compete with image choreography | Keep titles in normal flow, simplify hero behavior and verify readability during scroll |
| Navigation and footer markup are repeated across page files and generator helpers | Updates can drift between manually edited and generated pages | Generate every page from shared navigation/footer/metadata templates |
| All main surfaces are dark; many consecutive sections share the raised navy surface | Structure depends heavily on whitespace and heading changes | Preserve the dark direction while clarifying divisions with grids, rules, media scale and section rhythm |
| README describes obsolete media slots and direct editing of card titles despite JSON generation | Editing guidance conflicts with the actual source of truth | Rewrite documentation around the content schema and generator |
| `/assets/*` uses one-year immutable caching on replaceable filenames | Replacing a file at the same URL may leave returning visitors seeing older media | Fingerprint asset URLs, or use revalidation for mutable assets |
| Generated project pages omit the Open Graph metadata present on Home and Contact | Shared links lack a consistent project presentation | Generate canonical and social metadata, including approved preview imagery, for every page |

These are source findings, not proof of the cause of every perceived animation problem. Browser profiling must distinguish choreography problems from video decoding, network delay, layout shifts and actual rendering performance.

## Site structure

Main navigation: **Work · About · Services · Start a project**. Studio identities remain accessible through Services, project filters and the footer. Preserve working URLs or explicitly redirect changed paths.

| Page | Structure and purpose |
| --- | --- |
| Home | Cinematic identity; strongest selected work; philosophy; three disciplines; verified client evidence; concise process; enquiry |
| Work | A curated index with Film, Identity and Photography filters; project descriptions that explain the commission; clear multi-discipline labels |
| Individual projects | Title/client/discipline; leading film or image; brief; approach; selected media; deliverables; verified results where available; credits; related work; enquiry |
| About | Origin through experimentation; creative standpoint; mission/vision based on recovered guidance; founder story; documentary focus; actual operating model |
| Services | Explain what clients can commission and what each discipline contributes; connect services to relevant projects |
| Studio pages | ByEveriArt, EveriDesign and BeFrames each use the same shell and tailored work/content; avoid duplicating generic agency copy |
| Contact | Clear enquiry form, email/WhatsApp, location and confirmed response expectations; retain the working Netlify form integration |

`studio.everiart.com` is described in the recovered August brief as the dedicated video-production arm, used by clients. Its source and current behavior remain unverified. Audit that project before deciding whether to keep the subdomain, consolidate it or redirect it. Share typography, tokens and navigation conventions across both; preserve existing client journeys during migration.

## Homepage composition

1. **Hero:** retain the serif identity and cinematic plate. Add a readable positioning line that says what Everiart does. Primary action: Explore work. Secondary: Start a project. Essential text should not wait for video or a long entrance sequence.
2. **Selected work:** choose the strongest available projects by story and quality, rather than enforcing exactly two per studio. Give documentary a prominent position while showing breadth. Use genuine films, stills and design presentations.
3. **Philosophy:** a short statement about intention, experimentation and human storytelling, accompanied by a relevant image or detail from real work.
4. **Disciplines:** three coordinated presentations with distinct media and examples; link to tailored service/studio pages.
5. **Evidence:** approved client names, a small set of identifiable logos and attributed testimonials when available. A text list is acceptable if logos are unavailable. Do not invent numbers or impose an arbitrary minimum logo count.
6. **Process:** compress the existing five stages into an easy-to-read overview. Put detailed explanations on Services.
7. **Contact/footer:** a direct invitation, route to enquiries, consistent footer and verified social links.

## Color and typography

The current repository uses the palette below. Preserve it for the first design iteration because the recovered website briefs ask to retain the existing palette. Earlier black/orange guidance is a historical discrepancy to resolve, not permission to introduce an unrequested rebrand.

| Role | Color | Use |
| --- | --- | --- |
| Base | `#0D132D` | Main background |
| Raised surface | `#1C2541` | Deliberate grouped sections |
| Cinematic black | `#0B0B0C` | Hero and film surrounds |
| Parchment | `#F4F1DE` | Primary warm text |
| Off-white | `#F8F8F8` | Alternative high-contrast text |
| Gunmetal | `#3A506B` | Supporting details; verify contrast before using for controls |
| Stone | `#8E8E8E` | Secondary text only where contrast passes |
| Gold | `#B79B62` | Existing logo detail and restrained accent |

If a later iteration introduces parchment surfaces, use explicit light-theme tokens and test them across every template. Do not make that change by scattering local overrides.

Instrument Serif: display headlines and the identity. Instrument Sans: body copy, navigation, form fields and metadata. Keep two families. Define page-title, section-title, card-title, body, caption and label roles; control line lengths and wrapping at each breakpoint. Large display type should feel composed rather than simply oversized. Remove avoidable dependence on JavaScript for text sizing; retain font-aware measurement only where it produces a verified benefit.

## Motion system

Motion should suggest confidence and precision. Make the content easy to reach first.

| Interaction | Proposed behavior |
| --- | --- |
| Navigation | Immediately visible; stable while entering any route |
| Home entrance | One short coordinated reveal of supporting copy and identity; no separate performance for every decorative element |
| Section reveal | One reveal per content item; opacity plus at most 8–12px travel; roughly 300–450ms; grouped delay capped near 150ms |
| Project hover | Restrained image or label response; one consistent arrow; touch users see clear actionable labels |
| Case-study hero | Readable title and stable image composition; remove shrink/fade choreography from the first rebuild iteration |
| Video | Muted decorative previews where appropriate; explicit controls for actual films; visible still and clear play action when autoplay fails |
| Reduced motion | Content immediately visible; no parallax, stagger or movement required to reveal information |
| Route changes | Reliable native navigation first; add transitions only after the shared layouts and loading states are stable |

Keep the custom spring engine only where a gesture or interrupted interaction benefits from it. A spring is not inherently defective, and replacing it blindly is not a performance fix. Profile frame time and video playback before claiming an improvement. Avoid scroll hijacking and custom cursors that make navigation less usable.

## Content and media model

Continue with the static site and existing generator for the first iteration. A framework migration is unnecessary to correct the current problems.

Centralize `brand`, `navigation`, `homepage`, `studios`, `services`, `projects`, `clients`, `testimonials` and `contact`. The generator owns all output pages, not only portfolio pages. Shared templates own typography roles, layout, navigation, footer and metadata.

Project fields: title, slug, client, lead studio, disciplines, actual roles, summary, brief, approach, deliverables, optional verified outcomes, credits, hero, thumbnail, film, gallery, media captions/alt text, related projects, copy status and publication status. Do not force a year onto ongoing projects. Review existing dates instead of deleting potentially valid facts mechanically.

Keep raw masters separate from web derivatives. Generate responsive images with explicit dimensions and focal points; optimize clips in their actual aspect ratios. Avoid using direct Google Drive share links as production media URLs. Reuse the existing delivery setup where suitable after checking availability and ownership.

The repository already includes imagery and R2 video URLs. Asset presence does not establish that all media is final, approved or sufficient. Review each project before choosing what appears in the rebuild.

## Implementation order

1. **Baseline:** retain current production; create an isolated redesign branch; inventory main-site routes/assets and locate the studio project; capture desktop/mobile reference views.
2. **Foundation:** consolidate templates and content; correct fail-open reveals, nested gallery animation, navigation entrance and mutable asset caching; keep typography.
3. **Design prototype:** build Home plus one documentary case study and Contact. These establish the system before it spreads across the site.
4. **Content:** curate real work; review project facts/roles; write concise case studies; add genuine client evidence and brand story.
5. **Rollout:** apply the shared system to Work, About, Services and studio pages; resolve subdomain integration from its actual source.
6. **Verification and release:** inspect phone/tablet/desktop, keyboard, reduced motion, blocked media, failed script loading, link previews and navigation; verify the form configuration without sending an unsolicited enquiry; use a preview deployment before production replacement.

## Completion criteria

- Every page follows the same navigation, footer, typography, spacing, button and focus conventions.
- Content remains readable when animation or video fails.
- Projects show truthful, specific contributions and actual work.
- Desktop hover is optional; mobile and keyboard users can reach every function.
- No unexpected crop, horizontal overflow, delayed navigation or layout shift from missing media dimensions.
- Existing URLs and enquiries remain functional through release.
- Browser measurements determine performance claims; target Core Web Vitals of LCP ≤2.5s, INP ≤200ms and CLS ≤0.1 where measurable, then validate field performance after release.

The next tangible deliverable is a revised homepage and one project template in a local/preview environment. This plan itself does not claim that the redesign or production fixes are complete.
