import { el } from '../dom';

export const STAGE_W = 1280;
export const STAGE_H = 720;
export const TASKBAR_H = 36;
const MIN_WIDTH = 1024;

let scale = 1;

/** Current scale of the 1280×720 stage (needed to convert mouse movement into stage pixels). */
export function getScale(): number {
  return scale;
}

/** A fixed 1280×720 "monitor" that scales to fit the browser window, with black bars. */
export function createStage(root: HTMLElement): { stage: HTMLElement; tooSmall: HTMLElement } {
  const viewport = el('div', 'viewport');
  const stage = el('div', 'stage');
  const tooSmall = el('div', 'too-small');
  viewport.append(stage);
  root.append(viewport, tooSmall);

  const fit = () => {
    scale = Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H);
    stage.style.transform = `scale(${scale})`;
    stage.style.left = `${(window.innerWidth - STAGE_W * scale) / 2}px`;
    stage.style.top = `${(window.innerHeight - STAGE_H * scale) / 2}px`;
    tooSmall.hidden = window.innerWidth >= MIN_WIDTH;
  };
  window.addEventListener('resize', fit);
  fit();
  return { stage, tooSmall };
}
