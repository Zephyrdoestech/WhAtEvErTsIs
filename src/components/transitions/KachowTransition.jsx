// OWNER: RICKS — see RICKS.MD (Task 4).
// Non-blocking ambient Lightning McQueen drive-by: crosses the full screen from left or right
// at varying intervals and plays kachow.mp3 each time.
import { useEffect, useRef, useState } from "react";
import useBooking from "../../context/useBooking.js";
import lightningImg from "../../assets/images/Lightning-McQueen.png";
import kachowSound from "../../assets/audios/kachow.mp3";
import "./KachowTransition.css";

// Shared uncached audio state so clipped MP3s play reliably without stale 206 range caches.
let kachowAudioCtx = null;
let kachowArrayBuffer = null;
let kachowBlobUrl = null;
let kachowDecodedBuffer = null;
let kachowLoadPromise = null;
let kachowUnlockBound = false;

function getKachowAudioContext() {
  if (typeof window === "undefined") return null;
  if (!kachowAudioCtx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      kachowAudioCtx = new AudioCtx();
    }
  }
  return kachowAudioCtx;
}

function loadKachowSoundAsset() {
  if (kachowLoadPromise) return kachowLoadPromise;
  kachowLoadPromise = fetch(kachowSound, { cache: "no-store" })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.arrayBuffer();
    })
    .then((buf) => {
      kachowArrayBuffer = buf;
      if (!kachowBlobUrl) {
        kachowBlobUrl = URL.createObjectURL(new Blob([buf], { type: "audio/mpeg" }));
      }
      const ctx = getKachowAudioContext();
      if (ctx) {
        return ctx
          .decodeAudioData(buf.slice(0))
          .then((decoded) => {
            kachowDecodedBuffer = decoded;
          })
          .catch(() => {});
      }
      return undefined;
    })
    .catch(() => {
      kachowLoadPromise = null;
    });
  return kachowLoadPromise;
}

function bindKachowAudioUnlock() {
  loadKachowSoundAsset();
  if (typeof window === "undefined" || kachowUnlockBound) return;
  kachowUnlockBound = true;

  const unlock = () => {
    const ctx = getKachowAudioContext();
    if (ctx && ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    if (ctx && kachowArrayBuffer && !kachowDecodedBuffer) {
      ctx
        .decodeAudioData(kachowArrayBuffer.slice(0))
        .then((decoded) => {
          kachowDecodedBuffer = decoded;
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

export default function KachowTransition({ muted = false }) {
  const { demoMode } = useBooking();
  const [run, setRun] = useState(null);
  const runIdRef = useRef(0);
  const activeSourceRef = useRef(null);
  const activeAudioRef = useRef(null);
  const mutedRef = useRef(muted);

  function stopActiveAudio() {
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
  }

  useEffect(() => {
    mutedRef.current = muted;
    if (muted) {
      stopActiveAudio();
    }
  }, [muted]);

  useEffect(() => {
    bindKachowAudioUnlock();

    let waitTimer = null;
    let clearTimer = null;
    let cancelled = false;

    function startDecoded(ctx, buffer) {
      stopActiveAudio();
      const source = ctx.createBufferSource();
      const gain = ctx.createGain();
      source.buffer = buffer;
      gain.gain.value = 1;
      source.connect(gain);
      gain.connect(ctx.destination);
      activeSourceRef.current = source;
      source.onended = () => {
        if (activeSourceRef.current === source) {
          activeSourceRef.current = null;
        }
      };
      source.start(0);
    }

    function playKachowAudio() {
      if (mutedRef.current) return;

      const ctx = getKachowAudioContext();
      if (ctx && kachowDecodedBuffer) {
        if (ctx.state === "running") {
          startDecoded(ctx, kachowDecodedBuffer);
          return;
        }
        const requestedAt = performance.now();
        ctx
          .resume()
          .then(() => {
            if (
              !cancelled &&
              !mutedRef.current &&
              performance.now() - requestedAt < 150 &&
              ctx.state === "running" &&
              kachowDecodedBuffer
            ) {
              startDecoded(ctx, kachowDecodedBuffer);
            }
          })
          .catch(() => {});
        return;
      }

      loadKachowSoundAsset();
      try {
        stopActiveAudio();
        const audio = new Audio(kachowBlobUrl || kachowSound);
        audio.volume = 0.9;
        activeAudioRef.current = audio;
        audio.play().catch(() => {});
      } catch {
        // Ignore browser autoplay or headless audio errors
      }
    }

    function scheduleNextRun(isFirst) {
      const delayMs = isFirst
        ? demoMode
          ? randomBetween(1000, 2200)
          : randomBetween(1500, 3500)
        : demoMode
          ? randomBetween(3000, 7000)
          : randomBetween(5000, 14000);

      waitTimer = window.setTimeout(() => {
        if (cancelled) return;

        const direction = Math.random() < 0.5 ? "ltr" : "rtl";
        const durationMs = Math.round(randomBetween(500, 800));
        const topVh = Math.round(randomBetween(14, 72));
        runIdRef.current += 1;

        setRun({
          id: runIdRef.current,
          direction,
          durationMs,
          topVh,
        });
        playKachowAudio();

        clearTimer = window.setTimeout(() => {
          if (cancelled) return;
          setRun(null);
          scheduleNextRun(false);
        }, durationMs + 120);
      }, delayMs);
    }

    scheduleNextRun(true);

    return () => {
      cancelled = true;
      if (waitTimer) window.clearTimeout(waitTimer);
      if (clearTimer) window.clearTimeout(clearTimer);
      stopActiveAudio();
    };
  }, [demoMode]);

  if (!run) return null;

  return (
    <div className="kachow-layer" aria-hidden="true">
      <div
        key={run.id}
        className={`kachow-runner kachow-runner--${run.direction}`}
        style={{
          "--kachow-top": `${run.topVh}vh`,
          "--kachow-dur": `${run.durationMs}ms`,
        }}
      >
        <div className="kachow-runner__trail" />
        <img src={lightningImg} alt="" className="kachow-runner__car" />
        <span className="kachow-runner__callout display">KA-CHOW!</span>
      </div>
    </div>
  );
}
