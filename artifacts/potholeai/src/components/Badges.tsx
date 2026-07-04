import { AlertCircle, Clock, ShieldCheck, CheckCircle2 } from "lucide-react";

export function SeverityBadge({ severity, className = "" }: { severity: string, className?: string }) {
  const styles = {
    critical: "bg-red-100 text-red-800 border-red-200",
    high: "bg-orange-100 text-orange-800 border-orange-200",
    medium: "bg-amber-100 text-amber-800 border-amber-200",
    low: "bg-emerald-100 text-emerald-800 border-emerald-200"
  };
  
  const labels = {
    critical: "Critical",
    high: "High",
    medium: "Medium",
    low: "Low"
  };
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${styles[severity as keyof typeof styles] || styles.low} ${className}`}>
      <AlertCircle size={14} className="opacity-70" />
      {labels[severity as keyof typeof labels] || "Unknown"}
    </span>
  );
}

export function StatusBadge({ status, className = "" }: { status: string, className?: string }) {
  const styles = {
    pending: "bg-slate-100 text-slate-700 border-slate-200",
    reviewed: "bg-blue-100 text-blue-700 border-blue-200",
    resolved: "bg-emerald-100 text-emerald-700 border-emerald-200"
  };
  
  const icons = {
    pending: <Clock size={14} className="opacity-70" />,
    reviewed: <ShieldCheck size={14} className="opacity-70" />,
    resolved: <CheckCircle2 size={14} className="opacity-70" />
  };
  
  const labels = {
    pending: "Pending",
    reviewed: "Reviewed",
    resolved: "Resolved"
  };
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${styles[status as keyof typeof styles] || styles.pending} ${className}`}>
      {icons[status as keyof typeof icons]}
      {labels[status as keyof typeof labels] || "Unknown"}
    </span>
  );
}
