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
  const dialogRef = useRef(null);
  const soundRef = useRef(null);

  // showModal() keeps Tab inside the ad and makes the page behind it inert.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog.open) dialog.showModal();
    dialog.querySelector(".shea-ad-skip")?.focus(); // showModal() focuses the first button; start on Skip instead
    return () => dialog.close();
  }, []);

  useEffect(() => {
    let s = 0;
    const id = setInterval(() => {
      s += 1;
      if (s === SKIP_WINDOW && s < cap) {
        bumpFrustration(10); // missed the Skip window
        soundRef.current?.focus(); // Skip is about to vanish; don't strand keyboard focus
      }
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
    <dialog ref={dialogRef} className="shea-ad" aria-label="Advertisement" onCancel={(e) => e.preventDefault()}>
      <p className="shea-ad-title">ADVERTISEMENT - you may skip... eventually</p>
      <div className="shea-ad-video">
        <video ref={videoRef} src={sheaVideo} autoPlay muted loop playsInline />
        <button ref={soundRef} className="btn warn shea-ad-sound" onClick={toggleSound}>
          {muted ? "🔊 Tap for sound" : "🔇 Mute"}
        </button>
      </div>
      <div className="shea-ad-bar">
        <span aria-live="polite">Ad ends in 0:{String(left).padStart(2, "0")}...</span>
        {seconds < SKIP_WINDOW && (
          <button className="btn shea-ad-skip" onClick={onDone} autoFocus>
            Skip Ad › <small>(exists for the first 5 seconds only)</small>
          </button>
        )}
      </div>
    </dialog>
  );
}
