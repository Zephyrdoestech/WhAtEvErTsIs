// OWNER: SYOS — see SYOS.MD. Used by Stage 02 (SYOS), Stage 07 (SYOS), Stage 10 (DIN).
// Contract (do not change without telling DIN):
//   <Captcha onPass={() => {}} onFail={() => {}} chain={1} />
//   chain = how many CAPTCHAs in a row before onPass fires (default 1).
export default function Captcha({ onPass, onFail, chain = 1 }) {
  void onFail; void chain; // TODO(SYOS): real cursed CAPTCHA
  return (
    <label style={{ display: "block", padding: "1rem", border: "1px solid #ccc" }}>
      <input type="checkbox" onChange={() => onPass?.()} /> I am not a robot (placeholder)
    </label>
  );
}
