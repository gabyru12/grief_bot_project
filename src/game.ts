import type { Action, Content, DiskFile, DiskNode, Level } from './content/types';
import { customAsset } from './content/load';
import { el, sleep } from './dom';
import { Bus, type GameEvent } from './engine/bus';
import { TriggerRunner } from './engine/runner';
import { fill, uiText } from './engine/text';
import { saveProgress, type GameState } from './engine/state';
import { WindowManager } from './os/windows';
import { renderDesktop } from './os/desktop';
import { renderTaskbar } from './os/taskbar';
import { showToast } from './os/notifications';
import { playSound } from './os/sound';
import { STAGE_H, STAGE_W, TASKBAR_H } from './os/stage';
import { Explorer } from './apps/explorer';
import { openFileWindow } from './apps/viewers';
import { OttoChat } from './apps/otto-chat';

export interface ChapterSummary {
  chapterTitle: string;
  foundWill: boolean;
  willCarriedOut: boolean;
  filesOpened: number;
  ottoMessages: number;
  resemblance: Level;
}

interface NotifyOptions {
  from?: 'otto' | 'friend' | 'system';
  text: string;
  title?: string;
  chat?: string;
}

/**
 * One running chapter on the friend's laptop: desktop, windows, OTTO, and the
 * trigger runner that plays the writers' story files.
 */
export class Game {
  readonly bus = new Bus();
  readonly wm: WindowManager;
  readonly chat: OttoChat;
  readonly explorer: Explorer;
  /** Bumped when the chapter ends or the game is left; running action lists stop. */
  generation = 0;

  private runner: TriggerRunner;
  private listeners = new Set<() => void>();
  private desktopEl = el('div', 'desktop');
  private taskbarEl = el('div', 'taskbar');
  private toastsEl = el('div', 'toasts');
  private timers: number[] = [];
  private lastActivity = Date.now();
  private idleFired = false;
  private destroyed = false;
  private pendingDecisions = new Map<string, Promise<string>>();
  private readonly onActivity = () => {
    this.lastActivity = Date.now();
    this.idleFired = false;
  };

  constructor(
    readonly content: Content,
    private stage: HTMLElement,
    readonly state: GameState,
    private hooks: { onChapterEnd: (summary: ChapterSummary) => void },
  ) {
    const windowLayer = el('div', 'win-layer');
    const modalLayer = el('div', 'modal-layer');
    this.stage.append(this.desktopEl, windowLayer, this.taskbarEl, this.toastsEl, modalLayer);

    this.wm = new WindowManager(windowLayer, modalLayer, { w: STAGE_W, h: STAGE_H - TASKBAR_H });
    this.wm.labels = { minimise: this.ui('minimise'), close: this.ui('close') };
    this.wm.onChange = () => renderTaskbar(this, this.taskbarEl);
    this.wm.onClosed = (meta) => {
      if (!this.destroyed) this.emit({ event: 'window_closed', app: meta.app, file: meta.file });
    };

    this.chat = new OttoChat(this);
    this.explorer = new Explorer(this);
    this.runner = new TriggerRunner(content.triggers, this);
    this.bus.on((e) => this.runner.handle(e));

    this.onChange(() => {
      renderDesktop(this, this.desktopEl);
      renderTaskbar(this, this.taskbarEl);
    });
    renderDesktop(this, this.desktopEl);
    renderTaskbar(this, this.taskbarEl);

    this.stage.addEventListener('pointerdown', this.onActivity);
    window.addEventListener('keydown', this.onActivity);
    this.timers.push(window.setInterval(() => this.checkIdle(), 1000));
    this.timers.push(window.setInterval(() => renderTaskbar(this, this.taskbarEl), 30_000));
  }

  // ─── text and assets ──────────────────────────────────────────────────────

  fill(text: string, options?: { html?: boolean }): string {
    return fill(text, this.state.profile, options);
  }

  ui(key: string, vars?: Record<string, string | number>): string {
    return this.fill(uiText(this.content.ui, key, vars));
  }

  icon(key: string): string {
    const icons = this.content.theme.icons;
    return customAsset(icons[key] ?? icons.unsupported);
  }

  iconFor(node: DiskNode): string {
    return this.icon(node.type === 'folder' ? 'folder' : node.kind);
  }

  ottoLogo(): string {
    return customAsset(this.content.theme.otto_logo);
  }

  // ─── state ────────────────────────────────────────────────────────────────

  emit(e: GameEvent): void {
    if (!this.destroyed) this.bus.emit(e);
  }

  /** Subscribe to "something on the laptop changed"; returns an unsubscribe function. */
  onChange(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private changed(): void {
    for (const l of [...this.listeners]) l();
  }

  setFlag(flag: string): void {
    if (!this.state.flags.includes(flag)) this.state.flags.push(flag);
    this.changed();
  }

  /** A file or folder is visible unless it is still locked or was deleted by carrying out the will. */
  isVisible(node: DiskNode): boolean {
    if (node.unlock && !this.state.flags.includes(node.unlock)) return false;
    if (node.type === 'file' && !node.will && this.state.deletedCategories.includes(node.category)) return false;
    return true;
  }

  /** OTTO's resemblance: how many granted data categories still exist on the laptop. */
  resemblance(): Level {
    const available = this.state.granted.filter((c) => !this.state.deletedCategories.includes(c)).length;
    const { medium, high } = this.content.settings.resemblance;
    if (available >= high) return 'high';
    if (available >= medium) return 'medium';
    return 'low';
  }

  /** Evaluates a trigger's "if:" block. */
  check(condition: Record<string, unknown>): boolean {
    const list = (v: unknown) => (Array.isArray(v) ? v.map(String) : [String(v)]);
    for (const [key, value] of Object.entries(condition)) {
      switch (key) {
        case 'flag':
          if (!list(value).every((f) => this.state.flags.includes(f))) return false;
          break;
        case 'not_flag':
          if (list(value).some((f) => this.state.flags.includes(f))) return false;
          break;
        case 'chapter':
          if (this.state.chapter !== value) return false;
          break;
        case 'decision': {
          const v = value as { decision?: string; is?: string };
          if (!v?.decision || this.state.decisions[v.decision]?.final !== v.is) return false;
          break;
        }
        case 'resemblance':
          if (this.resemblance() !== value) return false;
          break;
        case 'otto_installed':
          if (this.state.ottoInstalled !== Boolean(value)) return false;
          break;
        default:
          console.warn(`Unknown condition "${key}" in triggers.yaml`);
          return false;
      }
    }
    return true;
  }

  // ─── chapters ─────────────────────────────────────────────────────────────

  startChapter(id: string, boot = false): void {
    const chapter = this.content.chapters.find((c) => c.id === id);
    if (!chapter) {
      console.warn(`Chapter "${id}" does not exist`);
      return;
    }
    this.state.chapter = id;
    if (chapter.start?.otto_installed !== undefined) this.state.ottoInstalled = chapter.start.otto_installed;
    if (chapter.start?.granted) this.state.granted = [...chapter.start.granted];
    this.setFlag(id);
    saveProgress(this.state);

    const begin = () => this.emit({ event: 'chapter_started', chapter: id });
    if (!boot) {
      begin();
      return;
    }
    const screen = el('div', 'boot');
    screen.append(el('div', 'boot-name', this.content.theme.os_name), el('div', 'boot-text', this.ui('booting')));
    this.stage.append(screen);
    const generation = this.generation;
    setTimeout(() => {
      screen.classList.add('out');
      setTimeout(() => {
        screen.remove();
        if (generation === this.generation) begin();
      }, 500);
    }, 1400);
  }

  endChapter(): void {
    const chapter = this.content.chapters.find((c) => c.id === this.state.chapter);
    const willFiles = Object.values(this.content.disk).filter((n): n is DiskFile => n.type === 'file' && n.will);
    const summary: ChapterSummary = {
      chapterTitle: chapter?.title ?? this.state.chapter,
      foundWill: willFiles.some((f) => this.state.opened.includes(f.path)),
      willCarriedOut: this.state.willCarriedOut !== null,
      filesOpened: this.state.opened.length,
      ottoMessages: this.state.chatLog.filter((l) => l.speaker !== 'player').length,
      resemblance: this.resemblance(),
    };
    this.generation++;
    this.hooks.onChapterEnd(summary);
  }

  // ─── apps ─────────────────────────────────────────────────────────────────

  openApp(name: string, arg?: string): void {
    if (name === 'explorer') this.explorer.open(arg ?? '');
    else if (name === 'otto' && this.state.ottoInstalled) this.chat.open();
  }

  openFile(path: string): void {
    const node = this.content.disk[path.normalize('NFC')];
    if (!node) {
      console.warn(`File "${path}" does not exist`);
      return;
    }
    if (node.type === 'folder') {
      this.openApp('explorer', node.path);
      return;
    }
    if (!this.isVisible(node)) return;
    if (node.kind === 'unsupported') {
      playSound('error');
      void this.message(this.ui('cannot_open_title'), this.ui('cannot_open', { file: node.name }));
      return;
    }
    openFileWindow(this, node);
    if (!this.state.opened.includes(node.path)) this.state.opened.push(node.path);
    this.emit({ event: 'file_opened', file: node.path, kind: node.kind });
  }

  notify(opts: NotifyOptions): void {
    const from = opts.from ?? 'otto';
    const theme = this.content.theme;
    const title =
      opts.title ? this.fill(opts.title)
      : from === 'friend' ? `${this.state.profile.friend.name} · ${theme.otto_name}`
      : from === 'otto' ? theme.otto_name
      : theme.os_name;
    playSound('chime');
    showToast(this.toastsEl, {
      icon: from === 'system' ? this.icon('computer') : this.ottoLogo(),
      title,
      text: this.fill(opts.text),
      onClick: () => {
        if (opts.chat) this.chat.openAt(opts.chat);
        else if (from !== 'system') this.openApp('otto');
      },
    });
  }

  /** A simple message box with an OK button. */
  message(title: string, text: string): Promise<void> {
    return new Promise((resolve) => {
      const id = `message:${Date.now()}`;
      const box = el('div', 'decision');
      box.append(el('p', 'decision-text', this.fill(text)));
      const actions = el('div', 'decision-options');
      const ok = el('button', 'btn', this.ui('ok'));
      ok.addEventListener('click', () => {
        this.wm.close(id);
        resolve();
      });
      actions.append(ok);
      box.append(actions);
      this.wm.open({ id, title: this.fill(title), width: 380, content: box, modal: true, closable: false });
      ok.focus();
    });
  }

  /** Shows a decision from decisions.yaml; resolves with the chosen option id. */
  askDecision(id: string): Promise<string> {
    const pending = this.pendingDecisions.get(id);
    if (pending) return pending;
    const decision = this.content.decisions[id];
    if (!decision) {
      console.warn(`Decision "${id}" does not exist`);
      return Promise.resolve('');
    }
    const windowId = `decision:${id}`;
    const promise = new Promise<string>((resolve) => {
      const box = el('div', 'decision');
      if (decision.text) box.append(el('p', 'decision-text', this.fill(decision.text)));
      const options = el('div', 'decision-options');
      for (const option of decision.options) {
        const button = el('button', 'btn decision-btn', this.fill(option.label));
        button.addEventListener('click', () => {
          const previous = this.state.decisions[id];
          this.state.decisions[id] = { first: previous?.first ?? option.id, final: option.id };
          const finish = () => {
            this.wm.close(windowId);
            this.pendingDecisions.delete(id);
            resolve(option.id);
            this.emit({ event: 'decision_made', decision: id, option: option.id });
          };
          if (!option.consequence) {
            finish();
            return;
          }
          const ok = el('button', 'btn', this.ui('ok'));
          ok.addEventListener('click', finish);
          const okRow = el('div', 'decision-options');
          okRow.append(ok);
          box.replaceChildren(el('p', 'decision-consequence', this.fill(option.consequence)), okRow);
          ok.focus();
        });
        options.append(button);
      }
      box.append(options);
      this.wm.open({ id: windowId, title: this.fill(decision.title), width: 460, content: box, modal: true, closable: false });
    });
    this.pendingDecisions.set(id, promise);
    return promise;
  }

  /** Deletes every data category the will does not allow to keep. */
  carryOutWill(): void {
    if (this.state.willCarriedOut) return;
    const keep = new Set([...this.content.settings.will_keeps, 'none']);
    const files = Object.values(this.content.disk).filter((n): n is DiskFile => n.type === 'file');
    this.state.deletedCategories = [...new Set(files.map((f) => f.category))].filter((c) => !keep.has(c));
    this.state.willCarriedOut = this.state.ottoInstalled ? 'after_install' : 'before_install';
    for (const f of files) {
      if (!this.isVisible(f)) this.wm.close(`file:${f.path}`, true);
    }
    this.changed();
    this.emit({ event: 'will_carried_out' });
  }

  // ─── actions from the story files ─────────────────────────────────────────

  async runActions(actions: Action[] | undefined, where: string): Promise<void> {
    const generation = this.generation;
    for (const action of actions ?? []) {
      if (generation !== this.generation || this.destroyed) return;
      const [name, value] = typeof action === 'string' ? [action, undefined] : (Object.entries(action)[0] ?? []);
      try {
        switch (name) {
          case 'wait':
            await sleep(Number(value) * 1000);
            break;
          case 'set_flag':
            this.setFlag(String(value));
            break;
          case 'start_chapter':
            this.startChapter(String(value));
            break;
          case 'open_app':
            this.openApp(String(value));
            break;
          case 'open_file':
            this.openFile(String(value));
            break;
          case 'close_app': {
            const target = String(value);
            this.wm.close(target === 'otto' || target === 'explorer' ? target : `file:${target.normalize('NFC')}`);
            break;
          }
          case 'notify':
            this.notify(value as NotifyOptions);
            break;
          case 'show_message': {
            const v = value as { title?: string; text?: string };
            await this.message(v.title ?? '', v.text ?? '');
            break;
          }
          case 'start_chat':
            this.chat.openAt(String(value));
            break;
          case 'ask_decision':
            await this.askDecision(String(value));
            break;
          case 'play_sound':
            playSound(String(value));
            break;
          case 'carry_out_will':
            this.carryOutWill();
            break;
          case 'end_chapter':
            this.endChapter();
            break;
          default:
            console.warn(`Unknown action "${name}" in ${where}`);
        }
      } catch (err) {
        console.error(`Action "${name}" failed in ${where}`, err);
      }
    }
  }

  // ─── idle and cleanup ─────────────────────────────────────────────────────

  private checkIdle(): void {
    const limit = this.content.settings.idle_seconds * 1000;
    if (this.idleFired || Date.now() - this.lastActivity < limit) return;
    this.idleFired = true;
    this.emit({ event: 'idle', seconds: this.content.settings.idle_seconds });
  }

  destroy(): void {
    this.destroyed = true;
    this.generation++;
    for (const t of this.timers) clearInterval(t);
    this.stage.removeEventListener('pointerdown', this.onActivity);
    window.removeEventListener('keydown', this.onActivity);
    this.wm.closeAll();
    this.listeners.clear();
  }
}
