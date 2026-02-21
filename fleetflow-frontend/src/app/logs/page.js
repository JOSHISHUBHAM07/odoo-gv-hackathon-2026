"use client";
import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import api from "@/lib/api";
import {
  Droplet,
  Wrench,
  Plus,
  History,
  Receipt,
  Calendar,
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function LogsPage() {
  const [activeTab, setActiveTab] = useState("FUEL");
  const [vehicles, setVehicles] = useState([]);
  const [fuelLogs, setFuelLogs] = useState([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [fuelData, setFuelData] = useState({
    vehicleId: "",
    fuelLiters: "",
    cost: "",
  });
  const [maintData, setMaintData] = useState({
    vehicleId: "",
    serviceType: "PREVENTIVE",
    cost: "",
    nextServiceDue: "",
    vendorName: "",
    description: "",
  });

  const fetchData = async () => {
    try {
      const [vRes, fRes, mRes] = await Promise.all([
        api.get("/vehicles"),
        api.get("/logs/fuel"),
        api.get("/logs/maintenance"),
      ]);
      setVehicles(vRes.data);
      setFuelLogs(fRes.data);
      setMaintenanceLogs(mRes.data);
    } catch (err) {
      console.error("Failed to fetch fleet data", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFuelSubmit = async (e) => {
    e.preventDefault();
    try {
      // Logic: Record Liters, Cost, and Date for Financial tracking [cite: 35]
      await api.post("/logs/fuel", {
        vehicleId: fuelData.vehicleId,
        fuelLiters: parseFloat(fuelData.fuelLiters),
        cost: parseFloat(fuelData.cost),
      });
      toast.success("Fuel expense recorded");
      setShowForm(false);
      setFuelData({ vehicleId: "", fuelLiters: "", cost: "" });
      fetchData();
    } catch (err) {
      toast.error("Fuel logging failed");
    }
  };

  const handleMaintenanceSubmit = async (e) => {
    e.preventDefault();
    try {
      // Auto-Logic: Status -> In Shop. Vehicle hidden from Dispatcher
      await api.post("/logs/maintenance", {
        vehicleId: maintData.vehicleId,
        serviceType: maintData.serviceType,
        cost: parseFloat(maintData.cost),
        nextServiceDue: parseFloat(maintData.nextServiceDue),
        vendorName: maintData.vendorName,
        description: maintData.description,
      });
      toast.success(
        "Maintenance log created. Vehicle moved to 'In Shop' status.",
      );
      setShowForm(false);
      setMaintData({
        vehicleId: "",
        serviceType: "PREVENTIVE",
        cost: "",
        nextServiceDue: "",
        vendorName: "",
        description: "",
      });
      fetchData();
    } catch (err) {
      toast.error("Maintenance logging failed");
    }
  };

  return (
    <AppLayout title="Operational Expenses & Service">
      {/* Tab & Action Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex bg-slate-50 p-1.5 rounded-xl border border-slate-200 w-full md:w-auto">
          <button
            onClick={() => setActiveTab("FUEL")}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-black transition-all ${activeTab === "FUEL" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
          >
            <Droplet size={16} /> Fuel Logs
          </button>
          <button
            onClick={() => setActiveTab("MAINTENANCE")}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-black transition-all ${activeTab === "MAINTENANCE" ? "bg-white text-orange-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
          >
            <Wrench size={16} /> Maintenance
          </button>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full md:w-auto bg-slate-900 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-black transition-all font-black text-sm shadow-lg shadow-slate-200"
        >
          <Plus size={18} /> New{" "}
          {activeTab === "FUEL" ? "Fuel Entry" : "Service Log"}
        </button>
      </div>

      {/* Optimized Form UI */}
      {showForm && (
        <div
          className={`p-8 rounded-3xl border mb-8 animate-in fade-in slide-in-from-top-4 duration-300 ${activeTab === "FUEL" ? "bg-blue-50/50 border-blue-100" : "bg-orange-50/50 border-orange-100"}`}
        >
          <h3
            className={`text-lg font-black mb-6 flex items-center gap-2 ${activeTab === "FUEL" ? "text-blue-800" : "text-orange-800"}`}
          >
            {activeTab === "FUEL" ? (
              <Receipt size={22} />
            ) : (
              <History size={22} />
            )}
            Create{" "}
            {activeTab === "FUEL" ? "Fuel Receipt" : "Maintenance Record"}
          </h3>

          <form
            onSubmit={
              activeTab === "FUEL" ? handleFuelSubmit : handleMaintenanceSubmit
            }
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                Vehicle Asset
              </label>
              <select
                required
                className="bg-white border border-slate-200 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-slate-900 transition-all font-bold"
                value={
                  activeTab === "FUEL"
                    ? fuelData.vehicleId
                    : maintData.vehicleId
                }
                onChange={(e) =>
                  activeTab === "FUEL"
                    ? setFuelData({ ...fuelData, vehicleId: e.target.value })
                    : setMaintData({ ...maintData, vehicleId: e.target.value })
                }
              >
                <option value="">Select Asset...</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.licensePlate} — {v.model}
                  </option>
                ))}
              </select>
            </div>

            {activeTab === "FUEL" ? (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                    Liters (Volume)
                  </label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    className="bg-white border border-slate-200 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-bold"
                    value={fuelData.fuelLiters}
                    onChange={(e) =>
                      setFuelData({ ...fuelData, fuelLiters: e.target.value })
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                    Total Cost ($)
                  </label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    className="bg-white border border-slate-200 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-bold text-rose-600"
                    value={fuelData.cost}
                    onChange={(e) =>
                      setFuelData({ ...fuelData, cost: e.target.value })
                    }
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                    Service Classification
                  </label>
                  <select
                    required
                    className="bg-white border border-slate-200 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-orange-600 font-bold"
                    value={maintData.serviceType}
                    onChange={(e) =>
                      setMaintData({
                        ...maintData,
                        serviceType: e.target.value,
                      })
                    }
                  >
                    <option value="PREVENTIVE">Preventive Maintenance</option>
                    <option value="BREAKDOWN">Breakdown / Repair</option>
                    <option value="EMERGENCY">Emergency Service</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                    Vendor / Mechanic
                  </label>
                  <input
                    required
                    type="text"
                    className="bg-white border border-slate-200 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-orange-600 font-bold"
                    value={maintData.vendorName}
                    onChange={(e) =>
                      setMaintData({ ...maintData, vendorName: e.target.value })
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                    Service Cost ($)
                  </label>
                  <input
                    required
                    type="number"
                    className="bg-white border border-slate-200 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-orange-600 font-bold text-rose-600"
                    value={maintData.cost}
                    onChange={(e) =>
                      setMaintData({ ...maintData, cost: e.target.value })
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                    Next Service Due (km)
                  </label>
                  <input
                    required
                    type="number"
                    className="bg-white border border-slate-200 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-orange-600 font-bold"
                    value={maintData.nextServiceDue}
                    onChange={(e) =>
                      setMaintData({
                        ...maintData,
                        nextServiceDue: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="md:col-span-3 flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                    Work Description
                  </label>
                  <input
                    required
                    type="text"
                    className="bg-white border border-slate-200 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-orange-600 font-bold"
                    value={maintData.description}
                    onChange={(e) =>
                      setMaintData({
                        ...maintData,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
              </>
            )}
            <div className="md:col-span-3 flex justify-end pt-2">
              <button
                type="submit"
                className={`px-10 py-4 rounded-2xl text-white font-black text-sm shadow-xl transition-all ${activeTab === "FUEL" ? "bg-blue-600 shadow-blue-100" : "bg-orange-600 shadow-orange-100"}`}
              >
                Commit to Ledger
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Scannable Data Tables  */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
              <th className="p-6">Execution Date</th>
              <th className="p-6">Asset ID</th>
              <th className="p-6">
                {activeTab === "FUEL" ? "Volume Info" : "Classification"}
              </th>
              <th className="p-6 text-right">Operational Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {activeTab === "FUEL"
              ? fuelLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                          <Calendar size={14} />
                        </div>
                        <span className="font-bold text-slate-800">
                          {new Date(log.date).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="p-6 font-black text-slate-500 uppercase tracking-tighter">
                      {log.vehicle?.licensePlate}
                    </td>
                    <td className="p-6 font-bold text-slate-700">
                      {log.fuelLiters} Liters
                    </td>
                    <td className="p-6 text-right font-black text-rose-600">
                      ${log.cost.toLocaleString()}
                    </td>
                  </tr>
                ))
              : maintenanceLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="p-6 font-bold text-slate-800">
                      {new Date(log.serviceDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-6 font-black text-slate-500 uppercase tracking-tighter">
                      {log.vehicle?.licensePlate}
                    </td>
                    <td className="p-6">
                      <span
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight ${log.serviceType === "PREVENTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}
                      >
                        {log.serviceType.replace("_", " ")}
                      </span>
                      <span className="block text-xs text-slate-400 font-medium mt-1">
                        {log.vendorName} — {log.description}
                      </span>
                    </td>
                    <td className="p-6 text-right font-black text-rose-600">
                      ${log.cost.toLocaleString()}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
