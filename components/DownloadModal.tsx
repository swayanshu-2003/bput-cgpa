import { useState } from "react";
import { Download, X, User, Hash } from "lucide-react";

interface DownloadModalProps {
  onConfirm: (name: string, regdNo: string) => void;
  onCancel: () => void;
}

export function DownloadModal({ onConfirm, onCancel }: DownloadModalProps) {
  const [name, setName] = useState("");
  const [regdNo, setRegdNo] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onConfirm(name.trim(), regdNo.trim());
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      {/* Sheet on mobile, centered card on sm+ */}
      <div className="bg-white dark:bg-[#0d1a36] border border-slate-200 dark:border-[#1e2f58] rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl transition-colors duration-200">

        {/* Drag handle (mobile only) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-[#1e2f58]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 pt-4 sm:pt-6 pb-4 border-b border-slate-100 dark:border-[#162040]">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Download PDF Report
            </h2>
            <p className="text-[12.5px] sm:text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
              Your details will appear on the report.
            </p>
          </div>
          <button
            onClick={onCancel}
            className="grid place-items-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#162040] transition-colors duration-200"
          >
            <X size={17} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 sm:px-6 py-5 grid gap-4">
          <div>
            <label className="block text-[11px] sm:text-[11.5px] font-bold uppercase tracking-[0.04em] text-slate-400 dark:text-slate-500 mb-1.5">
              Full Name <span className="text-indigo-500">*</span>
            </label>
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
              <input
                type="text"
                autoFocus
                required
                placeholder="e.g. Ravi Kumar Patel"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input pl-9"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] sm:text-[11.5px] font-bold uppercase tracking-[0.04em] text-slate-400 dark:text-slate-500 mb-1.5">
              Registration Number
              <span className="ml-1.5 text-[10px] font-normal normal-case tracking-normal text-slate-400">(optional)</span>
            </label>
            <div className="relative">
              <Hash size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. 2201234567"
                value={regdNo}
                onChange={(e) => setRegdNo(e.target.value)}
                className="form-input pl-9"
              />
            </div>
          </div>

          <div className="flex gap-2.5 pt-1 pb-safe">
            <button type="button" className="btn-ghost flex-1" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={!name.trim()}>
              <Download size={15} /> Download PDF
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
