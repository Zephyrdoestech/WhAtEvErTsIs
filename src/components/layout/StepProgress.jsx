// OWNER: KYLE — 12 dots that follow the current stage, and now and then slip back one step.
import { useEffect, useState } from "react";
import useBooking from "../../context/useBooking.js";
import { STAGES } from "../../stages/index.js";

export default function StepProgress() {
  const { stage } = useBooking();
  const [slipping, setSlipping] = useState(false);

  // Every 8-20s, show one step less for 700ms. Purely visual: the real stage never changes.
  useEffect(() => {
    let timer;
    const schedule = () => {
      timer = setTimeout(() => {
        setSlipping(true);
        timer = setTimeout(() => {
          setSlipping(false);
          schedule();
        }, 700);
      }, 8000 + Math.random() * 12000);
    };
    schedule();
    return () => clearTimeout(timer);
  }, []);

  const shown = slipping ? Math.max(1, stage - 1) : stage;

  return (
    <ol className={`step-progress${slipping ? " slipping" : ""}`} aria-label={`Step ${stage} of 12`}>
      {STAGES.map((s) => (
        <li
          key={s.id}
          title={s.title}
          className={s.id < shown ? "done" : s.id === shown ? "current" : ""}
        />
      ))}
    </ol>
  );
}
