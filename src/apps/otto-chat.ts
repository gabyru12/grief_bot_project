import { el, img, sleep } from '../dom';
import type { ChatNode, ChatReply } from '../content/types';
import { pickVariant } from '../engine/text';
import { STAGE_W } from '../os/stage';
import type { Game } from '../game';

const WINDOW_ID = 'otto';

/**
 * OTTO's chat window. Messages come from chat.yaml; the player answers by picking
 * one of the written replies (nothing is typed, so nothing personal is collected).
 */
export class OttoChat {
  /** Messages already started (so a notification doesn't replay them). */
  readonly started = new Set<string>();
  private queue: Promise<void> = Promise.resolve();
  private current: ChatNode | null = null;
  private typing = false;
  private typingName = '';
  private log: HTMLElement | null = null;
  private replies: HTMLElement | null = null;

  constructor(private game: Game) {}

  /** Opens the window. When opened by the player with an empty conversation, OTTO greets. */
  open(greetIfEmpty = true): void {
    const g = this.game;
    if (g.wm.has(WINDOW_ID)) {
      g.wm.restore(WINDOW_ID);
    } else {
      const root = el('div', 'otto-chat');
      const header = el('div', 'otto-header');
      const names = el('div');
      names.append(el('div', 'otto-name', g.state.profile.friend.name), el('div', 'otto-sub', g.ui('otto_subtitle')));
      header.append(img(g.ottoLogo(), 'otto-avatar'), names);
      this.log = el('div', 'otto-log');
      this.replies = el('div', 'otto-replies');
      root.append(header, this.log, this.replies);
      g.wm.open({
        id: WINDOW_ID,
        title: g.content.theme.otto_name,
        icon: g.ottoLogo(),
        width: 380,
        height: 540,
        x: STAGE_W - 380 - 70,
        y: 50,
        content: root,
        className: 'win-otto',
        meta: { app: 'otto' },
        onClose: () => {
          this.log = null;
          this.replies = null;
        },
      });
      this.render();
    }
    if (greetIfEmpty && g.state.chatLog.length === 0 && !this.typing && g.content.chat['greeting'] && !this.started.has('greeting')) {
      this.start('greeting');
    }
  }

  /** Opens the window at a given message (used by notifications and the start_chat action). */
  openAt(id: string): void {
    this.open(false);
    if (!this.started.has(id)) this.start(id);
  }

  start(id: string): void {
    this.started.add(id);
    this.queue = this.queue.then(() => this.show(id));
  }

  private async show(id: string): Promise<void> {
    const g = this.game;
    const node = g.content.chat[id];
    if (!node) return;
    const generation = g.generation;
    this.current = null;
    this.typing = true;
    this.typingName = node.speaker === 'otto' ? g.content.theme.otto_name : g.state.profile.friend.name;
    this.render();

    const text = g.fill(pickVariant(node.text, g.resemblance()));
    await sleep(700 + Math.min(text.length * 15, 1500));
    if (generation !== g.generation) return;

    this.typing = false;
    g.state.chatLog.push({ speaker: node.speaker, text });
    this.current = node.replies?.length ? node : null;
    this.render();
    if (node.do?.length) await g.runActions(node.do, `chat message "${id}"`);
  }

  private choose(reply: ChatReply): void {
    const g = this.game;
    const node = this.current;
    if (!node) return;
    this.current = null;
    g.state.chatLog.push({ speaker: 'player', text: g.fill(reply.text) });
    this.render();
    g.emit({ event: 'chat_reply', node: node.id, option: reply.id });
    if (reply.next) this.start(reply.next);
  }

  private render(): void {
    const g = this.game;
    if (!this.log || !this.replies) return;

    const lines = g.state.chatLog.map((line) => {
      const bubble = el('div', `msg msg-${line.speaker}`);
      if (line.speaker === 'otto') bubble.append(el('span', 'msg-label', g.content.theme.otto_name));
      bubble.append(document.createTextNode(line.text));
      return bubble;
    });
    if (this.typing) lines.push(el('div', 'typing', `${this.typingName} · ${g.ui('otto_typing')}`));
    this.log.replaceChildren(...lines);
    this.log.scrollTop = this.log.scrollHeight;

    if (this.current?.replies?.length) {
      this.replies.replaceChildren(
        ...this.current.replies.map((reply) => {
          const button = el('button', 'otto-reply', g.fill(reply.text));
          button.addEventListener('click', () => this.choose(reply));
          return button;
        }),
      );
    } else {
      this.replies.replaceChildren(el('div', 'otto-waiting', g.ui('otto_waiting')));
    }
  }
}
