"use client";
import api from "@/lib/api";
import {
  Power,
  PowerOff,
  AlertTriangle,
  Truck,
  Zap,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function QuickActionFleet({ vehicles, refreshData }) {
  const [loadingId, setLoadingId] = useState(null);

  const handleToggle = async (id, currentStatus) => {
    setLoadingId(id);
    try {
      // FIX: Changed endpoint from /toggle-active to /status to match your backend router
      await api.patch(`/vehicles/${id}/status`);

      const action = currentStatus === "RETIRED" ? "activated" : "retired";
      toast.success(`Asset ${action} successfully`);

      // Triggers dashboard KPI refresh (Active Fleet & Utilization)
      refreshData();
    } catch (err) {
      toast.error("Failed to update asset lifecycle status");
      console.error("Endpoint mismatch or Auth error:", err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden h-full flex flex-col">
      <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
        <div>
          <h3 className="font-black text-slate-800 uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
            <Zap size={14} className="text-blue-600" /> Asset Lifecycle Hub
          </h3>
          <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">
            Manual Status Overrides
          </p>
        </div>
        <AlertTriangle size={18} className="text-amber-500 animate-pulse" />
      </div>

      <div className="divide-y divide-slate-50 overflow-y-auto custom-scrollbar flex-1">
        {vehicles.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-xs font-bold text-slate-400 italic">
              No fleet assets detected
            </p>
          </div>
        ) : (
          vehicles.map((v) => (
            <div
              key={v.id}
              className="p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg transition-colors ${
                    v.status === "RETIRED"
                      ? "bg-slate-100 text-slate-400"
                      : "bg-blue-50 text-blue-600"
                  }`}
                >
                  <Truck size={16} />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800 leading-tight">
                    {v.model}
                  </p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                    {v.licensePlate}
                  </p>
                </div>
              </div>

              <button
                disabled={loadingId === v.id}
                onClick={() => handleToggle(v.id, v.status)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-[10px] uppercase transition-all shadow-sm active:scale-95 disabled:opacity-50 ${
                  v.status === "RETIRED"
                    ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100"
                    : "bg-white text-rose-600 border border-rose-100 hover:bg-rose-50"
                }`}
              >
                {loadingId === v.id ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : v.status === "RETIRED" ? (
                  <>
                    <Power size={12} /> Re-Activate
                  </>
                ) : (
                  <>
                    <PowerOff size={12} /> Retire Asset
                  </>
                )}
              </button>
            </div>
          ))
        )}
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-100">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter text-center italic">
          Retired assets are excluded from active KPIs
        </p>
      </div>
    </div>
  );
}
