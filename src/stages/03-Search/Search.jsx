// OWNER: SYOS — see SYOS.MD (Stage 03: Search Flights)
import { useContext, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import useBooking from "../../context/useBooking.js";
import { StageNavSlot } from "../../app/stageNavSlot.js";
import Flashlight from "../../components/flashlight/Flashlight.jsx";
import DateSlider from "../../components/date/DateSlider.jsx";
import tourismVideo from "../../assets/videos/Piliin_mo_and_pilipinas.mp4";
import { airports } from "./airports.js";
import "./Search.css";

export default function Search() {
  const { booking, updateBooking, next, bumpFrustration } = useBooking();
  const prefix = useId();
  const submitted = useRef(false);
  const dialog = useRef(null);
  const video = useRef(null);
  const [tourism, setTourism] = useState(null);
  const [videoAudible, setVideoAudible] = useState(false);
  const [abroadWait, setAbroadWait] = useState(0);
  const [allowedAbroad, setAllowedAbroad] = useState("");
  const [dark, setDark] = useState(false);
  const navbar = useContext(StageNavSlot); // the shell's link-bar slot; null until it mounts
  useEffect(() => {
    if (!dark) return;
    function exitDarkMode(event) {
      if (event.key === "Escape" && !dialog.current?.open) setDark(false);
    }
    document.addEventListener("keydown", exitDarkMode);
    return () => document.removeEventListener("keydown", exitDarkMode);
  }, [dark]);
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
  const [maxTravelDate] = useState(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  });

  useEffect(() => {
    const player = video.current;
    if (tourism && !dialog.current.open) {
      dialog.current.showModal();
      dialog.current.querySelector(".search-tourism__primary")?.focus();
    }
    if (!tourism) {
      player.pause();
      if (dialog.current.open) dialog.current.close();
    }
  }, [tourism]);

  useEffect(() => {
    const player = video.current;
    return () => player.pause();
  }, []);

  const tourismAttempt = tourism?.tries;
  useEffect(() => {
    if (tourismAttempt === undefined) return;
    const timers = [2, 1, 0].map((seconds, index) =>
      window.setTimeout(() => setAbroadWait(seconds), (index + 1) * 1000)
    );
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [tourismAttempt]);

  function openTourism(destination, searching) {
    setAbroadWait(3);
    setTourism({ destination, tries: 0, searching });
    // Start playback within the destination interaction while user activation is available.
    const player = video.current;
    player.currentTime = 0;
    playVideoWithSound();
  }

  function playVideoWithSound() {
    const player = video.current;
    player.muted = false;
    if (player.volume === 0) player.volume = 1;
    // If the browser blocks autoplay, the clip stays paused until the user presses play.
    player.play().catch(() => {});
  }

  function updateVideoSound(event) {
    const player = event.currentTarget;
    setVideoAudible(!player.paused && !player.ended && !player.muted && player.volume > 0);
  }

  function toggleVideoSound() {
    const player = video.current;
    if (!player.paused && !player.ended && !player.muted && player.volume > 0) {
      player.muted = true;
    } else {
      playVideoWithSound();
    }
  }

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
        openTourism(value, false);
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
      openTourism(search.to, true);
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
    if (!tourism || abroadWait > 0) return;
    const tries = tourism.tries + 1;
    bumpFrustration(5);
    if (tries >= 3) {
      setAllowedAbroad(tourism.destination);
      setTourism(null);
      if (tourism.searching) saveSearch(search);
    } else {
      setAbroadWait(3);
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

  const darkToggle = <button type="button" className="btn search__dark-toggle" aria-pressed={dark} aria-controls={`${prefix}-form`} onClick={() => setDark((value) => !value)}>🌙 Dark Mode {dark ? "On" : "Off"}</button>;
  const tries = tourismAttempt ?? 0;

  return (
    <section className="panel search" aria-labelledby={`${prefix}-heading`}>
      {navbar ? createPortal(darkToggle, navbar) : darkToggle}
      <h2 className="panel-title" id={`${prefix}-heading`}>Search Flights — Step 03 of 12</h2>
      <div className="panel-body">
        <p className="search__eyebrow">BAHALA NA AIR · FLIGHT SEARCH</p>
        <h3 className="display search__title">Where are we going?</h3>
        <p className="search__intro">Pick your route. We'll provide the plot twists.</p>
        <div className="search__lighting">
          <p id={`${prefix}-light-help`}>{dark ? "Move your pointer, tap anywhere, or use Tab to aim the page flashlight. Press Escape or toggle Dark Mode off to restore the lights." : "Our lights work. For now."}</p>
        </div>
        <Flashlight on={dark} radius={120} fullPage>
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
            <DateSlider
              id={`${prefix}-depart`}
              name="departDate"
              value={search.departDate}
              min={today}
              max={maxTravelDate}
              required
              onChange={(nextVal) => change("departDate", nextVal)}
            />
          </div>
          <div className="search__field">
            <label htmlFor={`${prefix}-return`}>Return date (optional)</label>
            <DateSlider
              id={`${prefix}-return`}
              name="returnDate"
              value={search.returnDate}
              min={search.departDate || today}
              max={maxTravelDate}
              optional
              ariaDescribedBy={`${prefix}-oneway`}
              onChange={(nextVal) => change("returnDate", nextVal)}
            />
            <span className="search__help" id={`${prefix}-oneway`}>Leave cleared for a one-way trip.</span>
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
            <button type="button" className="btn search-tourism__close" onClick={() => setTourism(null)}>Back to search</button>
            <h3 className="display" id={`${prefix}-tourism-title`}>Piliin Mo ang Pilipinas!</h3>
            <div className="search-tourism__content">
              <button type="button" className="btn search-tourism__sound" onClick={toggleVideoSound}>{videoAudible ? "Mute video" : "Play with sound"}</button>
              <video ref={video} className="search-tourism__video" src={tourismVideo} preload="none" playsInline controls aria-label="Piliin Mo ang Pilipinas tourism video" onPlaying={updateVideoSound} onPause={updateVideoSound} onEnded={updateVideoSound} onVolumeChange={updateVideoSound} />
              <p id={`${prefix}-tourism-description`}>Going to {airports.find((airport) => airport.code === tourism?.destination)?.city}? Try a surprise destination in the Philippines.</p>
            </div>
            <div className="search-tourism__actions">
              <button type="button" className="btn warn search-tourism__primary" onClick={choosePhilippines}>Piliin ang Pilipinas!</button>
              <p className="search-tourism__status" role="status">{tries === 0 ? "Three attempts to continue abroad." : `Attempt ${tries} of 3. ${tries === 1 ? "But have you considered our islands?" : "One more try and we'll let you go. Probably."}`}</p>
              <div className="search-tourism__runway" style={{ justifyContent: ["flex-start", "center", "flex-end"][tries] }}>
                <button type="button" className="btn search-tourism__abroad" onClick={continueAbroad} disabled={abroadWait > 0}>Continue abroad{abroadWait > 0 ? ` (${abroadWait}s)` : ""}</button>
              </div>
              <span className="sr-only" role="status">{abroadWait === 0 ? "Continue abroad is available." : ""}</span>
            </div>
        </dialog>
      </div>
    </section>
  );
}
