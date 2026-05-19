"use client";

import { useState } from "react";
import { AlertTriangle, X, ShieldAlert } from "lucide-react";

const POINTS = [
  {
    heading: "Not affiliated with BPUT",
    body: "This tool is independently developed and has no connection to Biju Patnaik University of Technology (BPUT) or any of its affiliated colleges or examination bodies.",
  },
  {
    heading: "Results may be inaccurate",
    body: "SGPA and CGPA shown here are calculated from values you enter or that are automatically extracted from uploaded documents. OCR extraction in particular is error-prone — always review every extracted value before calculating.",
  },
  {
    heading: "Not an official document",
    body: "The output of this tool carries no legal or academic validity. It cannot be submitted to any institution, employer, or authority as proof of your academic performance.",
  },
  {
    heading: "Verify with your official results",
    body: "Always cross-check your results against the official marksheet issued by BPUT or your college. In case of any discrepancy, the official document takes precedence.",
  },
  {
    heading: "No data is stored",
    body: "All calculations happen entirely in your browser. No files, grades, or personal information are sent to any server.",
  },
];

export function DisclaimerModal() {
  const [open, setOpen] = useState(true);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0d1a36] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#1e2f58] overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-[#162040] bg-orange-50 dark:bg-orange-950/20 flex-shrink-0">
          <div className="grid place-items-center w-9 h-9 rounded-[10px] bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex-shrink-0 border border-orange-200 dark:border-orange-800/40">
            <ShieldAlert size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-[15px] text-slate-900 dark:text-slate-100">
              Disclaimer
            </h2>
            <p className="text-[11.5px] text-orange-600 dark:text-orange-400 font-medium">
              Please read before continuing
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="grid place-items-center w-8 h-8 rounded-[8px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#0f2040] transition-colors duration-150 flex-shrink-0"
            aria-label="Close disclaimer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-5 py-4 flex-1">
          <div className="grid gap-4">
            {POINTS.map(({ heading, body }) => (
              <div key={heading} className="flex gap-3 items-start">
                <AlertTriangle size={14} className="text-orange-500 dark:text-orange-400 flex-shrink-0 mt-[3px]" />
                <div>
                  <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 mb-0.5">
                    {heading}
                  </p>
                  <p className="text-[12.5px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[#162040] bg-slate-50 dark:bg-[#0a1628] flex-shrink-0">
          <button
            onClick={() => setOpen(false)}
            className="w-full py-2.5 rounded-[10px] bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white text-[13.5px] font-semibold transition-colors duration-150"
          >
            I understand, continue
          </button>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center mt-2.5 leading-snug">
            This disclaimer is shown on every visit. Use this tool at your own discretion.
          </p>
        </div>
      </div>
    </div>
  );
}
