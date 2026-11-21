// OWNER: KYLE — see KYLE.MD
// The app frame from docs/references: marquee, header, link bar, current stage, news ticker, footer, and the chaos layer on top.
import { useState } from "react";
import BookingProvider from "../context/BookingProvider.jsx";
import useBooking from "../context/useBooking.js";
import { getStage } from "../stages/index.js";
import FrustrationMeter from "../components/layout/FrustrationMeter.jsx";
import StepProgress from "../components/layout/StepProgress.jsx";
import ChaosLayer from "../components/chaos/ChaosLayer.jsx";
import { StageNavSlot } from "./stageNavSlot.js";
import "./AppShell.css";

const NAV_LINKS = ["Flights", "Hotels?", "Deals*", "Un-Deals", "Baggage", "Lost Baggage", "Manage Booking", "Un-Cancel", "Help", "Un-Help"];
const NEWS = ["Pilot found", "Gate 404 now open (gate not found)", "Runway moved 2m left", "Passengers reminded: YOU are the passenger", "hee hee"];

function CurrentStage() {
  const { stage } = useBooking();
  const Stage = getStage(stage).component;
  return <Stage />;
}

// Text scrolls right to left; the copy is doubled so the loop has no gap.
function Ticker({ className, items }) {
  const text = items.map((t) => `>>> ${t} `).join("");
  return (
    <div className={`ticker ${className}`}>
      <div className="ticker-track" aria-hidden="true">
        <span>{text}</span>
        <span>{text}</span>
      </div>
      <span className="sr-only">{items.join(". ")}</span>
    </div>
  );
}

function Marquee() {
  const { stage } = useBooking();
  return (
    <Ticker
      className="marquee"
      items={[
        `STEP ${stage} OF 12: ${getStage(stage).title.toUpperCase()}`,
        "WELCOME TO BAHALA NA AIR",
        "₱1 FLIGHTS!!!",
        "NOW WITH 3% MORE TURBULENCE",
        "YOU ARE OUR 1,000,000th VISITOR (everyone is)",
      ]}
    />
  );
}

function SurvivorBadge() {
  const { isSurvivor } = useBooking();
  return isSurvivor && <span className="survivor-badge">🏅 Certified Survivor</span>;
}

export default function AppShell() {
  const [navSlot, setNavSlot] = useState(null); // callback ref: set once the link bar mounts
  return (
    <BookingProvider>
      <StageNavSlot.Provider value={navSlot}>
      <div className="app-shell">
        <Marquee />
        <header className="app-header">
          <div className="brand">
            <h1 className="logo display">Whatever Tsis</h1>
            <p className="tagline">You're not booking a flight. You're earning it.</p>
            <SurvivorBadge />
          </div>
          <FrustrationMeter />
        </header>
        <nav className="link-bar" aria-label="Main">
          <div className="link-bar-links">
            {NAV_LINKS.map((label) => (
              <a key={label} href="#">{label}</a>
            ))}
          </div>
          <div ref={setNavSlot} className="link-bar-slot" />
          <StepProgress />
        </nav>
        <main className="stage-area">
          <CurrentStage />
        </main>
        <Ticker className="news" items={["NEWS", ...NEWS]} />
        <footer className="app-footer">
          <nav aria-label="Footer">
            <a href="#">Privacy Policy (lost)</a> | <a href="#">Terms &amp; Punishments</a> | <a href="#">Cookie Policy (crumbs only)</a> | <a href="#">Contact (disabled)</a>
          </nav>
          <p>© 1999-2026 Bahala Na Air / whatevertsis. All wrongs reserved. Fictional airline. Not valid for travel.</p>
        </footer>
        <ChaosLayer />
      </div>
      </StageNavSlot.Provider>
    </BookingProvider>
  );
}
