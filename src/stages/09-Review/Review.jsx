// OWNER: RICKS — see RICKS.MD (Stage 09: Review Booking)
import { useEffect, useRef, useState } from "react";
import useBooking from "../../context/useBooking.js";
import { getQuote } from "../../api/client.js";
import "./Review.css";

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
  const { booking, updateBooking, back, next } = useBooking();
  const { flight, seat, extras, fees, search, passenger } = booking;

  const [quote, setQuote] = useState(booking.quote);
  const [loadingQuote, setLoadingQuote] = useState(true);
  const [quoteError, setQuoteError] = useState(null);

  const bookingRef = useRef(booking);
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
          Double-check your itinerary and totally reasonable ₱1* fare breakdown before checkout.
        </p>
      </header>

      <div className="review-grid">
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
                  <li key={`${fee.label}-${idx}`} className="review-list__item review-list__item--fee">
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

          <button type="button" className="review-continue-btn" onClick={next}>
            Continue to Payment →
          </button>
        </aside>
      </div>
    </section>
  );
}
