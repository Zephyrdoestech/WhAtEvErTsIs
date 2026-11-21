// OWNER: DAR — surprise ad popup with an annoying close button.
// Contract: <AdPopup open={bool} onClose={() => {}} />
import { useState } from "react";
import useBooking from "../../context/useBooking.js";

const PRIMARY_ADS = [
  {
    badge: "SPONSORED BY BAKERY 404",
    headline: "HOT PANDESAL IN YOUR AREA!",
    art: "🥖🔥🧈",
    copy: "Fresh out of the pugon 0.2 km from your seat row! Single warm pandesals are waiting to be dipped in coffee RIGHT NOW!",
    cta: "CLAIM WARM PANDESAL →",
    fine: "*Clicking anywhere near this bread may summon additional bakery promotions.",
  },
  {
    badge: "LOCAL SEAT ROW ALERT",
    headline: "HOT PANDESAL IN YOUR AREA!",
    art: "🥐☕🧀",
    copy: "3 Lonely Kesong Puti Pandesals in Row 14B want to share your tray table! No minimum crumbs required!",
    cta: "MEET LOCAL PANDESAL →",
    fine: "*Pandesal availability subject to cabin pressure and pilot hunger.",
  },
];

const SECOND_AD = {
  badge: "POP-UNDER BONUS AD (2 OF 2)",
  headline: "EVEN HOTTER PANDESAL UNLOCKED!",
  art: "🍞🚨🔥",
  copy: "You tried to close the first pandesal, so we upgraded you to EXTRA TOASTY PANDESAL VIP! Don't leave these carbs hanging!",
  cta: "DOUBLE THE CRUMBS!",
  fine: "*Okay fine, click the tiny ✕ one more time to actually escape.",
};

export default function AdPopup({ open, onClose }) {
  const { bumpFrustration } = useBooking() ?? {};
  const [adVariantIndex, setAdVariantIndex] = useState(0);
  const [closeDodged, setCloseDodged] = useState(false);
  const [showingSecondAd, setShowingSecondAd] = useState(false);

  if (!open) {
    return null;
  }

  const currentAd = showingSecondAd
    ? SECOND_AD
    : PRIMARY_ADS[adVariantIndex] ?? PRIMARY_ADS[0];

  function handleCloseHover() {
    if (!closeDodged) {
      setCloseDodged(true);
      bumpFrustration?.(2);
    }
  }

  function handleCloseTouchStart(event) {
    if (!closeDodged) {
      event.preventDefault();
      handleCloseHover();
    }
  }

  function spawnSecondAd() {
    setShowingSecondAd(true);
    setCloseDodged(false);
    bumpFrustration?.(3);
  }

  function handleCloseClick() {
    // Sometimes (60% chance) closing the first ad opens a second ad!
    if (!showingSecondAd && Math.random() < 0.6) {
      spawnSecondAd();
      return;
    }

    setShowingSecondAd(false);
    setCloseDodged(false);
    setAdVariantIndex((current) => (current + 1) % PRIMARY_ADS.length);
    onClose?.();
  }

  function handleCtaClick() {
    if (!showingSecondAd) {
      spawnSecondAd();
    } else {
      bumpFrustration?.(2);
    }
  }

  return (
    <aside
      className={`ad-popup ${showingSecondAd ? "ad-popup--secondary" : "ad-popup--primary"}`}
      role="dialog"
      aria-label={currentAd.headline}
    >
      <div className="ad-popup__bar">
        <span className="ad-popup__tag">
          {showingSecondAd ? "⚡ DOUBLE AD COMBO" : "📢 BAHALA NA ADS"}
        </span>
        <button
          type="button"
          className={`ad-popup__close ${closeDodged ? "ad-popup__close--dodged" : ""}`}
          aria-label="Close advertisement"
          onMouseEnter={handleCloseHover}
          onTouchStart={handleCloseTouchStart}
          onClick={handleCloseClick}
        >
          ✕
        </button>
      </div>

      <div className="ad-popup__body">
        <span className="ad-popup__badge">{currentAd.badge}</span>
        <h3 className="ad-popup__headline">{currentAd.headline}</h3>
        <div className="ad-popup__art" aria-hidden="true">
          {currentAd.art}
        </div>
        <p className="ad-popup__copy">{currentAd.copy}</p>
        <button
          type="button"
          className="ad-popup__cta"
          onClick={handleCtaClick}
        >
          {currentAd.cta}
        </button>
        <p className="ad-popup__fine">{currentAd.fine}</p>
      </div>
    </aside>
  );
}
