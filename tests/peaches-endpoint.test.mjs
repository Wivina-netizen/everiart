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
