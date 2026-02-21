import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Inter } from "next/font/google";

// Professional typography for the Digital Hub
const inter = Inter({ subsets: ["latin"], weight: ["400", "700", "900"] });

export const metadata = {
  title: "FleetFlow | Rule-Based Management Hub",
  description: "Enterprise Fleet & Logistics Command Center",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.className} bg-slate-50 text-slate-900 antialiased`}
      >
        {/* Global Notifications for Logic Validations (e.g., Overload Alerts) */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#0f172a",
              color: "#fff",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: "bold",
            },
          }}
        />

        {/* Main Content Injection */}
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
