# Everiart refinement and readiness

## Current requested changes

- [x] Remove the landing-page pause-motion control. Per the owner's latest request, the background loops at 65% speed with 1.2-second fades; reduced-motion and data-saving preferences retain the poster.
- [x] Remove homepage CTA arrows, center labels and keep both buttons side by side.
- [x] Center the hero tagline, enlarged responsive wordmark and CTA group independently of the trademark. Preserve navigation and footer alignment.
- [x] Use an outlined mobile Menu control.
- [x] Add one-time staggered marketing reveals with reduced-motion support; keep chat input immediate.
- [x] Remove unexplained Portfolio/Reels counts; retain project names and disciplines.
- [x] Expand Peaches input as text grows, then scroll within it when needed to preserve the conversation and Send button.
- [x] Open a contextual email draft to hello@everiart.com; visitors review and send in their email app. Long context is explicitly excerpted.
- [x] Complete responsive browser checks: small phone, tablet, desktop, landscape, Menu/Escape, long input, local failure recovery and draft reset. Nine automated tests and the 20-page route check pass.

## Waiting for owner references and approved material

- [x] Received screenshots of the Instagram player; a separate reel layout pass is still pending.
- [x] Received security/readiness and search-visibility screenshots.
- [x] Owner confirmed the current media is cleared and supplied the public business name/address.
- [ ] Actual project media, titles, studio, factual brief, contribution and approved outcomes.
- [ ] Peaches knowledge: what Everiart does, why each approach is chosen, when to recommend each studio, and examples of creative direction in the house voice.
- [ ] Peaches authority: what it can recommend independently, what requires clarification and what must go to the team.

## Separate readiness verification

These remain open; the current UI update is not a security certification or a completed AI training exercise.

- [x] Review repository access, dependencies, common secret patterns, endpoint validation and rate-limit configuration. Hosting-account roles/MFA and end-to-end rate enforcement remain to verify.
- [ ] Confirm real contact delivery, AI service availability, retention policy and privacy copy.
- [ ] Expand the approved server-side knowledge pack and instructions; do not put confidential business rules in the public repository.
- [ ] Evaluate real briefs, creative leadership, unknown facts, prompt injection, pricing/booking boundaries and escalation before widening Peaches' authority.
- [ ] Verify physical-phone keyboard behavior and Safari.

Peaches currently uses a knowledge pack and instructions on each request. This is distinct from model fine-tuning; approved material and evaluation should come first.

## Screenshot checklist — evidence and remaining decisions

| Item | Status and evidence |
| --- | --- |
| Colour contrast | Improved focus, input borders, hero scrim and small Peaches disclosures. Sampled muted text is 5.11:1 on paper; contact labels 5.58:1; focus 6.11:1; composer border 4.42:1. This is not a complete accessibility certification. |
| Image alt text | All 20 built pages checked for alt attributes. Decorative hero images use empty alt; project images have names/disciplines. Scene-specific descriptions can improve further with approved project content. |
| Accessibility / keyboard | Labelled inputs, native required consent, focus outlines, Menu/Escape and reduced-motion behavior checked. Physical Safari and assistive-technology review remain open. |
| Clear buttons | Descriptive link/button labels retained; icon-only controls have accessible names. |
| Refund / cancellation policy | Review draft in POLICY-DRAFTS.md; no refund promises published. Owner must decide deposit, cancellation, rescheduling and refund rules. |
| Privacy / cookies / terms pages | Drafts prepared, not published pending approval and processor/retention details. |
| Form consent / minimum data | Contact collects name, email, message and an unchecked enquiry-consent field. Clear purpose/provider notice, field limits, honeypot and native validation. Browser limits are not a substitute for server validation. Netlify owns form processing. |
| Real business details | Everiart, 170 Ademola Adetokunbo, Wuse 2, Abuja, Nigeria; hello@everiart.com. Supplied by owner. |
| Reviews / unsupported claims | No testimonial/rating component found in active templates. Draft case-study ledes are no longer published; inferred studio-wide roles removed. Unverified two-working-day reply promise removed. |
| Image copyright | Owner states media is cleared. Font OFL licences are included in assets/fonts. Underlying releases/agreements were not independently examined. |
| Third-party embeds / tracking | No iframe, analytics tag or advertising pixel found in application source. External video uses the known Cloudflare R2 origin. Removed unused Google Fonts preconnects; fonts are local. Platform-level settings still require review. |
| Cookie consent | No optional tracking integration to gate was found; no cosmetic consent banner added. Application does not set cookies. Verify runtime platform cookies/settings before publishing a definitive cookie statement. |
| Local law | Nigerian NDPC sources consulted for the draft. Lawful bases, transfers, retention and final policies need owner/legal review; no compliance certification claimed. |
| Unused packages / dependencies | One direct package, @netlify/functions, is used. npm audit reports zero known production vulnerabilities. Dependabot and CI checks added. |
| Secrets in Git | No known-format credentials matched in current tracked files. Two historical matches were false positives in Microsoft documentation URLs. GitHub reports zero open secret alerts, with secret scanning and push protection enabled. Custom-secret formats may evade this scan. |
| API keys / environment | AI key and base URL are read server-side only, never included in the static build. Runtime configuration/retention and provider account controls still need review. |
| User access | GitHub reports one collaborator role: admin. Main has no branch protection. Hosting/DNS/email roles and MFA require an account review; settings were not silently changed. |
| Passwords / authentication | Not applicable to public visitors: no accounts or password storage exist. Hosting and repository account security is separate. |
| Admin routes / database | No application admin routes or database integration found. There is no client-side database credential. |
| Rate limiting | Peaches declares 12 requests per 60 seconds per IP/domain at Netlify. No load test against production was performed. |
| Secure API / CORS | Strict method and JSON type, exact-origin browser checks, byte-bounded streaming body, malformed/null rejection, bounded conversation, no permissive CORS. Public callers without Origin are not authenticated by this check. |
| Forms / XSS | Peaches renders user/model text via textContent; cards use an allowlisted catalogue. Static generator escapes descriptive text; CSP restricts scripts. Netlify form data is not rendered into public pages. Contact inbox delivery still needs an owner-authorized end-to-end test. |
| Debug / exposed files | Static allowlist excludes .env, .git, server functions, policies, project source data and node_modules. Endpoint errors do not return stack traces or upstream details. |
| Security headers | Added build-generated CSP with exact inline-script hashes and HTTPS-only HSTS (no subdomain preload). Existing nosniff/referrer/permissions protections retained. API responses set their own headers. |
| XML sitemap / robots | Generated from 20 published HTML pages; absolute canonical URLs and sitemap location in robots.txt. |
| Titles / keywords | Unique page titles, descriptions, canonical and social metadata. Homepage explicitly names the services and Abuja. No meta-keywords stuffing. |
| Search Console | Not yet verified or submitted. Exact owner-account/DNS steps are in SEARCH-CONSOLE-SETUP.md. |

Validation: build, 15 tests and 20-page internal-route check pass; contact consent blocks submission when unchecked and works by keyboard. A local preview with the new CSP enforced loads Contact and Peaches without console errors. Production checks are recorded in the completion message.

References: [NDPC](https://ndpc.gov.ng/), [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), [Google metadata reference](https://developers.google.com/search/docs/crawling-indexing/special-tags), [Netlify Functions API](https://docs.netlify.com/build/functions/api/).
