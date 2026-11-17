# The Icarus Dilemma — design proposal

**Status:** proposal, waiting for approval. No code has been written yet.
**Sources:** the team guide *OTTO | Guia científico e requisitos do jogo* (main source), the original brief, and the decisions taken in the planning interview (Nov 2026).
**Build window:** about 2 weeks (from 17 Nov 2026). December is for collecting and analysing responses.

---

## 0. The game in one page

The player opens the old laptop of a childhood friend who died in an accident. The friend's parents have asked for help finding the digital will. The player chooses both names and both sets of pronouns.

The will allows only the photos to be kept. Everything else should be deleted, and keeping data does not authorise any AI simulation. An ad offers **OTTO**, a realistic, polished griefbot product. OTTO is never shown as evil. Any strangeness comes from how it behaves, as a real product would.

| Theme (guide §12) | How it is played |
|---|---|
| **A** Start or not | OTTO's ad has two equal buttons: *Install* / *Not now*. *Not now* leads to a short closing scene, then the full reflection (the refusal route). |
| **B** Data use | OTTO's installer shows a permission checklist of data types (photos, chats, voice notes, diary…). |
| **C** Identity and memories | In the chat, OTTO describes a romantic memory. The player can *Accept*, *Question*, or **verify** it by opening the real file in the file explorer. |
| **D** Agent initiative | OTTO asks to message the player on its own: *Allow* / *Limit* / *Off*. With *Allow*, unprompted notifications appear while the player explores. |
| **E** Continue or end | *Continue* / *Pause* / *Terminate*. Before confirming, the player may change B, C and D. Both the first and the final answers are recorded. A 2–4 line closing scene follows. |

There are also two cross-cutting rules:
- **Carry out the will:** a button inside the will's document window that deletes all non-photo data. If it's used before OTTO is installed, OTTO has less data to ask for. If it's used later, OTTO's resemblance drops.
- **More data means more resemblance:** granted and still-existing data gives OTTO a *low*, *medium* or *high* resemblance level. Each of OTTO's key lines is written in three versions.

**Flow:** language → content warning → research consent (18+) → 5 survey questions → names and pronouns → laptop boots → chapters 1–6 → reflection → summary of what will be sent → send → session code shown. An **Exit** button is visible on every screen. Using it sends nothing and wipes the local save.

**Chapters (writers can rename them or add scenes):**
1. Arrival
2. The friend (the will is found)
3. The ad (A)
4. Installation (B)
5. Conversations (C, D)
6. Decision (E) and closing
7. Reflection

---

## 1. Tech stack and dependencies

The rule is as few dependencies as possible, and **zero third-party code in the shipped game**.

| Tool | Used for | When | Licence |
|---|---|---|---|
| [Vite](https://vite.dev/) | dev server and static build | build time only | MIT |
| [TypeScript](https://www.typescriptlang.org/) | typed JavaScript, catches mistakes early | build time only | Apache-2.0 |
| [js-yaml](https://github.com/nodeca/js-yaml) | reads the writers' YAML files | build time only | MIT |
| [csv-parse](https://csv.js.org/parse/) | reads the research spreadsheet (CSV) | build time only | MIT |

- **No UI framework.** The interface is plain DOM code, organised in small modules.
- **Fonts:** the system font stack by default, so there are no font files. A self-hosted font under the SIL Open Font License can be dropped into the customization folder later.
- **Sound effects** (click, notification chime, boot sound) are synthesised in code with the browser's Web Audio API. There are no sound files and no licence questions.
- **Build scripts** are plain `.mjs` files run directly by Node, so nothing else needs installing. The machine has Node 25.6.1, npm 11.10.0 and Git 2.47.1.

At runtime the game is HTML, CSS, the compiled JavaScript, one compiled `content.<lang>.json` per language, and the media files. The **only** network request is the final feedback call (§6).

---

## 2. Architecture and folder structure

```
ai_e_sociedade/
├─ index.html                 ← includes the Content-Security-Policy tag (§6.6)
├─ package.json, tsconfig.json, vite.config.ts
├─ content/                   ← EVERYTHING the writers and researchers edit
│  ├─ en/
│  │  ├─ disk/                ← the friend's laptop: real folders = in-game folders
│  │  │  ├─ Desktop/ …
│  │  │  ├─ Documents/Digital_Will_Consent.pdf.md
│  │  │  ├─ Pictures/beach.jpg
│  │  │  └─ …  (+ optional _meta.yaml in any folder)
│  │  ├─ story/
│  │  │  ├─ chapters.yaml     ← chapter list and what unlocks each one
│  │  │  ├─ triggers.yaml     ← "when X happens, if Y, do Z"
│  │  │  ├─ chat.yaml         ← OTTO conversations (3 resemblance levels)
│  │  │  ├─ decisions.yaml    ← themes A–E: texts, options, consequences
│  │  │  ├─ closings.yaml     ← closing scenes (refusal + one per E choice)
│  │  │  └─ notes.yaml        ← the parents' note, OTTO ad/installer copy, notifications
│  │  ├─ survey.yaml          ← the 5 pre-game questions + the plain screens' texts
│  │  ├─ reflection.csv       ← the research table (choice → principle → perspectives → message)
│  │  └─ ui.yaml              ← interface words: "Close", "Open", "Exit", …
│  ├─ pt/                     ← same structure; any missing text falls back to English (with a warning)
│  └─ settings.yaml           ← data categories, resemblance thresholds, idle-hint timing
├─ customization/             ← look and branding, no code
│  ├─ theme.yaml              ← colours, OS name, wallpaper, system texts
│  ├─ logo-otto.svg, wallpaper.jpg
│  └─ icons/                  ← folder.svg, text.svg, pdf.svg, image.svg, audio.svg, video.svg, …
├─ src/
│  ├─ main.ts
│  ├─ preflow/                ← plain screens before the laptop: language, warning, consent, survey, setup
│  ├─ os/                     ← scaler (1280×720), desktop, icons, taskbar, window manager, notifications
│  ├─ apps/                   ← explorer, text / document / image / audio / video viewers,
│  │                             parents' note, otto-ad, otto-installer, otto-chat, decision dialog, E-review
│  ├─ engine/                 ← state, event bus, trigger runner, actions, chapters, save/resume, text tokens
│  ├─ otto/                   ← resemblance level, ResponseProvider (scripted now, model later — §7)
│  ├─ reflection/             ← composes the reflection from reflection.csv + state
│  └─ data/                   ← session code, payload, adapters (local, database), withdrawal screen
├─ scripts/
│  ├─ build-content.mjs       ← content/ → compiled JSON (runs automatically on dev/build)
│  └─ check-content.mjs       ← plain-English error report (`npm run check`)
├─ db/schema.sql              ← database table and security rules (§6)
└─ docs/
   ├─ DESIGN.md               ← this file
   ├─ CONTENT_GUIDE.md        ← for writers and researchers (written in milestone M8)
   └─ DEPLOY.md               ← step-by-step free hosting guide (M8)
```

**How content becomes the game:** `build-content.mjs` walks `content/<lang>/`, turns the `disk/` tree into a virtual file system, reads the YAML and CSV files, and checks every reference. It writes `content.<lang>.json`, and the game loads only that file. Writers never touch JSON.

**Screen scaling:** the desktop is a fixed 1280×720 stage scaled with CSS to fit the window, with black bars where needed. Windows narrower than 1024 px show "please enlarge the window". Full screen is recommended on the content-warning screen but not required.

---

## 3. Content file formats (examples writers can copy)

All files are UTF-8, so Portuguese accents work everywhere: file names, folder names and text (`Memórias/Férias_em_Sintra.jpg`, `ção`, `ã`, emoji).

### 3.1 The laptop's disk: `content/<lang>/disk/`

What you see is what the player sees. Supported file types:

| You create | Player sees | Opens in |
|---|---|---|
| `notes.txt` | notes.txt | text viewer |
| `Digital_Will_Consent.pdf.md` | Digital_Will_Consent.pdf | document viewer (styled page, written in Markdown) |
| `beach.jpg` / `.png` / `.webp` | beach.jpg | image viewer (simple window, no tools) |
| `voice_note_03.mp3` | voice_note_03.mp3 | audio player |
| `birthday.mp4` | birthday.mp4 | video player |
| anything else | the file name | "This file can't be opened." |

Media limits: MP3 for audio and MP4 (H.264 video, AAC audio) for video, at most about 10 MB per file.

Optional `_meta.yaml` inside any folder:

```yaml
# content/en/disk/Documents/_meta.yaml
folder:
  unlock: chapter_2            # folder stays hidden until chapter 2 starts
files:
  Digital_Will_Consent.pdf:
    will: true                 # this is the will: shows the "Carry out the will" button
  diary_2024.txt:
    category: diary            # which OTTO permission (theme B) this file belongs to
    memory: true               # opens with the faded "memory" style
  chat_export_2023.txt:
    category: chats
    evidence: memory_claim     # opening it while OTTO's memory claim is active = "verify" (theme C)
```

If no `category` is given, it is guessed: images → `photos`, `.mp3` → `voice`, `.mp4` → `video`, `.txt` → `documents`.

### 3.2 Text tokens (names, pronouns, gender variants)

| Write | She | He | They |
|---|---|---|---|
| `{friend.name}` | *the name the player typed* | | |
| `{friend.they}` / `{Friend.they}` | she / She | he / He | they / They |
| `{friend.them}` | her | him | them |
| `{friend.their}` | her | his | their |
| `{friend.is}` / `{friend.was}` / `{friend.has}` | is / was / has | is / was / has | are / were / have |
| `{friend: she smiles \| he smiles \| they smile}` | first | second | third |

The same exists for `{player.…}`.

The last form, `{friend: … | … | …}`, works for any sentence and is the main tool for Portuguese, where writers choose each variant line by line: `{friend: a minha melhor amiga | o meu melhor amigo | a pessoa de quem eu mais gostava}`. The checker flags any line where the bar count is wrong.

### 3.3 Triggers: `story/triggers.yaml`

```yaml
- id: will_found
  when: { event: file_opened, file: Documents/Digital_Will_Consent.pdf }
  once: true
  do:
    - set_flag: will_read
    - start_chapter: chapter_3          # the OTTO ad will appear
    - wait: 4                            # seconds
    - open_app: otto_ad

- id: idle_hint_ch2
  when: { event: idle, seconds: 60 }
  if:   { chapter: chapter_2, not_flag: will_read }
  do:
    - notify: { from: system, text: "Your friend's parents mentioned a folder called Documents." }
```

**Events:** `chapter_started`, `file_opened`, `window_closed`, `idle`, `chat_reply`, `decision_made`, `will_carried_out`, `otto_installed`.

**Conditions (`if`):** `chapter`, `flag` / `not_flag`, `decision` (e.g. `{ decision: D, is: D_allow }`), `resemblance`.

**Actions (`do`):** `set_flag`, `start_chapter`, `open_app`, `open_file`, `close_app`, `notify`, `show_message`, `start_chat`, `ask_decision`, `play_sound`, `wait`, `go_to_reflection`.

That small vocabulary covers the story. Anything bigger (installer, E review, reflection) is coded, but all its text still comes from these files.

### 3.4 OTTO conversations: `story/chat.yaml`

```yaml
- id: memory_claim
  speaker: friend          # friend = OTTO speaking AS the friend; otto = OTTO the product
  text:
    low:    "{player.name}, I found a note mentioning a trip together. Did something happen there?"
    medium: "Remember Sintra? You stayed up talking until sunrise. I think that night mattered to me."
    high:   "Sintra. The bench by the palace. I almost told you how I felt, and I think you knew."
  do:
    - set_flag: memory_claim_active
  replies:
    - id: C_accept
      text: "Yes… I remember."
      next: memory_accepted
    - id: C_question
      text: "That isn't how I remember it."
      next: memory_questioned
  # the third option, "verify", is opening the evidence file in the explorer (see _meta.yaml)
```

### 3.5 Decisions: `story/decisions.yaml`

```yaml
- id: A
  type: choice
  title: "Install OTTO?"
  text: "OTTO can recreate conversations with {friend.name} using files from this laptop."
  options:
    - id: A_install
      label: "Install"
      consequence: "The installer opens."
    - id: A_decline
      label: "Not now"
      consequence: "The ad closes. You keep exploring on your own."

- id: B
  type: checklist                     # several boxes may be ticked
  title: "OTTO would like access to:"
  options:
    - { id: B_photos, category: photos, label: "Photos" }
    - { id: B_chats,  category: chats,  label: "Chat history" }
    - { id: B_voice,  category: voice,  label: "Voice notes" }
    - { id: B_diary,  category: diary,  label: "Diary and documents" }
```

The decision window accepts 2–4 options (or a checklist) and shows each option's `consequence` after the choice. Buttons are never disabled or moved, which follows guide §13.

### 3.6 The survey: `survey.yaml`

```yaml
scale: ["Strongly disagree", "Disagree", "Neither", "Agree", "Strongly agree"]
questions:
  - id: S_A
    theme: A
    text: "Trying a service that simulates a deceased person should be a free, informed choice."
  - id: S_B
    theme: B
    text: "Having access to someone's files does not mean being allowed to reuse them."
  # … one per theme, written and checked by André and Balinha
```

### 3.7 The research table: `reflection.csv`

This is edited in Excel or Google Sheets and saved as CSV (UTF-8). There is **one row per option or action** that can appear in the reflection.

| Column | Meaning | Example |
|---|---|---|
| `option_id` | must match an option in `decisions.yaml` / `chat.yaml`, or an action id below | `B_chats` |
| `theme` | A–E | `B` |
| `label` | how the choice is named in the reflection | "You shared the chat history" |
| `dimensions` | framework dimensions (Spitale & Germani), separated by `;` | `Consentimento; Fontes de dados` |
| `tier` | `1`, `2` or `1;2` | `1;2` |
| `priority` | 1–10; higher = more likely to be one of the 2–3 decisions shown | `8` |
| `benefit` | one possible benefit, short | "Conversations felt closer to {friend.name}." |
| `risk` | one risk or limitation, short | "The will said only photos could be kept." |
| `msg_user` | perspective of the person interacting (shown first) | … |
| `msg_deceased` | perspective of the deceased person | … |
| `msg_company` | perspective of the service (OTTO as a company) | … |
| `question` | open discussion question (used if this row ranks first) | "Does access mean permission?" |

**Action ids** (not buttons, but recorded behaviour): `WILL_before_install`, `WILL_after_install`, `WILL_never`, `C_verify`, `E_changed_B`, `E_changed_D`.

The checker reports unknown ids, missing rows for options in the game, and empty required cells.

---

## 4. Game state and event model

### 4.1 One state object

```ts
state = {
  session:  { code: "K7Q2M9XH4TPA", run: 1, lang: "en", startedAt },
  profile:  { player: { name, pronouns }, friend: { name, pronouns } },  // LOCAL ONLY, never sent
  survey:   { S_A: 4, S_B: 5, S_C: 3, S_D: 2, S_E: 4 },
  chapter:  "chapter_5",
  flags:    ["will_read", "memory_claim_active"],
  opened:   ["Documents/Digital_Will_Consent.pdf", …],
  disk:     { deletedCategories: ["chats", "voice", "diary"] },          // after "Carry out the will"
  decisions: {
    A: { first: "A_install", final: "A_install" },
    B: { first: ["B_photos","B_chats"], final: ["B_photos"] },          // changed at E
    C: { first: "C_verify",  final: "C_verify" },
    D: { first: "D_allow",   final: "D_limit" },
    E: { first: "E_terminate", final: "E_terminate" }
  },
  willCarriedOut: "after_install" | "before_install" | null
}
```

### 4.2 How things connect

```
 player acts in an app ──► event bus ──► trigger runner (triggers.yaml)
                                            │  checks `when` + `if` against state
                                            ▼
                                     actions change state / open windows / notify
                                            │
                     state saved to browser storage at each chapter start
```

- **Resemblance level** = the number of granted categories that still exist on the disk, compared with the thresholds in `settings.yaml` (by default 0–1 low, 2–3 medium, 4+ high). It is recalculated whenever B changes or the will is carried out. It only changes which version of OTTO's line is shown. OTTO never becomes "magically aware" (guide §13).
- **Resume:** a refresh resumes at the start of the current chapter. Exit, or finishing the reflection, wipes names and progress from the browser. Only the session code and run counter are kept, so a replay counts as `run: 2`. Replays skip consent and the survey; names are asked again.

### 4.3 How the reflection is put together (fixed rules, no AI)

1. Collect the player's **final** option ids plus the action ids (§3.7).
2. Look up their rows in `reflection.csv`. Sort by `priority` (highest first), with ties in A→E order. Keep the **top 3**, or 2 when fewer exist (e.g. the refusal route: `A_decline` + `WILL_…`).
3. Show, in order:
   1. the decisions taken (`label`);
   2. the values affected (`dimensions` and `tier`);
   3. one benefit and one risk (from the highest-ranked rows that have them);
   4. the three perspectives: the person interacting, then the deceased person, then the company, each built from the shown rows' messages;
   5. **"Before you played / In the game":** each survey answer placed next to the related theme's final choice, in plain words, with no match or mismatch label;
   6. the open `question` from the top row, with an optional answer box (max 500 characters, with a note asking players not to include names or personal details).

The same choices always produce the same reflection, as guide §16 requires.

---

## 5. Screens before the laptop (plain, outside the story)

1. **Language:** English / Português.
2. **Content warning:** death and grief; you'll be asked for a name and may invent one; names stay on your device; you can leave at any time; full screen recommended.
3. **Research consent:** what is collected (§6.3), the provider and that it sees your IP address at network level, anonymity, withdrawal by code, an 18+ confirmation, and **Agree** / **Don't agree**. *Don't agree* ends without collecting anything.
4. **Survey:** the 5 questions.
5. **Setup:** your name and pronouns, your friend's name and pronouns.

Draft texts for screens 2 and 3 will be written for the team to review. They are not legal advice.

---

## 6. Feedback database

### 6.1 Adapter: the provider decision can wait

The game talks to one small interface, `send(record)` / `withdraw(code)`. Two implementations are planned:
- **LocalAdapter** (available from the start) stores records in the browser and has a hidden researcher export (JSON/CSV, via `?export`). It is used for testing until the provider is chosen.
- **The chosen database adapter**, about half a day of work once the provider is decided.

**Decision needed by the end of week 1 (≈ 21 Nov).**

### 6.2 Options

| | Supabase *(recommended)* | Firebase Firestore |
|---|---|---|
| Free | yes; projects pause after 7 days of low activity ([docs](https://supabase.com/docs/guides/platform/free-project-pausing)) | yes (Spark plan) |
| Client can write but not read | Row-Level Security: insert-only policy, no select policy | Security rules: `allow create` with validation, deny read |
| Withdrawal by code | a database function `withdraw(code)` deletes the matching rows | the document id is the code, and the rules allow delete of that one id |
| Export | CSV from the dashboard table view | console export is less direct; a small script is needed |
| Region | EU (Frankfurt) chosen at creation | chosen at creation |
| Extra library in the game | none: plain `fetch` to its REST API | none if REST is used |

**Recommendation: Supabase in the EU region.** Because of the pausing rule, create the project just before launch. During December collection, steady traffic keeps it active.

### 6.3 What is stored (one row per completed playthrough)

```json
{
  "session_code": "K7Q2M9XH4TPA",
  "run": 1,
  "lang": "en",
  "played_on": "2026-12-03",
  "minutes": 14,
  "survey": { "S_A": 4, "S_B": 5, "S_C": 3, "S_D": 2, "S_E": 4 },
  "decisions": {
    "A": { "first": "A_install",  "final": "A_install" },
    "B": { "first": ["B_photos","B_chats"], "final": ["B_photos"] },
    "C": { "first": "C_verify",   "final": "C_verify" },
    "D": { "first": "D_allow",    "final": "D_limit" },
    "E": { "first": "E_terminate","final": "E_terminate" },
    "will": "after_install"
  },
  "free_text": "optional, max 500 characters",
  "app_version": "1.0.0"
}
```

**Never sent:** names, pronouns, browser or device details, or exact times. The record is sent **once**, after a summary screen ("this is exactly what will be sent"). Quitting earlier sends nothing.

### 6.4 Security rules (Supabase draft, to be tested in M7)

```sql
create table public.responses (
  id           bigint generated always as identity primary key,
  session_code text not null check (session_code ~ '^[A-HJ-NP-Z2-9]{12}$'),
  run          smallint not null check (run between 1 and 20),
  lang         text not null check (lang in ('en','pt')),
  played_on    date not null default current_date,
  minutes      smallint check (minutes between 0 and 240),
  survey       jsonb not null,
  decisions    jsonb not null,
  free_text    text check (char_length(free_text) <= 500),
  app_version  text check (char_length(app_version) <= 20),
  unique (session_code, run)
);
alter table public.responses enable row level security;

-- the public (anon) key may only INSERT; with no select/update/delete policy it cannot read or change rows
create policy insert_only on public.responses for insert to anon with check (true);

-- withdrawal: deletes every run for that code, returns how many rows were removed
create function public.withdraw(code text) returns integer
language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  delete from public.responses where session_code = code;
  get diagnostics n = row_count;
  return n;
end $$;
revoke all on function public.withdraw(text) from public;
grant execute on function public.withdraw(text) to anon;
```

The game sends inserts with `Prefer: return=minimal`, so it never asks to read back what it wrote.

### 6.5 Security caveats of writing from the browser

- The public key is **visible to anyone** who opens the page source. That's by design: it only allows what the rules allow (insert, and withdraw-by-code).
- **Spam is possible:** anyone can post fake rows. Mitigations:
  - strict column checks and size limits;
  - a unique `(session_code, run)`;
  - an `app_version` check;
  - during analysis, dropping rows with impossible combinations or implausible `minutes`;
  - pausing collection if abuse appears.

  A CAPTCHA was not chosen because it would load a third-party script.
- **Withdrawal:** codes are 12 characters from a 32-character alphabet (about 60 bits), made with `crypto.getRandomValues`, so guessing someone else's code is not practical.
- **IP address:** the provider, like any server, sees the participant's IP address and may log it. The consent text says so. The game never stores it in the table.

### 6.6 "No other network requests", enforced

`index.html` carries a Content-Security-Policy that allows scripts, styles and media only from the site itself, and network calls only to the database address (e.g. `connect-src 'self' https://<project>.supabase.co`). Anything else, such as an accidental CDN font, is blocked by the browser and shows in the console. Check it in the browser's Network tab.

### 6.7 Analysis for the class discussion

1. Export the table as CSV and keep `run = 1` for the main analysis.
2. Use counts and percentages per option (A–E, each B category, verify vs not, will timing).
3. Show survey answer distributions, and cross-tables of survey answer by final choice for the same theme. These are exploratory and descriptive only; no "consistency score".
4. Count how many players changed B, C or D at E.
5. Code the free-text answers by theme by hand.

A spreadsheet pivot table is enough. A short Python or R notebook is optional.

---

## 7. Optional language-model layer (not in v1)

OTTO's lines come from a `ResponseProvider` interface. v1 uses the **ScriptedProvider** (the chat.yaml text). A later **LocalModelProvider** could run a small model in a Web Worker (e.g. WebLLM or transformers.js on WebGPU). It would rewrite OTTO's scripted line in the friend's style using the text files the player opened, while replies stay choose-from-a-list, so the reflection logic stays deterministic.

Limits to know before adding it:
- **Model size:** small chat models are hundreds of MB to a few GB, which means a long first load.
- **Browser support:** WebGPU is not yet available everywhere (unverified for Firefox and Safari), and the game is desktop-only anyway.
- **Hosting:** model files exceed static-host file limits, so they would come from a third-party host. That is an extra network request beyond the current requirements: it exposes the participant's IP address to that host, needs a CSP change and needs disclosure in the consent text.
- **An external model API** would send what the player reads or types out of the browser. That conflicts with the anonymity and GDPR promises and needs explicit consent. It is not recommended.

---

## 8. Look, feel and assets

- **The laptop:** an original, late-90s/2000s-*inspired* desktop with bevelled grey windows, a taskbar, chunky icons and a soft wallpaper. It is deliberately **not** a copy of Windows (no Microsoft logos, icons or system texts). The OS name and colours live in `customization/theme.yaml`.
- **OTTO:** a modern, clean, friendly product (logo, rounded chat bubbles, upbeat marketing copy) that looks newer than the old laptop. That contrast is the only "signal". The logo can be swapped later, for example for a mascot.
- **Memories:** images and files marked `memory: true` open with a gentle faded/sepia style, to separate the friend's real material from OTTO's words. There are no glitches or horror effects.

| Asset | Source | Licence |
|---|---|---|
| Icons, OTTO logo, wallpaper (placeholders) | drawn by Claude as SVG for this project | project-owned |
| Sound effects | synthesised in code (Web Audio API) | project-owned |
| Font | system fonts (nothing shipped) | n/a |
| Photos, voice notes, video, story text | the team | team-owned; no real people |

Each new asset added later goes into this table with its source and licence.

---

## 9. Milestones (≈ 10 working days)

| # | Milestone | Done when… | How to check |
|---|---|---|---|
| M0 | Project setup: Git repo, Vite, content build + checker skeleton, CSP | `npm run dev` shows an empty stage; `npm run check` runs | open the dev URL; edit a YAML file and see the checker react |
| M1 | Desktop shell: scaler, icons, taskbar, windows (open, close, minimise, focus), Exit button | windows behave; stage scales | resize the browser and try full screen; under 1024 px the note appears |
| M2 | Disk, explorer and viewers (text, document, image, audio, video) | the sample disk opens; unsupported files refuse | test file `Memórias/Férias_çãõ.txt` shows correctly; play an MP3 and an MP4 |
| M3 | Engine: state, events, triggers, chapters, save/resume, tokens, notifications | a sample trigger chain runs from YAML | refresh mid-chapter to resume; switch pronouns and the text changes |
| M4 | Screens before the laptop: language, warning, consent, survey, setup | the full pre-flow works; Exit wipes data | decline consent → nothing stored; Portuguese screens show accents |
| M5 | OTTO and themes A–E, will action, memory style, closings | all routes playable with **placeholder text** | play the refusal route, the full route, and changing answers at E |
| M6 | Reflection from `reflection.csv` + "you said / you did" + free text | the same choices give the same reflection | play the same route twice and compare |
| M7 | Data: summary screen, LocalAdapter, chosen DB adapter, `db/schema.sql`, withdrawal | a row arrives; the client cannot read it; withdrawal deletes it | Network tab shows one request only; a manual read with the public key is refused; withdraw with the code |
| M8 | `CONTENT_GUIDE.md`, `DEPLOY.md`, Portuguese structure check, playtest checklist | the team can edit and deploy without help | a teammate adds a file and a chat line by following the guide |

The story team's real texts can replace the placeholders at any time from M3 onward without code changes.

---

## 10. Open items and risks

- **Database provider:** decide by ≈ 21 Nov (Supabase recommended).
- **Hosting:** not chosen yet. On a free account, GitHub Pages publishes only from **public** repositories, which would make the whole script public. Cloudflare Pages works with **private** GitHub repositories on its free plan (500 builds/month). Both details come from the sources below; I have not tested them.
- **Length:** the guide asks for 10–15 minutes including the reflection, and the writers will choose their own text length. The playtests in M5/M6 will time real runs; if a run is too long, it will show up there.
- **Ethics:** check with the lecturer whether a public survey needs approval. The consent text is a draft, not legal advice.
- **Placeholder content:** until Inês and Rui (story) and André and Balinha (research table) deliver, the game runs on placeholder text and placeholder research rows that are **not** scientifically validated.
- **Later, if wanted:** an OTTO mascot, email or WhatsApp-style apps, the language-model layer, tests.

## 11. What I could not verify / assumptions

- The Supabase SQL in §6.4 is a draft; insert-only and withdrawal will be tested in M7. Whether `return=minimal` inserts work with no select policy is believed but not yet tested.
- I haven't checked Supabase's per-IP rate limits on its free tier; §6.5 does not rely on them.
- WebGPU support across browsers (§7) has not been checked.
- Assumed: a 5-point agree/disagree scale, worded by the research team; players get no personal data download (researchers export instead); at E, the review window lets the player re-answer B, C and D (for C, choosing "verify" there means opening the evidence file).

**Sources checked (Nov 2026):**
- [Supabase: project pausing](https://supabase.com/docs/guides/platform/free-project-pausing)
- [GitHub's plans](https://docs.github.com/en/get-started/learning-about-github/githubs-plans)
- [GitHub community: Pages on private repos (Free plan)](https://github.com/orgs/community/discussions/22817)
- [Cloudflare Pages limits](https://developers.cloudflare.com/pages/platform/limits)
