# LBB — The Living Notebook

## Controlling direction

The user-supplied `docs/CHAT_FIRST_DIRECTION.txt` supersedes the earlier museum-led implementation brief. LBB (Language Beyond Binary) IS The Living Notebook: a new, standalone, chat-first web application entirely within `KatThom11/LBB`. No old Rosebud museum implementation is imported.

**Build the Living Notebook first. Let the worlds grow inside it.**

## Primary experience

- Center: natural conversation with the Exhibit Cart, streamed replies, suggested questions, a persistent composer, new conversations, and revisitable local history.
- Left: new/recent conversations, Full Color Atlas, A Trial of Color, Refraction Lab, Cross-examination, My Notebook, Sources & research. Mobile navigation is an accessible dialog.
- Right: a collapsible notebook supporting My Theory, My Anti-Theory, Evidence, Objections, Questions, What Would Change My Mind?, and Revised Conclusions. Save and append revisions without overwriting originals. Saving generated text does not verify it.
- The Cart is witty, curious, skeptical, and rigorous without claiming final authority. In demo mode it is explicitly an authored script, not a live model or an expert evaluator.

## Optional journeys

One typed content schema and renderer supports all journeys inside the same conversation. Progress, reflections, context, and notebook entries survive entering and returning.

1. **Full Color Atlas:** a complete demo journey through an embodied sentence, philosophical reading prompts, a saved visitor theory, and World Return.
2. **A Trial of Color:** expandable testimony/exhibits/cross-examination/reflection framework. No manuscript passages, characters, or clinical claims are fabricated. The book has not been supplied or ingested.
3. **Refraction Lab:** a bounded claim inquiry using GENERATE / VERIFY / ROUTE / HOLD / STOP. A source prompt is not verification; ROUTE only downloads a review package. World Return places the original, outside-information limits, and visitor judgment together. A 3–4 minute route is possible; reading is self-paced.

## Implementation

Next.js App Router, TypeScript, React, Tailwind CSS, and Lucide. Use the official OpenAI SDK's current Responses API behind server-side routes. Never expose or commit `OPENAI_API_KEY`; no `NEXT_PUBLIC_` secret. Live mode remains off until explicitly enabled server-side after the user approves billing. Keep a completely functional scripted demo with no external calls.

The server accepts bounded recent conversation history, current curated journey context, and only explicitly consented notebook entries. Notebook selection and consent reset after each live reply. Distinguish source paraphrases, recorded quotations when actually supplied, fictional/scripted simulations, generated text, placeholders, and unverified visitor claims. Do not imply access to private ChatGPT conversations, NotebookLM, or unpublished books.

Use sanitized API errors, input/output limits, cancellation, timeouts, same-origin checks, and basic per-process usage controls. Public launch additionally needs shared abuse controls and approved hosting/spend configuration. Do not publish a website, enable paid calls, or configure billing without the user's approval.

## Design and access

A quiet, literary conversation space: sophisticated local typography, paper tones, subtle texture, optional journeys, and an always-available notebook. Avoid game HUDs, mandatory museums or 3D navigation, quiz scoring, and generic AI dashboards. Provide keyboard navigation, logical reading order, focus-contained dialogs, responsive layout, adjustable text size, contrast, and reduced-motion support.

## Preservation and validation

The preceding generated prototype was committed and pushed to `backup/lbb-six-scene-2026-10-28` (`7897b43`) before replacement. Work proceeds on `feat/chat-first-living-notebook` without a worktree. The integrated proposal remains a preserved research source; its earlier mandatory route is now one optional inquiry context.

Build and type-check the app; test production navigation, streaming demo, cancellation, persistence, revision history, journey/context return, source boundaries, consent, mobile use, and accessibility. API tests must mock the provider and incur no charges. Keep credentials and generated caches out of Git. Save reviewed code to GitHub without deploying a public site.
