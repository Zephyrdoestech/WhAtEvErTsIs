// OWNER: SYOS — see SYOS.MD (Stage 07: Passenger Details)
import { useId, useState } from "react";
import useBooking from "../../context/useBooking.js";
import PoseCheck from "./PoseCheck.jsx";
import Captcha from "../../components/captcha/Captcha.jsx";
import "./Passenger.css";

const fields = [
  { name: "firstName", label: "First name", placeholder: "Juan", type: "text", maxLength: 100 },
  { name: "lastName", label: "Last name", placeholder: "Dela Cruz", type: "text", maxLength: 100 },
  { name: "birthday", label: "Birthday", type: "date" },
  { name: "nationality", label: "Nationality", placeholder: "Filipino", type: "text", maxLength: 100 },
  { name: "email", label: "Email", placeholder: "juan@example.test", type: "email", maxLength: 254 },
  { name: "phone", label: "Phone", placeholder: "+63 900 000 0000", type: "tel", maxLength: 30 },
  { name: "passportNumber", label: "Passport number (made-up only)", placeholder: "DEMO12345", type: "text", maxLength: 40 },
];

export default function Passenger() {
  const { booking, updateBooking, demoMode, next } = useBooking();
  const prefix = useId();
  const [passenger, setPassenger] = useState(() => Object.fromEntries(fields.map(({ name }) => [name, booking.passenger?.[name] || ""])));
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const [posed, setPosed] = useState(false);
  const [today] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  });

  function submit(event) {
    event.preventDefault();
    const value = Object.fromEntries(Object.entries(passenger).map(([key, text]) => [key, text.trim()]));
    const issues = {};
    for (const name of ["firstName", "lastName"]) {
      if (!value[name] || !/\p{L}/u.test(value[name])) issues[name] = "Name too mysterious. Give us a made-up name with at least one letter.";
    }
    if (!value.birthday || value.birthday > today) issues.birthday = "Born tomorrow? Our time-travel seats are sold out. Pick a past birthday.";
    if (!value.nationality) issues.nationality = "Nationality missing. Frequent flyer is not a country.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email)) issues.email = "This email has lost its @ or destination. Try juan@example.test.";
    if (!/^[+\d\s().-]+$/.test(value.phone) || !/^\d{7,15}$/.test(value.phone.replace(/\D/g, ""))) issues.phone = "Phone too quiet. Use 7–15 pretend digits.";
    if (!value.passportNumber) issues.passportNumber = "Your imaginary passport needs an imaginary number.";
    setErrors(issues);
    if (Object.keys(issues).length) {
      event.currentTarget.elements.namedItem(Object.keys(issues)[0])?.focus();
      return;
    }
    updateBooking({ passenger: value });
    setPassenger(value);
    setSaved(true);
  }

  return (
    <section className="panel passenger" aria-labelledby={`${prefix}-heading`}>
      <h2 className="panel-title" id={`${prefix}-heading`}>Passenger details — Step 07 of 12</h2>
      <div className="panel-body">
        <h3 className="display passenger__title">Who's flying, allegedly?</h3>
        <p id={`${prefix}-demo`} className="passenger__notice">Demo only. Use made-up details for every field, including your passport.</p>
        {!saved ? <form className="passenger__form" onSubmit={submit} noValidate autoComplete="off" aria-describedby={`${prefix}-demo`}>
          {fields.map((field) => <div className="passenger__field" key={field.name}>
            <label htmlFor={`${prefix}-${field.name}`}>{field.label}</label>
            <input id={`${prefix}-${field.name}`} name={field.name} type={field.type} placeholder={field.placeholder} maxLength={field.maxLength} max={field.type === "date" ? today : undefined} value={passenger[field.name]} onChange={(event) => {
              setPassenger((current) => ({ ...current, [field.name]: event.target.value }));
              setErrors((current) => ({ ...current, [field.name]: undefined }));
            }} required aria-invalid={Boolean(errors[field.name])} aria-describedby={errors[field.name] ? `${prefix}-${field.name}-error` : undefined} />
            {errors[field.name] && <span className="passenger__error" id={`${prefix}-${field.name}-error`}>{errors[field.name]}</span>}
          </div>)}
          <p className="passenger__validation" role="alert">{Object.values(errors).some(Boolean) ? "A few details missed their boarding call. Check the marked fields." : ""}</p>
          <button className="btn go passenger__submit" type="submit">Save passenger details</button>
        </form> : <div className="passenger__saved">
          <p role="status">Passenger details saved for {passenger.firstName} {passenger.lastName}.</p>
          {!posed ? <PoseCheck demoMode={demoMode} onDone={() => setPosed(true)} /> : <section aria-labelledby={`${prefix}-human`}>
            <h3 id={`${prefix}-human`}>Despite the pose, are you human?</h3>
            <Captcha onPass={next} />
          </section>}
          <button type="button" className="btn" onClick={() => { setSaved(false); setPosed(false); }}>Edit passenger details</button>
        </div>}
      </div>
    </section>
  );
}
