// OWNER: RICKS — see RICKS.MD. Used after Stage 05 select.
// Contract: render it, it plays, then calls onDone(). <FireTransition onDone={next} />
import { useEffect } from "react";
export default function FireTransition({ onDone }) {
  useEffect(() => { onDone?.(); }, [onDone]); // TODO(RICKS): play the fire animation first
  return null;
}
