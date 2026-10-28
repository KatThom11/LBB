# LBB — The Living Notebook

**The Sentence Is Not the World but It Can Change It.**

LBB (Language Beyond Binary) **is** The Living Notebook. The written Full Color Atlas is its evolving intellectual cartography. The visitor notebook and scholarly working draft are two presentations of one artifact.

The implementation follows the user-supplied integrated working proposal, preserved verbatim in [docs/LIVING_NOTEBOOK_WORKING_DRAFT.txt](docs/LIVING_NOTEBOOK_WORKING_DRAFT.txt). It includes an in-app **Working draft** reader and a six-scene visitor route with a 3–4 minute core path and 8–10 minute extended path. Conference details in the source draft have not been independently verified.

## Run the web app

Use Node.js 22.12+ (Node 24 tested) and npm. No API keys, database, or live model are required.

```sh
cd /workspace/LBB
npm ci --cache /workspace/.npm
npm start
```

The default web port is **3000**. `npm run dev` starts the same app. To select a different port, use `npm start -- --port 5173 --strictPort`. Keep the server process running while using the web preview.

## Production and preview

```sh
npm run build
npm run preview -- --port 5174 --strictPort
```

`dist/index.html` is a self-contained build with bundled JavaScript, CSS, scene data, and the supplied working draft. Serve it as one file on a static host; no separate asset paths are needed, including at a nested preview path. It does not depend on a live model, remote fonts, or a CDN. There is no service worker or PWA installation flow.

Preview the **running web app or built file**, rather than the repository's source `index.html` alone. The source file needs Vite to compile `/src/main.jsx`. A visible source-page fallback now explains this when scripts fail; a React error boundary provides recovery and saved-note export after a rendering failure. A preview that forbids all JavaScript displays the readable fallback rather than interactive controls. Direct `file://` navigation was blocked by this cloud browser's administrator policy, so file-opening behavior is not claimed as validated; the self-contained build is tested over HTTP at a nested path.

## Verify

```sh
npm test
```

This builds the production artifact, then runs browser tests. They cover the draft-based path, embodied responses, creative readings, actual assent/dissent, missing foundations, source checks, reasoned HOLD, STOP, review export, revisable World Return, exact source-text download, replay/reset, storage failures, keyboard focus, phone layout, automated accessibility checks, missing entry scripts, and the self-contained production preview.

Tests use `/usr/bin/chromium` in this cloud environment. On another machine set `CHROMIUM_PATH` to an installed Chromium executable. The runner starts a Vite server on port 4173 unless one is already running; `CI=1` requires a fresh test server.

## Interaction and provenance

- Scene 1 offers **I can imagine**, **I need context**, and **I cannot know from this alone**, with an optional explanation. No impairment simulation is used.
- Scene 2 distinguishes an original illustration, scripted model-style extension, and scripted human-style revision. An addition can be useful and still need support.
- Scene 3 exposes missing definitions, measurements, assumptions, independent evidence, and prior-art checks. The original equation is unavailable; no replacement expression is passed off as the source.
- Scene 4 distinguishes fictional “I agree,” simulated rehearsal, and the visitor's bounded, voluntary response. Disagreement, uncertainty, nonresponse, and withdrawal are valid.
- **GENERATE** rotates through labeled curated possibilities. **VERIFY** records a user-reported bounded source check. **ROUTE** downloads JSON and sends no message. **HOLD** records a reason for withholding judgment. **STOP** clears synthetic expansions and disables further generation, retaining human choices for export or reset.
- World Return offers **Revise**, **Retain with reasons**, **Narrow**, **Contest**, and **Withhold judgment**, beside source-check records. “Nothing yet” is a valid outside-world outcome.
- **Curated Replay** prefills labeled example choices. It is not participant data.

All scene utterances are authored illustrations or reconstructions. The integrated proposal has been supplied; the full written Atlas, primary excerpts, actual equation, and original prompt logs remain unavailable. The five margin labels are provenance operations, not the Atlas's full taxonomy or automated truth scores. The app claims no evaluated improvement in judgment, legal conclusion, or conference acceptance.

Choices and contrast preference are stored only in this origin's browser local storage. Storage failure is reported and the app continues in memory. No analytics or automatic external requests are used. New Session clears the current notebook record while preserving the display preference. Export before resetting if you want a copy. The earlier `lbb-notebook-v1` fixture record is preserved separately; it is not silently reinterpreted as a response to the integrated draft's different propositions.

## Project map

- `SYSTEM_SPEC.md`: initial brief and subsequent controlling integration notes.
- `src/data.js`: draft-aligned scenes, provenance margins, reading prompts, and labeled reconstructions.
- `src/content/workingDraft.js`: original source import, integrity metadata, and reading structure.
- `src/state.js`: validated local session persistence and transitions.
- `src/components/`: spread, written-draft reader, Atlas, Cart, actions, dialogs, and recovery.
- `docs/RESEARCH_SOURCES.md`: source inventory, transformations, and remaining gaps.
- `docs/PRESENTATION.md`: visitor paths and video outline; guidance rather than a produced video.
