// Random Eminem flashbang -> blinding whiteout + fading flashed cat overlay.
import { useCallback, useEffect, useRef, useState } from "react";
import useBooking from "../../context/useBooking.js";
import eminemImg from "../../assets/images/emenim flashbang.jpg";
import flashedCatImg from "../../assets/images/flashed cat.jpg";
import flashbangSfx from "../../assets/audios/sfx/Flashbang Sfx.mp3";
import "./Flashbang.css";

const THROW_DURATION_MS = 650;
const BLIND_DURATION_MS = 5150;

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

export default function Flashbang({ muted = false }) {
  const { stage, demoMode, bumpFrustration } = useBooking() ?? {};
  // "idle" | "throw" | "blind"
  const [phase, setPhase] = useState("idle");
  const audioRef = useRef(null);
  const timersRef = useRef([]);
  const mutedRef = useRef(muted);

  function clearAllTimers() {
    for (const id of timersRef.current) {
      window.clearTimeout(id);
    }
    timersRef.current = [];
  }

  function stopAudio() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }

  useEffect(() => {
    mutedRef.current = muted;
    if (muted) stopAudio();
  }, [muted]);

  const dismiss = useCallback(() => {
    clearAllTimers();
    stopAudio();
    setPhase("idle");
  }, []);

  useEffect(() => {
    // Don't interrupt Stage 1 Shea video ad or stack while already active
    if (stage === 1 || phase !== "idle") return undefined;

    const waitMs = demoMode ? randomBetween(14000, 26000) : randomBetween(35000, 75000);
    const triggerTimer = window.setTimeout(() => {
      setPhase("throw");
      bumpFrustration?.(4);

      if (!mutedRef.current) {
        try {
          stopAudio();
          const audio = new Audio(flashbangSfx);
          audio.volume = 0.85;
          audioRef.current = audio;
          audio.play().catch(() => {});
        } catch {
          // Ignore autoplay/headless audio errors
        }
      }

      const blindTimer = window.setTimeout(() => {
        setPhase("blind");

        const endTimer = window.setTimeout(() => {
          stopAudio();
          setPhase("idle");
        }, BLIND_DURATION_MS);
        timersRef.current.push(endTimer);
      }, THROW_DURATION_MS);

      timersRef.current.push(blindTimer);
    }, waitMs);

    timersRef.current.push(triggerTimer);

    return () => {
      clearAllTimers();
    };
  }, [stage, demoMode, phase, bumpFrustration]);

  useEffect(() => () => {
    clearAllTimers();
    stopAudio();
  }, []);

  if (phase === "idle") return null;

  return (
    <div
      className={`flashbang flashbang--${phase}`}
      role="alert"
      aria-live="assertive"
      aria-label="Flashbang!"
    >
      {phase === "throw" && (
        <div className="flashbang__throw-wrap">
          <img src={eminemImg} alt="Eminem throwing a flashbang" className="flashbang__eminem" />
        </div>
      )}

      {phase === "blind" && (
        <div className="flashbang__blind-wrap">
          <div className="flashbang__whiteout" />
          <img src={flashedCatImg} alt="Blinded cat" className="flashbang__cat" />
        </div>
      )}

      <button type="button" className="btn warn flashbang__skip" onClick={dismiss}>
        Skip Flash
      </button>
    </div>
  );
}
