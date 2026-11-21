# WhAtEvErTsIs Backend API (`server/`)

**Owner:** DIN (`roles/DIN.MD`)

Tiny Node + Express API powering the cursed ₱1 airline booking flow. Stores bookings in memory and persists them to `server/data/db.json` (git-ignored). If the server is stopped, `src/api/client.js` automatically falls back to `src/api/mocks.js` so the frontend demo never breaks.

## Running the Server

```bash
cd server
npm install
npm run dev    # Runs on http://localhost:3001 (proxied via Vite at http://localhost:5173/api)
```

---

## Endpoints

### 1. `GET /api/health`
Health check endpoint.

```bash
curl http://localhost:3001/api/health
```
**Response:**
```json
{ "ok": true, "status": "Operational-ish" }
```

---

### 2. `GET /api/flights`
Returns 5–7 cursed flights built from `server/data/flights.json` (matching the Figma **Screen References** flights: `BN 101`, `BN 404`, `BN 777`, `BN 013`, `BN 666`, `WTS 001`).

**Query Parameters:** `from`, `to`, `date`, `passengers`

```bash
curl "http://localhost:3001/api/flights?from=Cebu&to=Manila&date=2026-11-25&passengers=1"
```

---

### 3. `POST /api/quote`
Calculates the ballooning itemized fare starting from `₱1.00` base fare plus any `seat`, `extras`, `booking.fees`, and the Figma Screen References default hidden charges (`Breathing Privileges`, `Emotional Support Fee`, `Window Appreciation Fee`, `Convenience Fee (for convenience)`, `Fee for Fees`, `Tax on Tax`).

```bash
curl -X POST http://localhost:3001/api/quote \
  -H "Content-Type: application/json" \
  -d '{"flight":{"price":1},"fees":[]}'
```
**Response:**
```json
{
  "items": [
    { "label": "Base fare", "amount": 1 },
    { "label": "Breathing Privileges", "amount": 499 },
    { "label": "Emotional Support Fee", "amount": 350 },
    { "label": "Window Appreciation Fee", "amount": 500 },
    { "label": "Convenience Fee (for convenience)", "amount": 200 },
    { "label": "Fee for Fees", "amount": 99 },
    { "label": "Tax on Tax", "amount": 0.01 }
  ],
  "total": 1649.01
}
```

---

### 4. `GET /api/terms`
Returns 30+ absurd "Terms & Punishments" paragraphs used by Stage 09 (starting with the 12 clauses from Figma Screen References).

```bash
curl http://localhost:3001/api/terms
```

---

### 5. Bookings CRUD (`/api/bookings`)

- **`POST /api/bookings`** — Creates a booking with reference `WTF-404-XXX` and status `"Confirmed-ish"`.
  ```bash
  curl -X POST http://localhost:3001/api/bookings \
    -H "Content-Type: application/json" \
    -d '{"passenger":{"firstName":"JUAN","lastName":"DELA CRUZ"},"flight":{"id":"WTS 001"},"seat":{"code":"12? · Moving","cls":"Emotional economy"}}'
  ```
- **`GET /api/bookings/:ref`** — Retrieves a booking by reference.
  ```bash
  curl http://localhost:3001/api/bookings/WTF-404-ABC
  ```
- **`PATCH /api/bookings/:ref`** — Updates a booking's seat/passenger/status.
  ```bash
  curl -X PATCH http://localhost:3001/api/bookings/WTF-404-ABC \
    -H "Content-Type: application/json" \
    -d '{"seat":{"code":"14B · Still Moving"}}'
  ```
- **`DELETE /api/bookings/:ref`** — Cancels a booking (`status` becomes `"Cancelled-ish"`).
  ```bash
  curl -X DELETE http://localhost:3001/api/bookings/WTF-404-ABC
  ```

---

### 6. `POST /api/reset`
Wipes all in-memory and `server/data/db.json` bookings for a clean demo reset.

```bash
curl -X POST http://localhost:3001/api/reset
```
