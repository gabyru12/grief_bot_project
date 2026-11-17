import type { Profile } from '../content/types';

export interface ChatLine {
  speaker: 'friend' | 'otto' | 'player';
  text: string;
}

export interface Session {
  code: string;
  run: number;
  lang: string;
}

export interface GameState {
  session: Session;
  /** Names and pronouns: stay in this browser, never sent. */
  profile: Profile;
  chapter: string;
  flags: string[];
  opened: string[];
  ottoInstalled: boolean;
  granted: string[];
  deletedCategories: string[];
  willCarriedOut: null | 'before_install' | 'after_install';
  decisions: Record<string, { first: string; final: string }>;
  chatLog: ChatLine[];
}

const SAVE_KEY = 'icarus.save.v1';
// 32 characters (no I, O, 0, 1), so every random byte maps evenly with `& 31`.
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function newSessionCode(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => CODE_ALPHABET[b & 31]).join('');
}

export function freshState(profile: Profile, session: Session, chapter: string): GameState {
  return {
    session,
    profile,
    chapter,
    flags: [],
    opened: [],
    ottoInstalled: false,
    granted: [],
    deletedCategories: [],
    willCarriedOut: null,
    decisions: {},
    chatLog: [],
  };
}

interface SaveData {
  session: Session;
  profile: Profile;
  chapter: string;
}

/** Saved at the start of each chapter; a refresh resumes from there. */
export function saveProgress(state: GameState): void {
  const data: SaveData = { session: state.session, profile: state.profile, chapter: state.chapter };
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {
    // Storage may be blocked (private window): the game still works, it just can't resume.
  }
}

export function loadProgress(): SaveData | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as SaveData;
    if (!data?.profile?.player?.name || !data?.profile?.friend?.name || !data.chapter) return null;
    return data;
  } catch {
    return null;
  }
}

export function wipeProgress(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    // nothing stored
  }
}
