// OWNER: KYLE — see KYLE.MD. Other people raise it with bumpFrustration(n) from useBooking().
import useBooking from "../../context/useBooking.js";

export default function FrustrationMeter() {
  const { frustration } = useBooking();
  return <span title="Frustration meter">😐 {frustration}%</span>;
}
