// Isolated development preview; stage integration belongs to later roadmap tasks.
import { useState } from "react";
import { createRoot } from "react-dom/client";
import BookingProvider from "../../context/BookingProvider.jsx";
import useBooking from "../../context/useBooking.js";
import "../../index.css";
import Captcha from "./Captcha.jsx";

function CaptchaPreview() {
  const { frustration } = useBooking();
  const [attempt, setAttempt] = useState(0);
  const [passes, setPasses] = useState(0);
  const [failures, setFailures] = useState(0);

  return (
    <main style={{ maxWidth: "30rem", margin: "1rem auto", padding: "0 0.75rem" }}>
      <h1 className="display">CAPTCHA v1 preview</h1>
      <p>Select a wrong answer and verify, then follow the next grid's fine print to pass.</p>
      <p>Pass callbacks: {passes} · Fail callbacks: {failures} · Frustration: {frustration}</p>
      <Captcha key={attempt} onPass={() => setPasses((count) => count + 1)} onFail={() => setFailures((count) => count + 1)} />
      <button type="button" className="btn" style={{ marginTop: "1rem" }} onClick={() => setAttempt((count) => count + 1)}>Start another CAPTCHA</button>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<BookingProvider><CaptchaPreview /></BookingProvider>);
