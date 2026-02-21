import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed process...");

  // 1. Clear existing data to ensure a clean hub state
  await prisma.fuelLog.deleteMany();
  await prisma.maintenanceLog.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash("password123", 10);

  // 2. Create Users for Target Roles
  await prisma.user.createMany({
    data: [
      {
        name: "Admin User",
        email: "admin@fleetflow.com",
        password: hashedPassword,
        role: "ADMIN",
      },
      {
        name: "Fleet Manager",
        email: "manager@fleetflow.com",
        password: hashedPassword,
        role: "FLEET_MANAGER",
      },
      {
        name: "Dispatcher One",
        email: "dispatch@fleetflow.com",
        password: hashedPassword,
        role: "DISPATCHER",
      },
      {
        name: "Safety Officer",
        email: "safety@fleetflow.com",
        password: hashedPassword,
        role: "SAFETY_OFFICER",
      },
      {
        name: "Financial Analyst",
        email: "finance@fleetflow.com",
        password: hashedPassword,
        role: "FINANCE_ANALYST",
      },
    ],
  });

  // 3. Create Vehicles
  const van = await prisma.vehicle.create({
    data: {
      model: "Van-05",
      licensePlate: "VF-005-NY",
      capacityKg: 500,
      acquisitionCost: 30000,
      odometerKm: 15000,
      fuelType: "DIESEL",
      status: "AVAILABLE",
      insuranceExpiry: new Date("2027-01-01"),
      registrationExpiry: new Date("2027-01-01"),
    },
  });

  const truck = await prisma.vehicle.create({
    data: {
      model: "Heavy Truck",
      licensePlate: "HT-999-TX",
      capacityKg: 5000,
      acquisitionCost: 95000,
      odometerKm: 42000,
      fuelType: "DIESEL",
      status: "AVAILABLE",
      insuranceExpiry: new Date("2027-06-01"),
      registrationExpiry: new Date("2027-06-01"),
    },
  });

  // 4. Create Drivers
  const alex = await prisma.driver.create({
    data: {
      name: "Alex",
      licenseNumber: "D-12345",
      licenseExpiry: new Date("2028-12-31"),
      licenseCategory: "VAN",
      status: "ON_DUTY",
      contactInfo: "alex@fleetflow.com",
      safetyScore: 92.5,
    },
  });

  const bob = await prisma.driver.create({
    data: {
      name: "Bob",
      licenseNumber: "D-99999",
      licenseExpiry: new Date("2024-01-01"), // Expired for testing
      licenseCategory: "TRUCK",
      status: "ON_DUTY",
      contactInfo: "bob@fleetflow.com",
      safetyScore: 65.0,
    },
  });

  // 5. Create Trips (One Completed, One Pending for Dashboard verification)
  await prisma.trip.create({
    data: {
      origin: "Warehouse Alpha",
      destination: "Retail Hub",
      distanceKm: 200,
      cargoWeightKg: 450,
      revenue: 1500,
      expectedDeliveryTime: new Date(),
      status: "COMPLETED",
      finalOdometer: 15200,
      vehicleId: van.id,
      driverId: alex.id,
    },
  });

  // This entry helps verify the "Pending Cargo" checkbox in your testing results
  await prisma.trip.create({
    data: {
      origin: "Main Port",
      destination: "Storage B",
      distanceKm: 50,
      cargoWeightKg: 2000,
      revenue: 800,
      expectedDeliveryTime: new Date(Date.now() + 86400000), // Tomorrow
      status: "DRAFT",
      vehicleId: truck.id,
      driverId: bob.id,
    },
  });

  // 6. Record Financial Logs
  await prisma.fuelLog.create({
    data: { vehicleId: van.id, fuelLiters: 25, cost: 100, date: new Date() },
  });

  await prisma.maintenanceLog.create({
    data: {
      vehicleId: van.id,
      serviceType: "PREVENTIVE",
      description: "Oil Change",
      cost: 200,
      // FIX: Changed from Int (20000) to a DateTime object to match schema requirements
      nextServiceDue: new Date("2026-08-15"),
      vendorName: "Hub Auto",
      serviceDate: new Date(),
    },
  });

  console.log("Seed data successfully deployed to the digital hub.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
