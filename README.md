# THE FULL COLOR ATLAS · LBB

**The sentence is not the world. But it can change it.**

A genuinely new **Atlas-first** application, not a rename or import of the old Living Notebook / Rosebud prototype. The Atlas is a conversational, emergent museum of language, human knowledge, perception, history, imagination, metacognition, judgment, and possible futures. The Living Notebook is an optional, visitor-controlled tool *within* the Atlas.

## Preview locally — no account or API cost

Requires Node.js 22+. This zero-dependency source bundle can run without `npm install`:

```bash
npm start
# open http://127.0.0.1:3000
```

The default is clearly labeled **scripted preview**. It is not live AI, web search, or independent scholarship. The welcome screen, archive, Banter Bot pathways, simulation form, visible suggested lenses, revision-preserving local notebook, research outline, Open Invitation and navigation are interactive. Some improvisational features require the live model. Preview replies are labeled scripts, not pretending to be actual conversation intelligence.

## Live AI — not yet enabled

The Node route `api/chat.js` calls OpenAI's **Responses API** with streaming, `store:false`, and a curated, code-managed Exhibit Cart prompt from `api/atlas-system.js`. The current model default is `gpt-6-luna`; set `OPENAI_MODEL` to another supported Responses model when appropriate. API credentials always remain on the **server**, never in frontend JavaScript.

To enable on an approved private test server (not a public launch):

```bash
export OPENAI_API_KEY='your-secret-entered-in-your-hosting-environment'
export ATLAS_LIVE_AI_ENABLED=true
npm start
```

Never paste keys into Codex prompts, public GitHub, or browser source. OpenAI API billing is separate from ChatGPT subscriptions. **Live AI does not run unless both environment variables are present.** The owner must separately approve billing, secure deployment and publication.

## The actual Atlas experience

- No mandatory gallery navigation, curriculum, book purchase, or theory endorsement.
- A visitor brings their own question; the Cart can zoom out into interdisciplinary connections and zoom back to a concrete inquiry.
- The Archive offers carefully bounded, labeled interpretations of earlier thinkers rather than fictional quotations.
- The Banter Bots are explicitly fictional, not independent expert consensus.
- The Simulation Wing distinguishes invented changes from evidence about the world.
- A visitor can save/revise/delete/export their Living Notebook on their device; earlier revisions are retained unless the entry is deleted.
- **Read the White Paper** is persistently available, but truthfully offers an **in-development research outline** because the updated white paper itself has not been supplied or published.
- The **Open Invitation** preserves the canonical wording from Section XIX of the master spec.
- The **50% pledge** is labeled proposed, conditioned on qualifying personal profit, definitions, governance and sustainability; no donations, approved charities or transfers are invented.
- Normal visitor use does **not** enroll someone in research or publish their personal notes.

## Tests

```bash
npm run check
npm test
```

The API tests mock the provider. No paid requests are made by the tests.

## Publish later (not done)

The root `index.html`, `styles.css`, `app.js` and `content/atlas-content.js` can be served as static assets; the `api/chat.js` named-method handler is compatible with Node-style Web Request/Response serverless entrypoints (review the chosen host's deployment rules). `server.js` is the zero-dependency local preview server.

**Before opening live AI to public visitors**, add shared/edge rate limiting, abuse protections, monitoring, cost budgets/alerts, review of provider moderation options, a reviewed privacy/retention notice, deployment tests and an operational plan for handling visitor data. The current per-instance 10/minute guard is **not** sufficient for untrusted public traffic. Browser local storage is per device and not encrypted account storage; treat shared-device use accordingly. No account, search tool, research submission, social messaging, donations, or cloud syncing is implemented.

## Source of truth and status

- `docs/ATLAS_MASTER_INSTRUCTIONS.md`: **the author-supplied canonical source**, copied without renaming its internal headings; its original title is LBB: The Living Notebook.
- `api/atlas-system.js`: a *shorter operational prompt* distilled for cost-bounded live requests; it implements the major Atlas principles but is not the entire spec. Future prompt changes need deliberate review.
- `content/atlas-content.js`: visitor-facing invitation, pledge boundary, research questions, historical orientation, and starter prompts.
- `docs/IMPLEMENTATION_BRIEF.md`: the product architecture and acceptance gates for Codex.

Current status: **working, testable prototype / not publicly deployed / not a published research finding.**
