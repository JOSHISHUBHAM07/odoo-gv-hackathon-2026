import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Import Modular Routes for the Digital Hub
import authRoutes from "./src/routes/auth.routes.js"; // Page 1: Auth & RBAC
import vehicleRoutes from "./src/routes/vehicle.routes.js"; // Page 3: Asset Registry
import tripRoutes from "./src/routes/trip.routes.js"; // Page 4: Dispatcher
import driverRoutes from "./src/routes/driver.routes.js"; // Page 7: Performance
import logRoutes from "./src/routes/log.routes.js"; // Page 5 & 6: Maintenance/Fuel
import analyticsRoutes from "./src/routes/analytics.routes.js"; // Page 2 & 8: Reports

dotenv.config();
const app = express();

// Global Middleware
app.use(cors());
app.use(express.json()); // Essential for processing JSON payloads

// API Route Mapping - Fixed Prefix Logic
// Ensure your frontend calls match these prefixes (e.g., api.patch("/vehicles/..."))
app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes); // Handles /api/vehicles/:id/status
app.use("/api/trips", tripRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/analytics", analyticsRoutes);

// System Health Check
app.get("/api/health", (req, res) =>
  res.status(200).json({
    status: "success",
    message: "FleetFlow Rule-Based Hub is Operational",
  }),
);

// Global Error Handler for Validation Rules
app.use((err, req, res, next) => {
  console.error("Critical Hub Error:", err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Internal Hub Error: Check logic workflow summary.",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(
    `🚀 FleetFlow Hub Live on Port ${PORT} [Mode: Enterprise Rule-Based]`,
  ),
);
