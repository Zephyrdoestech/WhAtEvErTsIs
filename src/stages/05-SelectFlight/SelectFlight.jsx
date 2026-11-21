// OWNER: RICKS — see RICKS.MD (Stage 05: Select Flight)
import { useState } from "react";
import useBooking from "../../context/useBooking.js";
import { MOCK_FLIGHTS } from "../../api/mocks.js";
import ForcefieldButton from "../../components/forcefield/ForcefieldButton.jsx";
import FireTransition from "../../components/transitions/FireTransition.jsx";
import "./SelectFlight.css";

const FALLBACK_FLIGHT = MOCK_FLIGHTS[0];

function formatPrice(flight) {
  if (flight.priceLabel) return flight.priceLabel;
  const value = Number(flight.price ?? 1);
  return `₱${value.toLocaleString("en-PH")}*`;
}

export default function SelectFlight() {
  const { booking, back, next, bumpFrustration } = useBooking();
  const [showFire, setShowFire] = useState(false);

  const flight = booking.flight ?? FALLBACK_FLIGHT;
  const from = flight.from || booking.search?.from || "Cebu (Mactan)";
  const to = flight.to || booking.search?.to || "PILIPINAS";
  const depart = flight.depart || "3:00 AM";
  const arrive = flight.arrive || "3:00 AM (next week)";
  const airline = flight.airline || "Bahala Na Air";
  const flightCode = flight.id || "BN 101";
  const conditions =
    Array.isArray(flight.conditions) && flight.conditions.length > 0
      ? flight.conditions
      : ["Must bring own pilot", "Wings sold separately"];

  const departDate = booking.search?.departDate;
  const passengers = booking.search?.passengers;

  return (
    <section className="select-flight">
      <div className="panel">
        <h2 className="panel-title">
          SELECT FLIGHT - Step 5 of 12 (confirm your terrible choice)
        </h2>

        <div className="panel-body">
          <div className="select-flight__bar">
            <button type="button" className="btn" onClick={back}>
              ← Back to Flights
            </button>
            {!booking.flight && (
              <span className="select-flight__sample-tag">SAMPLE FLIGHT LOADED</span>
            )}
          </div>

          <div className="select-flight__route-banner">
            <span className="select-flight__code display">{flightCode}</span>
            <div className="select-flight__route-text">
              <strong className="select-flight__airports">
                {from} → {to}
              </strong>
              <span className="select-flight__carrier">{airline} · PROMO FARE*</span>
            </div>
            <div className="select-flight__price-tag">
              <span className="select-flight__price display">{formatPrice(flight)}</span>
              <span className="select-flight__price-sub">*plus mandatory vibes</span>
            </div>
          </div>

          <div className="select-flight__table-wrap">
            <table className="select-flight__table">
              <thead>
                <tr>
                  <th>Flight</th>
                  <th>Departs</th>
                  <th>Arrives</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>{flightCode}</strong> ({airline})
                  </td>
                  <td>{depart}</td>
                  <td>{arrive}</td>
                  <td className="select-flight__table-price">{formatPrice(flight)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {(departDate || passengers) && (
            <p className="select-flight__trip-meta">
              {departDate && (
                <span>
                  Date: <strong>{departDate}</strong>
                </span>
              )}
              {passengers && (
                <span>
                  Passengers: <strong>{passengers}</strong> (+6 hidden passengers)
                </span>
              )}
            </p>
          )}

          <div className="select-flight__conditions">
            <h3 className="select-flight__conditions-title">
              ⚠ ABSURD FARE CONDITIONS (NON-NEGOTIABLE)
            </h3>
            <ul className="select-flight__conditions-list">
              {conditions.map((condition, index) => (
                <li key={`${condition}-${index}`}>{condition}</li>
              ))}
            </ul>
          </div>

          <div className="select-flight__cta-box">
            <div className="select-flight__cta-wrap">
              <ForcefieldButton
                type="button"
                className="btn go select-flight-btn"
                disabled={showFire}
                onDodge={() => bumpFrustration(3)}
                onClick={() => setShowFire(true)}
              >
                Select
              </ForcefieldButton>
            </div>
            <span className="select-flight__cta-note">FORCEFIELD ACTIVE - move slowly</span>
          </div>
        </div>
      </div>

      {showFire && <FireTransition onDone={next} />}
    </section>
  );
}
