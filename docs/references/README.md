# Design references

Screens from our Figma file: https://www.figma.com/design/UGLHIWCFOB4ME5VZvI7Iet/Untitled?node-id=2-2

| File | Shows |
|---|---|
| `01-flights-seat-dark-mode.png` | Stages 03–06: search, flights table, seat map, flashlight dark mode |
| `02-welcome-login-ad.png` | Stages 01–02: ₱1 promo, login + CAPTCHA, Shea ad, Airlper, cookie bar |
| `03-terms-payment-kachow.png` | Stages 09–10: terms, payment, KA-CHOW transition, "are you sure" popups |
| `04-confirmation-survivor.png` | Stage 11: e-ticket and Certified Survivor |

## Using the look in your stage

The app shell (red marquee, blue header, link bar, news ticker, footer) is already done. Inside your stage, use the shared pieces from `src/index.css`:

- **Colours / fonts:** `var(--blue)`, `--red`, `--yellow`, `--purple`, `--green`, `--lavender`, `--grey`, `--page`; `var(--font-display)` (Bangers, for big titles) and `var(--font-body)` (Comic Neue).
- **Panels:** `<section class="panel"><h2 class="panel-title">PAYMENT - Step 10 of 12</h2><div class="panel-body">…</div></section>`. Title colours: default blue, or add `purple` / `red`.
- **Buttons:** `class="btn"` (grey), `btn go` (green), `btn warn` (yellow).
- **Big comic text:** `class="display"`.

## Mobile-friendly rules

1. Design for a 360px-wide phone first, then add `@media (min-width: 720px)` for side-by-side layouts.
2. Never cause sideways page scroll: no fixed widths over 320px; use `max-width: 100%` or `%`/`fr`.
3. Wide tables (flights): wrap them in a `<div style="overflow-x:auto">`.
4. Tap targets at least 36px tall; don't rely on hover alone (phones have no cursor, so flashlight/forcefield also need a touch fallback).
5. Popups and ads must fit the screen: `width: min(90vw, 480px)` and keep the close/skip button on screen.
