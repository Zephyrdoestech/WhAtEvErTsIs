# SYOS.MD — Forms and verification: Stages 02, 03, 07, CAPTCHA, Flashlight

> ## 🤖 Rules for any AI assistant reading this file
> 1. You are helping **SYOS**. Work only on the tasks in this file. Read `TEAM.MD` first for the shared contracts.
> 2. **Do ONE task at a time.** Pick the first unchecked task (`- [ ]`) unless SYOS names a different one.
> 3. When the task is done: tick its box (`- [x]`), give a short summary of what changed and how to test it, then **STOP and wait** for SYOS. Do not start the next task on your own.
> 4. Only do more than one task if SYOS explicitly asks (for example "do tasks 3 to 5" or "do all remaining tasks").
> 5. Only edit the files SYOS owns (listed below). If a task needs a change in someone else's file, stop and say who owns it and what to ask them for.
> 6. Don't add new npm packages unless the task says so. Don't change a shared contract in `TEAM.MD` without telling SYOS who it affects.
> 7. Keep it demo-safe: fake data only, no real payments, nothing from the camera is uploaded or saved, and every sound or popup can be skipped or muted.

**Test your stage:** `npm run dev`, then open `http://localhost:5173/?stage=N` (add `&demo` for short timers).

## Files you own
- `src/components/captcha/` (Captcha component + its question bank)
- `src/components/flashlight/` (Flashlight dark-mode component)
- `src/stages/02-Login/`, `src/stages/03-Search/`, `src/stages/07-Passenger/`

## You depend on / others depend on you
- **DIN** uses your `<Captcha onPass onFail chain />` on Stage 10. Keep those props working.
- **RICKS** uses your `<Flashlight on radius>` for the dark seat map on Stage 06.
- You write `booking.user`, `booking.search`, `booking.passenger` with `updateBooking()` (KYLE's context). DAR's Stage 04 reads `booking.search`.

## Roadmap
### - [x] Task 1: CAPTCHA v1
Build `Captcha.jsx`: a fake image-grid CAPTCHA ("Select all squares with airplanes") using emoji or simple images. The correct answer is absurd (for example the only correct square is the one with a cloud shaped like a plane). Keep a question bank in `components/captcha/questions.js`. Call `onPass()` on success, `onFail()` and `bumpFrustration(5)` on failure, with a new question each time.
**Done when:** `<Captcha onPass={...} />` renders a working, silly CAPTCHA you can pass and fail.

### - [x] Task 2: CAPTCHA chaining and variants
Support `chain={n}`: after passing one, the next one appears ("Great! Now verify you verified."). Add at least 3 more variants: nonsense math ("What is 7 + Tuesday?"), wobbly-text typing, and "Are you a robot? Yes / No" where the first answer is always wrong. Keep the props contract unchanged.
**Done when:** `<Captcha chain={3} />` makes the user solve 3 different CAPTCHAs before `onPass` fires.

### - [x] Task 3: Stage 02: login page UI
Build `Login.jsx` with three tabs: Log in, Register, Continue as Guest. Fake fields only (no real auth). Looks like a normal airline login.
**Done when:** Stage 02 looks believable and all three tabs show their forms.

### - [x] Task 4: Stage 02: no escape
Every path needs verification: Register → `<Captcha chain={2} />`, Log in → `<Captcha />` then "Account not found, please register", Guest → "Guests must also prove they exist" → `<Captcha />`. On success `updateBooking({ user: { mode, name } })` and `next()`.
**Done when:** every route through Stage 02 ends in CAPTCHAs and then reaches Stage 03.

### - [x] Task 5: Stage 03: search form
Build `Search.jsx`: origin, destination, depart/return dates, passenger count, Search button. Keep an airport list in `03-Search/airports.js` with a `domestic: true/false` flag (MNL, CEB, DVO, ILO, TAG ... plus a few international ones). On search, `updateBooking({ search })` and `next()`.
**Done when:** a search saves `booking.search` and moves to Stage 04.

### - [x] Task 6: Stage 03: "Piliin Mo ang Pilipinas"
If the destination is international, interrupt with a patriotic tourism modal: big button "Piliin ang Pilipinas!" swaps the destination to a random domestic one; the "Continue abroad" button is tiny and wanders. Allow them abroad after 3 tries, with `bumpFrustration`.
**Done when:** choosing an international destination always triggers the modal at least once.

### - [ ] Task 7: Flashlight component + Stage 03 dark mode
Build `Flashlight.jsx`: when `on`, cover its children with a black overlay and cut a circle (CSS `radial-gradient` mask) around the cursor. Add a "🌙 Dark Mode" toggle to Stage 03 that turns the form pitch black except the flashlight.
**Done when:** dark mode makes the page black and only the area around the cursor is visible. Tell RICKS it's ready.

### - [ ] Task 8: Stage 07: passenger form
Build `Passenger.jsx`: first/last name, birthday, nationality, email, phone, passport number (any fake value). Light validation with silly error messages ("Name too name-like").
**Done when:** filling the form saves `booking.passenger`.

### - [ ] Task 9: Stage 07: camera pose check
Add a "voluntary" camera step: `navigator.mediaDevices.getUserMedia({ video: true })` shows a live preview only (never upload or save frames). Prompt "Strike your best airplane pose ✈", 3-2-1 countdown, then fake analysis messages ("Wingspan: inadequate... Accepted anyway"). If the camera is denied or missing: "Your refusal has been noted. Pose anyway." and continue. Stop the camera stream when leaving.
**Done when:** the pose check works with and without a camera, and the camera light turns off after.

### - [ ] Task 10: Stage 07: are you human?
After the pose check, show `<Captcha />` with the question "Despite the pose, are you human?". On pass, `next()`.
**Done when:** Stage 07 runs form → pose → CAPTCHA → Stage 08.
