# WhAtEvErTsIs (Bahala Na Air)

A perfectly normal airline website where you book a **₱1 flight**. Every one of the 12 booking steps fights back: an unskippable ad, CAPTCHAs that never end, a Select button that runs away from your cursor, seats that move, terms you must scroll *slowly*, and fees that keep appearing. Survive all 12 and you get a "Confirmed-ish" e-ticket and the title **Certified Survivor**. Then Manage Booking loops you back to the start.

Built for the Malfunction hackathon. Fictional airline, fake data, fake payments. Nothing is booked, charged, uploaded or saved.

## Run it

You need [Node.js](https://nodejs.org) 22 or newer (Vite 8 needs it).

```bash
git clone https://github.com/Zephyrdoestech/WhAtEvErTsIs.git
cd WhAtEvErTsIs

# Terminal 1: website → http://localhost:5173
npm install
npm run dev

# Terminal 2: API → http://localhost:3001 (optional: the site falls back to mock data without it)
cd server
npm install
npm run dev
```

Useful URLs:

| URL | What it does |
|---|---|
| `http://localhost:5173/?demo` | **Demo mode:** shortens every timer (ad, holds, popups) for a live presentation |
| `http://localhost:5173/?stage=7` | Jump straight to stage 7 (any number 1-12) |
| `http://localhost:5173/?stage=12&demo` | Combine both |

In development there's also a **DEV: jump to** dropdown in the top-left corner. It doesn't appear in the production build (`npm run build`).

## The 12 stages

| # | Stage | What goes wrong | Built by |
|---|---|---|---|
| 01 | Welcome | ₱1 promo, then the Shea ad (Skip exists for 5 seconds only) | Kyle |
| 02 | Login / Sign Up | CAPTCHAs, camera "airplane pose" verification | Precious |
| 03 | Search Flights | Destination auto-corrects to the Philippines; dark mode = flashlight cursor | Precious |
| 04 | View Flights | Flights load forever (with a minigame while you wait) | Darryll |
| 05 | Select Flight | The Select button has a forcefield and dodges you | Ricksmer |
| 06 | Choose Seat | Seats move; random darkness | Ricksmer |
| 07 | Passenger Details | More verification, pose check | Precious |
| 08 | Add Extras | Extras you didn't ask for | Darryll |
| 09 | Review Booking | Terms & Punishments: scroll too fast and progress resets; KA-CHOW | Ricksmer |
| 10 | Payment | Fees appear one by one; card number entered backwards; hold to pay | Jon Vincent |
| 11 | Confirmation | "Confirmed-ish" e-ticket and the Certified Survivor badge | Jon Vincent |
| 12 | Manage Booking | Modify sends you back; Cancel asks "Are you sure?" 3-5 times; both loop you | Kyle |

On every page: the frustration meter (😊 → 💀), Ye Olde Airlper (a chatbot that forgets you), pop-up ads and sounds. Every sound can be muted and every popup closes.

## 2-minute demo route

Open `http://localhost:5173/?demo` on the presenting laptop with sound on. Close other tabs.

| Time | Do this | Say this |
|---|---|---|
| 0:00 | Page loads → the Shea ad starts. Let the Skip button vanish. | "A normal airline. ₱1 flights. Let's book one." Frustration meter goes up. |
| 0:10 | Ad ends → point at the ₱1 promo and the tiny asterisk. Click **Book Now**. | "The asterisk is doing a lot of work." |
| 0:15 | Stage 02: try the CAPTCHA, do the airplane pose. | "Verification. Lots of it." |
| 0:30 | Stage 03: search; watch the destination auto-correct; flashlight dark mode. | |
| 0:40 | Stage 04: flights loading; play the minigame for a second. | |
| 0:50 | Stage 05: chase the Select button. | "It has a forcefield." |
| 1:00 | Stage 06-08: quick seat pick (it moves), passenger details, extras. | Point at the frustration meter. |
| 1:15 | Stage 09: scroll the terms too fast → progress resets. Agree → KA-CHOW. | |
| 1:30 | Stage 10: watch the fees pile up; pay. | "Your ₱1 flight is now ₱1,649.01." |
| 1:40 | Stage 11: e-ticket, Certified Survivor badge in the header. | "You survived. Unfortunately." |
| 1:50 | Stage 12: click **Cancel** → "Are you sure?" × 3-5 → "Book again?" → back to Stage 01. Loop counter goes up. | "And that's the loop. Thank you!" |

**If something breaks live:** use the DEV dropdown (or `?stage=N&demo` in the address bar) to skip to the next stage and keep talking.

## Project layout

```
src/
  app/          AppShell: marquee, header, link bar, ticker, footer
  context/      useBooking(): shared booking state for every stage
  stages/       one folder per stage (01-Welcome … 12-ManageBooking)
  components/   layout (meter, progress), captcha, flashlight, forcefield, transitions, chaos
  api/          client.js: the only place that talks to the server (mock fallback)
server/         Node + Express API (flights, quote, terms, bookings)
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
