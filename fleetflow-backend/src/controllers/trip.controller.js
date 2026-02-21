import prisma from "../../db.js";

// Page 4 Logic: Workflow for moving goods from Point A to Point B [cite: 26]
export const dispatchTrip = async (req, res) => {
  try {
    const {
      origin,
      destination,
      distanceKm,
      cargoWeightKg,
      revenue,
      expectedDeliveryTime,
      vehicleId,
      driverId,
    } = req.body;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });
    const driver = await prisma.driver.findUnique({ where: { id: driverId } });

    // 1. Availability Check: Ensure assets are ready for assignment [cite: 27]
    if (!vehicle || vehicle.status !== "AVAILABLE") {
      return res.status(400).json({ error: "Vehicle not available" });
    }
    if (!driver || driver.status !== "ON_DUTY") {
      return res.status(400).json({ error: "Driver not on duty" });
    }

    // 2. Validation: Prevent trip if CargoWeight > MaxCapacity [cite: 28, 51]
    if (cargoWeightKg > vehicle.capacityKg) {
      return res.status(400).json({
        error: `Overload Blocked: Cargo (${cargoWeightKg}kg) exceeds Vehicle Capacity (${vehicle.capacityKg}kg)`,
      });
    }

    // 3. Compliance: License expiry tracking blocks assignment if expired [cite: 39, 49]
    if (new Date(driver.licenseExpiry) < new Date()) {
      return res.status(400).json({
        error:
          "Compliance Error: Driver license is expired. Assignment blocked.",
      });
    }

    // Atomic Transaction: Update Trip and Asset States [cite: 52, 60]
    const transaction = await prisma.$transaction([
      prisma.trip.create({
        data: {
          origin,
          destination,
          distanceKm,
          cargoWeightKg,
          revenue,
          expectedDeliveryTime: new Date(expectedDeliveryTime),
          status: "DISPATCHED",
          vehicleId,
          driverId,
        },
      }),
      prisma.vehicle.update({
        where: { id: vehicleId },
        data: { status: "ON_TRIP" },
      }),
      prisma.driver.update({
        where: { id: driverId },
        data: { status: "ON_TRIP" },
      }),
    ]);

    res
      .status(201)
      .json({ message: "Trip Dispatched Successfully", trip: transaction[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTrips = async (req, res) => {
  try {
    const trips = await prisma.trip.findMany({
      include: { vehicle: true, driver: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Step 4 Completion Logic: CAPTURE ODOMETER & UPDATE PERFORMANCE [cite: 53, 54]
export const completeTrip = async (req, res) => {
  const { id } = req.params;
  const { finalOdometer } = req.body;

  try {
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: { driver: true },
    });

    if (!trip) return res.status(404).json({ error: "Trip not found" });

    // Calculate Driver Performance Update
    const completedTripsCount = await prisma.trip.count({
      where: { driverId: trip.driverId, status: "COMPLETED" },
    });
    const totalTripsCount = await prisma.trip.count({
      where: { driverId: trip.driverId },
    });
    // Add 1 to completed count for the current trip being closed
    const newRate = ((completedTripsCount + 1) / totalTripsCount) * 100;

    const transaction = await prisma.$transaction([
      // Mark Trip as COMPLETED [cite: 29, 53]
      prisma.trip.update({
        where: { id },
        data: {
          status: "COMPLETED",
          finalOdometer: parseFloat(finalOdometer),
        },
      }),
      // Reset Vehicle Status & update master Odometer [cite: 54, 57]
      prisma.vehicle.update({
        where: { id: trip.vehicleId },
        data: {
          status: "AVAILABLE",
          odometerKm: parseFloat(finalOdometer),
        },
      }),
      // Reset Driver Status & Update Performance Stats [cite: 40, 54]
      prisma.driver.update({
        where: { id: trip.driverId },
        data: {
          status: "ON_DUTY",
          tripCompletionRate: newRate,
        },
      }),
    ]);

    res.json({
      message: "Trip marked done. Driver performance updated.",
      trip: transaction[0],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
