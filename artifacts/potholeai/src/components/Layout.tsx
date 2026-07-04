import { Link, useLocation } from "wouter";
import { HardHat, LayoutDashboard, Camera } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-[100dvh] bg-slate-100 flex flex-col font-sans selection:bg-orange-500/30 selection:text-orange-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center text-white shadow-inner shadow-orange-600/50">
              <HardHat size={20} strokeWidth={2.5} />
            </div>
            <span className="text-slate-900 font-black text-xl tracking-tight uppercase">Pothole<span className="text-orange-500">AI</span></span>
          </div>
          
          <nav className="flex gap-1.5 bg-slate-100 p-1.5 rounded-lg border border-slate-200">
            <Link
              href="/"
              className={`px-3 py-1.5 text-sm font-bold rounded-md transition-all flex items-center gap-2 ${
                location === "/" ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/50" : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <Camera size={16} />
              <span className="hidden sm:inline">Citizen Report</span>
            </Link>
            <Link
              href="/dashboard"
              className={`px-3 py-1.5 text-sm font-bold rounded-md transition-all flex items-center gap-2 ${
                location === "/dashboard" ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/50" : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <LayoutDashboard size={16} />
              <span className="hidden sm:inline">Officer Ops</span>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 md:py-10">
        {children}
      </main>
    </div>
  );
}