// OWNER: RICKS — see RICKS.MD. Used after Stage 05 select.
// Contract: render it, it plays, then calls onDone(). <FireTransition onDone={next} />
import { useCallback, useEffect, useRef } from "react";
import fireWhooshSound from "../../assets/audios/fire.mp3";
import "./FireTransition.css";

const DURATION_MS = 1500;

const FLAMES = [
  { x: "-4%", size: "6.5rem", scale: 1.15, rot: "-10deg", drift: "18px", dur: "1.25s", delay: "0s" },
  { x: "8%", size: "8rem", scale: 1.2, rot: "8deg", drift: "-20px", dur: "1.35s", delay: "0.04s" },
  { x: "20%", size: "7rem", scale: 1.05, rot: "-6deg", drift: "24px", dur: "1.2s", delay: "0.08s" },
  { x: "32%", size: "9rem", scale: 1.25, rot: "12deg", drift: "-16px", dur: "1.38s", delay: "0.02s" },
  { x: "44%", size: "8.5rem", scale: 1.15, rot: "-9deg", drift: "12px", dur: "1.28s", delay: "0.06s" },
  { x: "56%", size: "9.5rem", scale: 1.3, rot: "7deg", drift: "-24px", dur: "1.4s", delay: "0.01s" },
  { x: "68%", size: "7.5rem", scale: 1.1, rot: "-11deg", drift: "20px", dur: "1.22s", delay: "0.09s" },
  { x: "80%", size: "8.5rem", scale: 1.2, rot: "9deg", drift: "-18px", dur: "1.32s", delay: "0.03s" },
  { x: "90%", size: "7rem", scale: 1.1, rot: "-7deg", drift: "-14px", dur: "1.26s", delay: "0.07s" },
  { x: "14%", size: "6rem", scale: 0.95, rot: "14deg", drift: "28px", dur: "1.15s", delay: "0.18s" },
  { x: "38%", size: "6.5rem", scale: 1, rot: "-14deg", drift: "-28px", dur: "1.18s", delay: "0.15s" },
  { x: "62%", size: "6.8rem", scale: 1.05, rot: "11deg", drift: "22px", dur: "1.12s", delay: "0.2s" },
  { x: "84%", size: "6rem", scale: 0.95, rot: "-12deg", drift: "-22px", dur: "1.16s", delay: "0.17s" },
];

const EMBERS = [
  { x: "10%", size: "7px", drift: "30px", dur: "1.1s", delay: "0.05s" },
  { x: "24%", size: "10px", drift: "-26px", dur: "1.25s", delay: "0.12s" },
  { x: "36%", size: "6px", drift: "40px", dur: "1.05s", delay: "0.02s" },
  { x: "50%", size: "9px", drift: "-32px", dur: "1.3s", delay: "0.08s" },
  { x: "64%", size: "8px", drift: "34px", dur: "1.15s", delay: "0.15s" },
  { x: "78%", size: "11px", drift: "-28px", dur: "1.22s", delay: "0.04s" },
  { x: "92%", size: "7px", drift: "-36px", dur: "1.08s", delay: "0.1s" },
];

export default function FireTransition({ onDone, muted = false }) {
  const doneRef = useRef(false);
  const onDoneRef = useRef(onDone);
  const audioRef = useRef(null);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    onDoneRef.current?.();
  }, []);

  useEffect(() => {
    if (!muted) {
      try {
        const audio = new Audio(fireWhooshSound);
        audio.volume = 0.9;
        audioRef.current = audio;
        audio.play().catch(() => {});
      } catch {
        // Ignore audio errors in headless/muted environments
      }
    }

    const timer = window.setTimeout(finish, DURATION_MS);
    return () => {
      window.clearTimeout(timer);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [finish, muted]);

  return (
    <div className="fire-transition" role="status" aria-live="polite" aria-label="Transitioning">
      <div className="fire-transition__wall" />
      <div className="fire-transition__flames" aria-hidden="true">
        {FLAMES.map((flame, index) => (
          <span
            key={`flame-${index}`}
            className="fire-transition__flame"
            style={{
              "--flame-x": flame.x,
              "--flame-size": flame.size,
              "--flame-scale": flame.scale,
              "--flame-rot": flame.rot,
              "--flame-drift": flame.drift,
              "--flame-dur": flame.dur,
              "--flame-delay": flame.delay,
            }}
          >
            🔥
          </span>
        ))}
        {EMBERS.map((ember, index) => (
          <span
            key={`ember-${index}`}
            className="fire-transition__ember"
            style={{
              "--ember-x": ember.x,
              "--ember-size": ember.size,
              "--ember-drift": ember.drift,
              "--ember-dur": ember.dur,
              "--ember-delay": ember.delay,
            }}
          />
        ))}
      </div>
      <button type="button" className="fire-transition__skip" onClick={finish}>
        Skip
      </button>
    </div>
  );
}
