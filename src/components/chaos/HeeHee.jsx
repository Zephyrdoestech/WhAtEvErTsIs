// OWNER: DAR — random "hee-hee!" sound cue about once a minute (or ~20s in demoMode) + brief page shake.
import { useEffect, useRef, useState } from "react";
// One 0.85s "hee-hee" cut from "Occasional MJ Hehe.mp3" (a 1-hour, 14.7 MB track that is mostly silence).
import heeHeeSound from "../../assets/audios/hee-hee.m4a";
import useBooking from "../../context/useBooking.js";

function getNextDelayMs(demoMode) {
  if (demoMode) {
    // ~16-22s in demoMode (around 20s)
    return 16000 + Math.floor(Math.random() * 6000);
  }
  // 45-90s in normal mode
  return 45000 + Math.floor(Math.random() * 45000);
}

export default function HeeHee({ muted = false }) {
  const { stage, demoMode, bumpFrustration } = useBooking();
  const [shaking, setShaking] = useState(false);
  const audioRef = useRef(null);
  const mutedRef = useRef(muted);
  const bumpRef = useRef(bumpFrustration);

  useEffect(() => {
    mutedRef.current = muted;
    if (muted && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [muted]);

  useEffect(() => {
    bumpRef.current = bumpFrustration;
  }, [bumpFrustration]);

  useEffect(() => {
    // Skip Stage 1 so it doesn't talk over the Shea ad (same as KA-CHOW and the flashbang).
    if (stage === 1) return undefined;
    let triggerTimerId = null;
    let shakeTimerId = null;

    function scheduleNext() {
      const delay = getNextDelayMs(demoMode);
      triggerTimerId = window.setTimeout(() => {
        setShaking(true);
        document.body.classList.add("chaos-page-shake");
        bumpRef.current?.(2);

        if (!mutedRef.current && audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(() => {
            // Autoplay may be blocked before user interaction; fail silently.
          });
        }

        window.clearTimeout(shakeTimerId);
        shakeTimerId = window.setTimeout(() => {
          document.body.classList.remove("chaos-page-shake");
          setShaking(false);
        }, 700);

        scheduleNext();
      }, delay);
    }

    scheduleNext();

    return () => {
      window.clearTimeout(triggerTimerId);
      window.clearTimeout(shakeTimerId);
      document.body.classList.remove("chaos-page-shake");
    };
  }, [demoMode, stage]);

  return (
    <>
      <audio ref={audioRef} src={heeHeeSound} preload="auto" muted={muted} />
      {shaking && (
        <div className="heehee-toast" role="status" aria-live="polite">
          🎶 HEE-HEE!
        </div>
      )}
    </>
  );
}
