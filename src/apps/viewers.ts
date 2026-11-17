import { el, img } from '../dom';
import type { DiskFile } from '../content/types';
import type { Game } from '../game';

/** Opens a file in the matching viewer. Text, "PDF" documents, images, audio and video only. */
export function openFileWindow(game: Game, file: DiskFile): void {
  const id = `file:${file.path}`;
  if (game.wm.has(id)) {
    game.wm.restore(id);
    return;
  }
  const memory = file.memory ? ' memory' : '';
  let content: HTMLElement;
  let width = 560;
  let height = 440;
  let onClose: (() => void) | undefined;

  switch (file.kind) {
    case 'text': {
      content = el('div', `viewer-text${memory}`);
      content.append(el('pre', undefined, game.fill(file.text ?? '')));
      break;
    }
    case 'document': {
      content = el('div', 'viewer-doc-wrap');
      const scroller = el('div', 'viewer-doc');
      const page = el('article', `doc-page${memory}`);
      page.innerHTML = game.fill(file.html ?? '', { html: true }); // built from escaped Markdown
      scroller.append(page);
      content.append(scroller);
      width = 640;
      height = 580;
      if (file.will) {
        const bar = el('div', 'will-bar');
        const renderBar = () => {
          if (game.state.willCarriedOut) {
            bar.replaceChildren(el('span', 'will-done', game.ui('will_done')));
          } else {
            const button = el('button', 'btn btn-strong', game.ui('carry_out_will'));
            button.addEventListener('click', () => void game.askDecision('WILL'));
            bar.replaceChildren(button);
          }
        };
        renderBar();
        onClose = game.onChange(renderBar);
        content.append(bar);
      }
      break;
    }
    case 'image': {
      content = el('div', `viewer-image${memory}`);
      content.append(img(file.src ?? '', undefined, file.name));
      width = 660;
      height = 480;
      break;
    }
    case 'audio': {
      content = el('div', 'viewer-media');
      const audio = el('audio');
      audio.controls = true;
      audio.src = file.src ?? '';
      content.append(audio);
      width = 420;
      height = 150;
      break;
    }
    case 'video': {
      content = el('div', 'viewer-media');
      const video = el('video');
      video.controls = true;
      video.src = file.src ?? '';
      content.append(video);
      width = 680;
      height = 440;
      break;
    }
    default:
      return;
  }

  game.wm.open({
    id,
    title: file.name,
    icon: game.iconFor(file),
    width,
    height,
    content,
    meta: { app: 'viewer', file: file.path },
    onClose,
  });
}
