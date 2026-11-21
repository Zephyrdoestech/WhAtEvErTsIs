// OWNER: SYOS — see SYOS.MD (Stage 02: Login / Sign Up)
import { useId, useRef, useState } from "react";
import "./Login.css";

const modes = [
  { id: "login", label: "Log in", title: "Good to see you again", description: "Enter your member details to get ready for takeoff.", submit: "Log in" },
  { id: "register", label: "Register", title: "Join the passenger list", description: "A few details and you're one of us. Probably.", submit: "Create account" },
  { id: "guest", label: "Continue as Guest", title: "Just passing through?", description: "Travel light. You can prepare your booking without creating an account.", submit: "Continue as Guest" },
];

export default function Login() {
  const [active, setActive] = useState("login");
  const [submitted, setSubmitted] = useState("");
  const prefix = useId();
  const tabs = useRef([]);

  function selectTab(index) {
    setActive(modes[index].id);
    setSubmitted("");
    tabs.current[index]?.focus();
  }

  function handleTabKey(event, index) {
    let target;
    if (event.key === "ArrowRight") target = (index + 1) % modes.length;
    if (event.key === "ArrowLeft") target = (index + modes.length - 1) % modes.length;
    if (event.key === "Home") target = 0;
    if (event.key === "End") target = modes.length - 1;
    if (target !== undefined) {
      event.preventDefault();
      selectTab(target);
    }
  }

  function submit(event, mode) {
    event.preventDefault();
    // UI only: no authentication, storage, or stage advancement in task 3.
    setSubmitted(mode);
  }

  return (
    <section className="panel login" aria-labelledby={`${prefix}-heading`}>
      <h2 className="panel-title" id={`${prefix}-heading`}>Login / Sign Up — Step 02 of 12</h2>
      <div className="panel-body login__layout">
        <div className="login__main">
          <p className="login__eyebrow">BAHALA NA AIR · PASSENGER SERVICES</p>
          <h3 className="display login__welcome">Welcome aboard</h3>
          <p className="login__intro">Your next adventure starts with a few details.</p>
          <p className="login__notice" id={`${prefix}-demo`}>Demo only — use made-up names, emails, and passwords.</p>

          <div className="login__tabs" role="tablist" aria-label="Choose how to continue">
            {modes.map((mode, index) => (
              <button
                key={mode.id}
                ref={(element) => { tabs.current[index] = element; }}
                type="button"
                role="tab"
                id={`${prefix}-tab-${mode.id}`}
                aria-controls={`${prefix}-panel-${mode.id}`}
                aria-selected={active === mode.id}
                tabIndex={active === mode.id ? 0 : -1}
                onClick={() => selectTab(index)}
                onKeyDown={(event) => handleTabKey(event, index)}
              >{mode.label}</button>
            ))}
          </div>

          {modes.map((mode) => (
            <div
              key={mode.id}
              role="tabpanel"
              id={`${prefix}-panel-${mode.id}`}
              aria-labelledby={`${prefix}-tab-${mode.id}`}
              hidden={active !== mode.id}
              className="login__tab-panel"
            >
              <h4>{mode.title}</h4>
              <p>{mode.description}</p>
              <form onSubmit={(event) => submit(event, mode.id)} aria-describedby={`${prefix}-demo`} autoComplete="off" onChange={() => setSubmitted("")}>
                {mode.id !== "login" && (
                  <div className="login__field">
                    <label htmlFor={`${prefix}-${mode.id}-name`}>{mode.id === "guest" ? "What should we call you? (optional)" : "Full name"}</label>
                    <input id={`${prefix}-${mode.id}-name`} name="name" type="text" placeholder="Juan Dela Cruz" required={mode.id === "register"} maxLength={100} />
                  </div>
                )}
                {mode.id !== "guest" && (
                  <>
                    <div className="login__field">
                      <label htmlFor={`${prefix}-${mode.id}-email`}>Email address</label>
                      <input id={`${prefix}-${mode.id}-email`} name="email" type="email" placeholder="juan@example.test" required maxLength={254} />
                    </div>
                    <div className="login__field">
                      <label htmlFor={`${prefix}-${mode.id}-password`}>Demo password</label>
                      <input id={`${prefix}-${mode.id}-password`} name="password" type="password" placeholder="A made-up password" autoComplete="new-password" required maxLength={100} />
                      <span className="login__help">Use a pretend password you don't use anywhere else.</span>
                    </div>
                  </>
                )}
                {mode.id === "guest" && <p className="login__guest-note">No email or password needed. Even a mystery passenger deserves a seat.*</p>}
                <button className="btn go login__submit" type="submit">{mode.submit}</button>
                <p className="login__status" role="status" aria-live="polite">{submitted === mode.id ? "Demo details received. Thanks for checking in!" : ""}</p>
              </form>
            </div>
          ))}
        </div>

        <aside className="login__aside" aria-label="Before you board">
          <span className="login__plane" aria-hidden="true">✈️</span>
          <h3 className="display">Before you board</h3>
          <p>Member, new arrival, or guest — there's a place for you in the queue.</p>
          <ul>
            <li>Choose how you'd like to continue.</li>
            <li>Keep your fictional travel details handy.</li>
            <li>Bring a little extra patience.</li>
          </ul>
          <p className="login__fine-print">* Seat, flight, and arrival at your intended destination subject to optimism.</p>
        </aside>
      </div>
    </section>
  );
}
