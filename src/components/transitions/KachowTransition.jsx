// OWNER: RICKS — see RICKS.MD. Used after agreeing in Stage 09.
// Contract: <KachowTransition onDone={next} />
import { useCallback, useEffect, useRef } from "react";
import lightningImg from "../../assets/images/Lightning-McQueen.png";
import kachowSound from "../../assets/audios/kachow.mp3";
import "./KachowTransition.css";

const DURATION_MS = 1500;

const SPEED_LINES = [
  { y: "14%", w: "42vw", h: "5px", dur: "0.55s", delay: "0s" },
  { y: "26%", w: "58vw", h: "8px", dur: "0.48s", delay: "0.08s" },
  { y: "39%", w: "36vw", h: "4px", dur: "0.6s", delay: "0.14s" },
  { y: "52%", w: "64vw", h: "10px", dur: "0.44s", delay: "0.04s" },
  { y: "66%", w: "48vw", h: "6px", dur: "0.52s", delay: "0.12s" },
  { y: "78%", w: "54vw", h: "7px", dur: "0.5s", delay: "0.06s" },
  { y: "88%", w: "38vw", h: "5px", dur: "0.58s", delay: "0.16s" },
];

export default function KachowTransition({ onDone, muted = false }) {
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
        const audio = new Audio(kachowSound);
        audio.volume = 0.9;
        audioRef.current = audio;
        audio.play().catch(() => {});
      } catch {
        // Ignore autoplay or headless audio errors
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
    <div className="kachow-transition" role="status" aria-live="polite" aria-label="Ka-chow!">
      <div className="kachow-transition__lines" aria-hidden="true">
        {SPEED_LINES.map((line, index) => (
          <span
            key={`line-${index}`}
            className="kachow-transition__line"
            style={{
              "--line-y": line.y,
              "--line-w": line.w,
              "--line-h": line.h,
              "--line-dur": line.dur,
              "--line-delay": line.delay,
            }}
          />
        ))}
      </div>

      <div className="kachow-transition__trail" aria-hidden="true" />
      <img
        src={lightningImg}
        alt=""
        aria-hidden="true"
        className="kachow-transition__car"
      />

      <div className="kachow-transition__text-wrap">
        <p className="kachow-transition__text">⚡ KA-CHOW! ⚡</p>
        <span className="kachow-transition__gleam" aria-hidden="true">
          ✨
        </span>
      </div>

      <button type="button" className="kachow-transition__skip" onClick={finish}>
        Skip
      </button>
    </div>
  );
}
