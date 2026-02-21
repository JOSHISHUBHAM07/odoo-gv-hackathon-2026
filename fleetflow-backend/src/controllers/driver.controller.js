import prisma from "../../db.js";

// Page 7: Operator Intake & Registration
export const createDriver = async (req, res) => {
  try {
    const { name, licenseNumber, licenseExpiry, licenseCategory, contactInfo } =
      req.body;

    const driver = await prisma.driver.create({
      data: {
        name,
        licenseNumber,
        licenseExpiry: new Date(licenseExpiry),
        licenseCategory,
        contactInfo,
        status: "ON_DUTY", // Default intake status
        safetyScore: 100.0, // Initial safety rating
      },
    });
    res.status(201).json(driver);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Page 7: Performance & Compliance Monitoring
export const getDrivers = async (req, res) => {
  try {
    const drivers = await prisma.driver.findMany({
      include: {
        _count: {
          select: { trips: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const profiles = drivers.map((d) => {
      const today = new Date();
      const expiry = new Date(d.licenseExpiry);

      // Rule: Calculate days until expiry for the UI countdown
      const diffTime = expiry - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        ...d,
        daysToExpiry: diffDays,
        isExpired: diffDays < 0,
        totalTrips: d._count.trips,
      };
    });

    res.json(profiles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Page 7 Logic: Manual Toggle for Suspension or Duty Status
export const updateDriverStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updatedDriver = await prisma.driver.update({
      where: { id },
      data: { status },
    });
    res.json(updatedDriver);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
