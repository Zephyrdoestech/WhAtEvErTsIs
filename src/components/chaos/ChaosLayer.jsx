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
  const { stage, demoMode } = useBooking() ?? {};
  const [muted, setMuted] = useState(false);
  const [adOpenForStage, setAdOpenForStage] = useState(null);
  const surpriseAdOpen = adOpenForStage !== null && adOpenForStage === stage;

  // Periodically pop open a surprise AdPopup on stages that don't already have heavy modal gauntlets (01 SheaAd, 08 Guilt/Ad, 10 Payment gauntlet)
  useEffect(() => {
    if (surpriseAdOpen) return undefined;
    if (stage === 1 || stage === 8 || stage === 10) return undefined;

    const delay = demoMode ? 16000 : 42000;
    const timerId = window.setTimeout(() => {
      setAdOpenForStage(stage);
    }, delay);

    return () => window.clearTimeout(timerId);
  }, [demoMode, stage, surpriseAdOpen]);

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
      {stage !== 4 && (
        <SlowImage
          duration={demoMode ? 10000 : 30000}
          maxOpacity={0.55}
        />
      )}
      <AdPopup
        open={surpriseAdOpen}
        onClose={() => setAdOpenForStage(null)}
      />
    </>
  );
}
