import { el, img } from '../dom';
import { getScale } from './stage';

export interface WindowMeta {
  app: string;
  file?: string;
}

export interface WindowOptions {
  id: string;
  title: string;
  icon?: string;
  width: number;
  height?: number;
  x?: number;
  y?: number;
  content: HTMLElement;
  /** Blocks the rest of the desktop until closed (decisions, messages). */
  modal?: boolean;
  closable?: boolean;
  className?: string;
  meta?: WindowMeta;
  onClose?: () => void;
}

interface Win {
  opts: WindowOptions;
  el: HTMLElement;
  titleEl: HTMLElement;
  overlay?: HTMLElement;
  minimized: boolean;
}

export interface WindowSummary {
  id: string;
  title: string;
  icon?: string;
  minimized: boolean;
  focused: boolean;
}

export class WindowManager {
  private wins = new Map<string, Win>();
  private z = 10;
  private cascade = 0;
  private focusedId: string | null = null;
  labels = { minimise: 'Minimise', close: 'Close' };

  /** Called whenever the list of windows or the focus changes (the taskbar listens). */
  onChange: () => void = () => {};
  /** Called after a window is closed. */
  onClosed: (meta: WindowMeta, id: string) => void = () => {};

  constructor(
    private layer: HTMLElement,
    private modalLayer: HTMLElement,
    private area: { w: number; h: number },
  ) {}

  has(id: string): boolean {
    return this.wins.has(id);
  }

  list(): WindowSummary[] {
    return [...this.wins.values()]
      .filter((w) => !w.opts.modal)
      .map((w) => ({
        id: w.opts.id,
        title: w.opts.title,
        icon: w.opts.icon,
        minimized: w.minimized,
        focused: this.focusedId === w.opts.id,
      }));
  }

  open(opts: WindowOptions): HTMLElement {
    const existing = this.wins.get(opts.id);
    if (existing) {
      this.restore(opts.id);
      return existing.el;
    }

    const win = el('div', `win${opts.className ? ` ${opts.className}` : ''}`);
    win.style.width = `${opts.width}px`;
    if (opts.height) win.style.height = `${opts.height}px`;
    win.setAttribute('role', 'dialog');

    const bar = el('div', 'win-titlebar');
    if (opts.icon) bar.append(img(opts.icon, 'win-icon'));
    const titleEl = el('span', 'win-title', opts.title);
    bar.append(titleEl);
    const buttons = el('div', 'win-buttons');
    if (!opts.modal) {
      const min = el('button', 'win-btn', '_');
      min.title = this.labels.minimise;
      min.setAttribute('aria-label', this.labels.minimise);
      min.addEventListener('click', (e) => {
        e.stopPropagation();
        this.minimize(opts.id);
      });
      buttons.append(min);
    }
    if (opts.closable !== false) {
      const close = el('button', 'win-btn', '×');
      close.title = this.labels.close;
      close.setAttribute('aria-label', this.labels.close);
      close.addEventListener('click', (e) => {
        e.stopPropagation();
        this.close(opts.id);
      });
      buttons.append(close);
    }
    bar.append(buttons);

    const body = el('div', 'win-body');
    body.append(opts.content);
    win.append(bar, body);

    const record: Win = { opts, el: win, titleEl, minimized: false };
    if (opts.modal) {
      const overlay = el('div', 'modal-overlay');
      overlay.append(win);
      this.modalLayer.append(overlay);
      record.overlay = overlay;
    } else {
      const h = opts.height ?? 400;
      const step = this.cascade++ % 8;
      const x = opts.x ?? Math.min(90 + step * 28, this.area.w - opts.width - 10);
      const y = opts.y ?? Math.min(24 + step * 24, this.area.h - h - 10);
      win.style.left = `${Math.max(0, x)}px`;
      win.style.top = `${Math.max(0, y)}px`;
      this.layer.append(win);
      this.makeDraggable(win, bar);
      win.addEventListener('pointerdown', () => this.focus(opts.id));
    }

    this.wins.set(opts.id, record);
    this.focus(opts.id);
    return win;
  }

  setTitle(id: string, title: string): void {
    const w = this.wins.get(id);
    if (!w || w.opts.title === title) return;
    w.opts.title = title;
    w.titleEl.textContent = title;
    this.onChange();
  }

  close(id: string, silent = false): void {
    const w = this.wins.get(id);
    if (!w) return;
    this.wins.delete(id);
    (w.overlay ?? w.el).remove();
    if (this.focusedId === id) this.focusedId = null;
    w.opts.onClose?.();
    this.onChange();
    if (!silent && w.opts.meta) this.onClosed(w.opts.meta, id);
  }

  closeAll(): void {
    for (const id of [...this.wins.keys()]) this.close(id, true);
  }

  minimize(id: string): void {
    const w = this.wins.get(id);
    if (!w || w.opts.modal) return;
    w.minimized = true;
    w.el.hidden = true;
    if (this.focusedId === id) this.focusedId = null;
    w.el.classList.remove('focused');
    this.onChange();
  }

  restore(id: string): void {
    const w = this.wins.get(id);
    if (!w) return;
    w.minimized = false;
    w.el.hidden = false;
    this.focus(id);
  }

  focus(id: string): void {
    const w = this.wins.get(id);
    if (!w) return;
    if (this.focusedId === id && w.el.classList.contains('focused')) return;
    for (const other of this.wins.values()) other.el.classList.remove('focused');
    w.el.classList.add('focused');
    if (!w.opts.modal) w.el.style.zIndex = String(++this.z);
    this.focusedId = id;
    this.onChange();
  }

  /** Taskbar button: restore a minimised window, focus a background one, or minimise the active one. */
  toggle(id: string): void {
    const w = this.wins.get(id);
    if (!w) return;
    if (w.minimized || this.focusedId !== id) this.restore(id);
    else this.minimize(id);
  }

  private makeDraggable(win: HTMLElement, handle: HTMLElement): void {
    handle.addEventListener('pointerdown', (e) => {
      if ((e.target as HTMLElement).closest('button') || e.button !== 0) return;
      const s = getScale();
      const startX = e.clientX;
      const startY = e.clientY;
      const originX = win.offsetLeft;
      const originY = win.offsetTop;
      handle.setPointerCapture(e.pointerId);
      const move = (ev: PointerEvent) => {
        const nx = originX + (ev.clientX - startX) / s;
        const ny = originY + (ev.clientY - startY) / s;
        win.style.left = `${Math.min(Math.max(nx, 80 - win.offsetWidth), this.area.w - 80)}px`;
        win.style.top = `${Math.min(Math.max(ny, 0), this.area.h - 30)}px`;
      };
      const up = () => {
        handle.removeEventListener('pointermove', move);
        handle.removeEventListener('pointerup', up);
        handle.removeEventListener('pointercancel', up);
      };
      handle.addEventListener('pointermove', move);
      handle.addEventListener('pointerup', up);
      handle.addEventListener('pointercancel', up);
    });
  }
}
