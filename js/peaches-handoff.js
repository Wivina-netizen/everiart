// A reviewable email draft, never an automatic send or an AI-made commitment.
const excerpt = (value, limit) => {
  const text = String(value || '').trim();
  const characters = Array.from(text);
  return characters.length > limit ? `${characters.slice(0, limit).join('').trimEnd()}… [excerpt]` : text;
};

export function teamEmailDraft(messages = [], pending = '') {
  const users = messages.filter(message => message.role === 'user');
  const first = users[0]?.content;
  const latest = pending.trim() || users.at(-1)?.content;
  const direction = messages.filter(message => message.role === 'assistant').at(-1)?.content;
  const parts = ['Hello Everiart,', 'I’d like to discuss a project with your team.'];
  if (first && first !== latest) parts.push(`My starting point:\n${excerpt(first, 350)}`);
  if (latest) parts.push(`My enquiry:\n${excerpt(latest, 650)}`);
  if (direction) parts.push(`Direction explored with Peaches (AI suggestion, for discussion):\n${excerpt(direction, 450)}`);
  parts.push('Please help me confirm the scope and next steps.', 'Name:\nPreferred contact:');
  const subject = 'Project enquiry — Everiart';
  return `mailto:hello@everiart.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(parts.join('\n\n'))}`;
}
