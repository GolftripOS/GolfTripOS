// Structured prompt design for the W6 AI trip-planning assistant.
//
// Two layers of "structured":
//  1. The INPUT is structured, not freeform chat — region, dates, group size,
//     and budget are discrete fields (see public/index.html), matching the
//     "Assistant Prompt" wireframe (W2: region, dates, group, budget).
//  2. The OUTPUT is structured via forced tool-use — the model must call
//     `propose_itinerary` with arguments matching ITINERARY_TOOL.input_schema,
//     so the server never has to parse freeform prose into the
//     "Draft Itinerary" screen's day-by-day cards.

export const ITINERARY_TOOL = {
  name: "propose_itinerary",
  description:
    "Return a single-region, day-by-day draft golf trip itinerary for the organizer to review, matching GolfTripOS's Draft Itinerary screen.",
  input_schema: {
    type: "object",
    additionalProperties: false,
    required: ["tripTitle", "region", "summary", "days", "budgetFit", "alternates"],
    properties: {
      tripTitle: {
        type: "string",
        description: "Short, punchy trip name, e.g. 'Myrtle Beach Buddies Weekend'.",
      },
      region: {
        type: "string",
        description: "The single region this itinerary is scoped to. Must match the requested region exactly.",
      },
      summary: {
        type: "string",
        description: "1-2 sentence overview of the plan and why it fits the group.",
      },
      days: {
        type: "array",
        minItems: 1,
        maxItems: 10,
        description: "One entry per day of the trip, in order.",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["dayNumber", "date", "blocks"],
          properties: {
            dayNumber: { type: "integer", minimum: 1 },
            date: { type: "string", description: "YYYY-MM-DD" },
            blocks: {
              type: "array",
              minItems: 1,
              maxItems: 6,
              items: {
                type: "object",
                additionalProperties: false,
                required: ["timeOfDay", "type", "name", "description", "estCostPerPerson"],
                properties: {
                  timeOfDay: { type: "string", enum: ["Morning", "Afternoon", "Evening"] },
                  type: { type: "string", enum: ["Golf", "Lodging", "Dining", "Free/Explore"] },
                  name: { type: "string", description: "Course, hotel, or restaurant name (real, in-region where possible)." },
                  description: { type: "string", description: "One sentence on why this fits the group/budget." },
                  estCostPerPerson: { type: "number", description: "Rough USD estimate per person for this block." },
                },
              },
            },
          },
        },
      },
      budgetFit: {
        type: "string",
        description: "One sentence on how the total estimated cost compares to the requested budget tier.",
      },
      alternates: {
        type: "array",
        minItems: 0,
        maxItems: 3,
        description: "Optional swap-in alternates (e.g. a different course) if the group wants to regenerate part of the plan.",
        items: { type: "string" },
      },
    },
  },
};

const BUDGET_TIER_HINTS = {
  Budget: "public/municipal courses, 2-3 star lodging, casual dining — keep per-person/day under ~$150",
  "Mid-range": "well-reviewed public/semi-private courses, 3-4 star lodging, a mix of casual and sit-down dining — roughly $150-$350/person/day",
  Premium: "resort or name-brand courses, 4-5 star lodging, higher-end dining — $350+/person/day is acceptable",
};

export function buildSystemPrompt() {
  return `You are the GolfTripOS AI trip-planning assistant, embedded in a mobile app used by golf trip organizers.

SCOPE — read carefully, this is a hard constraint:
- You plan ONE trip for ONE region per request. Never combine multiple destination regions into a single itinerary, even if the group mentions liking other places — if asked to do that, just plan for the single region given and mention in "summary" that multi-region trips should be planned as separate requests.
- Only use the region the organizer selected. Do not substitute or suggest a different region as the primary plan (alternates may reference in-region swaps only).
- This is always a DRAFT. The organizer reviews and explicitly accepts it before anything is added to the real trip — never imply the plan is booked or confirmed.

STYLE:
- Be concrete: use plausible, real-sounding course/lodging/restaurant names appropriate to the region rather than generic placeholders.
- Keep descriptions tight (one sentence each) — this renders as compact cards on a phone screen.
- Respect the group size and budget tier when choosing lodging (group-sized lodging, not single hotel rooms, for groups over ~6) and cost estimates.

You MUST respond by calling the propose_itinerary tool exactly once with the full structured plan. Do not respond in plain text.`;
}

export function buildUserPrompt({ region, startDate, endDate, groupSize, budgetTier, preferences }) {
  const budgetHint = BUDGET_TIER_HINTS[budgetTier] || BUDGET_TIER_HINTS["Mid-range"];
  const lines = [
    `Plan a golf trip with these details:`,
    `- Region (single region, do not deviate): ${region}`,
    `- Dates: ${startDate} to ${endDate}`,
    `- Group size: ${groupSize} golfers`,
    `- Budget tier: ${budgetTier} (${budgetHint})`,
  ];
  if (preferences && preferences.trim()) {
    lines.push(`- Organizer notes/preferences: ${preferences.trim()}`);
  }
  return lines.join("\n");
}

// Backend guardrail: catch obvious multi-region asks that slipped in via the
// free-text preferences field even though region itself is a single-select.
const MULTI_REGION_MARKERS = ["also visit", "then drive to", "combine with", "plus a stop in", "as well as"];

export function looksLikeMultiRegionRequest(preferences = "") {
  const lower = preferences.toLowerCase();
  return MULTI_REGION_MARKERS.some((marker) => lower.includes(marker));
}
