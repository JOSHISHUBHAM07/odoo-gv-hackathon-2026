"use client";
import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import api from "@/lib/api";
import {
  Plus,
  MapPin,
  Truck,
  AlertCircle,
  Weight,
  DollarSign,
  Clock,
  ArrowRightCircle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function TripsPage() {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    origin: "",
    destination: "",
    distanceKm: "",
    cargoWeightKg: "",
    revenue: "",
    expectedDeliveryTime: "",
    vehicleId: "",
    driverId: "",
  });

  // Validation Logic: Check if current cargo exceeds selected vehicle capacity
  const selectedVehicle = vehicles.find((v) => v.id === formData.vehicleId);
  const isOverloaded =
    selectedVehicle &&
    parseFloat(formData.cargoWeightKg) > selectedVehicle.capacityKg;

  const fetchData = async () => {
    try {
      const [tripsRes, vehiclesRes, driversRes] = await Promise.all([
        api.get("/trips"),
        api.get("/vehicles"),
        api.get("/drivers"),
      ]);
      setTrips(tripsRes.data);
      setVehicles(vehiclesRes.data);
      setDrivers(driversRes.data);
    } catch (err) {
      console.error("Failed to fetch fleet state", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // PRD Logic: Prevent creation if CargoWeight > MaxCapacity
    if (isOverloaded) {
      setError(
        `Overload Error: Cargo exceeds ${selectedVehicle.model} capacity (${selectedVehicle.capacityKg}kg)`,
      );
      return;
    }

    try {
      const payload = {
        ...formData,
        distanceKm: parseFloat(formData.distanceKm),
        cargoWeightKg: parseFloat(formData.cargoWeightKg),
        revenue: parseFloat(formData.revenue),
        expectedDeliveryTime: new Date(
          formData.expectedDeliveryTime,
        ).toISOString(),
      };

      await api.post("/trips/dispatch", payload);
      toast.success("Shipment Dispatched Successfully");
      setShowForm(false);
      fetchData();
      setFormData({
        origin: "",
        destination: "",
        distanceKm: "",
        cargoWeightKg: "",
        revenue: "",
        expectedDeliveryTime: "",
        vehicleId: "",
        driverId: "",
      });
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Dispatch failed. Verify asset availability.",
      );
    }
  };

  // Logic: Show only assets available for assignment
  const availableVehicles = vehicles.filter((v) => v.status === "AVAILABLE");
  const availableDrivers = drivers.filter((d) => d.status === "ON_DUTY");

  return (
    <AppLayout title="Logistics & Dispatch">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            Trip Dispatcher
          </h2>
          <p className="text-sm text-slate-500 font-medium italic">
            Workflow for moving goods from Point A to Point B [cite: 26]
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`px-6 py-3 rounded-2xl flex items-center gap-2 font-black transition shadow-xl ${showForm ? "bg-slate-100 text-slate-600" : "bg-blue-600 text-white shadow-blue-100 hover:bg-blue-700"}`}
        >
          {showForm ? (
            "Cancel Order"
          ) : (
            <>
              <Plus size={20} /> New Dispatch
            </>
          )}
        </button>
      </div>

      {/* Overload Alert UI */}
      {(error || isOverloaded) && (
        <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl mb-8 flex items-center gap-3 animate-shake">
          <AlertCircle size={24} />
          <div>
            <p className="font-black uppercase text-[10px] tracking-widest">
              Validation Block
            </p>
            <p className="font-bold text-sm">
              {error ||
                `Alert: Cargo (${formData.cargoWeightKg}kg) exceeds vehicle capacity (${selectedVehicle?.capacityKg}kg)`}
            </p>
          </div>
        </div>
      )}

      {/* Dispatch Form  */}
      {showForm && (
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 mb-10 animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="text-lg font-black text-slate-800 mb-6 uppercase tracking-tight flex items-center gap-2">
            <ArrowRightCircle size={22} className="text-blue-600" /> Order
            Parameters
          </h3>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                Origin City
              </label>
              <input
                required
                className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                value={formData.origin}
                onChange={(e) =>
                  setFormData({ ...formData, origin: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                Destination
              </label>
              <input
                required
                className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                value={formData.destination}
                onChange={(e) =>
                  setFormData({ ...formData, destination: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                Distance (km)
              </label>
              <input
                required
                type="number"
                className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                value={formData.distanceKm}
                onChange={(e) =>
                  setFormData({ ...formData, distanceKm: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                Cargo Weight (kg)
              </label>
              <input
                required
                type="number"
                className={`w-full border p-3.5 rounded-xl outline-none focus:ring-2 font-bold ${isOverloaded ? "bg-rose-50 border-rose-300 text-rose-600 focus:ring-rose-500" : "bg-slate-50 border-slate-200 focus:ring-blue-500"}`}
                value={formData.cargoWeightKg}
                onChange={(e) =>
                  setFormData({ ...formData, cargoWeightKg: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                Revenue ($)
              </label>
              <input
                required
                type="number"
                className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-emerald-600"
                value={formData.revenue}
                onChange={(e) =>
                  setFormData({ ...formData, revenue: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                Deadline
              </label>
              <input
                required
                type="datetime-local"
                className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    expectedDeliveryTime: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                Vehicle Asset
              </label>
              <select
                required
                className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                value={formData.vehicleId}
                onChange={(e) =>
                  setFormData({ ...formData, vehicleId: e.target.value })
                }
              >
                <option value="">Select available...</option>
                {availableVehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.licensePlate} ({v.capacityKg}kg limit)
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                Assigned Driver
              </label>
              <select
                required
                className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                value={formData.driverId}
                onChange={(e) =>
                  setFormData({ ...formData, driverId: e.target.value })
                }
              >
                <option value="">Select available...</option>
                {availableDrivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.licenseCategory})
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={isOverloaded}
              className="lg:col-span-4 bg-slate-900 text-white p-4 rounded-2xl font-black text-lg shadow-xl shadow-slate-200 transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm Dispatch Order
            </button>
          </form>
        </div>
      )}

      {/* Trips Registry Table */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b">
              <th className="p-6">Route Details</th>
              <th className="p-6 text-center">Resources</th>
              <th className="p-6 text-center">Status Pills</th>
              <th className="p-6 text-center">Logistics</th>
              <th className="p-6 text-right">Delivery Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {trips.map((t) => (
              <tr
                key={t.id}
                className="hover:bg-slate-50/50 transition-colors group"
              >
                <td className="p-6">
                  <div className="flex items-center gap-3 font-bold text-slate-800">
                    <MapPin size={18} className="text-blue-500" />
                    <span className="truncate max-w-[150px]">{t.origin}</span>
                    <ArrowRightCircle size={14} className="text-slate-300" />
                    <span className="truncate max-w-[150px]">
                      {t.destination}
                    </span>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 mt-1 ml-7 uppercase tracking-tighter">
                    ID: TRIP-{t.id.slice(-4)}
                  </p>
                </td>
                <td className="p-6">
                  <div className="flex flex-col items-center gap-1">
                    <span className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                      <Truck size={12} /> {t.vehicle?.licensePlate}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">
                      {t.driver?.name}
                    </span>
                  </div>
                </td>
                <td className="p-6 text-center">
                  <span
                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight ${t.status === "DISPATCHED" ? "bg-blue-100 text-blue-700" : t.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                  >
                    {t.status}
                  </span>
                </td>
                <td className="p-6">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1 text-xs font-black text-slate-700">
                      <Weight size={12} className="text-slate-400" />{" "}
                      {t.cargoWeightKg} kg
                    </div>
                    <div className="flex items-center gap-1 text-xs font-black text-emerald-600">
                      <DollarSign size={12} /> {t.revenue.toLocaleString()}
                    </div>
                  </div>
                </td>
                <td className="p-6 text-right">
                  <div className="flex items-center justify-end gap-2 font-bold text-slate-800">
                    <Clock size={14} className="text-slate-300" />
                    {new Date(t.expectedDeliveryTime).toLocaleDateString(
                      "en-GB",
                      { day: "2-digit", month: "short" },
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
