// OWNER: KYLE — everyone imports this hook to read/write shared booking state.
import { useContext } from "react";
import { BookingContext } from "./bookingContext.js";

export default function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking() must be used inside <BookingProvider>");
  return ctx;
}
