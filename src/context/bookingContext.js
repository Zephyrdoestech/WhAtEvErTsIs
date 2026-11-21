// OWNER: KYLE — the React context object. Use the useBooking() hook, not this directly.
import { createContext } from "react";
export const BookingContext = createContext(null);

export const EMPTY_BOOKING = {
  user: null,        // { mode: "login" | "register" | "guest", name }        — Stage 02 (SYOS)
  search: null,      // { from, to, departDate, returnDate, passengers }      — Stage 03 (SYOS)
  flight: null,      // flight object from api.searchFlights                  — Stage 04/05 (DAR/RICKS)
  seat: null,        // { code: "12A", cls: "economy", window: true }         — Stage 06 (RICKS)
  passenger: null,   // { firstName, lastName, email, ... }                   — Stage 07 (SYOS)
  extras: [],        // [{ id, label, price }]                                — Stage 08 (DAR)
  extrasVisited: false, // true once Stage 08 saved a choice (so [] means "declined", not "not asked yet")
  fees: [],          // [{ label, amount }] surprise fees added along the way — anyone
  quote: null,       // { items, total } from api.getQuote                    — Stage 09/10
  reference: null,   // booking reference from api.createBooking             — Stage 10 (DIN)
  survivor: false,   // true once the e-ticket is shown                       — Stage 11 (DIN)
};
