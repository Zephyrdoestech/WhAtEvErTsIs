// OWNER: RICKS — see RICKS.MD (Stage 09: Review Booking)
import { useEffect, useRef, useState } from "react";
import useBooking from "../../context/useBooking.js";
import { getQuote, getTerms } from "../../api/client.js";
import KachowTransition from "../../components/transitions/KachowTransition.jsx";
import "./Review.css";

const FALLBACK_SUPPLEMENTAL_TERMS = [
  "3. Scrolling faster than a Victorian scholar reading by candlelight violates Section 4.",
  "4. Section 4: See Section 3, and please return to the top of this box.",
  "5. Window seats are billed a Window Appreciation Fee regardless of cloud cover or existential dread.",
  "6. The aircraft reserves the right to depart early, late, sideways, or spiritually.",
  "7. Carry-on luggage must fit under the seat in front of someone else on a different flight.",
  "8. In the event of mild turbulence, passengers agree to maintain polite eye contact with the ceiling.",
  "9. Confirmed bookings are legally defined as Confirmed-ish and subject to whimsical reconsideration.",
  "10. All customer complaints are carefully archived into an inactive volcano within 3–5 business eternities.",
  "11. By reaching this final clause slowly, you acknowledge that ₱1 was merely a vibe and not a total.",
];

const SCROLL_SPEED_WINDOW_MS = 140;
const RESET_COOLDOWN_MS = 450;

function formatPeso(amount) {
  const num = Number(amount ?? 0);
  return `₱${num.toLocaleString("en-PH")}`;
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
  const [showKachow, setShowKachow] = useState(false);
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
        // Ensure enough clauses to require real scrolling even when running against the 2-line mock stub
        const fullTerms =
          list.length >= 8 ? list : [...list, ...FALLBACK_SUPPLEMENTAL_TERMS];
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

    // Detect scrollbar-dragging / PageDown jumps OR rapid downward wheel flicks
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
      setTermsWarning("Please read responsibly! You scrolled too fast — back to the top.");
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

  const from = flight?.from || search?.from || "MNL";
  const to = flight?.to || search?.to || "CEB";
  const passengerName = getPassengerName(booking);
  const passengerEmail = passenger?.email;
  const extrasList = Array.isArray(extras) ? extras : [];
  const feesList = Array.isArray(fees) ? fees : [];
  const quoteItems = Array.isArray(quote?.items) ? quote.items : [];

  return (
    <section className="review-stage">
      <div className="review-stage__top">
        <button type="button" className="review-stage__back" onClick={back}>
          ← Back to Extras
        </button>
        <span className="review-stage__badge">Almost There (Probably)</span>
      </div>

      <header className="review-stage__header">
        <h1 className="review-stage__title">Review Your Booking</h1>
        <p className="review-stage__subtitle">
          Double-check your itinerary, fare breakdown, and Terms &amp; Punishments before checkout.
        </p>
      </header>

      <div className="review-grid">
        <div className="review-left-col">
          <div className="review-card">
            <h2 className="review-card__title">Itinerary Summary</h2>

            <div className="review-section">
              <span className="review-section__label">Route &amp; Flight</span>
              <div className="review-route">
                <strong className="review-route__airports">
                  {from} → {to}
                </strong>
                {flight ? (
                  <span className="review-route__meta">
                    {flight.airline || "WhAtEvErTsIs Air"} · {flight.id || "WTF101"} ·{" "}
                    {flight.depart || "05:55"} – {flight.arrive || "07:10"}
                  </span>
                ) : (
                  <span className="review-route__meta">No flight selected yet</span>
                )}
                {(search?.departDate || search?.returnDate || search?.passengers) && (
                  <span className="review-route__sub">
                    {search.departDate ? `Depart: ${search.departDate}` : ""}
                    {search.returnDate ? ` · Return: ${search.returnDate}` : ""}
                    {search.passengers ? ` · ${search.passengers} passenger(s)` : ""}
                  </span>
                )}
              </div>
            </div>

            <div className="review-section review-section--split">
              <div>
                <span className="review-section__label">Passenger</span>
                <p className="review-value">{passengerName}</p>
                {passengerEmail && <p className="review-subvalue">{passengerEmail}</p>}
              </div>

              <div>
                <span className="review-section__label">Seat Assignment</span>
                {seat ? (
                  <>
                    <p className="review-value">
                      Seat {seat.code} <span className="review-pill">{seat.cls}</span>
                    </p>
                    <p className="review-subvalue">
                      {seat.window ? "Window seat (scenic view taxed)" : "Non-window seat"}
                    </p>
                  </>
                ) : (
                  <p className="review-subvalue">Not selected yet</p>
                )}
              </div>
            </div>

            <div className="review-section">
              <span className="review-section__label">Add-on Extras</span>
              {extrasList.length > 0 ? (
                <ul className="review-list">
                  {extrasList.map((item, idx) => (
                    <li key={item.id ?? `${item.label}-${idx}`} className="review-list__item">
                      <span>{item.label}</span>
                      <strong>{formatPeso(item.price ?? item.amount)}</strong>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="review-subvalue">No extras selected.</p>
              )}
            </div>

            <div className="review-section">
              <span className="review-section__label">Surprise Fees Accrued</span>
              {feesList.length > 0 ? (
                <ul className="review-list">
                  {feesList.map((fee, idx) => (
                    <li
                      key={`${fee.label}-${idx}`}
                      className="review-list__item review-list__item--fee"
                    >
                      <span>{fee.label}</span>
                      <strong>{formatPeso(fee.amount)}</strong>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="review-subvalue">No surprise fees yet (give us a second).</p>
              )}
            </div>
          </div>

          <div className="review-card terms-card">
            <div className="terms-card__header">
              <h2 className="review-card__title terms-card__title">Terms &amp; Punishments</h2>
              <span className="terms-card__progress">
                {reachedBottom ? "✓ Fully read" : `${scrollProgress}% read`}
              </span>
            </div>

            <p className="terms-card__hint">
              Scroll <strong>slowly</strong> to the very bottom to unlock the agreement checkbox.
            </p>

            {termsWarning && (
              <div key={resetCount} className="terms-card__warning" role="alert">
                ⚠️ {termsWarning}
              </div>
            )}

            <div
              ref={termsBoxRef}
              className={`terms-box ${termsWarning ? "terms-box--warned" : ""} ${
                reachedBottom ? "terms-box--done" : ""
              }`}
              onScroll={handleTermsScroll}
              tabIndex={0}
              aria-label="Terms and Punishments"
            >
              {loadingTerms ? (
                <p className="review-subvalue">Loading legally questionable clauses…</p>
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

            <label
              className={`terms-agree ${!reachedBottom ? "terms-agree--locked" : ""}`}
            >
              <input
                type="checkbox"
                checked={agreed}
                disabled={!reachedBottom}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <span>
                I have read every word slowly and I agree to the Terms &amp; Punishments.
              </span>
            </label>
          </div>
        </div>

        <aside className="review-quote-card">
          <h2 className="review-card__title">Official Fare Quote</h2>

          {loadingQuote && <p className="review-subvalue">Calculating mandatory fees…</p>}
          {quoteError && <p className="review-error">{quoteError}</p>}

          {!loadingQuote && quote && (
            <>
              <ul className="quote-items">
                {quoteItems.map((item, idx) => (
                  <li key={`${item.label}-${idx}`} className="quote-items__row">
                    <span>{item.label}</span>
                    <strong>{formatPeso(item.amount)}</strong>
                  </li>
                ))}
              </ul>

              <div className="quote-total">
                <div>
                  <span className="quote-total__label">Total Due</span>
                  <span className="quote-total__note">Started as a ₱1 promo!</span>
                </div>
                <strong className="quote-total__amount">{formatPeso(quote.total)}</strong>
              </div>
            </>
          )}

          <button
            type="button"
            className="review-continue-btn"
            disabled={!agreed || showKachow}
            onClick={() => setShowKachow(true)}
          >
            {agreed ? "Continue to Payment →" : "Read & Agree to Continue"}
          </button>
        </aside>
      </div>

      {showKachow && <KachowTransition onDone={next} />}
    </section>
  );
}
