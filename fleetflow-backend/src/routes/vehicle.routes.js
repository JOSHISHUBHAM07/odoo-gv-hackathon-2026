import express from "express";
import {
  createVehicle,
  getVehicles,
  toggleVehicleActive, // Import the toggle controller we updated
} from "../controllers/vehicle.controller.js";
import { authenticate, authorizeRole } from "../middleware/auth.middleware.js";

const router = express.Router();

// Logic: Create new vehicle assets (Restricted to Admin/Manager)
router.post(
  "/",
  authenticate,
  authorizeRole("ADMIN", "FLEET_MANAGER"),
  createVehicle,
);

// Logic: Retrieve the full fleet registry
router.get("/", authenticate, getVehicles);

// Logic: Manual Retirement Toggle
// This endpoint specifically fixes the "error in retire asset" by matching the frontend API call
router.patch(
  "/:id/status",
  authenticate,
  authorizeRole("ADMIN", "FLEET_MANAGER"),
  toggleVehicleActive,
);

export default router;
