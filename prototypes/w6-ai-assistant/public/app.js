const el = (id) => document.getElementById(id);

const screenPrompt = el("screen-prompt");
const screenDraft = el("screen-draft");
const loading = el("loading");
const promptError = el("prompt-error");

let lastRequestPayload = null;

async function loadRegions() {
  const res = await fetch("/api/regions");
  const { groups } = await res.json();
  const select = el("region");
  for (const group of groups) {
    const optgroup = document.createElement("optgroup");
    optgroup.label = group.group;
    for (const region of group.regions) {
      const opt = document.createElement("option");
      opt.value = region;
      opt.textContent = region;
      optgroup.appendChild(opt);
    }
    select.appendChild(optgroup);
  }
}

function showLoading(show) {
  loading.hidden = !show;
}

function readForm() {
  return {
    region: el("region").value,
    startDate: el("startDate").value,
    endDate: el("endDate").value,
    groupSize: Number(el("groupSize").value),
    budgetTier: el("budgetTier").value,
    preferences: el("preferences").value,
  };
}

async function requestItinerary(payload) {
  promptError.hidden = true;
  showLoading(true);
  try {
    const res = await fetch("/api/plan", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      promptError.textContent = (data.details || [data.error || "Something went wrong."]).join(" ");
      promptError.hidden = false;
      return;
    }
    renderDraft(data.itinerary);
    screenPrompt.hidden = true;
    screenDraft.hidden = false;
  } catch (err) {
    promptError.textContent = "Network error talking to the assistant: " + err;
    promptError.hidden = false;
  } finally {
    showLoading(false);
  }
}

function renderDraft(itinerary) {
  el("draft-title").textContent = itinerary.tripTitle;
  el("draft-region").textContent = itinerary.region;
  el("draft-summary").textContent = itinerary.summary;
  el("budget-fit").textContent = itinerary.budgetFit;

  const daysWrap = el("days");
  daysWrap.innerHTML = "";
  for (const day of itinerary.days) {
    const card = document.createElement("div");
    card.className = "day-card";
    const heading = document.createElement("h3");
    heading.textContent = `Day ${day.dayNumber} — ${day.date}`;
    card.appendChild(heading);

    for (const block of day.blocks) {
      const row = document.createElement("div");
      row.className = "block";
      const tag = document.createElement("span");
      tag.className = "tag " + block.type.toLowerCase().split("/")[0];
      tag.textContent = block.timeOfDay;
      const body = document.createElement("div");
      body.className = "block-body";
      body.innerHTML = `
        <div class="name">${block.type}: ${block.name}</div>
        <div class="desc">${block.description}</div>
        <div class="cost">~$${Math.round(block.estCostPerPerson)}/person</div>
      `;
      row.appendChild(tag);
      row.appendChild(body);
      card.appendChild(row);
    }
    daysWrap.appendChild(card);
  }

  const altWrap = el("alternates-wrap");
  const altList = el("alternates");
  altList.innerHTML = "";
  if (itinerary.alternates && itinerary.alternates.length) {
    altWrap.hidden = false;
    for (const alt of itinerary.alternates) {
      const li = document.createElement("li");
      li.textContent = alt;
      altList.appendChild(li);
    }
  } else {
    altWrap.hidden = true;
  }
}

el("plan-form").addEventListener("submit", (e) => {
  e.preventDefault();
  lastRequestPayload = readForm();
  requestItinerary(lastRequestPayload);
});

el("back-btn").addEventListener("click", () => {
  screenDraft.hidden = true;
  screenPrompt.hidden = false;
});

el("regenerate-btn").addEventListener("click", () => {
  if (lastRequestPayload) requestItinerary(lastRequestPayload);
});

el("accept-btn").addEventListener("click", () => {
  // Phase-1 stub: the real app would POST this into the Trip Hub (Supabase).
  // Matches the W2 spec: "Output is always a draft the organizer reviews and
  // accepts — never auto-applied to the trip."
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = "Accepted — would be added to Trip Hub in the full app.";
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
});

loadRegions();
