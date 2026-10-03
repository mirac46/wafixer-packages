import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { areaOf, classify, collectEntries, parseLog } from '../release-notes.mjs';

const SCRIPT = fileURLToPath(new URL('../release-notes.mjs', import.meta.url));

test('commit önekleri Türkçe gruplara ayrılır, yapay zekâ izi süzülür', () => {
  assert.deepEqual(classify('feat(sdk): chat.updatePresence'), { group: 'Yeni', text: 'sdk: chat.updatePresence' });
  assert.equal(classify('Add dynamic session selection').group, 'Diğer');
  const commits = parseLog('\x1efix: yeniden deneme süresi\x1fCo-Authored-By: Bot <bot@example.com>\n');
  assert.deepEqual(collectEntries(commits), [{ group: 'Düzeltmeler', text: 'Yeniden deneme süresi' }]);
});

test('paket klasörü alan adı olur', () => {
  assert.deepEqual(areaOf('packages/wafixer-sdk/src/client.ts'), ['Paket', 'wafixer-sdk']);
  assert.deepEqual(areaOf('packages/n8n-nodes-wafixer/nodes/Wafixer/Wafixer.node.ts'), ['Paket', 'n8n-nodes-wafixer']);
  assert.equal(areaOf('package-lock.json'), null);
});

test('her paket kendi etiketini ve yalnız kendi klasörünün notlarını alır', (t) => {
  const repo = mkdtempSync(join(tmpdir(), 'release-notes-'));
  t.after(() => rmSync(repo, { recursive: true, force: true }));
  const git = (...args) => execFileSync('git', args, { cwd: repo, encoding: 'utf8' });
  const write = (file, content) => {
    mkdirSync(dirname(join(repo, file)), { recursive: true });
    writeFileSync(join(repo, file), content);
  };
  const commit = (message) => {
    git('add', '-A');
    git('commit', '-q', '-m', message);
  };
  const setVersion = (pkg, version) => write(`packages/${pkg}/package.json`, JSON.stringify({ name: pkg, version }));
  const run = (pkg) => {
    const output = join(repo, '.git', 'github-output');
    writeFileSync(output, '');
    const notes = execFileSync(process.execPath, [SCRIPT, '--package', pkg, '--github-output'], {
      cwd: repo,
      encoding: 'utf8',
      env: { ...process.env, GITHUB_OUTPUT: output },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const values = Object.fromEntries(readFileSync(output, 'utf8').trim().split('\n').map((line) => line.split(/=(.*)/s).slice(0, 2)));
    return { notes, values };
  };

  git('init', '-q', '-b', 'main');
  git('config', 'user.name', 'Test');
  git('config', 'user.email', 'test@example.com');
  setVersion('wafixer-sdk', '0.1.1');
  setVersion('n8n-nodes-wafixer', '0.1.1');
  commit('chore: ilk sürüm');
  git('tag', 'v0.1.1');
  assert.equal(run('wafixer-sdk').values.skip, 'true');
  assert.equal(run('n8n-nodes-wafixer').values.skip, 'true');

  write('packages/wafixer-sdk/src/presence.ts', 'export {}');
  commit('feat(sdk): presence');
  write('packages/n8n-nodes-wafixer/nodes/x.ts', 'export {}');
  commit('feat: oturum seçimi');
  setVersion('wafixer-sdk', '0.1.2');
  commit('chore: wafixer-sdk 0.1.2');

  const sdk = run('wafixer-sdk');
  assert.deepEqual(sdk.values, { skip: 'false', tag: 'wafixer-sdk@0.1.2', title: 'wafixer-sdk 0.1.2', version: '0.1.2', from: 'v0.1.1' });
  assert.match(sdk.notes, /## Yeni\n- sdk: presence\n/);
  assert.match(sdk.notes, /- Paket: wafixer-sdk/);
  assert.doesNotMatch(sdk.notes, /oturum seçimi/i);
  assert.equal(run('n8n-nodes-wafixer').values.skip, 'true');

  git('tag', 'wafixer-sdk@0.1.2');
  write('packages/wafixer-sdk/src/presence.ts', 'export const x = 1;');
  setVersion('wafixer-sdk', '0.1.3');
  commit('fix(sdk): presence süresi');
  assert.equal(run('wafixer-sdk').values.from, 'wafixer-sdk@0.1.2');

  const unknown = spawnSync(process.execPath, [SCRIPT, '--package', 'yok'], { cwd: repo, encoding: 'utf8' });
  assert.equal(unknown.status, 1);
  assert.match(unknown.stderr, /bilinmeyen paket/);
});
