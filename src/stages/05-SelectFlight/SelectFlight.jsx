// OWNER: RICKS — see RICKS.MD (Stage 05: Select Flight)
import { useState } from "react";
import useBooking from "../../context/useBooking.js";
import { MOCK_FLIGHTS } from "../../api/mocks.js";
import ForcefieldButton from "../../components/forcefield/ForcefieldButton.jsx";
import FireTransition from "../../components/transitions/FireTransition.jsx";
import "./SelectFlight.css";

const FALLBACK_FLIGHT = MOCK_FLIGHTS[0];

function formatPrice(amount) {
  const value = Number(amount ?? 1);
  return `₱${value.toLocaleString("en-PH")}`;
}

export default function SelectFlight() {
  const { booking, back, next, bumpFrustration } = useBooking();
  const [showFire, setShowFire] = useState(false);

  const flight = booking.flight ?? FALLBACK_FLIGHT;
  const from = flight.from || booking.search?.from || "MNL";
  const to = flight.to || booking.search?.to || "CEB";
  const depart = flight.depart || "05:55";
  const arrive = flight.arrive || "07:10";
  const airline = flight.airline || "WhAtEvErTsIs Air";
  const flightCode = flight.id || "WTF101";
  const conditions =
    Array.isArray(flight.conditions) && flight.conditions.length > 0
      ? flight.conditions
      : ["Pilot not included", "Wings sold separately"];

  const departDate = booking.search?.departDate;
  const passengers = booking.search?.passengers;

  return (
    <section className="select-flight">
      <div className="select-flight__top">
        <button type="button" className="select-flight__back" onClick={back}>
          ← Back to Flights
        </button>
        {!booking.flight && (
          <span className="select-flight__preview-tag">Sample flight loaded</span>
        )}
      </div>

      <header className="select-flight__header">
        <h1 className="select-flight__title">Confirm Your Flight</h1>
        <p className="select-flight__subtitle">
          Review the flight schedule and fare conditions before locking in your seat.
        </p>
      </header>

      <article className="flight-card">
        <div className="flight-card__banner">
          <div className="flight-card__airline">
            <span className="flight-card__code">{flightCode}</span>
            <span className="flight-card__carrier">{airline}</span>
          </div>
          <span className="flight-card__deal-badge">PROMO FARE*</span>
        </div>

        <div className="flight-card__route">
          <div className="flight-card__endpoint">
            <span className="flight-card__time">{depart}</span>
            <span className="flight-card__airport">{from}</span>
            <span className="flight-card__meta">Departure</span>
          </div>

          <div className="flight-card__path" aria-hidden="true">
            <span className="flight-card__path-note">Direct-ish</span>
            <div className="flight-card__line">
              <span className="flight-card__dot" />
              <span className="flight-card__plane">✈</span>
              <span className="flight-card__dot" />
            </div>
            <span className="flight-card__path-sub">Altitude optional</span>
          </div>

          <div className="flight-card__endpoint flight-card__endpoint--right">
            <span className="flight-card__time">{arrive}</span>
            <span className="flight-card__airport">{to}</span>
            <span className="flight-card__meta">Arrival (approx.)</span>
          </div>
        </div>

        {(departDate || passengers) && (
          <div className="flight-card__trip-meta">
            {departDate && <span>Date: <strong>{departDate}</strong></span>}
            {passengers && (
              <span>
                Passengers: <strong>{passengers}</strong>
              </span>
            )}
          </div>
        )}

        <div className="flight-card__conditions">
          <h2 className="flight-card__conditions-title">Fare Conditions &amp; Disclosures</h2>
          <ul className="flight-card__conditions-list">
            {conditions.map((condition, index) => (
              <li key={`${condition}-${index}`} className="flight-card__condition-item">
                <span className="flight-card__condition-icon" aria-hidden="true">
                  ⚠️
                </span>
                <span>{condition}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flight-card__footer">
          <div className="flight-card__price-box">
            <span className="flight-card__price-label">Advertised Base Fare</span>
            <span className="flight-card__price">{formatPrice(flight.price)}</span>
            <span className="flight-card__price-note">
              *Excludes taxes, oxygen, and emotional convenience fees
            </span>
          </div>

          <div className="select-flight__action">
            <ForcefieldButton
              type="button"
              className="select-flight-btn"
              disabled={showFire}
              onDodge={() => bumpFrustration(3)}
              onClick={() => setShowFire(true)}
            >
              Select Flight →
            </ForcefieldButton>
          </div>
        </div>
      </article>

      {showFire && <FireTransition onDone={next} />}
    </section>
  );
}
