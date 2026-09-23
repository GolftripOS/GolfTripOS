# GolfTripOS Destination Browse & Course Directory — Prototype (W5)

A standalone, runnable prototype of **W5 — Build destination browse &
course directory UI**: Explore grid → Destination Detail → Course Detail,
per the W2 wireframes. Built the same way as the W6 AI assistant prototype
(plain Node/Express + vanilla HTML/CSS/JS, no mobile toolchain required to
try it) so it's easy to try today and easy to port into Expo screens later.

## What it demonstrates

- **Explore grid** — search over destinations; each card shows a live/
  "coming soon" badge and course count.
- **Destination Detail** — Courses / Lodging / Dining tabs (per the W2
  spec: "Course/lodging/dining preview for a region"). Courses are
  searchable and filterable by area. Lodging and Dining are explicit
  "coming soon" states rather than fabricated data, since no real lodging/
  dining research exists yet (W4/W5/W6 destination-profile tasks are all
  still "Not started" in Notion).
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
Phoenix/Mesa) is a placeholder — tapping one shows a toast explaining that
destination research hasn't started yet, instead of silently doing
nothing or faking content.

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
| `destinations.js` | Destination list + the 15 real Myrtle Beach course records (single source of truth for backend + frontend) |
| `public/` | Explore / Destination Detail / Course Detail screens — a small hash-router (`app.js`) over three fetch-driven views, styled per Brand Guidelines (Inter, Primary Blue #2D6CDF, Off White/Charcoal/Warm Gray) |

## Known gaps vs. the real app (by design, given this is a prototype)

- No auth, no real Trip Hub — "Add to Trip" just shows a toast.
- No persistence — nothing is saved between requests.
- Not on React Native/Expo — plain web so it runs anywhere with Node.
- Lodging and Dining tabs are explicit placeholders, not real data.
- Only 1 of the ~30 target destinations has real course data (Myrtle
  Beach's 15-course pilot batch); the rest are stubs until W4/W5/W6
  destination-profile research is done.
- "Book Tee Time" is a stub — real affiliate booking is Phase 2 per the W2
  spec.

## Migrating this into the real stack

`destinations.js` should be replaced by live reads from the Notion
destination/course databases (or their eventual Supabase mirror) rather
than a hard-coded module once more destinations are researched. The
Explore / Destination Detail / Course Detail screens in `public/` map
directly onto the three React Native screens named in the W2 screen
inventory (Explore, Destination Detail, Course Detail).
