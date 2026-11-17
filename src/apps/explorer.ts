import { el, img } from '../dom';
import type { DiskFolder } from '../content/types';
import type { Game } from '../game';

const WINDOW_ID = 'explorer';

/** The file explorer: browse folders, double-click to open. No moving or deleting (by design). */
export class Explorer {
  private path = '';
  private history: string[] = [];
  private root: HTMLElement | null = null;
  private unsubscribe: (() => void) | null = null;

  constructor(private game: Game) {}

  open(path = ''): void {
    const g = this.game;
    if (!g.wm.has(WINDOW_ID)) {
      this.root = el('div', 'explorer');
      this.path = '';
      this.history = [];
      g.wm.open({
        id: WINDOW_ID,
        title: g.ui('this_laptop'),
        icon: g.icon('folder'),
        width: 680,
        height: 450,
        content: this.root,
        meta: { app: 'explorer' },
        onClose: () => {
          this.unsubscribe?.();
          this.unsubscribe = null;
          this.root = null;
        },
      });
      this.unsubscribe = g.onChange(() => this.render());
    } else {
      g.wm.restore(WINDOW_ID);
    }
    this.go(path, path !== this.path);
  }

  private go(path: string, remember = true): void {
    if (remember) this.history.push(this.path);
    this.path = path;
    this.render();
  }

  private render(): void {
    const g = this.game;
    const root = this.root;
    if (!root) return;

    let node = g.content.disk[this.path];
    if (!node || node.type !== 'folder' || !g.isVisible(node)) {
      this.path = '';
      node = g.content.disk[''];
    }
    const folder = node as DiskFolder;
    g.wm.setTitle(WINDOW_ID, this.path ? folder.name : g.ui('this_laptop'));

    // Toolbar: back, up, address
    const toolbar = el('div', 'explorer-toolbar');
    const back = el('button', 'btn', `← ${g.ui('back')}`);
    back.disabled = this.history.length === 0;
    back.addEventListener('click', () => {
      const previous = this.history.pop();
      if (previous === undefined) return;
      this.path = previous;
      this.render();
    });
    const up = el('button', 'btn', `↑ ${g.ui('up')}`);
    up.disabled = this.path === '';
    up.addEventListener('click', () => {
      const parent = this.path.includes('/') ? this.path.slice(0, this.path.lastIndexOf('/')) : '';
      this.go(parent);
    });
    const address = el('div', 'explorer-address', [g.ui('this_laptop'), ...(this.path ? this.path.split('/') : [])].join('  ›  '));
    toolbar.append(back, up, address);

    // Items
    const grid = el('div', 'explorer-grid');
    const visible = folder.children.map((p) => g.content.disk[p]).filter((n) => n && g.isVisible(n));
    if (visible.length === 0) grid.append(el('div', 'explorer-empty', g.ui('empty_folder')));
    for (const child of visible) {
      const item = el('button', 'file-item');
      item.title = child.name;
      item.append(img(g.iconFor(child)), el('span', undefined, child.name));
      const open = () => (child.type === 'folder' ? this.go(child.path) : g.openFile(child.path));
      item.addEventListener('click', () => {
        grid.querySelectorAll('.file-item.selected').forEach((n) => n.classList.remove('selected'));
        item.classList.add('selected');
      });
      item.addEventListener('dblclick', open);
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') open();
      });
      grid.append(item);
    }

    const status = el('div', 'explorer-status', g.ui('items', { n: visible.length }));
    root.replaceChildren(toolbar, grid, status);
  }
}
