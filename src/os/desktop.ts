import { el, img } from '../dom';
import type { Game } from '../game';

interface DesktopItem {
  label: string;
  icon: string;
  open: () => void;
}

/** Desktop icons: "This laptop", OTTO (when installed), then the files in the disk's Desktop folder. */
export function renderDesktop(game: Game, root: HTMLElement): void {
  const items: DesktopItem[] = [
    { label: game.ui('this_laptop'), icon: game.icon('computer'), open: () => game.openApp('explorer') },
  ];
  if (game.state.ottoInstalled) {
    items.push({ label: game.content.theme.otto_name, icon: game.ottoLogo(), open: () => game.openApp('otto') });
  }
  const desktopFolder = game.content.disk['Desktop'];
  if (desktopFolder?.type === 'folder') {
    for (const childPath of desktopFolder.children) {
      const node = game.content.disk[childPath];
      if (!node || !game.isVisible(node)) continue;
      items.push({ label: node.name, icon: game.iconFor(node), open: () => game.openFile(node.path) });
    }
  }

  root.replaceChildren();
  for (const item of items) {
    const button = el('button', 'desk-icon');
    button.append(img(item.icon), el('span', undefined, item.label));
    button.addEventListener('click', () => {
      root.querySelectorAll('.desk-icon.selected').forEach((n) => n.classList.remove('selected'));
      button.classList.add('selected');
    });
    button.addEventListener('dblclick', item.open);
    button.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') item.open();
    });
    root.append(button);
  }
}
