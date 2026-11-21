// OWNER: RICKS — see RICKS.MD. Used by Stage 05 (RICKS) and Stage 10 Pay Now (DIN).
// Contract: works like a normal <button>, plus:
//   <ForcefieldButton onClick={...} onDodge={() => {}} maxSpeed={0.15}>Select</ForcefieldButton>
//   onDodge fires every time the button runs away. maxSpeed is in px per ms.
import { useCallback, useEffect, useRef, useState } from "react";
import useBooking from "../../context/useBooking.js";
import dodgeSound from "../../assets/audios/sfx/Pou Nah Sound Effect.mp3";
import "./ForcefieldButton.css";

// Shared audio state so every ForcefieldButton plays the trimmed MP3 cleanly without
// stale 206 range caching or HTMLAudio short-MP3 seek bugs.
let sharedAudioCtx = null;
let sharedArrayBuffer = null;
let sharedBlobUrl = null;
let sharedDecodedBuffer = null;
let sharedLoadPromise = null;
let audioUnlockBound = false;

function getSharedAudioContext() {
  if (typeof window === "undefined") return null;
  if (!sharedAudioCtx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      sharedAudioCtx = new AudioCtx();
    }
  }
  return sharedAudioCtx;
}

function loadDodgeSoundAsset() {
  if (sharedLoadPromise) return sharedLoadPromise;
  sharedLoadPromise = fetch(dodgeSound, { cache: "no-store" })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.arrayBuffer();
    })
    .then((buf) => {
      sharedArrayBuffer = buf;
      if (!sharedBlobUrl) {
        sharedBlobUrl = URL.createObjectURL(new Blob([buf], { type: "audio/mpeg" }));
      }
      const ctx = getSharedAudioContext();
      if (ctx) {
        return ctx
          .decodeAudioData(buf.slice(0))
          .then((decoded) => {
            sharedDecodedBuffer = decoded;
          })
          .catch(() => {});
      }
      return undefined;
    })
    .catch(() => {
      sharedLoadPromise = null;
    });
  return sharedLoadPromise;
}

function bindAudioUnlock() {
  loadDodgeSoundAsset();
  if (typeof window === "undefined" || audioUnlockBound) return;
  audioUnlockBound = true;

  const unlock = () => {
    const ctx = getSharedAudioContext();
    if (ctx && ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    if (ctx && sharedArrayBuffer && !sharedDecodedBuffer) {
      ctx
        .decodeAudioData(sharedArrayBuffer.slice(0))
        .then((decoded) => {
          sharedDecodedBuffer = decoded;
        })
        .catch(() => {});
    }
  };

  window.addEventListener("pointerdown", unlock, { capture: true, passive: true });
  window.addEventListener("keydown", unlock, { capture: true, passive: true });
  window.addEventListener("touchstart", unlock, { capture: true, passive: true });
}

function startDecodedBuffer(ctx, buffer) {
  const source = ctx.createBufferSource();
  const gain = ctx.createGain();
  source.buffer = buffer;
  gain.gain.value = 1.5;
  source.connect(gain);
  gain.connect(ctx.destination);
  source.start(0);
}

function playFreshHtmlAudio() {
  try {
    const audio = new Audio(sharedBlobUrl || dodgeSound);
    audio.volume = 1;
    audio.play().catch(() => {});
  } catch {
    // Ignore autoplay/environment errors
  }
}

function playDodgeSound() {
  const ctx = getSharedAudioContext();
  if (ctx && sharedDecodedBuffer) {
    if (ctx.state === "running") {
      startDecodedBuffer(ctx, sharedDecodedBuffer);
      return;
    }
    const requestedAt = performance.now();
    ctx
      .resume()
      .then(() => {
        if (performance.now() - requestedAt < 150 && ctx.state === "running" && sharedDecodedBuffer) {
          startDecodedBuffer(ctx, sharedDecodedBuffer);
        }
      })
      .catch(() => {});
    return;
  }

  loadDodgeSoundAsset();
  playFreshHtmlAudio();
}

const DEFAULT_MAX_SPEED = 0.15;
const DEMO_MIN_MAX_SPEED = 0.55;
const TRIGGER_RADIUS = 130;
const PROXIMITY_REVEAL_MARGIN = 140; // Fade forcefield in starting 140px outside the detection line
const PROXIMITY_OUTER_RADIUS = TRIGGER_RADIUS + PROXIMITY_REVEAL_MARGIN;
const SPEED_WINDOW_MS = 60;
const DODGE_COOLDOWN_MS = 220;
const SHRINK_FACTOR = 0.9; // 10% smaller per dodge
const MIN_SCALE = 0.25;
const DEMO_MIN_SCALE = 0.5;
const MAX_TOUCH_DODGES = 2;
const SYNTHETIC_MOUSE_IGNORE_MS = 500;
const MAX_SHAKE_PX = 11;
const MAX_SHAKE_DEG = 4.5;
const VIEWPORT_PADDING = 16;
const HEADER_CLEARANCE = 72;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getCenterBounds(width, height) {
  const halfW = width / 2;
  const halfH = height / 2;
  const minCenterX = VIEWPORT_PADDING + halfW;
  const maxCenterX = Math.max(minCenterX, window.innerWidth - VIEWPORT_PADDING - halfW);
  const maxCenterY = Math.max(
    VIEWPORT_PADDING + halfH,
    window.innerHeight - VIEWPORT_PADDING - halfH
  );
  const minCenterY = Math.min(HEADER_CLEARANCE + halfH, maxCenterY);
  return { minCenterX, maxCenterX, minCenterY, maxCenterY };
}

function pickFarDodgeCenter({
  baseCenterX,
  baseCenterY,
  currentCenterX,
  currentCenterY,
  cursorX,
  cursorY,
  nextWidth,
  nextHeight,
}) {
  const { minCenterX, maxCenterX, minCenterY, maxCenterY } = getCenterBounds(nextWidth, nextHeight);
  const spanX = Math.max(0, maxCenterX - minCenterX);
  const spanY = Math.max(0, maxCenterY - minCenterY);

  let best = { x: currentCenterX, y: currentCenterY, score: -Infinity };

  // Sample across the entire viewport and prefer spots far from the original position,
  // current position, and pointer.
  for (let i = 0; i < 32; i += 1) {
    const candX = minCenterX + Math.random() * spanX;
    const candY = minCenterY + Math.random() * spanY;

    const distFromOrigin = Math.hypot(candX - baseCenterX, candY - baseCenterY);
    const distFromCurrent = Math.hypot(candX - currentCenterX, candY - currentCenterY);
    const distFromCursor = Math.hypot(candX - cursorX, candY - cursorY);

    const score = distFromOrigin * 1.15 + distFromCurrent * 0.9 + distFromCursor * 1.1;
    if (score > best.score) {
      best = { x: candX, y: candY, score };
    }
  }

  return { x: best.x, y: best.y };
}

function getDistanceToRect(x, y, rect) {
  const closestX = clamp(x, rect.left, rect.right);
  const closestY = clamp(y, rect.top, rect.bottom);
  return Math.hypot(x - closestX, y - closestY);
}

function computeProximity(distToButton) {
  if (distToButton >= PROXIMITY_OUTER_RADIUS) return 0;
  if (distToButton <= TRIGGER_RADIUS) return 1;
  // Smooth ramp from 0 at outer radius to 0.85 right at the detection line
  const t = (PROXIMITY_OUTER_RADIUS - distToButton) / PROXIMITY_REVEAL_MARGIN;
  return clamp(t * 0.85, 0, 0.85);
}

function resetThreatStyles(button) {
  if (!button) return;
  button.style.setProperty("--ff-threat", "0");
  button.style.setProperty("--ff-shake-x", "0px");
  button.style.setProperty("--ff-shake-y", "0px");
  button.style.setProperty("--ff-shake-rot", "0deg");
}

function setProximityStyle(button, value) {
  if (!button) return;
  button.style.setProperty("--ff-proximity", value.toFixed(3));
}

export default function ForcefieldButton({
  onClick,
  onDodge,
  onPointerDown,
  maxSpeed = DEFAULT_MAX_SPEED,
  disabled = false,
  muted = false,
  className = "",
  style,
  children,
  ...rest
}) {
  const { demoMode } = useBooking();
  const effectiveMaxSpeed = demoMode ? Math.max(maxSpeed * 3, DEMO_MIN_MAX_SPEED) : maxSpeed;
  const minScale = demoMode ? DEMO_MIN_SCALE : MIN_SCALE;

  const buttonRef = useRef(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  const scaleRef = useRef(1);
  const pointerSamplesRef = useRef([]);
  const lastDodgeAtRef = useRef(0);
  const threatRef = useRef(0);
  const shakeRef = useRef({ x: 0, y: 0 });
  const lastFastAtRef = useRef(0);
  const rafIdRef = useRef(null);
  const touchDodgesRef = useRef(0);
  const lastTouchAtRef = useRef(0);
  const suppressNextClickRef = useRef(false);
  const onDodgeRef = useRef(onDodge);
  const mutedRef = useRef(muted);

  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

  useEffect(() => {
    onDodgeRef.current = onDodge;
  }, [onDodge]);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  const startThreatPulse = useCallback((nextThreat) => {
    threatRef.current = Math.max(threatRef.current * 0.85, nextThreat);
    lastFastAtRef.current = performance.now();

    if (rafIdRef.current !== null) return;

    function tickThreat() {
      const button = buttonRef.current;
      const now = performance.now();

      if (now - lastFastAtRef.current > 70) {
        threatRef.current *= 0.84;
      }

      const threat = threatRef.current;
      if (!button || threat < 0.01) {
        threatRef.current = 0;
        shakeRef.current = { x: 0, y: 0 };
        resetThreatStyles(button);
        rafIdRef.current = null;
        return;
      }

      const amp = threat * MAX_SHAKE_PX;
      const shakeX = (Math.random() * 2 - 1) * amp;
      const shakeY = (Math.random() * 2 - 1) * amp;
      const shakeRot = (Math.random() * 2 - 1) * threat * MAX_SHAKE_DEG;
      shakeRef.current = { x: shakeX, y: shakeY };

      button.style.setProperty("--ff-threat", threat.toFixed(3));
      button.style.setProperty("--ff-shake-x", `${shakeX.toFixed(2)}px`);
      button.style.setProperty("--ff-shake-y", `${shakeY.toFixed(2)}px`);
      button.style.setProperty("--ff-shake-rot", `${shakeRot.toFixed(2)}deg`);

      rafIdRef.current = window.requestAnimationFrame(tickThreat);
    }

    rafIdRef.current = window.requestAnimationFrame(tickThreat);
  }, []);

  const triggerDodge = useCallback(
    (pointerX, pointerY) => {
      const button = buttonRef.current;
      if (!button) return;

      const rect = button.getBoundingClientRect();
      const currentOffset = offsetRef.current;
      const currentScale = scaleRef.current;
      const nextScale = Math.max(minScale, currentScale * SHRINK_FACTOR);

      const currentCenterX = rect.left + rect.width / 2 - shakeRef.current.x * currentScale;
      const currentCenterY = rect.top + rect.height / 2 - shakeRef.current.y * currentScale;
      const baseCenterX = currentCenterX - currentOffset.x;
      const baseCenterY = currentCenterY - currentOffset.y;

      const baseWidth = button.offsetWidth || rect.width / currentScale;
      const baseHeight = button.offsetHeight || rect.height / currentScale;
      const nextWidth = baseWidth * nextScale;
      const nextHeight = baseHeight * nextScale;

      const targetCenter = pickFarDodgeCenter({
        baseCenterX,
        baseCenterY,
        currentCenterX,
        currentCenterY,
        cursorX: pointerX,
        cursorY: pointerY,
        nextWidth,
        nextHeight,
      });

      const nextOffset = {
        x: Math.round(targetCenter.x - baseCenterX),
        y: Math.round(targetCenter.y - baseCenterY),
      };

      // Update proximity against the new post-dodge rect so the ring fades out once it escapes far away
      const nextRect = {
        left: targetCenter.x - nextWidth / 2,
        right: targetCenter.x + nextWidth / 2,
        top: targetCenter.y - nextHeight / 2,
        bottom: targetCenter.y + nextHeight / 2,
      };
      setProximityStyle(button, computeProximity(getDistanceToRect(pointerX, pointerY, nextRect)));

      offsetRef.current = nextOffset;
      scaleRef.current = nextScale;
      lastDodgeAtRef.current = performance.now();
      setOffset(nextOffset);
      setScale(nextScale);
      if (!mutedRef.current) {
        playDodgeSound();
      }
      onDodgeRef.current?.();
    },
    [minScale]
  );

  useEffect(() => {
    const btnOnMount = buttonRef.current;
    if (disabled) {
      threatRef.current = 0;
      shakeRef.current = { x: 0, y: 0 };
      resetThreatStyles(btnOnMount);
      setProximityStyle(btnOnMount, 0);
      return undefined;
    }

    bindAudioUnlock();

    function handleMouseMove(event) {
      const now = performance.now();
      if (now - lastTouchAtRef.current < SYNTHETIC_MOUSE_IGNORE_MS) return;

      const button = buttonRef.current;
      let distToButton = Infinity;
      if (button) {
        const rect = button.getBoundingClientRect();
        distToButton = getDistanceToRect(event.clientX, event.clientY, rect);
        setProximityStyle(button, computeProximity(distToButton));
      }

      const samples = pointerSamplesRef.current;
      samples.push({ x: event.clientX, y: event.clientY, t: now });
      while (samples.length > 1 && now - samples[0].t > SPEED_WINDOW_MS) {
        samples.shift();
      }
      if (samples.length < 2) return;

      const dt = now - samples[0].t;
      if (dt <= 0) return;

      let totalDist = 0;
      for (let i = 1; i < samples.length; i += 1) {
        totalDist += Math.hypot(
          samples[i].x - samples[i - 1].x,
          samples[i].y - samples[i - 1].y
        );
      }
      if (dt < 8 && totalDist < 12) return;

      const speed = totalDist / dt;
      if (speed <= effectiveMaxSpeed) return;

      // Scale visual threat (shake + red glow) from 0..1 based on how far above maxSpeed the cursor is.
      const excessRatio = (speed - effectiveMaxSpeed) / Math.max(effectiveMaxSpeed * 6, 0.5);
      const nextThreat = clamp(0.15 + excessRatio * 0.85, 0.15, 1);
      startThreatPulse(nextThreat);

      if (now - lastDodgeAtRef.current < DODGE_COOLDOWN_MS) return;
      if (distToButton > TRIGGER_RADIUS) return;

      triggerDodge(event.clientX, event.clientY);
    }

    function handlePointerLeaveWindow() {
      setProximityStyle(buttonRef.current, 0);
    }

    function handleResize() {
      const button = buttonRef.current;
      const currentOffset = offsetRef.current;
      if (!button || (currentOffset.x === 0 && currentOffset.y === 0)) return;

      const rect = button.getBoundingClientRect();
      const currentCenterX = rect.left + rect.width / 2;
      const currentCenterY = rect.top + rect.height / 2;
      const { minCenterX, maxCenterX, minCenterY, maxCenterY } = getCenterBounds(
        rect.width,
        rect.height
      );
      const clampedX = clamp(currentCenterX, minCenterX, maxCenterX);
      const clampedY = clamp(currentCenterY, minCenterY, maxCenterY);
      if (clampedX === currentCenterX && clampedY === currentCenterY) return;

      const baseCenterX = currentCenterX - currentOffset.x;
      const baseCenterY = currentCenterY - currentOffset.y;
      const nextOffset = {
        x: Math.round(clampedX - baseCenterX),
        y: Math.round(clampedY - baseCenterY),
      };
      offsetRef.current = nextOffset;
      setOffset(nextOffset);
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);
    window.addEventListener("blur", handlePointerLeaveWindow);
    document.documentElement.addEventListener("mouseleave", handlePointerLeaveWindow);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("blur", handlePointerLeaveWindow);
      document.documentElement.removeEventListener("mouseleave", handlePointerLeaveWindow);
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      resetThreatStyles(btnOnMount);
      setProximityStyle(btnOnMount, 0);
    };
  }, [disabled, effectiveMaxSpeed, startThreatPulse, triggerDodge]);

  function handlePointerDown(event) {
    onPointerDown?.(event);
    if (disabled) return;

    if (event.pointerType === "touch") {
      lastTouchAtRef.current = performance.now();
      if (touchDodgesRef.current < MAX_TOUCH_DODGES) {
        touchDodgesRef.current += 1;
        suppressNextClickRef.current = true;
        event.preventDefault();
        startThreatPulse(0.75);
        triggerDodge(event.clientX, event.clientY);
      }
    }
  }

  function handleClick(event) {
    if (suppressNextClickRef.current) {
      suppressNextClickRef.current = false;
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    onClick?.(event);
  }

  const isDodged = offset.x !== 0 || offset.y !== 0 || scale !== 1;
  const mergedStyle = {
    ...style,
    "--ff-scale": String(scale),
    "--ff-range": `${(TRIGGER_RADIUS / scale).toFixed(2)}px`,
    ...(offset.x !== 0 || offset.y !== 0 ? { translate: `${offset.x}px ${offset.y}px` } : {}),
    ...(scale !== 1 ? { scale: String(scale) } : {}),
  };

  const mergedClassName = [
    "forcefield-button",
    isDodged ? "forcefield-button--dodged" : "",
    demoMode ? "forcefield-button--demo" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      ref={buttonRef}
      disabled={disabled}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      className={mergedClassName}
      style={mergedStyle}
      {...rest}
    >
      {children}
    </button>
  );
}
