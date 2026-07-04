import { useState, useRef } from "react";
import { UploadCloud, MapPin, AlignLeft, AlertTriangle, ShieldCheck, CheckCircle2, X } from "lucide-react";
import { useCreateReport } from "@workspace/api-client-react";
import { SeverityBadge } from "@/components/Badges";

export default function CitizenPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const createReport = useCreateReport();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) processFile(file);
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!preview) return;
    createReport.mutate({ data: { imageData: preview, description, location } });
  };

  const resetForm = () => {
    setPreview(null);
    setDescription("");
    setLocation("");
    createReport.reset();
  };

  if (createReport.isSuccess && createReport.data) {
    const report = createReport.data;
    return (
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-500 mt-4 md:mt-8">
        <div className="p-8 text-center bg-emerald-50 border-b border-emerald-100">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 ring-4 ring-white shadow-sm">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Report Submitted</h2>
          <p className="text-slate-600 font-medium">The AI has analyzed your report and routed it to the municipal operations team.</p>
        </div>
        <div className="p-6 md:p-8">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4">AI Analysis Result</h3>
          <div className="flex flex-col sm:flex-row gap-6 mb-8 bg-slate-50 p-5 rounded-xl border border-slate-100">
            <div className="w-full sm:w-32 h-40 sm:h-32 rounded-lg overflow-hidden shrink-0 border border-slate-200 bg-white shadow-sm">
              <img src={report.imageData} alt="Pothole" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <div className="text-xs font-black text-slate-400 uppercase mb-2">Severity Assessment</div>
                <SeverityBadge severity={report.severity} className="text-sm px-3 py-1" />
              </div>
              <div>
                <div className="text-xs font-black text-slate-400 uppercase mb-2 flex justify-between items-center">
                  <span>Verdict</span>
                  <span className="text-slate-500 font-medium bg-white px-2 py-0.5 rounded border border-slate-200">{(report.aiConfidence * 100).toFixed(0)}% confidence</span>
                </div>
                <p className="text-slate-900 font-medium text-sm leading-relaxed">{report.aiSummary}</p>
              </div>
            </div>
          </div>
          <button 
            onClick={resetForm} 
            className="w-full py-4 bg-slate-900 text-white rounded-xl font-black tracking-wide hover:bg-slate-800 transition-all shadow-md active:scale-[0.98]"
          >
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-4 md:mt-8 animate-in fade-in duration-500">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-3">Report a Hazard</h1>
        <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-md mx-auto">Take a clear photo of the pothole. Our AI will instantly assess the severity and alert city crews.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-6 md:p-8 space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-black text-slate-900 block uppercase tracking-wider">Photo Evidence <span className="text-red-500">*</span></label>
            
            {!preview ? (
              <div 
                className={`border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer ${
                  isDragging ? 'border-orange-500 bg-orange-50 scale-[1.02]' : 'border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100'
                }`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-200 text-slate-400">
                  <UploadCloud size={28} />
                </div>
                <p className="text-slate-900 font-bold mb-1">Drag and drop your photo</p>
                <p className="text-slate-500 text-sm font-medium">or click to browse from your device</p>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 aspect-video group shadow-inner">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                  <button 
                    type="button"
                    onClick={() => setPreview(null)}
                    className="bg-white text-slate-900 px-5 py-2.5 rounded-lg font-black shadow-lg flex items-center gap-2 hover:scale-105 transition-transform"
                  >
                    <X size={18} strokeWidth={3} /> Remove Photo
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase tracking-wider">
              <MapPin size={16} className="text-slate-400" /> Location <span className="text-slate-400 font-medium normal-case tracking-normal">(Optional)</span>
            </label>
            <input 
              type="text" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. 123 Main St, near the crosswalk"
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent focus:bg-white transition-colors placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase tracking-wider">
              <AlignLeft size={16} className="text-slate-400" /> Description <span className="text-slate-400 font-medium normal-case tracking-normal">(Optional)</span>
            </label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add any extra details about the hazard..."
              rows={3}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent focus:bg-white transition-colors resize-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="p-6 md:p-8 bg-slate-50 border-t border-slate-100">
          <button 
            type="submit"
            disabled={!preview || createReport.isPending}
            className="w-full py-4 bg-orange-500 text-white rounded-xl font-black text-lg tracking-wide hover:bg-orange-600 transition-all shadow-lg hover:shadow-orange-500/25 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 flex justify-center items-center gap-2"
          >
            {createReport.isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Analyzing with AI...
              </span>
            ) : (
              "Submit Report"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}