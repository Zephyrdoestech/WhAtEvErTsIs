// Slider-based date picker ("all date inputs should be a slider")
import "./DateSlider.css";

const MS_PER_DAY = 86400000;

function parseIsoDate(iso) {
  const [y, m, d] = String(iso).split("-").map(Number);
  return Date.UTC(y, (m || 1) - 1, d || 1);
}

function formatIsoDate(utcMs) {
  const date = new Date(utcMs);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatReadableDate(iso) {
  if (!iso) return "Not selected (drag slider)";
  const utcMs = parseIsoDate(iso);
  if (!Number.isFinite(utcMs)) return iso;
  return new Date(utcMs).toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function DateSlider({
  id,
  name,
  value,
  min,
  max,
  optional = false,
  onChange,
  required = false,
  ariaInvalid,
  ariaDescribedBy,
}) {
  const minMs = parseIsoDate(min);
  const maxMs = Math.max(minMs, parseIsoDate(max));
  // 0 is valid: a one-date range (min === max) must not offer a day past max.
  const totalDays = Math.max(0, Math.round((maxMs - minMs) / MS_PER_DAY));

  const currentDay = value
    ? Math.min(totalDays, Math.max(0, Math.round((parseIsoDate(value) - minMs) / MS_PER_DAY)))
    : Math.floor(totalDays / 2);

  function handleRangeChange(event) {
    const offsetDays = Number(event.target.value);
    const nextIso = formatIsoDate(minMs + offsetDays * MS_PER_DAY);
    onChange(nextIso);
  }

  return (
    <div className={`date-slider ${ariaInvalid ? "date-slider--invalid" : ""}`}>
      <div className="date-slider__readout">
        <span className="date-slider__value">
          {value ? `${formatReadableDate(value)} (${value})` : "Slide to pick a date"}
        </span>
        {optional && value && (
          <button
            type="button"
            className="btn date-slider__clear"
            onClick={() => onChange("")}
          >
            Clear
          </button>
        )}
      </div>

      <input
        id={id}
        name={name}
        type="range"
        className="date-slider__input"
        min={0}
        max={totalDays}
        step={1}
        value={currentDay}
        required={required}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        aria-valuetext={value || "No date selected"}
        onChange={handleRangeChange}
      />

      <div className="date-slider__bounds" aria-hidden="true">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
