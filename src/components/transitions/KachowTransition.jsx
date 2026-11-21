// OWNER: RICKS — see RICKS.MD. Used after agreeing in Stage 09.
// Contract: <KachowTransition onDone={next} />
import { useEffect } from "react";
export default function KachowTransition({ onDone }) {
  useEffect(() => { onDone?.(); }, [onDone]); // TODO(RICKS): play the race-car "Ka-chow!" streak first
  return null;
}
