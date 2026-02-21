"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Logic: Verify if a session exists in the digital hub
    const token = localStorage.getItem("token");

    if (token) {
      // Authenticated: Route to Page 2 (Command Center)
      router.replace("/dashboard");
    } else {
      // Unauthenticated: Route to Page 1 (Login & Authentication)
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        {/* Premium Loading State for UI Polish */}
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">
          Initializing FleetFlow Hub
        </p>
      </div>
    </div>
  );
}
