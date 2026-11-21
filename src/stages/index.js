// OWNER: KYLE — stage registry. All 12 stages are already listed, so nobody else needs to edit this file.
import Welcome from "./01-Welcome/Welcome.jsx";
import Login from "./02-Login/Login.jsx";
import Search from "./03-Search/Search.jsx";
import Flights from "./04-Flights/Flights.jsx";
import SelectFlight from "./05-SelectFlight/SelectFlight.jsx";
import Seat from "./06-Seat/Seat.jsx";
import Passenger from "./07-Passenger/Passenger.jsx";
import Extras from "./08-Extras/Extras.jsx";
import Review from "./09-Review/Review.jsx";
import Payment from "./10-Payment/Payment.jsx";
import Confirmation from "./11-Confirmation/Confirmation.jsx";
import ManageBooking from "./12-ManageBooking/ManageBooking.jsx";

export const STAGES = [
  { id: 1, title: "Welcome", owner: "KYLE", component: Welcome },
  { id: 2, title: "Login / Sign Up", owner: "SYOS", component: Login },
  { id: 3, title: "Search Flights", owner: "SYOS", component: Search },
  { id: 4, title: "View Available Flights", owner: "DAR", component: Flights },
  { id: 5, title: "Select Flight", owner: "RICKS", component: SelectFlight },
  { id: 6, title: "Choose Seat", owner: "RICKS", component: Seat },
  { id: 7, title: "Passenger Details", owner: "SYOS", component: Passenger },
  { id: 8, title: "Add Extras", owner: "DAR", component: Extras },
  { id: 9, title: "Review Booking", owner: "RICKS", component: Review },
  { id: 10, title: "Payment", owner: "DIN", component: Payment },
  { id: 11, title: "Booking Confirmation", owner: "DIN", component: Confirmation },
  { id: 12, title: "Manage Booking", owner: "KYLE", component: ManageBooking },
];

export const getStage = (id) => STAGES.find((s) => s.id === id) ?? STAGES[0];
