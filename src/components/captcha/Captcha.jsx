// OWNER: SYOS — see SYOS.MD. Used by Stage 02 (SYOS), Stage 07 (SYOS), Stage 10 (DIN).
// Contract (do not change without telling DIN):
//   <Captcha onPass={() => {}} onFail={() => {}} chain={1} />
//   chain = how many CAPTCHAs in a row before onPass fires (default 1).
import { useId, useRef, useState } from "react";
import useBooking from "../../context/useBooking.js";
import { nextQuestion } from "./questions.js";
import "./Captcha.css";

export default function Captcha({ onPass, onFail, chain = 1 }) {
  // One mounted component is one verification session; remount to change its target.
  const [target] = useState(() => Number.isFinite(chain) ? Math.max(1, Math.floor(chain)) : 1);
  const { bumpFrustration } = useBooking();
  const headingId = useId();
  const hintId = useId();
  const inputId = useId();
  const [question, setQuestion] = useState(() => nextQuestion());
  const [selected, setSelected] = useState([]);
  const [input, setInput] = useState("");
  const [completed, setCompleted] = useState(0);
  const [usedTypes, setUsedTypes] = useState([]);
  const [robotRejected, setRobotRejected] = useState(false);
  const [revision, setRevision] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [passed, setPassed] = useState(false);
  const resolved = useRef(false);
  const submittedRevision = useRef(-1);

  function toggleTile(id) {
    if (resolved.current) return;
    setSelected((current) => current.includes(id)
      ? current.filter((tileId) => tileId !== id)
      : [...current, id]);
  }

  function verify(answer = input) {
    if (resolved.current || submittedRevision.current === revision) return;
    submittedRevision.current = revision;
    setRevision((value) => value + 1);
    const correct = question.type === "grid"
      ? selected.length === question.answer.length && question.answer.every((id) => selected.includes(id))
      : question.type === "robot"
        ? robotRejected && answer === question.answer
        : answer.trim().toLowerCase() === question.answer.toLowerCase();

    if (correct) {
      const count = completed + 1;
      setCompleted(count);
      if (count >= target) {
        resolved.current = true;
        setPassed(true);
        setFeedback(`Verified human-ish! ${question.explanation}`);
        onPass?.();
      } else {
        const types = [...usedTypes, question.type];
        setQuestion(nextQuestion(question.id, types));
        setUsedTypes(new Set(types).size === 4 ? [] : types);
        setSelected([]);
        setInput("");
        setRobotRejected(false);
        setFeedback("Great! Now verify you verified.");
      }
      return;
    }

    const resetMessage = completed > 0 ? " Your verification streak has been reset." : "";
    if (question.type === "robot") {
      setRobotRejected(true);
      setFeedback(`Rejected! ${robotRejected ? "Humans should answer No." : "The first answer is always wrong. Try No this time."}${resetMessage}`);
    } else {
      setFeedback(`Incorrect, according to our very qualified robot. ${question.explanation} New challenge below; try again.${resetMessage}`);
      setQuestion(nextQuestion(question.id));
      setRobotRejected(false);
    }
    setCompleted(0);
    setUsedTypes([]);
    setSelected([]);
    setInput("");
    bumpFrustration(5);
    onFail?.();
  }

  return (
    <section className="captcha" aria-labelledby={headingId}>
      <header className="captcha__header">
        <p className="captcha__eyebrow">Human verification (allegedly)</p>
        <p className="captcha__progress" aria-live="polite" aria-atomic="true">{completed} of {target} verified</p>
        <h3 id={headingId}>{passed ? "Cleared for takeoff. Probably." : question.prompt}</h3>
        <p id={hintId}>{passed ? "Your humanity has been accepted on a trial basis." : question.hint}</p>
      </header>

      <p className={`captcha__feedback${passed ? " captcha__feedback--success" : ""}`} role="status" aria-live="polite" aria-atomic="true">
        {feedback}
      </p>

      {!passed && (
        <>
          {question.type === "grid" && <div className="captcha__grid" role="group" aria-label="Select matching squares" aria-describedby={hintId}>
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
          </div>}
          {question.type === "math" && (
            <div className="captcha__options" role="group" aria-labelledby={headingId} aria-describedby={hintId}>
              {question.options.map((option) => <button key={option} type="button" className="btn" onClick={() => verify(option)}>{option}</button>)}
            </div>
          )}
          {question.type === "text" && (
            <div className="captcha__typing">
              <div className="captcha__code" aria-label={`Boarding code: ${question.code}`}>
                {Array.from(question.code).map((letter, index) => <span key={index} aria-hidden="true" style={{ animationDelay: `${index * -0.2}s` }}>{letter}</span>)}
              </div>
              <label htmlFor={inputId}>Boarding code</label>
              <input id={inputId} value={input} onChange={(event) => setInput(event.target.value)} aria-describedby={hintId} autoComplete="off" spellCheck={false} maxLength={40} onKeyDown={(event) => {
                if (event.key === "Enter") { event.preventDefault(); event.stopPropagation(); verify(); }
              }} />
            </div>
          )}
          {question.type === "robot" && (
            <div className="captcha__options" role="group" aria-labelledby={headingId} aria-describedby={hintId}>
              {["Yes", "No"].map((answer) => <button key={answer} type="button" className="btn" onClick={() => verify(answer)}>{answer}</button>)}
            </div>
          )}
          {(question.type === "grid" || question.type === "text") &&
          <div className="captcha__actions">
            <span>{question.type === "grid" ? `${selected.length} selected · select all that apply` : "Type it like you mean it."}</span>
            <button type="button" className="btn go" onClick={() => verify()}>Verify</button>
          </div>}
        </>
      )}
      <p className="captcha__disclaimer">Demo CAPTCHA · no actual robots were detected.</p>
    </section>
  );
}
