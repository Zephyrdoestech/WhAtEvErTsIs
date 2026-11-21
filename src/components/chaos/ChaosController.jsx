// OWNER: DAR — Secret "/controller" page for toggling every chaos & stage feature ON/OFF.
// Only accessible by manually changing the browser URL to end with /controller.
import useBooking from "../../context/useBooking.js";
import "./ChaosController.css";
import {
  CONTROLLER_FEATURES,
  useControllerConfig,
} from "./controllerConfig.js";

const STAGE_LIST = [
  { id: 1, title: "01 · Welcome (+ Shea Ad)" },
  { id: 2, title: "02 · Login / Sign Up" },
  { id: 3, title: "03 · Search Flights" },
  { id: 4, title: "04 · View Flights (+ Minigame)" },
  { id: 5, title: "05 · Select Flight (+ Forcefield)" },
  { id: 6, title: "06 · Choose Seat (+ Blackout)" },
  { id: 7, title: "07 · Passenger Details (+ Pose)" },
  { id: 8, title: "08 · Add Extras (+ Guilt Trips)" },
  { id: 9, title: "09 · Review Booking (+ Terms)" },
  { id: 10, title: "10 · Payment Gauntlet" },
  { id: 11, title: "11 · Booking Confirmation" },
  { id: 12, title: "12 · Manage Booking Loop" },
];

export default function ChaosController({ onExitController }) {
  const { stage, goTo, frustration, bumpFrustration, resetBooking, demoMode } =
    useBooking() ?? {};
  const { config, toggleFeature, setAllFeatures, resetDefaults } =
    useControllerConfig();

  const globalFeatures = CONTROLLER_FEATURES.filter(
    (feature) => feature.category === "global"
  );
  const stageFeatures = CONTROLLER_FEATURES.filter(
    (feature) => feature.category === "stage"
  );

  const activeCount = CONTROLLER_FEATURES.filter((feature) =>
    feature.key === "muteAllSounds" ? false : Boolean(config[feature.key])
  ).length;
  const totalToggleable = CONTROLLER_FEATURES.length - 1;

  function returnToApp(targetStage = stage, forceDemo = demoMode) {
    const params = new URLSearchParams(window.location.search);
    if (targetStage) {
      params.set("stage", String(targetStage));
    }
    if (forceDemo) {
      params.set("demo", "1");
    }
    const query = params.toString();
    const nextUrl = query ? `/?${query}` : "/";
    if (onExitController) {
      window.history.pushState({}, "", nextUrl);
      if (targetStage && goTo) {
        goTo(targetStage);
      }
      onExitController();
    } else {
      window.location.assign(nextUrl);
    }
  }

  return (
    <div
      className="chaos-controller-overlay"
      role="region"
      aria-label="Secret Feature and Chaos Controller"
    >
      <div className="chaos-controller">
        <header className="panel chaos-controller__header">
          <div className="panel-title red chaos-controller__titlebar">
            <span>🎛️ SECRET FLIGHT DECK CONTROLLER · /controller</span>
            <span className="chaos-controller__pill">
              ACTIVE FEATURES: {activeCount} / {totalToggleable}
            </span>
          </div>

          <div className="panel-body chaos-controller__header-body">
            <div className="chaos-controller__intro">
              <h1 className="display chaos-controller__headline">
                whatevertsis Master Feature Switchboard
              </h1>
              <p>
                Toggle any chaos mechanic, sound cue, or stage obstacle{" "}
                <strong>ON</strong> or <strong>OFF</strong>. Changes are saved automatically
                and sync live across open tabs!
              </p>
            </div>

            <div className="chaos-controller__nav-actions">
              <button
                type="button"
                className="btn go chaos-controller__back-btn"
                onClick={() => returnToApp(stage, demoMode)}
              >
                ✈ Return to Airline App (Stage {stage || 1}) →
              </button>
              <button
                type="button"
                className="btn warn"
                onClick={() => returnToApp(stage, true)}
              >
                ⚡ Open Airline App in Demo Mode (?demo)
              </button>
            </div>
          </div>
        </header>

        <section className="panel chaos-controller__presets">
          <h2 className="panel-title">⚡ Quick Master Presets</h2>
          <div className="panel-body chaos-controller__presets-body">
            <button
              type="button"
              className="btn go"
              onClick={() => setAllFeatures(true)}
            >
              🟢 Turn ON Everything (Full Cursed Mode)
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => setAllFeatures(false)}
            >
              🔴 Turn OFF Everything (Peaceful Mode)
            </button>
            <button
              type="button"
              className="btn warn"
              onClick={() => {
                setAllFeatures(false);
                setAllFeatures(true, "global");
              }}
            >
              🎭 Global Chaos Only
            </button>
            <button
              type="button"
              className="btn warn"
              onClick={() => {
                setAllFeatures(false);
                setAllFeatures(true, "stage");
              }}
            >
              🚧 Stage Obstacles Only
            </button>
            <button
              type="button"
              className="btn"
              onClick={resetDefaults}
            >
              🔄 Reset to Defaults
            </button>
          </div>
        </section>

        <section className="panel">
          <h2 className="panel-title purple">
            🎭 Global Chaos Layer &amp; Audio Interruptions (All Pages)
          </h2>
          <div className="panel-body chaos-controller__grid">
            {globalFeatures.map((feature) => {
              const isOn = Boolean(config[feature.key]);
              return (
                <article
                  key={feature.key}
                  className={`chaos-controller__card ${
                    isOn
                      ? "chaos-controller__card--on"
                      : "chaos-controller__card--off"
                  }`}
                >
                  <div className="chaos-controller__card-top">
                    <span className="chaos-controller__badge">
                      {feature.badge}
                    </span>
                    <span
                      className={`chaos-controller__status ${
                        isOn
                          ? "chaos-controller__status--on"
                          : "chaos-controller__status--off"
                      }`}
                    >
                      {isOn ? "● ON" : "○ OFF"}
                    </span>
                  </div>

                  <div className="chaos-controller__card-main">
                    <h3 className="chaos-controller__card-title">
                      <span aria-hidden="true">{feature.icon} </span>
                      {feature.label}
                    </h3>
                    <p className="chaos-controller__card-desc">
                      {feature.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={isOn}
                    className={`btn ${
                      isOn ? "go" : ""
                    } chaos-controller__toggle-btn`}
                    onClick={() => toggleFeature(feature.key)}
                  >
                    {isOn ? "✓ Enabled (Click to Turn OFF)" : "✗ Disabled (Click to Turn ON)"}
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        <section className="panel">
          <h2 className="panel-title">
            🚧 Stage-Specific Cursed Obstacles (Stages 01–10)
          </h2>
          <div className="panel-body chaos-controller__grid">
            {stageFeatures.map((feature) => {
              const isOn = Boolean(config[feature.key]);
              return (
                <article
                  key={feature.key}
                  className={`chaos-controller__card ${
                    isOn
                      ? "chaos-controller__card--on"
                      : "chaos-controller__card--off"
                  }`}
                >
                  <div className="chaos-controller__card-top">
                    <span className="chaos-controller__badge">
                      {feature.badge}
                    </span>
                    <span
                      className={`chaos-controller__status ${
                        isOn
                          ? "chaos-controller__status--on"
                          : "chaos-controller__status--off"
                      }`}
                    >
                      {isOn ? "● ON" : "○ OFF"}
                    </span>
                  </div>

                  <div className="chaos-controller__card-main">
                    <h3 className="chaos-controller__card-title">
                      <span aria-hidden="true">{feature.icon} </span>
                      {feature.label}
                    </h3>
                    <p className="chaos-controller__card-desc">
                      {feature.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={isOn}
                    className={`btn ${
                      isOn ? "go" : ""
                    } chaos-controller__toggle-btn`}
                    onClick={() => toggleFeature(feature.key)}
                  >
                    {isOn ? "✓ Enabled (Click to Turn OFF)" : "✗ Disabled (Click to Turn ON)"}
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        <section className="panel">
          <h2 className="panel-title red">
            🧭 Stage Teleporter &amp; Booking State Controls
          </h2>
          <div className="panel-body chaos-controller__teleporter">
            <div className="chaos-controller__stage-grid">
              {STAGE_LIST.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`btn ${
                    stage === item.id ? "warn" : ""
                  } chaos-controller__stage-btn`}
                  onClick={() => returnToApp(item.id, demoMode)}
                >
                  {stage === item.id ? "▶ " : ""}
                  {item.title}
                </button>
              ))}
            </div>

            <div className="chaos-controller__state-bar">
              <span>
                Current Frustration: <strong>{frustration ?? 0}%</strong>
              </span>
              <div className="chaos-controller__state-btns">
                <button
                  type="button"
                  className="btn"
                  onClick={() => bumpFrustration?.(15)}
                >
                  +15% Frustration
                </button>
                <button
                  type="button"
                  className="btn warn"
                  onClick={() => resetBooking?.()}
                >
                  Reset Booking &amp; Loop
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
