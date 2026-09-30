// Market profiles: the "Overview" content for a destination.
//
// GolfTripOS launches as a Myrtle Beach-only app (decision logged 2026-09-30
// in the Notion project page). This file holds the Myrtle Beach / Grand
// Strand market profile researched for W4 in Notion. Once Myrtle Beach is
// perfected, the same shape gets copied for each of the other top-30
// markets (see the W13 rollout task).
//
// Source of truth: Notion, W4 "Write Myrtle Beach market profile" task page.
// A readable copy lives in docs/markets/myrtle-beach.md. Figures are the
// latest published at research time (2024 data unless noted). Drive times
// to alternate airports are approximate.

export const MARKET_PROFILES = {
  "myrtle-beach-sc": {
    region: "Grand Strand",
    coverage:
      "About 60 miles of coast, from Pawleys Island and Georgetown, SC up through Brunswick County, NC (Calabash, Sunset Beach, Ocean Isle, Holden Beach).",
    atAGlance: [
      { label: "Golf courses", value: "90+" },
      { label: "Rounds per year", value: "3M+" },
      { label: "Annual visitors", value: "18.2M (2024)" },
      { label: "Visitor spending", value: "$13.2B direct (2024)" },
      { label: "Lodging", value: "~98,500 rooms, 400+ properties" },
      { label: "Metro population", value: "~413K" },
    ],
    highlights: [
      "Known as the \"Golf Capital of the World.\" The first course opened in 1927, so 2027 is the 100th anniversary of Myrtle Beach golf.",
      "Built for group golf trips: huge course supply, stay-and-play packages, and condos sized for foursomes and bigger groups.",
      "Nearly all lodging has a full kitchen or kitchenette. Multi-bedroom condos and golf villas are the go-to for groups.",
      "Canada is the top international market, celebrated every March during CAN-AM Days.",
    ],
    marketNotes:
      "Overall tourism dipped about 3% in 2025 (weather, social media coverage, economic pressure). The city is investing in Ocean Blvd improvements. Golf demand is a separate segment from summer beach tourism.",
    airports: [
      {
        code: "MYR",
        name: "Myrtle Beach International",
        drive: "~10 min",
        notes:
          "Primary airport. Record 3.84M passengers in 2024 (+14%). 59 nonstop destinations, the most in SC. Allegiant, American, Avelo, Breeze, Delta, Frontier, Southwest, Spirit, Sun Country, United.",
        primary: true,
      },
      {
        code: "ILM",
        name: "Wilmington, NC",
        drive: "~1.5 hr (~45 min to NC-side courses)",
        notes: "Best alternative for groups staying on the North Strand or NC side.",
      },
      {
        code: "FLO",
        name: "Florence, SC",
        drive: "~1.25 hr",
        notes: "Small regional airport with limited service.",
      },
      {
        code: "CHS",
        name: "Charleston, SC",
        drive: "~2–2.5 hr",
        notes: "Bigger hub, sometimes cheaper fares. Closest to the South Strand.",
      },
      {
        code: "CLT / RDU",
        name: "Charlotte / Raleigh-Durham",
        drive: "~3.5 hr",
        notes: "Major hubs for groups willing to fly in cheap and drive the rest.",
      },
    ],
    driveMarket:
      "Historically a drive-in destination (I-95, the Carolinas, Virginia, Ohio Valley and the Northeast). Many groups mix flyers and drivers.",
    zones: [
      {
        key: "central",
        name: "Central Strand",
        towns: "Myrtle Beach, North Myrtle Beach, Surfside",
        vibe: "Party",
        description:
          "The high-energy center with the most tourists: bars, nightlife, Broadway at the Beach, Barefoot Landing and shows. Best for bachelor parties and younger buddy groups.",
      },
      {
        key: "north",
        name: "North Strand",
        towns: "Little River, Calabash, Brunswick County NC",
        vibe: "Relaxed",
        description:
          "More laid-back, without the party crowd. Good value and known for Calabash-style seafood. Suits relaxed or older groups.",
      },
      {
        key: "south",
        name: "South Strand",
        towns: "Murrells Inlet, Pawleys Island, Georgetown",
        vibe: "Premium",
        description:
          "Upscale and quiet, with many of the championship courses. Suits premium or serious golf groups. Murrells Inlet's MarshWalk has a lively dinner-and-drinks scene.",
      },
    ],
    crowd: [
      "Local residents skew older: the metro had the fastest-growing 65+ population in the US in 2024 (+6.3%, +22% since 2020), and 65+ residents are over 25% of the population.",
      "Visitors vary by season: families dominate summer; spring and fall bring golf groups, retirees and Canadian snowbirds; bachelor parties and young buddy trips come year-round, mostly to the Central Strand.",
    ],
    seasons: [
      {
        name: "Spring peak",
        months: "Late Mar – Apr",
        demand: "Highest",
        pricing: "Top courses ~$150–200, budget ~$70–80",
        notes: "Book early; tee times go fast.",
      },
      {
        name: "Fall peak",
        months: "Oct – early Nov",
        demand: "High",
        pricing: "Near peak",
        notes: "Great weather and a popular buddies-trip window.",
      },
      {
        name: "Summer",
        months: "Jun – Aug",
        demand: "Low for golf, high for families",
        pricing: "Low green fees, high lodging",
        notes: "Humid with afternoon thunderstorms. Play early tee times.",
      },
      {
        name: "Value season",
        months: "Late Nov – early Jan",
        demand: "Low",
        pricing: "Cheapest overall; hotels ~$50–60/night",
        notes: "Highs in the upper 50s to low 60s; possible frost delays.",
      },
    ],
    sources: [
      { label: "Visit Myrtle Beach — Industry Research", url: "https://www.myrtlebeachareacvb.com/industry-research" },
      { label: "MYR record passengers 2024", url: "https://www.myrtlebeachareacvb.com/news/myrtle-beach-international-airport-celebrates-record-passenger-numbers-in-2024" },
      { label: "MYR expands to 59 nonstop destinations (Nov 2025)", url: "https://www.myrtlebeachgolftrips.com/news/myr-expands-to-59-nonstop-destinations-with-two-new-allegiant-routes/" },
      { label: "Myrtle Beach \"Golf Capital of the World\" (Business Wire, Jan 2025)", url: "https://www.businesswire.com/news/home/20250128170056/en/" },
      { label: "Myrtle Beach tourism down 3% in 2025 (WMBF)", url: "https://www.wmbfnews.com/2026/02/05/myrtle-beach-tourism-down-3-2025-local-businesses-hope-better-2026/" },
      { label: "Fastest-growing senior population (FOX, Jul 2025)", url: "https://www.fox5atlanta.com/news/myrtle-beach-senior-population-growth" },
      { label: "GolfPass — Beginner's guide to a Myrtle Beach golf vacation", url: "https://www.golfpass.com/travel-advisor/articles/a-beginners-guide-to-a-myrtle-beach-golf-vacation" },
    ],
  },
};

export function getMarketProfile(slug) {
  return MARKET_PROFILES[slug] || null;
}
