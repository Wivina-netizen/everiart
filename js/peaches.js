import { teamEmailDraft } from './peaches-handoff.js';
const form = document.querySelector('#peaches-form');
const input = document.querySelector('#peaches-input');
const log = document.querySelector('#messages');
const scroll = document.querySelector('#chat-scroll');
const status = document.querySelector('#chat-status');
const send = document.querySelector('#send-message');
const welcome = document.querySelector('#chat-welcome');
const handoff = document.querySelector('#take-brief');
const teamLinks = [...document.querySelectorAll('[data-team-email]')];
let history = [];
let busy = false;
let pendingMessage = '';
let controller;
const catalogue = await fetch('/js/peaches-projects.json').then(r => r.json()).catch(() => []);

function refreshDraft() {
  const href = teamEmailDraft(history, input.value || pendingMessage);
  teamLinks.forEach(link => { link.href = href; });
}
function resizeInput() {
  if (window.visualViewport?.scale === 1) {
    document.body.style.setProperty('--chat-viewport', `${window.visualViewport.height}px`);
  }
  input.style.height = 'auto';
  const viewportHeight = window.visualViewport?.height || window.innerHeight;
  const area = document.querySelector('.composer-area');
  const conversation = document.querySelector('.conversation');
  const chrome = area.getBoundingClientRect().height - input.getBoundingClientRect().height;
  // Leave room for conversation and for the keyboard on short screens.
  const limit = Math.max(44, Math.min(viewportHeight * .4, conversation.clientHeight - chrome - 80));
  const height = Math.min(input.scrollHeight, limit);
  input.style.height = `${height}px`;
  input.style.overflowY = input.scrollHeight > height ? 'auto' : 'hidden';
  refreshDraft();
}

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function message(role, content, projects = [], suggestions = []) {
  const article = element('article', '', `message ${role}`);
  article.append(element('p', role === 'user' ? 'You' : 'Peaches', 'message-label'), element('p', content));
  if (projects.length) {
    const cards = element('div', '', 'message-cards');
    for (const slug of projects) {
      const p = catalogue.find(p => p.slug === slug);
      if (!p) continue;
      const card = element('a', '', 'message-card');
      card.href = `/work/${p.slug}/`;
      const image = element('img'); image.src = `/${p.thumb}`; image.alt = `${p.name} — ${p.discipline}`; image.loading = 'lazy';
      const label = element('p', `${p.name} ↗`); label.append(element('span', p.discipline));
      card.append(image, label); cards.append(card);
    }
    article.append(cards);
  }
  if (suggestions.length) {
    const row = element('div', '', 'followups');
    for (const suggestion of suggestions) {
      const button = element('button', suggestion); button.type = 'button';
      button.addEventListener('click', () => submit(suggestion)); row.append(button);
    }
    article.append(row);
  }
  log.append(article);
  article.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  return article;
}
function setBusy(value) {
  busy = value; send.disabled = value;
  document.querySelector('#new-chat').disabled = value;
  document.querySelectorAll('[data-prompt], .followups button').forEach(b => b.disabled = value);
  form.setAttribute('aria-busy', String(value));
}
async function submit(text) {
  text = text.trim();
  if (!text || busy || text.length > 2000) return;
  if (history.length >= 18) { status.textContent = 'You’ve explored a lot together. Bring this conversation to the team, or start a new one.'; return; }
  pendingMessage = text;
  welcome.hidden = true; input.value = ''; resizeInput();
  const user = message('user', text);
  setBusy(true); status.textContent = 'Peaches is thinking about your brief…';
  controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const pending = [...history, { role: 'user', content: text }];
    const response = await fetch('/api/peaches', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: pending }), signal: controller.signal });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(response.status === 429 ? 'A few too many messages at once. Please wait a minute and try again.' : data.error || 'Peaches is unavailable right now. Please try again or contact the team.');
    history = [...pending, { role: 'assistant', content: data.reply }];
    status.textContent = '';
    message('assistant', data.reply, data.projectSlugs, data.suggestions);
    handoff.hidden = false;
  } catch (error) {
    user.remove();
    status.textContent = error.name === 'AbortError' ? 'That response took too long. Please try sending your message again.' : error.message;
    input.value = text;
    if (!history.length) welcome.hidden = false;
  } finally { clearTimeout(timeout); pendingMessage = ''; setBusy(false); resizeInput(); }
}
form.addEventListener('submit', event => { event.preventDefault(); submit(input.value); });
input.addEventListener('keydown', event => { if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) { event.preventDefault(); form.requestSubmit(); } });
input.addEventListener('input', resizeInput);
window.addEventListener('resize', resizeInput);
window.visualViewport?.addEventListener('resize', resizeInput);
document.querySelectorAll('[data-prompt]').forEach(b => b.addEventListener('click', () => submit(b.dataset.prompt)));
document.querySelector('#new-chat').addEventListener('click', () => {
  if (busy) return;
  history = []; log.replaceChildren(); status.textContent = ''; welcome.hidden = false; input.value = ''; resizeInput(); input.focus(); scroll.scrollTop = 0;
});
teamLinks.forEach(link => link.addEventListener('click', refreshDraft));
// A studio link proposes a starting question; it never sends without the visitor.
const question = new URLSearchParams(location.search).get('q');
if (question) { input.value = question.slice(0, 2000); window.history.replaceState({}, '', '/peaches/'); }
resizeInput();
