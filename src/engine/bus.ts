export interface GameEvent {
  event: string;
  [key: string]: unknown;
}

type Handler = (e: GameEvent) => void;

/** A tiny event bus: apps emit events, the trigger runner listens. */
export class Bus {
  private handlers = new Set<Handler>();

  on(handler: Handler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  emit(e: GameEvent): void {
    for (const h of [...this.handlers]) h(e);
  }
}
