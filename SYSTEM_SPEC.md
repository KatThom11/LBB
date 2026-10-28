# SYSTEM SPECIFICATION: LBB — The Living Notebook (CUI 2027)

You are an expert full-stack engineer building "LBB: The Living Notebook", a client-side React + Tailwind CSS web application for ACM CUI 2027. The project is an interactive, text-first workspace where users cross-examine generated language and evaluate whether claims have adequate foundation or performative assent.

## ARCHITECTURE & STATE REQUIREMENTS

### 1. The Full Color Atlas Drawer (`/src/components/AtlasDrawer.jsx`)
- A slide-out panel accessible at all times.
- Contains the written taxonomy of language spectrums: SAID, ADDED, SUPPORTED?, DECIDED, and OUTSIDE.
- Acts as a reference dictionary explaining the evidentiary status of speech acts (Austin) and situated language (Wittgenstein).

### 2. Interactive Page Spread (`/src/components/NotebookSpread.jsx`)
- Render a 2D notebook layout with margin tabs (`SAID`, `ADDED`, `SUPPORTED?`, `DECIDED`).
- Support a 6-Scene walkthrough (3–4 min core path; 8–10 min extended path):
  1. *A sentence and a body*: User marks what words convey vs. fail to establish.
  2. *The notebook answers back*: Diff view comparing human draft vs. AI elaboration.
  3. *A discovery is announced*: Show unvalidated equation panel; enable "CROSS-EXAMINE THE CART".
  4. *A room full of agreement*: Expose simulated committee consensus vs. true human assent ("I agree").
  5. *Refraction Point*: Action toolbar (`GENERATE`, `VERIFY`, `ROUTE`, `HOLD`, `STOP`).
  6. *World Return*: Side-by-side comparison of original sentence, source checks, and user disposition.

### 3. The Fallible Narrator — "Exhibit Cart" (`/src/components/ExhibitCart.jsx`)
- A conversational narrator component that guides the user.
- Explicitly labeled as authored/generated with a humorously critical tone.
- Must respond transparently when the user clicks "CROSS-EXAMINE THE CART".

### 4. Refraction Actions (`/src/components/RefractionToolbar.jsx`)
- Button `GENERATE`: Expand concept (label output as synthetic).
- Button `VERIFY`: Open bounded primary source check (e.g., McLuhan Ch. 27).
- Button `ROUTE`: Package query for external human review.
- Button `HOLD`: Retain claim as provisional without declaring it proven.
- Button `STOP`: Freeze generation and reset cleanly.

## TECHNICAL STACK & CONSTRAINTS
- **Framework:** Next.js (App Router) or React (Vite) + Tailwind CSS + Lucide Icons.
- **Accessibility:** Full keyboard navigation (Tab/Arrow keys), ARIA labels, high contrast theme toggle, screen-reader compatible text structures.
- **Privacy & Replay:** Client-side local storage only. Include a curated replay fallback mode so the app runs without external API dependencies during in-person conference demos.

---

## Prototype implementation notes

The specification above is the supplied brief. The implementation uses React + Vite, Tailwind CSS, and Lucide. It makes no live model calls. GENERATE rotates through explicitly labeled, authored synthetic expansions; the replay prefills example choices without manufacturing participant data. STOP clears synthetic expansions and disables further generation while retaining the human record; New Session offers a confirmed full reset.

The full proposal, original written Atlas, primary excerpts, and prompt transcripts were not provided in the repository. All examples, including the equation, are demonstration fixtures. Consult `docs/RESEARCH_SOURCES.md` before replacing them with research material. No conference track eligibility, submission compliance, or research validation is implied.

## Controlling integration: supplied working draft

The subsequently supplied `docs/LIVING_NOTEBOOK_WORKING_DRAFT.txt` is the content basis for the artifact and supersedes the initial brief where they differ. Its bytes are preserved verbatim, with source integrity and transformation notes in `docs/RESEARCH_SOURCES.md`.

- LBB expands publicly as **Language Beyond Binary** and **is The Living Notebook**, rather than a product inside another notebook. The written Full Color Atlas is the evolving intellectual map. Notebook and Working draft views are two presentations of one artifact.
- The five margin labels are provenance operations and locations, not the full Atlas taxonomy or truth scores.
- Scene 1 concerns embodied language, glare, and an unseen step without impairment simulation. Scene 2 preserves the creative value of a generated possibility while examining changes in status. Unavailable archives are labeled scripted reconstructions with UNKNOWN metadata.
- The original institutional-collapse equation has not been supplied. Remove the earlier invented equation rather than representing it as an original record. SHOW FOUNDATION identifies missing definitions, measurements, assumptions, independent evidence, and prior-art checks.
- Scene 4 distinguishes fictional speech, simulated rehearsal, and actual visitor response; allow agreement, dissent, uncertainty, refusal, and withdrawal without inferring assent from navigation.
- HOLD includes a reason. World Return supports revise, retain with reasons, narrow, contest, and withhold judgment. A visitor report of outside change is not independent verification. NOTHING YET is valid.
- The bounded McLuhan reading route concerns the one-way-media overstatement against the telephone and automation chapters. It is not an automatically completed primary-source check.
- The integrated proposal is supplied and readable in-app; the full written Atlas, primary excerpts, original equation, and original prompt transcripts remain unavailable. Do not adopt the draft's track dates, rules, or related-work assertions as independently verified facts.

The web app starts with `npm start` on port 3000. `npm run build` produces a self-contained `dist/index.html`, with visible fallback content if scripts fail. Preserve existing visitor records rather than reinterpreting old assent to new propositions; this route uses session schema v2.
