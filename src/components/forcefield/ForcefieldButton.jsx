// OWNER: RICKS — see RICKS.MD. Used by Stage 05 (RICKS) and Stage 10 Pay Now (DIN).
// Contract: works like a normal <button>, plus:
//   <ForcefieldButton onClick={...} onDodge={() => {}} maxSpeed={0.4}>Select</ForcefieldButton>
//   onDodge fires every time the button runs away. maxSpeed is in px per ms.
import { useEffect, useRef, useState } from "react";
import nyaSound from "../../assets/audios/nya.mp3";
import "./ForcefieldButton.css";

const TRIGGER_RADIUS = 120;
const DODGE_COOLDOWN_MS = 220;
const MIN_JUMP_DIST = 130;
const MAX_JUMP_DIST = 260;
const MIN_CURSOR_CLEARANCE = 140;
const VIEWPORT_PADDING = 16;
const HEADER_CLEARANCE = 72;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getViewportBounds(rect) {
  const minLeft = VIEWPORT_PADDING;
  const maxLeft = Math.max(minLeft, window.innerWidth - rect.width - VIEWPORT_PADDING);
  const maxTop = Math.max(VIEWPORT_PADDING, window.innerHeight - rect.height - VIEWPORT_PADDING);
  const minTop = Math.min(HEADER_CLEARANCE, maxTop);
  return { minLeft, maxLeft, minTop, maxTop };
}

function pickDodgeTarget(rect, cursorX, cursorY) {
  const { minLeft, maxLeft, minTop, maxTop } = getViewportBounds(rect);
  let best = { left: rect.left, top: rect.top, score: -Infinity };

  for (let i = 0; i < 16; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const distance = MIN_JUMP_DIST + Math.random() * (MAX_JUMP_DIST - MIN_JUMP_DIST);
    const candLeft = clamp(rect.left + Math.cos(angle) * distance, minLeft, maxLeft);
    const candTop = clamp(rect.top + Math.sin(angle) * distance, minTop, maxTop);

    const moved = Math.hypot(candLeft - rect.left, candTop - rect.top);
    const candCenterX = candLeft + rect.width / 2;
    const candCenterY = candTop + rect.height / 2;
    const cursorDist = Math.hypot(candCenterX - cursorX, candCenterY - cursorY);

    if (moved >= 80 && cursorDist >= MIN_CURSOR_CLEARANCE) {
      return { left: candLeft, top: candTop };
    }

    const score = cursorDist + moved * 0.5;
    if (score > best.score) {
      best = { left: candLeft, top: candTop, score };
    }
  }

  return { left: best.left, top: best.top };
}

export default function ForcefieldButton({
  onClick,
  onDodge,
  maxSpeed = 0.4,
  disabled = false,
  className = "",
  style,
  children,
  ...rest
}) {
  const buttonRef = useRef(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  const lastPointerRef = useRef(null);
  const lastDodgeAtRef = useRef(0);
  const onDodgeRef = useRef(onDodge);
  const audioRef = useRef(null);

  const [offset, setOffset] = useState({ x: 0, y: 0 });

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
      const prev = lastPointerRef.current;
      lastPointerRef.current = { x: event.clientX, y: event.clientY, t: now };

      if (!prev) return;
      const dt = now - prev.t;
      if (dt <= 0 || dt > 150) return;

      const speed = Math.hypot(event.clientX - prev.x, event.clientY - prev.y) / dt;
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
      const baseLeft = rect.left - currentOffset.x;
      const baseTop = rect.top - currentOffset.y;
      const target = pickDodgeTarget(rect, event.clientX, event.clientY);

      const nextOffset = {
        x: Math.round(target.left - baseLeft),
        y: Math.round(target.top - baseTop),
      };

      offsetRef.current = nextOffset;
      lastDodgeAtRef.current = now;
      setOffset(nextOffset);
      playNya();
      onDodgeRef.current?.();
    }

    function handleResize() {
      const button = buttonRef.current;
      const currentOffset = offsetRef.current;
      if (!button || (currentOffset.x === 0 && currentOffset.y === 0)) return;

      const rect = button.getBoundingClientRect();
      const { minLeft, maxLeft, minTop, maxTop } = getViewportBounds(rect);
      const clampedLeft = clamp(rect.left, minLeft, maxLeft);
      const clampedTop = clamp(rect.top, minTop, maxTop);
      if (clampedLeft === rect.left && clampedTop === rect.top) return;

      const baseLeft = rect.left - currentOffset.x;
      const baseTop = rect.top - currentOffset.y;
      const nextOffset = {
        x: Math.round(clampedLeft - baseLeft),
        y: Math.round(clampedTop - baseTop),
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

  const isDodged = offset.x !== 0 || offset.y !== 0;
  const combinedTransform = [
    style?.transform,
    isDodged ? `translate3d(${offset.x}px, ${offset.y}px, 0)` : "",
  ]
    .filter(Boolean)
    .join(" ");

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
