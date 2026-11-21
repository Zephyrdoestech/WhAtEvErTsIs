// OWNER: KYLE — see KYLE.MD
// The app frame: header, frustration meter, current stage, and the chaos layer on top.
import BookingProvider from "../context/BookingProvider.jsx";
import useBooking from "../context/useBooking.js";
import { getStage } from "../stages/index.js";
import FrustrationMeter from "../components/layout/FrustrationMeter.jsx";
import ChaosLayer from "../components/chaos/ChaosLayer.jsx";
import "./AppShell.css";

function CurrentStage() {
  const { stage } = useBooking();
  const Stage = getStage(stage).component;
  return <Stage />;
}

function StepLabel() {
  const { stage } = useBooking();
  return <span className="step-label">Step {stage} of 12 · {getStage(stage).title}</span>;
}

export default function AppShell() {
  return (
    <BookingProvider>
      <div className="app-shell">
        <header className="app-header">
          <span className="logo">✈ WhAtEvErTsIs Airlines</span>
          <StepLabel />
          <FrustrationMeter />
        </header>
        <main className="stage-area">
          <CurrentStage />
        </main>
        <ChaosLayer />
      </div>
    </BookingProvider>
  );
}
