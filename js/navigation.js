const header = document.querySelector('.site-header');
const dialog = document.querySelector('#site-menu');
const toggle = document.querySelector('.menu-toggle');
if (header && dialog && toggle && typeof dialog.showModal === 'function') {
  header.classList.add('menu-ready');
  const close = () => dialog.close();
  toggle.addEventListener('click', () => {
    dialog.showModal();
    toggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
  });
  dialog.querySelector('.menu-close').addEventListener('click', close);
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const stops = [...dialog.querySelectorAll('button, a[href]')];
    const first = stops[0], last = stops.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  });
  dialog.addEventListener('click', event => {
    if (event.target === dialog) {
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close();
    }
  });
  dialog.querySelectorAll('a').forEach(link => link.addEventListener('click', close));
  dialog.addEventListener('close', () => {
    document.body.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
  });
  matchMedia('(min-width:701px)').addEventListener('change', event => {
    if (event.matches && dialog.open) close();
  });
}
