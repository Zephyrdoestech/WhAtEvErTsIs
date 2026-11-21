// OWNER: KYLE — see KYLE.MD (Stage 01: Welcome). Layout follows docs/references/02-welcome-login-ad.png.
import useBooking from "../../context/useBooking.js";
import "./Welcome.css";

const PROMOS = [
  { route: "CEBU → MANILA", price: "₱1*", note: "*plus breathing fee" },
  { route: "MANILA → TOKYO", price: "₱1*", note: "*Tokyo may be in the Philippines" },
  { route: "ANYWHERE → ???", price: "FREE*", note: "*(₱9,999)" },
];

const WEATHER = [
  ["Cebu", "Sunny* (*inside the building)"],
  ["Manila", "???"],
  ["Tokyo", "Piliin Mo ang Pilipinas"],
  ["Turbulence", "3% extra"],
];

const NEWS = [
  "Pilot found! (not the right one)",
  "Gate 404 is now open (location unknown)",
  "Runway moved 2 meters to the left. Planes not informed.",
  "Local passenger \"almost\" boards flight",
];

export default function Welcome() {
  const { next } = useBooking();
  return (
    <div className="welcome">
      <section className="welcome-hero">
        <span className="welcome-burst display" aria-hidden="true">NEW!!</span>
        <p className="welcome-route">MANILA → ANYWHERE</p>
        <h2 className="welcome-price display">₱1 FLIGHT!!!</h2>
        <p className="welcome-offer">LIMITED TIME OFFER (the time is limited to this sentence)</p>
        <button className="btn go welcome-book" onClick={next}>Book Now ✈</button>
        <p className="welcome-fine">*₱1 base fare + taxes, fees, fees on fees, breathing privileges, emotional support, and whatever we think of next. Fare valid for one (1) leg. Other leg sold separately.</p>
      </section>

      <div className="welcome-promos">
        {PROMOS.map((p) => (
          <section key={p.route} className="panel welcome-promo">
            <h3 className="panel-title red">{p.route}</h3>
            <div className="panel-body">
              <p className="welcome-promo-price display">{p.price}</p>
              <small>{p.note}</small>
            </div>
          </section>
        ))}
      </div>

      <div className="welcome-info">
        <section className="panel">
          <h3 className="panel-title purple">Today's flight weather</h3>
          <ul className="panel-body welcome-list">
            {WEATHER.map(([city, w]) => (
              <li key={city}><strong>{city}:</strong> {w}</li>
            ))}
          </ul>
        </section>
        <section className="panel">
          <h3 className="panel-title red">News flash</h3>
          <ul className="panel-body welcome-list">
            {NEWS.map((n) => <li key={n}>{n}</li>)}
          </ul>
        </section>
      </div>
    </div>
  );
}
