// Shape of public/generated/content.<lang>.json (made by scripts/content-lib.mjs).

export type Pronouns = 'she' | 'he' | 'they';
export type FileKind = 'text' | 'document' | 'image' | 'audio' | 'video' | 'unsupported';
export type Level = 'low' | 'medium' | 'high';

export interface DiskFolder {
  type: 'folder';
  name: string;
  path: string;
  children: string[];
  unlock: string | null;
}

export interface DiskFile {
  type: 'file';
  name: string;
  path: string;
  kind: FileKind;
  category: string;
  memory: boolean;
  will: boolean;
  evidence: string | null;
  unlock: string | null;
  text?: string;
  html?: string;
  src?: string;
}

export type DiskNode = DiskFolder | DiskFile;

/** One sentence, or one version per OTTO resemblance level. */
export type Variants = string | Partial<Record<Level, string>>;

/** One line of a "do:" list: `{ wait: 2 }`, or a bare word such as `end_chapter`. */
export type Action = string | Record<string, unknown>;

export interface ChatReply {
  id: string;
  text: string;
  next?: string;
}

export interface ChatNode {
  id: string;
  speaker: 'friend' | 'otto';
  text: Variants;
  replies?: ChatReply[];
  do?: Action[];
}

export interface DecisionOption {
  id: string;
  label: string;
  consequence?: string;
}

export interface Decision {
  id: string;
  title: string;
  text?: string;
  options: DecisionOption[];
}

export interface Trigger {
  id: string;
  when: { event: string } & Record<string, unknown>;
  if?: Record<string, unknown>;
  once?: boolean;
  do: Action[];
}

export interface Chapter {
  id: string;
  title: string;
  start?: { otto_installed?: boolean; granted?: string[] };
}

export interface Settings {
  categories: string[];
  will_keeps: string[];
  resemblance: { medium: number; high: number };
  idle_seconds: number;
}

export interface Theme {
  os_name: string;
  otto_name: string;
  otto_logo: string;
  colors: Record<string, string>;
  icons: Record<string, string>;
}

export interface Content {
  lang: string;
  ui: Record<string, string>;
  settings: Settings;
  theme: Theme;
  disk: Record<string, DiskNode>;
  chapters: Chapter[];
  triggers: Trigger[];
  chat: Record<string, ChatNode>;
  decisions: Record<string, Decision>;
}

export interface Person {
  name: string;
  pronouns: Pronouns;
}

export interface Profile {
  player: Person;
  friend: Person;
}
