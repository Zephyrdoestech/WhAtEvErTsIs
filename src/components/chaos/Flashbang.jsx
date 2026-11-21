// Occasional Eminem pop, brief flash, and flashed-cat afterimage.
import { useCallback, useEffect, useRef, useState } from "react";
import useBooking from "../../context/useBooking.js";
import eminemImg from "../../assets/images/emenim flashbang.jpg";
import flashedCatImg from "../../assets/images/flashed cat.jpg";
import flashbangSfx from "../../assets/audios/sfx/Flashbang Sfx.mp3";
import "./Flashbang.css";

const THROW_MS = 200;
const FLASH_MS = 850;
const CAT_MS = 4200;

let audioContext = null;
let decodedSound = null;
let audioLoad = null;

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function getAudioContext() {
  if (typeof window === "undefined") return null;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (AudioContext && !audioContext) audioContext = new AudioContext();
  return audioContext;
}

function preloadSound() {
  if (audioLoad) return audioLoad;
  audioLoad = fetch(flashbangSfx)
    .then((response) => {
      if (!response.ok) throw new Error("Flashbang audio failed to load");
      return response.arrayBuffer();
    })
    .then((buffer) => {
      const context = getAudioContext();
      if (context) return context.decodeAudioData(buffer).then((decoded) => { decodedSound = decoded; });
      return undefined;
    })
    .catch(() => { audioLoad = null; });
  return audioLoad;
}

export default function Flashbang({ muted = false }) {
  const { stage, demoMode, bumpFrustration } = useBooking();
  const [phase, setPhase] = useState("idle");
  const sequenceTimers = useRef([]);
  const audio = useRef(null);
  const audioSource = useRef(null);
  const mutedRef = useRef(muted);

  const clearSequence = useCallback(() => {
    sequenceTimers.current.forEach((timer) => window.clearTimeout(timer));
    sequenceTimers.current = [];
  }, []);

  const stopAudio = useCallback(() => {
    if (audioSource.current) {
      try {
        audioSource.current.stop();
      } catch {
        // It may already have ended.
      }
      audioSource.current = null;
    }
    if (!audio.current) return;
    audio.current.pause();
    audio.current.currentTime = 0;
    audio.current = null;
  }, []);

  const playSound = useCallback(() => {
    if (mutedRef.current) return;
    const context = getAudioContext();
    if (context && decodedSound && context.state === "running") {
      const source = context.createBufferSource();
      const gain = context.createGain();
      source.buffer = decodedSound;
      gain.gain.value = 0.65;
      source.connect(gain);
      gain.connect(context.destination);
      audioSource.current = source;
      source.onended = () => {
        if (audioSource.current === source) audioSource.current = null;
      };
      source.start();
      return;
    }

    const sound = new Audio(flashbangSfx);
    sound.volume = 0.65;
    audio.current = sound;
    sound.play().catch(() => {});
  }, []);

  const dismiss = useCallback(() => {
    clearSequence();
    stopAudio();
    setPhase("idle");
  }, [clearSequence, stopAudio]);

  const trigger = useCallback(() => {
    clearSequence();
    stopAudio();
    bumpFrustration(4);
    setPhase("throw");

    sequenceTimers.current.push(window.setTimeout(() => {
      setPhase("flash");
      playSound();

      sequenceTimers.current.push(window.setTimeout(() => {
        setPhase("cat");
        sequenceTimers.current.push(window.setTimeout(() => {
          stopAudio();
          setPhase("idle");
        }, CAT_MS));
      }, FLASH_MS));
    }, THROW_MS));
  }, [bumpFrustration, clearSequence, playSound, stopAudio]);

  useEffect(() => {
    mutedRef.current = muted;
    if (muted) stopAudio();
  }, [muted, stopAudio]);

  useEffect(() => {
    preloadSound();
    const context = getAudioContext();
    function unlockAudio() {
      if (context?.state === "suspended") context.resume().catch(() => {});
    }
    window.addEventListener("pointerdown", unlockAudio, { capture: true, passive: true });
    window.addEventListener("keydown", unlockAudio, { capture: true, passive: true });
    return () => {
      window.removeEventListener("pointerdown", unlockAudio, true);
      window.removeEventListener("keydown", unlockAudio, true);
    };
  }, []);

  useEffect(() => {
    if (stage === 1 || phase !== "idle") return undefined;
    const delay = demoMode ? randomBetween(14000, 26000) : randomBetween(35000, 75000);
    const timer = window.setTimeout(trigger, delay);
    return () => window.clearTimeout(timer);
  }, [demoMode, phase, stage, trigger]);

  useEffect(() => () => {
    clearSequence();
    stopAudio();
  }, [clearSequence, stopAudio]);

  if (phase === "idle") return null;

  return (
    <div className={`flashbang flashbang--${phase}`} role="status" aria-live="polite" aria-label="Flashbang">
      {phase === "throw" && <img src={eminemImg} alt="Eminem throwing a flashbang" className="flashbang__eminem" />}
      {phase === "flash" && <div className="flashbang__whiteout" />}
      {phase === "cat" && (
        <>
          <img src={flashedCatImg} alt="A flashed cat" className="flashbang__cat" />
          <div className="flashbang__whiteout flashbang__whiteout--dissolve" />
        </>
      )}
      <button type="button" className="btn warn flashbang__skip" onClick={dismiss}>Skip Flash</button>
    </div>
  );
}
