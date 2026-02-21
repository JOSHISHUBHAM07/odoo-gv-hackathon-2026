import prisma from "../../db.js";

export const createFuelLog = async (req, res) => {
  const { vehicleId, fuelLiters, cost } = req.body;

  try {
    // Record Liters and Cost for financial visibility
    const fuelLog = await prisma.fuelLog.create({
      data: {
        vehicleId,
        fuelLiters: parseFloat(fuelLiters),
        cost: parseFloat(cost),
        date: new Date(),
      },
    });
    res.status(201).json(fuelLog);
  } catch (error) {
    res.status(400).json({ error: "Failed to record fuel expense." });
  }
};
