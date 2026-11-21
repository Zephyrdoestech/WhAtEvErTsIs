// Global periodic blackout across all pages with faulty glitching cursor flashlight
// and a randomly placed "Turn Lights On" switch that must be found and clicked.
import { useEffect, useRef, useState } from "react";
import useBooking from "../../context/useBooking.js";
import "./BlackoutOverlay.css";

const FLASHLIGHT_RADIUS = 155;

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function pickRandomLightSwitchPos() {
  return {
    leftPct: Math.round(randomBetween(10, 72)),
    topPct: Math.round(randomBetween(16, 78)),
  };
}

export default function BlackoutOverlay() {
  const { stage, demoMode, bumpFrustration } = useBooking() ?? {};
  const [dark, setDark] = useState(false);
  // Faulty flashlight state while dark: "on" | "flicker" | "off"
  const [beamState, setBeamState] = useState("on");
  const [switchPos, setSwitchPos] = useState(pickRandomLightSwitchPos);

  const darkOverlayRef = useRef(null);
  const cursorPosRef = useRef({
    x: typeof window !== "undefined" ? Math.round(window.innerWidth / 2) : 400,
    y: typeof window !== "undefined" ? Math.round(window.innerHeight / 2) : 300,
  });

  // Track cursor/touch across the entire viewport so the flashlight opens at the current cursor.
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
      if (touch) updateBeam(touch.clientX, touch.clientY);
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

  // Sync beam position the instant darkness turns on.
  useEffect(() => {
    if (!dark) return;
    const overlay = darkOverlayRef.current;
    if (overlay) {
      overlay.style.setProperty("--beam-x", `${cursorPosRef.current.x}px`);
      overlay.style.setProperty("--beam-y", `${cursorPosRef.current.y}px`);
    }
  }, [dark]);

  // Trigger brownouts less frequently across all pages (skip Stage 1 so it doesn't cover Shea ad).
  // Darkness stays until the user clicks "Turn Lights On".
  useEffect(() => {
    if (dark || stage === 1) return undefined;

    const waitMs = demoMode ? randomBetween(22000, 38000) : randomBetween(45000, 90000);
    const timerId = window.setTimeout(() => {
      setSwitchPos(pickRandomLightSwitchPos());
      setBeamState("on");
      setDark(true);
      bumpFrustration?.(2);
    }, waitMs);

    return () => window.clearTimeout(timerId);
  }, [dark, stage, demoMode, bumpFrustration]);

  // Keyboard escape hatch: the switch can be hidden by the dead beam, so Esc always restores the lights.
  useEffect(() => {
    if (!dark) return undefined;
    function handleKey(event) {
      if (event.key === "Escape") {
        setDark(false);
        setBeamState("on");
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [dark]);

  // Faulty flashlight loop while dark: randomly flickers and cuts on/off.
  useEffect(() => {
    if (!dark) return undefined;

    let timerId = null;
    let cancelled = false;

    function runGlitchCycle() {
      const onDuration = demoMode ? randomBetween(1100, 2400) : randomBetween(900, 2400);
      timerId = window.setTimeout(() => {
        if (cancelled) return;

        setBeamState("flicker");
        const flickerDuration = randomBetween(220, 520);
        timerId = window.setTimeout(() => {
          if (cancelled) return;

          if (Math.random() >= 0.78) {
            setBeamState("on");
            runGlitchCycle();
            return;
          }

          setBeamState("off");
          const offDuration = demoMode ? randomBetween(240, 550) : randomBetween(300, 800);
          timerId = window.setTimeout(() => {
            if (cancelled) return;

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

  if (!dark) return null;

  const flashlightStatusText =
    beamState === "off"
      ? "FLASHLIGHT: DEAD"
      : beamState === "flicker"
        ? "FLASHLIGHT: GLITCHING..."
        : "cursor = faulty flashlight";

  return (
    <>
      <button
        type="button"
        className="btn warn global-lights-switch"
        style={{
          left: `${switchPos.leftPct}%`,
          top: `${switchPos.topPct}%`,
        }}
        onClick={() => {
          setDark(false);
          setBeamState("on");
        }}
      >
        💡 Turn Lights On
      </button>

      <div
        ref={darkOverlayRef}
        className={`global-blackout global-blackout--${beamState}`}
        aria-hidden="true"
        style={{ "--beam-r": `${FLASHLIGHT_RADIUS}px` }}
      />

      <div className="global-blackout-pill" role="alert">
        BROWNOUT ({flashlightStatusText}) · Find &quot;💡 Turn Lights On&quot; (or press Esc)
      </div>
    </>
  );
}
