import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';

const base = 'https://everiart.com';
const root = 'dist';
const esc = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
const pages = [];
const hashes = new Set();
function walk(directory) {
  for (const file of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, file.name);
    if (file.isDirectory()) walk(path);
    else if (file.name.endsWith('.html')) pages.push(path);
  }
}
walk(root);
const urls = [];
for (const path of pages) {
  let html = readFileSync(path, 'utf8');
  const route = '/' + relative(root, path).replaceAll('\\', '/').replace(/index\.html$/, '');
  const url = base + route;
  urls.push(url);
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1];
  const description = html.match(/<meta name="description" content="([^"]*)"/i)?.[1];
  if (!title || !description) throw new Error(`Missing search metadata: ${route}`);
  html = html.replace(/<link\b[^>]*rel="canonical"[^>]*>/gi, '')
    .replace(/<meta\b[^>]*(?:property="og:[^"]+"|name="twitter:[^"]+")[^>]*>/gi, '')
    .replace(/<link\b[^>]*rel="preconnect"[^>]*>/gi, '');
  const firstImage = html.match(/<img[^>]+src="\/?(assets\/[^"?#]+)"/i)?.[1] || 'assets/hero-poster.jpg';
  html = html.replace('</head>', `<link rel="canonical" href="${esc(url)}">
<meta property="og:type" content="website"><meta property="og:site_name" content="Everiart">
<meta property="og:title" content="${title}"><meta property="og:description" content="${description}">
<meta property="og:url" content="${esc(url)}"><meta property="og:image" content="${base}/${esc(firstImage)}">
<meta name="twitter:card" content="summary_large_image">
${process.env.CONTEXT && process.env.CONTEXT !== 'production' ? '<meta name="robots" content="noindex, nofollow">' : ''}
</head>`);
  for (const [, attributes, content] of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (!/\bsrc=/.test(attributes) && content.trim()) {
      hashes.add(`'sha256-${createHash('sha256').update(content).digest('base64')}'`);
    }
  }
  writeFileSync(path, html);
}
writeFileSync(join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.sort().map(url => `  <url><loc>${esc(url)}</loc></url>`).join('\n')}\n</urlset>\n`);
writeFileSync(join(root, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${base}/sitemap.xml\n`);
// Styles use inline layout variables; script execution remains restricted to
// bundled code and exact hashes of the legacy first-paint scripts.
const mediaOrigin = 'https://pub-22c601fc38564ec79d41e018bfad6bcf.r2.dev';
const csp = `default-src 'self'; script-src 'self' ${[...hashes].join(' ')}; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; media-src 'self' ${mediaOrigin}; connect-src 'self' ${mediaOrigin}; object-src 'none'; base-uri 'none'; frame-src 'none'; frame-ancestors 'self'; form-action 'self'; upgrade-insecure-requests`;
writeFileSync(join(root, '_headers'), `/*\n  Content-Security-Policy: ${csp}\n  Strict-Transport-Security: max-age=31536000\n${process.env.CONTEXT && process.env.CONTEXT !== 'production' ? '  X-Robots-Tag: noindex, nofollow\n' : ''}`);
console.log(`Prepared canonical metadata, sitemap, robots and security headers for ${pages.length} pages.`);
