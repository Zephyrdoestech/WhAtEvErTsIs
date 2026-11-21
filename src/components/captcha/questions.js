// Emoji placeholders: captions keep every square understandable without images.
// Answers use stable IDs so artwork can be replaced without changing validation.
export const questions = [
  {
    id: "airplanes",
    type: "grid",
    prompt: "Select all squares with airplanes",
    hint: "Fine print: only clouds with airplane ambitions count. Actual aircraft are overqualified.",
    tiles: [
      { id: "plane", emoji: "✈️", label: "Actual airplane" },
      { id: "cloud-plane", emoji: "☁️✈️", label: "Cloud shaped like a plane" },
      { id: "bird", emoji: "🐦", label: "Unlicensed pilot" },
      { id: "helicopter", emoji: "🚁", label: "Confused ceiling fan" },
      { id: "luggage", emoji: "🧳", label: "Already lost" },
      { id: "departure", emoji: "🛫", label: "Actual plane, leaving" },
      { id: "cloud", emoji: "☁️", label: "Regular cloud" },
      { id: "banana", emoji: "🍌", label: "Economy snack" },
      { id: "island", emoji: "🏝️", label: "Your destination-ish" },
    ],
    answer: ["cloud-plane"],
    explanation: "Only the cloud shaped like a plane counts. Real planes lack imagination.",
  },
  {
    id: "baggage",
    type: "grid",
    prompt: "Select all squares with carry-on baggage",
    hint: "Fine print: emotional baggage only. Our airline has classified the crying banana as luggage.",
    tiles: [
      { id: "suitcase", emoji: "🧳", label: "Physical baggage" },
      { id: "backpack", emoji: "🎒", label: "Suspiciously practical" },
      { id: "happy-banana", emoji: "🍌😊", label: "Banana on holiday" },
      { id: "teddy", emoji: "🧸", label: "Emotional support bear" },
      { id: "crying-banana", emoji: "🍌😭", label: "Banana with baggage" },
      { id: "box", emoji: "📦", label: "Definitely extra fees" },
      { id: "purse", emoji: "👜", label: "Too bag-like" },
      { id: "plane", emoji: "✈️", label: "Carries the carry-ons" },
      { id: "socks", emoji: "🧦", label: "Unclaimed since 1999" },
    ],
    answer: ["crying-banana"],
    explanation: "The crying banana has emotional baggage. Suitcases are just showing off.",
  },
  {
    id: "pilots",
    type: "grid",
    prompt: "Select all squares with qualified pilots",
    hint: "Fine print: our only qualification is wearing sunglasses. Both the cat and the sun passed.",
    tiles: [
      { id: "pilot", emoji: "🧑‍✈️", label: "Has an actual licence" },
      { id: "bird", emoji: "🐦", label: "Too much experience" },
      { id: "cat", emoji: "🐱🕶️", label: "Cat in sunglasses" },
      { id: "robot", emoji: "🤖", label: "Here for verification" },
      { id: "sun", emoji: "🌞🕶️", label: "Sun in sunglasses" },
      { id: "penguin", emoji: "🐧", label: "Ground crew" },
      { id: "cap", emoji: "🧢", label: "Hat, no applicant" },
      { id: "sleeping", emoji: "😴", label: "On a mandatory break" },
      { id: "coffee", emoji: "☕", label: "The real captain" },
    ],
    answer: ["cat", "sun"],
    explanation: "The cat and the sun wear sunglasses. That is the entire hiring process.",
  },
  {
    id: "tuesday-math",
    type: "math",
    prompt: "What is 7 + Tuesday?",
    hint: "Airline arithmetic glues the number to the weekday. No spaces. Maths has left the airport.",
    options: ["Wednesday", "7Tuesday", "42"],
    answer: "7Tuesday",
    explanation: "7 + Tuesday = 7Tuesday. Our calculator has a liberal arts degree.",
  },
  {
    id: "wobbly-wings",
    type: "text",
    prompt: "Type the wobbly boarding code",
    hint: "Copy the five characters below. Those are the digits 1 and 5; upper or lower case is fine.",
    code: "W1NG5",
    answer: "W1NG5",
    explanation: "W1NG5 accepted. Your typing has been cleared for takeoff.",
  },
  {
    id: "robot",
    type: "robot",
    prompt: "Are you a robot?",
    hint: "Yes or No. Our first opinion is always wrong, so you may need to answer twice.",
    answer: "No",
    explanation: "Human-ish status approved. Please keep your circuits inside the aircraft.",
  },
];

export function nextQuestion(previousId, usedTypes = []) {
  let available = questions.filter((question) => question.id !== previousId && !usedTypes.includes(question.type));
  // Long chains start another cycle after all four types have been used.
  if (!available.length) {
    const previousType = questions.find((question) => question.id === previousId)?.type;
    available = questions.filter((question) => question.type !== previousType);
  }
  const types = [...new Set(available.map((question) => question.type))];
  const type = types[Math.floor(Math.random() * types.length)];
  const matching = available.filter((question) => question.type === type);
  return matching[Math.floor(Math.random() * matching.length)];
}
