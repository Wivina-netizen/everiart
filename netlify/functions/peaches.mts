import type { Config } from '@netlify/functions';
import { portfolioAnswer, offlineGuide, requestsRestrictedDetails } from '../../js/peaches-guide.js';
import { instructions } from './_shared/peaches-knowledge.mjs';
import { validateMessages, commercialResponse, cleanAnswer } from './_shared/peaches-policy.mjs';
import { readBoundedJson } from './_shared/request-body.mjs';

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: {
    'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
    'Referrer-Policy': 'no-referrer', ...(status === 405 ? { Allow: 'POST' } : {})
  } });
}

export default async (request: Request) => {
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return json({ error: 'Please use the chat on this website.' }, 403);
  if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') return json({ error: 'Expected JSON.' }, 415);
  const parsed = await readBoundedJson(request);
  if (parsed.status) return json({ error: parsed.status === 413 ? 'Please shorten your conversation or start a new one.' : 'The message could not be read.' }, parsed.status);
  const body = parsed.body;
  const messages = validateMessages(body.messages);
  if (!messages) return json({ error: 'Please send a shorter message or start a new conversation.' }, 400);
  const question = messages.at(-1).content;
  const policy = commercialResponse(question);
  if (policy && !requestsRestrictedDetails(question)) return json({ ...policy, mode: 'policy' });
  const guide = portfolioAnswer(messages);
  if (guide) return json(guide);

  // Values are consumed here only, never returned or logged.
  // Netlify's managed gateway injects these on eligible sites.
  const key = Netlify.env.get('OPENAI_API_KEY');
  const configuredBase = Netlify.env.get('OPENAI_BASE_URL');
  if (!key || !configuredBase) return json(offlineGuide(messages));
  const base = configuredBase.replace(/\/+$/, '');
  const endpoint = `${base.endsWith('/v1') ? base : `${base}/v1`}/chat/completions`;
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(25000),
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [{ role: 'system', content: instructions() }, ...messages],
        temperature: 0.65,
        max_tokens: 750,
        response_format: { type: 'json_schema', json_schema: {
          name: 'peaches_answer', strict: true,
          schema: { type: 'object', additionalProperties: false,
            properties: { reply: { type: 'string' }, linkIds: { type: 'array', items: { type: 'string' } }, projectSlugs: { type: 'array', items: { type: 'string' } }, suggestions: { type: 'array', items: { type: 'string' } } },
            required: ['reply', 'linkIds', 'projectSlugs', 'suggestions'] }
        } }
      })
    });
    if (!response.ok) return json(offlineGuide(messages));
    const result = await response.json();
    const answer = cleanAnswer(JSON.parse(result.choices?.[0]?.message?.content ?? '{}'));
    return json({ ...answer, mode: 'ai' });
  } catch {
    return json(offlineGuide(messages));
  }
};

export const config: Config = {
  path: '/api/peaches',
  rateLimit: { windowLimit: 12, windowSize: 60, aggregateBy: ['ip', 'domain'] }
};
