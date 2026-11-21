// OWNER: RICKS — see RICKS.MD (Stage 06: Choose Seat)
import { useEffect, useMemo, useRef, useState } from "react";
import useBooking from "../../context/useBooking.js";
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
const FLASHLIGHT_RADIUS = 155;

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function pickRandomLightSwitchPos() {
  // Keep the switch comfortably inside the viewport, away from edges and header.
  return {
    leftPct: Math.round(randomBetween(10, 74)),
    topPct: Math.round(randomBetween(16, 78)),
  };
}

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
  // Faulty flashlight state while dark: "on" | "flicker" | "off"
  const [beamState, setBeamState] = useState("on");
  const [switchPos, setSwitchPos] = useState(pickRandomLightSwitchPos);
  const [statusMessage, setStatusMessage] = useState(
    "Pick any available seat on board. Good luck catching one."
  );

  const lastMischiefAtRef = useRef(0);
  const jumpHighlightTimerRef = useRef(null);
  const darkOverlayRef = useRef(null);
  const cursorPosRef = useRef({
    x: typeof window !== "undefined" ? Math.round(window.innerWidth / 2) : 400,
    y: typeof window !== "undefined" ? Math.round(window.innerHeight / 2) : 300,
  });

  useEffect(
    () => () => {
      if (jumpHighlightTimerRef.current) {
        window.clearTimeout(jumpHighlightTimerRef.current);
      }
    },
    []
  );

  // Track cursor across the entire viewport so the full-screen flashlight opens right at the cursor.
  useEffect(() => {
    function updateBeam(x, y) {
      cursorPosRef.current = { x, y };
      const overlay = darkOverlayRef.current;
      if (overlay) {
        overlay.style.setProperty("--beam-x", `${x}px`);
        overlay.style.setProperty("--beam-y", `${y}px`);
      }
    }

    function handlePointerMove(event) {
      updateBeam(event.clientX, event.clientY);
    }

    function handleTouchMove(event) {
      const touch = event.touches?.[0];
      if (touch) {
        updateBeam(touch.clientX, touch.clientY);
      }
    }

    window.addEventListener("mousemove", handlePointerMove, { passive: true });
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  // Sync the beam position the instant darkness turns on.
  useEffect(() => {
    if (!dark) return;
    const overlay = darkOverlayRef.current;
    if (overlay) {
      overlay.style.setProperty("--beam-x", `${cursorPosRef.current.x}px`);
      overlay.style.setProperty("--beam-y", `${cursorPosRef.current.y}px`);
    }
  }, [dark]);

  // Trigger a blackout periodically while lights are on; darkness stays until the player clicks Turn Lights On.
  useEffect(() => {
    if (dark) return undefined;

    const waitMs = demoMode ? randomBetween(4500, 8000) : randomBetween(10000, 18000);
    const timerId = window.setTimeout(() => {
      setSwitchPos(pickRandomLightSwitchPos());
      setBeamState("on");
      setDark(true);
      setStatusMessage(
        "⚡ Cabin blackout! Find the 'Turn Lights On' switch with your faulty flashlight."
      );
      bumpFrustration(2);
    }, waitMs);

    return () => window.clearTimeout(timerId);
  }, [dark, demoMode, bumpFrustration]);

  // Faulty flashlight loop while in blackout: randomly glitches, flickers, and cuts on/off.
  useEffect(() => {
    if (!dark) return undefined;

    let timerId = null;
    let cancelled = false;

    function runGlitchCycle() {
      // Phase 1: flashlight stays on briefly
      const onDuration = demoMode ? randomBetween(900, 2100) : randomBetween(800, 2200);
      timerId = window.setTimeout(() => {
        if (cancelled) return;

        // Phase 2: sputter / glitch flicker
        setBeamState("flicker");
        const flickerDuration = randomBetween(220, 520);
        timerId = window.setTimeout(() => {
          if (cancelled) return;

          // Phase 3: cut completely off (or recover right back on ~25% of the time)
          const cutOut = Math.random() < 0.78;
          if (!cutOut) {
            setBeamState("on");
            runGlitchCycle();
            return;
          }

          setBeamState("off");
          const offDuration = demoMode ? randomBetween(240, 580) : randomBetween(300, 820);
          timerId = window.setTimeout(() => {
            if (cancelled) return;

            // Occasional brief double-blink before stabilizing
            if (Math.random() < 0.45) {
              setBeamState("flicker");
              timerId = window.setTimeout(() => {
                if (cancelled) return;
                setBeamState("off");
                timerId = window.setTimeout(() => {
                  if (cancelled) return;
                  setBeamState("on");
                  runGlitchCycle();
                }, randomBetween(140, 280));
              }, randomBetween(90, 180));
            } else {
              setBeamState("on");
              runGlitchCycle();
            }
          }, offDuration);
        }, flickerDuration);
      }, onDuration);
    }

    runGlitchCycle();
    return () => {
      cancelled = true;
      if (timerId) window.clearTimeout(timerId);
    };
  }, [dark, demoMode]);

  const selectedSeat = selectedCode ? seats[selectedCode] : null;

  const availableCount = useMemo(
    () => Object.values(seats).filter((s) => s.status === "available").length,
    [seats]
  );

  function handleTurnLightsOn() {
    setDark(false);
    setBeamState("on");
    setStatusMessage("💡 Cabin lights restored! (Until the faulty generator trips again…)");
  }

  function triggerJumpHighlight(code) {
    setJumpedCode(code);
    if (jumpHighlightTimerRef.current) {
      window.clearTimeout(jumpHighlightTimerRef.current);
    }
    jumpHighlightTimerRef.current = window.setTimeout(() => {
      setJumpedCode(null);
    }, 950);
  }

  function handleSeatHover(code) {
    const seat = seats[code];
    if (!seat || seat.status !== "available" || code === selectedCode) return;

    const now = performance.now();
    if (now - lastMischiefAtRef.current < HOVER_COOLDOWN_MS) return;

    const mischiefChance = demoMode ? 0.35 : 0.52;
    if (Math.random() > mischiefChance) return;

    lastMischiefAtRef.current = now;

    const occupiedCodes = Object.keys(seats).filter(
      (k) => seats[k].status === "occupied" && k !== code
    );
    const shouldJump =
      occupiedCodes.length > 0 && (availableCount <= MIN_AVAILABLE_SEATS || Math.random() < 0.5);

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
        `Selected ${code} (${seat.cls}, Window). +₱${WINDOW_FEE_AMOUNT} ${WINDOW_FEE_LABEL} applies.`
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

    let label = "OK";
    if (isOccupied) label = "X";
    else if (isSelected) label = code;
    else if (isJumped) label = "!";
    else if (seat.window) label = `₱${WINDOW_FEE_AMOUNT}`;
    else if (isBusiness) label = "BIZ";

    return (
      <button
        key={code}
        type="button"
        disabled={isOccupied}
        className={className}
        title={`${code} · ${isBusiness ? "Business" : "Economy"} · ${getSeatPositionLabel(col)}${
          seat.window ? ` (+₱${WINDOW_FEE_AMOUNT} ${WINDOW_FEE_LABEL})` : ""
        }`}
        aria-label={`Seat ${code}, ${isBusiness ? "business" : "economy"}, ${
          isOccupied ? "occupied" : isSelected ? "selected" : "available"
        }`}
        onMouseEnter={() => handleSeatHover(code)}
        onClick={() => handleSeatClick(code)}
      >
        {label}
      </button>
    );
  }

  const flashlightStatusText =
    beamState === "off"
      ? "FLASHLIGHT: DEAD"
      : beamState === "flicker"
        ? "FLASHLIGHT: GLITCHING..."
        : "cursor = faulty flashlight";

  return (
    <section className="seat-stage">
      <div className="panel">
        <h2 className="panel-title purple">
          CHOOSE SEAT - Step 6 of 12 (random darkness may occur)
        </h2>

        <div className="panel-body">
          <div className="seat-stage__bar">
            <button type="button" className="btn" onClick={back}>
              ← Back to Flight
            </button>
            <span className="seat-stage__count">{availableCount} seats left (allegedly)</span>
          </div>

          <div className="seat-stage__layout">
            <div className={`seat-map-shell ${dark ? "seat-map-shell--dark" : ""}`}>
              <div className="seat-legend">
                <span className="seat-legend__item">
                  <span className="seat-legend__swatch seat-legend__swatch--window" /> Window (₱
                  {WINDOW_FEE_AMOUNT})
                </span>
                <span className="seat-legend__item">
                  <span className="seat-legend__swatch seat-legend__swatch--business" /> Business
                  (1–3)
                </span>
                <span className="seat-legend__item">
                  <span className="seat-legend__swatch seat-legend__swatch--available" /> Open (OK)
                </span>
                <span className="seat-legend__item">
                  <span className="seat-legend__swatch seat-legend__swatch--occupied" /> Taken (X)
                </span>
                <span className="seat-legend__item">
                  <span className="seat-legend__swatch seat-legend__swatch--selected" /> Selected
                </span>
              </div>

              <div className="seat-map__cabin">
                <div className="seat-map__col-headers" aria-hidden="true">
                  {LEFT_COLS.map((c) => (
                    <span key={c}>{c}</span>
                  ))}
                  <span>#</span>
                  {RIGHT_COLS.map((c) => (
                    <span key={c}>{c}</span>
                  ))}
                </div>

                <div className="seat-map__divider seat-map__divider--business">
                  ★ BUSINESS CLASS (Rows 1–3) ★
                </div>

                {ROWS.map((row) => (
                  <div key={row}>
                    {row === BUSINESS_MAX_ROW + 1 && (
                      <div className="seat-map__divider">ECONOMY CLASS (Rows 4–30)</div>
                    )}
                    <div className="seat-map__row">
                      {LEFT_COLS.map((col) => renderSeatButton(row, col))}
                      <span className="seat-map__row-num">{row}</span>
                      {RIGHT_COLS.map((col) => renderSeatButton(row, col))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <aside className="seat-sidebar">
              <div className="seat-info-box">
                <p className="seat-info-box__fee-line">
                  <strong>
                    {WINDOW_FEE_LABEL}: ₱{WINDOW_FEE_AMOUNT}
                  </strong>{" "}
                  (appreciation not included)
                </p>
                <p className="seat-info-box__sub">
                  Aisle: SOLD OUT · Middle: MANDATORY · Standing: ₱1
                </p>
                <p className="seat-info-box__warn">
                  Seats marked ! are currently jumping. Please wait for them to land.
                </p>

                <p className="seat-info-box__status" role="status" aria-live="polite">
                  {statusMessage}
                </p>

                {selectedSeat ? (
                  <div className="seat-selected-box">
                    <div className="seat-selected-box__row">
                      <span>Seat:</span>
                      <strong>{selectedSeat.code}</strong>
                    </div>
                    <div className="seat-selected-box__row">
                      <span>Class:</span>
                      <strong className="seat-selected-box__cap">{selectedSeat.cls}</strong>
                    </div>
                    <div className="seat-selected-box__row">
                      <span>Position:</span>
                      <strong>{getSeatPositionLabel(selectedSeat.col)}</strong>
                    </div>
                    {selectedSeat.window && (
                      <div className="seat-selected-box__fee">
                        +₱{WINDOW_FEE_AMOUNT} {WINDOW_FEE_LABEL}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="seat-info-box__empty">No seat selected yet.</p>
                )}

                <button
                  type="button"
                  className="btn warn seat-confirm-btn"
                  disabled={!selectedSeat}
                  onClick={handleConfirm}
                >
                  Confirm Seat (seat may change)
                </button>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {dark && (
        <>
          <button
            type="button"
            className="btn warn seat-lights-switch"
            style={{
              left: `${switchPos.leftPct}%`,
              top: `${switchPos.topPct}%`,
            }}
            onClick={handleTurnLightsOn}
          >
            💡 Turn Lights On
          </button>

          <div
            ref={darkOverlayRef}
            className={`seat-dark-fallback seat-dark-fallback--${beamState}`}
            aria-hidden="true"
            style={{ "--beam-r": `${FLASHLIGHT_RADIUS}px` }}
          />

          <div className="seat-dark-pill" role="alert">
            BLACKOUT ({flashlightStatusText}) · Find &quot;💡 Turn Lights On&quot;
          </div>
        </>
      )}
    </section>
  );
}
