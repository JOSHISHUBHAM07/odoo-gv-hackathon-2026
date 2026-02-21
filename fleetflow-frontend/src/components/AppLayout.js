"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Truck,
  Map,
  Wrench,
  LogOut,
  ChevronRight,
  BarChart3,
  ShieldCheck,
  UserCircle,
  Bell,
} from "lucide-react";

export default function AppLayout({ children, title }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState({ name: "User", role: "DISPATCHER" });

  useEffect(() => {
    setIsMounted(true);
    // Logic: Retrieve session context from the digital hub
    const storedRole = localStorage.getItem("role");
    const storedName = localStorage.getItem("userName") || "System User";

    if (!storedRole) {
      router.push("/login"); // Redirect if session is lost
    } else {
      setUser({ name: storedName, role: storedRole });
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  // Define Navigation with Role Permissions
  const navItems = [
    {
      name: "Command Center",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: [
        "ADMIN",
        "FLEET_MANAGER",
        "DISPATCHER",
        "SAFETY_OFFICER",
        "FINANCE_ANALYST",
      ],
    },
    {
      name: "Vehicle Registry",
      href: "/vehicles",
      icon: Truck,
      roles: ["ADMIN", "FLEET_MANAGER"],
    },
    {
      name: "Trip Dispatch",
      href: "/trips",
      icon: Map,
      roles: ["ADMIN", "DISPATCHER"],
    },
    {
      name: "Safety & Compliance",
      href: "/drivers",
      icon: ShieldCheck,
      roles: ["ADMIN", "SAFETY_OFFICER", "FLEET_MANAGER"],
    },
    {
      name: "Expense Logs",
      href: "/logs",
      icon: Wrench,
      roles: ["ADMIN", "FLEET_MANAGER", "FINANCE_ANALYST"],
    },
    {
      name: "Financial Reports",
      href: "/reports",
      icon: BarChart3,
      roles: ["ADMIN", "FINANCE_ANALYST"],
    },
  ];

  if (!isMounted) return null;

  // RBAC Logic: Filter visibility based on role
  const filteredNav = navItems.filter((item) => item.roles.includes(user.role));

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {/* Premium Hub Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-xl shadow-slate-200/50 z-20">
        <div className="h-24 flex items-center px-8">
          <div className="w-10 h-10 bg-blue-600 rounded-xl mr-3 shadow-lg shadow-blue-200 flex items-center justify-center">
            <Truck size={22} className="text-white" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-2xl font-black text-slate-800 tracking-tighter italic">
              FleetFlow
            </h2>
            <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">
              Digital Hub
            </span>
          </div>
        </div>

        <div className="px-6 py-6 flex-1 overflow-y-auto">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 ml-4">
            Management Modules
          </p>
          <nav className="space-y-2">
            {filteredNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all duration-300 font-bold text-sm ${
                    isActive
                      ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Icon
                      size={20}
                      className={
                        isActive
                          ? "text-blue-400"
                          : "text-slate-400 group-hover:text-blue-500"
                      }
                    />
                    {item.name}
                  </div>
                  {isActive && (
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Identity Section */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 mb-6 p-2">
            <div className="w-10 h-10 rounded-full bg-white border-2 border-blue-500 flex items-center justify-center shadow-sm">
              <UserCircle className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm font-black text-slate-800 truncate w-32">
                {user.name}
              </p>
              <p className="text-[9px] font-black text-blue-500 uppercase tracking-tighter">
                {user.role.replace("_", " ")}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 text-slate-500 bg-white border border-slate-200 py-3.5 w-full hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 rounded-2xl transition-all font-black text-xs uppercase tracking-widest shadow-sm shadow-slate-100"
          >
            <LogOut size={16} /> Terminate Session
          </button>
        </div>
      </aside>

      {/* Main Command Workspace */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 h-24 flex items-center justify-between px-12 sticky top-0 z-10">
          <div>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-1">
              System View
            </p>
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter">
              {title}
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <button className="relative p-3 text-slate-400 hover:text-blue-600 transition-colors">
              <Bell size={22} />
              <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 border-2 border-white rounded-full"></span>
            </button>
            <div className="h-10 w-[1px] bg-slate-200 mx-2"></div>
            <div className="flex items-center gap-4 bg-slate-50 pr-4 rounded-2xl border border-slate-100">
              <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-lg">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <p className="text-xs font-black text-slate-800 leading-none">
                  {user.name}
                </p>
                <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                  Active Now
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-12 custom-scrollbar">
          <div className="max-w-7xl mx-auto animate-in">{children}</div>
        </div>
      </main>
    </div>
  );
}
