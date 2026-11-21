// OWNER: SYOS — see SYOS.MD. Used by Stage 02 (SYOS), Stage 07 (SYOS), Stage 10 (DIN).
// Contract (do not change without telling DIN):
//   <Captcha onPass={() => {}} onFail={() => {}} chain={1} />
//   chain = how many CAPTCHAs in a row before onPass fires (default 1; task 2).
import { useId, useRef, useState } from "react";
import useBooking from "../../context/useBooking.js";
import { questions } from "./questions.js";
import "./Captcha.css";

function nextQuestion(previousId) {
  const available = questions.filter((question) => question.id !== previousId);
  return available[Math.floor(Math.random() * available.length)];
}

export default function Captcha({ onPass, onFail, chain = 1 }) {
  // Task 1 verifies one grid. Chaining and other variants follow in task 2.
  void chain;
  const { bumpFrustration } = useBooking();
  const headingId = useId();
  const hintId = useId();
  const [question, setQuestion] = useState(() => nextQuestion());
  const [selected, setSelected] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [passed, setPassed] = useState(false);
  const resolved = useRef(false);

  function toggleTile(id) {
    if (resolved.current) return;
    setSelected((current) => current.includes(id)
      ? current.filter((tileId) => tileId !== id)
      : [...current, id]);
  }

  function verify() {
    if (resolved.current) return;
    const correct = selected.length === question.answer.length
      && question.answer.every((id) => selected.includes(id));

    if (correct) {
      resolved.current = true;
      setPassed(true);
      setFeedback(`Verified human-ish! ${question.explanation}`);
      onPass?.();
      return;
    }

    setFeedback(`Incorrect, according to our very qualified robot. ${question.explanation} New grid below; try again.`);
    setQuestion(nextQuestion(question.id));
    setSelected([]);
    bumpFrustration(5);
    onFail?.();
  }

  return (
    <section className="captcha" aria-labelledby={headingId}>
      <header className="captcha__header">
        <p className="captcha__eyebrow">Human verification (allegedly)</p>
        <h3 id={headingId}>{passed ? "Cleared for takeoff. Probably." : question.prompt}</h3>
        <p id={hintId}>{passed ? "Your humanity has been accepted on a trial basis." : question.hint}</p>
      </header>

      <p className={`captcha__feedback${passed ? " captcha__feedback--success" : ""}`} role="status" aria-live="polite" aria-atomic="true">
        {feedback}
      </p>

      {!passed && (
        <>
          <div className="captcha__grid" role="group" aria-label="Select matching squares" aria-describedby={hintId}>
            {question.tiles.map((tile) => (
              <button
                key={`${question.id}-${tile.id}`}
                type="button"
                className="captcha__tile"
                aria-pressed={selected.includes(tile.id)}
                onClick={() => toggleTile(tile.id)}
              >
                <span className="captcha__emoji" aria-hidden="true">{tile.emoji}</span>
                <span className="captcha__caption">{tile.label}</span>
                {selected.includes(tile.id) && <span className="captcha__check" aria-hidden="true">✓</span>}
              </button>
            ))}
          </div>
          <div className="captcha__actions">
            <span>{selected.length} selected · select all that apply</span>
            <button type="button" className="btn go" onClick={verify}>Verify</button>
          </div>
        </>
      )}
      <p className="captcha__disclaimer">Demo CAPTCHA · no actual robots were detected.</p>
    </section>
  );
}
