# DIN.MD — Backend (Node + Express) and checkout: Stages 10, 11

> ## 🤖 Rules for any AI assistant reading this file
> 1. You are helping **DIN**. Work only on the tasks in this file. Read `TEAM.MD` first for the shared contracts.
> 2. **Do ONE task at a time.** Pick the first unchecked task (`- [ ]`) unless DIN names a different one.
> 3. When the task is done: tick its box (`- [x]`), give a short summary of what changed and how to test it, then **STOP and wait** for DIN. Do not start the next task on your own.
> 4. Only do more than one task if DIN explicitly asks (for example "do tasks 3 to 5" or "do all remaining tasks").
> 5. Only edit the files DIN owns (listed below). If a task needs a change in someone else's file, stop and say who owns it and what to ask them for.
> 6. Don't add new npm packages unless the task says so. Don't change a shared contract in `TEAM.MD` without telling DIN who it affects.
> 7. Keep it demo-safe: fake data only, no real payments, nothing from the camera is uploaded or saved, and every sound or popup can be skipped or muted.

**Test your stage:** `npm run dev`, then open `http://localhost:5173/?stage=N` (add `&demo` for short timers).

## Files you own
- `server/` (all backend code, data and README)
- `src/api/` (`client.js`, `mocks.js`), the only place the frontend calls the backend
- `vite.config.js` (only for the `/api` proxy)
- `src/stages/10-Payment/`, `src/stages/11-Confirmation/`

## You depend on / others depend on you
- **Everyone** calls your functions in `src/api/client.js`. Keep the function names and return shapes in `TEAM.MD` stable; if you must change one, tell its users (DAR: `searchFlights`; RICKS: `getTerms`, `getQuote`; KYLE: `getBooking`, `cancelBooking`).
- You use RICKS's `<ForcefieldButton>` and SYOS's `<Captcha>` on Stage 10. Until they're ready, the placeholders still work.
- You set `booking.reference`, `booking.quote` (if needed) and `booking.survivor`.

## Roadmap
### - [x] Task 1: Server boots + Vite proxy
`cd server && npm install && npm run dev`, check `http://localhost:3001/api/health`. In `vite.config.js` add `server: { proxy: { '/api': 'http://localhost:3001' } }` so the frontend can call `/api/...`.
**Done when:** `/api/health` returns `{ ok: true }` both directly and through `http://localhost:5173/api/health`.

### - [x] Task 2: Flights API
Create `server/routes/flights.js` and mount it: `GET /api/flights?from=&to=&date=&passengers=` returns 4-8 flights for that route built from `server/data/flights.json` (fill in `from`/`to`, randomise times). Prices like ₱1, ₱3, ₱0.50; each has an absurd `conditions` array ("Window is a sticker", "Departs when the pilot feels ready").
**Done when:** the endpoint returns believable-but-cursed flights for any route.

### - [x] Task 3: Quote / hidden fees API
`POST /api/quote` takes the booking JSON and returns `{ items: [{label, amount}], total }`. Start at ₱1 base fare, then add extras, seat fees and `booking.fees`, plus hidden charges (Breathing Privilege Tax, Gravity Surcharge, Fee Processing Fee, Convenience Fee for the Inconvenience). Total should balloon.
**Done when:** a ₱1 flight quote comes back as thousands of pesos with funny line items.

### - [x] Task 4: Terms & Punishments API
`GET /api/terms` returns an array of 30+ absurd terms paragraphs ("Clause 14: The airline reserves the right to be a boat."). RICKS uses it on Stage 09.
**Done when:** the endpoint returns a long, funny terms list.

### - [x] Task 5: Bookings API
`POST /api/bookings` creates a booking with a reference like `WTF-404-ABC`, status `Confirmed-ish`; store in memory and also write to `server/data/db.json` (git-ignored). `GET /api/bookings/:ref`, `PATCH /api/bookings/:ref`, `DELETE /api/bookings/:ref` (status becomes `Cancelled-ish`). Validate inputs; never log personal details.
**Done when:** you can create, read, update and cancel a booking with curl.

### - [x] Task 6: Connect the frontend client
Change `src/api/client.js` to call the real endpoints with `fetch('/api/...')`, but fall back to the mocks in `mocks.js` if the server is down or errors, so the demo never dies. Keep every function signature the same. Tell the team it's live.
**Done when:** with the server running, stages get real data; with it stopped, they still work on mocks.

### - [x] Task 7: Stage 10: payment page
Build `Payment.jsx`: show the quote line items (`getQuote(booking)`), with new hidden charges appearing one by one while the user watches. Payment methods: "Card (demo)", "GCrash", "Pay with Exposure". Show a clear "DEMO: no real payment" note; don't validate or store real card numbers.
**Done when:** Stage 10 looks like a checkout and the total keeps growing.

### - [ ] Task 8: Stage 10: the gauntlet
Pay Now flow: "Are you sure?" dialogs that multiply (1, then 2, then 4 stacked; closing one may spawn another, cap it). Pay Now is RICKS's `<ForcefieldButton>`. After clicking it, SYOS's `<Captcha chain={2} />`. Then `createBooking(booking)`, `updateBooking({ reference })` and `next()`.
**Done when:** a user can fight through the confirmations, forcefield and CAPTCHA and reach Stage 11 with a booking reference.

### - [ ] Task 9: Stage 11: Confirmed-ish e-ticket
Build `Confirmation.jsx`: confetti celebration, then a boarding pass card: passenger name, booking reference, seat, "Destination: UNKNOWN", "Gate: 404", "Status: Confirmed-ish", and the title **Certified Survivor**. Call `updateBooking({ survivor: true })`. A "Manage Booking" button calls `next()`.
**Done when:** Stage 11 shows the fake boarding pass with the user's real details and the survivor title.

### - [ ] Task 10: Backend hardening + docs
Add a `POST /api/reset` for demos, basic error handling middleware, and `server/README.md` (endpoints, example requests). Run the full flow with the server on and off.
**Done when:** the backend is documented and the full flow works with and without the server.
