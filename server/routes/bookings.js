// OWNER: DIN — POST /api/bookings, GET /api/bookings/:ref, PATCH /api/bookings/:ref, DELETE /api/bookings/:ref
import { Router } from "express";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const router = Router();
const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, "../data/db.json");

const bookingsStore = new Map();

function loadFromDisk() {
  try {
    if (existsSync(dbPath)) {
      const raw = JSON.parse(readFileSync(dbPath, "utf-8"));
      if (raw && typeof raw === "object") {
        for (const [ref, record] of Object.entries(raw)) {
          bookingsStore.set(ref, record);
        }
      }
    }
  } catch {
    // Ignore corrupt or missing db.json on startup
  }
}

function saveToDisk() {
  try {
    mkdirSync(dirname(dbPath), { recursive: true });
    const obj = Object.fromEntries(bookingsStore.entries());
    writeFileSync(dbPath, JSON.stringify(obj, null, 2), "utf-8");
  } catch {
    // Best-effort persistence
  }
}

loadFromDisk();

function generateReference() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 3; i += 1) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `WTF-404-${suffix}`;
}

function sanitizePassenger(passenger) {
  if (!passenger || typeof passenger !== "object") {
    return { firstName: "JUAN", lastName: "DELA CRUZ", fullName: "JUAN DELA CRUZ" };
  }
  const firstName = String(passenger.firstName || passenger.name || "JUAN").trim().slice(0, 60);
  const lastName = String(passenger.lastName || "DELA CRUZ").trim().slice(0, 60);
  const fullName = String(passenger.fullName || `${firstName} ${lastName}`).trim().slice(0, 120);
  return { firstName, lastName, fullName };
}

function sanitizeBookingInput(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return null;
  }
  return {
    flight: body.flight && typeof body.flight === "object" ? {
      id: String(body.flight.id || "WTS 001").slice(0, 20),
      airline: String(body.flight.airline || "WhAtEvErTsIs Air").slice(0, 60),
      from: String(body.flight.from || body?.search?.from || "MNL").slice(0, 60),
      to: String(body.flight.to || body?.search?.to || "UNKNOWN").slice(0, 60),
      depart: String(body.flight.depart || "Eventually").slice(0, 40),
      arrive: String(body.flight.arrive || "UNKNOWN").slice(0, 40),
      price: Number.isFinite(Number(body.flight.price)) && Number(body.flight.price) >= 0 ? Number(body.flight.price) : 1,
    } : {
      id: "WTS 001",
      airline: "WhAtEvErTsIs Air",
      from: String(body?.search?.from || "MNL").slice(0, 60),
      to: "UNKNOWN",
      depart: "Eventually",
      arrive: "UNKNOWN",
      price: 1,
    },
    seat: body.seat && typeof body.seat === "object" ? {
      code: String(body.seat.code || "12? · Moving").slice(0, 30),
      cls: String(body.seat.cls || "Emotional economy").slice(0, 40),
      window: Boolean(body.seat.window),
    } : {
      code: "12? · Moving",
      cls: "Emotional economy",
      window: false,
    },
    passenger: sanitizePassenger(body.passenger),
    extras: Array.isArray(body.extras) ? body.extras.slice(0, 20) : [],
    fees: Array.isArray(body.fees) ? body.fees.slice(0, 30) : [],
    quote: body.quote && typeof body.quote === "object" ? body.quote : null,
    gate: "404",
    destination: "UNKNOWN",
  };
}

export function clearBookingsStore() {
  bookingsStore.clear();
  saveToDisk();
}

router.post("/", (req, res) => {
  const clean = sanitizeBookingInput(req.body || {});
  if (!clean) {
    return res.status(400).json({ error: "Invalid booking payload" });
  }

  let reference = generateReference();
  while (bookingsStore.has(reference)) {
    reference = generateReference();
  }

  const record = {
    reference,
    status: "Confirmed-ish",
    survivor: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...clean,
  };

  bookingsStore.set(reference, record);
  saveToDisk();

  return res.status(201).json(record);
});

router.get("/:ref", (req, res) => {
  const ref = String(req.params.ref || "").trim().toUpperCase();
  if (!ref) {
    return res.status(400).json({ error: "Booking reference is required" });
  }
  const existing = bookingsStore.get(ref);
  if (!existing) {
    return res.status(404).json({
      error: "Booking not found (or forgotten by Ye Olde Airlper)",
      reference: ref,
      status: "Lost-ish",
    });
  }
  return res.json(existing);
});

router.patch("/:ref", (req, res) => {
  const ref = String(req.params.ref || "").trim().toUpperCase();
  const existing = bookingsStore.get(ref);
  if (!existing) {
    return res.status(404).json({ error: "Booking not found", reference: ref });
  }
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return res.status(400).json({ error: "Invalid update payload" });
  }

  const patchData = {};
  if (req.body.status) patchData.status = String(req.body.status).slice(0, 40);
  if (req.body.seat && typeof req.body.seat === "object") {
    patchData.seat = {
      ...existing.seat,
      code: String(req.body.seat.code || existing.seat?.code || "12? · Moving").slice(0, 30),
      cls: String(req.body.seat.cls || existing.seat?.cls || "Emotional economy").slice(0, 40),
    };
  }
  if (req.body.passenger && typeof req.body.passenger === "object") {
    patchData.passenger = sanitizePassenger({ ...existing.passenger, ...req.body.passenger });
  }
  if (typeof req.body.survivor === "boolean") {
    patchData.survivor = req.body.survivor;
  }

  const updated = {
    ...existing,
    ...patchData,
    reference: existing.reference,
    updatedAt: new Date().toISOString(),
  };

  bookingsStore.set(ref, updated);
  saveToDisk();
  return res.json(updated);
});

router.delete("/:ref", (req, res) => {
  const ref = String(req.params.ref || "").trim().toUpperCase();
  const existing = bookingsStore.get(ref);
  if (!existing) {
    // Even if not found in memory, return Cancelled-ish gracefully for demo safety
    return res.json({ reference: ref, status: "Cancelled-ish" });
  }

  const cancelled = {
    ...existing,
    status: "Cancelled-ish",
    updatedAt: new Date().toISOString(),
  };

  bookingsStore.set(ref, cancelled);
  saveToDisk();
  return res.json(cancelled);
});

export default router;
