import prisma from "../../db.js";

export const createMaintenanceLog = async (req, res) => {
  const {
    vehicleId,
    serviceType,
    cost,
    nextServiceDue,
    vendorName,
    description,
  } = req.body;

  try {
    // 1. Validation: Ensure all numeric fields are valid numbers
    const parsedCost = parseFloat(cost);
    const parsedNextService = parseInt(nextServiceDue);

    if (isNaN(parsedCost) || isNaN(parsedNextService)) {
      return res
        .status(400)
        .json({ error: "Cost and Next Service Due must be valid numbers." });
    }

    // 2. PRD Requirement: Adding service log -> Vehicle status = In Shop
    const result = await prisma.$transaction([
      prisma.maintenanceLog.create({
        data: {
          vehicleId, // Ensure this matches your DB type (String for UUID, or parseInt(vehicleId) for Int)
          serviceType,
          cost: parsedCost,
          nextServiceDue: parsedNextService,
          vendorName,
          description,
          serviceDate: new Date(),
        },
      }),
      prisma.vehicle.update({
        where: { id: vehicleId },
        data: { status: "IN_SHOP" },
      }),
    ]);

    // 3. Success: Returns created log and triggers dashboard KPI update
    res.status(201).json(result[0]);
  } catch (error) {
    console.error("Maintenance Transaction Error:", error); // Log actual error to your terminal
    res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
};
