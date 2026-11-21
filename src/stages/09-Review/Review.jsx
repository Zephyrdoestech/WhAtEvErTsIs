// OWNER: RICKS — see RICKS.MD (Stage 09: Review Booking)
import { useState } from "react";
import useBooking from "../../context/useBooking.js";
import StagePlaceholder from "../../components/layout/StagePlaceholder.jsx";
import KachowTransition from "../../components/transitions/KachowTransition.jsx";
import "./Review.css";

export default function Review() {
  const { next } = useBooking();
  const [showKachow, setShowKachow] = useState(false);

  return (
    <StagePlaceholder number={9} title="Review Booking" owner="RICKS">
      <div style={{ margin: "1rem 0" }}>
        <button type="button" onClick={() => setShowKachow(true)}>
          Preview KA-CHOW! Transition
        </button>
      </div>
      {showKachow && <KachowTransition onDone={next} />}
    </StagePlaceholder>
  );
}
