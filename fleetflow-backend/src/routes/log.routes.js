import express from "express";
import {
  logFuel,
  logMaintenance,
  getFuelLogs,
  getMaintenanceLogs,
} from "../controllers/log.controller.js";
import { authenticate, authorizeRole } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/fuel", authenticate, logFuel);
router.post(
  "/maintenance",
  authenticate,
  authorizeRole("ADMIN", "FLEET_MANAGER"),
  logMaintenance,
);

// Add these new GET routes!
router.get("/fuel", authenticate, getFuelLogs);
router.get("/maintenance", authenticate, getMaintenanceLogs);

export default router;
