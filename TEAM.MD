# WhAtEvErTsIs — Team Plan

**Malfunction hackathon pitch:** a seemingly normal airline website for booking a ₱1 flight, where every one of the 12 booking steps fights back. Survive all 12, get a "Confirmed-ish" e-ticket and the title **Certified Survivor**, then discover Manage Booking loops you back to the start. (Full concept: `MalFunction.pdf`.)

**Stack:** React 19 + Vite (frontend, already set up) and a tiny Node/Express API in `server/` (DIN). No database: JSON file / in-memory. Fake data only.

## How to run
```bash
npm install            # once, in the project root
npm run dev            # frontend → http://localhost:5173
cd server && npm install && npm run dev   # backend → http://localhost:3001 (second terminal)
```
Jump straight to your stage while developing: `http://localhost:5173/?stage=7`. Add `&demo` for shorter timers.
The frontend works even if the server is off (the API client falls back to mock data).

## Who owns what

| Dev | Role | Stages | Shared pieces they own |
|---|---|---|---|
| **KYLE** | Lead, app shell, integration, demo | 01 Welcome (+ Shea ad), 12 Manage Booking | `src/app/`, `src/context/`, `src/stages/index.js`, `src/components/layout/`, `App.jsx`, `README.md` |
| **SYOS** | Forms and verification | 02 Login, 03 Search, 07 Passenger | `components/captcha/Captcha.jsx`, `components/flashlight/Flashlight.jsx` |
| **RICKS** | Movement, transitions | 05 Select Flight, 06 Seat, 09 Review | `components/forcefield/ForcefieldButton.jsx`, `components/transitions/` |
| **DAR** | Chaos on every page | 04 Flights (+ minigame), 08 Extras | `components/chaos/` (Airlper, HeeHee, SlowImage, AdPopup, ChaosLayer) |
| **DIN** | **Backend** + checkout | 10 Payment, 11 Confirmation | `server/`, `src/api/`, `vite.config.js` (proxy) |

**Rule of thumb:** only edit files you own. Each stage lives in its own folder `src/stages/NN-Name/` with its own `.css`. Need a change in someone else's file? Ask them. Assets: add new files under `src/assets/<audios|images|videos>/`, never rename or delete existing ones.

## Shared contracts (don't change these without telling the people who use them)

### Shared booking state: `useBooking()` (KYLE)
```js
import useBooking from "../../context/useBooking.js";
const { stage, next, back, goTo, booking, updateBooking, addFee, frustration, bumpFrustration, loopCount, resetBooking, demoMode } = useBooking();
```
- `next()` go to next stage · `goTo(n)` jump · `resetBooking()` wipe and return to stage 1 (counts a loop)
- `updateBooking({ seat: {...} })` merge fields · `addFee("Window Appreciation Fee", 299)` add a surprise fee
- `bumpFrustration(5)` raise the meter whenever you annoy the user · `demoMode` true when URL has `?demo`
- `booking` fields: `user, search, flight, seat, passenger, extras, fees, quote, reference, survivor` (see `src/context/bookingContext.js`)

### Components
| Component | Owner | Used by | Props |
|---|---|---|---|
| `Captcha` | SYOS | SYOS, DIN | `onPass`, `onFail`, `chain` (how many in a row) |
| `Flashlight` | SYOS | SYOS, RICKS | `on`, `radius`, `children` |
| `ForcefieldButton` | RICKS | RICKS, DIN | like `<button>` + `onDodge`, `maxSpeed` |
| `FireTransition`, `KachowTransition` | RICKS | RICKS | `onDone` |
| `SlowImage` | DAR | DAR, anyone | `src`, `duration`, `maxOpacity` |
| `AdPopup` | DAR | DAR, KYLE | `open`, `onClose` |

### API client: `src/api/client.js` (DIN)
`searchFlights(search)`, `getTerms()`, `getQuote(booking)`, `createBooking(booking)`, `getBooking(ref)`, `cancelBooking(ref)`. All async.

## Data flow through the stages
01 → 02 sets `user` → 03 sets `search` → 04 calls `searchFlights`, sets `flight` → 05 confirms flight → 06 sets `seat` (+ fees) → 07 sets `passenger` → 08 sets `extras` → 09 calls `getTerms`/`getQuote`, sets `quote` → 10 calls `createBooking`, sets `reference` → 11 sets `survivor` → 12 Modify/Cancel → back into the loop.

## Suggested timeline (adjust to your hackathon length)
1. **First hour:** everyone does task 1–2 of their file. KYLE wires the shell, DIN gets the server up.
2. **Middle:** core stage tasks. Merge often, small commits, one branch per person (`kyle/...`, `syos/...`).
3. **Last 2 hours:** feature freeze, KYLE's integration pass, everyone fixes their own bugs, rehearse the demo with `?demo`.

## Safety (keep the joke a joke)
Fake payments only, never ask for or store real card numbers. Camera stays in the browser, nothing is uploaded or saved. Every sound must be skippable or mutable so the demo can't get stuck.
