import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  DESTINATIONS,
  getDestinationBySlug,
  getCoursesForDestination,
  getCourseBySlug,
} from "./destinations.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;

// Explore grid: all destinations, with optional search + status filter.
app.get("/api/destinations", (req, res) => {
  const { q, status } = req.query;
  let results = DESTINATIONS;
  if (q) {
    const needle = String(q).toLowerCase();
    results = results.filter(
      (d) => d.name.toLowerCase().includes(needle) || d.state.toLowerCase().includes(needle)
    );
  }
  if (status && ["live", "coming_soon"].includes(status)) {
    results = results.filter((d) => d.status === status);
  }
  res.json({ destinations: results });
});

// Destination Detail: courses (+ lodging/dining stubs) for one destination.
app.get("/api/destinations/:slug", (req, res) => {
  const destination = getDestinationBySlug(req.params.slug);
  if (!destination) {
    return res.status(404).json({ error: `Unknown destination: ${req.params.slug}` });
  }
  const { area, courseType, q } = req.query;
  let courses = getCoursesForDestination(destination.slug);
  if (area) courses = courses.filter((c) => c.area === area);
  if (courseType) courses = courses.filter((c) => c.courseType === courseType);
  if (q) {
    const needle = String(q).toLowerCase();
    courses = courses.filter((c) => c.name.toLowerCase().includes(needle));
  }
  const allCourses = getCoursesForDestination(destination.slug);
  const areas = [...new Set(allCourses.map((c) => c.area).filter(Boolean))].sort();
  const courseTypes = [...new Set(allCourses.map((c) => c.courseType).filter(Boolean))].sort();
  res.json({ destination, courses, filters: { areas, courseTypes } });
});

// Course Detail.
app.get("/api/destinations/:slug/courses/:courseSlug", (req, res) => {
  const destination = getDestinationBySlug(req.params.slug);
  if (!destination) {
    return res.status(404).json({ error: `Unknown destination: ${req.params.slug}` });
  }
  const course = getCourseBySlug(req.params.slug, req.params.courseSlug);
  if (!course) {
    return res.status(404).json({ error: `Unknown course: ${req.params.courseSlug}` });
  }
  res.json({ destination, course });
});

// "Add to Trip" — stub, matches the wireframe spec (pushes into an existing
// trip's itinerary once Trip Hub / auth exist). No persistence here.
app.post("/api/trip/add", (req, res) => {
  const { courseSlug, destinationSlug } = req.body || {};
  if (!courseSlug || !destinationSlug) {
    return res.status(400).json({ error: "destinationSlug and courseSlug are required." });
  }
  const course = getCourseBySlug(destinationSlug, courseSlug);
  if (!course) {
    return res.status(404).json({ error: "Course not found." });
  }
  res.json({ ok: true, message: `${course.name} added to trip (stub — no Trip Hub yet).` });
});

app.listen(PORT, () => {
  console.log(`GolfTripOS destination directory prototype running at http://localhost:${PORT}`);
});
