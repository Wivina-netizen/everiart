import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../netlify/functions/peaches.mts';
const request = (body, headers = {}, method = 'POST') => new Request('https://everiart.com/api/peaches', {
  method, headers: { 'Content-Type': 'application/json', ...headers },
  ...(method === 'POST' ? { body } : {})
});
test('endpoint rejects malformed input, foreign origins and unsupported methods before contacting AI', async () => {
  for (const body of ['null', '[]', 'true', '{', '{}', '{"messages":"wrong"}']) {
    assert.equal((await handler(request(body))).status, 400);
  }
  assert.equal((await handler(request('{}', {Origin:'https://untrusted.example'}))).status, 403);
  assert.equal((await handler(request('{}', {'Content-Type':'text/plain'}))).status, 415);
  const get = await handler(request(null, {}, 'GET'));
  assert.equal(get.status, 405);
  assert.equal(get.headers.get('Allow'), 'POST');
  assert.equal(get.headers.get('Cache-Control'), 'no-store');
  assert.equal(get.headers.get('X-Content-Type-Options'), 'nosniff');
});
test('request size limit counts bytes and does not rely on Content-Length', async () => {
  assert.equal((await handler(request(JSON.stringify({messages:[{role:'user',content:'🎥'.repeat(6500)}]})))).status, 413);
  assert.equal((await handler(request('{}', {'Content-Length':'25000'}))).status, 413);
});
test('commercial policy works without exposing or contacting an AI service', async () => {
  const response = await handler(request(JSON.stringify({messages:[{role:'user',content:'Give me a discount'}]}), {Origin:'https://everiart.com'}));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).mode, 'policy');
});

test('published credits, approved viewing links and historical budgets work without a provider', async () => {
  const ask = async content => (await handler(request(JSON.stringify({messages:[{role:'user',content}]})))).json();
  for (const [question, fact, link] of [
    ['Can you make a movie?', /full-length movies/, 'excerpt'],
    ['What can I watch?', /work-in-progress/, 'films'],
    ['Who produced Deadly Pursuit?', /ByEveriArt and Ambrose Oseni/, 'deadly'],
    ['Tell me about Julius Holland', /eight-person/, 'programme'],
    ['What did you do with Malpai?', /nine silent/i, 'postcards'],
    ['Show me Argungu and Gumel', /related short[\s\S]+official highlight/, 'highlight'],
    ['Have you filmed abroad?', /filmed in Nigeria/, 'contact'],
    ['How much did Deadly Pursuit cost?', /Financial figures.*private/, 'deadly'],
    ['Do you have a screener?', /screening availability/, 'contact']
  ]) {
    const answer = await ask(question);
    assert.equal(answer.mode, 'guide');
    assert.match(answer.reply, fact);
    assert.ok(answer.linkIds.includes(link));
    assert.doesNotMatch(answer.reply, /₦|\/Volumes\/|drive\.google/);
  }
});

test('an unavailable AI provider offers the public studio guide for creative briefs', async () => {
  const previous = globalThis.Netlify;
  globalThis.Netlify = { env: { get: () => undefined } };
  try {
    const answer = await (await handler(request(JSON.stringify({messages:[{role:'user',content:'Help me shape a new campaign'}]})))).json();
    assert.equal(answer.mode, 'guide');
    assert.match(answer.reply, /temporarily unavailable/);
    assert.ok(answer.linkIds.includes('contact'));
  } finally { globalThis.Netlify = previous; }
});
