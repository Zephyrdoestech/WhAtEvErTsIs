// OWNER: DAR — an image that slowly fades in over the screen.
// Contract: <SlowImage src={img} duration={30000} maxOpacity={0.6} />
import { useEffect, useRef, useState } from "react";
import courtJester from "../../assets/images/court-jester-dancing.png";
import dogAcceptingFate from "../../assets/images/dog-accepting-fate-meme-hero.jpg";
import eminemFlashbang from "../../assets/images/emenim flashbang.jpg";
import flashedCat from "../../assets/images/flashed cat.jpg";
import lightningMcQueen from "../../assets/images/Lightning-McQueen.png";
import useBooking from "../../context/useBooking.js";

const SLOW_IMAGE_POOL = [
  courtJester,
  dogAcceptingFate,
  eminemFlashbang,
  flashedCat,
  lightningMcQueen,
];

const POSITIONS = [
  "slow-image--bottom-right",
  "slow-image--center",
  "slow-image--top-left",
  "slow-image--bottom-left",
];

function pickNextPoolIndex(currentIndex) {
  if (SLOW_IMAGE_POOL.length <= 1) return 0;
  const candidate = Math.floor(Math.random() * (SLOW_IMAGE_POOL.length - 1));
  return candidate >= currentIndex ? candidate + 1 : candidate;
}

export default function SlowImage({ src, duration = 30000, maxOpacity = 0.6 }) {
  const { demoMode } = useBooking() ?? {};
  const [poolIndex, setPoolIndex] = useState(0); // Starts with court-jester-dancing.png
  const [positionIndex, setPositionIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [fadingIn, setFadingIn] = useState(false);
  const respawnTimerRef = useRef(null);

  const activeSrc = src || SLOW_IMAGE_POOL[poolIndex] || courtJester;
  const safeDuration = Math.max(500, Number(duration) || 30000);
  const safeMaxOpacity = Math.min(1, Math.max(0.05, Number(maxOpacity) || 0.6));

  useEffect(() => {
    if (dismissed) return undefined;

    let innerRafId = 0;
    const outerRafId = window.requestAnimationFrame(() => {
      innerRafId = window.requestAnimationFrame(() => {
        setFadingIn(true);
      });
    });

    return () => {
      window.cancelAnimationFrame(outerRafId);
      window.cancelAnimationFrame(innerRafId);
    };
  }, [dismissed, activeSrc]);

  useEffect(() => () => window.clearTimeout(respawnTimerRef.current), []);

  function handleDismiss() {
    window.clearTimeout(respawnTimerRef.current);
    setFadingIn(false);
    setDismissed(true);

    const respawnDelay = demoMode ? 4000 : 9000;
    respawnTimerRef.current = window.setTimeout(() => {
      setPoolIndex((current) => pickNextPoolIndex(current));
      setPositionIndex((current) => (current + 1) % POSITIONS.length);
      setDismissed(false);
    }, respawnDelay);
  }

  if (dismissed) {
    return null;
  }

  const positionClass = POSITIONS[positionIndex] ?? POSITIONS[0];

  return (
    <button
      type="button"
      className={`slow-image ${positionClass}`}
      onClick={handleDismiss}
      aria-label="Dismiss creeping image overlay"
      title="Click to shoo away (for now)"
      style={{
        opacity: fadingIn ? safeMaxOpacity : 0,
        transition: fadingIn ? `opacity ${safeDuration}ms linear` : "none",
      }}
    >
      <img className="slow-image__img" src={activeSrc} alt="" />
      <span className="slow-image__hint" aria-hidden="true">
        Click to shoo
      </span>
    </button>
  );
}
