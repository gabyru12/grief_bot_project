import type { Level, Profile, Pronouns, Variants } from '../content/types';

const PRONOUN_WORDS: Record<Pronouns, Record<string, string>> = {
  she: { they: 'she', them: 'her', their: 'her', theirs: 'hers', themself: 'herself', is: 'is', was: 'was', has: 'has' },
  he: { they: 'he', them: 'him', their: 'his', theirs: 'his', themself: 'himself', is: 'is', was: 'was', has: 'has' },
  they: { they: 'they', them: 'them', their: 'their', theirs: 'theirs', themself: 'themself', is: 'are', was: 'were', has: 'have' },
};
const VARIANT_INDEX: Record<Pronouns, number> = { she: 0, he: 1, they: 2 };

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Replaces story tokens:
 *   {player.name} {friend.they} {Friend.they} (capitalised) {friend.is} …
 *   {friend: she version | he version | they version}
 * With `html: true`, the names typed by the player are escaped.
 */
export function fill(text: string, profile: Profile, options: { html?: boolean } = {}): string {
  return text.replace(/\{\s*(player|friend)\s*(?:\.\s*(\w+)\s*|:([^}]*))\}/gi, (whole, who: string, key?: string, variants?: string) => {
    const person = profile[who.toLowerCase() as 'player' | 'friend'];
    if (!person) return whole;
    if (variants !== undefined) {
      const parts = variants.split('|');
      return (parts[VARIANT_INDEX[person.pronouns]] ?? parts[0]).trim();
    }
    const k = (key ?? '').toLowerCase();
    if (k === 'name') return options.html ? escapeHtml(person.name) : person.name;
    let word = PRONOUN_WORDS[person.pronouns][k];
    if (!word) return whole;
    if (who[0] !== who[0].toLowerCase()) word = word[0].toUpperCase() + word.slice(1);
    return word;
  });
}

/** Picks the version of a line that matches OTTO's resemblance level. */
export function pickVariant(text: Variants, level: Level): string {
  if (typeof text === 'string') return text;
  return text[level] ?? text.medium ?? text.low ?? text.high ?? '';
}

/** Interface string with {placeholders} filled from `vars` (story tokens are left for `fill`). */
export function uiText(ui: Record<string, string>, key: string, vars?: Record<string, string | number>): string {
  const raw = ui[key] ?? key;
  return raw.replace(/\{(\w+)\}/g, (m, name: string) => (vars && name in vars ? String(vars[name]) : m));
}
