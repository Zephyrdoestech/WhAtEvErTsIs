// OWNER: DAR — "Ye Olde Airlper", the stage-aware peeking helper.
import { useEffect, useState } from "react";
import JoseMariChan from "../../assets/images/Jose-Mari-Chan.png";
import useBooking from "../../context/useBooking.js";
import { getAirlperLines } from "./airlperLines.js";
import "./Airlper.css";

const PEEK_POSITIONS = [
  { name: "left-top", side: "left", x: "0%", y: "8%", offsetY: "0%" },
  { name: "right-top", side: "right", x: "100%", y: "8%", offsetY: "0%" },
  { name: "left-middle", side: "left", x: "0%", y: "50%", offsetY: "-50%" },
  { name: "right-middle", side: "right", x: "100%", y: "50%", offsetY: "-50%" },
  { name: "left-bottom", side: "left", x: "0%", y: "92%", offsetY: "-100%" },
  { name: "right-bottom", side: "right", x: "100%", y: "92%", offsetY: "-100%" },
];

function chooseDifferentIndex(length, currentIndex) {
  if (length < 2) return 0;
  if (currentIndex < 0 || currentIndex >= length) return Math.floor(Math.random() * length);

  const nextIndex = Math.floor(Math.random() * (length - 1));
  return nextIndex >= currentIndex ? nextIndex + 1 : nextIndex;
}

export default function Airlper() {
  const { stage } = useBooking();
  const stageLines = getAirlperLines(stage);
  const [minimized, setMinimized] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [ticker, setTicker] = useState(() => ({
    stage,
    lineIndex: 0,
    positionIndex: Math.floor(Math.random() * PEEK_POSITIONS.length),
  }));

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    setTicker((current) => ({ ...current, stage, lineIndex: 0 }));
  }, [stage]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setTicker((current) => {
        const currentLineIndex = current.stage === stage ? current.lineIndex : 0;

        return {
          stage,
          lineIndex: chooseDifferentIndex(stageLines.length, currentLineIndex),
          positionIndex: prefersReducedMotion
            ? current.positionIndex
            : chooseDifferentIndex(PEEK_POSITIONS.length, current.positionIndex),
        };
      });
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [prefersReducedMotion, stage, stageLines]);

  const position = PEEK_POSITIONS[ticker.positionIndex] ?? PEEK_POSITIONS[0];
  const lineIndex = ticker.stage === stage ? ticker.lineIndex : 0;
  const line = stageLines[lineIndex] ?? stageLines[0];

  return (
    <aside
      className={`airlper airlper--${position.side}`}
      data-position={position.name}
      aria-label="Airlper flight helper"
      style={{
        left: position.x,
        top: position.y,
        "--airlper-offset-x": position.side === "left" ? "-12%" : "12%",
        "--airlper-offset-y": position.offsetY,
      }}
    >
      {minimized ? (
        <button
          className="airlper__face-button"
          type="button"
          aria-label={`Open Airlper message for stage ${stage} of 12`}
          aria-expanded="false"
          onClick={() => setMinimized(false)}
        >
          <img src={JoseMariChan} alt="" />
        </button>
      ) : (
        <img className="airlper__face" src={JoseMariChan} alt="Jose Mari Chan" />
      )}

      {!minimized && (
        <div className="airlper__speech" id="airlper-message">
          <div className="airlper__speech-heading">
            <span>Ye Olde Airlper · Stage {stage} of 12</span>
            <button
              className="airlper__minimize"
              type="button"
              aria-label="Minimize Airlper"
              aria-expanded="true"
              onClick={() => setMinimized(true)}
            >
              <span aria-hidden="true">−</span>
            </button>
          </div>
          <p className="airlper__message" role="status" aria-live="polite" aria-atomic="true">
            {line}
          </p>
        </div>
      )}
    </aside>
  );
}
