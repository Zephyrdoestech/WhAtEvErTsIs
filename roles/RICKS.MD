# RICKS.MD — Movement and transitions: Stages 05, 06, 09, ForcefieldButton, transitions

> ## 🤖 Rules for any AI assistant reading this file
> 1. You are helping **RICKS**. Work only on the tasks in this file. Read `TEAM.MD` first for the shared contracts.
> 2. **Do ONE task at a time.** Pick the first unchecked task (`- [ ]`) unless RICKS names a different one.
> 3. When the task is done: tick its box (`- [x]`), give a short summary of what changed and how to test it, then **STOP and wait** for RICKS. Do not start the next task on your own.
> 4. Only do more than one task if RICKS explicitly asks (for example "do tasks 3 to 5" or "do all remaining tasks").
> 5. Only edit the files RICKS owns (listed below). If a task needs a change in someone else's file, stop and say who owns it and what to ask them for.
> 6. Don't add new npm packages unless the task says so. Don't change a shared contract in `TEAM.MD` without telling RICKS who it affects.
> 7. Keep it demo-safe: fake data only, no real payments, nothing from the camera is uploaded or saved, and every sound or popup can be skipped or muted.

**Test your stage:** `npm run dev`, then open `http://localhost:5173/?stage=N` (add `&demo` for short timers).

## Files you own
- `src/components/forcefield/` (ForcefieldButton)
- `src/components/transitions/` (FireTransition, KachowTransition)
- `src/stages/05-SelectFlight/`, `src/stages/06-Seat/`, `src/stages/09-Review/`
- New sound files you add, e.g. `src/assets/audios/nya.mp3`, `kachow.mp3`, `fire.mp3`

## You depend on / others depend on you
- **DIN** uses your `<ForcefieldButton>` for Pay Now on Stage 10. Keep it a drop-in replacement for `<button>`.
- You use SYOS's `<Flashlight>` on Stage 06, and DIN's `getTerms()` / `getQuote()` on Stage 09.
- You read `booking.flight` (set by DAR on Stage 04) and write `booking.seat`, `booking.quote`.

## Roadmap
### - [x] Task 1: ForcefieldButton v1
Build `ForcefieldButton.jsx`: track the mouse with `mousemove` on `window`; measure cursor speed (px/ms). If the cursor is within ~120px and moving faster than `maxSpeed`, the button jumps to a random nearby spot (stay inside the viewport), plays a "nya" sound (add `src/assets/audios/nya.mp3`) and calls `onDodge()`. Slow approach lets you click it. Pass other props through to the `<button>`.
**Done when:** moving fast toward the button makes it flee with a sound; creeping slowly lets you click.

### - [x] Task 2: ForcefieldButton polish
Draw a visible shimmering forcefield ring around it. Make it easier when `demoMode` (higher `maxSpeed`). On touch devices (no mouse), make it dodge the first 2 taps then allow it. Tell DIN it's ready.
**Done when:** the button looks shielded, works on touch, and is demo-friendly.

### - [x] Task 3: FireTransition
Build `FireTransition.jsx`: full-screen fire effect (CSS gradients/animated emoji 🔥 or a GIF you add to assets) with a whoosh sound, ~1.5s, then `onDone()`. Make sure it only calls `onDone` once.
**Done when:** rendering `<FireTransition onDone={next} />` plays the effect and moves on.

### - [x] Task 4: KachowTransition
Build `KachowTransition.jsx`: a race-car streak across the screen with big "KA-CHOW!" text and a sound (add the audio file), ~1.5s, then `onDone()`.
**Done when:** rendering it plays the streak + sound and then moves on.

### - [x] Task 5: Stage 05: select flight
Build `SelectFlight.jsx`: show the chosen `booking.flight` as a detailed card (times, price, the absurd conditions). The Select button is a `ForcefieldButton` with `onDodge={() => bumpFrustration(3)}`. On click, show `<FireTransition onDone={next} />`.
**Done when:** selecting the flight requires sneaking up on the button, then fire, then Stage 06.

### - [x] Task 6: Stage 06: seat map
Build `Seat.jsx`: a grid seat map (rows 1-30, A-F, business rows 1-3). Hovering an available seat sometimes makes it jump to another spot or turn occupied. Window seats (A/F) add a "Window Appreciation Fee" via `addFee()`. On confirm, `updateBooking({ seat: { code, cls, window } })` and `next()`.
**Done when:** you can eventually pick a seat and it shows up in `booking.seat`, with the fee added for windows.

### - [x] Task 7: Stage 06: random darkness
Every 10-20 seconds the cabin "lights go out" for a few seconds: wrap the seat map in SYOS's `<Flashlight on={dark}>`. If SYOS's component isn't ready yet, use a simple black overlay and switch later.
**Done when:** the seat map goes dark at random and the flashlight still lets you pick seats.

### - [x] Task 8: Stage 09: review summary
Build `Review.jsx`: itinerary summary from `booking` (route, flight, seat, passenger name, extras, fees). Fetch `getQuote(booking)` and show the line items and total. Save it with `updateBooking({ quote })`.
**Done when:** Stage 09 shows a clear summary that matches what was entered earlier.

### - [ ] Task 9: Stage 09: Terms & Punishments
Load `getTerms()` into a fixed-height scroll box. Measure scroll speed: scrolling too fast resets it to the top ("Please read responsibly"). The "I agree" checkbox only enables after reaching the bottom slowly. `bumpFrustration` on each reset.
**Done when:** you can only agree by scrolling slowly to the very end.

### - [ ] Task 10: Stage 09: agree → Ka-chow
Checking "I agree" + Continue plays `<KachowTransition onDone={next} />` and goes to Stage 10.
**Done when:** Stage 09 ends with the Ka-chow transition into Payment.
