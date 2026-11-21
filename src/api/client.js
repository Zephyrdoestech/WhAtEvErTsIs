// OWNER: DIN — the ONLY place the frontend talks to the backend.
// Everyone else imports these functions; signatures must stay stable (see TEAM.MD).
// Calls real /api/... endpoints and gracefully falls back to mocks.js if the server is offline.
import { MOCK_FLIGHTS, MOCK_TERMS, mockQuote } from "./mocks.js";

// A stalled server shouldn't freeze a stage: give up after this long and use the mock fallback.
const TIMEOUT_MS = 5000;

async function apiFetch(path, options = {}) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    ...options,
  });
  if (!res.ok) {
    const err = new Error(`API ${res.status} on ${path}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

// Send each endpoint only what it uses: no emails, phones or passport numbers leave the browser.
const quotePayload = (b = {}) => ({
  flight: b.flight ? { price: b.flight.price } : null,
  seat: b.seat ?? null,
  extras: b.extras ?? [],
  fees: b.fees ?? [],
});

const bookingPayload = (b = {}) => ({
  ...quotePayload(b),
  flight: b.flight ? { id: b.flight.id, airline: b.flight.airline, from: b.flight.from, to: b.flight.to, depart: b.flight.depart, arrive: b.flight.arrive, price: b.flight.price } : null,
  search: b.search ? { from: b.search.from, to: b.search.to } : null,
  passenger: b.passenger ? { firstName: b.passenger.firstName, lastName: b.passenger.lastName } : null,
  quote: b.quote ?? null,
});

/** @param {{from,to,departDate,returnDate,passengers}} search */
export async function searchFlights(search = {}) {
  try {
    const params = new URLSearchParams();
    if (search?.from) params.set("from", search.from);
    if (search?.to) params.set("to", search.to);
    if (search?.departDate || search?.date) params.set("date", search.departDate || search.date);
    if (search?.passengers) params.set("passengers", String(search.passengers));
    const qs = params.toString();
    return await apiFetch(`/api/flights${qs ? `?${qs}` : ""}`);
  } catch {
    return MOCK_FLIGHTS.map((f) => ({
      ...f,
      from: search?.from || f.from,
      to: search?.to || f.to,
    }));
  }
}

/** @returns {Promise<string[]>} paragraphs of "Terms & Punishments" */
export async function getTerms() {
  try {
    return await apiFetch("/api/terms");
  } catch {
    return MOCK_TERMS;
  }
}

/** @param booking the full booking object from useBooking() @returns {{items:{label,amount}[], total}} */
export async function getQuote(booking = {}) {
  try {
    return await apiFetch("/api/quote", {
      method: "POST",
      body: JSON.stringify(quotePayload(booking || {})),
    });
  } catch {
    return mockQuote(booking);
  }
}

/** @returns {{reference, status}} */
export async function createBooking(booking = {}) {
  try {
    return await apiFetch("/api/bookings", {
      method: "POST",
      body: JSON.stringify(bookingPayload(booking || {})),
    });
  } catch {
    return {
      reference: "WTF-404-" + Math.random().toString(36).slice(2, 5).toUpperCase(),
      status: "Confirmed-ish",
    };
  }
}

export async function getBooking(reference) {
  try {
    const ref = encodeURIComponent(String(reference || "WTF404").trim());
    return await apiFetch(`/api/bookings/${ref}`);
  } catch (err) {
    // A real 404 means the server is up and the booking doesn't exist; only an unreachable server gets the mock.
    if (err.status === 404) return { reference, status: "Not found", notFound: true };
    return { reference: reference || "WTF404", status: "Confirmed-ish" };
  }
}

export async function cancelBooking(reference) {
  try {
    const ref = encodeURIComponent(String(reference || "WTF404").trim());
    return await apiFetch(`/api/bookings/${ref}`, { method: "DELETE" });
  } catch {
    return { reference: reference || "WTF404", status: "Cancelled-ish" };
  }
}
