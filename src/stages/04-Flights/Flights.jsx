// OWNER: DAR — see DAR.MD (Stage 04: View Available Flights)
import { useEffect, useState } from "react";
import { searchFlights } from "../../api/client.js";
import { useControllerConfig } from "../../components/chaos/controllerConfig.js";
import SlowImage from "../../components/chaos/SlowImage.jsx";
import subwaySurfers from "../../assets/videos/subway_surfer.mp4";
import useBooking from "../../context/useBooking.js";
import "./Flights.css";
import LuggageDodgeGame from "./LuggageDodgeGame.jsx";

const EXTRA_FINE_PRINT = [
  [
    "Oxygen mask operates on a ₱5 coin slot (exact change only)",
    "Captain is piloting remotely via unstable 3G hotspot",
  ],
  [
    "Landing gear is rented by the hour and due back at 2:30 PM",
    "Cabin pressure is maintained entirely through peer pressure",
  ],
  [
    "Seatbelt is a decorative strip of electrical tape",
    "In-flight meal is a laminated photo of chicken adobo",
  ],
  [
    "Emergency exit leads directly to Stage 1",
    "Baggage compartment is shared with three competitive goats",
  ],
  [
    "Fuselage held together by thoughts, prayers, and Mighty Bond",
    "Co-pilot is Ye Olde Airlper (currently lost)",
  ],
  [
    "Runway tax not included; bring a shovel to help pave landing strip",
    "Complimentary turbulence upgraded from 3% to 47%",
  ],
];

function formatPriceLabel(flight) {
  if (flight.priceLabel) return flight.priceLabel;
  const numeric = Number(flight.price);
  if (Number.isFinite(numeric)) {
    return numeric === 0 ? "FREE* (*₱9,999)" : `₱${numeric}*`;
  }
  return "₱1*";
}

function mergeConditions(flight, index) {
  const apiConditions = Array.isArray(flight?.conditions) ? flight.conditions : [];
  const extras = EXTRA_FINE_PRINT[index % EXTRA_FINE_PRINT.length] ?? [];
  const combined = [...apiConditions];

  for (const line of extras) {
    if (!combined.includes(line)) {
      combined.push(line);
    }
  }
  return combined;
}

export default function Flights() {
  const { booking, updateBooking, next, back, bumpFrustration, demoMode } = useBooking();
  const { config } = useControllerConfig();
  const [flights, setFlights] = useState([]);
  const [apiDone, setApiDone] = useState(false);
  const [minigameDone, setMinigameDone] = useState(false);

  const loadDurationMs = demoMode ? 3000 : 9000;
  const showMinigame = Boolean(config.stage04Minigame) && !minigameDone;
  const loading = !apiDone || showMinigame;

  const search = booking?.search;
  const fromCity = search?.from || "Cebu (Mactan)";
  const toCity = search?.to || "PILIPINAS";
  const departDate = search?.departDate || search?.date || "Someday-ish";
  const passengers = search?.passengers || 1;

  useEffect(() => {
    let cancelled = false;

    const timerId = window.setTimeout(() => {
      if (!cancelled) {
        setMinigameDone(true);
      }
    }, loadDurationMs);

    searchFlights(search)
      .then((results) => {
        if (cancelled) return;
        setFlights(Array.isArray(results) ? results : []);
        setApiDone(true);
      })
      .catch(() => {
        if (cancelled) return;
        setFlights([]);
        setApiDone(true);
      });

    return () => {
      cancelled = true;
      window.clearTimeout(timerId);
    };
  }, [search, loadDurationMs]);

  function handleSelectFlight(flight, conditions) {
    updateBooking({
      flight: {
        ...flight,
        from: flight.from || fromCity,
        to: flight.to || toCity,
        conditions,
      },
    });
    bumpFrustration?.(2);
    next();
  }

  return (
    <div className="flights-stage">
      <section className="panel flights-banner">
        <h2 className="panel-title red">
          ✈ STEP 4: SUSPICIOUSLY CHEAP FLIGHTS FOUND!
        </h2>
        <div className="panel-body flights-banner__body">
          <div className="flights-banner__route">
            <span className="flights-banner__badge">SEARCH QUERY</span>
            <strong>{fromCity}</strong>
            <span aria-hidden="true"> ➔ </span>
            <strong>{toCity}</strong>
            <span className="flights-banner__meta">
              · Depart: <strong>{departDate}</strong> · Pax:{" "}
              <strong>{passengers}</strong>
            </span>
          </div>
          <p className="flights-banner__warning">
            ⚠️ All fares below are 99.998% discounted for reasons our legal team
            advised us not to disclose. Click any flight card to lock in your fate.
          </p>
        </div>
      </section>

      {loading ? (
        <>
          <LuggageDodgeGame durationMs={loadDurationMs} />
          {/* From docs/references/01: something to watch while flights "load". Muted, so it can't fight other sounds. */}
          <section className="panel flights-subway">
            <h3 className="panel-title purple">Subway Surfers (loading flights... still)</h3>
            <video className="flights-subway__video" src={subwaySurfers} autoPlay muted loop playsInline aria-hidden="true" />
          </section>
          {config.slowImage && (
            <SlowImage duration={loadDurationMs} maxOpacity={0.55} />
          )}
        </>
      ) : (
        <div className="flights-grid" role="list">
          {flights.map((flight, index) => {
            const conditions = mergeConditions(flight, index);
            const priceText = formatPriceLabel(flight);

            return (
              <article
                key={flight.id || index}
                className="panel flight-card"
                role="listitem"
                onClick={() => handleSelectFlight(flight, conditions)}
              >
                <div className="flight-card__header">
                  <div>
                    <span className="flight-card__code">{flight.id || `BN ${100 + index}`}</span>
                    <h3 className="flight-card__airline">
                      {flight.airline || "Bahala Na Air"}
                    </h3>
                  </div>
                  <span className="flight-card__deal-tag">
                    TOO CHEAP TO BE SAFE
                  </span>
                </div>

                <div className="panel-body flight-card__body">
                  <div className="flight-card__main">
                    <div className="flight-card__schedule">
                      <p className="flight-card__cities">
                        <span>{flight.from || fromCity}</span>
                        <span className="flight-card__arrow" aria-hidden="true">
                          {" "}
                          ✈➔{" "}
                        </span>
                        <span>{flight.to || toCity}</span>
                      </p>
                      <dl className="flight-card__times">
                        <div>
                          <dt>Departs:</dt>
                          <dd>{flight.depart || "Whenever"}</dd>
                        </div>
                        <div>
                          <dt>Arrives:</dt>
                          <dd>{flight.arrive || "Eventually"}</dd>
                        </div>
                      </dl>
                    </div>

                    <div className="flight-card__pricing">
                      <span className="flight-card__old-price">₱49,999</span>
                      <strong className="flight-card__price display">
                        {priceText}
                      </strong>
                      <span className="flight-card__price-sub">
                        *plus 17 mandatory surprises
                      </span>
                    </div>
                  </div>

                  <div className="flight-card__fineprint">
                    <p className="flight-card__fineprint-title">
                      🔍 Mandatory Fine Print &amp; Absurd Conditions:
                    </p>
                    <ul>
                      {conditions.map((condition) => (
                        <li key={condition}>{condition}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flight-card__actions">
                    <button
                      type="button"
                      className="btn go flight-card__select"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleSelectFlight(flight, conditions);
                      }}
                    >
                      Book {flight.id || "This Flight"} for {priceText} →
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="flights-footer">
        <button type="button" className="btn" onClick={back}>
          ← Back to Search
        </button>
      </div>
    </div>
  );
}
