import test from 'node:test';
import assert from 'node:assert/strict';
import { studioReels } from '../studio-portfolio.mjs';

test('reels prefer short cuts and never expose unpublished project media', () => {
  const reels = studioReels([
    {published:true, slug:'film', name:'Film', thumb:'film.jpg', reel:'full.mp4', clips:['short-1.mp4','short-2.mp4']},
    {published:false, slug:'private', reel:'private.mp4', clips:['private-short.mp4']},
    {published:true, slug:'identity', reel:null, clips:[]},
  ]);
  assert.deepEqual(reels.map(r => r.src), ['short-1.mp4','short-2.mp4']);
  assert.ok(reels.every(r => r.slug === 'film' && r.poster === 'film.jpg'));
});

test('a published reel remains available when there is no short cut', () => {
  const reels = studioReels([{published:true, slug:'photo', name:'Photo', reel:'reel.mp4', clips:[]}]);
  assert.equal(reels.length, 1);
  assert.equal(reels[0].src, 'reel.mp4');
  assert.equal(reels[0].label, 'Reel');
});
