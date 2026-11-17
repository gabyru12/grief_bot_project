import { el } from '../dom';
import type { Profile, Pronouns } from '../content/types';

type Ui = (key: string) => string;

const PRONOUNS: Pronouns[] = ['she', 'he', 'they'];

/** Names and pronouns for the player and the friend. They stay in this browser and are never sent. */
export function showSetup(stage: HTMLElement, ui: Ui, onStart: (profile: Profile) => void): void {
  const screen = el('div', 'plain-screen');
  const form = el('form', 'plain-card');
  form.noValidate = true;
  form.append(el('h1', undefined, ui('setup_title')), el('p', 'plain-note', ui('setup_note')));

  const row = (labelKey: string, id: string) => {
    const wrap = el('div', 'form-row');
    const nameLabel = el('label');
    nameLabel.htmlFor = `${id}-name`;
    nameLabel.textContent = ui(labelKey);
    const input = el('input');
    input.id = `${id}-name`;
    input.maxLength = 30;
    input.autocomplete = 'off';
    input.spellcheck = false;
    const pronounLabel = el('label');
    pronounLabel.htmlFor = `${id}-pronouns`;
    pronounLabel.textContent = ui('pronouns');
    const select = el('select');
    select.id = `${id}-pronouns`;
    for (const p of PRONOUNS) {
      const option = el('option', undefined, ui(`pronouns_${p}`));
      option.value = p;
      select.append(option);
    }
    select.value = 'they';
    const nameCol = el('div');
    nameCol.append(nameLabel, input);
    const pronounCol = el('div');
    pronounCol.append(pronounLabel, select);
    wrap.append(nameCol, pronounCol);
    return { wrap, input, select };
  };

  const player = row('your_name', 'player');
  const friend = row('friend_name', 'friend');
  const error = el('div', 'plain-error');
  const actions = el('div', 'plain-actions');
  const start = el('button', 'plain-btn primary', ui('start'));
  start.type = 'submit';
  actions.append(start);
  form.append(player.wrap, friend.wrap, el('p', 'plain-note', ui('setup_privacy')), error, actions);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const playerName = player.input.value.trim();
    const friendName = friend.input.value.trim();
    if (!playerName || !friendName) {
      error.textContent = ui('setup_missing');
      return;
    }
    screen.remove();
    onStart({
      player: { name: playerName, pronouns: player.select.value as Pronouns },
      friend: { name: friendName, pronouns: friend.select.value as Pronouns },
    });
  });

  screen.append(form);
  stage.append(screen);
  player.input.focus();
}
