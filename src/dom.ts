export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function img(src: string, className?: string, alt = ''): HTMLImageElement {
  const image = el('img', className);
  image.src = src;
  image.alt = alt;
  image.draggable = false;
  return image;
}

export const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
