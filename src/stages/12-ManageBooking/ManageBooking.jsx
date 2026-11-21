// OWNER: KYLE — see KYLE.MD (Stage 12: Manage Booking). Shows what the user entered in Stages 02-11.
import { useEffect, useState } from "react";
import useBooking from "../../context/useBooking.js";
import { getBooking } from "../../api/client.js";
import "./ManageBooking.css";

export default function ManageBooking() {
  const { booking } = useBooking();
  const { reference, flight, seat, passenger, quote } = booking;
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (!reference) return;
    let live = true;
    getBooking(reference).then((res) => live && setStatus(res.status));
    return () => { live = false; };
  }, [reference]);

  const name = passenger ? `${passenger.firstName ?? ""} ${passenger.lastName ?? ""}`.trim() : booking.user?.name;
  const rows = [
    ["Booking ref.", reference ?? "None (like your gate)"],
    ["Passenger", name || "Unknown human"],
    ["Flight", flight ? `${flight.id} · ${flight.from} → ${flight.to}` : "To be decided by the plane"],
    ["Departure", flight?.depart ?? "Eventually"],
    ["Seat", seat?.code ? `${seat.code}${seat.cls ? ` · ${seat.cls}` : ""}` : "12? · Moving"],
    ["Total paid", quote?.total != null ? `₱${quote.total.toLocaleString()}` : "₱1* (*more)"],
    ["Status", reference ? status ?? "Checking..." : "Not found"],
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
          <button className="btn warn">Modify booking</button>
          <button className="btn">Cancel booking</button>
        </div>
        <p className="manage-note">Changes are free!* (*nothing is free)</p>
      </div>
    </section>
  );
}
