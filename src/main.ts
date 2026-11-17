import './styles.css';
import { loadContent } from './content/load';
import type { Content, Profile } from './content/types';
import { fill, uiText } from './engine/text';
import { freshState, loadProgress, newSessionCode, wipeProgress, type GameState, type Session } from './engine/state';
import { createStage } from './os/stage';
import { unlockAudio } from './os/sound';
import { Game, type ChapterSummary } from './game';
import { showSetup } from './screens/setup';
import { showPlain } from './screens/plain';

let content: Content;
let stage: HTMLElement;
let exitButton: HTMLButtonElement;
let game: Game | null = null;

const ui = (key: string, vars?: Record<string, string | number>) => uiText(content.ui, key, vars);

async function main(): Promise<void> {
  const app = document.getElementById('app')!;
  const lang = new URLSearchParams(window.location.search).get('lang') ?? 'en';
  try {
    content = await loadContent(lang);
  } catch (err) {
    console.error(err);
    app.textContent = 'The game content could not be loaded.';
    return;
  }
  document.documentElement.lang = content.lang;
  applyTheme();

  const refs = createStage(app);
  stage = refs.stage;
  refs.tooSmall.textContent = ui('too_small');

  exitButton = document.createElement('button');
  exitButton.className = 'exit-btn';
  exitButton.textContent = ui('exit');
  exitButton.addEventListener('click', confirmExit);
  app.append(exitButton);

  window.addEventListener('pointerdown', unlockAudio);

  const saved = loadProgress();
  if (saved && content.chapters.some((c) => c.id === saved.chapter)) startGame(saved.profile, saved.session, saved.chapter);
  else showSetupScreen();
}

function applyTheme(): void {
  for (const [key, value] of Object.entries(content.theme.colors ?? {})) {
    document.documentElement.style.setProperty(`--${key.replace(/_/g, '-')}`, value);
  }
}

function showSetupScreen(): void {
  game?.destroy();
  game = null;
  stage.replaceChildren();
  exitButton.hidden = false;
  showSetup(stage, ui, (profile) => startGame(profile));
}

function startGame(profile: Profile, session?: Session, chapter?: string): void {
  game?.destroy();
  stage.replaceChildren();
  exitButton.hidden = false;
  const state = freshState(
    profile,
    session ?? { code: newSessionCode(), run: 1, lang: content.lang },
    chapter ?? content.chapters[0].id,
  );
  game = new Game(content, stage, state, { onChapterEnd: (summary) => showChapterEnd(summary, state) });
  game.startChapter(state.chapter, true);
}

function showChapterEnd(s: ChapterSummary, state: GameState): void {
  const t = (key: string, vars?: Record<string, string | number>) => fill(ui(key, vars), state.profile);
  showPlain(stage, {
    title: t('end_title', { chapter: s.chapterTitle }),
    lines: [
      t(s.foundWill ? 'end_found_will' : 'end_no_will'),
      t(s.willCarriedOut ? 'end_will_done' : 'end_will_not_done'),
      t('end_files', { n: s.filesOpened }),
      t('end_messages', { n: s.ottoMessages }),
      t('end_resemblance', { level: t(`level_${s.resemblance}`) }),
    ],
    note: t('end_note'),
    buttons: [
      { label: t('replay'), primary: true, onClick: () => startGame(state.profile, state.session, state.chapter) },
      { label: t('exit'), onClick: leave },
    ],
  });
}

function confirmExit(): void {
  if (stage.querySelector('.exit-confirm')) return;
  showPlain(stage, {
    className: 'exit-confirm',
    title: ui('exit_confirm_title'),
    lines: [ui('exit_confirm_text')],
    buttons: [
      { label: ui('exit_leave'), primary: true, onClick: leave },
      { label: ui('exit_stay'), onClick: (close) => close() },
    ],
  });
}

/** Leaving sends nothing and deletes names and progress from this browser. */
function leave(): void {
  game?.destroy();
  game = null;
  wipeProgress();
  stage.replaceChildren();
  exitButton.hidden = true;
  showPlain(stage, {
    title: ui('exit_done_title'),
    lines: [ui('exit_done_text')],
    buttons: [{ label: ui('start_again'), primary: true, onClick: showSetupScreen }],
  });
}

void main();
