// OWNER: SYOS — see SYOS.MD (Stage 03: Search Flights)
import { useId, useRef, useState } from "react";
import useBooking from "../../context/useBooking.js";
import { airports } from "./airports.js";
import "./Search.css";

export default function Search() {
  const { booking, updateBooking, next } = useBooking();
  const prefix = useId();
  const submitted = useRef(false);
  const [search, setSearch] = useState(() => ({
    from: booking.search?.from || "MNL",
    to: booking.search?.to || "CEB",
    departDate: booking.search?.departDate || "",
    returnDate: booking.search?.returnDate || "",
    passengers: booking.search?.passengers || 1,
  }));
  const [error, setError] = useState("");
  const [today] = useState(() => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  });

  function change(field, value) {
    setSearch((current) => ({ ...current, [field]: value }));
    setError("");
  }

  function submit(event) {
    event.preventDefault();
    if (submitted.current) return;
    if (!airports.some((airport) => airport.code === search.from)
      || !airports.some((airport) => airport.code === search.to)) {
      setError("Choose two airports from the list. Imaginary runways are closed.");
      return;
    }
    if (search.from === search.to) {
      setError("Choose a different destination. Walking around the airport is not a flight.");
      return;
    }
    if (!search.departDate || search.departDate < today
      || (search.returnDate && search.returnDate < search.departDate)) {
      setError("Check your dates. Our aircraft cannot travel back in time yet.");
      return;
    }
    const passengers = Number(search.passengers);
    if (!Number.isInteger(passengers) || passengers < 1 || passengers > 9) {
      setError("Bring between 1 and 9 passengers. Whole humans only.");
      return;
    }
    submitted.current = true;
    updateBooking({ search: { ...search, passengers } });
    next();
  }

  function airportOptions() {
    return [true, false].map((domestic) => (
      <optgroup key={String(domestic)} label={domestic ? "Philippines" : "International"}>
        {airports.filter((airport) => airport.domestic === domestic).map((airport) => (
          <option key={airport.code} value={airport.code}>{airport.city} ({airport.code}) — {airport.name}</option>
        ))}
      </optgroup>
    ));
  }

  return (
    <section className="panel search" aria-labelledby={`${prefix}-heading`}>
      <h2 className="panel-title" id={`${prefix}-heading`}>Search Flights — Step 03 of 12</h2>
      <div className="panel-body">
        <p className="search__eyebrow">BAHALA NA AIR · FLIGHT SEARCH</p>
        <h3 className="display search__title">Where are we going?</h3>
        <p className="search__intro">Pick your route. We'll provide the plot twists.</p>
        <form onSubmit={submit} className="search__form">
          <div className="search__field">
            <label htmlFor={`${prefix}-from`}>Origin</label>
            <select id={`${prefix}-from`} name="from" value={search.from} onChange={(event) => change("from", event.target.value)} required>{airportOptions()}</select>
          </div>
          <div className="search__field">
            <label htmlFor={`${prefix}-to`}>Destination</label>
            <select id={`${prefix}-to`} name="to" value={search.to} onChange={(event) => change("to", event.target.value)} required>{airportOptions()}</select>
          </div>
          <div className="search__field">
            <label htmlFor={`${prefix}-depart`}>Departure date</label>
            <input id={`${prefix}-depart`} name="departDate" type="date" value={search.departDate} min={today} onChange={(event) => change("departDate", event.target.value)} required />
          </div>
          <div className="search__field">
            <label htmlFor={`${prefix}-return`}>Return date (optional)</label>
            <input id={`${prefix}-return`} name="returnDate" type="date" value={search.returnDate} min={search.departDate || today} onChange={(event) => change("returnDate", event.target.value)} aria-describedby={`${prefix}-oneway`} />
            <span className="search__help" id={`${prefix}-oneway`}>Leave blank for a one-way trip.</span>
          </div>
          <div className="search__field">
            <label htmlFor={`${prefix}-passengers`}>Passengers</label>
            <input id={`${prefix}-passengers`} name="passengers" type="number" min="1" max="9" step="1" value={search.passengers} onChange={(event) => change("passengers", event.target.value)} required aria-describedby={`${prefix}-passenger-help`} />
            <span className="search__help" id={`${prefix}-passenger-help`}>1–9 passengers. Emotional baggage travels separately.</span>
          </div>
          <div className="search__actions">
            <p className="search__notice">Fictional flights only. No real booking or payment.</p>
            <button type="submit" className="btn go">Search flights</button>
          </div>
          <p className="search__error" role="alert">{error}</p>
        </form>
      </div>
    </section>
  );
}
