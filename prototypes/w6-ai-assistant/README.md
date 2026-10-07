# GolfTripOS AI Trip-Planning Assistant — Prototype (W6)

A standalone, runnable prototype of the **W6 — Integrate AI trip-planning
assistant (LLM API, structured prompts, single-region scope)** task from the
GolfTripOS build plan. It is not wired into the (currently empty)
`OffPisteJMO/GolfTripOS` repo or the recommended Expo/Supabase stack — the
goal here is to validate the prompt design and the Assistant → Draft
Itinerary UX fast, before committing to the full native-app scaffold.

It mirrors the target architecture in spirit: the LLM API key lives only on
the server (`server.js`), exactly like the "AI Assistant" row in the W1
tech-stack doc (Claude/OpenAI via a Supabase Edge Function) — this Express
server just stands in for the Edge Function for now.

## What it demonstrates

- **Structured input** — the "Assistant Prompt" screen (W2 wireframes) is a
  real form: single-select region, dates, group size, budget tier, optional
  notes. No freeform chat.
- **Single-region scope** — enforced twice: the region field is a
  single-select drawn from GolfTripOS's own researched destination list
  (`regions.js`, sourced from `top_30_golf_destinations.md`), and the server
  (`prompts.js` / `server.js`) rejects requests that smuggle a second region
  in via the notes field, plus instructs the model itself to never blend
  regions.
- **Structured output** — the server forces the model to call a
  `propose_itinerary` tool with a strict JSON schema (`prompts.js`), so the
  "Draft Itinerary" screen always gets clean day-by-day data instead of
  parsing prose.
- **Draft, not booked** — the Draft Itinerary screen has Accept & Add /
  Regenerate actions; Accept is a stub (matches the spec: "always a draft
  the organizer reviews and accepts — never auto-applied to the trip").

## Running it

```bash
npm install
cp .env.example .env   # then add your ANTHROPIC_API_KEY
npm start               # http://localhost:3000
```

## Files

| File | Role |
| --- | --- |
| `server.js` | Express server: input validation, calls the Claude API with forced tool-use, returns structured itinerary JSON |
| `prompts.js` | The structured system/user prompts and the `propose_itinerary` tool schema |
| `regions.js` | Single source of truth for the single-region select (backend + frontend) |
| `public/` | The Assistant Prompt + Draft Itinerary screens (plain HTML/CSS/JS, styled per Brand Guidelines: Inter, Primary Blue #2D6CDF, Off White/Charcoal/Warm Gray) |

## Known gaps vs. the real app (by design, given this is a prototype)

- No auth, no real Trip Hub — "Accept & Add to Trip" just shows a toast.
- No persistence — nothing is saved between requests.
- Not on React Native/Expo — this is a plain web form so it runs anywhere
  with Node, with no mobile toolchain required to try it.
- Region list is hard-coded from the top-30 research doc rather than read
  from a live destinations database.

## Migrating this into the real stack

When `apps/mobile` and `supabase/functions` exist (per the W1 repo layout),
`prompts.js` and the validation/guardrail logic in `server.js` should move
almost as-is into a Supabase Edge Function; the form in `public/` maps
directly onto the Assistant Prompt / Draft Itinerary React Native screens.
