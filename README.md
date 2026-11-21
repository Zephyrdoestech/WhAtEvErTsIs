# WhAtEvErTsIs (Bahala Na Air)

A perfectly normal airline website where you book a **₱1 flight**. Every one of the 12 booking steps fights back: an unskippable ad, CAPTCHAs that never end, a Select button that runs away from your cursor, seats that move, terms you must scroll *slowly*, and fees that keep appearing. Survive all 12 and you get a "Confirmed-ish" e-ticket and the title **Certified Survivor**. Then Manage Booking loops you back to the start.

Built for the Malfunction hackathon. Fictional airline, fake data, fake payments: nothing is really booked or charged, and the camera never uploads or records. Use made-up names only (see [What gets stored](#what-gets-stored)).

## Run it

You need [Node.js](https://nodejs.org) 22 or newer (Vite 8 needs it).

```bash
git clone https://github.com/Zephyrdoestech/WhAtEvErTsIs.git
cd WhAtEvErTsIs

# Terminal 1: website → http://localhost:5173
npm install
npm run dev

# Terminal 2: API → http://localhost:3001 (recommended; without it the site falls back to mock data)
cd server
npm install
npm run dev
```

Useful URLs:

| URL | What it does |
|---|---|
| `http://localhost:5173/?demo` | **Demo mode:** shortens every timer (ad, holds, popups) for a live presentation |
| `http://localhost:5173/?stage=7` | Open stage 7 directly; save the passenger form to reach the airplane pose and camera check |
| `http://localhost:5173/?stage=12&demo` | Combine both |

## The 12 stages

| # | Stage | What goes wrong | Built by |
|---|---|---|---|
| 01 | Welcome | The Shea ad first (Skip exists for 5 seconds only), then the ₱1 promo with a very long asterisk | Kyle |
| 02 | Login / Sign Up | Log in, register or "guest": every road leads to more CAPTCHAs | Precious |
| 03 | Search Flights | Every destination becomes "Piliin Mo ang Pilipinas"; dark mode turns your cursor into a flashlight | Precious |
| 04 | View Flights | "Suspiciously cheap flights" load slowly; dodge luggage in a minigame (with Subway Surfers playing beside it) while you wait | Darryll |
| 05 | Select Flight | Absurd fare conditions; the Select button has a forcefield and runs away | Ricksmer |
| 06 | Choose Seat | Seat map with ₱299 window seats; random darkness | Ricksmer |
| 07 | Passenger Details | Birthday by slider; camera "airplane pose" check (nothing is recorded or uploaded) | Precious |
| 08 | Add Extras | "Mandatory-optional" extras, already selected for you, with guilt trips | Darryll |
| 09 | Terms & Punishments | Scroll too fast and progress resets to 0%; agree and KA-CHOW | Ricksmer |
| 10 | Payment | Fees appear one by one (₱1 → ₱1,649.01); card number picked by shuffling digits; CAPTCHA #∞; hold Pay Now (mouse, touch or Space) for 10s, 3s in demo mode, while a forcefield pushes you away | Jon Vincent |
| 11 | Confirmation | "Confirmed-ish" e-ticket to ???, gate 404, Certified Survivor | Jon Vincent |
| 12 | Manage Booking | Modify sends you back to a random stage; Cancel asks "Are you sure?" 3-5 times; both loop you | Kyle |

On every page (except Stage 01, so the Shea ad plays undisturbed): the frustration meter (😊 → 💀), Ye Olde Airlper (a chatbot that forgets your name), pop-up ads, "hee hee", occasional flashbangs, brownouts and Lightning McQueen driving past. Press **Esc** during a brownout to turn the lights back on; every popup can be closed. Devices set to *reduce motion* get no flashbangs or brownouts.

**Feature switchboard:** open `http://localhost:5173/controller` to turn any chaos feature on or off, including **Master Sound Mute**, which silences every chaos sound (hee hee, flashbang, KA-CHOW, the forcefield dodge and the fire whoosh). Settings are saved in that browser.

## 2-minute demo route

Open `http://localhost:5173/?demo` on the presenting laptop, with the API running, sound on and other tabs closed. If the room is loud, open `/controller` in another tab and switch on **Master Sound Mute**.

| Time | Do this | Say this |
|---|---|---|
| 0:00 | Page loads → the Shea ad. Don't skip: in demo mode it ends by itself after 5s (in normal mode Skip vanishes at 5s and the ad runs 20s). | "A normal airline. ₱1 flights. Let's book one." |
| 0:08 | Point at the ₱1 promo and the tiny asterisk. Click **Book Now**. | "The asterisk is doing a lot of work." |
| 0:12 | Stage 02: continue as guest → CAPTCHA. | "Verification. Lots of it." |
| 0:25 | Stage 03: pick a destination, watch it become "Pilipinas". Flip dark mode for the flashlight. | "We know best." |
| 0:35 | Stage 04: flights loading → dodge two pieces of luggage → pick BN 101. | |
| 0:45 | Stage 05: chase the Select button. | "It has a forcefield." |
| 0:55 | Stage 06: grab a seat. Stage 07: slide to a birthday, strike the airplane pose, pass the "are you human?" CAPTCHA. Stage 08: accept the extras. | Point at the frustration meter. |
| 1:15 | Stage 09: scroll the terms too fast → progress resets. Agree → KA-CHOW. | "Scroll slowly. No, slower." |
| 1:25 | Stage 10: watch the fees pile up; shuffle the card digits; hold Pay Now for 3s (demo mode). | "Your ₱1 flight is now ₱1,649.01." |
| 1:45 | Stage 11: e-ticket, Certified Survivor badge in the header. | "You survived. Unfortunately." |
| 1:50 | Stage 12: **Cancel** → "Are you sure?" × 3-5 → "Book again?" → back to Stage 01. Loop counter goes up. | "And that's the loop. Thank you!" |

**If something breaks live:** use the DEV dropdown (top-left, dev server only) or type `?stage=N&demo` in the address bar to skip ahead and keep talking.

## What gets stored

- **Browser:** the booking lives in memory only; reloading the page wipes it.
- **API server:** bookings made with the server running are saved to `server/data/db.json` on the machine running the server (git-ignored), so Manage Booking can look them up. Only the flight, seat, extras, fees, quote and the passenger's first and last name are sent; email, phone and passport fields never leave the browser. Clear it with `curl -X POST http://localhost:3001/api/reset`.
- **Camera (Stage 07):** processed in the browser only; nothing is recorded, uploaded or saved.

## Project layout

```
src/
  app/          AppShell: marquee, header, link bar, ticker, footer
  context/      useBooking(): shared booking state for every stage
  stages/       one folder per stage (01-Welcome … 12-ManageBooking)
  components/   layout (meter, progress), captcha, flashlight, forcefield, transitions, chaos
  api/          client.js: the only place that talks to the server (mock fallback)
server/         Node + Express API (flights, quote, terms, bookings); endpoints in server/README.md
docs/           team GitHub rules, design references (docs/references)
roles/          each developer's task list
```

Team rules and shared contracts: [TEAM.MD](TEAM.MD). Design guide: [docs/references](docs/references/README.md).

## Team

| Name | Role |
|---|---|
| Kyle Angelo C. Castro | Team lead: app shell, booking state, Stage 01 Welcome + Shea ad, Stage 12 Manage Booking, integration |
| Precious Ann S. Tolentino | Forms and verification: Stages 02, 03, 07; CAPTCHA; Flashlight |
| Ricksmer F. Cabatingan | Movement and transitions: Stages 05, 06, 09; ForcefieldButton; KA-CHOW and fire transitions |
| Darryll B. Eral | Chaos on every page: Stages 04, 08; Ye Olde Airlper, HeeHee, pop-up ads |
| Jon Vincent F. Din | Backend (Node + Express) and checkout: Stages 10, 11 |

*Bahala Na Air is not a real airline. Please do not try to fly with it.*
