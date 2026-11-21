// OWNER: DIN — GET /api/terms
import { Router } from "express";

const router = Router();

export const TERMS_AND_PUNISHMENTS = [
  "1. By clicking, tapping, breathing, or standing near this website, you agree to everything, including things we have not written yet.",
  "2. Bahala Na Air is not responsible for delays, early arrivals, late departures, or departures that arrive first.",
  "3. The passenger acknowledges that \"confirmed\" means \"confirmed-ish.\"",
  "4. Window seats are subject to the Window Appreciation Fee. Appreciation is not guaranteed.",
  "5. Ye Olde Airlper may forget your name, your destination, and this agreement.",
  "6. Scrolling faster than one line per second constitutes a breach of Section 7.",
  "7. Section 7: see Section 6.",
  "8. Punishment 14: Return to Step 1. Punishment 15: Return to Step 1, but sadder.",
  "9. Complaints are reviewed within 3-5 business eternities.",
  "10. By reaching the bottom of this document you waive the right to have read it.",
  "11. These terms may change while you are reading them. They just did.",
  "12. Gate 404 is not responsible for being found.",
  "13. Clause 13: All international destinations are legally located in the Philippines. Piliin Mo Ang Pilipinas.",
  "14. Clause 14: The airline reserves the right to be a boat.",
  "15. Clause 15: Baggage Allowance allows you to think fondly about your baggage while it vacations in Cebu without you.",
  "16. Clause 16: Standing Class passengers must provide their own gravity.",
  "17. Clause 17: In the event of turbulence (now with 3% extra!), passengers must clap on the 1 and the 3.",
  "18. Clause 18: Any attempt to click a button that runs away from your cursor is considered cardiovascular exercise and billed at ₱99/minute.",
  "19. Clause 19: CAPTCHA #1 must be confirmed by CAPTCHA #2, which requires CAPTCHA #3, notarized by CAPTCHA #∞.",
  "20. Clause 20: Guest mode is 100% voluntary* (*mandatory, requires airplane pose on webcam with at least 12% pose confidence).",
  "21. Clause 21: Dark mode cannot be turned off. Your cursor is your flashlight. Batteries not included.",
  "22. Clause 22: If the runway moves 2 meters to the left without informing the aircraft, passengers agree to lean slightly to the right.",
  "23. Clause 23: Base fare of ₱1.00 does not include wings, fuselage, landing gear, or pilot morale.",
  "24. Clause 24: Emotional Support Fee covers the airline's emotions, not yours.",
  "25. Clause 25: Paying with Exposure requires at least 3 followers (bots and relatives count double, then divide by zero).",
  "26. Clause 26: Paying by Cash (send via pigeon) requires a certified carrier pigeon licensed by the Civil Aviation Authority of 1999.",
  "27. Clause 27: Credit card numbers must be entered backwards, one digit per screen, while humming Jose Mari Chan.",
  "28. Clause 28: If Lightning McQueen appears and yells KA-CHOW!, the passenger waives all epileptogenic and aerodynamic objections.",
  "29. Clause 29: All refunds are issued solely in the form of Personal Growth and Character Building.",
  "30. Clause 30: Clicking 'Manage Booking' returns you to Step 1. You're welcome.",
  "31. Clause 31: Our cookie policy includes both cookies and crumbs. We ate the cookies; you get the crumbs.",
  "32. Clause 32: Any bug discovered on this website is legally classified as an Award-Winning Feature.",
  "33. Clause 33: Should the pilot be found, lost, and found again, departure time defaults to 'Eventually'.",
  "34. Clause 34: By finishing Clause 34, you acknowledge that Clauses 1 through 33 have retroactively doubled in font complexity.",
];

router.get("/", (req, res) => {
  res.json(TERMS_AND_PUNISHMENTS);
});

export default router;
