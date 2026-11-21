// OWNER: DIN — see DIN.MD (Stage 10: Payment)
// Replace the placeholder with the real stage. Call next() from useBooking() when the user gets through.
import StagePlaceholder from "../../components/layout/StagePlaceholder.jsx";
import "./Payment.css";

export default function Payment() {
  return <StagePlaceholder number={10} title="Payment" owner="DIN" />;
}
