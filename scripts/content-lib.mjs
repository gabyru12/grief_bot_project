// Builds the game's content.
//
// Reads content/<lang>/ (the laptop's disk, the story YAML files, the UI strings)
// and customization/ (theme, icons, logo), checks every reference, and writes:
//   public/generated/content.<lang>.json   ← what the game loads
//   public/generated/disk/<lang>/…         ← images, audio and video from the disk
//   public/generated/customization/…       ← icons and logo
//   public/generated/manifest.json         ← which languages exist
//
// Problems are reported in plain English. Errors stop "npm run build"; warnings don't.

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { load as parseYaml } from 'js-yaml';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT_DIR = path.join(ROOT, 'content');
const CUSTOM_DIR = path.join(ROOT, 'customization');
const OUT_DIR = path.join(ROOT, 'public', 'generated');

const KIND_BY_EXTENSION = {
  '.txt': 'text',
  '.jpg': 'image',
  '.jpeg': 'image',
  '.png': 'image',
  '.webp': 'image',
  '.svg': 'image',
  '.mp3': 'audio',
  '.mp4': 'video',
};
const MEDIA_KINDS = new Set(['image', 'audio', 'video']);
const DEFAULT_CATEGORY = {
  image: 'photos',
  audio: 'voice',
  video: 'video',
  text: 'documents',
  document: 'documents',
  unsupported: 'documents',
};

const EVENTS = ['chapter_started', 'file_opened', 'window_closed', 'idle', 'chat_reply', 'decision_made', 'will_carried_out'];
const ACTIONS = [
  'set_flag', 'start_chapter', 'open_app', 'open_file', 'close_app', 'notify', 'show_message',
  'start_chat', 'ask_decision', 'play_sound', 'wait', 'carry_out_will', 'end_chapter',
];
const ACTIONS_WITHOUT_VALUE = ['carry_out_will', 'end_chapter'];
const APPS = ['explorer', 'otto'];
const SOUNDS = ['chime', 'error', 'click'];
const TOKEN_KEYS = ['name', 'they', 'them', 'their', 'theirs', 'themself', 'is', 'was', 'has'];

/**
 * @param {{ write?: boolean, quiet?: boolean }} [options]
 * @returns {Promise<{ problems: {level: string, where: string, message: string}[], errors: object[] }>}
 */
export async function buildContent({ write = true, quiet = false } = {}) {
  const problems = [];
  const report = (level, where, message) => problems.push({ level, where, message });

  const settings = (await readYaml(path.join(CONTENT_DIR, 'settings.yaml'), report)) ?? {};
  const theme = (await readYaml(path.join(CUSTOM_DIR, 'theme.yaml'), report)) ?? {};
  checkSettings(settings, report);
  checkTheme(theme, report);

  const langs = existsSync(CONTENT_DIR)
    ? (await fs.readdir(CONTENT_DIR, { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name).sort()
    : [];
  if (!langs.includes('en')) {
    report('error', 'content/', 'There is no "en" folder. English is the reference language and must exist.');
  }

  if (write) {
    await fs.rm(OUT_DIR, { recursive: true, force: true });
    await fs.mkdir(OUT_DIR, { recursive: true });
  }

  for (const lang of langs) {
    const bundle = await buildLanguage(lang, { settings, theme, report, write });
    if (write) await fs.writeFile(path.join(OUT_DIR, `content.${lang}.json`), JSON.stringify(bundle));
  }

  if (write) {
    await fs.cp(CUSTOM_DIR, path.join(OUT_DIR, 'customization'), {
      recursive: true,
      filter: (src) => !src.toLowerCase().endsWith('.yaml'),
    });
    await fs.writeFile(path.join(OUT_DIR, 'manifest.json'), JSON.stringify({ langs }));
  }

  if (!quiet) printReport(problems);
  return { problems, errors: problems.filter((p) => p.level === 'error') };
}

// ─── one language ───────────────────────────────────────────────────────────

async function buildLanguage(lang, { settings, theme, report, write }) {
  const readLang = async (relPath) => {
    const own = path.join(CONTENT_DIR, lang, relPath);
    if (existsSync(own) || lang === 'en') return readYaml(own, report);
    report('warning', `content/${lang}/${relPath}`, `This file is missing, so the English version is used instead.`);
    return readYaml(path.join(CONTENT_DIR, 'en', relPath), report);
  };

  const ui = (await readLang('ui.yaml')) ?? {};
  const chapters = asList(await readLang('story/chapters.yaml'), `content/${lang}/story/chapters.yaml`, report);
  const triggers = asList(await readLang('story/triggers.yaml'), `content/${lang}/story/triggers.yaml`, report);
  const chatList = asList(await readLang('story/chat.yaml'), `content/${lang}/story/chat.yaml`, report);
  const decisionList = asList(await readLang('story/decisions.yaml'), `content/${lang}/story/decisions.yaml`, report);

  // The laptop's disk
  let diskLang = lang;
  if (!existsSync(path.join(CONTENT_DIR, lang, 'disk'))) {
    if (lang !== 'en') report('warning', `content/${lang}/disk/`, 'This folder is missing, so the English disk is used instead.');
    diskLang = 'en';
  }
  const disk = {
    '': { type: 'folder', name: ui.this_laptop ?? 'This laptop', path: '', children: [], unlock: null },
  };
  const diskRoot = path.join(CONTENT_DIR, diskLang, 'disk');
  if (existsSync(diskRoot)) {
    await walkDisk({ lang: diskLang, absDir: diskRoot, relPath: '', disk, settings, report, write });
  } else {
    report('error', `content/${diskLang}/disk/`, 'The laptop\'s disk folder does not exist.');
  }

  const chat = toMap(chatList, `content/${lang}/story/chat.yaml`, report);
  const decisions = toMap(decisionList, `content/${lang}/story/decisions.yaml`, report);

  validateStory({ lang, disk, chapters, triggers, chat, decisions, report });
  checkAllTokens({ lang, ui, disk, triggers, chat, decisions, report });

  return { lang, ui, settings, theme, disk, chapters, triggers, chat, decisions };
}

async function walkDisk({ lang, absDir, relPath, disk, settings, report, write }) {
  const where = `content/${lang}/disk/${relPath}`;
  const entries = (await fs.readdir(absDir, { withFileTypes: true }))
    .filter((e) => !e.name.startsWith('.'))
    .sort((a, b) =>
      a.isDirectory() === b.isDirectory() ? a.name.localeCompare(b.name, 'pt') : a.isDirectory() ? -1 : 1,
    );

  let meta = {};
  if (entries.some((e) => e.name === '_meta.yaml')) {
    meta = (await readYaml(path.join(absDir, '_meta.yaml'), report)) ?? {};
  }
  const folder = disk[relPath];
  if (meta.folder?.unlock) folder.unlock = String(meta.folder.unlock);

  const seen = new Set();
  for (const entry of entries) {
    if (entry.name === '_meta.yaml') continue;
    const name = entry.name.normalize('NFC');
    const abs = path.join(absDir, entry.name);

    if (entry.isDirectory()) {
      const childPath = join(relPath, name);
      disk[childPath] = { type: 'folder', name, path: childPath, children: [], unlock: null };
      folder.children.push(childPath);
      await walkDisk({ lang, absDir: abs, relPath: childPath, disk, settings, report, write });
      continue;
    }

    let display = name;
    let kind;
    if (name.toLowerCase().endsWith('.pdf.md')) {
      display = name.slice(0, -3);
      kind = 'document';
    } else {
      kind = KIND_BY_EXTENSION[path.extname(name).toLowerCase()] ?? 'unsupported';
    }
    const childPath = join(relPath, display);
    const fileMeta = meta.files?.[display] ?? meta.files?.[name] ?? {};
    seen.add(display);
    seen.add(name);

    const category = fileMeta.category ? String(fileMeta.category) : DEFAULT_CATEGORY[kind];
    if (category !== 'none' && Array.isArray(settings.categories) && !settings.categories.includes(category)) {
      report('warning', `${where}/_meta.yaml`, `"${display}" has the category "${category}", which is not listed in content/settings.yaml → categories.`);
    }

    const node = {
      type: 'file',
      name: display,
      path: childPath,
      kind,
      category,
      memory: Boolean(fileMeta.memory),
      will: Boolean(fileMeta.will),
      evidence: fileMeta.evidence ? String(fileMeta.evidence) : null,
      unlock: fileMeta.unlock ? String(fileMeta.unlock) : null,
    };

    if (kind === 'text') {
      node.text = stripBom(await fs.readFile(abs, 'utf8'));
    } else if (kind === 'document') {
      node.html = markdownToHtml(stripBom(await fs.readFile(abs, 'utf8')));
    } else if (MEDIA_KINDS.has(kind)) {
      const segments = childPath.split('/');
      node.src = ['generated', 'disk', lang, ...segments].map(encodeURIComponent).join('/');
      const stat = await fs.stat(abs);
      if (stat.size > 10 * 1024 * 1024) {
        report('warning', `${where}/${name}`, `This file is ${(stat.size / 1048576).toFixed(1)} MB. Please keep media files under 10 MB so the game loads quickly.`);
      }
      if (write) {
        const out = path.join(OUT_DIR, 'disk', lang, ...segments);
        await fs.mkdir(path.dirname(out), { recursive: true });
        await fs.copyFile(abs, out);
      }
    }

    disk[childPath] = node;
    folder.children.push(childPath);
  }

  for (const key of Object.keys(meta.files ?? {})) {
    if (!seen.has(key.normalize('NFC'))) {
      report('warning', `${where}/_meta.yaml`, `It mentions "${key}", but there is no file with that name in this folder. Check the spelling (accents count).`);
    }
  }
}

// ─── checks ─────────────────────────────────────────────────────────────────

function validateStory({ lang, disk, chapters, triggers, chat, decisions, report }) {
  const chapterIds = new Set(chapters.map((c) => c?.id));
  const fileExists = (p) => typeof p === 'string' && disk[p.normalize('NFC')] !== undefined;
  const story = (file) => `content/${lang}/story/${file}`;

  for (const ch of chapters) {
    if (!ch?.id) report('error', story('chapters.yaml'), 'A chapter has no "id".');
    if (!ch?.title) report('warning', story('chapters.yaml'), `Chapter "${ch?.id}" has no "title".`);
  }

  const checkAction = (action, where) => {
    if (typeof action === 'string') {
      if (!ACTIONS_WITHOUT_VALUE.includes(action)) {
        report('error', where, `"${action}" is not an action that can stand alone. Actions look like "- wait: 2". Allowed on their own: ${ACTIONS_WITHOUT_VALUE.join(', ')}.`);
      }
      return;
    }
    if (!action || typeof action !== 'object') {
      report('error', where, 'An action line is empty or not understood.');
      return;
    }
    const keys = Object.keys(action);
    if (keys.length !== 1) {
      report('error', where, `Each action line must contain exactly one action (found: ${keys.join(', ') || 'none'}). Put each action on its own "- " line.`);
      return;
    }
    const [name] = keys;
    const value = action[name];
    if (!ACTIONS.includes(name)) {
      report('error', where, `"${name}" is not a known action. Known actions: ${ACTIONS.join(', ')}.`);
      return;
    }
    switch (name) {
      case 'wait':
        if (typeof value !== 'number' || value < 0) report('error', where, '"wait" needs a number of seconds, e.g. "- wait: 2".');
        break;
      case 'open_file':
        if (!fileExists(value)) report('error', where, `"open_file" points to "${value}", which does not exist in content/${lang}/disk/. Check the spelling (accents and capital letters count).`);
        break;
      case 'open_app':
        if (!APPS.includes(value)) report('error', where, `"open_app" must be one of: ${APPS.join(', ')}.`);
        break;
      case 'close_app':
        if (!APPS.includes(value) && !fileExists(value)) report('error', where, `"close_app" must be ${APPS.join(' or ')}, or the path of a file on the disk.`);
        break;
      case 'notify':
        if (!value?.text) report('error', where, '"notify" needs a "text".');
        if (value?.from && !['otto', 'friend', 'system'].includes(value.from)) report('error', where, '"notify" → "from" must be otto, friend or system.');
        if (value?.chat && !chat[value.chat]) report('error', where, `"notify" opens the chat message "${value.chat}", which does not exist in chat.yaml.`);
        break;
      case 'show_message':
        if (!value?.text) report('error', where, '"show_message" needs a "text".');
        break;
      case 'start_chat':
        if (!chat[value]) report('error', where, `"start_chat" points to "${value}", which does not exist in chat.yaml.`);
        break;
      case 'ask_decision':
        if (!decisions[value]) report('error', where, `"ask_decision" points to "${value}", which does not exist in decisions.yaml.`);
        break;
      case 'start_chapter':
        if (!chapterIds.has(value)) report('error', where, `"start_chapter" points to "${value}", which is not in chapters.yaml.`);
        break;
      case 'play_sound':
        if (!SOUNDS.includes(value)) report('warning', where, `"play_sound" knows these sounds: ${SOUNDS.join(', ')}.`);
        break;
      default:
        break;
    }
  };

  const allOptionIds = new Set(Object.values(decisions).flatMap((d) => (d.options ?? []).map((o) => o.id)));

  for (const t of triggers) {
    const where = `${story('triggers.yaml')} → trigger "${t?.id ?? '(no id)'}"`;
    if (!t?.id) report('error', where, 'This trigger has no "id".');
    const when = t?.when;
    if (!when?.event) {
      report('error', where, 'This trigger needs "when: { event: … }".');
    } else {
      if (!EVENTS.includes(when.event)) report('error', where, `"${when.event}" is not a known event. Known events: ${EVENTS.join(', ')}.`);
      if (when.file !== undefined && !fileExists(when.file)) report('error', where, `"when → file" is "${when.file}", which does not exist in content/${lang}/disk/. Check the spelling (accents and capital letters count).`);
      if (when.chapter !== undefined && !chapterIds.has(when.chapter)) report('error', where, `"when → chapter" is "${when.chapter}", which is not in chapters.yaml.`);
      if (when.decision !== undefined && !decisions[when.decision]) report('error', where, `"when → decision" is "${when.decision}", which is not in decisions.yaml.`);
      if (when.option !== undefined && !allOptionIds.has(when.option)) report('error', where, `"when → option" is "${when.option}", which is not an option in decisions.yaml.`);
    }
    if (t?.if?.decision?.decision && !decisions[t.if.decision.decision]) report('error', where, `"if → decision" mentions "${t.if.decision.decision}", which is not in decisions.yaml.`);
    if (!Array.isArray(t?.do) || t.do.length === 0) report('error', where, 'This trigger needs a "do:" list with at least one action.');
    else t.do.forEach((a) => checkAction(a, where));
  }

  for (const node of Object.values(chat)) {
    const where = `${story('chat.yaml')} → "${node.id}"`;
    if (!['friend', 'otto'].includes(node.speaker)) report('error', where, '"speaker" must be "friend" (OTTO speaking as the friend) or "otto" (OTTO the product).');
    if (!node.text) report('error', where, 'This message has no "text".');
    else if (typeof node.text === 'object' && !node.text.low && !node.text.medium && !node.text.high) {
      report('error', where, '"text" must be a sentence, or low / medium / high versions.');
    }
    for (const r of node.replies ?? []) {
      if (!r.id) report('error', where, 'A reply has no "id".');
      if (!r.text) report('error', where, `Reply "${r.id}" has no "text".`);
      if (r.next && !chat[r.next]) report('error', where, `Reply "${r.id}" goes to "${r.next}", which does not exist in chat.yaml.`);
    }
    (node.do ?? []).forEach((a) => checkAction(a, where));
  }

  for (const d of Object.values(decisions)) {
    const where = `${story('decisions.yaml')} → "${d.id}"`;
    if (!d.title) report('error', where, 'This decision has no "title".');
    const options = d.options ?? [];
    if (options.length < 2 || options.length > 4) report('error', where, 'A decision needs between 2 and 4 options.');
    const ids = new Set();
    for (const o of options) {
      if (!o.id || !o.label) report('error', where, 'Every option needs an "id" and a "label".');
      if (ids.has(o.id)) report('error', where, `The option id "${o.id}" is used twice.`);
      ids.add(o.id);
    }
  }
}

function checkAllTokens({ lang, ui, disk, triggers, chat, decisions, report }) {
  const visit = (value, where) => {
    if (typeof value === 'string') checkTokens(value, where, report);
    else if (Array.isArray(value)) value.forEach((v) => visit(v, where));
    else if (value && typeof value === 'object') Object.values(value).forEach((v) => visit(v, where));
  };
  visit(ui, `content/${lang}/ui.yaml`);
  visit(triggers, `content/${lang}/story/triggers.yaml`);
  visit(chat, `content/${lang}/story/chat.yaml`);
  visit(decisions, `content/${lang}/story/decisions.yaml`);
  for (const node of Object.values(disk)) {
    if (node.type === 'file' && (node.text || node.html)) visit(node.text ?? node.html, `content/${lang}/disk/${node.path}`);
  }
}

function checkTokens(text, where, report) {
  const re = /\{\s*(player|friend)\b([^}]*)\}/gi;
  let m;
  while ((m = re.exec(text))) {
    const rest = m[2].trim();
    if (rest.startsWith('.')) {
      const key = rest.slice(1).trim().toLowerCase();
      if (!TOKEN_KEYS.includes(key)) {
        report('error', where, `"${m[0]}" is not a known token. Known: ${TOKEN_KEYS.map((k) => `{${m[1]}.${k}}`).join(', ')}.`);
      }
    } else if (rest.startsWith(':')) {
      const parts = rest.slice(1).split('|');
      if (parts.length !== 3) {
        report('error', where, `"${m[0]}" must have exactly 3 versions separated by "|": she | he | they (it has ${parts.length}).`);
      }
    } else {
      report('error', where, `"${m[0]}" is not understood. Use {${m[1]}.name}, {${m[1]}.they}, … or {${m[1]}: she version | he version | they version}.`);
    }
  }
}

function checkSettings(s, report) {
  const where = 'content/settings.yaml';
  if (!Array.isArray(s.categories)) report('error', where, '"categories" must be a list, e.g. [photos, chats, diary].');
  if (!Array.isArray(s.will_keeps)) report('error', where, '"will_keeps" must be a list, e.g. [photos].');
  if (typeof s.resemblance?.medium !== 'number' || typeof s.resemblance?.high !== 'number') {
    report('error', where, '"resemblance" needs "medium" and "high" numbers.');
  }
  if (typeof s.idle_seconds !== 'number') report('error', where, '"idle_seconds" must be a number.');
}

function checkTheme(theme, report) {
  const where = 'customization/theme.yaml';
  const files = { otto_logo: theme.otto_logo, ...Object.fromEntries(Object.entries(theme.icons ?? {}).map(([k, v]) => [`icons → ${k}`, v])) };
  for (const [key, file] of Object.entries(files)) {
    if (!file) report('error', where, `"${key}" is empty.`);
    else if (!existsSync(path.join(CUSTOM_DIR, file))) report('error', where, `"${key}" points to "${file}", but that file does not exist in customization/.`);
  }
  for (const needed of ['folder', 'text', 'document', 'image', 'audio', 'video', 'unsupported', 'computer']) {
    if (!theme.icons?.[needed]) report('error', where, `"icons" needs an entry for "${needed}".`);
  }
}

// ─── helpers ────────────────────────────────────────────────────────────────

async function readYaml(file, report) {
  const where = path.relative(ROOT, file).split(path.sep).join('/');
  let text;
  try {
    text = stripBom(await fs.readFile(file, 'utf8'));
  } catch {
    report('error', where, 'This file is missing.');
    return null;
  }
  try {
    return parseYaml(text);
  } catch (err) {
    const line = err.mark ? `Line ${err.mark.line + 1}: ` : '';
    report('error', where, `${line}the file could not be read (${err.reason ?? err.message}). Check the indentation and that text containing ":" is inside quotes.`);
    return null;
  }
}

function asList(value, where, report) {
  if (value == null) return [];
  if (!Array.isArray(value)) {
    report('error', where, 'This file must be a list: every item starts with "- ".');
    return [];
  }
  return value;
}

function toMap(list, where, report) {
  const map = {};
  for (const item of list) {
    if (!item?.id) {
      report('error', where, 'An item has no "id".');
      continue;
    }
    if (map[item.id]) report('error', where, `The id "${item.id}" is used twice.`);
    map[item.id] = item;
  }
  return map;
}

function join(dir, name) {
  return dir ? `${dir}/${name}` : name;
}

function stripBom(text) {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

function printReport(problems) {
  const errors = problems.filter((p) => p.level === 'error');
  const warnings = problems.filter((p) => p.level === 'warning');
  for (const p of [...errors, ...warnings]) {
    console.log(`${p.level === 'error' ? 'ERROR  ' : 'WARNING'}  ${p.where}\n         ${p.message}`);
  }
  if (problems.length === 0) console.log('Content check: no problems found.');
  else console.log(`Content check: ${errors.length} error(s), ${warnings.length} warning(s).`);
}

// ─── a small Markdown converter for the "PDF" documents ─────────────────────
// Supports: # headings, paragraphs, **bold**, *italic*, - lists, 1. lists, > quotes, --- lines.

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function inline(s) {
  return escapeHtml(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*(?!\s)(.+?)\*/g, '$1<em>$2</em>');
}

export function markdownToHtml(src) {
  const out = [];
  let paragraph = [];
  let list = null;
  const flush = () => {
    if (paragraph.length) out.push(`<p>${paragraph.map(inline).join('<br>')}</p>`);
    paragraph = [];
  };
  const closeList = () => {
    if (list) out.push(`</${list}>`);
    list = null;
  };
  const openList = (type) => {
    if (list !== type) {
      closeList();
      out.push(`<${type}>`);
      list = type;
    }
  };

  for (const raw of src.replace(/\r\n?/g, '\n').split('\n')) {
    const line = raw.trimEnd();
    let m;
    if (!line.trim()) {
      flush();
      closeList();
    } else if ((m = line.match(/^(#{1,3})\s+(.*)$/))) {
      flush();
      closeList();
      out.push(`<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`);
    } else if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) {
      flush();
      closeList();
      out.push('<hr>');
    } else if ((m = line.match(/^\s*[-*]\s+(.*)$/))) {
      flush();
      openList('ul');
      out.push(`<li>${inline(m[1])}</li>`);
    } else if ((m = line.match(/^\s*\d+[.)]\s+(.*)$/))) {
      flush();
      openList('ol');
      out.push(`<li>${inline(m[1])}</li>`);
    } else if ((m = line.match(/^>\s?(.*)$/))) {
      flush();
      closeList();
      out.push(`<blockquote>${inline(m[1])}</blockquote>`);
    } else {
      closeList();
      paragraph.push(line.trim());
    }
  }
  flush();
  closeList();
  return out.join('\n');
}
