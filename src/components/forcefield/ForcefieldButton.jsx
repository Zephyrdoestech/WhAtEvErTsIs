// OWNER: RICKS — see RICKS.MD. Used by Stage 05 (RICKS) and Stage 10 Pay Now (DIN).
// Contract: works like a normal <button>, plus:
//   <ForcefieldButton onClick={...} onDodge={() => {}} maxSpeed={0.4}>Select</ForcefieldButton>
//   onDodge fires every time the button runs away. maxSpeed is in px per ms.
export default function ForcefieldButton({ onClick, onDodge, maxSpeed = 0.4, children, ...rest }) {
  void onDodge; void maxSpeed; // TODO(RICKS)
  return <button onClick={onClick} {...rest}>{children}</button>;
}
