import { el, img } from '../dom';

export interface ToastOptions {
  icon: string;
  title: string;
  text: string;
  onClick?: () => void;
}

/** A notification in the bottom-right corner; disappears after a few seconds. */
export function showToast(container: HTMLElement, opts: ToastOptions): void {
  const toast = el('div', 'toast');
  toast.setAttribute('role', 'status');
  const body = el('div', 'toast-body');
  body.append(el('div', 'toast-title', opts.title), el('div', 'toast-text', opts.text));
  toast.append(img(opts.icon, 'toast-icon'), body);

  const remove = () => {
    toast.classList.add('out');
    setTimeout(() => toast.remove(), 350);
  };
  toast.addEventListener('click', () => {
    opts.onClick?.();
    remove();
  });
  container.append(toast);
  setTimeout(remove, 9000);
}
