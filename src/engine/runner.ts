import type { Action, Trigger } from '../content/types';
import type { GameEvent } from './bus';

export interface TriggerHost {
  check(condition: Record<string, unknown>): boolean;
  runActions(actions: Action[] | undefined, where: string): Promise<void>;
}

/** Runs the writers' triggers.yaml: "when X happens, if Y, do Z". */
export class TriggerRunner {
  private fired = new Set<string>();

  constructor(
    private triggers: Trigger[],
    private host: TriggerHost,
  ) {}

  handle(e: GameEvent): void {
    for (const t of this.triggers) {
      if (t.once && this.fired.has(t.id)) continue;
      if (!matches(t.when, e)) continue;
      if (t.if && !this.host.check(t.if)) continue;
      if (t.once) this.fired.add(t.id);
      void this.host.runActions(t.do, `trigger "${t.id}"`);
    }
  }
}

function matches(when: Trigger['when'], e: GameEvent): boolean {
  if (when.event !== e.event) return false;
  for (const [key, expected] of Object.entries(when)) {
    if (key === 'event') continue;
    const actual = e[key];
    if (typeof expected === 'string' && typeof actual === 'string') {
      if (expected.normalize('NFC') !== actual.normalize('NFC')) return false;
    } else if (actual !== expected) {
      return false;
    }
  }
  return true;
}
