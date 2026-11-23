export const arrowIcon = '<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M7 17 17 7M7 7h10v10"/></svg>';

export function siteNav(active = '', home = false) {
  const links = [['/experience/', 'Studios', 'experience'], ['/peaches/', 'Ask Peaches', 'peaches'], ['/contact/', 'Contact us', 'contact']];
  const items = links.map(([href, label, key]) => `<a href="${href}"${key === active ? ' aria-current="page"' : ''}>${label}${arrowIcon}</a>`).join('');
  return `<a class="site-skip" href="#main">Skip to content</a>
<header class="site-header masthead${home ? ' site-header--home' : ''}">
  <a class="site-brand" href="/" aria-label="Everiart home">${home ? '<span class="site-house">A CREATIVE HOUSE</span>' : '<span class="site-wordmark">Everiart<span class="site-gold">.</span><sup>™</sup></span>'}</a>
  <nav class="site-links" aria-label="Main navigation">${items}</nav>
  <button class="menu-toggle" type="button" aria-label="Open menu" aria-haspopup="dialog" aria-expanded="false" aria-controls="site-menu"><span>Menu</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 8h18M3 16h18"/></svg></button>
</header>
<dialog class="site-menu" id="site-menu" aria-labelledby="menu-title">
  <div class="menu-heading"><span id="menu-title">THE HOUSE OF EVERIART</span><button type="button" class="menu-close" aria-label="Close menu"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6"/></svg></button></div>
  <nav class="menu-links" aria-label="Mobile navigation">${items}</nav>
  <p class="menu-note">Film. Design. Photography.<br><i>Every problem. A visual solution.</i></p>
</dialog>`;
}
