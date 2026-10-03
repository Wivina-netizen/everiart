import type { Config } from '@netlify/functions';
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
  const policy = commercialResponse(messages.at(-1).content);
  if (policy) return json({ ...policy, mode: 'policy' });

  // Values are consumed here only, never returned or logged.
  // Netlify's managed gateway injects these on eligible sites.
  const key = Netlify.env.get('OPENAI_API_KEY');
  const configuredBase = Netlify.env.get('OPENAI_BASE_URL');
  if (!key || !configuredBase) return json({ error: 'Peaches isn’t connected to the AI service yet. You can explore the work or bring your idea directly to our team.', code: 'AI_NOT_CONFIGURED' }, 503);
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
            properties: { reply: { type: 'string' }, projectSlugs: { type: 'array', items: { type: 'string' } }, suggestions: { type: 'array', items: { type: 'string' } } },
            required: ['reply', 'projectSlugs', 'suggestions'] }
        } }
      })
    });
    if (!response.ok) return json({ error: 'Peaches can’t reach the AI service right now. Please try again shortly, or speak with our team.', code: 'AI_UNAVAILABLE' }, 503);
    const result = await response.json();
    const answer = cleanAnswer(JSON.parse(result.choices?.[0]?.message?.content ?? '{}'));
    return json({ ...answer, mode: 'ai' });
  } catch {
    return json({ error: 'Peaches couldn’t finish that response. Your message is still here—please try again.', code: 'AI_RESPONSE_FAILED' }, 503);
  }
};

export const config: Config = {
  path: '/api/peaches',
  rateLimit: { windowLimit: 12, windowSize: 60, aggregateBy: ['ip', 'domain'] }
};
