# The Icarus Dilemma

A short browser game about griefbots, made for the course *Artificial Intelligence and Society*. The design is in [docs/DESIGN.md](docs/DESIGN.md).

**Current state:** a playable prototype of one chapter, in which the player searches the friend's laptop for the digital will while OTTO is already installed. All story text is placeholder.

## Run it

You need [Node.js](https://nodejs.org/) installed.

```bash
npm install
npm run dev        # play at http://localhost:5173 (reloads when content changes)
npm run check      # report problems in content/ in plain English
npm run build      # build the static site into dist/
npm run preview    # play the built site at http://localhost:4173
```

## Where things are

- `content/en/disk/` holds the friend's laptop. Real folders and files appear as the in-game folders and files. "PDF" documents are written in Markdown as `name.pdf.md`. An optional `_meta.yaml` in a folder sets special file properties.
- `content/en/story/` holds the chapters, triggers, OTTO chat and decisions.
- `content/en/ui.yaml` holds the interface words.
- `content/settings.yaml` holds the data categories, the resemblance levels and the idle timer.
- `customization/` holds the OS name, colours, icons and OTTO logo.
- `src/` holds the code. Writers and researchers never need to open it.
