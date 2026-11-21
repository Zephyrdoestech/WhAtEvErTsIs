// OWNER: KYLE — temporary stand-in each stage shows until its owner builds it.
import useBooking from "../../context/useBooking.js";

export default function StagePlaceholder({ number, title, owner, children }) {
  const { next } = useBooking();
  return (
    <section style={{ background: "#fff", padding: "2rem", borderRadius: 12 }}>
      <h2>Stage {String(number).padStart(2, "0")}: {title}</h2>
      <p style={{ opacity: 0.6 }}>Owner: {owner}. Not built yet, see {owner}.MD.</p>
      {children}
      <button onClick={next}>Next (placeholder)</button>
    </section>
  );
}
