// OWNER: RICKS — see RICKS.MD. Used by Stage 05 (RICKS) and Stage 10 Pay Now (DIN).
// Contract: works like a normal <button>, plus:
//   <ForcefieldButton onClick={...} onDodge={() => {}} maxSpeed={0.15}>Select</ForcefieldButton>
//   onDodge fires every time the button runs away. maxSpeed is in px per ms.
import { useEffect, useRef, useState } from "react";
import nyaSound from "../../assets/audios/nya.mp3";
import "./ForcefieldButton.css";

const DEFAULT_MAX_SPEED = 0.15;
const TRIGGER_RADIUS = 130;
const SPEED_WINDOW_MS = 60;
const DODGE_COOLDOWN_MS = 220;
const SHRINK_FACTOR = 0.9; // 10% smaller per dodge
const MIN_SCALE = 0.25;
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
  const maxCenterY = Math.max(VIEWPORT_PADDING + halfH, window.innerHeight - VIEWPORT_PADDING - halfH);
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
  // current position, and cursor.
  for (let i = 0; i < 32; i += 1) {
    const candX = minCenterX + Math.random() * spanX;
    const candY = minCenterY + Math.random() * spanY;

    const distFromOrigin = Math.hypot(candX - baseCenterX, candY - baseCenterY);
    const distFromCurrent = Math.hypot(candX - currentCenterX, candY - currentCenterY);
    const distFromCursor = Math.hypot(candX - cursorX, candY - cursorY);

    // Weighted score emphasizing escaping far from original position and current/cursor location
    const score = distFromOrigin * 1.15 + distFromCurrent * 0.9 + distFromCursor * 1.1;
    if (score > best.score) {
      best = { x: candX, y: candY, score };
    }
  }

  return { x: best.x, y: best.y };
}

export default function ForcefieldButton({
  onClick,
  onDodge,
  maxSpeed = DEFAULT_MAX_SPEED,
  disabled = false,
  className = "",
  style,
  children,
  ...rest
}) {
  const buttonRef = useRef(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  const scaleRef = useRef(1);
  const pointerSamplesRef = useRef([]);
  const lastDodgeAtRef = useRef(0);
  const onDodgeRef = useRef(onDodge);
  const audioRef = useRef(null);

  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

  useEffect(() => {
    onDodgeRef.current = onDodge;
  }, [onDodge]);

  useEffect(() => {
    if (disabled) return undefined;

    function playNya() {
      if (!audioRef.current) {
        audioRef.current = new Audio(nyaSound);
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }

    function handleMouseMove(event) {
      const now = performance.now();
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
      if (speed <= maxSpeed) return;
      if (now - lastDodgeAtRef.current < DODGE_COOLDOWN_MS) return;

      const button = buttonRef.current;
      if (!button) return;

      const rect = button.getBoundingClientRect();
      const closestX = clamp(event.clientX, rect.left, rect.right);
      const closestY = clamp(event.clientY, rect.top, rect.bottom);
      const distToButton = Math.hypot(event.clientX - closestX, event.clientY - closestY);
      if (distToButton > TRIGGER_RADIUS) return;

      const currentOffset = offsetRef.current;
      const currentScale = scaleRef.current;
      const nextScale = Math.max(MIN_SCALE, currentScale * SHRINK_FACTOR);

      const currentCenterX = rect.left + rect.width / 2;
      const currentCenterY = rect.top + rect.height / 2;
      const baseCenterX = currentCenterX - currentOffset.x;
      const baseCenterY = currentCenterY - currentOffset.y;

      const baseWidth = rect.width / currentScale;
      const baseHeight = rect.height / currentScale;
      const nextWidth = baseWidth * nextScale;
      const nextHeight = baseHeight * nextScale;

      const targetCenter = pickFarDodgeCenter({
        baseCenterX,
        baseCenterY,
        currentCenterX,
        currentCenterY,
        cursorX: event.clientX,
        cursorY: event.clientY,
        nextWidth,
        nextHeight,
      });

      const nextOffset = {
        x: Math.round(targetCenter.x - baseCenterX),
        y: Math.round(targetCenter.y - baseCenterY),
      };

      offsetRef.current = nextOffset;
      scaleRef.current = nextScale;
      lastDodgeAtRef.current = now;
      setOffset(nextOffset);
      setScale(nextScale);
      playNya();
      onDodgeRef.current?.();
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
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, [disabled, maxSpeed]);

  const isDodged = offset.x !== 0 || offset.y !== 0 || scale !== 1;
  const dodgeTransform = isDodged
    ? `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})`
    : "";
  const combinedTransform = [style?.transform, dodgeTransform].filter(Boolean).join(" ");

  const mergedStyle = {
    ...style,
    ...(combinedTransform ? { transform: combinedTransform } : {}),
  };

  const mergedClassName = [
    "forcefield-button",
    isDodged ? "forcefield-button--dodged" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      ref={buttonRef}
      disabled={disabled}
      onClick={onClick}
      className={mergedClassName}
      style={mergedStyle}
      {...rest}
    >
      {children}
    </button>
  );
}
