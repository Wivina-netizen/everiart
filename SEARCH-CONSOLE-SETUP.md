# Google Search Console setup

The site publishes **https://everiart.com/sitemap.xml** and references it from **https://everiart.com/robots.txt**. Production HTML has canonical URLs, page titles/descriptions and Open Graph metadata. Preview deploys receive noindex directives.

## Owner account step

1. Open [Google Search Console](https://search.google.com/search-console/) in the Google account that should own the property.
2. Add the Domain property `everiart.com`.
3. Copy Google's exact DNS TXT verification record and add it at the domain's DNS provider. Keep existing DNS records intact. Return to Search Console and verify after the record is visible.
4. In Sitemaps, submit `https://everiart.com/sitemap.xml`.
5. Use URL Inspection for the homepage and the three studio pages. Review Page indexing and indexing errors over time. Submission does not guarantee indexing or ranking.

If domain DNS access is unavailable, use a URL-prefix property for `https://everiart.com/` and provide Google's exact HTML verification file or meta token for implementation. Do not share your Google password or account recovery codes.

## Search intent used

The homepage describes film, brand identity and photography in Abuja. Studio pages keep their specific service focus and project pages their actual project names. There is no keyword-stuffing or added meta-keywords field: Google does not use that field for indexing or ranking.

Sources: [Google's sitemap instructions](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), [supported metadata](https://developers.google.com/search/docs/crawling-indexing/special-tags), and [ownership verification](https://support.google.com/webmasters/answer/9008080).

Status: technical preparation complete; account ownership verification and submission are not yet done.
