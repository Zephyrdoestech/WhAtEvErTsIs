# DAR.MD — Chaos on every page: Airlper, sounds, popups, Stages 04 and 08

> ## 🤖 Rules for any AI assistant reading this file
> 1. You are helping **DAR**. Work only on the tasks in this file. Read `TEAM.MD` first for the shared contracts.
> 2. **Do ONE task at a time.** Pick the first unchecked task (`- [ ]`) unless DAR names a different one.
> 3. When the task is done: tick its box (`- [x]`), give a short summary of what changed and how to test it, then **STOP and wait** for DAR. Do not start the next task on your own.
> 4. Only do more than one task if DAR explicitly asks (for example "do tasks 3 to 5" or "do all remaining tasks").
> 5. Only edit the files DAR owns (listed below). If a task needs a change in someone else's file, stop and say who owns it and what to ask them for.
> 6. Don't add new npm packages unless the task says so. Don't change a shared contract in `TEAM.MD` without telling DAR who it affects.
> 7. Keep it demo-safe: fake data only, no real payments, nothing from the camera is uploaded or saved, and every sound or popup can be skipped or muted.

**Test your stage:** `npm run dev`, then open `http://localhost:5173/?stage=N` (add `&demo` for short timers).

## Files you own
- `src/components/chaos/` (ChaosLayer, Airlper, HeeHee, SlowImage, AdPopup, any minigame component)
- `src/stages/04-Flights/`, `src/stages/08-Extras/`
- New sound/image files you add, e.g. `src/assets/audios/hee-hee.mp3` (existing files like `court-jester-dancing.png`, `Pou Nah Sound Effect.mp3`, `metal pipe falling sound effect.mp3` are free to use)

## You depend on / others depend on you
- `ChaosLayer` is rendered by KYLE's AppShell on every page, so it must never crash or block the whole app.
- Others may use your `<SlowImage>` and `<AdPopup>`; keep their props stable.
- Stage 04 reads `booking.search` (from SYOS) and calls DIN's `searchFlights()`; it writes `booking.flight` for RICKS's Stage 05.

## Roadmap
### - [x] Task 1: Ye Olde Airlper v1
Build `Airlper.jsx`: a floating helper with the transparent Jose Mari Chan cutout cycling through screen-edge positions on both sides. Every five seconds it shows a different stage-appropriate Old English line from `chaos/airlperLines.js`; minimizing hides the speech bubble while the face keeps peeking.
**Done when:** the Airlper appears on every page, cycles across both screen sides, changes its line on schedule, and remains reopenable when minimized.

### - [x] Task 2: Airlper forgets everything
Add a tiny chat to Airlper: it asks the user's name, accepts an answer, thanks them, then after a few seconds asks the same question again. It reads `booking` and gets details wrong on purpose (for example, guessing the destination is Narnia).
**Done when:** the Airlper accepts chat answers, thanks the user, repeats its question, and misremembers available booking details.

### - [x] Task 3: HeeHee sound cue
Build `HeeHee.jsx`: at random intervals (about 45-90s, or 20s in `demoMode`) play a "hee-hee!" sound (add the file) and briefly shake the page. Add a small 🔇 mute toggle in the ChaosLayer that mutes all chaos sounds.
**Done when:** the sound fires at random, the page shakes, and mute stops it.

### - [x] Task 4: SlowImage
Build `SlowImage.jsx`: a fixed overlay image that fades from 0 to `maxOpacity` over `duration` ms. Clicking it dismisses it, but it comes back later. Add it to `ChaosLayer` using a random image from `src/assets/images/` (start with `court-jester-dancing.png`).
**Done when:** an image slowly creeps over the screen and keeps coming back.

### - [x] Task 5: AdPopup
Build `AdPopup.jsx`: a fake surprise ad ("HOT SINGLES IN YOUR SEAT ROW" style but clean: "Hot Pandesal in Your Area!"). The close ✕ is tiny, moves once when hovered, and sometimes opens a second ad. Props: `open`, `onClose`.
**Done when:** `<AdPopup open onClose={...} />` shows an annoying but closable ad.

### - [x] Task 6: Stage 04: flight results
Build `Flights.jsx`: call `searchFlights(booking.search)` and render flight cards (airline, times, price). Prices look suspiciously cheap; each card has fine print with absurd conditions (from the API, plus your own extras). Clicking a card: `updateBooking({ flight })` and `next()`.
**Done when:** Stage 04 lists flights for the search, and picking one moves to Stage 05 with `booking.flight` set.

### - [x] Task 7: Stage 04: loading minigame
Before results show, a fake 8-10s loading screen (3s in `demoMode`) with a tiny original endless-runner: a little plane in 3 lanes dodging luggage, arrow keys or swipe to move. Meanwhile a `SlowImage` fades in. Results appear when loading ends, even mid-game.
**Done when:** the minigame is playable during loading and the results always appear afterwards.

### - [x] Task 8: Stage 08: extras menu
Build `Extras.jsx`: add-ons with prices: Checked Baggage, Meal, Travel Insurance, "Breathing Privileges", "Emotional Support Fee", "Armrest Rights", "Gravity Insurance". Selected ones go into `updateBooking({ extras })`.
**Done when:** selected extras are saved in `booking.extras`.

### - [x] Task 9: Stage 08: guilt trips
Unticking an extra or pressing "No thanks" triggers guilt-inducing confirm dialogs (custom modals, not `window.confirm`): "Are you sure you don't want to breathe?" → "Your lungs will remember this." Sometimes an `AdPopup` appears instead. Continue → `next()`.
**Done when:** declining anything causes guilt dialogs or ads, and the user can still continue.

### - [x] Task 10: Chaos tuning
Play through all 12 stages with the chaos on. Make sure nothing covers buttons permanently, nothing stacks forever, and `demoMode` keeps it lively but short. Give KYLE a list of anything that clashes with other stages.
**Done when:** a full run is chaotic but always finishable.
