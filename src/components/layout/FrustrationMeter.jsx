// OWNER: KYLE — see KYLE.MD. Other people raise it with bumpFrustration(n) from useBooking().
import useBooking from "../../context/useBooking.js";

const FACES = ["😊", "😐", "😠", "🤬", "💀"];

export default function FrustrationMeter() {
  const { frustration, loopCount } = useBooking();
  const face = FACES[Math.min(FACES.length - 1, Math.floor(frustration / 20))];
  return (
    <div className="frustration-meter" role="meter" aria-label="Frustration meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={frustration}>
      <div className="frustration-head">
        {/* key remounts the face on every change so the pop animation replays */}
        <span key={frustration} className="frustration-face" aria-hidden="true">{face}</span>
        <span>FRUSTRATION METER: {frustration}%</span>
      </div>
      <div className="frustration-track">
        <div className="frustration-fill" style={{ width: `${frustration}%` }} />
      </div>
      <small className="frustration-loops">Loops survived: {loopCount}</small>
    </div>
  );
}
