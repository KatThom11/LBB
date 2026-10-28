# Living Notebook — public chat MVP (review draft)
28 October 2026

## Product decision
Ship a beautiful, public-facing conversation with the **Exhibit Cart**, not a mandatory game or immersive six-scene museum. This is **LBB / The Living Notebook**, an independently hosted chat application powered by the OpenAI API and the project’s own reviewed instructions—not a visitor-facing copy of the author’s ChatGPT account.

Visitors arrive to one approachable chat, can ask any question, challenge an answer, revisit local conversations, and optionally save/revise notes. The Atlas, A Trial of Color, and the Refraction Lab remain available as OPTIONAL doors, not required entry steps. Avoid forced onboarding, fabricated museum functionality, or made-up scholarly claims.

## What this branch changes
- The live /api/chat endpoint uses the full versioned Exhibit Cart personality in `lib/exhibit-cart-instructions.ts` instead of the much shorter generic instruction. Its existing dynamic session context, opt-in notebook-sharing boundary, source register, streaming, and safety limits remain in place.
- The first-screen welcome is the Cart introducing itself; starter questions demonstrate a large-scale subject, a mundane-scale subject, and adversarial exploration.
- Demo mode stays the default and is clearly labeled. This branch does NOT turn on live API use, incur model costs, or deploy a public site.

## Maintaining the Cart
- **Production source of truth:** `lib/exhibit-cart-instructions.ts`. Update this code-managed prompt with tests and code review.
- **Playground drafting reference:** `Exhibit_Cart_Prompt_Playground_v1.txt`. Experiments here do NOT automatically sync to production. When desired, reconcile the full text to the code module in a reviewed change.
- Reusable prompt objects / IDs are on a deprecation path; do not make a new production architecture depend on them. The application already uses the current Responses API.

## Activation gates — require owner approval
1. Build/test the branch in the Codex preview; review its actual on-screen conversation, keyboard, and mobile behavior.
2. Review and approve the final Cart prompt and all public-facing Atlas/source materials. No unpublished manuscript or private ChatGPT content is included.
3. Configure `OPENAI_API_KEY` securely server-side, approve API billing, then explicitly set `LBB_LIVE_AI_ENABLED=true` in the test environment; verify end-to-end live replies using a funded project before considering public launch.
4. Before public access, add shared/rate-limit abuse protection, monitoring, moderation considerations, deployment spend budgets, and a clear privacy notice about API transmission and local-only notebook storage. The built-in per-process limiter is NOT sufficient for unrestricted public traffic.
5. Only publish and connect a domain with explicit owner approval.

## Test
```bash
npm ci
npm run build
npm run typecheck
npm test
```

Expected: initial chat works in scripted demo mode with no API key, live mode availability reports disabled, and the API unit test confirms that future live responses receive the complete Cart identity rather than the short placeholder.

## Deliberately excluded from this MVP
3D navigation, mandatory gallery routes, original music/video orchestration, live-source browsing, private ChatGPT memory import, a new research backend, cloud account synchronization, subscriptions, or automated 50% pledge flows. Those are future options, not launch dependencies.
