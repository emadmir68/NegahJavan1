import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { makeSlug, CATEGORY_LABELS } from '../src/db.js';

const root = new URL('../', import.meta.url);

test('wrangler config targets only negahjavan', async () => {
  const cfg = JSON.parse(await readFile(new URL('wrangler.jsonc', root), 'utf8'));
  assert.equal(cfg.name, 'negahjavan');
  assert.equal(cfg.main, 'src/worker.js');
  assert.equal(cfg.workers_dev, true);
  assert.equal('d1_databases' in cfg, false, 'D1 is intentionally bound in Cloudflare after database creation');
});

test('Persian slug generation is stable and readable', () => {
  assert.equal(makeSlug('خبر مهم نگاه جوان'), 'خبر-مهم-نگاه-جوان');
  assert.equal(makeSlug('  اقتصاد  ایران  '), 'اقتصاد-ایران');
});

test('core editorial categories are present', () => {
  for (const key of ['politics','incidents','world','economy','society','technology','culture','sports']) {
    assert.ok(CATEGORY_LABELS[key]);
  }
});

test('worker keeps private secrets out of source', async () => {
  const src = await readFile(new URL('src/worker.js', root), 'utf8');
  assert.match(src, /ADMIN_PASSWORD|authConfigured/);
  assert.doesNotMatch(src, /password\s*[:=]\s*["'][^"']{4,}["']/i);
});
