// OWNER: DAR — see DAR.MD. Everything that interrupts the user on every page lives here.
// AppShell renders this once on top of all stages.
import { useEffect, useState } from "react";
import useBooking from "../../context/useBooking.js";
import AdPopup from "./AdPopup.jsx";
import Airlper from "./Airlper.jsx";
import "./ChaosLayer.css";
import HeeHee from "./HeeHee.jsx";
import SlowImage from "./SlowImage.jsx";

export default function ChaosLayer() {
  const { demoMode } = useBooking() ?? {};
  const [muted, setMuted] = useState(false);
  const [surpriseAdOpen, setSurpriseAdOpen] = useState(false);

  // Periodically pop open a surprise AdPopup when none is open
  useEffect(() => {
    if (surpriseAdOpen) return undefined;

    const delay = demoMode ? 14000 : 40000;
    const timerId = window.setTimeout(() => {
      setSurpriseAdOpen(true);
    }, delay);

    return () => window.clearTimeout(timerId);
  }, [demoMode, surpriseAdOpen]);

  return (
    <>
      <button
        type="button"
        className="chaos-mute-toggle"
        aria-pressed={muted}
        aria-label={muted ? "Unmute chaos sounds" : "Mute chaos sounds"}
        onClick={() => setMuted((current) => !current)}
      >
        <span aria-hidden="true">{muted ? "🔇" : "🔊"}</span>
        <span>{muted ? "Chaos Muted" : "Mute Chaos"}</span>
      </button>

      <Airlper />
      <HeeHee muted={muted} />
      <SlowImage
        duration={demoMode ? 10000 : 30000}
        maxOpacity={0.6}
      />
      <AdPopup
        open={surpriseAdOpen}
        onClose={() => setSurpriseAdOpen(false)}
      />
    </>
  );
}
