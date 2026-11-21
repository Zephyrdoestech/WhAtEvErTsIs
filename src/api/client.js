// OWNER: DIN — the ONLY place the frontend talks to the backend.
// Everyone else imports these functions; signatures must stay stable (see TEAM.MD).
// For now they return mock data. DIN.MD task 6 switches them to real fetch() with a mock fallback.
import { MOCK_FLIGHTS, MOCK_TERMS, mockQuote } from "./mocks.js";

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/** @param {{from,to,departDate,returnDate,passengers}} search */
export async function searchFlights(search) {
  void search;
  await wait(300);
  return MOCK_FLIGHTS;
}

/** @returns {Promise<string[]>} paragraphs of "Terms & Punishments" */
export async function getTerms() {
  return MOCK_TERMS;
}

/** @param booking the full booking object from useBooking() @returns {{items:{label,amount}[], total}} */
export async function getQuote(booking) {
  void booking;
  return mockQuote();
}

/** @returns {{reference, status}} */
export async function createBooking(booking) {
  void booking;
  return { reference: "WTF-404-" + Math.random().toString(36).slice(2, 5).toUpperCase(), status: "Confirmed-ish" };
}

export async function getBooking(reference) {
  return { reference, status: "Confirmed-ish" };
}

export async function cancelBooking(reference) {
  return { reference, status: "Cancelled-ish" };
}
