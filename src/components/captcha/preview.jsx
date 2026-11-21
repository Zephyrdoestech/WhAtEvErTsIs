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
  const [chain, setChain] = useState(() => {
    const requested = Number(new URLSearchParams(window.location.search).get("chain"));
    return [1, 3, 4, 6].includes(requested) ? requested : 3;
  });

  return (
    <main style={{ maxWidth: "30rem", margin: "1rem auto", padding: "0 0.75rem" }}>
      <h1 className="display">CAPTCHA chaining preview</h1>
      <p>Follow each challenge's fine print. Failures reset the streak; the first robot answer is always rejected.</p>
      <label htmlFor="preview-chain">Challenges in a row: </label>
      <select id="preview-chain" value={chain} onChange={(event) => setChain(Number(event.target.value))} style={{ font: "inherit", minHeight: "2.75rem" }}>
        {[1, 3, 4, 6].map((count) => <option key={count} value={count}>{count}</option>)}
      </select>
      <p>Pass callbacks: {passes} · Fail callbacks: {failures} · Frustration: {frustration}</p>
      <Captcha key={`${chain}-${attempt}`} chain={chain} onPass={() => setPasses((count) => count + 1)} onFail={() => setFailures((count) => count + 1)} />
      <button type="button" className="btn" style={{ marginTop: "1rem" }} onClick={() => setAttempt((count) => count + 1)}>Start another CAPTCHA</button>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<BookingProvider><CaptchaPreview /></BookingProvider>);
