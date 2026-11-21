// Random "Think Fast Chucklenuts"-style Eminem flashbang:
// 0.2s Eminem pop (no backdrop) -> instant hard-cut pure-white glowing flash + Flashbang SFX
// -> white fades out to reveal flashed cat afterimage -> cat fades out to page.
import { useCallback, useEffect, useRef, useState } from "react";
import useBooking from "../../context/useBooking.js";
import eminemImg from "../../assets/images/emenim flashbang.jpg";
import flashedCatImg from "../../assets/images/flashed cat.jpg";
import flashbangSfx from "../../assets/audios/sfx/Flashbang Sfx.mp3";
import "./Flashbang.css";

const THROW_DURATION_MS = 200; // 0.2s Eminem flashbang throw
const WHITE_HOLD_MS = 1100; // solid blinding white flash hold
const CAT_REVEAL_AND_FADE_MS = 4750; // white dissolves to flashed cat, then cat fades out (~5.85s total SFX)

let fbAudioCtx = null;
let fbArrayBuffer = null;
let fbBlobUrl = null;
let fbDecodedBuffer = null;
let fbLoadPromise = null;
let fbUnlockBound = false;

function getFlashbangAudioContext() {
  if (typeof window === "undefined") return null;
  if (!fbAudioCtx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) fbAudioCtx = new AudioCtx();
  }
  return fbAudioCtx;
}

function loadFlashbangAudio() {
  if (fbLoadPromise) return fbLoadPromise;
  fbLoadPromise = fetch(flashbangSfx, { cache: "no-store" })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.arrayBuffer();
    })
    .then((buf) => {
      fbArrayBuffer = buf;
      if (!fbBlobUrl) {
        fbBlobUrl = URL.createObjectURL(new Blob([buf], { type: "audio/mpeg" }));
      }
      const ctx = getFlashbangAudioContext();
      if (ctx) {
        return ctx
          .decodeAudioData(buf.slice(0))
          .then((decoded) => {
            fbDecodedBuffer = decoded;
          })
          .catch(() => {});
      }
      return undefined;
    })
    .catch(() => {
      fbLoadPromise = null;
    });
  return fbLoadPromise;
}

function bindFlashbangAudioUnlock() {
  loadFlashbangAudio();
  if (typeof window === "undefined" || fbUnlockBound) return;
  fbUnlockBound = true;

  const unlock = () => {
    const ctx = getFlashbangAudioContext();
    if (ctx && ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    if (ctx && fbArrayBuffer && !fbDecodedBuffer) {
      ctx
        .decodeAudioData(fbArrayBuffer.slice(0))
        .then((decoded) => {
          fbDecodedBuffer = decoded;
        })
        .catch(() => {});
    }
  };

  window.addEventListener("pointerdown", unlock, { capture: true, passive: true });
  window.addEventListener("keydown", unlock, { capture: true, passive: true });
  window.addEventListener("touchstart", unlock, { capture: true, passive: true });
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

export default function Flashbang({ muted = false }) {
  const { stage, demoMode, bumpFrustration } = useBooking() ?? {};
  // "idle" | "throw" | "flash" | "cat"
  const [phase, setPhase] = useState("idle");

  const waitTimerRef = useRef(null);
  const seqTimersRef = useRef([]);
  const activeSourceRef = useRef(null);
  const activeAudioRef = useRef(null);
  const mutedRef = useRef(muted);
  const bumpRef = useRef(bumpFrustration);

  useEffect(() => {
    bumpRef.current = bumpFrustration;
  }, [bumpFrustration]);

  const clearSequenceTimers = useCallback(() => {
    for (const id of seqTimersRef.current) {
      window.clearTimeout(id);
    }
    seqTimersRef.current = [];
  }, []);

  const stopAudio = useCallback(() => {
    if (activeSourceRef.current) {
      try {
        activeSourceRef.current.stop();
      } catch {
        // Already stopped
      }
      activeSourceRef.current = null;
    }
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }
  }, []);

  const playFlashbangSfx = useCallback(() => {
    if (mutedRef.current) return;

    const ctx = getFlashbangAudioContext();
    if (ctx && fbDecodedBuffer) {
      const start = () => {
        stopAudio();
        const source = ctx.createBufferSource();
        const gain = ctx.createGain();
        source.buffer = fbDecodedBuffer;
        gain.gain.value = 0.85;
        source.connect(gain);
        gain.connect(ctx.destination);
        activeSourceRef.current = source;
        source.onended = () => {
          if (activeSourceRef.current === source) activeSourceRef.current = null;
        };
        source.start(0);
      };

      if (ctx.state === "running") {
        start();
        return;
      }
      const requestedAt = performance.now();
      ctx
        .resume()
        .then(() => {
          if (!mutedRef.current && performance.now() - requestedAt < 150 && ctx.state === "running") {
            start();
          }
        })
        .catch(() => {});
      return;
    }

    loadFlashbangAudio();
    try {
      stopAudio();
      const audio = new Audio(fbBlobUrl || flashbangSfx);
      audio.volume = 0.85;
      activeAudioRef.current = audio;
      audio.play().catch(() => {});
    } catch {
      // Ignore autoplay/headless audio errors
    }
  }, [stopAudio]);

  const dismiss = useCallback(() => {
    clearSequenceTimers();
    stopAudio();
    setPhase("idle");
  }, [clearSequenceTimers, stopAudio]);

  const triggerFlashbang = useCallback(() => {
    clearSequenceTimers();
    stopAudio();
    setPhase("throw");
    bumpRef.current?.(4);

    // 0.2s Eminem throw -> instant hard-cut glowing white full-screen flash + SFX
    const flashTimer = window.setTimeout(() => {
      setPhase("flash");
      playFlashbangSfx();

      // After peak white flash hold -> dissolve white to reveal flashed cat afterimage
      const catTimer = window.setTimeout(() => {
        setPhase("cat");

        const endTimer = window.setTimeout(() => {
          stopAudio();
          setPhase("idle");
        }, CAT_REVEAL_AND_FADE_MS);
        seqTimersRef.current.push(endTimer);
      }, WHITE_HOLD_MS);

      seqTimersRef.current.push(catTimer);
    }, THROW_DURATION_MS);

    seqTimersRef.current.push(flashTimer);
  }, [clearSequenceTimers, playFlashbangSfx, stopAudio]);

  useEffect(() => {
    mutedRef.current = muted;
    if (muted) stopAudio();
  }, [muted, stopAudio]);

  useEffect(() => {
    bindFlashbangAudioUnlock();

    if (import.meta.env.DEV) {
      window.triggerFlashbang = triggerFlashbang;
    }

    return () => {
      if (import.meta.env.DEV && window.triggerFlashbang === triggerFlashbang) {
        delete window.triggerFlashbang;
      }
      clearSequenceTimers();
      stopAudio();
    };
  }, [clearSequenceTimers, stopAudio, triggerFlashbang]);

  // Schedule next random flashbang ONLY while idle (separate from sequence timers so phase changes never cancel the flash!).
  useEffect(() => {
    if (stage === 1 || phase !== "idle") return undefined;

    const waitMs = demoMode ? randomBetween(14000, 26000) : randomBetween(35000, 75000);
    waitTimerRef.current = window.setTimeout(() => {
      triggerFlashbang();
    }, waitMs);

    return () => {
      if (waitTimerRef.current) {
        window.clearTimeout(waitTimerRef.current);
        waitTimerRef.current = null;
      }
    };
  }, [stage, demoMode, phase, triggerFlashbang]);

  if (phase === "idle") return null;

  return (
    <div
      className={`flashbang flashbang--${phase}`}
      role="alert"
      aria-live="assertive"
      aria-label="Flashbang!"
    >
      {phase === "throw" && (
        <img src={eminemImg} alt="Eminem throwing a flashbang" className="flashbang__eminem" />
      )}

      {phase === "flash" && <div className="flashbang__whiteout flashbang__whiteout--peak" />}

      {phase === "cat" && (
        <>
          <img src={flashedCatImg} alt="Blinded cat" className="flashbang__cat" />
          <div className="flashbang__whiteout flashbang__whiteout--dissolve" />
        </>
      )}

      <button type="button" className="btn warn flashbang__skip" onClick={dismiss}>
        Skip Flash
      </button>
    </div>
  );
}
