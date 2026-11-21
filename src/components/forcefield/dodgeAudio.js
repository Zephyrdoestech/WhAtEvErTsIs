// OWNER: RICKS — low-latency Web Audio player (with HTMLAudio fallback) for ForcefieldButton dodge SFX.
import dodgeSoundUrl from "../../assets/audios/sfx/Pou Nah Sound Effect.mp3";

let audioCtx = null;
let rawArrayBufferPromise = null;
let decodedBuffer = null;
let decodePromise = null;
let unlockBound = false;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      audioCtx = new AudioCtx();
    }
  }
  return audioCtx;
}

function fetchSoundData() {
  if (!rawArrayBufferPromise) {
    rawArrayBufferPromise = fetch(dodgeSoundUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.arrayBuffer();
      })
      .catch(() => {
        rawArrayBufferPromise = null;
        return null;
      });
  }
  return rawArrayBufferPromise;
}

function ensureDecoded() {
  if (decodedBuffer) return Promise.resolve(decodedBuffer);
  if (decodePromise) return decodePromise;

  const ctx = getAudioContext();
  if (!ctx) return Promise.resolve(null);

  decodePromise = fetchSoundData()
    .then((arrayBuffer) => {
      if (!arrayBuffer) return null;
      // Copy buffer so decodeAudioData can detach safely without breaking retries
      return ctx.decodeAudioData(arrayBuffer.slice(0));
    })
    .then((buffer) => {
      if (buffer) decodedBuffer = buffer;
      return decodedBuffer;
    })
    .catch(() => {
      decodePromise = null;
      return null;
    });

  return decodePromise;
}

export function primeDodgeAudio() {
  fetchSoundData();

  if (typeof window === "undefined" || unlockBound) return;
  unlockBound = true;

  const unlock = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    ensureDecoded();
  };

  window.addEventListener("pointerdown", unlock, { capture: true, passive: true });
  window.addEventListener("keydown", unlock, { capture: true, passive: true });
  window.addEventListener("touchstart", unlock, { capture: true, passive: true });

  // If the page already has user activation (e.g. navigated from an earlier stage), decode right away.
  if (navigator.userActivation?.hasBeenActive) {
    unlock();
  }
}

function playHtmlAudioFallback() {
  try {
    const audio = new Audio(dodgeSoundUrl);
    audio.volume = 1;
    audio.play().catch(() => {});
  } catch {
    // Ignore autoplay or environment audio errors
  }
}

export function playDodgeAudio() {
  const ctx = getAudioContext();
  if (!ctx) {
    playHtmlAudioFallback();
    return;
  }

  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }

  if (decodedBuffer && ctx.state === "running") {
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    source.buffer = decodedBuffer;
    // Boost slightly because the source clip averages around -21 dB (peak -5.1 dB).
    gain.gain.value = 1.6;
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start(0);
    return;
  }

  // Trigger decode for subsequent dodges and fall back immediately for this one.
  ensureDecoded().then((buffer) => {
    if (buffer && ctx.state === "running") {
      const source = ctx.createBufferSource();
      const gain = ctx.createGain();
      source.buffer = buffer;
      gain.gain.value = 1.6;
      source.connect(gain);
      gain.connect(ctx.destination);
      source.start(0);
    }
  });
  if (ctx.state !== "running") {
    playHtmlAudioFallback();
  }
}
