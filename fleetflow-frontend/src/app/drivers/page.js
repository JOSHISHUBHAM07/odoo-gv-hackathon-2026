"use client";
import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import api from "@/lib/api";
import {
  Plus,
  AlertCircle,
  ShieldCheck,
  UserX,
  UserCheck,
  Calendar,
  Clock,
  Phone,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function DriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [loadingId, setLoadingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    licenseNumber: "",
    licenseExpiry: "",
    licenseCategory: "",
    contactInfo: "",
  });

  const fetchDrivers = async () => {
    try {
      const res = await api.get("/drivers");
      setDrivers(res.data);
    } catch (err) {
      console.error("Failed to fetch drivers", err);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        ...formData,
        licenseExpiry: new Date(formData.licenseExpiry).toISOString(),
      };
      await api.post("/drivers", payload);
      toast.success("Operator registered successfully");
      setShowForm(false);
      fetchDrivers();
      setFormData({
        name: "",
        licenseNumber: "",
        licenseExpiry: "",
        licenseCategory: "",
        contactInfo: "",
      });
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Registration failed. Verify license uniqueness.",
      );
    }
  };

  // Logic: Updated to match backend route /drivers/:id/status
  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "SUSPENDED" ? "ON_DUTY" : "SUSPENDED";
    setLoadingId(id);
    try {
      // FIX: Added /status suffix to match our backend router update
      await api.patch(`/drivers/${id}/status`, { status: newStatus });
      toast.success(`Operator status updated to ${newStatus}`);
      fetchDrivers();
    } catch (err) {
      toast.error("Failed to update operator status");
    } finally {
      setLoadingId(null);
    }
  };

  const getExpiryDetails = (dateString) => {
    const today = new Date();
    const expiry = new Date(dateString);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return { days: diffDays, expired: diffDays < 0 };
  };

  return (
    <AppLayout title="Personnel & Safety">
      <div className="flex justify-between items-center mb-10">
        <div>
          <p className="text-blue-600 font-black text-[9px] uppercase tracking-[0.4em] mb-1">
            Fleet Resources
          </p>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter">
            Operator Compliance
          </h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-slate-900 text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-black transition shadow-xl shadow-slate-200 font-black text-xs uppercase tracking-widest"
        >
          <Plus size={16} /> Register Operator
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-10 rounded-[2rem] border border-slate-100 mb-10 animate-in fade-in slide-in-from-top-4 duration-300 shadow-sm">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8">
            Operator Intake Form
          </h3>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                Full Identity
              </label>
              <input
                required
                className="w-full border-slate-200 p-4 rounded-2xl bg-slate-50 outline-none focus:ring-4 focus:ring-blue-500/10 font-bold text-sm"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                License ID
              </label>
              <input
                required
                className="w-full border-slate-200 p-4 rounded-2xl bg-slate-50 outline-none focus:ring-4 focus:ring-blue-500/10 font-bold text-sm"
                value={formData.licenseNumber}
                onChange={(e) =>
                  setFormData({ ...formData, licenseNumber: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                Asset Class
              </label>
              <select
                required
                className="w-full border-slate-200 p-4 rounded-2xl bg-slate-50 outline-none focus:ring-4 focus:ring-blue-500/10 font-bold text-sm"
                value={formData.licenseCategory}
                onChange={(e) =>
                  setFormData({ ...formData, licenseCategory: e.target.value })
                }
              >
                <option value="">Select Category</option>
                <option value="VAN">Van</option>
                <option value="TRUCK">Truck</option>
              </select>
            </div>
            <div className="md:col-span-3 flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 text-white px-10 py-4 rounded-2xl hover:bg-blue-700 font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 transition"
              >
                Save Profile
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
              <th className="p-8">Operator Details</th>
              <th className="p-8 text-center">Safety Rating</th>
              <th className="p-8">Compliance Status</th>
              <th className="p-8 text-right">Operational Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {drivers.map((d) => {
              const { days, expired } = getExpiryDetails(d.licenseExpiry);
              return (
                <tr
                  key={d.id}
                  className="hover:bg-slate-50/50 transition group"
                >
                  <td className="p-8">
                    <p className="font-black text-slate-800 text-sm mb-1">
                      {d.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">
                      {d.licenseNumber} • {d.licenseCategory}
                    </p>
                  </td>
                  <td className="p-8 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span className="text-lg font-black text-blue-600 leading-none">
                        {d.safetyScore || 100}
                      </span>
                      <span className="text-[8px] font-black text-slate-300 uppercase mt-1 tracking-widest">
                        Score
                      </span>
                    </div>
                  </td>
                  <td className="p-8">
                    {expired ? (
                      <span className="text-rose-600 font-black flex items-center gap-1.5 text-[10px] uppercase bg-rose-50 px-3 py-1.5 rounded-xl w-fit border border-rose-100 animate-pulse">
                        <AlertCircle size={14} /> Expired
                      </span>
                    ) : (
                      <span
                        className={`font-black flex items-center gap-1.5 text-[10px] uppercase px-3 py-1.5 rounded-xl w-fit border ${days < 30 ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"}`}
                      >
                        <Clock size={14} /> {days} Days Remaining
                      </span>
                    )}
                  </td>
                  <td className="p-8 text-right">
                    <div className="flex justify-end gap-4">
                      <span
                        className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest h-fit self-center border ${d.status === "ON_TRIP" ? "bg-blue-50 text-blue-600 border-blue-100" : d.status === "SUSPENDED" ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-slate-50 text-slate-400 border-slate-100"}`}
                      >
                        {d.status.replace("_", " ")}
                      </span>
                      <button
                        onClick={() => toggleStatus(d.id, d.status)}
                        disabled={loadingId === d.id}
                        className={`p-3 rounded-xl transition ${d.status === "SUSPENDED" ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : "bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600"}`}
                      >
                        {loadingId === d.id ? (
                          <Loader2 className="animate-spin" size={18} />
                        ) : d.status === "SUSPENDED" ? (
                          <UserCheck size={18} />
                        ) : (
                          <UserX size={18} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
