import * as Dialog from "@radix-ui/react-dialog";
import { X, Calendar, MapPin, AlignLeft } from "lucide-react";
import { useUpdateReportStatus, getListReportsQueryKey, getGetStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { SeverityBadge, StatusBadge } from "./Badges";
import { format } from "date-fns";

export function ReportDetailModal({ report, open, onOpenChange }: any) {
  const queryClient = useQueryClient();
  const updateStatus = useUpdateReportStatus();
  
  const [status, setStatus] = useState(report?.status || "pending");
  const [notes, setNotes] = useState(report?.officerNotes || "");

  useEffect(() => {
    if (report) {
      setStatus(report.status);
      setNotes(report.officerNotes || "");
    }
  }, [report]);

  if (!report) return null;

  const handleSave = () => {
    updateStatus.mutate({ id: report.id, data: { status: status as any, officerNotes: notes } }, {
      onSuccess: () => {
        // Optimistically invalidate to trigger refetch
        queryClient.invalidateQueries({ queryKey: getListReportsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 animate-in fade-in" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl z-50 animate-in zoom-in-95 duration-200">
          <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-slate-100 p-5 flex justify-between items-center z-10">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
              Report #{report.id}
              <div className="flex gap-2 ml-2">
                <StatusBadge status={report.status} />
                <SeverityBadge severity={report.severity} />
              </div>
            </h2>
            <Dialog.Close className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors">
              <X size={20} strokeWidth={2.5} />
            </Dialog.Close>
          </div>
          
          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 aspect-video shadow-sm relative group">
                <img src={report.imageData} alt="Pothole" className="w-full h-full object-cover" />
              </div>
              
              <div className="space-y-4">
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">AI Analysis</h3>
                    <div className="text-xs font-bold text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-200">
                      Conf: {(report.aiConfidence * 100).toFixed(0)}%
                    </div>
                  </div>
                  <p className="text-sm text-slate-900 font-medium leading-relaxed">{report.aiSummary}</p>
                </div>
              </div>
            </div>

            <div className="space-y-8 flex flex-col">
              <div className="space-y-5 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex gap-3 text-sm text-slate-700">
                  <MapPin size={18} className="text-slate-400 shrink-0" />
                  <span className="font-medium">{report.location || "No location provided"}</span>
                </div>
                <div className="flex gap-3 text-sm text-slate-700">
                  <AlignLeft size={18} className="text-slate-400 shrink-0" />
                  <span className="font-medium">{report.description || "No description provided"}</span>
                </div>
                <div className="flex gap-3 text-sm text-slate-700">
                  <Calendar size={18} className="text-slate-400 shrink-0" />
                  <span className="font-medium">{format(new Date(report.createdAt), "MMM d, yyyy 'at' h:mm a")}</span>
                </div>
              </div>

              <div className="h-px w-full bg-slate-200" />

              <div className="space-y-5 flex-1">
                <h3 className="text-lg font-black text-slate-900">Officer Assessment</h3>
                
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-600 uppercase tracking-wider">Update Status</label>
                  <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-colors"
                  >
                    <option value="pending">Pending Review</option>
                    <option value="reviewed">Reviewed & Scheduled</option>
                    <option value="resolved">Resolved / Fixed</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-600 uppercase tracking-wider">Internal Notes</label>
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    placeholder="Add operational notes here..."
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-colors resize-none"
                  />
                </div>

                <button 
                  onClick={handleSave}
                  disabled={updateStatus.isPending}
                  className="w-full mt-auto py-3.5 bg-slate-900 text-white rounded-xl font-bold tracking-wide hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                >
                  {updateStatus.isPending ? "Saving..." : "Save Assessment"}
                </button>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}