// One line per booking stage so the helper always reacts to the current page.
const AIRLPER_LINES = {
  1: "Prithee, welcome! What journey dost thou seek?",
  2: "Hark! Declare thy name, noble traveler.",
  3: "Whither dost thou travel? Choose thy destination, good soul.",
  4: "Lo! Flights await thee, each with its own curious peril.",
  5: "Choose thy flying steed wisely; it may yet grow wings.",
  6: "Select thy perch, and pray for a window seat.",
  7: "Tell us thy name, good traveler; the quill awaits.",
  8: "Wouldst thou add baggage, snacks, or mighty armrest rights?",
  9: "Review thy choices, and the fees most mysterious.",
  10: "Fear not, traveler; no real coin shall be taken.",
  11: "Huzzah! Thy voyage is confirmed-ish!",
  12: "Manage thy booking, then bravely enter the loop anew.",
};

export function getAirlperLine(stage) {
  return AIRLPER_LINES[stage] ?? AIRLPER_LINES[1];
}
