// OWNER: DIN — see DIN.MD. Tiny Express API for the cursed airline.
import express from "express";
import cors from "cors";
import flightsRouter from "./routes/flights.js";
import quoteRouter from "./routes/quote.js";
import termsRouter from "./routes/terms.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true, status: "Operational-ish" });
});

app.use("/api/flights", flightsRouter);
app.use("/api/quote", quoteRouter);
app.use("/api/terms", termsRouter);

// TODO(DIN): mount remaining routes from ./routes (bookings). See DIN.MD task 5.

app.listen(PORT, () => console.log(`✈ WhAtEvErTsIs API on http://localhost:${PORT}`));
