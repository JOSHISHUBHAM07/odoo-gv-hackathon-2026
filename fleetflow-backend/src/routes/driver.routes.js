import express from "express";
import {
  createDriver,
  getDrivers,
  updateDriverStatus,
} from "../controllers/driver.controller.js";
import { authenticate, authorizeRole } from "../middleware/auth.middleware.js";

const router = express.Router();

// Logic: Create new driver assets (Admin/Safety Officer only)
router.post(
  "/",
  authenticate,
  authorizeRole("ADMIN", "SAFETY_OFFICER", "FLEET_MANAGER"),
  createDriver,
);

// Logic: Retrieve all driver performance and compliance data
router.get("/", authenticate, getDrivers);

// Logic: Toggle status to SUSPENDED or ON_DUTY
// This fixes the "Failed To Update Operator Status" alert by providing the missing endpoint
router.patch(
  "/:id/status",
  authenticate,
  authorizeRole("ADMIN", "SAFETY_OFFICER"),
  updateDriverStatus,
);

export default router;
