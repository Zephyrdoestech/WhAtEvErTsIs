// OWNER: RICKS — see RICKS.MD (Stage 05: Select Flight)
// Temporary ForcefieldButton v1 test area inside the placeholder until Task 5 builds Stage 05.
import { useState } from "react";
import StagePlaceholder from "../../components/layout/StagePlaceholder.jsx";
import ForcefieldButton from "../../components/forcefield/ForcefieldButton.jsx";
import "./SelectFlight.css";

export default function SelectFlight() {
  const [dodges, setDodges] = useState(0);
  const [clicks, setClicks] = useState(0);

  return (
    <StagePlaceholder number={5} title="Select Flight" owner="RICKS">
      <div className="forcefield-test-box">
        <p className="forcefield-test-hint">
          <strong>ForcefieldButton v1 test:</strong> Move fast toward the button to make it flee
          (click anywhere once first if browser blocks sound). Creep slowly to click it.
        </p>
        <div className="forcefield-test-stage">
          <ForcefieldButton
            type="button"
            className="forcefield-test-btn"
            onDodge={() => setDodges((d) => d + 1)}
            onClick={() => setClicks((c) => c + 1)}
          >
            Select Flight (Catch Me)
          </ForcefieldButton>
        </div>
        <p className="forcefield-test-stats">
          Dodges: <strong>{dodges}</strong> · Caught clicks: <strong>{clicks}</strong>
        </p>
      </div>
    </StagePlaceholder>
  );
}
