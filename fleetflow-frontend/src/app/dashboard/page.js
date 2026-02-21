"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  Activity,
  Droplet,
  Wrench,
  Truck,
  BarChart3,
  Package,
  TrendingUp,
  ArrowRight,
  Loader2,
} from "lucide-react";
import AppLayout from "@/components/AppLayout";
import Link from "next/link";

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Logic: Sync with the Operational Analytics controller
        const res = await api.get("/analytics/dashboard");
        setStats(res.data);
      } catch (err) {
        if (err.response?.status === 401) {
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [router]);

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-slate-500 font-black text-sm uppercase tracking-widest">
            Syncing Fleet Hub...
          </p>
        </div>
      </div>
    );

  return (
    <AppLayout title="Command Center">
      {/* KPI Row 1: Fleet Oversight */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* Active Fleet */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Truck size={24} />
            </div>
            <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">
              Live
            </span>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">
            Active Fleet
          </p>
          <p className="text-5xl font-black text-slate-800 tracking-tighter mb-1">
            {stats?.activeFleet || 0}
          </p>
          <p className="text-[11px] text-slate-400 font-bold italic">
            Currently "On Trip"
          </p>
        </div>

        {/* Maintenance Alerts */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl">
              <Wrench size={24} />
            </div>
            {stats?.maintenanceAlerts > 0 && (
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
            )}
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">
            Service Alerts
          </p>
          <p className="text-5xl font-black text-slate-800 tracking-tighter mb-1">
            {stats?.maintenanceAlerts || 0}
          </p>
          <p className="text-[11px] text-slate-400 font-bold italic">
            Vehicles "In Shop"
          </p>
        </div>

        {/* Utilization Rate */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
              <BarChart3 size={24} />
            </div>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">
            Asset Utilization
          </p>
          <p className="text-5xl font-black text-slate-800 tracking-tighter mb-1">
            {stats?.utilizationRate || "0%"}
          </p>
          <p className="text-[11px] text-slate-400 font-bold italic">
            Assigned vs Idle Assets
          </p>
        </div>

        {/* Pending Cargo */}
        <Link
          href="/trips"
          className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-800 group hover:bg-black transition-all duration-500"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-slate-800 text-blue-400 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
              <Package size={24} />
            </div>
            <ArrowRight
              size={20}
              className="text-slate-600 group-hover:text-white transition-transform group-hover:translate-x-1"
            />
          </div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">
            Pending Cargo
          </p>
          <p className="text-5xl font-black text-white tracking-tighter mb-1">
            {stats?.pendingCargo || 0}
          </p>
          <p className="text-[11px] text-slate-500 font-bold italic uppercase tracking-tighter">
            Await Assignment
          </p>
        </Link>
      </div>

      {/* KPI Row 2: Financial Performance */}
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-6 ml-2">
        Enterprise Financial Audit
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Total Operational Cost */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center justify-between group">
          <div className="flex items-center">
            <div className="p-5 bg-rose-50 text-rose-600 rounded-2xl mr-5 group-hover:scale-110 transition-transform">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Total Op. Drain
              </p>
              <p className="text-3xl font-black text-slate-800 tracking-tighter">
                $
                {stats?.financials?.totalOperationalCost?.toLocaleString() || 0}
              </p>
            </div>
          </div>
          <TrendingUp className="text-slate-100" size={40} />
        </div>

        {/* Fuel Spend */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center group">
          <div className="p-5 bg-blue-50 text-blue-600 rounded-2xl mr-5 group-hover:scale-110 transition-transform">
            <Droplet size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Fuel Expenditure
            </p>
            <p className="text-3xl font-black text-slate-800 tracking-tighter">
              ${stats?.financials?.totalFuelSpend?.toLocaleString() || 0}
            </p>
          </div>
        </div>

        {/* Action Card: Reports [FIX: Added Link and hover states] */}
        <Link
          href="/reports"
          className="bg-blue-600 p-8 rounded-[2.5rem] shadow-2xl shadow-blue-100 flex items-center justify-between group cursor-pointer hover:bg-blue-700 transition-all duration-300"
        >
          <div className="flex items-center">
            <div className="p-5 bg-white/10 text-white rounded-2xl mr-5 group-hover:bg-white group-hover:text-blue-600 transition-all">
              <BarChart3 size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest mb-1">
                Deep Analytics
              </p>
              <p className="text-2xl font-black text-white tracking-tight italic">
                View ROI Hub
              </p>
            </div>
          </div>
          <ArrowRight
            className="text-blue-300 group-hover:translate-x-2 transition-transform group-hover:text-white"
            size={24}
          />
        </Link>
      </div>
    </AppLayout>
  );
}
