// OWNER: RICKS — see RICKS.MD (Stage 09: Review Booking)
import { useEffect, useRef, useState } from "react";
import useBooking from "../../context/useBooking.js";
import { getQuote, getTerms } from "../../api/client.js";
import "./Review.css";

const FALLBACK_SUPPLEMENTAL_TERMS = [
  "3. Scrolling faster than one line per second constitutes a breach of Section 4.",
  "4. Section 4: See Section 3, and please return to the top of this box.",
  "5. Window seats are billed a Window Appreciation Fee regardless of cloud cover.",
  "6. The aircraft reserves the right to depart early, late, sideways, or spiritually.",
  "7. Carry-on luggage must fit under the seat in front of someone else on a different flight.",
  "8. In the event of mild turbulence, passengers agree to maintain polite eye contact with the ceiling.",
  "9. Confirmed bookings are legally defined as Confirmed-ish.",
  "10. Complaints are reviewed within 3–5 business eternities.",
];

const SCROLL_SPEED_WINDOW_MS = 140;
const RESET_COOLDOWN_MS = 450;

function formatPeso(amount) {
  const num = Number(amount ?? 0);
  return `₱${num.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getPassengerName(booking) {
  const p = booking.passenger;
  if (p) {
    const joined = [p.firstName, p.lastName].filter(Boolean).join(" ").trim();
    if (joined) return joined;
    if (p.fullName) return p.fullName;
    if (p.name) return p.name;
  }
  if (booking.user?.name) return booking.user.name;
  return "Mystery Survivor";
}

export default function Review() {
  const { booking, updateBooking, bumpFrustration, back, next, demoMode } = useBooking();
  const { flight, seat, extras, fees, search, passenger } = booking;

  const [quote, setQuote] = useState(booking.quote);
  const [loadingQuote, setLoadingQuote] = useState(true);
  const [quoteError, setQuoteError] = useState(null);

  const [terms, setTerms] = useState([]);
  const [loadingTerms, setLoadingTerms] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [reachedBottom, setReachedBottom] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [termsWarning, setTermsWarning] = useState("");
  const [resetCount, setResetCount] = useState(0);

  const bookingRef = useRef(booking);
  const termsBoxRef = useRef(null);
  const scrollSamplesRef = useRef([]);
  const isResettingRef = useRef(false);
  const lastResetAtRef = useRef(0);

  useEffect(() => {
    bookingRef.current = booking;
  }, [booking]);

  useEffect(() => {
    let active = true;

    getQuote(bookingRef.current)
      .then((result) => {
        if (!active || !result) return;
        setQuote(result);
        setQuoteError(null);
        updateBooking({ quote: result });
      })
      .catch(() => {
        if (!active) return;
        setQuoteError("Unable to fetch the final fee breakdown right now.");
      })
      .finally(() => {
        if (active) setLoadingQuote(false);
      });

    return () => {
      active = false;
    };
  }, [flight, seat, extras, fees, search, updateBooking]);

  useEffect(() => {
    let active = true;

    getTerms()
      .then((result) => {
        if (!active) return;
        const list = Array.isArray(result) ? result : [];
        const fullTerms = list.length >= 8 ? list : [...list, ...FALLBACK_SUPPLEMENTAL_TERMS];
        setTerms(fullTerms);
      })
      .catch(() => {
        if (!active) return;
        setTerms(FALLBACK_SUPPLEMENTAL_TERMS);
      })
      .finally(() => {
        if (active) setLoadingTerms(false);
      });

    return () => {
      active = false;
    };
  }, []);

  function handleTermsScroll(event) {
    const el = event.currentTarget;
    if (isResettingRef.current) return;

    const maxScroll = Math.max(1, el.scrollHeight - el.clientHeight);
    const currentTop = el.scrollTop;
    const progress = Math.min(100, Math.round((currentTop / maxScroll) * 100));
    setScrollProgress(progress);

    if (reachedBottom) return;

    const now = performance.now();
    if (now - lastResetAtRef.current < RESET_COOLDOWN_MS) return;

    const samples = scrollSamplesRef.current;
    const prev = samples.length > 0 ? samples[samples.length - 1] : null;
    samples.push({ top: currentTop, t: now });
    while (samples.length > 1 && now - samples[0].t > SCROLL_SPEED_WINDOW_MS) {
      samples.shift();
    }

    const maxSpeedPxPerMs = demoMode ? 0.72 : 0.36;
    const maxSingleJumpPx = demoMode ? 220 : 140;

    const singleJump = prev ? currentTop - prev.top : currentTop;
    const dt = samples.length >= 2 ? now - samples[0].t : 0;
    const windowDelta = samples.length >= 2 ? currentTop - samples[0].top : 0;
    const windowSpeed = dt > 12 ? windowDelta / dt : 0;

    if (singleJump > maxSingleJumpPx || (windowDelta > 35 && windowSpeed > maxSpeedPxPerMs)) {
      isResettingRef.current = true;
      lastResetAtRef.current = now;
      scrollSamplesRef.current = [];
      el.scrollTop = 0;
      setScrollProgress(0);
      setTermsWarning(
        "!! YOU SCROLLED TOO FAST. PROGRESS RESET TO 0%. PLEASE BEGIN AGAIN. SLOWLY. !!"
      );
      setResetCount((c) => c + 1);
      bumpFrustration(5);
      window.requestAnimationFrame(() => {
        isResettingRef.current = false;
      });
      return;
    }

    if (currentTop + el.clientHeight >= el.scrollHeight - 8) {
      setReachedBottom(true);
      setScrollProgress(100);
      setTermsWarning("");
    }
  }

  const from = flight?.from || search?.from || "Cebu (Mactan)";
  const to = flight?.to || search?.to || "PILIPINAS";
  const passengerName = getPassengerName(booking);
  const passengerEmail = passenger?.email;
  const extrasList = Array.isArray(extras) ? extras : [];
  const feesList = Array.isArray(fees) ? fees : [];
  const quoteItems = Array.isArray(quote?.items) ? quote.items : [];

  return (
    <section className="review-stage">
      <div className="review-stage__bar">
        <button type="button" className="btn" onClick={back}>
          ← Back to Extras
        </button>
      </div>

      <div className="review-grid">
        {/* Left panel: Terms & Punishments (matched to docs/references/03-terms-payment-kachow.png) */}
        <section className="panel review-panel">
          <h2 className="panel-title purple">
            TERMS &amp; PUNISHMENTS - Step 9 of 12 (scroll slowly. no, slower.)
          </h2>
          <div className="panel-body terms-panel-body">
            <p className="terms-progress-label">
              Read progress: <strong>{scrollProgress}%</strong>{" "}
              {reachedBottom
                ? "(legally binding enough!)"
                : "(about 4 hours remaining at legal speed)"}
            </p>

            <div className="terms-progress-track" aria-hidden="true">
              <div
                className="terms-progress-fill"
                style={{ width: `${scrollProgress}%` }}
              />
            </div>

            <div
              ref={termsBoxRef}
              className={`terms-box ${termsWarning ? "terms-box--warned" : ""} ${reachedBottom ? "terms-box--done" : ""
                }`}
              onScroll={handleTermsScroll}
              tabIndex={0}
              aria-label="Terms and Punishments"
            >
              {loadingTerms ? (
                <p>Loading legally questionable clauses…</p>
              ) : (
                terms.map((paragraph, idx) => (
                  <p key={`term-${idx}`} className="terms-box__paragraph">
                    {paragraph}
                  </p>
                ))
              )}
              {!loadingTerms && (
                <p className="terms-box__end">— End of Terms &amp; Punishments —</p>
              )}
            </div>

            {termsWarning && (
              <div key={resetCount} className="terms-warning-bar" role="alert">
                {termsWarning}
              </div>
            )}

            <label className={`terms-agree ${!reachedBottom ? "terms-agree--locked" : ""}`}>
              <input
                type="checkbox"
                checked={agreed}
                disabled={!reachedBottom}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <span>I have read and agree to all of it (unlocks at 100% read)</span>
            </label>

            <div>
              <button
                type="button"
                className={`btn ${agreed ? "go" : ""} review-agree-btn`}
                disabled={!agreed}
                onClick={next}
              >
                {agreed ? "I AGREE — CONTINUE TO PAYMENT →" : "I AGREE (locked)"}
              </button>
            </div>
          </div>
        </section>

        {/* Right panel: Itinerary Summary + Official Fare Quote */}
        <section className="panel review-panel">
          <h2 className="panel-title">ITINERARY &amp; FARE QUOTE - Step 9 of 12</h2>
          <div className="panel-body review-summary-body">
            <div className="review-block">
              <h3 className="review-block__heading">Itinerary Summary</h3>

              <div className="review-kv">
                <span>Route:</span>
                <strong>
                  {from} → {to}
                </strong>
              </div>
              <div className="review-kv">
                <span>Flight:</span>
                <strong>
                  {flight
                    ? `${flight.id || "BN 101"} (${flight.airline || "Bahala Na Air"}) · ${flight.depart || "3:00 AM"
                    } → ${flight.arrive || "3:00 AM (next week)"}`
                    : "Not selected yet"}
                </strong>
              </div>
              <div className="review-kv">
                <span>Seat:</span>
                <strong>
                  {seat
                    ? `${seat.code} (${seat.cls}${seat.window ? ", Window" : ""})`
                    : "Not selected yet"}
                </strong>
              </div>
              <div className="review-kv">
                <span>Passenger:</span>
                <strong>
                  {passengerName}
                  {passengerEmail ? ` (${passengerEmail})` : ""}
                </strong>
              </div>

              {extrasList.length > 0 && (
                <div className="review-sublist">
                  <span className="review-sublist__label">Extras:</span>
                  <ul>
                    {extrasList.map((item, idx) => (
                      <li key={item.id ?? `${item.label}-${idx}`}>
                        <span>{item.label}</span>
                        <strong>{formatPeso(item.price ?? item.amount)}</strong>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {feesList.length > 0 && (
                <div className="review-sublist review-sublist--fees">
                  <span className="review-sublist__label">Surprise Fees Accrued:</span>
                  <ul>
                    {feesList.map((fee, idx) => (
                      <li key={`${fee.label}-${idx}`}>
                        <span>{fee.label}</span>
                        <strong>{formatPeso(fee.amount)}</strong>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="review-quote-block">
              <h3 className="review-block__heading">Official Price Breakdown</h3>

              {loadingQuote && <p className="review-muted">Calculating mandatory fees…</p>}
              {quoteError && <p className="review-error">{quoteError}</p>}

              {!loadingQuote && quote && (
                <>
                  <ul className="quote-items">
                    {quoteItems.map((item, idx) => (
                      <li key={`${item.label}-${idx}`} className="quote-items__row">
                        <span>{item.label}</span>
                        <span>{formatPeso(item.amount)}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="quote-total">
                    <span className="quote-total__label">TOTAL (was ₱1*)</span>
                    <strong className="quote-total__amount display">
                      {formatPeso(quote.total)}
                    </strong>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
