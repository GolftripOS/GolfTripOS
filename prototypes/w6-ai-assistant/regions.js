// Single-region catalog for the AI Assistant's "region" input.
// Sourced from GolfTripOS's researched destination list
// (Google Drive: top_30_golf_destinations.md) so the assistant only ever
// plans against a region the product actually has destination data for.
// Keeping this as a fixed, single-select list is the first line of
// "single-region scope" enforcement (UI-level); prompts.js enforces it
// again at the model level as a backend guardrail.

export const REGION_GROUPS = [
  {
    group: "Mega-markets",
    regions: [
      "Myrtle Beach, SC",
      "Phoenix / Scottsdale, AZ",
      "Palm Springs / Coachella Valley, CA",
      "Orlando / Kissimmee, FL",
      "Las Vegas, NV",
    ],
  },
  {
    group: "Southeast / Coastal Corridor",
    regions: [
      "Hilton Head Island, SC",
      "Kiawah Island, SC",
      "Pinehurst / Sandhills, NC",
      "Charleston, SC",
      "Jacksonville / Ponte Vedra, FL",
      "Naples / Fort Myers, FL",
      "Tampa Bay / Sarasota, FL",
      "Palm Beach / Boca Raton, FL",
      "Destin / Emerald Coast, FL",
      "Gulf Shores / Orange Beach, AL",
      "Savannah, GA",
    ],
  },
  {
    group: "Southwest / Desert",
    regions: ["Tucson, AZ", "San Diego, CA", "San Antonio / Texas Hill Country, TX", "Austin, TX"],
  },
  {
    group: "Heartland / Midwest",
    regions: ["Wisconsin Dells / Kohler, WI", "Traverse City, MI", "Branson, MO", "Lake of the Ozarks, MO"],
  },
  {
    group: "West / Mountain",
    regions: ["Reno / Lake Tahoe, NV-CA", "Bandon, OR"],
  },
  {
    group: "Mid-Atlantic / Northeast",
    regions: ["Williamsburg, VA", "Atlantic City / Jersey Shore, NJ", "Pocono Mountains, PA"],
  },
  {
    group: "Emerging",
    regions: ["Wilmington / Brunswick Islands, NC"],
  },
];

export const ALL_REGIONS = REGION_GROUPS.flatMap((g) => g.regions);
