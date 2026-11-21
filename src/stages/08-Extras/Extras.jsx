// OWNER: DAR — see DAR.MD (Stage 08: Add Extras + Guilt Trips)
import { useEffect, useMemo, useState } from "react";
import AdPopup from "../../components/chaos/AdPopup.jsx";
import useBooking from "../../context/useBooking.js";
import "./Extras.css";

const EXTRAS_CATALOG = [
  {
    id: "checked-baggage",
    label: "Checked Baggage",
    price: 850,
    icon: "🧳",
    tag: "CARGO ROULETTE",
    description:
      "Up to 20kg of luggage. 62% chance it arrives in the same hemisphere as you.",
    defaultSelected: true,
    guiltQuestion: "Are you sure you want to abandon your luggage?",
    guiltDetail:
      "Without Checked Baggage, your suitcase must hitchhike down the runway by itself.",
    keepLabel: "Keep My Suitcase Safe (₱850)",
    declineLabel: "I'll Wear 14 Shirts at Once",
    aftermath: "Your suitcase is weeping softly on Carousel 4.",
  },
  {
    id: "meal",
    label: "Meal",
    price: 320,
    icon: "🍱",
    tag: "CHEF'S GAMBLE",
    description:
      "lukewarm Mystery Adobo or a laminated high-resolution photo of sinigang.",
    defaultSelected: false,
    guiltQuestion: "Are you sure you want to starve at 35,000 feet?",
    guiltDetail:
      "Everyone else in Row 12 will be loudly crunching warm pandesal while making eye contact with you.",
    keepLabel: "Feed Me Mystery Adobo (₱320)",
    declineLabel: "I'll Feast on Cabin Air",
    aftermath: "Your stomach's growls will be broadcast over the cabin PA.",
  },
  {
    id: "travel-insurance",
    label: "Travel Insurance",
    price: 450,
    icon: "🛡️",
    tag: "LEGAL SHIELD",
    description:
      "Covers meteor strikes, runway goat stampedes, and spontaneous engine naps.",
    defaultSelected: false,
    guiltQuestion: "Are you sure you want to raw-dog aviation fate?",
    guiltDetail:
      "If a competitive goat eats your boarding pass, you will have zero legal recourse.",
    keepLabel: "Protect My Destiny (₱450)",
    declineLabel: "Bahala Na, No Insurance",
    aftermath: "Our actuarial department just gasped out loud.",
  },
  {
    id: "breathing-privileges",
    label: "Breathing Privileges",
    price: 499,
    icon: "🫁",
    tag: "MANDATORY-ISH",
    description:
      "Unlocks both inhaling AND exhaling inside the pressurized cabin for the full flight.",
    defaultSelected: true,
    guiltQuestion: "Are you sure you don't want to breathe?",
    guiltDetail:
      "Opting out places your nostrils on standby mode whenever cabin altitude exceeds 12 feet.",
    keepLabel: "I Enjoy Oxygen, Keep It (₱499)",
    declineLabel: "No Thanks, I'll Hold My Breath",
    aftermath: "Your lungs will remember this.",
  },
  {
    id: "emotional-support-fee",
    label: "Emotional Support Fee",
    price: 350,
    icon: "🥺",
    tag: "FEELINGS ADD-ON",
    description:
      "Cabin crew will nod sympathetically and pat your shoulder when turbulence hits 47%.",
    defaultSelected: true,
    guiltQuestion: "Are you sure you want to cry alone during turbulence?",
    guiltDetail:
      "Without this fee, flight attendants are contractually required to side-eye your panic.",
    keepLabel: "Validate My Feelings (₱350)",
    declineLabel: "I Am Emotionally Invincible",
    aftermath: "The cabin crew has pre-cancelled your comforting nods.",
  },
  {
    id: "armrest-rights",
    label: "Armrest Rights",
    price: 275,
    icon: "💪",
    tag: "TERRITORY DEED",
    description:
      "Grants exclusive legal jurisdiction over 1.5 armrests for the duration of the flight.",
    defaultSelected: true,
    guiltQuestion:
      "Are you sure you want to surrender both armrests to Gary in 12B?",
    guiltDetail:
      "Gary has been training his elbows at the gym for six months specifically for this flight.",
    keepLabel: "Defend My Elbows (₱275)",
    declineLabel: "Let Gary Take Both Armrests",
    aftermath: "Gary in Seat 12B just smiled menacingly.",
  },
  {
    id: "gravity-insurance",
    label: "Gravity Insurance",
    price: 666,
    icon: "🍎",
    tag: "NEWTON APPROVED",
    description:
      "Guarantees the aircraft remains on polite speaking terms with Sir Isaac Newton's laws.",
    defaultSelected: true,
    guiltQuestion: "Are you sure you want to opt out of gravity?",
    guiltDetail:
      "Uninsured passengers may experience unplanned floating toward the overhead bins.",
    keepLabel: "Respect the Laws of Physics (₱666)",
    declineLabel: "Float Into the Stratosphere",
    aftermath: "Sir Isaac Newton has been notified of your hubris.",
  },
];

const NO_THANKS_GUILT = {
  id: "__no_thanks_all__",
  label: "All Comfort & Survival Extras",
  price: 0,
  icon: "💀",
  guiltQuestion: "Are you sure you don't want to breathe?",
  guiltDetail:
    "You just pressed 'No thanks' to oxygen, gravity, armrests, and emotional support. Even the pilot is concerned.",
  keepLabel: "Wait, Take Me Back to Extras",
  declineLabel: "Strip Everything & Continue Unprotected",
  aftermath: "Your lungs will remember this.",
};

function toSavedExtras(selectedIds) {
  const idSet = new Set(selectedIds);
  return EXTRAS_CATALOG.filter((item) => idSet.has(item.id)).map(
    ({ id, label, price }) => ({ id, label, price })
  );
}

export default function Extras() {
  const { booking, updateBooking, next, back, bumpFrustration } = useBooking();

  const [selectedIds, setSelectedIds] = useState(() => {
    if (Array.isArray(booking?.extras) && booking.extras.length > 0) {
      const existingIds = booking.extras
        .map((item) => item?.id || EXTRAS_CATALOG.find((c) => c.label === item?.label)?.id)
        .filter(Boolean);
      if (existingIds.length > 0) {
        return existingIds;
      }
    }
    return EXTRAS_CATALOG.filter((item) => item.defaultSelected).map(
      (item) => item.id
    );
  });

  // Guilt modal state: { item, step: "confirm" | "aftermath", proceedAfter?: boolean }
  const [guiltModal, setGuiltModal] = useState(null);
  const [lastGuiltMemory, setLastGuiltMemory] = useState("");
  const [declineCount, setDeclineCount] = useState(0);
  const [adOpen, setAdOpen] = useState(false);

  // Sync selected extras into booking.extras whenever selection changes
  useEffect(() => {
    updateBooking({ extras: toSavedExtras(selectedIds) });
  }, [selectedIds, updateBooking]);

  const selectedExtras = useMemo(
    () => toSavedExtras(selectedIds),
    [selectedIds]
  );

  const extrasTotal = useMemo(
    () => selectedExtras.reduce((sum, item) => sum + item.price, 0),
    [selectedExtras]
  );

  function handleToggleExtra(item) {
    const isCurrentlySelected = selectedIds.includes(item.id);

    if (!isCurrentlySelected) {
      setSelectedIds((prev) => [...prev, item.id]);
      return;
    }

    // Unticking an extra triggers a guilt-inducing confirm dialog (and sometimes an AdPopup!)
    const nextDeclineCount = declineCount + 1;
    setDeclineCount(nextDeclineCount);
    bumpFrustration?.(3);

    // Every 2nd untick (except Breathing Privileges which always opens its signature dialog first),
    // also pop open a surprise AdPopup!
    if (item.id !== "breathing-privileges" && nextDeclineCount % 2 === 0) {
      setAdOpen(true);
    }

    setGuiltModal({
      item,
      step: "confirm",
      proceedAfter: false,
    });
  }

  function handleNoThanksClick() {
    const nextDeclineCount = declineCount + 1;
    setDeclineCount(nextDeclineCount);
    bumpFrustration?.(4);

    // Sometimes (on even clicks) pop an AdPopup alongside the guilt dialog
    if (nextDeclineCount % 2 === 0) {
      setAdOpen(true);
    }

    const breathingStillSelected = selectedIds.includes("breathing-privileges");
    const targetItem = breathingStillSelected
      ? EXTRAS_CATALOG.find((item) => item.id === "breathing-privileges")
      : NO_THANKS_GUILT;

    setGuiltModal({
      item: {
        ...NO_THANKS_GUILT,
        guiltQuestion: targetItem?.guiltQuestion || NO_THANKS_GUILT.guiltQuestion,
        aftermath: targetItem?.aftermath || NO_THANKS_GUILT.aftermath,
      },
      step: "confirm",
      proceedAfter: true,
    });
  }

  function handleConfirmDecline() {
    if (!guiltModal) return;
    const { item, proceedAfter } = guiltModal;

    if (item.id === "__no_thanks_all__") {
      setSelectedIds([]);
    } else {
      setSelectedIds((prev) => prev.filter((id) => id !== item.id));
    }

    setLastGuiltMemory(item.aftermath || "Your lungs will remember this.");
    bumpFrustration?.(2);

    setGuiltModal({
      item,
      step: "aftermath",
      proceedAfter,
    });
  }

  function handleKeepExtra() {
    setGuiltModal(null);
  }

  function handleCloseAftermath() {
    const shouldProceed = guiltModal?.proceedAfter;
    setGuiltModal(null);
    if (shouldProceed) {
      next();
    }
  }

  function handleContinue() {
    updateBooking({ extras: toSavedExtras(selectedIds) });
    next();
  }

  return (
    <div className="extras-stage">
      <section className="panel extras-header">
        <h2 className="panel-title purple">
          🛒 STEP 8 OF 12: MANDATORY-OPTIONAL IN-FLIGHT EXTRAS
        </h2>
        <div className="panel-body extras-header__body">
          <p className="extras-header__intro">
            Your ₱1 base fare includes a fuselage and <em>most</em> of a wing.
            Everything else—including oxygen, gravity, and elbow jurisdiction—has
            been thoughtfully pre-selected for your survival!
          </p>
          <div className="extras-header__summary">
            <span>
              Selected Add-Ons: <strong>{selectedExtras.length} / {EXTRAS_CATALOG.length}</strong>
            </span>
            <span className="extras-header__total">
              Extras Subtotal: <strong>₱{extrasTotal.toLocaleString()}</strong>
            </span>
          </div>
          {lastGuiltMemory && (
            <div className="extras-guilt-banner" role="status">
              ⚠️ <strong>Permanent Guilt Log:</strong> {lastGuiltMemory}
            </div>
          )}
        </div>
      </section>

      <div className="extras-grid" role="group" aria-label="Available flight extras">
        {EXTRAS_CATALOG.map((item) => {
          const checked = selectedIds.includes(item.id);
          return (
            <label
              key={item.id}
              className={`panel extra-card ${checked ? "extra-card--checked" : "extra-card--unchecked"}`}
            >
              <div className="extra-card__top">
                <span className="extra-card__tag">{item.tag}</span>
                <span className="extra-card__price display">
                  +₱{item.price}
                </span>
              </div>

              <div className="panel-body extra-card__body">
                <div className="extra-card__main">
                  <input
                    type="checkbox"
                    className="extra-card__checkbox"
                    checked={checked}
                    onChange={() => handleToggleExtra(item)}
                  />
                  <div className="extra-card__info">
                    <h3 className="extra-card__title">
                      <span aria-hidden="true">{item.icon} </span>
                      {item.label}
                    </h3>
                    <p className="extra-card__desc">{item.description}</p>
                  </div>
                </div>

                <div className="extra-card__status">
                  {checked ? (
                    <span className="extra-card__pill extra-card__pill--on">
                      ✓ INCLUDED IN BOOKING (Untick if you dare)
                    </span>
                  ) : (
                    <span className="extra-card__pill extra-card__pill--off">
                      ✗ DECLINED ({item.aftermath})
                    </span>
                  )}
                </div>
              </div>
            </label>
          );
        })}
      </div>

      <section className="panel extras-footer-panel">
        <div className="panel-body extras-footer">
          <button type="button" className="btn" onClick={back}>
            ← Back to Passenger
          </button>

          <div className="extras-footer__right">
            <button
              type="button"
              className="btn warn extras-no-thanks-btn"
              onClick={handleNoThanksClick}
            >
              No thanks, I reject basic survival
            </button>

            <button
              type="button"
              className="btn go extras-continue-btn"
              onClick={handleContinue}
            >
              Continue with {selectedExtras.length} Extra
              {selectedExtras.length === 1 ? "" : "s"} (+₱{extrasTotal.toLocaleString()}) →
            </button>
          </div>
        </div>
      </section>

      {guiltModal && (
        <div
          className="extras-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="extras-guilt-title"
        >
          <div className="panel extras-modal">
            <h3 id="extras-guilt-title" className="panel-title red">
              {guiltModal.step === "confirm"
                ? "😱 WAIT! THINK OF CONSEQUENCES!"
                : "💔 CONSEQUENCE RECORDED"}
            </h3>

            {guiltModal.step === "confirm" ? (
              <div className="panel-body extras-modal__body">
                <div className="extras-modal__icon" aria-hidden="true">
                  {guiltModal.item.icon || "🫁"}
                </div>
                <h4 className="extras-modal__question">
                  {guiltModal.item.guiltQuestion}
                </h4>
                <p className="extras-modal__detail">
                  {guiltModal.item.guiltDetail}
                </p>

                <div className="extras-modal__actions">
                  <button
                    type="button"
                    className="btn go extras-modal__keep"
                    onClick={handleKeepExtra}
                  >
                    ✓ {guiltModal.item.keepLabel}
                  </button>
                  <button
                    type="button"
                    className="btn extras-modal__decline"
                    onClick={handleConfirmDecline}
                  >
                    ✗ {guiltModal.item.declineLabel}
                  </button>
                </div>
              </div>
            ) : (
              <div className="panel-body extras-modal__body">
                <div className="extras-modal__icon" aria-hidden="true">
                  🫁💨
                </div>
                <h4 className="extras-modal__aftermath">
                  “{guiltModal.item.aftermath}”
                </h4>
                <p className="extras-modal__detail">
                  We have updated your permanent passenger dossier accordingly.
                </p>

                <div className="extras-modal__actions">
                  <button
                    type="button"
                    className="btn warn extras-modal__close-aftermath"
                    onClick={handleCloseAftermath}
                  >
                    {guiltModal.proceedAfter
                      ? "I Accept My Fate · Continue to Review →"
                      : "I Accept My Shame (Close)"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <AdPopup open={adOpen} onClose={() => setAdOpen(false)} />
    </div>
  );
}
