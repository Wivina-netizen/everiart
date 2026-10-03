import test from 'node:test';
import assert from 'node:assert/strict';
import { teamEmailDraft } from '../js/peaches-handoff.js';

test('handoff addresses the team and encodes enquiry as body text, not mail headers', () => {
  const url = new URL(teamEmailDraft([], 'Film & design?\n&bcc=other@example.com'));
  assert.equal(url.pathname, 'hello@everiart.com');
  assert.equal(url.searchParams.has('bcc'), false);
  assert.match(url.searchParams.get('body'), /Film & design\?/);
});

test('handoff keeps the original brief, latest enquiry and qualified AI direction', () => {
  const messages = [{role:'user',content:'A launch film'}, {role:'assistant',content:'Explore a documentary direction'}, {role:'user',content:'For a September launch'}];
  const body = new URL(teamEmailDraft(messages, 'We also need portraits')).searchParams.get('body');
  assert.match(body, /A launch film/);
  assert.match(body, /We also need portraits/);
  assert.match(body, /AI suggestion, for discussion/);
  assert.match(body, /Explore a documentary direction/);
  assert.doesNotMatch(new URL(teamEmailDraft()).searchParams.get('body'), /launch film/);
});

test('long conversations produce explicit excerpts and do not silently imply a full transcript', () => {
  const body = new URL(teamEmailDraft([{role:'user',content:'a'.repeat(2000)}, {role:'assistant',content:'b'.repeat(10000)}], 'c'.repeat(2000))).searchParams.get('body');
  assert.ok(body.length < 1900);
  assert.match(body, /\[excerpt\]/);
});

test('excerpt boundaries preserve emoji characters', () => {
  const body = new URL(teamEmailDraft([], 'a'.repeat(649) + '🎥'.repeat(20))).searchParams.get('body');
  assert.match(body, /🎥… \[excerpt\]/);
});
