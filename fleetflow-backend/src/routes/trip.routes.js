import express from "express";
import { dispatchTrip, getTrips } from "../controllers/trip.controller.js";
import { authenticate, authorizeRole } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
  "/dispatch",
  authenticate,
  authorizeRole("ADMIN", "DISPATCHER"),
  dispatchTrip,
);
router.get("/", authenticate, getTrips); // Add this line!

export default router;
