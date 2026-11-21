// OWNER: SYOS — see SYOS.MD. Used by Stage 03 dark mode (SYOS) and Stage 06 random darkness (RICKS).
// Contract: <Flashlight on={true} radius={120}>...content...</Flashlight>
// When on, everything is pitch black except a circle around the cursor.
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "./Flashlight.css";

export default function Flashlight({ on = false, radius = 120, children, fullPage = false }) {
  const container = useRef(null);
  const overlay = useRef(null);
  const pointer = useRef(null);
  const safeRadius = Number.isFinite(radius) && radius > 0 ? radius : 120;

  function illuminate(clientX, clientY) {
    const element = overlay.current;
    if (!element || !container.current) return;
    const rect = fullPage ? { left: 0, top: 0 } : container.current.getBoundingClientRect();
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
    // Keep page mode in the top layer so native dialogs are darkened too.
    const layer = overlay.current;
    function raiseLayer() {
      if (!fullPage || !layer?.showPopover) return;
      if (layer.matches(":popover-open")) layer.hidePopover();
      layer.showPopover();
    }
    raiseLayer();
    const observer = fullPage ? new MutationObserver((records) => {
      if (records.some((record) => record.target instanceof HTMLDialogElement && record.target.open)) raiseLayer();
    }) : null;
    observer?.observe(document.body, { attributes: true, attributeFilter: ["open"], subtree: true });
    function movePage(event) {
      pointer.current = { x: event.clientX, y: event.clientY };
      const rect = fullPage ? { left: 0, top: 0 } : container.current.getBoundingClientRect();
      layer.style.setProperty("--flashlight-x", `${event.clientX - rect.left}px`);
      layer.style.setProperty("--flashlight-y", `${event.clientY - rect.top}px`);
    }
    function focusPage(event) {
      if (!(event.target instanceof Element)) return;
      pointer.current = null;
      const rect = event.target.getBoundingClientRect();
      layer.style.setProperty("--flashlight-x", `${rect.left + rect.width / 2}px`);
      layer.style.setProperty("--flashlight-y", `${rect.top + rect.height / 2}px`);
    }
    function reposition() {
      if (pointer.current) movePage({ clientX: pointer.current.x, clientY: pointer.current.y });
      else if (fullPage && document.activeElement instanceof Element) focusPage({ target: document.activeElement });
    }
    if (fullPage) {
      document.addEventListener("pointermove", movePage, true);
      document.addEventListener("pointerdown", movePage, true);
      document.addEventListener("focusin", focusPage, true);
      if (document.activeElement !== document.body) focusPage({ target: document.activeElement });
    }
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      observer?.disconnect();
      document.removeEventListener("pointermove", movePage, true);
      document.removeEventListener("pointerdown", movePage, true);
      document.removeEventListener("focusin", focusPage, true);
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
      if (fullPage && layer?.matches(":popover-open")) layer.hidePopover();
    };
  }, [on, fullPage]);

  const darkness = on && <div ref={overlay} className={`flashlight__darkness${fullPage ? " flashlight__darkness--page" : ""}`} style={{ "--flashlight-radius": `${safeRadius}px` }} popover={fullPage ? "manual" : undefined} aria-hidden="true" />;

  return (
    <div ref={container} className="flashlight" style={{ "--flashlight-radius": `${safeRadius}px` }} onPointerMove={move} onPointerDown={move} onFocusCapture={focus}>
      {children}
      {fullPage ? createPortal(darkness, document.body) : darkness}
    </div>
  );
}
