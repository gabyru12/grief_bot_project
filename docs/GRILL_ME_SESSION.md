# Grill-me session: questions and answers

Record of the planning interview for *The Icarus Dilemma* (Nov 2026). Questions are kept as they were asked, each with the recommended answer (➡️) that was offered, followed by the user's answer exactly as given. Five rounds, Q1–Q67.

Source documents: the original brief (`prompt_for_building_os_interface.txt`) and the team guide (`IAS_OTTO_Guia_Cientifico_e_Requisitos_do_Jogo.pdf`). Where they conflicted, the guide won (see Q42).

---

## Round 1 (Q1–Q11)

**Q1 - Deadline and team**: When is the game due, including any time you need afterwards to collect responses before the class discussion? Who will write code, and who will edit content only? Your answer sets the scope, the tech stack and how simple the content formats need to be.
➡️ My guess: about 4–8 weeks, with one or two people writing code and the rest editing content. I'll scale the plan to whatever the real numbers are.

> **Answer:** 2 weaks, the month of december is meant for gathering feedback from the players and analyzing them

**Q2 - Play length**: You said it "should be quick," like the soup game. Your outline is large for a quick game: onboarding, a survey, flashbacks, a forced minigame, five dilemmas, a hidden folder, a timed terminal minigame and six endings. What total time should one playthrough take, from the consent screen to the results?
➡️ About 15–20 minutes in total: 2–3 minutes of survey, 10–15 minutes of play and 2 minutes of results. Each minigame lasts under 60 seconds. Every dilemma sits on the main path; only the endings branch.

> **Answer:** Yea, for sure 20 min maximum. Around 15 minutes would be great.

**Q3 - Language of the game**: Your base script is in Portuguese, but you'll share the link on Reddit and Discord, where most players read English. Options: (a) Portuguese only. (b) English only, translated from the Portuguese script. (c) Both, chosen at the start. This doubles the text to write and to check.
➡️ (c). Content files are keyed by language from day one. Portuguese is the reference text and English follows it. If you're short on time, ship (b) first and keep the file structure ready for Portuguese.

> **Answer:** Both, ideally, but english primarly.

**Q4 - Devices**: Drag-and-drop between windows, right-click menus, a hijacked cursor and a typed terminal all assume a mouse and keyboard. Should phones and tablets get a "please play on a computer" screen instead of a touch version?
➡️ Yes: desktop and laptop browsers only, with a polite block screen on touch devices. A touch version would roughly double the work on the interface.

> **Answer:** Yes, desktop and laptop browser.

**Q5 - Research-ethics context**: Does your course or university require ethics approval, a data-protection review, or specific storage rules (for example EU-only data or institution-approved tools) for a public survey? Should players confirm they are 18 or older?
➡️ Add an 18+ confirmation to the consent screen, because the link is public and the theme is grief. Please also tell me any university rules, since they decide which database we can use. I'll ask about the database next round.

> **Answer:** It should have something about it, but we are not aware of that, neither were adverted to that. There is no obligation on the databases we can use tho, we should only be careful about those that require permission or consent from the provider.

**Q6 - The PDF and photos versus "only .txt, audio and video"**: Your story needs Digital_Will_Consent.pdf, which the player reads, and photos, which the "keep only the photos" ending preserves. Options: (a) Rename the will to `.txt` and make the photos untouchable "evidence" files that can't be opened. (b) Add two read-only viewers: a document viewer that shows the "PDF" as styled text, and an image viewer. Everything else stays unopenable. (c) Keep the rule as written. Only OTTO can open the PDF and the photos, by force, as a story moment.
➡️ (b). Opening the will is the central moment of the game, and a plain `.txt` loses its weight. The "PDF" is really a styled text page, so there's no PDF library and nothing extra to load. The photos would be images your team made or illustrated, not real people.

> **Answer:** I agree with the digital will idea, when you said it should be a PDF styled text page, so that it more impactful than a .txt file. Audio and video files will optionally be added by the end so leave open the possibility that I may need to use them.

**Q7 - Full-screen effects: optional or required?** Your brief marks them optional, but scenes depend on them: the sepia flashback, OTTO's glitch, the blue-screen ending and the shutdown.
➡️ The visual effects are required, because the story needs them. Sound is optional, with a mute toggle. Add a "reduce flashing/motion" setting, offered on the content-warning screen: glitch and flicker are a photosensitivity risk, and you are sharing the link publicly.

> **Answer:** It should be recommended in the beginning to play on full screen, however, it should still be possible to play on a window. And it should definetly be a content-warning screen! We can not forget it.

**Q8 - How the five dilemmas lead to the six endings**: Each dilemma gives ALLOW, RESTRICT, SUSPEND or RETIRE. That makes 4⁵ = 1,024 combinations, so they can't each map to an ending. Options: (a) The dilemmas are recorded and shape consequences and dialogue, but the ending is chosen in one final, explicit decision. Some ending options unlock only if certain dilemma answers were given. (b) The ending is calculated from a tally of the dilemma answers. (c) A mix of (a) and (b).
➡️ (a). It keeps the endings understandable and avoids a hidden "moral score," which your brief rules out. Here is the list of six endings as I read your outline: 1. Accept the illusion. 2. Respect the will and contain OTTO, keeping the photos. 3. Destroy the copies, and win the format. 4. Destroy the copies, lose, and get the blue screen. 5. Ally with OTTO and build the clone. 6. Ally with OTTO, then repent, which triggers the self-destruct virus. Is that the right six?

> **Answer:** (b) The following finales should definetely be implemented: 1 (Accept the illusion), Accepting / respecting the will and ending the game (record that game by that user but still give them the choice to replay it to enjoy the game, however the first should be the most important one in the record), etc. (we should discuss this later tho)
>
> *(Later superseded: endings were replaced by a deterministic reflection, see Q24 and Q42.)*

**Q9 - The base script today**: Where does your team's Portuguese script live (Google Doc, Word file, something else)? Roughly how complete is it, and does it already contain the dilemma texts and the six endings? If you can share the file, I'll read it myself before I propose the content formats.
➡️ Share it, whatever state it's in. The content formats should fit how your writers already write, not the other way round.

> **Answer:** It is a .txt file, we will send it / them later.

**Q10 - OTTO's forced "Accept" versus the real consent screen**: OTTO disables "Decline" and drags the cursor onto "Accept". That parodies a dark pattern, and it happens right after a real research consent screen. Should the real consent and survey screens look clearly different from the in-game desktop? For example, a plain page outside the desktop, with a free and working "Decline/Exit".
➡️ Yes. Make the real consent and survey screens deliberately plain, and make it clear afterwards that the in-game "Accept" collected nothing.

> **Answer:** A good idea here would be to kinda induce a force on the mouse, for ex. if the decline is on the left and the user tries to drag the mouse to the left, it turns red and starts dragging itself to the right, forcing the player to drag it more and more until it is on the decline button. Eitherway, he should still have the choice to decline.
>
> *(Later superseded: the forced-cursor idea was dropped, see Q25.)*

**Q11 - Scope of the friend's personality traits**: You listed traits like empathetic, tricky, playful, teasing, aggressive, passive-aggressive, proud, toxic and depressive. If every line changes with the chosen trait, the writing multiplies. The darker traits also raise a concern: a "depressive" or "toxic" simulated dead friend in front of grieving players. Options: (a) The player picks 1–2 traits from a short list of about 6. The traits change only OTTO's imitation lines and a few key moments. (b) Traits change most of the dialogue. (c) Keep the full list, with the darker traits included.
➡️ (a), with "depressive" removed and "toxic" softened to "harsh". Each trait needs only around 5–10 written variants.

> **Answer:** Maybe its better to not implement this option, and a one and only personality (gentle).

---

## Round 2 (Q12–Q23)

**Q12 - Who builds it**: You didn't say who writes the code. Should I write nearly all of it, with your team writing and editing the content files and testing?
➡️ Yes. With two weeks, one main coder (me, working with you) and the team on content is the realistic split.

> **Answer:** Yes, you build it.

**Q13 - What ships in two weeks**: I suggest this split. **Must have:** content warning, consent, the survey and the final comparison screen; the desktop shell: windows, taskbar and icons; the file explorer, with drag-and-drop to the Recycle Bin; the text viewer and the "PDF" viewer; OTTO's popups and the forced "Accept" scene; the decision popup and the five dilemmas; the hidden Project_Ego_Backup folder; a small terminal; the endings, the sepia, glitch and blue-screen effects, and the database. **Stretch, only if time allows:** OTTO's forced retro minigame (or a 20-second placeholder); interactive memory scenes (static sepia scenes otherwise); the Portuguese version; sound, audio and video; a right-click menu. **Out:** the language model layer. Do you accept this split?
➡️ Yes. I'll design the code so every stretch item fits in later without restructuring.

> **Answer:** Yes, almost all of it. The one change is that sound, audio and video should be a must have.

**Q14 - Portuguese timing**: If Portuguese arrives in the middle of December, early and late players get different versions. Your script is in Portuguese, so who translates it to English? Options: (a) Your team translates. (b) I draft the English and your team checks it. (c) I draft both, with Portuguese checked by a native speaker.
➡️ (b). The English version goes live first. Portuguese launches only if it's ready before collection starts, and every record stores the language it was played in.

> **Answer:** (b)

**Q15 - Pronoun options**: Free-text pronouns break sentence grammar ("{they} {is}"). Should players choose from **she/her, he/him and they/them** for both themselves and the friend?
➡️ Yes, three fixed sets. Writers use tokens like `{friend.they}` and `{friend.their}`, and verb agreement is handled for "they." In Portuguese, gender also changes nouns and adjectives (amiga/amigo). I'll ask about that only if Portuguese ships.

> **Answer:** Yup.

**Q16 - Tallied endings without a "moral score"**: You picked (b), endings calculated from the dilemma answers. Your brief also says there's no moral score. Some endings can't come from a tally at all: winning or losing the format minigame, and the last-minute repentance. I suggest: 1. The tally works out which of the four answers you gave most often. That is a stance, not a score. 2. The stance picks the ending route. Mostly ALLOW leads to accept the illusion or ally with OTTO. Mostly RESTRICT leads to respecting the will and keeping the photos. Mostly SUSPEND or RETIRE leads to destroying the copies. 3. A final interaction inside the route splits it further: the format minigame win or lose, or repent or don't. Do you accept this tally-plus-final-split structure? We'll work out the exact list of six later, as you asked.
➡️ Yes. Ties go to the most recent dilemma's answer.

> **Answer:** A mixture of two or three. I think we'll probably not use that many decision boxes (only two probably yes/no)

**Q17 - Replays**: You want the first playthrough to be the main record, with replay still possible. Options: (a) Replays send nothing. Only the first run in that browser is recorded. (b) Replays are sent too, under the same session code and flagged `run: 2, 3…`. (c) Replays are sent with a new code. On a replay the consent screen and survey are skipped and the player goes straight to the desktop.
➡️ (b). The browser remembers the code locally, and analysis uses `run = 1` by default. Clearing the browser data makes the player look new, which we can't prevent without tracking. I'll note that as a limitation.

> **Answer:** (b)

**Q18 - The database**: There are no university restrictions, and you want to avoid anything that needs the provider's special permission. Options: **(a) Supabase, EU (Frankfurt) region.** Postgres with row-level security, so clients can only insert and never read. Withdrawal works through a small server-side function that deletes by session code. CSV export comes from the dashboard. It's free and needs no approval. **(b) Firebase Firestore.** Similar security rules, but Google-hosted, and the EU region is chosen at setup. **(c) Google Forms submitted in the background.** It's the simplest, but withdrawal is manual, the data sits in your Google account, and posting forms from a script is fragile.
➡️ (a). One caveat I believe is true but will check: Supabase pauses free projects after about a week of inactivity, so you'd create it just before launch.

> **Answer:** we'll decide this later on

**Q19 - When data is sent**: Options: (a) Once at the end, after a summary screen ("here is exactly what will be sent"). (b) After each step, so data from people who quit partway is kept.
➡️ (a). The consent story is clearer, the code is simpler, and nothing from people who quit is stored. Their consent didn't cover partial play anyway.

> **Answer:** (a)

**Q20 - Survey format**: The final screen compares what the player said with what they did. Should each survey question ask about the general principle using the **same four options** (ALLOW, RESTRICT, SUSPEND, RETIRE)? For example: "A service turns someone's preserved messages into a chatbot. Should that be…?" There would be one question per dilemma, plus 2–3 general Likert questions (on consent, authenticity, who may authorise).
➡️ Yes. Matching formats make the comparison direct and the class analysis simple. The final screen shows each pair side by side, with no "inconsistent" label. It would also offer one optional free-text box: "Did something change your mind?"

> **Answer:** Likert questions (on consent, authenticity who may authorize) could be nice to have. The options for the final survey don't need to be the same four options(ALLOW, RESTRICT, SUSPEND, RETIRE)

**Q21 - Photos**: The "keep only the photos" ending needs photos. Should there be a simple image viewer for drawn or illustrated photos made by your team, with no real people?
➡️ Yes. A minimal image viewer is about half a day of work.

> **Answer:** this simple image viewer won't take half a day of work, it will show show the picture in a window (simple) with no features added to it.

**Q22 - Cursor mechanics and the real consent screen**: Your idea is that the cursor turns red and pulls away from "Decline," but the player can still win the fight and decline. Browsers can't move the real cursor. I'd hide it during the game and draw our own, which can then drift, resist and change colour. The real research consent screen would stay a plain page with the normal cursor and an ordinary Decline button. Do you accept both?
➡️ Yes: a drawn cursor throughout the desktop, and the real consent screen plain and outside the game world.

> **Answer:** I don't know what you meant by this "The real research consent screen would stay a plain page with the normal cursor and an ordinary Decline button. Do you accept both?" and I think we'll just add some visual effect showing OTTO trying to drag the button to accept (by making the cursor red and the region focused while the surrounding are blurred to give more visual enphasis)

**Q23 - Accessibility of effects**: Should the content-warning screen also offer "reduce flashing/motion"? It would tone down the glitch and flicker without removing scenes. Sound would be off by default with a toggle, and only matters if sound ships.
➡️ Yes. The link is public and glitch effects can affect people who are sensitive to flashing light.

> **Answer:** yes
>
> *(Later superseded: with no glitch effects, reduced motion was no longer relevant, see Q63.)*

---

## Round 3 (Q24–Q41): decisions and the technical side

**Q24 - Decision points (clarifying Q16)**: The brief described five dilemmas, each with four choices (ALLOW, RESTRICT, SUSPEND, RETIRE). You now expect about two yes/no decisions, mixed with other ways of reaching an ending. I'll build one decision popup that reads its 2–4 options, texts and consequences from a content file. That way the number of decisions and options can change later without code changes. On "a mixture of two or three": I read it as some endings come from the decisions, some from minigame results, and some from one final choice. Is that right?
➡️ Yes: one flexible decision popup, and endings decided by a small rule table in a content file, for example `if decision1 = yes and formatGame = lost → BSOD ending`. Your writers can edit that table.

> **Answer:** I believe we're about to scratch the idea of possible endings and instead provide a deterministic reflection of the players choices throughout the game given their decisions (mentioned in the most recent attached file)

**Q25 - The forced "Accept" scene (clarifying Q22)**: There are two "consent" moments: 1. The real research consent before the game. The player genuinely agrees to share anonymous data. It must be honest, with no tricks. 2. OTTO's fake "Accept" inside the story. I only meant that #1 stays plain and is never manipulated. For #2, your new effect (red cursor, blurred surroundings, a spotlight on Accept, OTTO "pulling" toward it) can be done in two ways: (a) **The real cursor**, recoloured red. The *buttons* move instead: Accept slides under the cursor and Decline slips away, but can still be clicked. (b) **A drawn fake cursor** that resists the player's movement. Clicks land where the drawn cursor is, so that has to be handled separately.
➡️ (a). It's simpler and more reliable, and nothing gets out of step between what the player sees and where they actually click. Decline always stays reachable.

> **Answer:** scratch out this idea of otto taking over the cursor we're not using that anymore I believe (think of it as optional)

**Q26 - Tech stack**: **Vite** (build tool, MIT licence), **TypeScript** (Apache-2.0), **no UI framework** (plain DOM code), **Vitest** for tests (MIT). At runtime the game would include almost no third-party code. A window manager and desktop are simple enough that React, Svelte and similar frameworks would mostly add weight. Do you accept this stack?
➡️ Yes. Content files are checked and converted to JSON at build time, so the shipped game needs no parser library.

> **Answer:** Yes, I'm not aware of any web dev stacks or frameworks so you may choose what's better (the more simple it is the better)

**Q27 - Fixed virtual screen**: OTTO "jumps onto a folder," the cursor scene targets exact buttons, and the game must work both full screen and in a window. Should the desktop be a fixed **1280×720** "monitor" that scales to fit the browser window, with black bars where needed, instead of a layout that rearranges itself?
➡️ Yes. Scripted positions stay exact, and every screen size looks the same. Windows under 1024 px wide get a "please enlarge the window" note.

> **Answer:** Yes. Scripted positions stay exact, and every screen size looks the same. Windows under 1024 px wide get a "please enlarge the window" note.

**Q28 - Content folder that mirrors the in-game disk**: Writers create real folders and files, for example `content/en/disk/Desktop/Photos/beach.png` and `content/en/disk/Documents/diary.txt`. The build turns that tree into the in-game file system. Special properties (hidden, can't be deleted, revealed when X happens) go in a small `_meta.yaml` next to the files. Do you accept this layout?
➡️ Yes. Adding a file to the game is the same as adding it to a folder, with no JSON to edit by hand. A checker script reports broken references with plain-English messages.

> **Answer:** Yes. Adding a file to the game is the same as adding it to a folder, with no JSON to edit by hand. A checker script reports broken references with plain-English messages.

**Q29 - Scene engine: data-driven, coded, or a mix**: A fully data-driven script language would take days to build. Options: (a) **Mix.** Simple reactions live in YAML, as "when X happens, if Y, do Z". For example: when the player opens `Digital_Will_Consent.pdf`, OTTO says line 12, the glitch runs, and a flag is set. Complex scenes (the forced Accept, the minigames, the format countdown, the endings) are coded, but all their *text* comes from content files. (b) **ink**, a narrative scripting language (MIT) with a visual editor (Inky). It's great for branching dialogue but awkward for "the player dragged a file to the bin." (c) Everything coded, with only the text in files.
➡️ (a). Writers control the text and the simple triggers; I code the timed and visual set pieces.

> **Answer:** (a)

**Q30 - Free exploration or chapters**: With a 15-minute target, free exploration risks players wandering for 20 minutes or never finding the will. Options: (a) **Chapters.** Each chapter unlocks certain files, OTTO nudges toward the key file after about 60 seconds of idling, and the big beats (the will, the Ego backup, the endings) are required. (b) Fully free exploration, with nothing locked.
➡️ (a), with 4–5 chapters. Some exploration stays free inside each chapter, so the desktop doesn't feel like a corridor.

> **Answer:** yeah I think we'll got with (a)

**Q31 - Reloading mid-game**: If someone refreshes the page at minute 9, should they resume where they left off? Options: (a) Resume from the start of the current chapter. (b) Start over (survey answers are kept). (c) Restart everything.
➡️ (a). Progress is saved in the browser's own storage after each chapter. Names and pronouns are saved there too, and they never leave the browser.

> **Answer:** (a)

**Q32 - Drag-and-drop and deleting**: I'd build dragging with my own pointer code instead of the browser's built-in drag-and-drop, which is hard to style and fights the scripted scenes. Accidental damage is the other risk: a player could drag the will to the bin and empty it before reading it. Should each file have flags (`movable`, `deletable`), with story-critical files refusing and showing an OTTO line ("Oh, you don't want to do that!")?
➡️ Yes. Emptying the Recycle Bin can also be a story trigger.

> **Answer:** no file should be deletable, or movable for now. Keep it simple like opening folders and files, with windows that can be minimized or closed. Additional, but not necessary functionallity such as dragging could be added later on

**Q33 - Terminal**: Should the terminal read the same virtual disk (`ls`, `cd`, `cat` show the real in-game files)? Story commands would be defined in a content file, and unknown commands get "command not found" or an OTTO reply. For the timed format minigame, I'd use typing a 3–4 command sequence shown as hints before a 45–60 second timer runs out. Small typos are forgiven, but a wrong command costs time.
➡️ Yes to both. Story commands and the timer length live in content files.

> **Answer:** forget for now the timed format minigame. I think the terminal is also an additional feature that's not necessary right now

**Q34 - Audio and video formats**: **Formats:** browsers handle MP3 audio and MP4 (H.264 + AAC) video everywhere, so I'd require only those. **Size:** I'd cap each file at about 10 MB to keep load times short. GitHub Pages also limits single files to 100 MB. **Autoplay:** browsers block sound until the player has clicked something. The first click on the content-warning screen will unlock audio, so OTTO's sounds work afterwards. Who makes the audio and video (voice notes from the friend, a video message)? Do you accept these format and size limits?
➡️ Yes to MP3 and MP4 with a 10 MB cap. Team members can record the voices. Sound effects (clicks, glitches, startup chime) I can make with a sound generator, so they're original and we own them outright.

> **Answer:** yes

**Q35 - Visual style and artwork**: To avoid trademark trouble, the desktop should be *evocative* of late-90s/2000s systems without copying Windows' actual icons, logo or blue-screen text. Proposal: I draw the icons and OTTO as simple SVG, so OTTO's eye colour is just a style change. One self-hosted pixel or system-style font under the SIL Open Font License (OFL). Photos and memory scenes are made by your team. Do you accept this?
➡️ Yes. I'll keep an asset list with source and licence for every file.

> **Answer:** ok for now, make it so it is easy for anyone to change icons, logos, blue screen text (organize them in an easily configurable customization folder for example)

**Q36 - Languages and pronoun tokens**: Even though Portuguese is a stretch goal, should the structure be bilingual from day one? `content/en/…` and `content/pt/…` folders. Interface strings ("Close," "Recycle Bin") in one file per language. Tokens like `{player.name}`, `{friend.they}`, `{friend.their}` and `{friend.are}`. If a Portuguese text is missing, it falls back to English and the checker warns about it.
➡️ Yes. Adding Portuguese later then means only writing files, not changing code.

> **Answer:** Yes. Adding Portuguese later then means only writing files, not changing code.

**Q37 - Database placeholder while the choice waits**: You deferred the provider. I'd write the sending code behind a small "adapter" interface, plus local JSON/CSV download, which works without any database. Plugging in the real provider then takes about half a day. Session codes would be 12 random characters made with the browser's secure random generator, so they can't be guessed for fake withdrawals. When will you decide on the provider?
➡️ Yes to the adapter and the 12-character codes. Decide by the end of week 1, so there's time to test security and withdrawal before December.

> **Answer:** Yes to the adapter and the 12-character codes. Decide by the end of week 1, so there's time to test security and withdrawal before December.

**Q38 - Enforcing "no other network requests"**: A Content-Security-Policy tag can make the browser *refuse* any network request except the database's address. That would prove requirement 3A is met, and it also blocks accidental CDN fonts. Should we add it?
➡️ Yes. It costs one line, and the test checklist will check it in the browser's network tab.

> **Answer:** Yes. It costs one line, and the test checklist will check it in the browser's network tab.

**Q39 - Testing scope**: Two weeks rules out heavy automated testing. Proposal: unit tests for the logic that matters (ending rules, pronoun and token replacement, the file system, and the data sent); a content checker that runs on every build; a written playtest checklist for your team, covering each ending, Portuguese accents, offline behaviour, and that the database can't be read. Do you accept this scope?
➡️ Yes. No end-to-end browser test suite unless time is left over.

> **Answer:** we'll handle the tests later on, don't worry about that right now

**Q40 - Hosting, repository and project folder**: GitHub Pages is free only for *public* repositories on a free account, so the whole script would be publicly visible on GitHub. I believe that's right but I'll check. Options: (a) Public GitHub repo and GitHub Pages. (b) Private GitHub repo and Cloudflare Pages, which is free with private repos. Also, where should the project live on your machine? For example `C:\Users\arcan\Desktop\projects\<game-name>`. And what's the game's working title?
➡️ (b), so the spoilers aren't public while people are still playing. The folder would go next to your other projects in `Desktop\projects`.

> **Answer:** we'll choose the hosting app later on, the project should live on "C:\Users\arcan\Desktop\projects\ai_e_sociedade"

**Q41 - Supported browsers**: Should we support only current desktop Chrome, Edge, Firefox and Safari (roughly the last two years of versions)? Safari needs a few special cases for full screen.
➡️ Yes. The playtest checklist covers Chrome and Firefox at minimum, plus Safari if someone on the team has a Mac.

> **Answer:** Yes. The playtest checklist covers Chrome and Firefox at minimum, plus Safari if someone on the team has a Mac.

---

## Round 4 (Q42–Q57): after reading the team guide

**Q42 - Which document wins**: Your original brief and the team guide conflict in several places: the forced "Accept" scene is forbidden by the guide; the six endings are replaced by the reflection; the guide doesn't mention Project_Ego_Backup, the forced retro minigame or the blue-screen ending; the will now keeps photos only, where before it kept messages and photos. Should the **guide win every conflict**? That would drop the forced Accept, the forced minigame and the blue screen entirely. Ego_Backup would stay only if Inês and Rui keep it in the script.
➡️ Yes, the guide wins. The footer says "OTTO | The Icarus Dilemma", so I'll also use **The Icarus Dilemma** as the working title.

> **Answer:** The team guide (IAS_OTTO_Guia_Cientifico_e_Requisitos_do_Jogo.pdf) is simpler than my original brief (prompt_for_building_os_interface.txt) on storytelling. It's more structured on what matters most, though: helping the player understand and reflect on the moral and legal implications of using AI this way. So treat the guide as the main source of ideas for the game. The storytelling will come bit by bit.

**Q43 - Your survey idea versus the guide's reflection**: `outras_ideias.txt` has your pre-game survey and a "what you said vs what you did" screen. The guide's reflection doesn't mention either, and the whole experience has to fit in 10–15 minutes. Options: (a) Keep a short pre-game survey: 5 Likert questions, one per theme A–E, about a minute in total. Add one compact "you said / you did" block after the three perspectives. (b) Drop the survey and use only the guide's reflection.
➡️ (a). It fits the time budget, gives the class data that can be compared, and the guide doesn't forbid it. The research team (André and Balinha) should check the wording.

> **Answer:** (a)

**Q44 - Working with André**: The guide lists André and Gabriel as developers. Should the project be a Git repository (on GitHub, private for now) that André can clone, edit content in and review? I would still write the code.
➡️ Yes. I'll set up the repository so content edits never require touching code.

> **Answer:** Yes. I'll set up the repository so content edits never require touching code.

**Q45 - Decision themes A and E, and the refusal route**: **A (start or not):** OTTO's ad appears as a popup with two equal-weight buttons, **Install** and **Not now**. "Not now" leads to a short closing scene and then the full reflection, skipping B–D as the guide says. **E (continue or end):** **Continue**, **Pause** or **Terminate**. Before confirming, the player can change their B, C and D answers. Both the first answer and the final answer are recorded, and the reflection mentions a change neutrally. Do you accept this?
➡️ Yes. A short closing scene (2–4 lines) for each E choice runs before the reflection, with no win/lose framing.

> **Answer:** Yes. A short closing scene (2–4 lines) for each E choice runs before the reflection, with no win/lose framing.

**Q46 - Theme B (data use) as an installer permission screen**: OTTO's installer shows a checklist of data types: photos, chats, voice notes, diary, emails. Each can be allowed or refused, and photos are the only type the will permits. "More data → more resemblance" would work through **three resemblance levels** (low, medium, high), based on what was granted. Each of OTTO's key lines is written in three versions instead of one version per combination of checkboxes. Do you accept this?
➡️ Yes. The installer is a natural fit for the desktop setting, and three levels keep the writing manageable.

> **Answer:** Yes. The installer is a natural fit for the desktop setting, and three levels keep the writing manageable. The writers should be communicated of this decision to prepare the three levels of communication used by OTTO.

**Q47 - Theme C (a convincing but unconfirmed memory)**: OTTO tells a romantic memory that may be false. The player can **Accept** it, **Question** OTTO, or **Verify** it. Verify means opening the real file (the chat log or diary) in the file explorer, which doesn't support OTTO's claim. Should opening that file count as choosing "verify"?
➡️ Yes. Checking evidence in the file explorer is a real action that only this kind of game can offer. The other two options are ordinary buttons in the chat.

> **Answer:** Yes. Checking evidence in the file explorer is a real action that only this kind of game can offer. The other two options are ordinary buttons in the chat.

**Q48 - Theme D (OTTO acting on its own)**: OTTO asks for permission to send messages on its own. The options are **Allow**, **Limit** (only when the player opens the chat) or **Off**. The effect is visible: with Allow, OTTO sends 2–3 unprompted notifications in the corner of the screen while the player explores. With Limit there is one; with Off there are none. Do you accept this?
➡️ Yes. It's the clearest way to make "more autonomy → more intrusion" visible, without OTTO seeming conscious.

> **Answer:** Yes. It's the clearest way to make "more autonomy → more intrusion" visible, without OTTO seeming conscious.

**Q49 - The chat with the friend's representation**: Without a language model, the player can either: (a) **Pick one of 2–3 pre-written replies**, or (b) **Type freely**, with keyword matching.
➡️ (a). Results are always the same for the same choices, writers control every line, and nothing personal the player types needs handling.

> **Answer:** (a). Results are always the same for the same choices, writers control every line, and nothing personal the player types needs handling.

**Q50 - The research table and how the reflection is assembled**: The table maps each choice to principles, the three perspectives and the reflection messages. Should the research team edit it as a **spreadsheet** (Excel or Google Sheets, saved as CSV in `content/`)? Proposed columns: `option_id, theme, label, dimension(s), tier, priority, benefit, risk, msg_user, msg_deceased, msg_company, question`. The guide asks for "2–3 decisions" in the reflection. Which ones to show: the 3 with the highest `priority` value, with ties broken in A→E order. The open discussion question comes from the highest-priority decision.
➡️ Yes. A spreadsheet is the format researchers already know, and the build checks every `option_id` against the decisions in the game.

> **Answer:** Yes. A spreadsheet is the format researchers already know, and the build checks every option_id against the decisions in the game. (don't forget to later explain what each collumn means

**Q51 - The open discussion question**: The reflection ends with an open question. Options: (a) Show it only. It's for the class discussion. (b) Also offer an optional text box whose answer is sent with the data. That carries a risk: people may type personal details.
➡️ (b), capped at 500 characters, with a note asking players not to include names or personal details. Free-text answers would make the December class discussion much richer.

> **Answer:** (b), capped at 500 characters, with a note asking players not to include names or personal details. Free-text answers would make the December class discussion much richer.

**Q52 - Leaving the game at any time**: The guide requires that players can leave. Should there be an **Exit** button visible on every screen? It would send nothing and offer to delete what's saved in the browser.
➡️ Yes. The exit screen also gives support resources for grief, in a single neutral line.

> **Answer:** Yes. The exit screen doesn't have to also give support resources for grief, in a single neutral line.

**Q53 - Tone**: The guide avoids "castigos caricaturais" (caricatured punishments) and presenting the AI as conscious. Should the horror be scaled down to *uncanny*? That would mean sepia flashbacks for memories, OTTO's eyes changing colour, and small glitches when OTTO goes too far, with no blue screen or shutdown.
➡️ Yes. Unease supports the reflection without turning OTTO into a villain, which the guide also asks for ("sem precisar de um vilão", without needing a villain).

> **Answer:** No. OTTO shouldn't show red eyes, glitch on screen, or use any other visual cue that labels it as bad, and the experience doesn't need to be horrific in itself. The strangeness should come from the story and the game design: OTTO behaves as realistically as possible, the way a real AI would if it were prompted to imitate a deceased person's personality. Players should reach their own conclusions instead of the game telling them the AI is bad. Please update the tone decision accordingly, and if this affects other settled points (OTTO's eye colour change, the sepia flashbacks, the full-screen effects), say so in the next round.

**Q54 - The friend's name and pronouns**: The guide's friend is an "amiga" (a female friend) with her own story, including the romantic misunderstanding. Should **the writers fix her name and pronouns**, while the player chooses only their own name and pronouns?
➡️ Yes. It keeps the story coherent and halves the work on Portuguese grammatical gender.

> **Answer:** No. The writers should not fix the friend's name. The player types the friend's name themselves, so they can project someone familiar onto the friend. Keep the player choosing their own name and pronouns as well.

**Q55 - Carrying out the will**: The will says everything except the photos should be deleted. Should the will's "PDF" window include a **"Carry out the will"** button that deletes all non-photo data? Doing it before installing OTTO would limit what OTTO can ask for under theme B, which is a consistent consequence. Doing it later would reduce OTTO's resemblance.
➡️ Yes. It's the one meaningful "delete" in the game, so it stays a story action rather than a general file feature.

> **Answer:** Yes. It's the one meaningful "delete" in the game, so it stays a story action rather than a general file feature.

**Q56 - Apps on the laptop**: The minimal set would be: file explorer; viewers for text, the "PDF", images, audio and video; OTTO's ad popup, installer and chat window; notifications in the corner of the screen; the note from the parents that opens automatically at the start of the game. There would be no email app, no Recycle Bin and no terminal. Is that the full list?
➡️ Yes. Every item is used by the story, which matches the "build only what the game needs" rule.

> **Answer:** Yes. For now it's pretty good. In case I want to add email messages or a whatsapp app i'll prompt you so later on. Every item is used by the story, which matches the "build only what the game needs" rule.

**Q57 - Text budget for the writers**: With 10–15 minutes including the reflection, the main path can hold about **1,500–2,000 words** of on-screen text. Should I give Inês and Rui that as a firm budget?
➡️ Yes. It's the easiest way to protect the 15-minute limit before the script is written.

> **Answer:** no they'll choose how much they want to use

---

## Round 5 (Q58–Q67): tone follow-ups and data

**Q58 - Effects of the realistic tone (Q53)**: These earlier decisions no longer fit: OTTO's eye-colour change (Q35) is dropped; glitch effects (Q7) are dropped; the blue screen and shutdown were already gone; OTTO as a cartoon mascot with eyes probably goes too. I'd present OTTO as a **real-looking product**: a logo, a polished chat window, friendly marketing text in the ad and the installer, and normal assistant behaviour, with nothing that signals "villain". Do you accept this?
➡️ Yes. OTTO's logo goes in the customization folder so your team can change it.

> **Answer:** Yes. OTTO's logo goes in the customization folder so your team can change it. (my friends will probably want the represent OTTO as a cartoon mascot with eyes, but for now we can present it as a real-looking product and if we decide we don't want it we'll change later

**Q59 - Memory scenes and the remaining effects**: Sepia flashbacks are about the *friend*, not OTTO, so they don't label OTTO as bad. Options: (a) Keep a gentle faded or sepia look only for memory scenes (photos and diary moments). Keep the "reduce motion" setting (Q23) for the remaining fades. (b) No visual effects at all: memories are just files.
➡️ (a). It marks what is a real memory and what is OTTO speaking, which helps with theme C (authenticity) without making a judgement.

> **Answer:** (a). It marks what is a real memory and what is OTTO speaking, which helps with theme C (authenticity) without making a judgement.

**Q60 - The friend's pronouns**: The player now types the friend's name. Should they also choose the friend's pronouns from **she/her, he/him or they/them**? If yes, the writers must write the friend's story, including the unreturned romantic feelings, so that it works with any name and any pronouns. The guide's "amiga" becomes a variable.
➡️ Yes. That follows from your aim of letting players picture someone they knew. Writers use tokens and never write a gendered word for the friend directly.

> **Answer:** Yes. That follows from your aim of letting players picture someone they knew. Writers use tokens and never write a gendered word for the friend directly.

**Q61 - Gender agreement in Portuguese**: In Portuguese, gender also changes articles, nouns and adjectives ("a minha amiga querida" / "o meu amigo querido"). I'd use an inline variant syntax that writers can type, for example `{friend:a minha amiga|o meu amigo|x}`, where `x` is the neutral form. Which neutral form should "they/them" use in Portuguese? (a) Neutral language with "-e" forms (elu, amigue). (b) Rephrase to avoid gender ("a pessoa", "quem partiu"). (c) Writers decide line by line.
➡️ The variant syntax, plus (b) for neutral Portuguese. Players unfamiliar with "-e" forms may find them distracting, and rephrasing reads naturally. English "they" needs no special handling beyond verb agreement.

> **Answer:** (c) Writers decide line by line.

**Q62 - Typing a real person's name**: Players may type the name of someone they have actually lost. Should the content warning say so plainly? For example: *"You'll be asked for a name. You can use an invented one. Names stay on your device and are never sent."* The name would then be wiped from browser storage on Exit and after the reflection.
➡️ Yes to both. It's the honest thing to tell players, and it reinforces the privacy promise.

> **Answer:** Yes to both. It's the honest thing to tell players, and it reinforces the privacy promise.

**Q63 - Order of the screens before the game**: OTTO is no longer present at the start (it only arrives through the ad), so it can't be the one asking for names. Proposed order: 1. Language 2. Content warning (with the reduce-motion option) 3. Research consent (18+) 4. The 5 survey questions 5. A plain setup screen: your name and pronouns, your friend's name and pronouns 6. The laptop boots, and the parents' note opens
➡️ Yes. The steps before the laptop boots stay plain and outside the story; the story begins at the boot.

> **Answer:** I think the reduced motion option is no longer relevant, since we don't plan to use glitch scenes to signal "AI is bad". Yes. The steps before the laptop boots stay plain and outside the story; the story begins at the boot.

**Q64 - Chapter outline for the writers**: A suggested outline the writers can fill in or change: 1. **Arrival.** The parents' note and a first look around the laptop. 2. **The friend.** Photos, chats and diary; the romantic feelings come to light; the will is found ("Carry out the will" becomes available). 3. **The ad.** OTTO is offered. Theme **A**: install, or not now (the refusal route ends here). 4. **Installation.** The permission checklist. Theme **B**. 5. **Conversations.** Chat with the representation; the uncertain memory, theme **C**; OTTO asks to act on its own, theme **D**, followed by notifications. 6. **Decision.** Continue, pause or terminate, with the option to change earlier answers. Theme **E**, then a closing scene. 7. **Reflection.**
➡️ Yes. I'll build against this outline. The writers can rename chapters or add scenes inside them without code changes.

> **Answer:** Yes. I'll build against this outline. The writers can rename chapters or add scenes inside them without code changes.

**Q65 - "You said / you did"**: Should this block just **place each survey answer next to the related decision, in plain words**? For example: *"Before playing you said: strongly agree that consent must be explicit. In the game you allowed chats and voice notes."* There would be no calculated "match" or "mismatch", and each survey question is linked to one theme (A–E) in the survey file.
➡️ Yes. It respects the "changing your mind is not inconsistency" rule and the guide's "não tratar as escolhas como respostas certas e erradas" (don't treat choices as right or wrong answers).

> **Answer:** Yes. It respects the "changing your mind is not inconsistency" rule and the guide's "não tratar as escolhas como respostas certas e erradas" (don't treat choices as right or wrong answers).

**Q66 - What is sent to the database**: Proposed record: session code, run number and language; the 5 survey answers; theme A–E choices, with first and final values for B–D if changed at E; B: which data types were granted; C: whether the player verified the memory; whether "Carry out the will" was used, and whether that was before or after installing OTTO; the optional free-text answer; play time rounded to the minute, and the date (no time of day). **Never sent:** names, pronouns, browser details or IP address. The database provider still sees the IP at the network level, and the consent text will say so.
➡️ Yes. That covers everything the reflection and the class analysis need, and nothing more.

> **Answer:** Yes. For now, that covers the reflection and the class analysis needs. We'll probably include more stuff later on.

**Q67 - Withdrawing and downloading your own answers**: Proposals: **Start screen:** a small "Withdraw my answers" link where the participant enters their code. **End screen:** the code is shown with a copy button and a **"Download my answers (JSON)"** button. **Researchers:** export everything from the database dashboard as CSV.
➡️ Yes. Withdrawal goes live once the database is chosen at the end of week 1. Until then the link explains that it's coming.

> **Answer:** I don't care too much for whether the players get to download their data or not

---

## Summary of what was settled

- **Schedule:** two weeks to build; December for collecting and analysing responses.
- **Length:** about 15 minutes, 20 at most. Text length is chosen by the writers.
- **Languages:** English first; the structure is bilingual from day one (`content/en`, `content/pt`).
- **Devices and browsers:** desktop and laptop only; Chrome, Edge, Firefox, Safari.
- **Source of truth:** the team guide. Five decision themes (A–E), a refusal route, and a deterministic reflection instead of endings.
- **Tone:** OTTO is a realistic product, never a villain. No glitches, red eyes, blue screen or forced cursor. Sepia/faded style only for the friend's memories.
- **Story variables:** the player types both names and picks she/he/they for both; Portuguese gender is handled line by line by the writers. Names never leave the browser.
- **Interface:** fixed 1280×720 stage; windows can be minimised or closed; no moving, deleting or terminal for now. The only deletion is the story action "Carry out the will".
- **Scene engine:** a mix. Simple triggers in YAML; set pieces in code, with all text in content files.
- **Data:** one record sent once at the end; 12-character session code; a strict content-security policy; the database provider is still to be chosen (Supabase suggested) behind an adapter.
- **Deferred:** database provider, hosting, tests, a possible OTTO mascot, email/WhatsApp apps.
