// OWNER: DAR — Stage 04 loading endless-runner minigame (3-lane plane dodging luggage)
import { useCallback, useEffect, useRef, useState } from "react";
import useBooking from "../../context/useBooking.js";

const LANE_COUNT = 3;
const LANE_LABELS = ["FL350 · Cloud Lane", "FL200 · Jetstream", "FL050 · Baggage Alley"];
const LUGGAGE_ICONS = ["🧳", "🎒", "📦", "🎸", "🐐", "💼"];
const PLANE_X_PERCENT = 14;
const HIT_MIN_X = 8;
const HIT_MAX_X = 21;

const INITIAL_OBSTACLES = [
  { id: 1, lane: 0, x: 74, icon: "🧳", hit: false, passed: false },
  { id: 2, lane: 2, x: 96, icon: "🎒", hit: false, passed: false },
];

export default function LuggageDodgeGame({ durationMs = 9000 }) {
  const { bumpFrustration } = useBooking() ?? {};
  const [planeLane, setPlaneLane] = useState(1);
  const [obstacles, setObstacles] = useState(INITIAL_OBSTACLES);
  // Source of truth for the game loop, so collisions are counted once, outside React's (pure) state updaters.
  const obstaclesRef = useRef(INITIAL_OBSTACLES);
  const [dodgedCount, setDodgedCount] = useState(0);
  const [hitCount, setHitCount] = useState(0);
  const [bonkFlash, setBonkFlash] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  const planeLaneRef = useRef(planeLane);
  const bumpRef = useRef(bumpFrustration);
  const nextObstacleIdRef = useRef(3);
  const touchStartRef = useRef(null);
  const bonkTimeoutRef = useRef(null);

  useEffect(() => {
    planeLaneRef.current = planeLane;
  }, [planeLane]);

  useEffect(() => {
    bumpRef.current = bumpFrustration;
  }, [bumpFrustration]);

  const moveLane = useCallback((delta) => {
    setPlaneLane((current) => Math.max(0, Math.min(LANE_COUNT - 1, current + delta)));
  }, []);

  // Keyboard controls: ArrowUp/ArrowDown, ArrowLeft/ArrowRight, W/S, A/D
  useEffect(() => {
    function handleKeyDown(event) {
      if (
        event.key === "ArrowUp" ||
        event.key === "ArrowLeft" ||
        event.key === "w" ||
        event.key === "W" ||
        event.key === "a" ||
        event.key === "A"
      ) {
        event.preventDefault();
        moveLane(-1);
      } else if (
        event.key === "ArrowDown" ||
        event.key === "ArrowRight" ||
        event.key === "s" ||
        event.key === "S" ||
        event.key === "d" ||
        event.key === "D"
      ) {
        event.preventDefault();
        moveLane(1);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [moveLane]);

  // Main game loop
  useEffect(() => {
    const startTime = performance.now();
    let lastFrameTime = startTime;
    let spawnAccumulator = 0;
    let rafId = 0;

    function tick(now) {
      const dt = Math.min(64, now - lastFrameTime);
      lastFrameTime = now;
      spawnAccumulator += dt;

      setElapsedMs(Math.min(durationMs, now - startTime));

      const shouldSpawn = spawnAccumulator >= 650;
      if (shouldSpawn) {
        spawnAccumulator = 0;
      }

      const prev = obstaclesRef.current;
      const speedPerMs = 0.052; // ~52% of track width per second
      let newlyDodged = 0;
      let newlyHit = 0;

      const updated = [];
      for (const item of prev) {
        const nextX = item.x - dt * speedPerMs;
        if (nextX < -10) {
          continue;
        }

        let hit = item.hit;
        let passed = item.passed;

        if (!hit && !passed && nextX <= HIT_MAX_X && nextX >= HIT_MIN_X) {
          if (item.lane === planeLaneRef.current) {
            hit = true;
            newlyHit += 1;
          }
        }

        if (!hit && !passed && nextX < HIT_MIN_X) {
          passed = true;
          newlyDodged += 1;
        }

        updated.push({ ...item, x: nextX, hit, passed });
      }

      if (shouldSpawn) {
        // Pick a lane that leaves at least one open lane near the spawn edge
        const recentLanes = new Set(
          updated.filter((item) => item.x > 72).map((item) => item.lane)
        );
        const candidateLanes = [0, 1, 2].filter((lane) => !recentLanes.has(lane));
        const pool = candidateLanes.length > 0 ? candidateLanes : [0, 1, 2];
        const chosenLane = pool[Math.floor(Math.random() * pool.length)];
        const icon = LUGGAGE_ICONS[Math.floor(Math.random() * LUGGAGE_ICONS.length)];

        updated.push({
          id: nextObstacleIdRef.current++,
          lane: chosenLane,
          x: 98,
          icon,
          hit: false,
          passed: false,
        });
      }

      obstaclesRef.current = updated;
      setObstacles(updated);

      if (newlyDodged > 0) {
        setDodgedCount((count) => count + newlyDodged);
      }

      if (newlyHit > 0) {
        setHitCount((count) => count + newlyHit);
        setBonkFlash(true);
        window.clearTimeout(bonkTimeoutRef.current);
        bonkTimeoutRef.current = window.setTimeout(() => {
          setBonkFlash(false);
        }, 320);
        bumpRef.current?.(1);
      }

      rafId = window.requestAnimationFrame(tick);
    }

    rafId = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(bonkTimeoutRef.current);
    };
  }, [durationMs]);

  function handleTouchStart(event) {
    const touch = event.touches?.[0];
    if (!touch) return;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }

  function handleTouchEnd(event) {
    const start = touchStartRef.current;
    const touch = event.changedTouches?.[0];
    touchStartRef.current = null;
    if (!start || !touch) return;

    const dy = touch.clientY - start.y;
    const dx = touch.clientX - start.x;

    if (Math.abs(dy) < 16 && Math.abs(dx) < 16) {
      return;
    }

    if (Math.abs(dy) >= Math.abs(dx)) {
      moveLane(dy < 0 ? -1 : 1);
    } else {
      moveLane(dx < 0 ? -1 : 1);
    }
  }

  const remainingSeconds = Math.max(0, (durationMs - elapsedMs) / 1000).toFixed(1);
  const progressPercent = Math.min(100, Math.round((elapsedMs / durationMs) * 100));

  return (
    <section className="panel flights-minigame" aria-label="Loading flights minigame">
      <h3 className="panel-title purple">
        🕹️ LOADING FLIGHTS… DODGE THE FALLING BAGGAGE WHILE YOU WAIT!
      </h3>

      <div className="panel-body flights-minigame__body">
        <div className="flights-minigame__hud">
          <div className="flights-minigame__status">
            <span className="flights-minigame__timer">
              ⏳ Radar scan: <strong>{remainingSeconds}s</strong>
            </span>
            <span className="flights-minigame__score">
              ✅ Dodged: <strong>{dodgedCount}</strong>
            </span>
            <span className="flights-minigame__hits">
              💥 Luggage Hits: <strong>{hitCount}</strong>
            </span>
          </div>

          <div
            className="flights-minigame__progress"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progressPercent}
          >
            <div
              className="flights-minigame__progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <p className="flights-minigame__instructions">
          Use <strong>↑ / ↓</strong> (or <strong>← / →</strong>) arrow keys,{" "}
          <strong>swipe</strong>, or <strong>tap any lane</strong> to steer your
          ₱1 plane around runaway cargo!
        </p>

        <div
          className={`flights-minigame__track ${bonkFlash ? "flights-minigame__track--bonk" : ""}`}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {Array.from({ length: LANE_COUNT }, (_, laneIndex) => {
            const isPlaneHere = planeLane === laneIndex;
            const laneObstacles = obstacles.filter((item) => item.lane === laneIndex);

            return (
              <div
                key={laneIndex}
                className={`flights-minigame__lane ${isPlaneHere ? "flights-minigame__lane--active" : ""}`}
                onClick={() => setPlaneLane(laneIndex)}
                role="button"
                tabIndex={0}
                aria-label={`Move plane to lane ${laneIndex + 1}: ${LANE_LABELS[laneIndex]}`}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setPlaneLane(laneIndex);
                  }
                }}
              >
                <span className="flights-minigame__lane-label">
                  {LANE_LABELS[laneIndex]}
                </span>

                {isPlaneHere && (
                  <div
                    className={`flights-minigame__plane ${bonkFlash ? "flights-minigame__plane--bonk" : ""}`}
                    style={{ left: `${PLANE_X_PERCENT}%` }}
                    aria-label="Your airplane"
                  >
                    <span className="flights-minigame__plane-icon" aria-hidden="true">
                      ✈️
                    </span>
                    {bonkFlash && (
                      <span className="flights-minigame__bonk-tag">BONK!</span>
                    )}
                  </div>
                )}

                {laneObstacles.map((item) => (
                  <div
                    key={item.id}
                    className={`flights-minigame__obstacle ${item.hit ? "flights-minigame__obstacle--hit" : ""}`}
                    style={{ left: `${item.x}%` }}
                    aria-hidden="true"
                  >
                    {item.hit ? "💥" : item.icon}
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        <div className="flights-minigame__controls">
          <button
            type="button"
            className="btn warn flights-minigame__ctrl-btn"
            onClick={() => moveLane(-1)}
            disabled={planeLane === 0}
          >
            ▲ Move Up Lane
          </button>
          <span className="flights-minigame__lane-indicator">
            Current Lane: <strong>{planeLane + 1} / 3</strong>
          </span>
          <button
            type="button"
            className="btn warn flights-minigame__ctrl-btn"
            onClick={() => moveLane(1)}
            disabled={planeLane === LANE_COUNT - 1}
          >
            ▼ Move Down Lane
          </button>
        </div>
      </div>
    </section>
  );
}
