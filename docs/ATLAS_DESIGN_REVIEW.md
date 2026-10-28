# Full Color Atlas design review — 2026-10-28

Authority: `ATLAS_MASTER_INSTRUCTIONS.md`, with the Atlas product hierarchy in `IMPLEMENTATION_BRIEF.md`.

The scaffold's persistent exploration sidebar, transcript list and separate connections column made the interface resemble a chat dashboard. The Exhibit Cart was a small introductory avatar, and connections disappeared below the desktop breakpoint.

The revised experience gives the supplied gold Cart artwork a prominent welcome portrait and a continuing identity above the conversation. The Atlas artwork provides atmosphere without requiring a scene, door, or gallery progression. A visitor can type immediately or use a rotating starter question. Optional museum tools and previous explorations live in the Explore drawer. The latest Cart reply offers two suggested prompts plus connections; these are interface suggestions, not model-generated findings. Connections are available on every screen size and draft an editable question before sending.

The White Paper control remains in the header, with an optional first-welcome invitation tracked in browser storage. The panel accurately offers the in-development research outline. The canonical Open Invitation remains unchanged and is reachable from welcome, navigation, and Research & Real-World Impact. The pledge remains proposed. Notebook entries retain their existing local storage and revision history.

Navigation and resource dialogs contain keyboard focus, make the underlying application inert, close with Escape, and return focus to the relevant trigger. The welcome Cart is a keyboard-accessible shortcut to the question field. Larger text, high contrast, reduced motion and small-screen scrolling remain supported.

## Verification

- `npm run check` and `npm test` pass; provider tests use mocks.
- Chromium review at 1440×1000, 768×1024, 390×844 and 320×740: no horizontal document overflow or browser errors.
- Exercised free-text question → labeled scripted reply → editable connection prompt; three continuation choices; navigation and resource focus containment / Escape / focus restoration; invitation return without losing conversation; notebook save, revise and reload with original preserved; outline and proposed pledge status; high contrast and larger text.
- Browser checks made no chat POST or paid provider requests. This is Chromium verification, not a screen-reader or real-device certification.
- WebP copies of the existing artwork total approximately 134 KB. The preview server serves only their explicit allowlisted paths; no file-directory access was added.

Preview uses `HOST=0.0.0.0 ATLAS_LIVE_AI_ENABLED=false npm start` on port 3000. No publication, paid API activation, or change to the old prototype architecture is part of this revision. Conversation remains a labeled scripted preview until separately approved live access is configured.

## Runway Cart expressions — 2026-10-28

Added four reference-based Cart illustrations: welcoming, curious, skeptical and delighted. Original PNGs, optimized WebP copies and generation provenance are in `assets/cart/`. The welcome uses the new welcoming pose, the pending-response toolbar uses curious, and explicit cross-examination / imagination prompts select skeptical / delighted artwork. Existing saved replies without a pose use welcoming. **Explore → Meet the Exhibit Cart** shows all four with descriptions and returns to the question field.

Syntax and existing API checks pass. Chromium checks at desktop, 390px and 320px verified all image loads, the gallery, pending and completed pose states, state after reload and return to the composer; no browser errors, failed responses or chat POSTs occurred. The earlier four-viewport visitor-flow checks also pass. Website publication and live API activation remain disabled.
