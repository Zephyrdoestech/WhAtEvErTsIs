// OWNER: SYOS — see SYOS.MD (Stage 03: Search Flights)
import { useEffect, useId, useRef, useState } from "react";
import useBooking from "../../context/useBooking.js";
import Flashlight from "../../components/flashlight/Flashlight.jsx";
import { airports } from "./airports.js";
import "./Search.css";

export default function Search() {
  const { booking, updateBooking, next, bumpFrustration } = useBooking();
  const prefix = useId();
  const submitted = useRef(false);
  const dialog = useRef(null);
  const [tourism, setTourism] = useState(null);
  const [allowedAbroad, setAllowedAbroad] = useState("");
  const [dark, setDark] = useState(false);
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

  useEffect(() => {
    if (tourism && !dialog.current.open) {
      dialog.current.showModal();
      dialog.current.querySelector(".search-tourism__primary")?.focus();
    }
    if (!tourism && dialog.current.open) dialog.current.close();
  }, [tourism]);

  function saveSearch(value) {
    if (submitted.current) return;
    submitted.current = true;
    updateBooking({ search: { ...value, passengers: Number(value.passengers) } });
    next();
  }

  function change(field, value) {
    setSearch((current) => ({ ...current, [field]: value }));
    setError("");
    if (field === "to") {
      setAllowedAbroad("");
      if (airports.find((airport) => airport.code === value)?.domestic === false) {
        setTourism({ destination: value, tries: 0, searching: false });
      }
    }
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
    if (!airports.find((airport) => airport.code === search.to).domestic && allowedAbroad !== search.to) {
      setTourism({ destination: search.to, tries: 0, searching: true });
      return;
    }
    saveSearch(search);
  }

  function choosePhilippines() {
    const domestic = airports.filter((airport) => airport.domestic && airport.code !== search.from);
    const destination = domestic[Math.floor(Math.random() * domestic.length)].code;
    const changed = { ...search, to: destination };
    setSearch(changed);
    setAllowedAbroad("");
    setTourism(null);
    if (tourism.searching) saveSearch(changed);
  }

  function continueAbroad() {
    if (!tourism) return;
    const tries = tourism.tries + 1;
    bumpFrustration(5);
    if (tries >= 3) {
      setAllowedAbroad(tourism.destination);
      setTourism(null);
      if (tourism.searching) saveSearch(search);
    } else {
      setTourism({ ...tourism, tries });
    }
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
        <div className="search__lighting">
          <button type="button" className="btn" aria-pressed={dark} aria-controls={`${prefix}-form`} onClick={() => setDark((value) => !value)}>🌙 Dark Mode {dark ? "On" : "Off"}</button>
          <p id={`${prefix}-light-help`}>{dark ? "Move your pointer, tap the form, or use Tab to aim the flashlight. Turn Dark Mode off here anytime." : "Our lights work. For now."}</p>
        </div>
        <Flashlight on={dark} radius={110}>
        <form id={`${prefix}-form`} onSubmit={submit} className="search__form" aria-describedby={`${prefix}-light-help`}>
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
        </Flashlight>
        <dialog ref={dialog} className="search-tourism" aria-labelledby={`${prefix}-tourism-title`} aria-describedby={`${prefix}-tourism-description`} onCancel={() => setTourism(null)}>
          {tourism && <>
            <button type="button" className="btn search-tourism__close" onClick={() => setTourism(null)}>Back to search</button>
            <div className="search-tourism__banner" aria-hidden="true">🇵🇭 ☀️ 🏝️</div>
            <h3 className="display" id={`${prefix}-tourism-title`}>Piliin Mo ang Pilipinas!</h3>
            <p id={`${prefix}-tourism-description`}>Going to {airports.find((airport) => airport.code === tourism.destination)?.city}? But the Philippines has beaches, sunshine, and your emotional baggage already knows the way.</p>
            <button type="button" className="btn warn search-tourism__primary" onClick={choosePhilippines} autoFocus>Piliin ang Pilipinas!</button>
            <p className="search-tourism__hint">We'll pick another Philippine destination for you.</p>
            <p className="search-tourism__status" role="status" aria-live="polite">{tourism.tries === 0 ? "Still going abroad? Convince us in 3 attempts." : `Attempt ${tourism.tries} of 3. ${tourism.tries === 1 ? "But have you considered our islands?" : "One more try and we'll let you go. Probably."}`}</p>
            <div className="search-tourism__runway" style={{ justifyContent: ["flex-start", "center", "flex-end"][tourism.tries] }}>
              <button type="button" className="btn search-tourism__abroad" onClick={continueAbroad}>Continue abroad</button>
            </div>
          </>}
        </dialog>
      </div>
    </section>
  );
}
