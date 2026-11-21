# KYLE.MD — Team lead, app shell, Stages 01 and 12

> ## 🤖 Rules for any AI assistant reading this file
> 1. You are helping **KYLE**. Work only on the tasks in this file. Read `TEAM.MD` first for the shared contracts.
> 2. **Do ONE task at a time.** Pick the first unchecked task (`- [ ]`) unless KYLE names a different one.
> 3. When the task is done: tick its box (`- [x]`), give a short summary of what changed and how to test it, then **STOP and wait** for KYLE. Do not start the next task on your own.
> 4. Only do more than one task if KYLE explicitly asks (for example "do tasks 3 to 5" or "do all remaining tasks").
> 5. Only edit the files KYLE owns (listed below). If a task needs a change in someone else's file, stop and say who owns it and what to ask them for.
> 6. Don't add new npm packages unless the task says so. Don't change a shared contract in `TEAM.MD` without telling KYLE who it affects.
> 7. Keep it demo-safe: fake data only, no real payments, nothing from the camera is uploaded or saved, and every sound or popup can be skipped or muted.

**Test your stage:** `npm run dev`, then open `http://localhost:5173/?stage=N` (add `&demo` for short timers).

## Files you own
- `src/App.jsx`, `src/main.jsx`, `src/index.css`, `README.md`
- `src/app/` (AppShell), `src/context/` (booking state), `src/stages/index.js` (stage registry)
- `src/components/layout/` (StagePlaceholder, FrustrationMeter, any header/progress pieces)
- `src/stages/01-Welcome/`, `src/stages/12-ManageBooking/`

## You depend on / others depend on you
- **Everyone** uses `useBooking()` from your `src/context/`. Keep its fields and functions stable; add, don't rename.
- You use DAR's `AdPopup` (optional) and DIN's `getBooking` / `cancelBooking` from `src/api/client.js`.
- DIN sets `booking.survivor = true` on Stage 11; you show the Certified Survivor badge.

## Roadmap
### - [x] Task 1: Wire up the app shell
Replace the contents of `src/App.jsx` so it just renders `<AppShell />` from `./app/AppShell.jsx`. Run `npm install` and `npm run dev`. Click through all 12 placeholder stages with the Next button and try `?stage=7`.
**Done when:** the app shows the airline header, "Step 1 of 12", and you can click Next through all 12 placeholders without errors. Tell the team to pull.

### - [x] Task 2: Believable airline look
Polish `AppShell.css` and the header so the site looks like a real, trustworthy airline (navy/white, logo, footer with fake links). Add a `StepProgress.jsx` in `components/layout/` showing 12 dots for the stages. Small joke: the progress bar occasionally jitters backwards for a moment.
**Done when:** the site looks legit at first glance and the progress bar follows the current stage.

### - [ ] Task 3: Frustration meter
Make `FrustrationMeter.jsx` a real bar from 0 to 100 with a face that gets angrier (😊 → 😐 → 😠 → 🤬 → 💀). Animate it when it rises. Add a small "Loops survived: N" counter from `loopCount`.
**Done when:** calling `bumpFrustration(20)` anywhere visibly moves the meter and changes the face.

### - [ ] Task 4: Stage 01: ₱1 promo welcome page
Build `Welcome.jsx`: hero banner "MANILA → ANYWHERE for ₱1!*" with a tiny asterisk footnote, fake promo cards, and a big Book Now button that calls `next()`.
**Done when:** Stage 01 looks like a real airline promo and Book Now goes to Stage 02.

### - [ ] Task 5: Stage 01: the Shea ad
On load, show a full-screen video ad using `src/assets/videos/shea closer.mp4`. A Skip button is visible only during the first 5 seconds, then disappears; after that the user must sit through it (cap it at ~20s, or 5s when `demoMode`). Handle browsers blocking autoplay with sound (start muted with a "Tap for sound" button). `bumpFrustration(10)` if they miss the Skip window.
**Done when:** the ad appears on every visit to Stage 01, Skip works only in the first 5 seconds, and the promo page shows after the ad ends.

### - [ ] Task 6: Stage 12: Manage Booking page
Build `ManageBooking.jsx`: show the booking reference, flight, seat and status (use `booking` from context, plus `getBooking(booking.reference)` from the API client). Buttons: Modify, Cancel.
**Done when:** Stage 12 shows the booking details that were entered in earlier stages.

### - [ ] Task 7: Stage 12: the loop
Modify sends the user back to a random earlier stage (`goTo` 3 to 9) with a message like "To change your seat, please re-book your entire life." Cancel opens 3 to 5 escalating confirmations ("Are you sure?" → "Are you SURE sure?" ...), then calls `cancelBooking`, then asks "Book again?": both Yes and No call `resetBooking()` (back to the homepage).
**Done when:** every path out of Stage 12 ends up back in the booking flow, and the loop counter goes up.

### - [ ] Task 8: Certified Survivor badge
When `booking.survivor` is true, show a "🏅 Certified Survivor" badge in the header that stays even after `resetBooking()` (store it separately in the provider, for example `survivorCount`).
**Done when:** after reaching Stage 11 once, the badge shows and survives the loop.

### - [ ] Task 9: Integration pass
Pull everyone's work. Walk all 12 stages from the start with the real flow (no `?stage`). Fix anything in your files; for bugs in other people's files, list them and send them to the owner. Add a dev-only stage jumper (hidden unless `import.meta.env.DEV`).
**Done when:** a full run from Stage 01 to the Stage 12 loop works without console errors.

### - [ ] Task 10: Demo prep
Write `README.md`: what the project is, how to run frontend + backend, the 2-minute demo route, and team credits. Make sure `?demo` shortens timers across the app (ask owners to read `demoMode`). Rehearse once with the team.
**Done when:** anyone can clone, run, and give the demo using only the README.
