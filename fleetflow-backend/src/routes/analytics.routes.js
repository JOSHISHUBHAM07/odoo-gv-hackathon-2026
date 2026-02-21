import express from "express";
import {
  getDashboardStats,
  getOperationalReports,
} from "../controllers/analytics.controller.js";
import { authenticate, authorizeRole } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * Page 2: Command Center (Main Dashboard)
 * Purpose: High-level "at-a-glance" fleet oversight[cite: 14].
 * Access: Managers, Dispatchers, and Admins[cite: 5, 6, 12].
 */
router.get(
  "/dashboard",
  authenticate,
  authorizeRole(
    "ADMIN",
    "FLEET_MANAGER",
    "DISPATCHER",
    "SAFETY_OFFICER",
    "FINANCE_ANALYST",
  ),
  getDashboardStats,
);

/**
 * Page 8: Operational Analytics & Financial Reports
 * Purpose: Data-driven decision making including Fuel Efficiency and ROI[cite: 43, 44, 45].
 * Access: Strictly restricted to Admins and Finance Analysts.
 */
router.get(
  "/reports",
  authenticate,
  authorizeRole("ADMIN", "FINANCE_ANALYST"),
  getOperationalReports,
);

export default router;
