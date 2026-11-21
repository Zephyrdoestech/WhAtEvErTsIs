// OWNER: RICKS — see RICKS.MD (Task 4).
// Non-blocking ambient Lightning McQueen drive-by: crosses the full screen from left or right
// at varying intervals and plays kachow.mp3 each time.
import { useEffect, useRef, useState } from "react";
import useBooking from "../../context/useBooking.js";
import lightningImg from "../../assets/images/Lightning-McQueen.png";
import kachowSound from "../../assets/audios/kachow.mp3";
import "./KachowTransition.css";

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

export default function KachowTransition({ muted = false }) {
  const { demoMode } = useBooking();
  const [run, setRun] = useState(null);
  const runIdRef = useRef(0);
  const audioRef = useRef(null);
  const mutedRef = useRef(muted);

  useEffect(() => {
    mutedRef.current = muted;
    if (muted && audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, [muted]);

  useEffect(() => {
    let waitTimer = null;
    let clearTimer = null;
    let cancelled = false;

    function playKachowAudio() {
      if (mutedRef.current) return;
      try {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        const audio = new Audio(kachowSound);
        audio.volume = 0.9;
        audioRef.current = audio;
        audio.play().catch(() => {});
      } catch {
        // Ignore browser autoplay or headless audio errors
      }
    }

    function scheduleNextRun(isFirst) {
      const delayMs = isFirst
        ? demoMode
          ? randomBetween(1000, 2200)
          : randomBetween(1500, 3500)
        : demoMode
          ? randomBetween(3000, 7000)
          : randomBetween(5000, 14000);

      waitTimer = window.setTimeout(() => {
        if (cancelled) return;

        const direction = Math.random() < 0.5 ? "ltr" : "rtl";
        const durationMs = Math.round(randomBetween(1250, 1750));
        const topVh = Math.round(randomBetween(14, 72));
        runIdRef.current += 1;

        setRun({
          id: runIdRef.current,
          direction,
          durationMs,
          topVh,
        });
        playKachowAudio();

        clearTimer = window.setTimeout(() => {
          if (cancelled) return;
          setRun(null);
          scheduleNextRun(false);
        }, durationMs + 120);
      }, delayMs);
    }

    scheduleNextRun(true);

    return () => {
      cancelled = true;
      if (waitTimer) window.clearTimeout(waitTimer);
      if (clearTimer) window.clearTimeout(clearTimer);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [demoMode]);

  if (!run) return null;

  return (
    <div className="kachow-layer" aria-hidden="true">
      <div
        key={run.id}
        className={`kachow-runner kachow-runner--${run.direction}`}
        style={{
          "--kachow-top": `${run.topVh}vh`,
          "--kachow-dur": `${run.durationMs}ms`,
        }}
      >
        <div className="kachow-runner__trail" />
        <img src={lightningImg} alt="" className="kachow-runner__car" />
        <span className="kachow-runner__callout display">KA-CHOW!</span>
      </div>
    </div>
  );
}
