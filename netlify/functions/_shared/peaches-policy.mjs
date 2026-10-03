import { projects } from './peaches-knowledge.mjs';
export function validateMessages(input) {
  if (!Array.isArray(input) || !input.length || input.length > 20) return null;
  if (input.at(-1)?.role !== 'user') return null;
  let size = 0;
  const messages = [];
  for (const item of input) {
    if (!item || !['user', 'assistant'].includes(item.role) || typeof item.content !== 'string' || !item.content.trim() || item.content.length > 2500) return null;
    size += item.content.length;
    messages.push({ role: item.role, content: item.content.trim() });
  }
  return size <= 18000 ? messages : null;
}

export function commercialResponse(text) {
  if (/\b(discount|negotiate|negotiation|half.?price|lowest price|best price|accept.{0,25}offer|confirm.{0,25}book|book.{0,25}confirm)\b/i.test(text)) {
    return { reply: 'I can help find a scope that works for your budget, but I can’t approve a discount or confirm a booking. Those decisions belong to the Everiart team. We could prioritise the most useful deliverable, simplify the shoot, or phase the project.\n\nWhat is the one thing this project absolutely needs to achieve?', projectSlugs: [], suggestions: ['Help me prioritise the deliverables', 'What should I include in my brief?'] };
  }
  if (/\b(how much|price list|rate card|your rates|your prices|what.{0,12}charge|give.{0,12}quote|cost of|starting price)\b/i.test(text)) {
    return { reply: 'The team needs to confirm the current rate for your specific scope; I don’t have an approved price list to quote from yet. What we make, the shoot requirements, deliverables and intended use all shape that conversation.\n\nWhat are you hoping to create, and what should it achieve?', projectSlugs: [], suggestions: ['A film for my brand', 'A new visual identity', 'Photography for an event'] };
  }
  return null;
}

export function cleanAnswer(value) {
  if (!value || typeof value.reply !== 'string' || !value.reply.trim() || value.reply.length > 7000) throw new Error('Invalid answer');
  // No pricing tool or booking action is exposed. Reject explicit unsupported quotes too.
  if (/(?:₦|\$|€|£|NGN|USD)\s*[\d,.]+|[\d,.]+\s*(?:naira|dollars|pounds|percent discount)|\b(?:booking (?:is )?confirmed|discount (?:is )?approved)\b/i.test(value.reply)) {
    return { reply: 'I can help shape the creative scope, but the Everiart team needs to confirm any price, discount or booking. What outcome matters most for your project?', projectSlugs: [], suggestions: ['Help me shape the scope'] };
  }
  const allowed = new Set(projects.map(p => p.slug));
  return {
    reply: value.reply.trim(),
    projectSlugs: Array.isArray(value.projectSlugs) ? [...new Set(value.projectSlugs)].filter(s => allowed.has(s)).slice(0, 2) : [],
    suggestions: Array.isArray(value.suggestions) ? value.suggestions.filter(s => typeof s === 'string' && s.length > 0 && s.length <= 100).slice(0, 3) : [],
  };
}
