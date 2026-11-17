import { el } from '../dom';

export interface PlainButton {
  label: string;
  primary?: boolean;
  onClick: (close: () => void) => void;
}

/** A plain screen outside the story world (setup, exit, end of chapter). Returns a close function. */
export function showPlain(
  stage: HTMLElement,
  opts: { title: string; lines: string[]; note?: string; buttons: PlainButton[]; className?: string },
): () => void {
  const screen = el('div', `plain-screen${opts.className ? ` ${opts.className}` : ''}`);
  const card = el('div', 'plain-card');
  card.append(el('h1', undefined, opts.title));
  for (const line of opts.lines) card.append(el('p', undefined, line));
  if (opts.note) card.append(el('p', 'plain-note', opts.note));
  const close = () => screen.remove();
  const actions = el('div', 'plain-actions');
  for (const b of opts.buttons) {
    const button = el('button', `plain-btn${b.primary ? ' primary' : ''}`, b.label);
    button.addEventListener('click', () => b.onClick(close));
    actions.append(button);
  }
  card.append(actions);
  screen.append(card);
  stage.append(screen);
  return close;
}
