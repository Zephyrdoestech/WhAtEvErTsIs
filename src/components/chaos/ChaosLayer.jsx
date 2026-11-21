// OWNER: DAR — see DAR.MD. Everything that interrupts the user on every page lives here.
// AppShell renders this once on top of all stages.
import Airlper from "./Airlper.jsx";
import HeeHee from "./HeeHee.jsx";

export default function ChaosLayer() {
  return (
    <>
      <Airlper />
      <HeeHee />
    </>
  );
}
