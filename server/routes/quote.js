// OWNER: DIN — POST /api/quote
import { Router } from "express";
import { computeQuote } from "../quoteRules.js";

const router = Router();

router.post("/", (req, res) => {
  res.json(computeQuote(req.body || {}));
});

export default router;
