# Architecture and data boundaries

LBB is one Next.js/TypeScript application. There are no imported museum assets or separate journey apps. The earlier implementation survives on the backup Git branch; the preserved proposal remains a source rather than the homepage architecture.

## State and revisions

`Workspace` contains conversations, an active conversation id, notebook entries, and display preferences. Each conversation owns its messages and journey progress. Each notebook entry points to its originating conversation and optional journey/message, carries an unverified status, and retains an ordered nonempty list of revisions. Revising appends; it never edits the original revision.

`lib/schema.ts` validates saved data and live request bodies with Zod. The chat workspace uses its own versioned browser key, leaving earlier prototype keys untouched. Limits are explicit: 50 conversations, 200 messages per conversation, 200 entries, 50 versions per entry, 3,000 characters per visitor message, and 4,000 per notebook revision. Reaching a cap reports an issue instead of deleting earlier work. Export is local JSON, not cloud backup or synchronization.

Unreadable saved data is left intact. A recovery export includes the unreadable original plus current in-memory work. Local-storage failures do not silently turn into claims of successful persistence. No conversation or note is posted to a server in demo mode.

## Conversation and journey handoff

The center is a chat by default. A journey uses a reusable `JourneyDefinition` with ordered steps, provenance kinds, question prompts, and references to curated `SourceRecord`s. Opening one adds an explicitly scripted invitation to the existing conversation. The progress and reflection belong to that conversation; the notebook is shared across conversations. World Return can append a scripted recap that quotes the visitor's actual reflection and records a provisional disposition. It does not assert independent validation or outside action.

A visitor may leave at any step. Trial content is placeholder structure, not fictionalized manuscript. The Atlas reading prompts are identified paraphrases, not quotations. The Lab's source inspection discloses absent primary excerpts rather than certifying a check.

## Demo and live modes

Demo replies are deterministic, keyword-routed scripts, visibly labeled and streamed with a simulated delay. They are useful for interaction development, not a substitute for an open-ended language model. No model endpoint is contacted by sending a demo message. Stopping a reply aborts the stream and preserves the visitor's message and any partial reply.

Live availability requires both an actual server-side key and `LBB_LIVE_AI_ENABLED=true`. Checking availability makes no paid call. Live requests use the official Responses API with text-only history; this version has no tools, browsing, reasoning-state replay, or provider conversation storage. Each request is stateless with bounded recent messages. `store:false` is requested; this does not override the provider's independent account/data-handling policies.

The server—not the browser—chooses the model, output ceiling, curated journey definition, source register, and Cart instructions. Visitor text and approved notes are framed as untrusted context. Model responses are rendered as escaped text, not HTML or executable Markdown. Bibliographic prompts are not external searches or source verification.

Notebook context is excluded by default. In live mode, visitors select at most five entries, then explicitly consent in the composer for that specific reply. The client sends only selected latest revisions, category, and unverified status; the server rejects nonempty notebook payloads without consent. Selection and consent reset after completion or failure. Notes are not stored on the application server.

## Server controls and limits

The route enforces JSON, same-origin requests, a 48 KiB body ceiling, bounded roles/history/context, 800 output tokens, no SDK retries, a 45-second abort timeout, 10 calls per minute and 100 per hour per process, and at most two concurrent requests. Upstream errors are replaced with generic messages, never raw provider error text or credentials. NDJSON bridges Responses stream events to the client; interruption is not treated as successful completion.

The SDK uses its documented Undici fetch/dispatcher pairing with an environment-aware proxy agent and normal TLS verification. There is no configurable client-supplied base URL, arbitrary model, or tool execution.

Per-process limits are basic development protection, not authentication or a durable global quota. Before public deployment, obtain the user's approval and configure shared/edge rate limiting, appropriate authentication, provider spend controls, a hosting secret store, and monitoring. No public deployment or paid activation is performed by this change.

## Preview and testing

Next.js needs a running Node server; a raw source HTML file or the obsolete Vite `dist/` output is not the new app. Production `npm start` serves port 3000 after `npm run build`. This avoids development WebSocket/origin restrictions in embedded previews. For hot reload, `npm run dev` is available, with explicit local allowed origins and optional `LBB_DEV_ORIGIN` for an actual tunnel hostname. Stop the dev process before building so generated TypeScript route files remain stable.

Tests use the built production server, not the dev overlay. Mocked API tests cover enablement, request/consent rejection, bounded Responses configuration, streaming, sanitized errors, and limits without contacting OpenAI. Browser tests exercise the user journey, actual persistence and original-preserving revision behavior, per-turn consent payloads using a mocked endpoint, cancellation, source boundaries, mobile focus, and automated WCAG AA checks. Automated checks supplement, not replace, human accessibility evaluation.
