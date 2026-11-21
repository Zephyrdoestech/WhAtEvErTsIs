// OWNER: KYLE — see KYLE.MD. Other people raise it with bumpFrustration(n) from useBooking().
import useBooking from "../../context/useBooking.js";

export default function FrustrationMeter() {
  const { frustration } = useBooking();
  return (
    <div className="frustration-meter" role="meter" aria-label="Frustration meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={frustration}>
      <span>FRUSTRATION METER: {frustration}%</span>
      <div className="frustration-track">
        <div className="frustration-fill" style={{ width: `${frustration}%` }} />
      </div>
    </div>
  );
}
