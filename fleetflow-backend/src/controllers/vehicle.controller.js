import prisma from "../../db.js";

// Page 3: Vehicle Registry (Asset Management)
export const createVehicle = async (req, res) => {
  try {
    const {
      model,
      licensePlate,
      capacityKg,
      acquisitionCost,
      odometerKm,
      insuranceExpiry,
      registrationExpiry,
      fuelType,
    } = req.body;

    // Logic: Ensure all PRD mandatory data points are present and parsed
    const vehicle = await prisma.vehicle.create({
      data: {
        model,
        licensePlate,
        capacityKg: parseFloat(capacityKg),
        acquisitionCost: parseFloat(acquisitionCost),
        odometerKm: parseFloat(odometerKm || 0),
        insuranceExpiry: new Date(insuranceExpiry),
        registrationExpiry: new Date(registrationExpiry),
        fuelType,
        status: "AVAILABLE", // Default intake status
      },
    });

    res.status(201).json(vehicle);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// High-level "at-a-glance" fleet oversight
export const getVehicles = async (req, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Page 3 Logic: Manual Retirement Toggle
// This fixes the "oversight action" error by correctly managing lifecycle states
export const toggleVehicleActive = async (req, res) => {
  const { id } = req.params;
  try {
    const vehicle = await prisma.vehicle.findUnique({ where: { id } });

    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle asset not found." });
    }

    // Logic: If active, move to RETIRED. If retired, restore to AVAILABLE
    // A Retired asset is automatically excluded from Active Fleet KPIs
    const newStatus = vehicle.status === "RETIRED" ? "AVAILABLE" : "RETIRED";

    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: { status: newStatus },
    });

    res.json({
      message: `Asset lifecycle updated to ${newStatus}`,
      vehicle: updatedVehicle,
    });
  } catch (error) {
    console.error("Vehicle Toggle Error:", error);
    res.status(500).json({ error: "Failed to update asset lifecycle state." });
  }
};
