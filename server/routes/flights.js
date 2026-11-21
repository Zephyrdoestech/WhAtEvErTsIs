// OWNER: DIN — GET /api/flights?from=&to=&date=&passengers=
import { Router } from "express";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const router = Router();
const __dirname = dirname(fileURLToPath(import.meta.url));
const flightsPath = join(__dirname, "../data/flights.json");

const EXTRA_CURSED_TIMES = [
  { depart: "3:00 AM", arrive: "3:00 AM (next week)" },
  { depart: "Gate not found", arrive: "UNKNOWN" },
  { depart: "11:59 PM", arrive: "12:01 AM (Tue-ish)" },
  { depart: "Whenever", arrive: "Eventually" },
  { depart: "Tomorrow (yesterday)", arrive: "Never" },
  { depart: "04:04 AM", arrive: "Error 500 PM" },
  { depart: "5 mins ago", arrive: "Before departure" },
];

const EXTRA_CONDITIONS = [
  "Window is a sticker",
  "Departs when the pilot feels ready",
  "Must bring own pilot",
  "Plane subject to existence",
  "Standing room only. Standing not included.",
  "Layover: 3 days in Cebu (the same city)",
  "Plane may or may not land",
  "Seatbelts are decorative",
];

function loadTemplateFlights() {
  try {
    return JSON.parse(readFileSync(flightsPath, "utf-8"));
  } catch {
    return [];
  }
}

router.get("/", (req, res) => {
  const from = (req.query.from || "Cebu (Mactan)").toString().trim() || "Cebu (Mactan)";
  const rawTo = (req.query.to || "PILIPINAS").toString().trim() || "PILIPINAS";
  const to = rawTo;
  const date = (req.query.date || "mm/dd/yyyy (ish)").toString();
  const passengers = Math.max(1, Number.parseInt(req.query.passengers, 10) || 1);

  const templates = loadTemplateFlights();
  // Return between 5 and 7 flights (within the 4-8 spec, always starting with the 5 Figma Screen 2 flights)
  const count = Math.min(templates.length, Math.max(5, Math.floor(Math.random() * 3) + 5));
  const selected = templates.slice(0, count).map((flight, index) => {
    // Keep the top 5 Figma reference times recognizable, slightly randomize additional ones
    const timePair =
      index < 5
        ? { depart: flight.depart, arrive: flight.arrive }
        : EXTRA_CURSED_TIMES[Math.floor(Math.random() * EXTRA_CURSED_TIMES.length)];

    const extraCond = EXTRA_CONDITIONS[(index + Math.floor(Math.random() * EXTRA_CONDITIONS.length)) % EXTRA_CONDITIONS.length];
    const conditions = Array.from(new Set([...(flight.conditions || []), extraCond]));

    const dynamicConditions = conditions.map((c) =>
      c.includes("Cebu") && from ? `Layover: 3 days in ${from} (the same city)` : c
    );

    return {
      ...flight,
      from,
      to,
      date,
      passengers,
      hiddenPassengers: passengers + 6,
      depart: timePair.depart,
      arrive: timePair.arrive,
      conditions: dynamicConditions,
    };
  });

  res.json(selected);
});

export default router;
