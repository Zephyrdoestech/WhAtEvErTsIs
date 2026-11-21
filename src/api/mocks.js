// OWNER: DIN — fake data so the frontend works even when the server is off.
export const MOCK_FLIGHTS = [
  { id: "WTF101", from: "MNL", to: "CEB", depart: "05:55", arrive: "07:10", price: 1, airline: "WhAtEvErTsIs Air",
    conditions: ["Pilot not included", "Wings sold separately"] },
  { id: "WTF202", from: "MNL", to: "CEB", depart: "23:59", arrive: "00:01", price: 3, airline: "Budget-ish Wings",
    conditions: ["Must flap arms during takeoff"] },
];

export const MOCK_TERMS = [
  "1. By reading this sentence you have already agreed to sentence 2.",
  "2. The airline may relocate your seat to another aircraft.",
];

export const mockQuote = () => ({
  items: [
    { label: "Base fare", amount: 1 },
    { label: "Breathing Privilege Tax", amount: 499 },
    { label: "Convenience Fee (for the inconvenience)", amount: 250 },
  ],
  total: 750,
});
