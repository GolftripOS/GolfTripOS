# GolfTripOS Destination Browse & Course Directory — Prototype (W5)

A standalone, runnable prototype of **W5 — Build destination browse &
course directory UI**: Explore grid → Destination Detail → Course Detail,
per the W2 wireframes. Built the same way as the W6 AI assistant prototype
(plain Node/Express + vanilla HTML/CSS/JS, no mobile toolchain required to
try it) so it's easy to try today and easy to port into Expo screens later.

## Launch scope: Myrtle Beach only

As of 2026-09-30 the app launches around **Myrtle Beach / the Grand Strand
only**. Other destinations stay in the Explore grid as "Future market" cards
and will be built by copying the Myrtle Beach template once it's perfected.
The full market profile is in [`docs/markets/myrtle-beach.md`](docs/markets/myrtle-beach.md)
and powers the new **Overview** tab via `market-profiles.js`.

## What it demonstrates

- **Explore grid** — search over destinations; each card shows a live/
  "future market" badge and course count.
- **Destination Detail** — Overview / Courses / Lodging / Dining tabs. The
  **Overview** tab shows the market profile: size stats, why groups go,
  a North/Central/South Strand area picker by vibe, who's there, airports
  and drive times, and seasonality with pricing.
  Courses / Lodging / Dining follow (per the W2
  spec: "Course/lodging/dining preview for a region"). Courses are
  searchable and filterable by area. Lodging and Dining are explicit
  "coming soon" states rather than fabricated data until the Myrtle Beach
  lodging (W5) and dining (W6) research is done.
- **Course Detail** — full spec sheet (type, holes, par, yardage, slope/
  rating, greens fee, amenities, contact), with **Add to Trip** (stub —
  toasts a confirmation, no persistence/Trip Hub yet) and **Book Tee Time**
  (explicitly Phase 2 per the W2 spec, also a stub).

## Real data, not fabricated

Myrtle Beach, SC is the one "live" destination, seeded with the **15
pilot-batch course records** already researched and stored in the "Myrtle
Beach Golf Courses" Notion database (part of the GolfTripOS project) —
name, area, designer, course type, description, amenities, address, phone,
website, and booking link, copied over as-is. Fields that weren't published
on a course's own site (yardage, slope/rating, dress code, fees, in most
rows) are left blank and rendered as "Not published" rather than invented.

Every other destination card (Hilton Head, Pinehurst, Scottsdale, Orlando,
Phoenix/Mesa) is a "Future market" placeholder — tapping one explains that
GolfTripOS is launching in Myrtle Beach first.

## Running it

```bash
npm install
npm start   # http://localhost:3000
```

No API key or `.env` needed — this prototype has no external API calls.

## Files

| File | Role |
| --- | --- |
| `server.js` | Express server: destination/course list + detail endpoints, search & filter query params, `Add to Trip` stub endpoint |
| `market-profiles.js` | Market profile data for the Overview tab (Myrtle Beach; template for future markets) |
| `docs/markets/myrtle-beach.md` | Readable copy of the Myrtle Beach market profile |
| `destinations.js` | Destination list + the 15 real Myrtle Beach course records (single source of truth for backend + frontend) |
| `public/` | Explore / Destination Detail / Course Detail screens — a small hash-router (`app.js`) over three fetch-driven views, styled per Brand Guidelines (Inter, Primary Blue #2D6CDF, Off White/Charcoal/Warm Gray) |

## Known gaps vs. the real app (by design, given this is a prototype)

- No auth, no real Trip Hub — "Add to Trip" just shows a toast.
- No persistence — nothing is saved between requests.
- Not on React Native/Expo — plain web so it runs anywhere with Node.
- Lodging and Dining tabs are explicit placeholders, not real data.
- Launch is Myrtle Beach-only; the other destinations are "Future market"
  stubs by design. Lodging (W5) and dining/itineraries (W6) for Myrtle Beach
  are next.
- "Book Tee Time" is a stub — real affiliate booking is Phase 2 per the W2
  spec.

## Migrating this into the real stack

`destinations.js` should be replaced by live reads from the Notion
destination/course databases (or their eventual Supabase mirror) rather
than a hard-coded module once more destinations are researched. The
Explore / Destination Detail / Course Detail screens in `public/` map
directly onto the three React Native screens named in the W2 screen
inventory (Explore, Destination Detail, Course Detail).
