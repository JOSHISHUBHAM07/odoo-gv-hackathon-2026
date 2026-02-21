"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import AppLayout from "@/components/AppLayout";
import {
  Download,
  TrendingUp,
  Droplets,
  CircleDollarSign,
  Zap,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      // Logic: Backend provides calculated ROI and km/L
      const res = await api.get("/analytics/reports");
      setReports(res.data);
    } catch (err) {
      toast.error("Failed to sync audit data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // PRD Module 8: One-click CSV export for audits
  const handleExport = () => {
    if (reports.length === 0) return;

    const headers = [
      "Vehicle",
      "License Plate",
      "Efficiency (km/L)",
      "Distance (km)",
      "ROI",
      "Op Cost ($)",
      "Net Revenue ($)",
    ];
    const rows = reports.map((r) => [
      r.name,
      r.licensePlate,
      r.fuelEfficiency,
      r.totalDistance,
      `${r.roi}x`,
      r.operationalCost,
      r.revenue,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `FleetFlow_Audit_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast.success("Audit CSV Downloaded");
  };

  if (loading)
    return (
      <AppLayout title="Operational Analytics">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      </AppLayout>
    );

  const avgEfficiency = (
    reports.reduce((acc, curr) => acc + parseFloat(curr.fuelEfficiency), 0) /
      reports.length || 0
  ).toFixed(2);
  const totalOpCost = reports.reduce(
    (acc, curr) => acc + curr.operationalCost,
    0,
  );

  return (
    <AppLayout title="Operational Analytics">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <p className="text-blue-600 font-black text-[9px] uppercase tracking-[0.4em] mb-1 text-left">
            Financial Intelligence
          </p>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter">
            Financial Audit Hub
          </h2>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition shadow-xl shadow-slate-200"
        >
          <Download size={18} /> Export Audit CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-slate-200">
          <Zap size={28} className="mb-6 text-blue-400" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Avg Efficiency
          </p>
          <p className="text-4xl font-black mt-2 italic">
            {avgEfficiency}{" "}
            <span className="text-sm not-italic text-slate-500">km/L</span>
          </p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <CircleDollarSign size={28} className="mb-6 text-rose-500" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Total Op. Drain
          </p>
          <p className="text-4xl font-black mt-2 text-slate-800">
            ${totalOpCost.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <TrendingUp size={28} className="mb-6 text-emerald-500" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Portfolio Status
          </p>
          <p className="text-4xl font-black mt-2 text-slate-800 italic">
            Optimized
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Vehicle Asset
              </th>
              <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                Fuel Efficiency
              </th>
              <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                ROI Multiplier
              </th>
              <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                Net Revenue
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {reports.map((r) => (
              <tr
                key={r.vehicleId}
                className="hover:bg-slate-50/50 transition-colors group"
              >
                <td className="p-8">
                  <p className="font-black text-slate-800 text-sm mb-1">
                    {r.name}
                  </p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                    {r.licensePlate}
                  </p>
                </td>
                <td className="p-8 text-center">
                  <div className="inline-flex items-center gap-2 font-black text-blue-600 bg-blue-50 px-5 py-2 rounded-xl border border-blue-100">
                    <Droplets size={14} /> {r.fuelEfficiency}{" "}
                    <span className="text-[10px]">km/L</span>
                  </div>
                </td>
                <td className="p-8 text-center">
                  <span
                    className={`px-5 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest border ${parseFloat(r.roi) > 1 ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"}`}
                  >
                    {r.roi}x ROI
                  </span>
                </td>
                <td className="p-8 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <span className="font-black text-slate-800 text-lg">
                      ${r.revenue.toLocaleString()}
                    </span>
                    <ChevronRight
                      size={18}
                      className="text-slate-200 group-hover:text-blue-500 transition-colors"
                    />
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
