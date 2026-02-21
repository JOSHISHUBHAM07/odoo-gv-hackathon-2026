"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  Truck,
  Lock,
  Mail,
  AlertCircle,
  ShieldCheck,
  UserCircle,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleLogin = async (e, demoData = null) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");

    const loginData = demoData || formData;

    try {
      // Logic: Secure access for different user roles (Module 1)
      const res = await api.post("/auth/login", {
        email: loginData.email.toLowerCase(), // Normalize for backend match
        password: loginData.password,
      });

      // Standardized Payload: token, role, and name
      const { token, role, name } = res.data;

      // Persist session and RBAC data for the modular hub
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("userName", name);

      toast.success(`Welcome back, ${name}`);
      router.push("/dashboard");
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        "Authentication failed. Check credentials.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Roles for Simulation based on PRD User Personas
  const demoRoles = [
    { name: "Manager", email: "manager@fleetflow.com" },
    { name: "Dispatcher", email: "dispatch@fleetflow.com" },
    { name: "Finance", email: "finance@fleetflow.com" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
        <div className="p-12">
          <div className="flex flex-col items-center mb-10">
            <div className="w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl shadow-slate-200">
              <Truck className="text-blue-500" size={36} />
            </div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tighter italic">
              FleetFlow
            </h2>
            <p className="text-blue-600 font-black text-[9px] uppercase tracking-[0.4em] mt-3">
              Rule-Based Dispatch Hub
            </p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center gap-3 text-[11px] font-black uppercase tracking-tight animate-shake">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">
                Operator ID (Email)
              </label>
              <div className="relative group">
                <Mail
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors"
                  size={18}
                />
                <input
                  required
                  type="email"
                  className="w-full pl-14 pr-6 py-4.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all font-bold text-sm"
                  placeholder="admin@fleetflow.com"
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">
                Access Token
              </label>
              <div className="relative group">
                <Lock
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors"
                  size={18}
                />
                <input
                  required
                  type="password"
                  className="w-full pl-14 pr-6 py-4.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all font-bold text-sm"
                  placeholder="••••••••"
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-slate-200 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <ShieldCheck size={20} />
              )}
              {loading ? "Verifying..." : "Initialize Session"}
            </button>
          </form>
        </div>

        {/* PRD Role Simulation */}
        <div className="bg-slate-50 p-10 border-t border-slate-100">
          <p className="text-[9px] font-black text-slate-400 uppercase text-center mb-6 tracking-[0.3em]">
            Quick-Start Simulation Roles
          </p>
          <div className="grid grid-cols-3 gap-4">
            {demoRoles.map((role) => (
              <button
                key={role.name}
                onClick={() =>
                  handleLogin(null, {
                    email: role.email,
                    password: "password123",
                  })
                }
                className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all group active:scale-95"
              >
                <UserCircle
                  size={24}
                  className="text-slate-200 group-hover:text-blue-600 transition-colors"
                />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">
                  {role.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
