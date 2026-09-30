// Tiny hash-router driving three screens per the W2 wireframes:
//   #/explore                                -> Explore grid
//   #/destination/:slug                      -> Destination Detail
//   #/destination/:slug/course/:courseSlug   -> Course Detail
// No framework/build step on purpose -- this is a prototype meant to be
// ported into React Native screens later (per the W2/W5 spec), not shipped.

const screenEl = document.getElementById("screen");
const titleEl = document.getElementById("screenTitle");
const backBtn = document.getElementById("backBtn");
const toastEl = document.getElementById("toast");

let destTab = "courses"; // "courses" | "lodging" | "dining" on Destination Detail
let destFilters = { area: "", courseType: "", q: "" };

function showToast(message) {
  toastEl.textContent = message;
  toastEl.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => {
    toastEl.hidden = true;
  }, 2600);
}

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

// ---------------- Router ----------------

function parseHash() {
  const hash = location.hash.replace(/^#\/?/, "");
  const parts = hash.split("/").filter(Boolean);
  if (parts[0] === "destination" && parts[1] && parts[2] === "course" && parts[3]) {
    return { screen: "course", destSlug: parts[1], courseSlug: parts[3] };
  }
  if (parts[0] === "destination" && parts[1]) {
    return { screen: "destination", destSlug: parts[1] };
  }
  return { screen: "explore" };
}

window.addEventListener("hashchange", render);
window.addEventListener("DOMContentLoaded", () => {
  if (!location.hash) location.hash = "#/explore";
  render();
});

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    if (tab.dataset.tab === "explore") {
      location.hash = "#/explore";
    } else {
      showToast("Not part of this prototype — Explore only (W5 scope).");
    }
  });
});

async function render() {
  const route = parseHash();
  document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t.dataset.tab === "explore"));

  if (route.screen === "explore") {
    backBtn.hidden = true;
    titleEl.textContent = "Explore";
    await renderExplore();
  } else if (route.screen === "destination") {
    backBtn.hidden = false;
    backBtn.onclick = () => (location.hash = "#/explore");
    await renderDestination(route.destSlug);
  } else if (route.screen === "course") {
    backBtn.hidden = false;
    backBtn.onclick = () => (location.hash = `#/destination/${route.destSlug}`);
    await renderCourse(route.destSlug, route.courseSlug);
  }
}

// ---------------- Explore grid ----------------

let exploreQuery = "";

async function renderExplore() {
  screenEl.innerHTML = `
    <div class="search-row">
      <input class="search-input" id="exploreSearch" type="text" placeholder="Search destinations..." value="${escapeHtml(exploreQuery)}" />
    </div>
    <div id="exploreGrid" class="loading">Loading destinations…</div>
  `;
  document.getElementById("exploreSearch").addEventListener("input", (e) => {
    exploreQuery = e.target.value;
    loadExploreGrid();
  });
  await loadExploreGrid();
}

async function loadExploreGrid() {
  const grid = document.getElementById("exploreGrid");
  const url = "/api/destinations" + (exploreQuery ? `?q=${encodeURIComponent(exploreQuery)}` : "");
  const { destinations } = await fetchJson(url);

  if (!destinations.length) {
    grid.className = "empty-state";
    grid.innerHTML = "No destinations match your search.";
    return;
  }

  grid.className = "dest-grid";
  grid.innerHTML = destinations
    .map((d) => {
      const isLive = d.status === "live";
      return `
        <div class="dest-card ${isLive ? "" : "disabled"}" data-slug="${d.slug}" data-live="${isLive}">
          <div class="dest-card-media">&#9906;</div>
          <div class="dest-card-body">
            <p class="dest-card-name">${escapeHtml(d.name)}</p>
            <p class="dest-card-meta">${escapeHtml(d.tagline)}</p>
            <span class="badge ${isLive ? "badge-live" : "badge-soon"}">
              ${isLive ? `${d.courseCount} courses` : "Coming soon"}
            </span>
          </div>
        </div>
      `;
    })
    .join("");

  grid.querySelectorAll(".dest-card").forEach((card) => {
    card.addEventListener("click", () => {
      if (card.dataset.live === "true") {
        location.hash = `#/destination/${card.dataset.slug}`;
      } else {
        showToast("Destination research not started yet (see W4/W5/W6 in Notion).");
      }
    });
  });
}

// ---------------- Destination Detail ----------------

async function renderDestination(slug) {
  screenEl.innerHTML = `<div class="loading">Loading destination…</div>`;
  let data;
  try {
    data = await fetchJson(`/api/destinations/${slug}`);
  } catch {
    screenEl.innerHTML = `<div class="empty-state">Destination not found.</div>`;
    return;
  }
  const { destination } = data;
  titleEl.textContent = destination.name;
  destFilters = { area: "", courseType: "", q: "" };
  destTab = "courses";
  paintDestination(destination);
}

function paintDestination(destination) {
  screenEl.innerHTML = `
    <div class="dest-hero">
      <h2>${escapeHtml(destination.name)}</h2>
      <p class="tagline">${escapeHtml(destination.tagline)}</p>
      <p class="hero-desc">${escapeHtml(destination.heroDescription)}</p>
    </div>
    <div class="section-tabs">
      <div class="section-tab ${destTab === "courses" ? "active" : ""}" data-tab="courses">Courses</div>
      <div class="section-tab ${destTab === "lodging" ? "active" : ""}" data-tab="lodging">Lodging</div>
      <div class="section-tab ${destTab === "dining" ? "active" : ""}" data-tab="dining">Dining</div>
    </div>
    <div id="destSectionBody"></div>
  `;

  screenEl.querySelectorAll(".section-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      destTab = tab.dataset.tab;
      paintDestination(destination);
    });
  });

  const body = document.getElementById("destSectionBody");
  if (destTab === "courses") {
    body.innerHTML = `
      <div class="search-row">
        <input class="search-input" id="courseSearch" type="text" placeholder="Search courses..." />
      </div>
      <div id="chipAreas" class="chip-row"></div>
      <div id="courseList" class="loading">Loading courses…</div>
    `;
    document.getElementById("courseSearch").addEventListener("input", (e) => {
      destFilters.q = e.target.value;
      loadCourses(destination.slug);
    });
    loadCourses(destination.slug);
  } else {
    const label = destTab === "lodging" ? "Lodging" : "Dining";
    body.innerHTML = `
      <div class="coming-soon">
        <span class="icon">&#128712;</span>
        <strong>${label} directory coming soon</strong>
        <p>No ${label.toLowerCase()} data has been researched for this destination yet.</p>
      </div>
    `;
  }
}

async function loadCourses(destSlug) {
  const params = new URLSearchParams();
  if (destFilters.area) params.set("area", destFilters.area);
  if (destFilters.courseType) params.set("courseType", destFilters.courseType);
  if (destFilters.q) params.set("q", destFilters.q);

  const { courses, filters } = await fetchJson(`/api/destinations/${destSlug}?${params.toString()}`);

  const chipWrap = document.getElementById("chipAreas");
  if (chipWrap) {
    chipWrap.innerHTML =
      `<div class="chip ${!destFilters.area ? "active" : ""}" data-area="">All areas</div>` +
      filters.areas
        .map((a) => `<div class="chip ${destFilters.area === a ? "active" : ""}" data-area="${escapeHtml(a)}">${escapeHtml(a)}</div>`)
        .join("");
    chipWrap.querySelectorAll(".chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        destFilters.area = chip.dataset.area;
        loadCourses(destSlug);
      });
    });
  }

  const list = document.getElementById("courseList");
  if (!courses.length) {
    list.className = "empty-state";
    list.innerHTML = "No courses match those filters.";
    return;
  }

  list.className = "";
  list.innerHTML = courses
    .map((c) => {
      const thumbStyle = c.photoUrl ? `style="background-image:url('${c.photoUrl}')"` : "";
      return `
        <div class="course-card" data-slug="${c.slug}">
          <div class="course-thumb" ${thumbStyle}>${c.photoUrl ? "" : "&#9906;"}</div>
          <div class="course-info">
            <p class="course-name">${escapeHtml(c.name)}</p>
            <p class="course-meta">${escapeHtml(c.area)}${c.designer ? ` · ${escapeHtml(c.designer)}` : ""}</p>
            <div class="course-tags">
              ${c.courseType ? `<span class="tag type">${escapeHtml(c.courseType)}</span>` : ""}
              ${c.holes ? `<span class="tag">${c.holes} holes</span>` : ""}
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  list.querySelectorAll(".course-card").forEach((card) => {
    card.addEventListener("click", () => {
      location.hash = `#/destination/${destSlug}/course/${card.dataset.slug}`;
    });
  });
}

// ---------------- Course Detail ----------------

async function renderCourse(destSlug, courseSlug) {
  screenEl.innerHTML = `<div class="loading">Loading course…</div>`;
  let data;
  try {
    data = await fetchJson(`/api/destinations/${destSlug}/courses/${courseSlug}`);
  } catch {
    screenEl.innerHTML = `<div class="empty-state">Course not found.</div>`;
    return;
  }
  const { course } = data;
  titleEl.textContent = course.name;

  const spec = (label, value) =>
    `<div class="spec"><p class="spec-label">${label}</p><p class="spec-value ${value ? "" : "muted"}">${value ? escapeHtml(value) : "Not published"}</p></div>`;

  screenEl.innerHTML = `
    <div class="course-hero-img" ${course.photoUrl ? `style="background-image:url('${course.photoUrl}')"` : ""}>
      ${course.photoUrl ? "" : "&#9906;"}
    </div>
    <h2 class="course-detail-title">${escapeHtml(course.name)}</h2>
    <p class="course-detail-area">${escapeHtml(course.area)}${course.designer ? ` · Designed by ${escapeHtml(course.designer)}` : ""}</p>
    <p class="detail-desc">${escapeHtml(course.description)}</p>

    <div class="spec-grid">
      ${spec("Course type", course.courseType)}
      ${spec("Holes", course.holes ? String(course.holes) : "")}
      ${spec("Par", course.par)}
      ${spec("Yardage", course.yardage)}
      ${spec("Slope / Rating", course.slopeRating)}
      ${spec("Greens fee", course.greensFeeRange)}
    </div>

    ${
      course.amenities && course.amenities.length
        ? `<div class="amenity-list">${course.amenities.map((a) => `<span class="tag">${escapeHtml(a)}</span>`).join("")}</div>`
        : ""
    }

    <div class="contact-row">
      ${course.address ? `<div>${escapeHtml(course.address)}</div>` : ""}
      ${course.phone ? `<div><a href="tel:${escapeHtml(course.phone)}">${escapeHtml(course.phone)}</a></div>` : ""}
      ${course.website ? `<div><a href="${escapeHtml(course.website)}" target="_blank" rel="noopener">${escapeHtml(course.website.replace(/^https?:\/\//, ""))}</a></div>` : ""}
    </div>

    <div class="sticky-cta">
      <button class="btn btn-secondary" id="bookBtn">Book Tee Time</button>
      <button class="btn btn-primary" id="addBtn">Add to Trip</button>
    </div>
  `;

  document.getElementById("addBtn").addEventListener("click", async () => {
    const res = await fetch("/api/trip/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destinationSlug: destSlug, courseSlug }),
    });
    const body = await res.json();
    showToast(body.message || "Added.");
  });

  document.getElementById("bookBtn").addEventListener("click", () => {
    showToast("Affiliate tee-time booking is Phase 2 (per W2 spec) — not in this prototype.");
  });
}
