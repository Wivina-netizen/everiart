# Ask Peaches — first review build

Peaches is a creative producer and guide: understand the problem, then propose a visual solution across film, design and photography. The owner confirmed this direction on 3 October 2026.

## Experience

- `/`: two equal entrances, Studios and Ask Peaches.
- `/experience/`: the house, three studio routes, philosophy and process.
- `/experience/byeveriart/`, `/experience/everidesign/`, `/experience/beframes/`: distinct introductions and published projects.
- `/peaches/`: conversational discovery, project cards, follow-ups and a visitor-reviewed email draft addressed to hello@everiart.com. The input grows with text, bounded by the available viewport so Send stays reachable.
- Existing work pages remain accessible; the new link carries the project name into a proposed chat prompt. It does not send automatically.

## Knowledge and authority

`netlify/functions/_shared/peaches-knowledge.mjs` contains the first knowledge pack and voice instructions. It uses the owner's explicit direction and conservative facts from published project metadata. Draft case-study ledes, invented outcomes and unpublished projects are excluded. This is not the complete three-part Brand Bible.

The pack is small enough to supply directly on each request. It does not currently use file-search retrieval, fine-tuning, or automatic ingestion of private chats. Add retrieval when the approved material warrants it.

Peaches cannot issue a quote, grant a discount, book a date or send an enquiry. No tools capable of those actions are exposed. Pricing and negotiation requests have deterministic guidance; model answers are checked for explicit unsupported monetary quotes. These checks reduce risk but are not a substitute for an authoritative pricing service. Do not enable financial or booking tools until that service and its approval rules exist.

For the next knowledge revision, approve:

1. The complete philosophy and 10–15 examples of the owner's preferred conversational voice.
2. Factual project briefs, contributions, deliverables and any approved outcomes.
3. The current package catalogue, inclusions, exclusions and quoting variables.
4. A separate private discount policy, escalation rules and availability source.

Never commit confidential prices or negotiation floors to this public repository. Store restricted rules in protected backend storage.

## AI connection

The Netlify Function consumes the platform's managed `OPENAI_API_KEY` and `OPENAI_BASE_URL` at runtime. It does not expose or log credentials. The current configured baseline is `gpt-4.1-mini`, listed in Netlify's supported models when implemented. Model quality should be reviewed with real briefs before production.

The website reports a clear unavailable state if the gateway is not configured. It never substitutes canned answers and labels them AI. Deterministic commercial guidance can work without an AI connection.

Requests are bounded, same-origin browser requests are checked, and the function declares a per-IP/domain rate limit. No conversation database has been added. Conversation history stays in memory. Team links open a contextual mailto draft in the visitor's email client; nothing is sent automatically. Long context is explicitly excerpted and AI suggestions are labelled for discussion. The UI tells visitors messages go to an AI provider. Provider retention and a complete privacy notice remain on the readiness checklist.

## Build and review

`npm ci && npm run build && npm test`

Use `netlify dev` for the local site and function. Only `dist/` is published. It excludes server source, instructions and documentation. The owner approved launch on 3 October 2026; PR #5 was merged into main and published at everiart.com. Follow-up work builds from that approved design.

Review realistic scenarios: a young clothing brand with unclear positioning; a foundation documentary; a visitor with a small budget; a brief spanning all three studios; an unsupported client claim; attempts to invent discounts; prompt injection; unavailable AI; keyboard/mobile operation; and handoff without automatic sending.
