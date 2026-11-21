// OWNER: KYLE — temporary stand-in each stage shows until its owner builds it. Also shows the .panel pattern from index.css.
import useBooking from "../../context/useBooking.js";

export default function StagePlaceholder({ number, title, owner, children }) {
  const { next } = useBooking();
  return (
    <section className="panel">
      <h2 className="panel-title">{title} - Step {number} of 12</h2>
      <div className="panel-body">
        <p>Owner: {owner}. Not built yet, see roles/{owner}.MD.</p>
        {children}
        <button className="btn go" onClick={next}>Next (placeholder)</button>
      </div>
    </section>
  );
}
