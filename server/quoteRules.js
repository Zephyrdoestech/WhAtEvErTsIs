// OWNER: DIN — the one quote calculation. Used by POST /api/quote (server/routes/quote.js)
// and by the offline fallback (src/api/mocks.js), so live and offline totals always agree.

// Absurd fees everyone pays, skipped when the booking already has a fee with the same label.
const BASELINE_FEES = [
  { label: "Breathing Privileges", amount: 499 },
  { label: "Emotional Support Fee", amount: 350 },
  { label: "Window Appreciation Fee", amount: 500 },
  { label: "Convenience Fee (for convenience)", amount: 200 },
  { label: "Fee for Fees", amount: 99 },
  { label: "Tax on Tax", amount: 0.01 },
];

const round = (n) => Math.round(n * 100) / 100;

export function computeQuote(booking = {}) {
  const rawPrice = Number(booking?.flight?.price);
  // 0 is a real promo price (the "FREE*" flight); only a missing/invalid price falls back to ₱1.
  const baseAmount = Number.isFinite(rawPrice) && rawPrice >= 0 ? rawPrice : 1;

  const items = [{ label: "Base fare", amount: baseAmount }];
  const seen = new Set(["base fare"]);
  const addItem = (label, amount) => {
    const cleanLabel = String(label || "").trim();
    const num = Number(amount);
    if (!cleanLabel || !Number.isFinite(num)) return;
    items.push({ label: cleanLabel, amount: round(num) });
    seen.add(cleanLabel.toLowerCase());
  };

  const seat = booking?.seat && typeof booking.seat === "object" ? booking.seat : null;
  const seatFee = Number(seat?.fee ?? seat?.price);
  if (Number.isFinite(seatFee) && seatFee > 0) addItem(seat.label || "Window Appreciation Fee", seatFee);

  if (Array.isArray(booking?.extras)) {
    for (const extra of booking.extras) {
      if (extra && typeof extra === "object") addItem(extra.label || extra.name || "Mystery Extra", extra.amount ?? extra.price ?? 199);
      else if (typeof extra === "string") addItem(extra, 199);
    }
  } else if (booking?.extras && typeof booking.extras === "object") {
    for (const [key, val] of Object.entries(booking.extras)) {
      if (val && typeof val === "object") addItem(val.label || key, val.amount ?? val.price ?? 199);
      else if (typeof val === "number" && val > 0) addItem(key, val);
      else if (val === true) addItem(key, 199);
    }
  }

  if (Array.isArray(booking?.fees)) {
    for (const fee of booking.fees) {
      if (fee && typeof fee === "object") addItem(fee.label || fee.name || "Surprise Fee", fee.amount ?? fee.price ?? 99);
    }
  }

  for (const fee of BASELINE_FEES) {
    if (seen.has(fee.label.toLowerCase())) continue;
    // An aisle/middle seat doesn't get the window fee; with no seat chosen yet, it's a mystery charge.
    if (fee.label === "Window Appreciation Fee" && seat && seat.window === false) continue;
    addItem(fee.label, fee.amount);
  }

  const total = round(items.reduce((sum, item) => sum + item.amount, 0));
  return { items, total };
}
