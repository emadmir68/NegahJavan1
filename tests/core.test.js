import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { editorialPage } from '../src/ui.js';
import { makeSlug, CATEGORY_LABELS } from '../src/db.js';

const root = new URL('../', import.meta.url);

test('wrangler config targets only NegahJavan resources', async () => {
  const cfg = JSON.parse(await readFile(new URL('wrangler.jsonc', root), 'utf8'));
  assert.equal(cfg.name, 'negahjavan');
  assert.equal(cfg.main, 'src/worker.js');
  assert.equal(cfg.workers_dev, true);
  assert.equal(cfg.d1_databases?.length, 1);
  assert.equal(cfg.d1_databases[0].binding, 'DB');
  assert.equal(cfg.d1_databases[0].database_name, 'negahjavan1-db');
  assert.equal(cfg.d1_databases[0].database_id, 'b547715c-791a-465c-a415-2f45cf1061c0');
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


test('smart newsroom routes and automatic covers are wired', async () => {
  const worker = await readFile(new URL('src/worker.js', root), 'utf8');
  const ui = await readFile(new URL('src/ui.js', root), 'utf8');
  const db = await readFile(new URL('src/db.js', root), 'utf8');
  assert.match(worker, /\/api\/admin\/smart-preview/);
  assert.match(worker, /\/cover\\\//);
  assert.match(ui, /اصلاح هوشمند متن/);
  assert.match(ui, /تشخیص هوشمند/);
  assert.match(ui, /coverPreview/);
  assert.match(db, /society/);
  assert.match(db, /technology/);
  assert.match(db, /culture/);
  assert.match(db, /sports/);
});


test('editorial browser script parses cleanly', () => {
  const page = editorialPage();
  const matches = [...page.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  assert.ok(matches.length >= 1);
  for (const match of matches) new vm.Script(match[1]);
});
