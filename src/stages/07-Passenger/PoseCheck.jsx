// Live preview only: no recording, snapshots, uploads, or saved camera frames.
import { useEffect, useRef, useState } from "react";

const analysis = ["Wingspan: inadequate…", "Aerodynamics: mostly vibes…", "Accepted anyway."];

export default function PoseCheck({ onDone, demoMode = false }) {
  const video = useRef(null);
  const stream = useRef(null);
  const active = useRef(false);
  const request = useRef(0);
  const running = useRef(false);
  const finished = useRef(false);
  const [phase, setPhase] = useState("idle");
  const [hasCamera, setHasCamera] = useState(false);
  const [message, setMessage] = useState("");
  const [count, setCount] = useState(3);
  const [analysisIndex, setAnalysisIndex] = useState(0);

  function stopCamera() {
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
    if (video.current) video.current.srcObject = null;
  }

  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      request.current += 1;
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (phase !== "ready" || !hasCamera || !video.current) return;
    video.current.srcObject = stream.current;
    video.current.play()?.catch(() => {
      if (!active.current || !stream.current) return;
      stopCamera();
      setHasCamera(false);
      setMessage("Preview unavailable. Your refusal has been noted. Pose anyway.");
    });
  }, [phase, hasCamera]);

  useEffect(() => {
    if (phase === "counting") {
      const timer = setTimeout(() => {
        if (count > 1) setCount(count - 1);
        else {
          stopCamera();
          setHasCamera(false);
          setPhase("analysing");
        }
      }, demoMode ? 250 : 1000);
      return () => clearTimeout(timer);
    }
    if (phase === "analysing") {
      const timer = setTimeout(() => {
        if (analysisIndex < analysis.length - 1) setAnalysisIndex(analysisIndex + 1);
        else setPhase("done");
      }, demoMode ? 250 : 900);
      return () => clearTimeout(timer);
    }
  }, [phase, count, analysisIndex, demoMode]);

  async function enableCamera() {
    if (running.current) return;
    running.current = true;
    const ticket = ++request.current;
    setPhase("requesting");
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("Camera unavailable");
      const incoming = await navigator.mediaDevices.getUserMedia({ video: true });
      if (!active.current || ticket !== request.current) {
        incoming.getTracks().forEach((track) => track.stop());
        return;
      }
      stream.current = incoming;
      incoming.getVideoTracks().forEach((track) => {
        track.onended = () => {
          if (!active.current || !stream.current) return;
          stopCamera();
          setHasCamera(false);
          setMessage("Camera disconnected. Pose anyway; imagination is accepted.");
        };
      });
      setHasCamera(true);
      setPhase("ready");
    } catch {
      if (!active.current || ticket !== request.current) return;
      setMessage("Your refusal has been noted. Pose anyway.");
      setPhase("ready");
    } finally {
      running.current = false;
    }
  }

  function noCamera() {
    request.current += 1;
    stopCamera();
    setHasCamera(false);
    setMessage("Your refusal has been noted. Pose anyway.");
    setPhase("ready");
  }

  function skip() {
    request.current += 1;
    stopCamera();
    setHasCamera(false);
    setMessage("Pose skipped. Your imaginary wings are accepted anyway.");
    setPhase("done");
  }

  return <section className="pose" aria-label="Voluntary camera pose check">
    <h3 className="display">Strike your best airplane pose ✈</h3>
    <p>Arms out. Further. Perfectly questionable. Camera use is optional.</p>
    <p className="pose__privacy">Live preview only. Nothing is recorded, uploaded, or saved. Analysis is entirely pretend.</p>
    {(phase === "ready" || phase === "counting") && <div className="pose__preview">
      {hasCamera ? <video ref={video} autoPlay muted playsInline aria-label="Your live camera preview" /> : <div className="pose__placeholder"><span aria-hidden="true">🙆 ✈️</span><p>Imagine your finest airplane pose here.</p></div>}
    </div>}
    <p className="pose__status" role="status" aria-live="polite" aria-atomic="true">{phase === "requesting" ? "Waiting for camera permission. You can continue without it." : phase === "counting" ? `${count}… Hold those wings!` : phase === "analysing" ? analysis[analysisIndex] : phase === "done" ? (message.startsWith("Pose skipped") ? message : "Wingspan: inadequate… Accepted anyway.") : message}</p>
    <div className="pose__actions">
      {phase === "idle" && <button type="button" className="btn go" onClick={enableCamera}>Use camera preview</button>}
      {(phase === "idle" || phase === "requesting") && <button type="button" className="btn" onClick={noCamera}>Continue without camera</button>}
      {phase === "ready" && <button type="button" className="btn go" onClick={() => { if (phase === "ready") setPhase("counting"); }}>Start 3-2-1 pose check</button>}
      {phase === "ready" && !hasCamera && <button type="button" className="btn" onClick={enableCamera}>Try camera again</button>}
      {phase !== "done" && <button type="button" className="btn" onClick={skip}>Skip pose check</button>}
      {phase === "done" && <button type="button" className="btn go" onClick={() => {
        if (finished.current) return;
        finished.current = true;
        stopCamera();
        onDone();
      }}>Continue to verification</button>}
    </div>
  </section>;
}
