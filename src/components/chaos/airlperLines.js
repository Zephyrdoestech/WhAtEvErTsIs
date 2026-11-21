// Multiple lines per stage keep the helper's five-second chatter on topic.
const AIRLPER_LINES = {
  1: [
    "Prithee, welcome! What journey dost thou seek?",
    "Hark! A noble traveler approaches. Where dost thou roam?",
    "May thy quest begin with a bargain of but one peso!",
  ],
  2: [
    "Hark! Declare thy name, noble traveler.",
    "Pray, dost thou enter as guest or claim an account?",
    "The quill awaits thy name, good soul.",
  ],
  3: [
    "Whither dost thou travel? Choose thy destination, good soul.",
    "Name thy origin and destination, and we shall consult the stars.",
    "Prithee, when wouldst thou depart on this grand quest?",
  ],
  4: [
    "Lo! Flights await thee, each with its own curious peril.",
    "Behold these flying steeds; their fares seem suspiciously low.",
    "Hark! One of these vessels may even reach its gate.",
  ],
  5: [
    "Choose thy flying steed wisely; it may yet grow wings.",
    "Prithee, select thy vessel before the gate wanders away.",
    "A fine choice, traveler—or so the scroll would have thee believe.",
  ],
  6: [
    "Select thy perch, and pray for a window seat.",
    "Choose thy seat, lest the armrest choose thee.",
    "The middle seat hath many mysteries. Thou hast been warned.",
  ],
  7: [
    "Tell us thy name, good traveler; the quill awaits.",
    "Pray, inscribe the details of the brave soul who shall fly.",
    "The passenger scroll demands a few more details, naturally.",
  ],
  8: [
    "Wouldst thou add baggage, snacks, or mighty armrest rights?",
    "Behold! Many extras await thy coin—and thy attention.",
    "A breathing privilege wouldst thou purchase? How generous.",
  ],
  9: [
    "Review thy choices, and the fees most mysterious.",
    "Count thy selections, traveler; the sums may yet multiply.",
    "Prithee, inspect the fine print before it inspects thee.",
  ],
  10: [
    "Fear not, traveler; no real coin shall be taken.",
    "The payment scroll awaits—but only pretend treasure is due.",
    "Keep thy real purse close; this checkout is but a jest.",
  ],
  11: [
    "Huzzah! Thy voyage is confirmed-ish!",
    "Rejoice, brave soul; the ticket bears a most uncertain seal.",
    "Thou hast survived the booking quest. Mostly.",
  ],
  12: [
    "Manage thy booking, then bravely enter the loop anew.",
    "Prithee, change thy plans—or return whence thou came.",
    "The end is nigh. The beginning is also nigh.",
  ],
};

export function getAirlperLines(stage) {
  return AIRLPER_LINES[stage] ?? AIRLPER_LINES[1];
}

export function getForgetfulAirlperQuestion(booking, lastAnswer) {
  const passengerName = [booking?.passenger?.firstName, booking?.passenger?.lastName]
    .filter(Boolean)
    .join(" ");
  const knownName = booking?.user?.name || passengerName || lastAnswer || "a traveler";
  const destination = booking?.search?.to || booking?.flight?.to || booking?.flight?.destination;
  const wrongDestination = destination && /narnia/i.test(String(destination)) ? "Hogwarts" : "Narnia";

  return `Forgive me, what was thy name again? I recall "${knownName} the Third" bound for ${wrongDestination}.`;
}
