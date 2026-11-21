// OWNER: SYOS — see SYOS.MD. Used by Stage 03 dark mode (SYOS) and Stage 06 random darkness (RICKS).
// Contract: <Flashlight on={true} radius={120}>...content...</Flashlight>
// When on, everything is pitch black except a circle around the cursor.
export default function Flashlight({ on = false, radius = 120, children }) {
  void on; void radius; // TODO(SYOS)
  return <div style={{ position: "relative" }}>{children}</div>;
}
