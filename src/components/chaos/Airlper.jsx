// OWNER: DAR — "Ye Olde Airlper", the stage-aware peeking helper.
import { useEffect, useRef, useState } from "react";
import JoseMariChan from "../../assets/images/Jose-Mari-Chan.png";
import useBooking from "../../context/useBooking.js";
import { getAirlperLines, getForgetfulAirlperQuestion } from "./airlperLines.js";
import "./Airlper.css";

const PEEK_POSITIONS = [
  { name: "left-top", side: "left", vertical: "top" },
  { name: "right-middle", side: "right", vertical: "middle" },
  { name: "left-bottom", side: "left", vertical: "bottom" },
  { name: "right-top", side: "right", vertical: "top" },
  { name: "left-middle", side: "left", vertical: "middle" },
  { name: "right-bottom", side: "right", vertical: "bottom" },
];

function chooseDifferentIndex(length, currentIndex) {
  if (length < 2) return 0;
  if (currentIndex < 0 || currentIndex >= length) return Math.floor(Math.random() * length);

  const nextIndex = Math.floor(Math.random() * (length - 1));
  return nextIndex >= currentIndex ? nextIndex + 1 : nextIndex;
}

function getNextPositionIndex(currentIndex) {
  return (currentIndex + 1) % PEEK_POSITIONS.length;
}

export default function Airlper() {
  const { stage, booking } = useBooking();
  const stageLines = getAirlperLines(stage);
  const [answerDraft, setAnswerDraft] = useState("");
  const [chat, setChat] = useState({ phase: "asking", hasForgotten: false, lastAnswer: "" });
  const forgetTimerRef = useRef(null);
  const [ticker, setTicker] = useState(() => ({
    stage,
    lineIndex: 0,
    positionIndex: Math.floor(Math.random() * PEEK_POSITIONS.length),
  }));

  useEffect(() => () => window.clearTimeout(forgetTimerRef.current), []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setTicker((current) => {
        const currentLineIndex = current.stage === stage ? current.lineIndex : 0;

        return {
          stage,
          lineIndex: chooseDifferentIndex(stageLines.length, currentLineIndex),
          positionIndex: getNextPositionIndex(current.positionIndex),
        };
      });
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [stage, stageLines]);

  const position = PEEK_POSITIONS[ticker.positionIndex] ?? PEEK_POSITIONS[0];
  const lineIndex = ticker.stage === stage ? ticker.lineIndex : 0;
  const line = stageLines[lineIndex] ?? stageLines[0];
  const chatPrompt = chat.phase === "thanking"
    ? `Thank thee, ${chat.lastAnswer}! I shall remember it forevermore.`
    : chat.hasForgotten
      ? getForgetfulAirlperQuestion(booking, chat.lastAnswer)
      : "Prithee, what is thy name?";

  function submitAnswer(event) {
    event.preventDefault();
    const answer = answerDraft.trim();
    if (!answer) return;

    window.clearTimeout(forgetTimerRef.current);
    setChat((current) => ({ ...current, phase: "thanking", lastAnswer: answer }));
    setAnswerDraft("");
    forgetTimerRef.current = window.setTimeout(() => {
      setChat((current) => ({ ...current, phase: "asking", hasForgotten: true }));
    }, 3500);
  }

  // Flip horizontally when on the right side so the face looks left into the screen;
  // invert vertically when at the top so the cut torso sits flush against the top edge.
  const scaleX = position.side === "right" ? -1 : 1;
  const scaleY = position.vertical === "top" ? -1 : 1;

  return (
    <aside
      className={`airlper airlper--${position.side} airlper--${position.vertical}`}
      data-position={position.name}
      aria-label="Airlper flight helper"
      style={{
        "--airlper-scale-x": scaleX,
        "--airlper-scale-y": scaleY,
      }}
    >
      <img className="airlper__face" src={JoseMariChan} alt="Jose Mari Chan" decoding="async" />

      <div className="airlper__speech" id="airlper-message">
        <div className="airlper__speech-heading">
          <span>Ye Olde Airlper · Stage {stage} of 12</span>
        </div>
        <p className="airlper__message" role="status" aria-live="polite" aria-atomic="true">
          {line}
        </p>
        <div className="airlper__chat">
          <p className="airlper__chat-prompt" role="status" aria-live="polite" aria-atomic="true">
            {chatPrompt}
          </p>
          {chat.phase === "asking" && (
            <form className="airlper__chat-form" onSubmit={submitAnswer}>
              <input
                type="text"
                value={answerDraft}
                maxLength={80}
                autoComplete="off"
                aria-label="Answer Airlper"
                placeholder="Type thy answer"
                onChange={(event) => setAnswerDraft(event.target.value)}
              />
              <button className="btn airlper__submit" type="submit" disabled={!answerDraft.trim()}>
                Tell him
              </button>
            </form>
          )}
        </div>
      </div>
    </aside>
  );
}
