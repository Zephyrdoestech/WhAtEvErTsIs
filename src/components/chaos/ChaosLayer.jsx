// OWNER: DAR — see DAR.MD. Everything that interrupts the user on every page lives here.
// AppShell renders this once on top of all stages.
import { useEffect, useState } from "react";
import useBooking from "../../context/useBooking.js";
import KachowTransition from "../transitions/KachowTransition.jsx";
import AdPopup from "./AdPopup.jsx";
import Airlper from "./Airlper.jsx";
import BlackoutOverlay from "./BlackoutOverlay.jsx";
import ChaosController from "./ChaosController.jsx";
import Flashbang from "./Flashbang.jsx";
import "./ChaosLayer.css";
import {
  isControllerRoute,
  useControllerConfig,
} from "./controllerConfig.js";
import HeeHee from "./HeeHee.jsx";
import SlowImage from "./SlowImage.jsx";

export default function ChaosLayer() {
  const { stage, demoMode } = useBooking() ?? {};
  const { config } = useControllerConfig();
  const [onControllerPage, setOnControllerPage] = useState(() =>
    isControllerRoute()
  );
  const [adOpenForStage, setAdOpenForStage] = useState(null);

  const muted = Boolean(config.muteAllSounds);
  // Respect the OS "reduce motion" setting: no whiteouts or blackouts for those users.
  const [reducedMotion] = useState(
    () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false
  );
  const surpriseAdOpen =
    Boolean(config.adPopup) &&
    adOpenForStage !== null &&
    adOpenForStage === stage;

  // Listen for browser back/forward or hash changes to /controller
  useEffect(() => {
    function checkRoute() {
      setOnControllerPage(isControllerRoute());
    }
    window.addEventListener("popstate", checkRoute);
    window.addEventListener("hashchange", checkRoute);
    return () => {
      window.removeEventListener("popstate", checkRoute);
      window.removeEventListener("hashchange", checkRoute);
    };
  }, []);

  // Sync stage-level CSS & DOM overrides from controller config
  useEffect(() => {
    document.body.dataset.ctrlNoDarkness = String(!config.stage03DarkMode);
    document.body.dataset.ctrlNoForcefield = String(!config.stage05Forcefield);
  }, [config.stage03DarkMode, config.stage05Forcefield]);

  // When Forcefield is disabled in /controller, stop mousemove from reaching ForcefieldButton's dodge sensor
  useEffect(() => {
    if (config.stage05Forcefield) return undefined;

    function blockForcefieldDodge(event) {
      if (
        event.target instanceof Element &&
        event.target.closest(".forcefield-wrap")
      ) {
        event.stopPropagation();
      }
    }

    window.addEventListener("mousemove", blockForcefieldDodge, true);
    window.addEventListener("pointermove", blockForcefieldDodge, true);
    window.addEventListener("touchstart", blockForcefieldDodge, true);
    return () => {
      window.removeEventListener("mousemove", blockForcefieldDodge, true);
      window.removeEventListener("pointermove", blockForcefieldDodge, true);
      window.removeEventListener("touchstart", blockForcefieldDodge, true);
    };
  }, [config.stage05Forcefield]);

  // When Stage 01 Shea Ad is disabled in /controller, auto-click the skip button as soon as it appears
  useEffect(() => {
    if (config.stage01SheaAd || stage !== 1 || onControllerPage) return undefined;

    const timerId = window.setInterval(() => {
      const skipBtn = document.querySelector(".shea-ad-skip");
      if (skipBtn instanceof HTMLElement) {
        skipBtn.click();
      }
    }, 120);

    return () => window.clearInterval(timerId);
  }, [config.stage01SheaAd, stage, onControllerPage]);

  // When Stage 09 Slow-Scroll Terms trap is disabled in /controller, smoothly advance the terms box to unlock agreement
  useEffect(() => {
    if (config.stage09SlowScrollTerms || stage !== 9 || onControllerPage) {
      return undefined;
    }

    const timerId = window.setInterval(() => {
      const termsBox = document.querySelector(".terms-box");
      if (termsBox instanceof HTMLElement) {
        const maxScroll = termsBox.scrollHeight - termsBox.clientHeight;
        if (maxScroll > 0 && termsBox.scrollTop < maxScroll - 4) {
          termsBox.scrollTop = Math.min(maxScroll, termsBox.scrollTop + 18);
          termsBox.dispatchEvent(new Event("scroll", { bubbles: true }));
        }
      }
    }, 60);

    return () => window.clearInterval(timerId);
  }, [config.stage09SlowScrollTerms, stage, onControllerPage]);

  // Periodically pop open a surprise AdPopup on stages that don't already have heavy modal gauntlets
  useEffect(() => {
    if (!config.adPopup || onControllerPage) return undefined;
    if (surpriseAdOpen) return undefined;
    if (stage === 1 || stage === 8 || stage === 10) return undefined;

    const delay = demoMode ? 16000 : 42000;
    const timerId = window.setTimeout(() => {
      setAdOpenForStage(stage);
    }, delay);

    return () => window.clearTimeout(timerId);
  }, [config.adPopup, demoMode, onControllerPage, stage, surpriseAdOpen]);

  // If the user navigated manually to /controller, show the full-screen Feature Controller page
  if (onControllerPage) {
    return (
      <ChaosController
        onExitController={() => setOnControllerPage(false)}
      />
    );
  }

  return (
    <>
      {config.airlper && <Airlper />}
      {config.heeHee && <HeeHee muted={muted} />}
      {config.blackout && !reducedMotion && <BlackoutOverlay />}
      {config.flashbang && !reducedMotion && <Flashbang muted={muted} />}
      {config.kachow && <KachowTransition muted={muted} />}
      {config.slowImage && stage !== 4 && (
        <SlowImage
          duration={demoMode ? 10000 : 30000}
          maxOpacity={0.55}
        />
      )}
      {config.adPopup && (
        <AdPopup
          open={surpriseAdOpen}
          onClose={() => setAdOpenForStage(null)}
        />
      )}
    </>
  );
}
