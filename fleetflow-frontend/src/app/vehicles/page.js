"use client";
import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import api from "@/lib/api";
import {
  Plus,
  Truck,
  Power,
  PowerOff,
  ShieldCheck,
  Gauge,
  Landmark,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loadingId, setLoadingId] = useState(null);

  const [formData, setFormData] = useState({
    model: "",
    licensePlate: "",
    acquisitionCost: "",
    capacityKg: "",
    insuranceExpiry: "",
    registrationExpiry: "",
    fuelType: "DIESEL",
  });

  const fetchVehicles = async () => {
    try {
      const res = await api.get("/vehicles");
      setVehicles(res.data);
    } catch (err) {
      console.error("Failed to fetch fleet assets", err);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        acquisitionCost: parseFloat(formData.acquisitionCost),
        capacityKg: parseFloat(formData.capacityKg),
        insuranceExpiry: new Date(formData.insuranceExpiry).toISOString(),
        registrationExpiry: new Date(formData.registrationExpiry).toISOString(),
      };

      await api.post("/vehicles", payload);
      toast.success("Asset successfully registered to registry");
      setShowForm(false);
      fetchVehicles();
      setFormData({
        model: "",
        licensePlate: "",
        acquisitionCost: "",
        capacityKg: "",
        insuranceExpiry: "",
        registrationExpiry: "",
        fuelType: "DIESEL",
      });
    } catch (err) {
      toast.error(err.response?.data?.error || "Registration failed");
    }
  };

  const toggleVehicleActive = async (id, currentStatus) => {
    setLoadingId(id);
    try {
      // Logic: Manual Retirement Toggle matching backend route
      await api.patch(`/vehicles/${id}/status`);

      const action = currentStatus === "RETIRED" ? "Re-activated" : "Retired";
      toast.success(`Asset successfully ${action}`);
      fetchVehicles();
    } catch (err) {
      toast.error("Oversight Action Failed: Check Endpoint or Permissions");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <AppLayout title="Vehicle Registry">
      <div className="flex justify-between items-center mb-10">
        <div>
          <p className="text-blue-600 font-black text-[9px] uppercase tracking-[0.4em] mb-1">
            Asset Oversight
          </p>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter">
            Physical Inventory
          </h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-slate-900 text-white px-8 py-4 rounded-2xl flex items-center gap-3 hover:bg-black transition shadow-xl shadow-slate-200 font-black text-xs uppercase tracking-widest"
        >
          <Plus size={18} /> Add Physical Asset
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 mb-10 animate-in fade-in slide-in-from-top-4 duration-300 shadow-sm">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-3">
            Vehicle Intake Specification
          </h3>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                Asset Model
              </label>
              <input
                required
                className="w-full border-slate-200 p-4 rounded-2xl bg-slate-50 outline-none focus:ring-4 focus:ring-blue-500/10 font-bold text-sm"
                value={formData.model}
                onChange={(e) =>
                  setFormData({ ...formData, model: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                Unique Plate ID
              </label>
              <input
                required
                className="w-full border-slate-200 p-4 rounded-2xl bg-slate-50 outline-none focus:ring-4 focus:ring-blue-500/10 font-bold text-sm uppercase tracking-widest"
                value={formData.licensePlate}
                onChange={(e) =>
                  setFormData({ ...formData, licensePlate: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                Max Payload (KG)
              </label>
              <input
                required
                type="number"
                className="w-full border-slate-200 p-4 rounded-2xl bg-slate-50 outline-none focus:ring-4 focus:ring-blue-500/10 font-bold text-sm"
                value={formData.capacityKg}
                onChange={(e) =>
                  setFormData({ ...formData, capacityKg: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                Acquisition Cost ($)
              </label>
              <input
                required
                type="number"
                className="w-full border-slate-200 p-4 rounded-2xl bg-slate-50 outline-none focus:ring-4 focus:ring-blue-500/10 font-bold text-sm text-emerald-600"
                value={formData.acquisitionCost}
                onChange={(e) =>
                  setFormData({ ...formData, acquisitionCost: e.target.value })
                }
              />
            </div>
            <div className="space-y-2 flex flex-col">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                Insurance Expiry
              </label>
              <input
                required
                type="date"
                className="w-full border-slate-200 p-4 rounded-2xl bg-slate-50 outline-none focus:ring-4 focus:ring-blue-500/10 font-bold text-sm"
                onChange={(e) =>
                  setFormData({ ...formData, insuranceExpiry: e.target.value })
                }
              />
            </div>
            <div className="space-y-2 flex flex-col">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                Registration Expiry
              </label>
              <input
                required
                type="date"
                className="w-full border-slate-200 p-4 rounded-2xl bg-slate-50 outline-none focus:ring-4 focus:ring-blue-500/10 font-bold text-sm"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    registrationExpiry: e.target.value,
                  })
                }
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white p-5 rounded-2xl hover:bg-blue-700 md:col-span-3 font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-100"
            >
              Commit Asset to Registry
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
              <th className="p-8">Asset Identification</th>
              <th className="p-8 text-center">Technical Specs</th>
              <th className="p-8 text-center">Lifecycle State</th>
              <th className="p-8 text-right">Oversight Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {vehicles.map((v) => (
              <tr
                key={v.id}
                className="hover:bg-slate-50/50 transition-colors group"
              >
                <td className="p-8">
                  <p className="font-black text-slate-800 text-sm mb-1">
                    {v.model}
                  </p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                    {v.licensePlate}
                  </p>
                </td>
                <td className="p-8 text-center">
                  <div className="inline-flex flex-col gap-2">
                    <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                      <Gauge size={12} /> {v.odometerKm?.toLocaleString()} KM
                    </span>
                    <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                      <Landmark size={12} /> {v.capacityKg?.toLocaleString()} KG
                    </span>
                  </div>
                </td>
                <td className="p-8 text-center">
                  <span
                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                      v.status === "AVAILABLE"
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                        : v.status === "ON_TRIP"
                          ? "bg-blue-50 text-blue-600 border-blue-100"
                          : v.status === "IN_SHOP"
                            ? "bg-amber-50 text-amber-600 border-amber-100"
                            : "bg-slate-50 text-slate-400 border-slate-100"
                    }`}
                  >
                    {v.status.replace("_", " ")}
                  </span>
                </td>
                <td className="p-8 text-right">
                  <div className="flex justify-end items-center gap-3">
                    {/* Always Visible management buttons with distinct color coding */}
                    {v.status === "RETIRED" ? (
                      <button
                        disabled={loadingId === v.id}
                        onClick={() => toggleVehicleActive(v.id, v.status)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase transition-all shadow-lg shadow-emerald-100 hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
                        title="Restore to Active Fleet"
                      >
                        {loadingId === v.id ? (
                          <Loader2 className="animate-spin" size={12} />
                        ) : (
                          <>
                            <Power size={12} /> Re-Activate
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        disabled={loadingId === v.id}
                        onClick={() => toggleVehicleActive(v.id, v.status)}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-rose-600 border border-rose-100 rounded-xl font-black text-[10px] uppercase transition-all hover:bg-rose-50 active:scale-95 disabled:opacity-50"
                        title="Remove from Active Fleet"
                      >
                        {loadingId === v.id ? (
                          <Loader2 className="animate-spin" size={12} />
                        ) : (
                          <>
                            <PowerOff size={12} /> Retire Asset
                          </>
                        )}
                      </button>
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
