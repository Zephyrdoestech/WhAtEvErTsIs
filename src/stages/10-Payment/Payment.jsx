// OWNER: DIN — see DIN.MD (Stage 10: Payment)
// Built strictly from Figma "Screen References" page tab (Frame 28:591 / 28:620).
import { useEffect, useState } from "react";
import useBooking from "../../context/useBooking.js";
import { getQuote } from "../../api/client.js";
import "./Payment.css";

const EXTRA_CREEPING_FEES = [
  { label: "Checkout Staring Surcharge", amount: 149 },
  { label: "Hesitation Penalty (per second)", amount: 88 },
  { label: "Cursor Hover Tax", amount: 199 },
  { label: "Fee Processing Fee", amount: 120 },
  { label: "Gravity Surcharge", amount: 333 },
  { label: "Convenience Fee for the Inconvenience", amount: 250 },
  { label: "Pixel Wear & Tear Fee", amount: 75 },
  { label: "Pigeon Feed Adjustment", amount: 64 },
];

const PAYMENT_METHODS = [
  { id: "gcash", label: "GCash" },
  { id: "card", label: "Credit Card" },
  { id: "pigeon", label: "Cash (send via pigeon)" },
  { id: "exposure", label: "Exposure" },
];

function formatPeso(amount) {
  const num = Number(amount) || 0;
  return `₱${num.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function Payment() {
  const { booking, updateBooking, frustration, bumpFrustration, demoMode, next } = useBooking();

  const [items, setItems] = useState([
    { label: "Base fare", amount: 1 },
    { label: "Breathing Privileges", amount: 499 },
    { label: "Emotional Support Fee", amount: 350 },
    { label: "Window Appreciation Fee", amount: 500 },
    { label: "Convenience Fee (for convenience)", amount: 200 },
    { label: "Fee for Fees", amount: 99 },
    { label: "Tax on Tax", amount: 0.01 },
  ]);
  const [newestIdx, setNewestIdx] = useState(-1);
  const [method, setMethod] = useState("exposure");
  const [digitScreen, setDigitScreen] = useState(1);
  const [currentDigit, setCurrentDigit] = useState("7");
  const [cvvOfCvv, setCvvOfCvv] = useState("***");
  const [infiniteCaptchaChecked, setInfiniteCaptchaChecked] = useState(false);

  // Load initial quote from backend / mock fallback
  useEffect(() => {
    let active = true;
    getQuote(booking).then((q) => {
      if (!active || !q || !Array.isArray(q.items)) return;
      setItems(q.items);
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add new hidden charges one by one while the user watches
  useEffect(() => {
    let cursor = 0;
    const intervalMs = demoMode ? 2200 : 3500;
    const timer = setInterval(() => {
      if (cursor >= EXTRA_CREEPING_FEES.length) return;
      const nextFee = EXTRA_CREEPING_FEES[cursor];
      cursor += 1;
      setItems((prev) => {
        const updated = [...prev, { ...nextFee, isNew: true }];
        setNewestIdx(updated.length - 1);
        return updated;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [demoMode]);

  const total = Math.round(items.reduce((sum, item) => sum + Number(item.amount || 0), 0) * 100) / 100;

  // Keep booking.quote updated so Stage 11 has the final ballooned total
  useEffect(() => {
    updateBooking({ quote: { items, total } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, total]);

  const handleMethodSelect = (id) => {
    setMethod(id);
    bumpFrustration?.(2);
  };

  const handleNextCardDigit = () => {
    bumpFrustration?.(2);
    setDigitScreen((prev) => (prev >= 16 ? 1 : prev + 1));
    setCurrentDigit(String(Math.floor(Math.random() * 10)));
  };

  const displayedFrustration = Math.max(94, Math.min(100, frustration || 94));

  return (
    <div className="payment-stage-canvas" data-node-id="28:591" data-name="Screen 3 · Terms & Punishments + Payment">
      {/* Top red marquee from Figma (28:592) */}
      <div className="payment-marquee-bar" data-node-id="28:592">
        <p className="payment-marquee-text" data-node-id="28:593">
          {`>>> STEP 9 OF 12: TERMS & PUNISHMENTS >>> STEP 10 OF 12: PAYMENT >>> YOUR ₱1 FLIGHT IS NOW ${formatPeso(total)} >>> DO NOT REFRESH (we did) >>>`}
        </p>
      </div>

      {/* Site Header from Figma (28:594) */}
      <div className="payment-site-header" data-node-id="28:594">
        <p className="payment-brand-title" data-node-id="28:595">
          Whatever tsis
        </p>
        <div className="payment-frustration-box" data-node-id="28:596">
          <p className="payment-frustration-label" data-node-id="28:597">
            FRUSTRATION METER: {displayedFrustration}%
          </p>
          <div className="payment-frustration-bar-bg" data-node-id="28:598">
            <div
              className="payment-frustration-bar-fill"
              data-node-id="28:599"
              style={{ width: `${displayedFrustration}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main row with Payment Panel (28:620) */}
      <div className="payment-main-row" data-node-id="28:600">
        <div className="payment-window" data-node-id="28:620" data-name="Payment">
          <div className="payment-title-bar" data-node-id="28:621">
            <p className="payment-title-bar-text" data-node-id="28:622">
              PAYMENT - Step 10 of 12
            </p>
          </div>

          <div className="payment-body" data-node-id="28:623">
            {/* Itemized box (#ffe) (28:624) */}
            <div className="payment-itemized-box" data-node-id="28:624" data-name="Itemized">
              {items.map((item, idx) => (
                <div
                  key={`${item.label}-${idx}`}
                  className={`payment-fee-line ${idx === newestIdx ? "payment-fee-line--new" : ""}`}
                >
                  <span>{item.label}</span>
                  <span>{formatPeso(item.amount)}</span>
                </div>
              ))}

              <div className="payment-total-row" data-node-id="28:646" data-name="total">
                <p className="payment-total-label" data-node-id="28:647">
                  TOTAL (was ₱1*)
                </p>
                <p className="payment-total-amount" data-node-id="28:648">
                  {formatPeso(total)}
                </p>
              </div>
            </div>

            {/* Payment method selector matching Figma text layout (28:649) */}
            <div className="payment-methods-row" data-node-id="28:649">
              <span>Payment method:</span>
              {PAYMENT_METHODS.map((pm) => {
                const selected = method === pm.id;
                return (
                  <button
                    key={pm.id}
                    type="button"
                    className={`payment-method-option ${selected ? "payment-method-option--active" : ""}`}
                    onClick={() => handleMethodSelect(pm.id)}
                  >
                    <span>{selected ? "(o)" : "( )"}</span>
                    <span>{pm.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Card / method details box (28:650) */}
            <div className="payment-card-entry" data-node-id="28:650" data-name="Card entry">
              <p className="payment-card-prompt" data-node-id="28:651">
                {`Card number (enter BACKWARDS, one digit per screen):  digit ${digitScreen} of 16`}
              </p>
              <div className="payment-card-digit-row" data-node-id="28:652">
                <input
                  type="text"
                  maxLength={1}
                  className="payment-digit-input"
                  data-node-id="28:653"
                  value={currentDigit}
                  onChange={(e) => setCurrentDigit(e.target.value.slice(-1))}
                  aria-label="Single backwards card digit"
                />
                <button type="button" className="payment-digit-btn" onClick={handleNextCardDigit}>
                  Next digit
                </button>
                <p className="payment-screens-remaining" data-node-id="28:655">
                  {`<- ${16 - digitScreen} more screens to go`}
                </p>
              </div>

              <p className="payment-cvv-label" data-node-id="28:656">
                CVV: please enter the CVV of your CVV
              </p>
              <input
                type="text"
                maxLength={6}
                className="payment-cvv-input"
                data-node-id="28:657"
                value={cvvOfCvv}
                onChange={(e) => setCvvOfCvv(e.target.value)}
                aria-label="CVV of your CVV"
              />

              <p className="payment-demo-note" data-node-id="28:659">
                DEMO ONLY: use fake payment details. No real payments are processed.
              </p>
            </div>

            {/* CAPTCHA #∞ bar (28:660) */}
            <div
              className="payment-captcha-bar"
              data-node-id="28:660"
              onClick={() => {
                setInfiniteCaptchaChecked((v) => !v);
                bumpFrustration?.(2);
              }}
              role="checkbox"
              aria-checked={infiniteCaptchaChecked}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  setInfiniteCaptchaChecked((v) => !v);
                }
              }}
            >
              <div className="payment-captcha-checkbox" data-node-id="28:661">
                {infiniteCaptchaChecked ? "✓" : ""}
              </div>
              <p className="payment-captcha-text" data-node-id="28:662">
                CAPTCHA #∞: prove you are the same human who paid attention to CAPTCHA #1
              </p>
            </div>

            {/* Pay Now row (28:663) */}
            <div className="payment-pay-row" data-node-id="28:663" data-name="pay row">
              <div className="payment-pay-btn-wrap">
                <div className="payment-forcefield-ring" data-node-id="28:712" />
                <div className="payment-nya-badge" data-node-id="28:713">
                  <p className="payment-nya-text" data-node-id="28:714">nya!</p>
                </div>
                <button
                  type="button"
                  className="payment-pay-now-btn"
                  data-node-id="28:664"
                  onClick={() => next()}
                >
                  PAY NOW (hold 10s)
                </button>
              </div>

              <div className="payment-hold-wrap" data-node-id="28:666">
                <p className="payment-hold-label" data-node-id="28:667">
                  hold progress: 1s of 10s (forcefield pushes cursor away)
                </p>
                <div className="payment-hold-bar-bg" data-node-id="28:668">
                  <div className="payment-hold-bar-fill" data-node-id="28:669" style={{ width: "10%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer from Figma (28:680) */}
      <div className="payment-footer-bar" data-node-id="28:680">
        <p className="payment-footer-text" data-node-id="28:681">
          © 1999-2026 Bahala Na Air. All wrongs reserved. DEMO ONLY - no real bookings or payments.
        </p>
      </div>
    </div>
  );
}
