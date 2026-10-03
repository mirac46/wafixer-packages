#!/usr/bin/env node
// Paket başına sürüm etiketini (wafixer-sdk@x.y.z) ve GitHub Release gövdesini üretir.
// Bağımlılık yok: Node 22 ve git yeter. .github/workflows/release.yml her main push'unda
// iki paket için ayrı ayrı çağırır; yerelde önizleme için de çalışır.
//
//   node scripts/release-notes.mjs --package wafixer-sdk                  notları stdout'a yazar
//   node scripts/release-notes.mjs --package wafixer-sdk --out notlar.md  notları dosyaya yazar
//   --github-output   skip, tag, title, version, from değerlerini $GITHUB_OUTPUT'a ekler
//   --from <ref>      önceki etiket yerine bu commit'ten başlar
//   --version x.y.z   paketin package.json'ı yerine bu sürümü kullanır
//   --force           etiket zaten varsa da notları üretir

import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

// ---- Depoya özgü ayarlar ------------------------------------------------------

export const PACKAGES = {
  'wafixer-sdk': 'packages/wafixer-sdk',
  'n8n-nodes-wafixer': 'packages/n8n-nodes-wafixer',
};
// Paket başına etiketten önce iki paket birlikte vX.Y.Z etiketiyle yayınlanıyordu.
const LEGACY_TAG_MATCH = 'v[0-9]*';

export const AREA_ORDER = ['Paket', 'CI'];

function readVersion(root, directory) {
  return JSON.parse(readFileSync(join(root, directory, 'package.json'), 'utf8')).version;
}

export function areaOf(path) {
  const match = /^packages\/([^/]+)\//.exec(path);
  if (match) return ['Paket', match[1]];
  if (path.startsWith('.github/')) return ['CI', null];
  return null;
}

export function planRelease({ cwd, pkg, version, from, force = false }) {
  const directory = PACKAGES[pkg];
  if (!directory) throw new Error(`bilinmeyen paket: ${pkg} (${Object.keys(PACKAGES).join(', ')})`);
  const resolved = version ?? readVersion(cwd, directory);
  assertVersion(resolved);
  const tag = `${pkg}@${resolved}`;
  const base = { version: resolved, tag, title: `${pkg} ${resolved}` };
  const bump = `yeni sürüm için ${directory}/package.json sürümünü artırın.`;
  if (!force && tagExists(tag, cwd)) return { ...base, skip: true, reason: `${tag} zaten etiketli; ${bump}` };
  if (!force && tagExists(`v${resolved}`, cwd)) {
    return { ...base, skip: true, reason: `${pkg} ${resolved} eski v${resolved} etiketiyle yayınlandı; ${bump}` };
  }
  const previous = previousTag(`${pkg}@*`, tag, cwd) ?? previousTag(LEGACY_TAG_MATCH, null, cwd);
  const start = resolveStart({ cwd, from, previous, firstBase: null });
  const { commits, paths } = readHistory(start, [directory], cwd);
  const notes = renderNotes({ entries: collectEntries(commits), areas: collectAreas(paths, areaOf), areaOrder: AREA_ORDER });
  return { ...base, skip: false, from: start, commitCount: commits.length, notes };
}

function main() {
  const { values } = parseArgs({
    options: {
      package: { type: 'string' },
      out: { type: 'string' },
      'github-output': { type: 'boolean' },
      from: { type: 'string' },
      version: { type: 'string' },
      force: { type: 'boolean' },
    },
  });
  if (!values.package) throw new Error(`--package gerekli (${Object.keys(PACKAGES).join(', ')})`);
  const cwd = git(['rev-parse', '--show-toplevel'], process.cwd());
  const plan = planRelease({ cwd, pkg: values.package, version: values.version, from: values.from, force: values.force });
  report(plan, values);
}

// ---- Ortak çekirdek --------------------------------------------------------------
// wafixer.com deposundaki scripts/release-notes.mjs'nin aynı bölümünün kopyasıdır;
// değişiklik önce orada yapılır, sonra buraya taşınır.

export const GROUPS = [
  ['Yeni', ['feat']],
  ['Düzeltmeler', ['fix']],
  ['Değişiklikler', ['refactor', 'perf']],
  ['Belge ve bakım', ['docs', 'chore', 'test', 'ci']],
];
export const OTHER_GROUP = 'Diğer';
const MAINTENANCE_GROUP = 'Belge ve bakım';
export const AREAS_TITLE = 'Güncellenen alanlar';
export const MIGRATION_WARNING = 'Göç var: önce yedek, sonra uygula.';
export const EMPTY_NOTES = 'Bu sürümde listelenecek değişiklik yok.';

const MAX_ENTRIES_PER_GROUP = 40;
const MAX_AREA_DETAILS = 12;
const CONVENTIONAL = /^([a-z]+)(?:\(([^)]+)\))?(!)?:\s*(\S.*)$/i;
const AI_TRAILERS = [/^\s*co-authored-by:/i, /^\W*generated (with|by)\b/i];
const ROBOT = new RegExp(String.fromCodePoint(0x1f916), 'gu');
// Bakım commit'lerinde geçen iç süreç sözcükleri yayın notuna taşınmaz.
const INTERNAL_MAINTENANCE = /(?:^|[^\p{L}])(?:ajan|lider)/iu;
const SPECIAL_ROUTE_FILES = new Set(['index', 'page', 'layout', 'route', 'loading', 'error', 'not-found', 'template', 'default']);
const groupOfType = new Map(GROUPS.flatMap(([title, types]) => types.map((type) => [type, title])));

export function stripAiTraces(message) {
  return message
    .split(/\r?\n/)
    .filter((line) => !AI_TRAILERS.some((pattern) => pattern.test(line)))
    .map((line) => line.replace(ROBOT, '').trimEnd())
    .join('\n')
    .trim();
}

// Kod adıyla başlayan satır (chat.updatePresence, src/shared) olduğu gibi kalır.
export function capitalize(text) {
  if (!/^[a-zçğıöşü]+(?:-[a-zçğıöşü]+)*(?=[\s,;:]|$)/.test(text)) return text;
  return text.charAt(0).toLocaleUpperCase('tr-TR') + text.slice(1);
}

export function classify(line) {
  const text = line.trim();
  const match = CONVENTIONAL.exec(text);
  const group = match ? groupOfType.get(match[1].toLowerCase()) : undefined;
  if (!match || !group) return { group: OTHER_GROUP, text: capitalize(text) };
  const [, , scope, breaking, rest] = match;
  const body = scope ? `${scope}: ${rest.trim()}` : capitalize(rest.trim());
  return { group, text: breaking ? `${body} (uyumsuz değişiklik)` : body };
}

export function parseLog(raw) {
  return raw
    .split('\x1e')
    .map((record) => record.trim())
    .filter(Boolean)
    .map((record) => {
      const [subject = '', body = ''] = record.split('\x1f');
      return { subject: subject.trim(), body: body.trim() };
    });
}

// Squash birleştirmede gövdedeki "- feat: ..." maddeleri de ayrı kayıt olur.
export function collectEntries(commits) {
  const entries = [];
  for (const { subject, body = '' } of commits) {
    const lines = [stripAiTraces(subject)];
    for (const line of stripAiTraces(body).split('\n')) {
      const bullet = /^\s*[-*]\s+(.+)$/.exec(line);
      const match = bullet && CONVENTIONAL.exec(bullet[1].trim());
      if (match && groupOfType.has(match[1].toLowerCase())) lines.push(bullet[1]);
    }
    for (const entry of lines.filter(Boolean).map(classify)) {
      if (entry.group === MAINTENANCE_GROUP && INTERNAL_MAINTENANCE.test(entry.text)) continue;
      entries.push(entry);
    }
  }
  return entries;
}

// Next.js ve Expo Router'da "(grup)", "_özel" ve "[parametre]" bölümleri adres değildir.
// fileRoutes: Expo Router'da dosya adı da ekrandır (chats.tsx); Next.js'te yalnız klasör sayılır.
export function routeSegment(relativePath, { fileRoutes = false } = {}) {
  const parts = relativePath.split('/');
  const fileName = parts.pop() ?? '';
  let group = null;
  for (const part of parts) {
    const groupMatch = /^\((.+)\)$/.exec(part);
    if (groupMatch) {
      group = groupMatch[1];
      continue;
    }
    if (/^\[.*\]$/.test(part)) continue;
    if (part.startsWith('_')) return group ?? part.slice(1);
    return part;
  }
  const stem = fileName.replace(/\.[^.]+$/, '');
  if (fileRoutes && /^[a-z0-9-]+$/i.test(stem) && !SPECIAL_ROUTE_FILES.has(stem)) return stem;
  return group;
}

export function collectAreas(paths, areaOf) {
  const areas = new Map();
  for (const path of paths) {
    const hit = areaOf(path);
    if (!hit) continue;
    const [label, detail] = hit;
    if (!areas.has(label)) areas.set(label, new Set());
    if (detail) areas.get(label).add(detail);
  }
  return areas;
}

// "R100" içeriği değişmeden taşınan dosyadır; alan listesine girmez.
export function parseNameStatus(raw) {
  const paths = [];
  for (const line of raw.split(/\r?\n/)) {
    const fields = line.split('\t');
    if (fields.length < 2 || fields[0] === 'R100') continue;
    paths.push(fields[fields.length - 1]);
  }
  return paths;
}

export function renderNotes({ entries, areas = new Map(), migration = false, areaOrder = [] }) {
  const lines = migration ? [MIGRATION_WARNING, ''] : [];
  const grouped = new Map();
  for (const { group, text } of entries) {
    const list = grouped.get(group) ?? [];
    if (!list.includes(text)) list.push(text);
    grouped.set(group, list);
  }
  for (const title of [...GROUPS.map(([name]) => name), OTHER_GROUP]) {
    const list = grouped.get(title);
    if (!list) continue;
    lines.push(`## ${title}`, ...list.slice(0, MAX_ENTRIES_PER_GROUP).map((text) => `- ${text}`));
    if (list.length > MAX_ENTRIES_PER_GROUP) lines.push(`- … ve ${list.length - MAX_ENTRIES_PER_GROUP} kayıt daha`);
    lines.push('');
  }
  const rank = (label) => (areaOrder.includes(label) ? areaOrder.indexOf(label) : areaOrder.length);
  const labels = [...areas.keys()].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b, 'tr'));
  if (labels.length) {
    lines.push(`## ${AREAS_TITLE}`);
    for (const label of labels) {
      const details = [...areas.get(label)].sort((a, b) => a.localeCompare(b, 'tr'));
      let text = details.slice(0, MAX_AREA_DETAILS).join(', ');
      if (details.length > MAX_AREA_DETAILS) text += ` ve ${details.length - MAX_AREA_DETAILS} alan daha`;
      lines.push(text ? `- ${label}: ${text}` : `- ${label}`);
    }
  }
  if (!grouped.size && !labels.length) lines.push(EMPTY_NOTES);
  return `${lines.join('\n').trim()}\n`;
}

export function assertVersion(version) {
  if (typeof version !== 'string' || !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) {
    throw new Error(`geçersiz sürüm: ${version}`);
  }
}

function git(args, cwd) {
  return execFileSync('git', ['-c', 'core.quotePath=false', '-c', 'i18n.logOutputEncoding=UTF-8', ...args], {
    cwd,
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trimEnd();
}

function tryGit(args, cwd) {
  try {
    return git(args, cwd);
  } catch {
    return null;
  }
}

export function tagExists(tag, cwd) {
  return Boolean(tryGit(['tag', '--list', tag], cwd));
}

export function previousTag(match, exclude, cwd) {
  const args = ['describe', '--tags', '--abbrev=0', `--match=${match}`];
  if (exclude) args.push(`--exclude=${exclude}`);
  return tryGit([...args, 'HEAD'], cwd) || null;
}

function resolveCommit(ref, cwd) {
  return tryGit(['rev-parse', '--verify', '--quiet', `${ref}^{commit}`], cwd) || null;
}

// Sıra: --from, önceki etiket, ilk sürüm tabanı; hiçbiri yoksa bütün geçmiş (null).
export function resolveStart({ cwd, from, previous, firstBase }) {
  if (from) {
    if (!resolveCommit(from, cwd)) throw new Error(`--from bulunamadı: ${from}`);
    return from;
  }
  if (previous) return previous;
  if (!firstBase) return null;
  if (resolveCommit(firstBase, cwd)) return firstBase;
  console.error(`uyarı: ilk sürüm tabanı ${firstBase.slice(0, 7)} klonda yok; notlar bütün geçmişten üretiliyor.`);
  return null;
}

export function readHistory(from, pathspec, cwd) {
  const range = from ? `${from}..HEAD` : 'HEAD';
  const commits = parseLog(git(['log', '--no-merges', '--format=%x1e%s%x1f%b', range, '--', ...pathspec], cwd));
  const paths = from
    ? parseNameStatus(git(['diff', '--name-status', '-M', from, 'HEAD', '--', ...pathspec], cwd))
    : git(['ls-tree', '-r', '--name-only', 'HEAD', '--', ...pathspec], cwd).split('\n').filter(Boolean);
  return { commits, paths };
}

function report(plan, { out, 'github-output': githubOutput }) {
  if (githubOutput) {
    const file = process.env.GITHUB_OUTPUT;
    if (!file) throw new Error('GITHUB_OUTPUT tanımlı değil');
    const values = { skip: String(plan.skip), tag: plan.tag, title: plan.title, version: plan.version, from: plan.from ?? '' };
    appendFileSync(file, Object.entries(values).map(([key, value]) => `${key}=${value}\n`).join(''));
  }
  if (plan.skip) {
    console.error(plan.reason);
    return;
  }
  console.error(`${plan.title}: ${plan.commitCount} commit, başlangıç ${plan.from ?? 'ilk commit'}`);
  if (out) writeFileSync(out, plan.notes);
  else process.stdout.write(plan.notes);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main();
  } catch (error) {
    console.error(`release-notes: ${error instanceof Error ? error.message : error}`);
    process.exitCode = 1;
  }
}
