// OWNER: DAR — "Ye Olde Airlper", the stage-aware floating helper.
import { useState } from "react";
import JoseMariChan from "../../assets/images/Jose-Mari-Chan.png";
import useBooking from "../../context/useBooking.js";
import { getAirlperLine } from "./airlperLines.js";
import "./Airlper.css";

export default function Airlper() {
  const { stage } = useBooking();
  const [minimized, setMinimized] = useState(false);
  const line = getAirlperLine(stage);

  return (
    <aside className="airlper" aria-label="Airlper flight helper">
      <section
        id="airlper-panel"
        className="airlper__panel"
        aria-label="Airlper message"
        hidden={minimized}
      >
        <header className="airlper__header">
          <span className="airlper__avatar" aria-hidden="true">
            <img src={JoseMariChan} alt="" />
          </span>
          <div className="airlper__identity">
            <p className="airlper__name">Ye Olde Airlper</p>
            <p className="airlper__stage">Stage {stage} of 12</p>
          </div>
          <button
            className="airlper__minimize"
            type="button"
            aria-label="Minimize Airlper"
            aria-expanded={!minimized}
            aria-controls="airlper-panel"
            onClick={() => setMinimized(true)}
          >
            <span aria-hidden="true">−</span>
          </button>
        </header>
        <p className="airlper__message" aria-live="polite">
          {line}
        </p>
      </section>

      <button
        className="airlper__reopen"
        type="button"
        aria-label={`Open Airlper helper, stage ${stage} of 12`}
        aria-expanded={!minimized}
        aria-controls="airlper-panel"
        hidden={!minimized}
        onClick={() => setMinimized(false)}
      >
        <img src={JoseMariChan} alt="" />
      </button>
    </aside>
  );
}
