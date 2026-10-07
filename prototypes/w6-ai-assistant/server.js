import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ALL_REGIONS, REGION_GROUPS } from "./regions.js";
import { ITINERARY_TOOL, buildSystemPrompt, buildUserPrompt, looksLikeMultiRegionRequest } from "./prompts.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5-20250929";
const PORT = process.env.PORT || 3000;

// Exposed to the frontend so the "Assistant Prompt" screen's region select
// is driven by the same single source of truth as the backend guardrail.
app.get("/api/regions", (_req, res) => {
  res.json({ groups: REGION_GROUPS });
});

app.post("/api/plan", async (req, res) => {
  const { region, startDate, endDate, groupSize, budgetTier, preferences } = req.body || {};

  // --- Structured input validation (mirrors the Assistant Prompt form) ---
  const errors = [];
  if (!region || !ALL_REGIONS.includes(region)) {
    errors.push("region must be one of the supported single regions.");
  }
  if (!startDate || !endDate || new Date(endDate) < new Date(startDate)) {
    errors.push("startDate/endDate must be valid, with endDate on or after startDate.");
  }
  const size = Number(groupSize);
  if (!Number.isInteger(size) || size < 2 || size > 32) {
    errors.push("groupSize must be an integer between 2 and 32 (per GolfTripOS's target trip size).");
  }
  if (!["Budget", "Mid-range", "Premium"].includes(budgetTier)) {
    errors.push("budgetTier must be one of Budget, Mid-range, Premium.");
  }
  if (looksLikeMultiRegionRequest(preferences)) {
    errors.push(
      "This request looks like it's asking to combine multiple destination regions. GolfTripOS's AI assistant plans one region per request (single-region scope) — please submit separate requests per region."
    );
  }
  if (errors.length) {
    return res.status(400).json({ error: "invalid_request", details: errors });
  }

  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({
      error: "missing_api_key",
      details: [
        "ANTHROPIC_API_KEY is not set. Copy .env.example to .env and add your key (this mirrors how the real app keeps the key server-side in a Supabase Edge Function — never in the client).",
      ],
    });
  }

  try {
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 2048,
        system: buildSystemPrompt(),
        messages: [
          {
            role: "user",
            content: buildUserPrompt({ region, startDate, endDate, groupSize: size, budgetTier, preferences }),
          },
        ],
        tools: [ITINERARY_TOOL],
        tool_choice: { type: "tool", name: ITINERARY_TOOL.name },
      }),
    });

    if (!anthropicRes.ok) {
      const text = await anthropicRes.text();
      return res.status(502).json({ error: "llm_api_error", details: [text] });
    }

    const data = await anthropicRes.json();
    const toolUse = (data.content || []).find((block) => block.type === "tool_use" && block.name === ITINERARY_TOOL.name);

    if (!toolUse) {
      return res.status(502).json({ error: "no_structured_output", details: ["Model did not return the expected tool call."] });
    }

    res.json({ itinerary: toolUse.input, meta: { model: ANTHROPIC_MODEL, usage: data.usage } });
  } catch (err) {
    res.status(500).json({ error: "server_error", details: [String(err)] });
  }
});

app.listen(PORT, () => {
  console.log(`GolfTripOS AI assistant prototype running at http://localhost:${PORT}`);
  if (!ANTHROPIC_API_KEY) {
    console.warn("  ANTHROPIC_API_KEY not set — /api/plan will return 500 until you add one to .env");
  }
});
