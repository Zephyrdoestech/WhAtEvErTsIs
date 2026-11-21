// OWNER: KYLE — see KYLE.MD (Stage 12: Manage Booking). Shows what the user entered in Stages 02-11,
// and every way out of here leads back into the booking flow.
import { useEffect, useState } from "react";
import useBooking from "../../context/useBooking.js";
import { getBooking, cancelBooking } from "../../api/client.js";
import "./ManageBooking.css";

const MODIFY_MESSAGES = [
  "To change your seat, please re-book your entire life.",
  "Modifications are handled by an earlier version of you.",
  "Your change request has been sent back in time.",
];

// Cancel asks 3 to 5 of these in a row, escalating. [question, no-label, yes-label]
const CONFIRMS = [
  ["Are you sure?", "No (recommended)", "Yes"],
  ["Are you SURE sure?", "No", "Yes"],
  ["Are you REALLY sure you are sure?", "No", "Yes"],
  ["Last chance (not the last). Confirm that you wish to confirm?", "Maybe", "Also maybe"],
  ["Okay, but what if you're wrong?", "I'm scared", "I'm sure"],
];

const pick = (list) => list[Math.floor(Math.random() * list.length)];

export default function ManageBooking() {
  const { booking, bumpFrustration, loopBackTo, resetBooking } = useBooking();
  const { reference, flight, seat, passenger, quote } = booking;
  const [status, setStatus] = useState(null);
  // null | { kind: "modify", message, to } | { kind: "confirm", step, total } | { kind: "cancelling" } | { kind: "again" }
  const [dialog, setDialog] = useState(null);

  useEffect(() => {
    if (!reference) return;
    let live = true;
    getBooking(reference).then((res) => live && setStatus(res.status));
    return () => { live = false; };
  }, [reference]);

  function modify() {
    bumpFrustration(5);
    setDialog({ kind: "modify", message: pick(MODIFY_MESSAGES), to: 3 + Math.floor(Math.random() * 7) }); // stage 3-9
  }

  function startCancel() {
    bumpFrustration(5);
    setDialog({ kind: "confirm", step: 0, total: 3 + Math.floor(Math.random() * 3) }); // 3-5 confirmations
  }

  async function confirmYes() {
    const { step, total } = dialog;
    if (step + 1 < total) {
      bumpFrustration(5);
      setDialog({ kind: "confirm", step: step + 1, total });
      return;
    }
    setDialog({ kind: "cancelling" });
    const res = await cancelBooking(reference);
    setStatus(res.status);
    setDialog({ kind: "again" });
  }

  const name = passenger ? `${passenger.firstName ?? ""} ${passenger.lastName ?? ""}`.trim() : booking.user?.name;
  const rows = [
    ["Booking ref.", reference ?? "None (like your gate)"],
    ["Passenger", name || "Unknown human"],
    ["Flight", flight ? `${flight.id} · ${flight.from} → ${flight.to}` : "To be decided by the plane"],
    ["Departure", flight?.depart ?? "Eventually"],
    ["Seat", seat?.code ? `${seat.code}${seat.cls ? ` · ${seat.cls}` : ""}` : "12? · Moving"],
    ["Total paid", quote?.total != null ? `₱${quote.total.toLocaleString()}` : "₱1* (*more)"],
    ["Status", status ?? (reference ? "Checking..." : "Not found")],
  ];

  return (
    <section className="panel manage">
      <h2 className="panel-title">Manage Booking - Step 12 of 12</h2>
      <div className="panel-body">
        <dl className="manage-details">
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <div className="manage-actions">
          <button className="btn warn" onClick={modify}>Modify booking</button>
          <button className="btn" onClick={startCancel}>Cancel booking</button>
        </div>
        <p className="manage-note">Changes are free!* (*nothing is free)</p>
      </div>

      {dialog && (
        <div className="manage-backdrop">
          <div className="panel manage-dialog" role="alertdialog" aria-modal="true" aria-labelledby="manage-dialog-title">
            {dialog.kind === "modify" && (
              <>
                <h3 id="manage-dialog-title" className="panel-title">Modify booking</h3>
                <div className="panel-body">
                  <p>{dialog.message}</p>
                  <p className="manage-note">Taking you back to Step {dialog.to}.</p>
                  <button className="btn go" onClick={() => loopBackTo(dialog.to)}>OK fine</button>
                </div>
              </>
            )}
            {dialog.kind === "confirm" && (
              <>
                <h3 id="manage-dialog-title" className="panel-title red">Cancel booking</h3>
                <div className="panel-body">
                  <p>{CONFIRMS[dialog.step][0]}</p>
                  <div className="manage-actions">
                    <button className="btn" onClick={() => setDialog(null)}>{CONFIRMS[dialog.step][1]}</button>
                    <button className="btn go" onClick={confirmYes}>{CONFIRMS[dialog.step][2]}</button>
                  </div>
                </div>
              </>
            )}
            {dialog.kind === "cancelling" && (
              <>
                <h3 id="manage-dialog-title" className="panel-title red">Cancelling...</h3>
                <div className="panel-body"><p>Un-booking your flight. Please do not un-refresh.</p></div>
              </>
            )}
            {dialog.kind === "again" && (
              <>
                <h3 id="manage-dialog-title" className="panel-title purple">Booking cancelled-ish</h3>
                <div className="panel-body">
                  <p>Book again?</p>
                  <div className="manage-actions">
                    <button className="btn" onClick={resetBooking}>No</button>
                    <button className="btn go" onClick={resetBooking}>Yes</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
