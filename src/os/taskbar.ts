import { el, img } from '../dom';
import type { Game } from '../game';

export function renderTaskbar(game: Game, bar: HTMLElement): void {
  const start = el('button', 'btn start-btn');
  start.append(img(game.icon('computer'), 'start-icon'), el('span', undefined, game.content.theme.os_name));
  start.addEventListener('click', () => game.openApp('explorer'));

  const tasks = el('div', 'task-buttons');
  for (const w of game.wm.list()) {
    const button = el('button', `btn task-btn${w.focused && !w.minimized ? ' active' : ''}`);
    if (w.icon) button.append(img(w.icon, 'task-icon'));
    button.append(el('span', 'task-label', w.title));
    button.title = w.title;
    button.addEventListener('click', () => game.wm.toggle(w.id));
    tasks.append(button);
  }

  const tray = el('div', 'tray');
  if (game.state.ottoInstalled) {
    const otto = el('button', 'tray-btn');
    otto.title = game.content.theme.otto_name;
    otto.setAttribute('aria-label', game.content.theme.otto_name);
    otto.append(img(game.ottoLogo(), 'tray-icon'));
    otto.addEventListener('click', () => game.openApp('otto'));
    tray.append(otto);
  }
  const locale = game.content.lang === 'pt' ? 'pt-PT' : 'en-GB';
  tray.append(el('span', 'clock', new Date().toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })));

  bar.replaceChildren(start, tasks, tray);
}
