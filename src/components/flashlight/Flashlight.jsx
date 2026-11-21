// OWNER: SYOS — see SYOS.MD. Used by Stage 03 dark mode (SYOS) and Stage 06 random darkness (RICKS).
// Contract: <Flashlight on={true} radius={120}>...content...</Flashlight>
// When on, everything is pitch black except a circle around the cursor.
import { useEffect, useRef } from "react";
import "./Flashlight.css";

export default function Flashlight({ on = false, radius = 120, children }) {
  const container = useRef(null);
  const pointer = useRef(null);
  const safeRadius = Number.isFinite(radius) && radius > 0 ? radius : 120;

  function illuminate(clientX, clientY) {
    const element = container.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    element.style.setProperty("--flashlight-x", `${clientX - rect.left}px`);
    element.style.setProperty("--flashlight-y", `${clientY - rect.top}px`);
  }

  function move(event) {
    if (!on) return;
    pointer.current = { x: event.clientX, y: event.clientY };
    illuminate(event.clientX, event.clientY);
  }

  function focus(event) {
    if (!on) return;
    // Keyboard users get a light on the focused control instead of needing a mouse.
    pointer.current = null;
    const rect = event.target.getBoundingClientRect();
    illuminate(rect.left + rect.width / 2, rect.top + rect.height / 2);
  }

  useEffect(() => {
    if (!on) return;
    function reposition() {
      if (pointer.current) illuminate(pointer.current.x, pointer.current.y);
    }
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [on]);

  return (
    <div ref={container} className="flashlight" style={{ "--flashlight-radius": `${safeRadius}px` }} onPointerMove={move} onPointerDown={move} onFocusCapture={focus}>
      {children}
      {on && <div className="flashlight__darkness" aria-hidden="true" />}
    </div>
  );
}
