// OWNER: KYLE — Stage 01 pre-roll ad. Skip exists for the first 5 seconds only, then you watch until the cap.
import { useEffect, useRef, useState } from "react";
import useBooking from "../../context/useBooking.js";
import sheaVideo from "../../assets/videos/shea_closer.mp4";

const SKIP_WINDOW = 5;

export default function SheaAd({ onDone }) {
  const { demoMode, bumpFrustration } = useBooking();
  const cap = demoMode ? 5 : 20;
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    let s = 0;
    const id = setInterval(() => {
      s += 1;
      if (s === SKIP_WINDOW && s < cap) bumpFrustration(10); // missed the Skip window
      if (s >= cap) {
        clearInterval(id);
        onDone();
      } else {
        setSeconds(s);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [cap, bumpFrustration, onDone]);

  // Browsers block autoplay with sound, so it starts muted and the user opts in.
  function toggleSound() {
    const video = videoRef.current;
    video.muted = !muted;
    video.play().catch(() => {});
    setMuted(!muted);
  }

  const left = cap - seconds;

  return (
    <div className="shea-ad-backdrop">
      <div className="shea-ad" role="dialog" aria-modal="true" aria-label="Advertisement">
        <p className="shea-ad-title">ADVERTISEMENT - you may skip... eventually</p>
        <div className="shea-ad-video">
          <video ref={videoRef} src={sheaVideo} autoPlay muted loop playsInline />
          <button className="btn warn shea-ad-sound" onClick={toggleSound}>
            {muted ? "🔊 Tap for sound" : "🔇 Mute"}
          </button>
        </div>
        <div className="shea-ad-bar">
          <span aria-live="polite">Ad ends in 0:{String(left).padStart(2, "0")}...</span>
          {seconds < SKIP_WINDOW && (
            <button className="btn shea-ad-skip" onClick={onDone}>
              Skip Ad › <small>(exists for the first 5 seconds only)</small>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
