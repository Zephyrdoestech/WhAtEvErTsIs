// OWNER: DIN — POST /api/quote
import { Router } from "express";

const router = Router();

const DEFAULT_FIGMA_HIDDEN_FEES = [
  { label: "Breathing Privileges", amount: 499 },
  { label: "Emotional Support Fee", amount: 350 },
  { label: "Window Appreciation Fee", amount: 500 },
  { label: "Convenience Fee (for convenience)", amount: 200 },
  { label: "Fee for Fees", amount: 99 },
  { label: "Tax on Tax", amount: 0.01 },
];

router.post("/", (req, res) => {
  const booking = req.body || {};
  const rawPrice = Number(booking?.flight?.price);
  const baseAmount = Number.isFinite(rawPrice) && rawPrice > 0 ? rawPrice : 1;

  const items = [{ label: "Base fare", amount: baseAmount }];
  const seenLabels = new Set(["base fare"]);

  const addItem = (label, amount) => {
    const cleanLabel = String(label || "").trim();
    const numAmount = Number(amount);
    if (!cleanLabel || !Number.isFinite(numAmount)) return;
    items.push({ label: cleanLabel, amount: Math.round(numAmount * 100) / 100 });
    seenLabels.add(cleanLabel.toLowerCase());
  };

  // Add seat fee if present
  if (booking?.seat && typeof booking.seat === "object") {
    const seatFee = Number(booking.seat.fee ?? booking.seat.price);
    if (Number.isFinite(seatFee) && seatFee > 0) {
      addItem(booking.seat.label || "Window Appreciation Fee", seatFee);
    }
  }

  // Add extras if array or object
  if (Array.isArray(booking?.extras)) {
    for (const extra of booking.extras) {
      if (extra && typeof extra === "object") {
        addItem(extra.label || extra.name || "Mystery Extra", extra.amount ?? extra.price ?? 199);
      } else if (typeof extra === "string") {
        addItem(extra, 199);
      }
    }
  } else if (booking?.extras && typeof booking.extras === "object") {
    for (const [key, val] of Object.entries(booking.extras)) {
      if (val && typeof val === "object") {
        addItem(val.label || key, val.amount ?? val.price ?? 199);
      } else if (typeof val === "number" && val > 0) {
        addItem(key, val);
      } else if (val === true) {
        addItem(key, 199);
      }
    }
  }

  // Add booking.fees accumulated along the stages
  if (Array.isArray(booking?.fees)) {
    for (const fee of booking.fees) {
      if (fee && typeof fee === "object") {
        addItem(fee.label || fee.name || "Surprise Fee", fee.amount ?? fee.price ?? 99);
      }
    }
  }

  // Add the Figma Screen References default hidden fees (skipping any exact duplicate like Window Appreciation Fee if already added)
  for (const fee of DEFAULT_FIGMA_HIDDEN_FEES) {
    if (!seenLabels.has(fee.label.toLowerCase())) {
      addItem(fee.label, fee.amount);
    }
  }

  const total = Math.round(items.reduce((sum, item) => sum + item.amount, 0) * 100) / 100;

  res.json({ items, total });
});

export default router;
