// OWNER: DIN — see DIN.MD (Stage 11: Confirmed-ish e-ticket)
// Built strictly from Figma "Screen References" page tab (Frame 28:3: whatevertsis — Fictional e-ticket).
import { useEffect, useState } from "react";
import useBooking from "../../context/useBooking.js";
import "./Confirmation.css";

// 51 barcode bar widths matching Figma nodes 28:78 through 28:128
const BARCODE_WIDTHS = [
  2, 3, 5, 1, 1, 4, 2, 2, 3, 5, 1, 1, 4, 2, 2, 3, 5,
  1, 1, 4, 2, 2, 3, 5, 1, 1, 4, 2, 2, 3, 5, 1, 1, 4,
  2, 2, 3, 5, 1, 1, 4, 2, 2, 3, 5, 1, 1, 4, 2, 2, 3,
];

const CONFETTI_COLORS = ["#cc0000", "#ffee00", "#003399", "#33cc33", "#ff66cc", "#660099"];

const CONFETTI_PIECES = Array.from({ length: 80 }, (_, idx) => ({
  id: idx,
  left: `${(idx * 13) % 100}%`,
  delay: `${(idx % 12) * 0.14}s`,
  color: CONFETTI_COLORS[idx % CONFETTI_COLORS.length],
}));

function getAirportCode(cityOrCode) {
  const raw = String(cityOrCode || "").trim().toUpperCase();
  if (!raw) return "MNL";
  if (raw.includes("MANILA") || raw === "MNL") return "MNL";
  if (raw.includes("CEBU") || raw === "CEB") return "CEB";
  if (raw.includes("TOKYO") || raw === "NRT") return "NRT";
  if (raw.includes("DAVAO") || raw === "DVO") return "DVO";
  return raw.slice(0, 3);
}

export default function Confirmation() {
  const { booking, updateBooking, next } = useBooking();
  // wave 1: immediate giant blast, wave 0: quiet pause so user thinks it's done, wave 2: ambush second blast!
  const [congratsWave, setCongratsWave] = useState(1);

  // Mark user as Certified Survivor on mount + schedule fakeout second congrats blast
  useEffect(() => {
    if (!booking?.survivor) {
      updateBooking({ survivor: true });
    }
    const endWave1 = setTimeout(() => setCongratsWave(0), 4200);
    const startWave2 = setTimeout(() => setCongratsWave(2), 6800);
    const endWave2 = setTimeout(() => setCongratsWave(0), 11200);
    return () => {
      clearTimeout(endWave1);
      clearTimeout(startWave2);
      clearTimeout(endWave2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Derive passenger name, reference, seat, flight, origin, and total from booking context with Figma defaults
  const passengerName = (() => {
    const p = booking?.passenger;
    if (p && typeof p === "object") {
      const full = p.fullName || [p.firstName, p.lastName].filter(Boolean).join(" ");
      if (full.trim()) return full.trim().toUpperCase();
    }
    if (booking?.user?.name) return String(booking.user.name).toUpperCase();
    return "JUAN DELA CRUZ";
  })();

  const reference = booking?.reference || "WTF404";
  const seatCode = booking?.seat?.code || "12? · Moving";
  const seatClass = booking?.seat?.cls || "Emotional economy";
  const flightId = booking?.flight?.id || "WTS 001";
  const departTime = booking?.flight?.depart || "Eventually";
  const originRaw = booking?.search?.from || booking?.flight?.from || "MANILA";
  const originLabel = `FROM / ${String(originRaw).toUpperCase()}`;
  const originCode = getAirportCode(originRaw);

  const quoteTotal = booking?.quote?.total
    ? `₱${Number(booking.quote.total).toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : "₱4,999";

  return (
    <div
      className="eticket-canvas"
      data-node-id="28:3"
      data-name="whatevertsis — Fictional e-ticket"
    >
      {/* Giant obstructive confetti + CONGRATULATIONS blast (fires again after user thinks it's done!) */}
      {congratsWave > 0 && (
        <div key={`wave-${congratsWave}`} className="eticket-confetti-layer" aria-hidden="true">
          {CONFETTI_PIECES.map((piece) => (
            <div
              key={`${congratsWave}-${piece.id}`}
              className="eticket-confetti-piece"
              style={{
                left: piece.left,
                animationDelay: piece.delay,
                backgroundColor: piece.color,
              }}
            />
          ))}
          <div className="eticket-congrats-blast">
            <p className="eticket-congrats-blast-title">
              {congratsWave === 1 ? "CONGRATULATIONS!!!" : "WAIT—CONGRATS AGAIN!!!"}
            </p>
            <p className="eticket-congrats-blast-sub">
              {congratsWave === 1
                ? "YOU SURVIVED CHECKOUT!! GOOD LUCK READING YOUR TICKET!!"
                : "YOU THOUGHT IT WAS OVER?! CERTIFIED SURVIVOR!!"}
            </p>
          </div>
        </div>
      )}

      {/* 1. Confirmation marquee (28:4) */}
      <div className="eticket-marquee-bar" data-node-id="28:4" data-name="Confirmation marquee">
        <p className="eticket-marquee-text" data-node-id="28:5">
          {`>>> CONGRATULATIONS!!! >>> YOUR FLIGHT IS CONFIRMED-ISH >>> GATE 404 >>> NO REFUNDS, ONLY PERSONAL GROWTH >>>`}
        </p>
      </div>

      {/* 2. Airline site header (28:6) */}
      <div className="eticket-site-header" data-node-id="28:6" data-name="Airline site header">
        <div className="eticket-identity" data-node-id="28:7" data-name="Airline identity">
          <p className="eticket-brand" data-node-id="28:8">
            Whatever tsis
          </p>
          <p className="eticket-tagline" data-node-id="28:9">
            {`You're not booking a flight. You're earning it.`}
          </p>
        </div>

        <div className="eticket-session-panel" data-node-id="28:10" data-name="Booking session panel">
          <p className="eticket-session-title" data-node-id="28:11">
            {`BOOKING COMPLETE*  (terms still loading)`}
          </p>
          <p className="eticket-session-ref" data-node-id="28:12">
            {`Passenger: ${passengerName}     Ref: ${reference}`}
          </p>
          <p className="eticket-session-warning" data-node-id="28:13">
            *Complete does not necessarily mean finished.
          </p>
        </div>
      </div>

      {/* 3. Airline navigation (28:14) */}
      <div className="eticket-nav" data-node-id="28:14" data-name="Airline navigation">
        {[
          "Flights",
          "Hotels?",
          "Deals*",
          "Un-Deals",
          "Baggage",
          "Lost Baggage",
          "Manage Booking",
          "Un-Cancel",
          "Help",
          "Un-Help",
        ].map((item) => (
          <button
            key={item}
            type="button"
            className="eticket-nav-link"
            onClick={() => {
              if (item === "Manage Booking") next();
            }}
          >
            {item}
          </button>
        ))}
      </div>

      {/* 4. Confirmation header banner (28:25) */}
      <div className="eticket-confirm-header" data-node-id="28:25" data-name="Confirmation header">
        <div className="eticket-stage-progress" data-node-id="28:26" data-name="Stage and progress">
          <p className="eticket-stage-label" data-node-id="28:27">
            {`11 / 12  —  BOOKING CONFIRMATION`}
          </p>
          <p className="eticket-demo-notice" data-node-id="28:28">
            FICTIONAL AIRLINE · DEMO ONLY
          </p>
        </div>

        <div className="eticket-confirm-title-row" data-node-id="28:29" data-name="Confirmation title">
          <p className="eticket-success-heading" data-node-id="28:30">
            You made it. Unfortunately.
          </p>
          <div className="eticket-status-pill" data-node-id="28:31" data-name="Status pill">
            <p className="eticket-status-pill-text" data-node-id="28:32">
              {`●  Confirmed-ish`}
            </p>
          </div>
        </div>
      </div>

      {/* 5. Boarding Pass Card (28:33) */}
      <div className="eticket-boarding-pass" data-node-id="28:33" data-name="Boarding pass">
        <div className="eticket-masthead" data-node-id="28:34" data-name="Ticket masthead">
          <p className="eticket-wordmark" data-node-id="28:35">
            whatevertsis
          </p>
          <div className="eticket-booking-id" data-node-id="28:36" data-name="Booking identifier">
            <p className="eticket-doc-title" data-node-id="28:37">
              E-TICKET / BOARDING PASS
            </p>
            <p className="eticket-doc-ref" data-node-id="28:38">
              {`BOOKING REF.  ${reference}`}
            </p>
          </div>
        </div>

        <div className="eticket-pass-body" data-node-id="28:39" data-name="Pass body">
          {/* Left Itinerary section (28:40) */}
          <div className="eticket-itinerary" data-node-id="28:40" data-name="Itinerary">
            <div className="eticket-journey-row" data-node-id="28:41" data-name="Journey">
              <div className="eticket-origin" data-node-id="28:42" data-name="Origin">
                <p className="eticket-field-mini-label" data-node-id="28:43">
                  {originLabel}
                </p>
                <p className="eticket-airport-code" data-node-id="28:44">
                  {originCode}
                </p>
              </div>

              <div className="eticket-journey-arrow-wrap" data-node-id="28:45" data-name="Journey disclaimer">
                <p className="eticket-route-direction" data-node-id="28:46">
                  – – – – – – – – – →
                </p>
                <p className="eticket-route-note" data-node-id="28:47">
                  ONE WAY. PROBABLY.
                </p>
              </div>

              <div className="eticket-destination" data-node-id="28:48" data-name="Destination">
                <p className="eticket-field-mini-label" data-node-id="28:49">
                  DESTINATION
                </p>
                <p className="eticket-airport-code eticket-airport-code--unknown" data-node-id="28:50">
                  ???
                </p>
                <p className="eticket-unknown-sub" data-node-id="28:51">
                  UNKNOWN
                </p>
              </div>
            </div>

            {/* Passenger / Departure / Flight row (28:52) */}
            <div className="eticket-details-grid-row" data-node-id="28:52" data-name="Passenger and schedule">
              <div className="eticket-detail-cell" data-node-id="28:53" data-name="PASSENGER">
                <p className="eticket-field-mini-label" data-node-id="28:54">
                  PASSENGER
                </p>
                <p className="eticket-detail-value" data-node-id="28:55">
                  {passengerName}
                </p>
              </div>

              <div className="eticket-detail-cell" data-node-id="28:56" data-name="DEPARTURE">
                <p className="eticket-field-mini-label" data-node-id="28:57">
                  DEPARTURE
                </p>
                <p className="eticket-detail-value" data-node-id="28:58">
                  {departTime}
                </p>
              </div>

              <div className="eticket-detail-cell" data-node-id="28:59" data-name="FLIGHT">
                <p className="eticket-field-mini-label" data-node-id="28:60">
                  FLIGHT
                </p>
                <p className="eticket-detail-value" data-node-id="28:61">
                  {flightId}
                </p>
              </div>
            </div>

            {/* Gate / Seat / Class row (28:62) */}
            <div className="eticket-details-grid-row" data-node-id="28:62" data-name="Boarding assignments">
              <div className="eticket-detail-cell" data-node-id="28:63" data-name="GATE">
                <p className="eticket-field-mini-label" data-node-id="28:64">
                  GATE
                </p>
                <p className="eticket-detail-value" data-node-id="28:65">
                  404
                </p>
              </div>

              <div className="eticket-detail-cell" data-node-id="28:66" data-name="SEAT">
                <p className="eticket-field-mini-label" data-node-id="28:67">
                  SEAT
                </p>
                <p className="eticket-detail-value" data-node-id="28:68">
                  {seatCode}
                </p>
              </div>

              <div className="eticket-detail-cell" data-node-id="28:69" data-name="CLASS">
                <p className="eticket-field-mini-label" data-node-id="28:70">
                  CLASS
                </p>
                <p className="eticket-detail-value" data-node-id="28:71">
                  {seatClass}
                </p>
              </div>
            </div>
          </div>

          {/* Right Survivor stub (28:72) */}
          <div className="eticket-survivor-stub" data-node-id="28:72" data-name="Survivor stub">
            <p className="eticket-stub-heading" data-node-id="28:73">
              ACHIEVEMENT UNLOCKED
            </p>
            <div className="eticket-survivor-title" data-node-id="28:74">
              <div>CERTIFIED</div>
              <div>SURVIVOR</div>
            </div>
            <div className="eticket-survivor-note" data-node-id="28:75">
              <div>You defeated checkout.</div>
              <div>The flight is another matter.</div>
            </div>
            <p className="eticket-seq-label" data-node-id="28:76">
              {`SEQ 000001  /  HUMAN-ISH`}
            </p>
            <div className="eticket-barcode" data-node-id="28:77" data-name="Decorative barcode">
              {BARCODE_WIDTHS.map((w, i) => (
                <div
                  key={i}
                  className="eticket-barcode-bar"
                  style={{ width: `${w}px` }}
                />
              ))}
            </div>
            <p className="eticket-barcode-disclaimer" data-node-id="28:129">
              DECORATIVE. SCANS YOUR PATIENCE.
            </p>
          </div>
        </div>

        {/* Fare and terms gray footer strip (28:130) */}
        <div className="eticket-fare-strip" data-node-id="28:130" data-name="Fare and terms">
          <div className="eticket-fare-disclosure" data-node-id="28:131" data-name="Fare disclosure">
            <p className="eticket-fare-total" data-node-id="28:132">
              {`₱1 fare. ${quoteTotal} total. Character built.`}
            </p>
            <p className="eticket-fee-breakdown" data-node-id="28:133">
              ₱1 fare + ₱299 breathing + ₱699 emotional support + ₱4,000 because.
            </p>
          </div>
          <div className="eticket-demo-warning" data-node-id="28:134" data-name="Demo warning">
            <p className="eticket-not-valid" data-node-id="28:135">
              NOT VALID FOR TRAVEL
            </p>
            <p className="eticket-payment-disclaimer" data-node-id="28:136">
              Demo payment only. No real booking.
            </p>
          </div>
        </div>
      </div>

      {/* 6. Booking aftermath row (28:137) */}
      <div className="eticket-aftermath-row" data-node-id="28:137" data-name="Booking aftermath">
        <div className="eticket-aftercare-actions" data-node-id="28:138" data-name="Aftercare actions">
          <div className="eticket-frustration-badge" data-node-id="28:139" data-name="Frustration score">
            <p className="eticket-frustration-text" data-node-id="28:140">
              FRUSTRATION
            </p>
            <div className="eticket-frustration-line" data-node-id="28:141" />
            <p className="eticket-frustration-text" data-node-id="28:142">
              100% · PERSONAL BEST
            </p>
          </div>

          <div className="eticket-action-btns" data-node-id="28:143" data-name="Ticket actions">
            <button
              type="button"
              className="eticket-manage-btn"
              data-node-id="28:144"
              onClick={() => next()}
            >
              {`Manage booking  ↻`}
            </button>
            <button
              type="button"
              className="eticket-print-btn"
              data-node-id="28:146"
              onClick={() => window.print()}
            >
              Print ticket
            </button>
          </div>

          <p className="eticket-loop-warning" data-node-id="28:148">
            Manage booking returns you to the beginning. You’re welcome.
          </p>
        </div>

        <div className="eticket-airlper-card" data-node-id="28:149" data-name="Ye Olde Airlper">
          <div className="eticket-airlper-header" data-node-id="28:150" data-name="Helper identity">
            <p className="eticket-airlper-title" data-node-id="28:151">
              Ye Olde Airlper
            </p>
            <p className="eticket-airlper-state" data-node-id="28:152">
              MEMORY: 0 KB
            </p>
          </div>
          <div className="eticket-airlper-quote" data-node-id="28:153">
            <div>“Prithee, where dost thou travel?</div>
            <div>And… who art thou again?”</div>
          </div>
          <p className="eticket-airlper-disclaimer" data-node-id="28:154">
            Your details have already been forgotten.
          </p>
        </div>
      </div>

      {/* 7. Flight news ticker (28:155) */}
      <div className="eticket-news-ticker" data-node-id="28:155" data-name="Flight news ticker">
        <p className="eticket-news-text" data-node-id="28:156">
          {`NEWS >>> Gate 404 now open (gate not found) >>> Runway moved 2m left >>> Passengers reminded: you are the passenger >>> hee hee >>>`}
        </p>
      </div>

      {/* 8. Airline legal footer (28:157) */}
      <div className="eticket-legal-footer" data-node-id="28:157" data-name="Airline legal footer">
        <p className="eticket-legal-line" data-node-id="28:158">
          {`Privacy Policy (lost)  |  Terms & Punishments  |  Cookie Policy (crumbs only)  |  Contact (disabled)`}
        </p>
        <p className="eticket-legal-line" data-node-id="28:159">
          © 1999–2026 Bahala Na Air / whatevertsis. All wrongs reserved. Fictional airline. Not valid for travel.
        </p>
      </div>
    </div>
  );
}
