// OWNER: DAR — persistent feature toggle state for the secret /controller page.
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "whatevertsis_controller_config_v1";
const UPDATE_EVENT = "whatevertsis-controller-update";

export const CONTROLLER_FEATURES = [
  {
    key: "muteAllSounds",
    label: "Master Sound Mute",
    category: "global",
    badge: "AUDIO · ALL PAGES",
    icon: "🔇",
    description:
      "When ON, mutes all chaos sound cues (Hee-Hee, Flashbang, Ka-Chow, and page media).",
    defaultEnabled: false,
  },
  {
    key: "airlper",
    label: "Ye Olde Airlper (Jose Mari Chan)",
    category: "global",
    badge: "CHAOS · ALL PAGES",
    icon: "🧙‍♂️",
    description:
      "Floating helper cycling around screen edges every 5s with forgetful Old English chat.",
    defaultEnabled: true,
  },
  {
    key: "heeHee",
    label: "Michael Jackson 'Hee-Hee!' & Page Shake",
    category: "global",
    badge: "CHAOS · ALL PAGES",
    icon: "🕺",
    description:
      "Fires random 'hee-hee!' sound cues and shakes the entire page layout.",
    defaultEnabled: true,
  },
  {
    key: "flashbang",
    label: "Eminem Flashbang → Flashed Cat",
    category: "global",
    badge: "CHAOS · ALL PAGES",
    icon: "💥",
    description:
      "Throws a surprise flashbang with whiteout, ear ringing, and dazed cat reveal.",
    defaultEnabled: true,
  },
  {
    key: "blackout",
    label: "Cabin Brownout / Blackout Overlay",
    category: "global",
    badge: "CHAOS · ALL PAGES",
    icon: "🔦",
    description:
      "Plunges the page into pitch-black darkness until you hunt down the hidden light switch.",
    defaultEnabled: true,
  },
  {
    key: "kachow",
    label: "Lightning McQueen 'KA-CHOW!' Drive-By",
    category: "global",
    badge: "CHAOS · ALL PAGES",
    icon: "🏎️",
    description:
      "Periodic high-speed Lightning McQueen drive-by across the screen with Ka-Chow audio.",
    defaultEnabled: true,
  },
  {
    key: "slowImage",
    label: "Creeping SlowImage Overlay",
    category: "global",
    badge: "CHAOS · ALL PAGES",
    icon: "🃏",
    description:
      "Slowly fades a court jester or meme image over the viewport until shooed away.",
    defaultEnabled: true,
  },
  {
    key: "adPopup",
    label: "Surprise 'Hot Pandesal' Ad Popups",
    category: "global",
    badge: "CHAOS · ALL PAGES",
    icon: "🥖",
    description:
      "Periodic bakery pop-up ads with a tiny dodging close button and combo pop-under.",
    defaultEnabled: true,
  },
  {
    key: "stage01SheaAd",
    label: "Stage 01: Shea Pre-Roll Video Ad",
    category: "stage",
    badge: "STAGE 01 · WELCOME",
    icon: "📺",
    description:
      "Interrupts Stage 01 Welcome page with a video ad where Skip disappears after 5 seconds.",
    defaultEnabled: true,
  },
  {
    key: "stage03DarkMode",
    label: "Stage 03 & 06: Flashlight Darkness Mask",
    category: "stage",
    badge: "STAGE 03 & 06 · DARKNESS",
    icon: "🌙",
    description:
      "Enables the pitch-black flashlight mask in Stage 03 Dark Mode and Stage 06 Seat blackout.",
    defaultEnabled: true,
  },
  {
    key: "stage04Minigame",
    label: "Stage 04: Loading Luggage-Dodge Minigame",
    category: "stage",
    badge: "STAGE 04 · FLIGHTS",
    icon: "✈️",
    description:
      "Shows the 3-lane endless-runner plane minigame & SlowImage before flight results appear.",
    defaultEnabled: true,
  },
  {
    key: "stage05Forcefield",
    label: "Stage 05 & 10: Mouse-Repelling Forcefield Button",
    category: "stage",
    badge: "STAGE 05 & 10 · FORCEFIELD",
    icon: "🧲",
    description:
      "Makes Select Flight and Pay Now buttons dodge fast cursors and play 'nya' / dodge SFX.",
    defaultEnabled: true,
  },
  {
    key: "stage08GuiltTrips",
    label: "Stage 08: Extras Guilt-Trip Modals & Ads",
    category: "stage",
    badge: "STAGE 08 · EXTRAS",
    icon: "🫁",
    description:
      "Triggers guilt confirmation modals ('Are you sure you don't want to breathe?') when declining extras.",
    defaultEnabled: true,
  },
  {
    key: "stage09SlowScrollTerms",
    label: "Stage 09: Slow-Scroll 'Terms & Punishments' Trap",
    category: "stage",
    badge: "STAGE 09 · REVIEW",
    icon: "📜",
    description:
      "Requires slow scrolling through Terms & Punishments (when OFF, auto-unlocks the agreement checkbox).",
    defaultEnabled: true,
  },
];

export const DEFAULT_CONTROLLER_CONFIG = Object.fromEntries(
  CONTROLLER_FEATURES.map((feature) => [feature.key, feature.defaultEnabled])
);

export function loadControllerConfig() {
  if (typeof window === "undefined") {
    return { ...DEFAULT_CONTROLLER_CONFIG };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_CONTROLLER_CONFIG };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return { ...DEFAULT_CONTROLLER_CONFIG };
    }
    const merged = { ...DEFAULT_CONTROLLER_CONFIG };
    for (const feature of CONTROLLER_FEATURES) {
      if (typeof parsed[feature.key] === "boolean") {
        merged[feature.key] = parsed[feature.key];
      }
    }
    return merged;
  } catch {
    return { ...DEFAULT_CONTROLLER_CONFIG };
  }
}

export function saveControllerConfig(nextConfig) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextConfig));
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: nextConfig }));
  } catch {
    // Ignore storage quota errors
  }
}

export function isControllerRoute() {
  if (typeof window === "undefined") return false;
  const cleanPath = window.location.pathname.replace(/\/+$/, "").toLowerCase();
  const cleanHash = window.location.hash.replace(/^#/, "").replace(/\/+$/, "").toLowerCase();
  return cleanPath.endsWith("/controller") || cleanHash.endsWith("/controller");
}

export function useControllerConfig() {
  const [config, setConfig] = useState(() => loadControllerConfig());

  useEffect(() => {
    function handleLocalUpdate(event) {
      if (event?.detail && typeof event.detail === "object") {
        setConfig({ ...DEFAULT_CONTROLLER_CONFIG, ...event.detail });
      } else {
        setConfig(loadControllerConfig());
      }
    }

    function handleStorageEvent(event) {
      if (event.key === STORAGE_KEY || event.key === null) {
        setConfig(loadControllerConfig());
      }
    }

    window.addEventListener(UPDATE_EVENT, handleLocalUpdate);
    window.addEventListener("storage", handleStorageEvent);
    return () => {
      window.removeEventListener(UPDATE_EVENT, handleLocalUpdate);
      window.removeEventListener("storage", handleStorageEvent);
    };
  }, []);

  const setFeature = useCallback((key, enabled) => {
    const current = loadControllerConfig();
    const updated = { ...current, [key]: Boolean(enabled) };
    setConfig(updated);
    saveControllerConfig(updated);
  }, []);

  const toggleFeature = useCallback((key) => {
    const current = loadControllerConfig();
    const updated = { ...current, [key]: !current[key] };
    setConfig(updated);
    saveControllerConfig(updated);
  }, []);

  const setAllFeatures = useCallback((enabled, categoryFilter = null) => {
    const current = loadControllerConfig();
    const updated = { ...current };
    for (const feature of CONTROLLER_FEATURES) {
      if (feature.key === "muteAllSounds") {
        if (!categoryFilter) {
          updated.muteAllSounds = !enabled;
        }
        continue;
      }
      if (!categoryFilter || feature.category === categoryFilter) {
        updated[feature.key] = Boolean(enabled);
      }
    }
    setConfig(updated);
    saveControllerConfig(updated);
  }, []);

  const resetDefaults = useCallback(() => {
    const defaults = { ...DEFAULT_CONTROLLER_CONFIG };
    setConfig(defaults);
    saveControllerConfig(defaults);
  }, []);

  return {
    config,
    setFeature,
    toggleFeature,
    setAllFeatures,
    resetDefaults,
  };
}
