# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A static website presenting the results of a theory seminar ("Occidentalism"): a pannable image-cloud gallery with tag filtering, plus essays ("papers") by individual contributors, opened in a modal. Hosted on GitHub Pages (repo: `dlythgoe/occidentalism`, deploy = push to `main`). No build step, no dependencies, no framework — plain HTML/CSS/JS (the `package.json` is vestigial).

## Running locally

The app loads JSON/Markdown via `fetch()`, so it must be served over HTTP — opening `index.html` via `file://` fails. Use any static server, e.g.:

```
python3 -m http.server 8000
```

There are no tests or linters.

## Architecture

Four code files, all logic in one script:

- `index.html` — static shell: controls panel (collapsible Tags/Papers sections), the `#viewport > #board` pan canvas, an image modal, and a paper modal.
- `app.js` — everything: data loading, custom Markdown parser, layout, pan/scroll handling, modals, tag filtering. `init()` at the bottom drives the sequence: fetch `data/index.json` → shuffle → fetch `data/papers.json` → preload image dimensions → fetch each paper's Markdown → render images row-by-row on the board → center view → build papers list → wire events.
- `style.css` — all styling; minimalist black-on-white aesthetic.
- Content lives in `data/`, `images/`, `papers/` (see below).

### Content model (this is what gets edited most)

- `data/index.json` — array of image records: `{filename, title, description, tags[], credit}`. `filename` must match a file in `images/`. Tag filter buttons are generated from the union of all `tags`. `credit` is a free-text credit line ("Artist/Copyright-holder, Medium/Material, Place, Year").
- `data/papers.json` — array of `{filename, title}`; `filename` points into `papers/`. Order here = order in the Papers list.
- `papers+database/` — raw contributor source material (docx essays, image folders, the tagging-database xlsx/csv), not loaded by the site. Site content is derived from it. Contributors on the site: Marie (Herrndorff), Michelle (Nikolas), Daniel (Lythgoe), Lorena (Karn, images only), Yidan (Qin, images only).
- `backup/` — the original placeholder content (lorem-ipsum images + mock papers), kept for reference; not loaded by the site.
- `papers/*.md` — essay content, rendered by the custom parser in `app.js` (`parseMarkdown`), **not** a full Markdown implementation. It supports: `##`/`###` headers (the H1 line is stripped — the modal title comes from `papers.json`), `**bold**`, `*italic*`, `[text](url)` links, `>` blockquotes, `-`/`*`/numbered lists (flat only, no nesting), footnotes (`[^1]` refs with `[^1]: text` definitions collected into an end-of-paper list), and images `![alt](../images/file.jpg)`. Paths are normalized so `../images/` and `images/` both work; paper images are clickable and open the image modal (with metadata if the file is also in `index.json`). Anything else (code blocks, tables, nested lists) will not render.

### Behaviors worth knowing before changing app.js

- Images are shuffled on every load, then laid out left-to-right in rows (max display width 300px, row width 1200px) — positions are absolute within `#board`, panned via CSS transform.
- Tag filtering is OR-logic (image shown if it has any active tag) and re-renders + re-centers the board.
- Modal stacking: the image modal is forced to `z-index: 3000` so it sits above the paper modal (clicking an inline paper image opens it on top).
- Clicking the viewport closes an open paper modal; Escape closes both modals.
- Git history shows an abandoned "infinite scrolling" attempt that was reverted — the current row layout is the known-working build.

## Common tasks

- **Add an image**: drop the file in `images/`, add a record to `data/index.json`.
- **Add a paper**: add `papers/<name>.md`, register `{filename, title}` in `data/papers.json`. Keep to the supported Markdown subset above.
- The README documents an Excel/CSV → JSON workflow for bulk-editing `index.json`.
