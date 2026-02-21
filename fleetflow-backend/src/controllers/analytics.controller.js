import prisma from "../../db.js";

// Page 2 Logic: Command Center (Main Dashboard)
export const getDashboardStats = async (req, res) => {
  try {
    const [
      fleetGroups,
      totalFuel,
      totalMaintenance,
      vehicleCount,
      pendingCargo,
    ] = await Promise.all([
      prisma.vehicle.groupBy({ by: ["status"], _count: { status: true } }),
      prisma.fuelLog.aggregate({ _sum: { cost: true } }),
      prisma.maintenanceLog.aggregate({ _sum: { cost: true } }),
      prisma.vehicle.count(),
      // PRD Logic: Shipments waiting for dispatch (DRAFT or SCHEDULED)
      prisma.trip.count({
        where: {
          status: { in: ["DRAFT", "SCHEDULED"] },
        },
      }),
    ]);

    const activeOnTrip =
      fleetGroups.find((g) => g.status === "ON_TRIP")?._count.status || 0;
    const inShopCount =
      fleetGroups.find((g) => g.status === "IN_SHOP")?._count.status || 0;

    // PRD Requirement: Utilization Rate (Active vs Total Assets)
    const utilizationRate =
      vehicleCount > 0 ? Math.round((activeOnTrip / vehicleCount) * 100) : 0;

    res.json({
      activeFleet: activeOnTrip, //
      maintenanceAlerts: inShopCount, //
      utilizationRate: `${utilizationRate}%`, //
      pendingCargo: pendingCargo, //
      financials: {
        totalFuelSpend: totalFuel._sum.cost || 0,
        totalMaintenanceSpend: totalMaintenance._sum.cost || 0,
        // Automated Operational Cost for high-level audit
        totalOperationalCost:
          (totalFuel._sum.cost || 0) + (totalMaintenance._sum.cost || 0),
      },
      fleetStatus: fleetGroups,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Page 8 Logic: Operational Analytics & Financial Reports
export const getOperationalReports = async (req, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        fuelLogs: true,
        maintenanceLogs: true,
        trips: { where: { status: "COMPLETED" } },
      },
    });

    const report = vehicles.map((v) => {
      const totalFuelCost = v.fuelLogs.reduce((sum, log) => sum + log.cost, 0);
      const totalFuelLiters = v.fuelLogs.reduce(
        (sum, log) => sum + log.fuelLiters,
        0,
      );
      const totalMaintCost = v.maintenanceLogs.reduce(
        (sum, log) => sum + log.cost,
        0,
      );
      const totalRevenue = v.trips.reduce((sum, trip) => sum + trip.revenue, 0);
      const totalDistance = v.trips.reduce(
        (sum, trip) => sum + trip.distanceKm,
        0,
      );

      // PRD Formula: Fuel Efficiency (km / L)
      const fuelEfficiency =
        totalFuelLiters > 0
          ? (totalDistance / totalFuelLiters).toFixed(2)
          : "0.00";

      // PRD Formula: ROI = (Revenue - Expenses) / Acquisition Cost
      const netProfit = totalRevenue - (totalMaintCost + totalFuelCost);
      const roi =
        v.acquisitionCost > 0
          ? (netProfit / v.acquisitionCost).toFixed(2)
          : "0.00";

      return {
        vehicleId: v.id,
        name: v.model, //
        licensePlate: v.licensePlate, //
        fuelEfficiency: fuelEfficiency, //
        totalDistance: totalDistance,
        roi: roi, //
        operationalCost: totalFuelCost + totalMaintCost,
        revenue: totalRevenue,
      };
    });

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
