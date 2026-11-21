// OWNER: RICKS — see RICKS.MD (Stage 06: Choose Seat)
import { useEffect, useMemo, useRef, useState } from "react";
import useBooking from "../../context/useBooking.js";
import Flashlight from "../../components/flashlight/Flashlight.jsx";
import "./Seat.css";

const ROWS = Array.from({ length: 30 }, (_, i) => i + 1);
const LEFT_COLS = ["A", "B", "C"];
const RIGHT_COLS = ["D", "E", "F"];
const ALL_COLS = [...LEFT_COLS, ...RIGHT_COLS];
const BUSINESS_MAX_ROW = 3;
const WINDOW_FEE_LABEL = "Window Appreciation Fee";
const WINDOW_FEE_AMOUNT = 299;
const MIN_AVAILABLE_SEATS = 15;
const HOVER_COOLDOWN_MS = 180;
const FLASHLIGHT_RADIUS = 130;
// Temporary local fallback while SYOS's Flashlight.jsx is still a stub.
const USE_LOCAL_DARK_FALLBACK = true;

function isWindowCol(col) {
  return col === "A" || col === "F";
}

function getSeatPositionLabel(col) {
  if (col === "A" || col === "F") return "Window";
  if (col === "C" || col === "D") return "Aisle";
  return "Middle";
}

function createInitialSeats() {
  const seats = {};
  for (const row of ROWS) {
    for (const col of ALL_COLS) {
      const code = `${row}${col}`;
      // Deterministic mix (~45% initially occupied) so both cabins have plenty of open seats
      const hash = (row * 37 + col.charCodeAt(0) * 17) % 11;
      seats[code] = {
        code,
        row,
        col,
        cls: row <= BUSINESS_MAX_ROW ? "business" : "economy",
        window: isWindowCol(col),
        status: hash < 5 ? "occupied" : "available",
      };
    }
  }
  return seats;
}

export default function Seat() {
  const { booking, updateBooking, addFee, bumpFrustration, back, next, demoMode } = useBooking();

  const [seats, setSeats] = useState(createInitialSeats);
  const [selectedCode, setSelectedCode] = useState(booking.seat?.code ?? null);
  const [jumpedCode, setJumpedCode] = useState(null);
  const [dark, setDark] = useState(false);
  const [beamPos, setBeamPos] = useState({ x: 240, y: 240 });
  const [statusMessage, setStatusMessage] = useState(
    "Pick any available seat on board. Good luck catching one."
  );

  const lastMischiefAtRef = useRef(0);
  const jumpHighlightTimerRef = useRef(null);
  const seatMapShellRef = useRef(null);

  useEffect(
    () => () => {
      if (jumpHighlightTimerRef.current) {
        window.clearTimeout(jumpHighlightTimerRef.current);
      }
    },
    []
  );

  // Random cabin blackout every 10-20s (4-7s in demoMode) lasting a few seconds.
  useEffect(() => {
    let timerId = null;
    let cancelled = false;

    function scheduleNextBlackout() {
      const waitMs = demoMode
        ? 4000 + Math.random() * 3000
        : 10000 + Math.random() * 10000;

      timerId = window.setTimeout(() => {
        if (cancelled) return;
        setDark(true);
        setStatusMessage("⚡ Cabin power outage! Use your flashlight to find a seat.");
        bumpFrustration(2);

        const darkDurationMs = demoMode
          ? 3000 + Math.random() * 1500
          : 4000 + Math.random() * 2500;

        timerId = window.setTimeout(() => {
          if (cancelled) return;
          setDark(false);
          setStatusMessage("💡 Backup generator kicked in. Cabin lights restored (for now).");
          scheduleNextBlackout();
        }, darkDurationMs);
      }, waitMs);
    }

    scheduleNextBlackout();
    return () => {
      cancelled = true;
      if (timerId) window.clearTimeout(timerId);
    };
  }, [bumpFrustration, demoMode]);

  function handleMapPointerMove(event) {
    const shell = seatMapShellRef.current;
    if (!shell) return;
    const rect = shell.getBoundingClientRect();
    setBeamPos({
      x: Math.round(event.clientX - rect.left),
      y: Math.round(event.clientY - rect.top),
    });
  }

  const selectedSeat = selectedCode ? seats[selectedCode] : null;

  const availableCount = useMemo(
    () => Object.values(seats).filter((s) => s.status === "available").length,
    [seats]
  );

  function triggerJumpHighlight(code) {
    setJumpedCode(code);
    if (jumpHighlightTimerRef.current) {
      window.clearTimeout(jumpHighlightTimerRef.current);
    }
    jumpHighlightTimerRef.current = window.setTimeout(() => {
      setJumpedCode(null);
    }, 900);
  }

  function handleSeatHover(code) {
    const seat = seats[code];
    if (!seat || seat.status !== "available" || code === selectedCode) return;

    const now = performance.now();
    if (now - lastMischiefAtRef.current < HOVER_COOLDOWN_MS) return;

    const mischiefChance = demoMode ? 0.35 : 0.52;
    if (Math.random() > mischiefChance) return;

    lastMischiefAtRef.current = now;

    // Decide whether the seat jumps to another spot or turns occupied
    const occupiedCodes = Object.keys(seats).filter(
      (k) => seats[k].status === "occupied" && k !== code
    );
    const shouldJump = occupiedCodes.length > 0 && (availableCount <= MIN_AVAILABLE_SEATS || Math.random() < 0.5);

    if (shouldJump) {
      const targetCode = occupiedCodes[Math.floor(Math.random() * occupiedCodes.length)];
      setSeats((prev) => ({
        ...prev,
        [code]: { ...prev[code], status: "occupied" },
        [targetCode]: { ...prev[targetCode], status: "available" },
      }));
      triggerJumpHighlight(targetCode);
      setStatusMessage(`Seat ${code} panicked and jumped over to ${targetCode}!`);
      bumpFrustration(2);
      return;
    }

    if (availableCount > MIN_AVAILABLE_SEATS) {
      setSeats((prev) => ({
        ...prev,
        [code]: { ...prev[code], status: "occupied" },
      }));
      setStatusMessage(`Seat ${code} was just snatched by another passenger 0.003s ago.`);
      bumpFrustration(2);
    }
  }

  function handleSeatClick(code) {
    const seat = seats[code];
    if (!seat || seat.status !== "available") return;
    setSelectedCode(code);
    if (seat.window) {
      setStatusMessage(
        `Selected ${code} (${seat.cls}, Window). A ₱${WINDOW_FEE_AMOUNT} ${WINDOW_FEE_LABEL} applies.`
      );
    } else {
      setStatusMessage(`Selected ${code} (${seat.cls}, ${getSeatPositionLabel(seat.col)}).`);
    }
  }

  function handleConfirm() {
    if (!selectedSeat) return;

    if (selectedSeat.window) {
      const alreadyCharged = booking.fees.some((fee) => fee.label === WINDOW_FEE_LABEL);
      if (!alreadyCharged) {
        addFee(WINDOW_FEE_LABEL, WINDOW_FEE_AMOUNT);
      }
    }

    updateBooking({
      seat: {
        code: selectedSeat.code,
        cls: selectedSeat.cls,
        window: selectedSeat.window,
      },
    });
    next();
  }

  function renderSeatButton(row, col) {
    const code = `${row}${col}`;
    const seat = seats[code];
    const isSelected = selectedCode === code;
    const isOccupied = seat.status === "occupied";
    const isBusiness = seat.cls === "business";
    const isJumped = jumpedCode === code;

    const className = [
      "seat-btn",
      isBusiness ? "seat-btn--business" : "seat-btn--economy",
      seat.window ? "seat-btn--window" : "",
      isOccupied ? "seat-btn--occupied" : "seat-btn--available",
      isSelected ? "seat-btn--selected" : "",
      isJumped ? "seat-btn--jumped" : "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        key={code}
        type="button"
        disabled={isOccupied}
        className={className}
        title={`${code} · ${isBusiness ? "Business" : "Economy"} · ${getSeatPositionLabel(col)}${
          seat.window ? ` (+₱${WINDOW_FEE_AMOUNT} Window Appreciation Fee)` : ""
        }`}
        aria-label={`Seat ${code}, ${isBusiness ? "business" : "economy"}, ${
          isOccupied ? "occupied" : isSelected ? "selected" : "available"
        }`}
        onMouseEnter={() => handleSeatHover(code)}
        onClick={() => handleSeatClick(code)}
      >
        {isOccupied ? "✕" : code}
      </button>
    );
  }

  return (
    <section className="seat-stage">
      <div className="seat-stage__top">
        <button type="button" className="seat-stage__back" onClick={back}>
          ← Back to Flight
        </button>
        <span className="seat-stage__count">{availableCount} seats left (allegedly)</span>
      </div>

      <header className="seat-stage__header">
        <h1 className="seat-stage__title">Choose Your Seat</h1>
        <p className="seat-stage__subtitle">
          Select an available seat in Business (Rows 1–3) or Economy (Rows 4–30).
        </p>
      </header>

      <div className="seat-stage__layout">
        <Flashlight on={dark} radius={FLASHLIGHT_RADIUS}>
          <div
            ref={seatMapShellRef}
            className={`seat-map-shell ${dark ? "seat-map-shell--dark" : ""}`}
            onMouseMove={handleMapPointerMove}
            onPointerMove={handleMapPointerMove}
          >
            {dark && (
              <div className="seat-blackout-banner" role="alert">
                ⚡ Cabin lights out — sweep your cursor to illuminate seats!
              </div>
            )}

            <div className="seat-legend">
              <span className="seat-legend__item">
                <span className="seat-legend__swatch seat-legend__swatch--business" /> Business (1–3)
              </span>
              <span className="seat-legend__item">
                <span className="seat-legend__swatch seat-legend__swatch--available" /> Economy
              </span>
              <span className="seat-legend__item">
                <span className="seat-legend__swatch seat-legend__swatch--selected" /> Selected
              </span>
              <span className="seat-legend__item">
                <span className="seat-legend__swatch seat-legend__swatch--occupied" /> Occupied
              </span>
            </div>

            <div className="seat-map__cabin">
              <div className="seat-map__nose" aria-hidden="true">
                ✈ FRONT OF AIRCRAFT
              </div>

              <div className="seat-map__col-headers" aria-hidden="true">
                {LEFT_COLS.map((c) => (
                  <span key={c} className={isWindowCol(c) ? "seat-map__col--window" : ""}>
                    {c}
                    {isWindowCol(c) ? " 🪟" : ""}
                  </span>
                ))}
                <span className="seat-map__aisle-label">Row</span>
                {RIGHT_COLS.map((c) => (
                  <span key={c} className={isWindowCol(c) ? "seat-map__col--window" : ""}>
                    {c}
                    {isWindowCol(c) ? " 🪟" : ""}
                  </span>
                ))}
              </div>

              <div className="seat-map__divider seat-map__divider--business">
                ✦ Business Class (Rows 1–3)
              </div>

              {ROWS.map((row) => (
                <div key={row}>
                  {row === BUSINESS_MAX_ROW + 1 && (
                    <div className="seat-map__divider">Economy Class (Rows 4–30)</div>
                  )}
                  <div
                    className={`seat-map__row ${
                      row <= BUSINESS_MAX_ROW ? "seat-map__row--business" : ""
                    }`}
                  >
                    {LEFT_COLS.map((col) => renderSeatButton(row, col))}
                    <span className="seat-map__row-num">{row}</span>
                    {RIGHT_COLS.map((col) => renderSeatButton(row, col))}
                  </div>
                </div>
              ))}
            </div>

            {USE_LOCAL_DARK_FALLBACK && dark && (
              <div
                className="seat-dark-fallback"
                aria-hidden="true"
                style={{
                  "--beam-x": `${beamPos.x}px`,
                  "--beam-y": `${beamPos.y}px`,
                  "--beam-r": `${FLASHLIGHT_RADIUS}px`,
                }}
              />
            )}
          </div>
        </Flashlight>

        <aside className="seat-sidebar">
          <div className="seat-summary-card">
            <h2 className="seat-summary-card__title">Seat Selection</h2>
            <p className="seat-summary-card__status" role="status" aria-live="polite">
              {statusMessage}
            </p>

            {selectedSeat ? (
              <div className="seat-summary-card__details">
                <div className="seat-summary-card__row">
                  <span>Seat</span>
                  <strong>{selectedSeat.code}</strong>
                </div>
                <div className="seat-summary-card__row">
                  <span>Cabin</span>
                  <strong className="seat-summary-card__cap">{selectedSeat.cls}</strong>
                </div>
                <div className="seat-summary-card__row">
                  <span>Position</span>
                  <strong>{getSeatPositionLabel(selectedSeat.col)}</strong>
                </div>
                {selectedSeat.window && (
                  <div className="seat-summary-card__fee">
                    🪟 <strong>{WINDOW_FEE_LABEL}:</strong> +₱{WINDOW_FEE_AMOUNT}
                  </div>
                )}
              </div>
            ) : (
              <p className="seat-summary-card__empty">No seat selected yet.</p>
            )}

            <button
              type="button"
              className="seat-confirm-btn"
              disabled={!selectedSeat}
              onClick={handleConfirm}
            >
              Confirm Seat →
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}
