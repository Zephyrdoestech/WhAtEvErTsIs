// OWNER: RICKS — see RICKS.MD (Stage 05: Select Flight)
import StagePlaceholder from "../../components/layout/StagePlaceholder.jsx";
import ForcefieldButton from "../../components/forcefield/ForcefieldButton.jsx";
import "./SelectFlight.css";

export default function SelectFlight() {
  return (
    <StagePlaceholder number={5} title="Select Flight" owner="RICKS">
      <div className="select-flight-action">
        <ForcefieldButton type="button" className="select-flight-btn">
          Select Flight
        </ForcefieldButton>
      </div>
    </StagePlaceholder>
  );
}
