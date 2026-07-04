import { useState } from "react";
import { useListReports, useGetStats } from "@workspace/api-client-react";
import { format } from "date-fns";
import { MapPin, Calendar, LayoutDashboard, HardHat, AlertTriangle, ArrowRight, Activity, Filter, CheckCircle2 } from "lucide-react";
import { SeverityBadge, StatusBadge } from "@/components/Badges";
import { ReportDetailModal } from "@/components/ReportDetailModal";

export default function DashboardPage() {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  
  const [selectedReport, setSelectedReport] = useState<any>(null);

  const { data: stats, isLoading: statsLoading } = useGetStats();
  
  const params: any = {};
  if (filterStatus !== "all") params.status = filterStatus;
  if (filterSeverity !== "all") params.severity = filterSeverity;
  
  const { data: reports, isLoading: reportsLoading } = useListReports(params);

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Ops Dashboard</h1>
          <p className="text-slate-500 mt-1 font-medium flex items-center gap-2">
            <Activity size={16} className="text-emerald-500" /> System operating normally
          </p>
        </div>
      </div>

      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-200/50 rounded-2xl animate-pulse" />)}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center gap-3 text-slate-500 mb-3">
              <MapPin size={20} className="text-slate-400" />
              <span className="text-xs font-black uppercase tracking-wider">Total Reports</span>
            </div>
            <div className="text-4xl font-black text-slate-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden transition-shadow hover:shadow-md">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
            <div className="flex items-center gap-3 text-slate-500 mb-3">
              <AlertTriangle size={20} className="text-blue-500" />
              <span className="text-xs font-black uppercase tracking-wider text-blue-700">Pending Review</span>
            </div>
            <div className="text-4xl font-black text-slate-900">{stats.byStatus.pending}</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center gap-3 text-slate-500 mb-3">
              <Calendar size={20} className="text-slate-400" />
              <span className="text-xs font-black uppercase tracking-wider">New this Week</span>
            </div>
            <div className="text-4xl font-black text-slate-900">{stats.recentCount}</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center transition-shadow hover:shadow-md">
            <div className="text-xs font-black text-slate-500 mb-4 uppercase tracking-wider flex items-center gap-2">
              <Activity size={16} /> Severity Matrix
            </div>
            <div className="flex w-full h-3 rounded-full overflow-hidden bg-slate-100 shadow-inner">
              <div style={{ width: `${(stats.bySeverity.critical / (stats.total || 1)) * 100}%` }} className="bg-red-500 transition-all hover:opacity-80" title="Critical" />
              <div style={{ width: `${(stats.bySeverity.high / (stats.total || 1)) * 100}%` }} className="bg-orange-500 transition-all hover:opacity-80" title="High" />
              <div style={{ width: `${(stats.bySeverity.medium / (stats.total || 1)) * 100}%` }} className="bg-amber-500 transition-all hover:opacity-80" title="Medium" />
              <div style={{ width: `${(stats.bySeverity.low / (stats.total || 1)) * 100}%` }} className="bg-emerald-500 transition-all hover:opacity-80" title="Low" />
            </div>
            <div className="flex justify-between text-[10px] mt-3 font-black uppercase tracking-wider">
              <span className="text-red-600">{stats.bySeverity.critical} Crit</span>
              <span className="text-orange-600">{stats.bySeverity.high} High</span>
              <span className="text-amber-600">{stats.bySeverity.medium} Med</span>
              <span className="text-emerald-600">{stats.bySeverity.low} Low</span>
            </div>
          </div>
        </div>
      ) : null}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            Incoming Queue
          </h2>
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter size={14} className="text-slate-400" />
              </div>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-9 pr-8 py-2 w-full sm:w-auto bg-white border border-slate-300 text-sm font-bold text-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-shadow appearance-none"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <div className="relative w-full sm:w-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <AlertTriangle size={14} className="text-slate-400" />
              </div>
              <select 
                value={filterSeverity} 
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="pl-9 pr-8 py-2 w-full sm:w-auto bg-white border border-slate-300 text-sm font-bold text-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-shadow appearance-none"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {reportsLoading ? (
            <div className="p-12 text-center text-slate-500 font-bold uppercase tracking-wider flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
              Loading records...
            </div>
          ) : reports && reports.length > 0 ? (
            reports.map((report) => (
              <div 
                key={report.id} 
                onClick={() => setSelectedReport(report)}
                className="group flex flex-col sm:flex-row items-center gap-5 p-5 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div className="w-full sm:w-24 sm:h-24 h-48 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-200 relative">
                  <img src={report.imageData} alt="Pothole" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                  <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors" />
                </div>
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-sm font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">#{report.id}</span>
                    <SeverityBadge severity={report.severity} />
                    <StatusBadge status={report.status} />
                  </div>
                  <p className="text-slate-800 font-medium truncate mb-3 text-sm md:text-base">{report.aiSummary}</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-1.5"><MapPin size={14} className="text-slate-400" /> {report.location || "Unknown"}</span>
                    <span className="flex items-center gap-1.5"><Calendar size={14} className="text-slate-400" /> {format(new Date(report.createdAt), "MMM d, yyyy")}</span>
                  </div>
                </div>
                <div className="hidden sm:flex shrink-0 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0 duration-300">
                  <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-900 shadow-md">
                    <ArrowRight size={18} strokeWidth={2.5} />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-5 text-slate-300 ring-1 ring-slate-200">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-wide">Queue is Clear</h3>
              <p className="text-slate-500 font-medium">No reports match your current filters.</p>
            </div>
          )}
        </div>
      </div>

      <ReportDetailModal 
        report={selectedReport} 
        open={!!selectedReport} 
        onOpenChange={(open: boolean) => !open && setSelectedReport(null)} 
      />
    </div>
  );
}