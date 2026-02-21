import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 1. Log a new fuel expense (POST)
export const logFuel = async (req, res) => {
  try {
    const { vehicleId, fuelLiters, cost } = req.body;

    // Logic: Parse strings to Float to prevent Prisma type errors
    const log = await prisma.fuelLog.create({
      data: {
        vehicleId,
        fuelLiters: parseFloat(fuelLiters),
        cost: parseFloat(cost),
      },
    });
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Log a new maintenance event (POST)
// This fixes the "maintannce logging failed" issue
export const logMaintenance = async (req, res) => {
  try {
    const {
      vehicleId,
      serviceType,
      cost,
      nextServiceDue,
      vendorName,
      description,
    } = req.body;

    const log = await prisma.maintenanceLog.create({
      data: {
        vehicleId,
        serviceType,
        description: description || "",
        vendorName: vendorName || "Internal Workshop",
        cost: parseFloat(cost), // Critical: Ensure float type
        nextServiceDue: new Date(nextServiceDue), // Critical: Convert string to Date
      },
    });

    // Rule: Automatically set the vehicle status to IN_SHOP
    // This triggers the "Maintenance Alert" on the Command Center dashboard
    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { status: "IN_SHOP" },
    });

    res.status(201).json(log);
  } catch (error) {
    console.error("Maintenance Sync Error:", error);
    res
      .status(500)
      .json({ error: "Validation Error: Verify cost and date formats." });
  }
};

// 3. Get all fuel logs for the table (GET)
export const getFuelLogs = async (req, res) => {
  try {
    const logs = await prisma.fuelLog.findMany({
      include: { vehicle: { select: { model: true, licensePlate: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. Get all maintenance logs for the table (GET)
export const getMaintenanceLogs = async (req, res) => {
  try {
    const logs = await prisma.maintenanceLog.findMany({
      include: { vehicle: { select: { model: true, licensePlate: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
