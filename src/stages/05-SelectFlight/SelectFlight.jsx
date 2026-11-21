// OWNER: RICKS — see RICKS.MD (Stage 05: Select Flight)
import { useState } from "react";
import useBooking from "../../context/useBooking.js";
import StagePlaceholder from "../../components/layout/StagePlaceholder.jsx";
import ForcefieldButton from "../../components/forcefield/ForcefieldButton.jsx";
import FireTransition from "../../components/transitions/FireTransition.jsx";
import "./SelectFlight.css";

export default function SelectFlight() {
  const { next } = useBooking();
  const [showFire, setShowFire] = useState(false);

  return (
    <StagePlaceholder number={5} title="Select Flight" owner="RICKS">
      <div className="select-flight-action">
        <ForcefieldButton
          type="button"
          className="select-flight-btn"
          onClick={() => setShowFire(true)}
        >
          Select Flight
        </ForcefieldButton>
      </div>
      {showFire && <FireTransition onDone={next} />}
    </StagePlaceholder>
  );
}
