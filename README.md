# LBB · The Living Notebook

**Conversation first. Exploration optional. The notebook always comes with you.**

LBB (Language Beyond Binary) is a new chat-first application built entirely in this repository. The Exhibit Cart is a curious, skeptical conversational companion; the Full Color Atlas, A Trial of Color, and the Refraction Lab are optional journeys within the same conversation. This implementation does not import the old Rosebud museum.

The current edition works without an account, API key, or billing. Its streamed replies are clearly labeled **scripted demo** responses, not live AI analysis.

## Run the web preview

Use Node.js 22.12+ (Node 24 tested) and npm.

```sh
cd /workspace/LBB
npm ci --cache /workspace/.npm
npm run build
npm start
```

The production web preview runs on port **3000**. Keep this Node server running. This Next.js application is not a standalone HTML file and cannot be opened with `file://` or hosted by serving the old `dist/` directory. The earlier Vite artifact is obsolete for the chat-first application.

For development with hot reload:

```sh
npm run dev
```

Stop the development process before running a production build so generated route types are not changed under the compiler. `npm start -- --port 5173` selects another port when an existing preview requires it. The dev server explicitly allows localhost and 127.0.0.1; for a development tunnel, set `LBB_DEV_ORIGIN` to its specific hostname. The production preview does not depend on development WebSocket access.

## A complete demo path

1. Open LBB and type a question or choose a suggested question.
2. Read the Cart's scripted streaming reply; stop it whenever you want.
3. Open **The Full Color Atlas**. The existing conversation is retained.
4. Explore the four-step encounter. Write a theory and choose **Save to notebook**.
5. In World Return, choose a provisional disposition, then **Return to our conversation**.
6. Open the notebook, revise your theory, and inspect its preserved original in **Revision history**.
7. Start a new conversation or revisit an earlier one. Notebook entries remain available across conversations.

The Trial of Color journey is a labeled structural framework for testimony, exhibits, cross-examination, and reflection. No manuscript has been supplied or ingested. The Refraction Lab implements GENERATE / VERIFY / ROUTE / HOLD / STOP and a World Return; ROUTE downloads locally and never contacts a person.

## Verify

```sh
npm run build
npm run typecheck
npm test
```

`npm test` runs mocked server/API tests and production-browser tests. Build first: the browser runner starts `next start` on port 4173. It uses `/usr/bin/chromium` here; set `CHROMIUM_PATH` on another machine. API tests mock the provider and never make paid calls. Browser tests cover the primary workflow, persistence, original-preserving revisions, conversation isolation, cancellation, per-reply notebook consent, mobile dialogs, accessibility, and demo operation without external requests.

## Future live AI connection

Live integration uses the official OpenAI SDK's **Responses API**, through `app/api/chat/route.ts`. It is disabled by default. This development session does not enable billing, call a paid model, or deploy a public site.

After you approve live operation, configure these **server-side** variables in your hosting environment or an ignored `.env.local` file:

- `OPENAI_API_KEY`: your actual API key, entered securely outside chat and Git.
- `LBB_LIVE_AI_ENABLED=true`: an explicit server-side enable switch.
- `OPENAI_MODEL`: optional Responses-compatible text model; defaults to `gpt-4.1-mini`.

The committed `.env.example` contains names and empty/example values only. Never use a `NEXT_PUBLIC_` variable for a secret. The client never receives the key. Cloud secret-proxy placeholders are not automatically usable as raw server credentials; validate the specific authorized binding and network route before enabling live mode. No secret requirement was added during this demo setup.

The browser first checks availability without making a model call. In live mode the server receives bounded recent conversation history and the current curated journey. Notebook text is **excluded by default**. A visitor must select up to five entries and explicitly consent for that reply; selection and consent reset after each request. All entries remain unverified. The server also rejects notebook payloads without consent.

Live requests use `store: false`, an 800-token output ceiling, no automatic SDK retries, a 45-second timeout, bounded request bodies, same-origin checks, and basic per-process limits (10 calls/minute, 100/hour, 2 concurrent). Provider errors are sanitized; cancellation aborts the upstream request. The SDK uses Undici's environment-aware proxy agent without disabling TLS verification. No tool use, browsing, third-party messaging, private ChatGPT access, or NotebookLM access is enabled. Model output is rendered as text, not executable HTML.

These limits are not a production security perimeter: they reset on process restart and are not shared across replicas. Before any approved public launch, add appropriate authentication, shared/edge rate limiting, hosting spend controls, and deployment monitoring. The endpoint deliberately remains off until that launch decision.

## Local data and provenance

Conversations, notebook entries, and revisions are stored in this browser's `lbb-chat-workspace-v1` local-storage record. There is no cloud sync or account system. Notes do not become verified evidence because they were saved, copied from the Cart, or placed in the Evidence category. Revisions append a new version and preserve the original. Export all conversations and versions from Settings. Storage failures are reported and the app continues in memory; unreadable saved records are preserved and included in a recovery export rather than silently replaced. Shared-device visitors can see that browser's earlier notes.

Demo mode needs no external network after the page and its assets have loaded. A local Node server is still needed for initial load and refresh. No service worker or installable PWA is included.

The integrated Living Notebook proposal is preserved verbatim in `docs/LIVING_NOTEBOOK_WORKING_DRAFT.txt` and readable under **Sources & research**. The later `docs/CHAT_FIRST_DIRECTION.txt` is the controlling product brief. The full Atlas, source transcripts, primary philosophical excerpts, actual institutional-collapse expression, and Trial manuscript remain unavailable. References and paraphrases state their limits. Proposed conference rules and prior-art assertions in the supplied proposal have not been independently verified.

## Architecture and preservation

- `app/`: Next.js App Router page, layout, styles, error recovery, and server API route.
- `components/`: chat shell, accessible dialogs, persistent notebook, reusable journey renderer.
- `lib/schema.ts`: TypeScript/Zod content and persistence contracts.
- `lib/content.ts`: curated source register and the three journey definitions.
- `lib/demo.ts`: deterministic, honestly labeled demo replies.
- `tests/`: production workflow tests and mocked provider/API tests.
- `docs/ARCHITECTURE.md`: context, consent, provenance, and persistence boundaries.

The earlier six-scene prototype is preserved on GitHub branch **`backup/lbb-six-scene-2026-10-28`**, commit `7897b43`. The new application is developed on **`feat/chat-first-living-notebook`**. Older prototype local-storage keys are left intact; prior assent is never silently transferred to a different proposition. No existing museum implementation was imported. Publication and paid API activation require the user's approval.

## Runway artwork and motion

The uploaded `main`-branch media is integrated locally: six original images in `public/assets/lbb/images/` and two silent films in `public/assets/lbb/videos/`, all with short filenames. The butterfly opening has playback controls; the Exhibit Cart has its own play button. Reduced-motion visitors see stills until choosing playback. Present/Possible artwork appears within the optional Atlas, the Lab uses its supplied illustration, and the notebook panel uses the desk artwork. Chat remains available throughout.

See `docs/ASSETS.md` for the inventory, integration points, missing-content notes, and preservation details. Original bytes and names are recorded in `public/assets/lbb/manifest.json`. All referenced assets are present; dedicated Trial artwork and a Past gallery image were not supplied. There are no new credentials or external media services.
