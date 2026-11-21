// OWNER: DIN — the ONLY place the frontend talks to the backend.
// Everyone else imports these functions; signatures must stay stable (see TEAM.MD).
// Calls real /api/... endpoints and gracefully falls back to mocks.js if the server is offline.
import { MOCK_FLIGHTS, MOCK_TERMS, mockQuote } from "./mocks.js";

async function apiFetch(path, options = {}) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API ${res.status} on ${path}`);
  }
  return res.json();
}

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
      body: JSON.stringify(booking || {}),
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
      body: JSON.stringify(booking || {}),
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
  } catch {
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
