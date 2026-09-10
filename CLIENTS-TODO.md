# Selected clients — audit, and why the section is currently out

**Outcome: the section is removed from `index.html`.** Three clients cleared
both bars below. The brief this was built to set a floor of five, and said to
remove the section rather than ship a thin version. That is what happened.

Nothing here is lost work — the verified logo URLs and the treatment recipe are
recorded so putting the section back is assembly, not research.

## What it replaced

Eight cells reading `Client One` … `Client Eight`. That is placeholder
vocabulary sitting in the same list as real named work, which the pattern
library rules out. It had to go regardless of what replaced it.

## The two bars

1. **Verified** — the entity resolved to one unambiguous organisation, EveriArt
   demonstrably did the work, and an official logo came from that
   organisation's own site.
2. **Renderable** — the logo survives one consistent monochrome treatment at
   row height (~48px). This is the bar that did the real damage, and it was not
   anticipated: a logo can be perfectly sourced and still be unusable here.

## Cleared both — 3

| Client | Entity | Logo source (verified official) |
| --- | --- | --- |
| AGRA | Alliance for a Green Revolution in Africa | `agra.org/wp-content/themes/agra/assets/img/agralogo.png` |
| Malala Fund | Malala Fund | `malala.org/packs/static/images/malala-primary-logo-large-0a880532137530e3eed5.svg` |
| NITDA | National Information Technology Development Agency | `nitda.gov.ng/wp-content/uploads/2020/07/cropped-cropped-NITDA-Logo-new-03.png` |

All three are wordmarks, which is exactly why they survive: the silhouette *is*
the identity.

## Failed the treatment, not the sourcing — 2

Both logos were sourced successfully from official government sites. Both are
detailed institutional seals — circular micro-text, fine internal illustration,
identity carried by colour separation. Reduced to a single colour at row height,
**NUPRC becomes a plain disc and NAMA a featureless blob.** Neither is
recognisable, and neither can be fixed by a better source file; the marks are
drawn for letterheads, not for a 48px monochrome strip.

| Client | Entity | Logo (sourced, unusable here) |
| --- | --- | --- |
| NUPRC | Nigerian Upstream Petroleum Regulatory Commission | `nuprc.gov.ng/_next/static/media/logo.16w-qz3uzutws.png` |
| NAMA | Nigerian Airspace Management Agency | `nama.gov.ng/wp-content/uploads/2022/10/image-11-200x197.png` |

If these two matter, the section needs a **different design** — full colour on
light chips, or set names as type rather than logos. Don't retry the monochrome
row and expect a different result.

## Dropped, with reasons — everything else

| Candidate | Why dropped |
| --- | --- |
| Mallpai Foundation | Verified as a client from primary evidence (logo bug and title card in her own film). **Both official domains fail DNS** — `mallpaiportal.org` and `mallpaifoundation.org` do not resolve. No official logo obtainable. Retry if the site comes back. |
| Hope For Her Foundation | Could not identify an official site. "Pad A Girl" is a campaign name used by several unrelated Nigerian organisations, so search does not disambiguate it. Stays a project on the site; not a logo. |
| Lagos State Government | Source is *The Sanwo-Olu Standard*, a personal legacy documentary about the Governor. No Lagos State Government mark appears in it. Naming the state government as a client on this evidence is a political association claim I can't support. |
| Federal Civil Service | Event backdrop reads "Federal Civil Service" but the commissioning body is ambiguous (Commission vs. Office of the Head of the Civil Service), and the only available mark is the **national Coat of Arms** — a state symbol, not an org logo. |
| House of Assembly | Folder is mislabelled. The film is "from the Office of the Deputy Speaker, **House of Representatives**, Nigeria" (Rt. Hon. Benjamin Okezie Kalu). An individual legislator's office; mark would be the National Assembly's arms. Same state-symbol problem, plus political weight. |
| Ministry of Petroleum | Room carries the Ministry of Petroleum Resources seal, but the persistent mark in frame is **NMDPRA's**, and the event is an MDGIF signing. Two candidate clients, and both marks are state seals. |
| COAS | Resolves to **Chief of Army Staff** — an office, not an organisation. The logo would be the Nigerian Army's. Military insignia on a commercial portfolio is an implied-endorsement claim of a different order; not a call to make without explicit instruction. |
| NAOWA | Nigerian Army Officers' Wives Association. Name resolved, but **no official website** — only a Facebook page. Army-affiliated, so the same caution as COAS. |
| Naija Brand Chick | No branding anywhere in the footage; entity and relationship both unverified. Low recognition regardless. |
| GIZ / EU / Digital Transformation Center Nigeria | These are the marks actually on the backdrop of the "NITDA" film — see the caveat below. Whether GIZ was a client or a co-host is genuinely unclear, so no. |
| BBC | Only evidence is a file named "BBC Mallpai Recap". Reads as *coverage by* the BBC, not work *for* them. Far too thin. |

## Flags — read these before reviving the section

**Every government/institutional entity below needs Wivina's personal
confirmation before it goes anywhere near production.** Holding footage proves
the work happened; it does not prove permission to publicly claim the
relationship, and for federal agencies that distinction carries real weight.

- **NITDA** *(cleared both bars, but this is the weak one)* — the folder and
  filename say NITDA, but the event backdrop carries **GIZ, German Cooperation,
  the EU and Digital Transformation Center Nigeria — NITDA's own mark is not on
  it.** The event is a Digital Policy Dialogue. NITDA is a real partner in DTC
  Nigeria, so the filing is plausible, but the client here could as easily be
  GIZ. **Confirm who actually commissioned this before listing NITDA anywhere.**
- **NUPRC** — federal regulator. Relationship evidence is strong (NUPRC's logo
  is burned into her delivered cut as a corner bug), but it is still a federal
  agency.
- **NAMA** — federal agency. Evidence is strong (event banner plus her own
  titled sequence).
- **Mallpai Foundation** — founded by the First Lady of Kebbi State, so it is
  semi-political even though it is an NGO.

## How the relationships were verified

Not from folder names. Frames were pulled from each source film and read for
branding, which is the only evidence available that distinguishes "we were
hired by X" from "we filmed at an event where X appeared":

- **NUPRC** — its logo is burned into the delivered cut as a persistent corner
  bug. That is a deliverable made *for* NUPRC.
- **NAMA** — event banner names the agency, and her own title card reads
  "Ground Breaking Ceremony / Nigerian Airspace Management Agency".
- **Malala Fund** — logo bug on every frame plus a full-screen logo endcard.
  (Filed under the working title "Fraser Suite Drone Perfecto", which is why
  the folder name alone was misleading.)
- **Mallpai Foundation** — logo bug plus a "Mallpai Foundation — IDP Camp
  Visit" title card.
- **AGRA** — the AGRA mark, the tagline "Sustainably Growing Africa's Food
  Systems" and a "20 Years" anniversary lockup are all visible on the event
  backdrop in her own photographs. AGRA was founded in 2006, and the project is
  dated 2026. This also settles which "AGRA" it is.

## Treatment recipe, for when this comes back

Monochrome by silhouette: take the source logo's alpha channel and use it as a
mask over flat Parchment (`--parchment`, `#F4F1DE`), rendered at 2× row height.

```sh
ffmpeg -y -i logo.png -vf "scale=-2:96:flags=lanczos" tmp.png
W=$(ffprobe -v error -select_streams v -show_entries stream=width -of csv=p=0 tmp.png)
ffmpeg -y -i tmp.png -f lavfi -i "color=c=0xF4F1DE:s=${W}x96" \
  -filter_complex "[0:v]alphaextract[a];[1:v][a]alphamerge" -frames:v 1 out.png
```

This gives one colour, one height and consistent weight across logos of any
native aspect ratio — and it is precisely what destroys a detailed seal, so
check every mark against it *before* committing to a client list.

If the section returns, build it through `make_media.mjs` (a `CLIENTS` map
alongside `SITE`) so the assets stay derived rather than hand-dropped, and give
the row `.reveal` so it cascades like everything else.
