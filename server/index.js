// OWNER: DIN — see DIN.MD. Tiny Express API for the cursed airline.
import express from "express";
import cors from "cors";
import flightsRouter from "./routes/flights.js";
import quoteRouter from "./routes/quote.js";
import termsRouter from "./routes/terms.js";
import bookingsRouter, { clearBookingsStore } from "./routes/bookings.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "256kb" }));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, status: "Operational-ish" });
});

app.use("/api/flights", flightsRouter);
app.use("/api/quote", quoteRouter);
app.use("/api/terms", termsRouter);
app.use("/api/bookings", bookingsRouter);

// Reset all in-memory + db.json bookings between demos
app.post("/api/reset", (req, res) => {
  clearBookingsStore();
  res.json({ ok: true, status: "Reset-ish", message: "All bookings forgotten by Ye Olde Airlper." });
});

// 404 handler for unknown /api routes
app.use("/api/*", (req, res) => {
  res.status(404).json({
    ok: false,
    error: "Gate 404: API endpoint not found (location unknown)",
    path: req.originalUrl,
  });
});

// Basic error-handling middleware (never logs personal details)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err?.status || err?.statusCode || 500;
  res.status(status).json({
    ok: false,
    error: err?.type === "entity.parse.failed" ? "Invalid JSON payload" : "Turbulence in backend (3% extra)",
  });
});

app.listen(PORT, () => console.log(`✈ WhAtEvErTsIs API on http://localhost:${PORT}`));
