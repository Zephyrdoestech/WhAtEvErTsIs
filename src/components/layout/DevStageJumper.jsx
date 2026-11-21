// OWNER: KYLE — dev-only stage picker. AppShell only renders it when import.meta.env.DEV, so it never ships.
import useBooking from "../../context/useBooking.js";
import { STAGES } from "../../stages/index.js";

export default function DevStageJumper() {
  const { stage, goTo } = useBooking();
  return (
    <label className="dev-jumper">
      DEV: jump to{" "}
      <select value={stage} onChange={(e) => goTo(Number(e.target.value))}>
        {STAGES.map((s) => (
          <option key={s.id} value={s.id}>{s.id}. {s.title} ({s.owner})</option>
        ))}
      </select>
    </label>
  );
}
