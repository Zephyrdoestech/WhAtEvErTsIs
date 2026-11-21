// OWNER: KYLE — see KYLE.MD and the "Shared booking state" section of TEAM.MD
import { useCallback, useMemo, useState } from "react";
import { BookingContext, EMPTY_BOOKING } from "./bookingContext.js";

const params = new URLSearchParams(window.location.search);

// Dev shortcut: open http://localhost:5173/?stage=7 to jump straight to stage 7.
function initialStage() {
  const n = Number(params.get("stage"));
  return n >= 1 && n <= 12 ? n : 1;
}


export default function BookingProvider({ children }) {
  const [stage, setStage] = useState(initialStage);
  const [booking, setBooking] = useState(EMPTY_BOOKING);
  const [frustration, setFrustration] = useState(0);
  const [loopCount, setLoopCount] = useState(0);
  const [isSurvivor, setIsSurvivor] = useState(false); // outlives resetBooking, unlike booking.survivor
  const demoMode = params.has("demo"); // ?demo shortens timers for the live demo

  const goTo = useCallback((n) => setStage(Math.min(12, Math.max(1, n))), []);
  const next = useCallback(() => setStage((s) => Math.min(12, s + 1)), []);
  const back = useCallback(() => setStage((s) => Math.max(1, s - 1)), []);
  const updateBooking = useCallback((patch) => {
    if (patch.survivor) setIsSurvivor(true);
    setBooking((b) => ({ ...b, ...patch }));
  }, []);
  const addFee = useCallback((label, amount) => setBooking((b) => ({ ...b, fees: [...b.fees, { label, amount }] })), []);
  const bumpFrustration = useCallback((n = 5) => setFrustration((f) => Math.min(100, f + n)), []);
  const resetBooking = useCallback(() => {
    setBooking(EMPTY_BOOKING);
    setLoopCount((c) => c + 1);
    setStage(1);
  }, []);
  // Like goTo, but counts a loop and keeps the booking (Stage 12 "Modify").
  const loopBackTo = useCallback((n) => {
    setLoopCount((c) => c + 1);
    goTo(n);
  }, [goTo]);

  const value = useMemo(
    () => ({ stage, goTo, next, back, booking, updateBooking, addFee, frustration, bumpFrustration, loopCount, resetBooking, loopBackTo, isSurvivor, demoMode }),
    [stage, goTo, next, back, booking, updateBooking, addFee, frustration, bumpFrustration, loopCount, resetBooking, loopBackTo, isSurvivor, demoMode]
  );
  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}
