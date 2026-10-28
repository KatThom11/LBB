# LBB Runway media inventory

The images and videos uploaded on `main` in commit `ee2d3de` were merged into `feat/chat-first-living-notebook` with a normal merge. There were no conflicts or incoming changes to application code. All eight originals were moved using Git renames; their bytes are unchanged. The original paths remain recoverable from the merge history.

`public/assets/lbb/manifest.json` records the full source commit, original filenames, public paths, dimensions, byte counts, SHA-256 hashes, and video metadata. `lib/media.ts` supplies the typed paths and image descriptions used by the interface.

| Upload | New repository path | Integration |
| --- | --- | --- |
| Butterfly / open-notebook hero | `public/assets/lbb/images/butterfly-notebook.png` | Welcome film's still-image fallback |
| Exhibit Cart portrait | `public/assets/lbb/images/exhibit-cart.png` | Welcome Cart player, chat avatars, Cart film fallback |
| The Present | `public/assets/lbb/images/museum-present.png` | Atlas entry card and selectable gallery artwork |
| The Possible | `public/assets/lbb/images/museum-possible.png` | Selectable Atlas gallery artwork |
| Refraction Lab | `public/assets/lbb/images/refraction-lab.png` | Lab entry card and journey illustration |
| Personal notebook workspace | `public/assets/lbb/images/notebook-workspace.png` | Persistent notebook panel illustration |
| `23e511ac-f2bc-4831-ad98-dafa09fa5975.mp4` | `public/assets/lbb/videos/butterfly-opening.mp4` | Three-second welcome opening animation |
| `a189242c-a531-43e9-b22f-550dffb7c48b.mp4` | `public/assets/lbb/videos/exhibit-cart.mp4` | Three-second, user-initiated Cart animation |

All six original PNGs are 2560 pixels wide; the Cart portrait is square and the other images are 2560 × 1440. The H.264 videos are 1280 × 720 (opening) and 960 × 960 (Cart), each approximately 3.04 seconds, with no audio tracks.

## Playback and access

- The opening plays once, muted and inline, when visible and motion preferences permit it. It never gates chat, notes, or navigation. Visitors can pause, play, or replay it.
- The Cart animation starts on an explicit play-button action. It does not loop indefinitely or generate a model response.
- Reduced-motion visitors initially receive still artwork; no video is automatically fetched. They can explicitly choose playback. Changing the system preference to reduced motion stops playback and returns to the still.
- Videos pause when scrolled out of view. Unmounting a welcome page releases its player.
- Playback errors or blocked autoplay leave usable still artwork. Image errors display a labeled fallback without collapsing the layout.
- Next.js Image serves correctly sized local image variants. Original uploads remain untouched, and videos use local HTTP byte ranges. No Runway API, CDN, new credentials, or paid service is required.
- Artwork is illustrative and does not turn fictional galleries, the Cart, or a visitor's claims into research evidence. Image descriptions supplement decorative use. Silent decorative videos add no spoken information requiring a transcript.

## Missing-asset check

**All eight uploads are present and every registered media URL is served. No referenced asset is missing.** Integrity tests verify each original's hash and image dimensions; browser tests verify asset MIME types, video byte ranges, actual video decoding/playback, static fallbacks, reduced motion, and gallery switching.

A dedicated **A Trial of Color** artwork and a **The Past** gallery image were not among these uploads. They are not treated as required files or assigned fabricated paths. The Trial retains its honest framework/icon, and the Atlas exposes the two supplied gallery rooms. Its manuscript and the complete written Atlas also remain unsupplied; media does not substitute for them.

## Preservation

The OpenAI server route, notebook schemas/local-storage key, demo engine, source text, consent logic, and conversation/journey state contracts are unchanged by this integration. Existing browser tests continue to cover theory revisions, history, consent, mobile navigation, source limitations, and returning to the same conversation. No public website is deployed by adding these assets.
