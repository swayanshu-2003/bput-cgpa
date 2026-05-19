import {
  UploadCloud, CheckCircle2, AlertCircle, Loader2,
  ArrowLeft, Calculator,
} from "lucide-react";
import { Mode, Program, SemRow } from "@/types";
import { PROGRAM } from "@/lib/constants";
import { Eyebrow } from "@/components/ui/Eyebrow";

interface EntryStepProps {
  program: Program;
  mode: Mode;
  rows: SemRow[];
  startSem: number;
  firstOk: boolean;
  noPartial: boolean;
  allValid: boolean;
  completed: number;
  onSetRow: (i: number, patch: Partial<SemRow>) => void;
  onHandleFile: (i: number, file: File) => void;
  onBack: () => void;
  onCalculate: () => void;
}

function cardColor(statusKind: SemRow["statusKind"]) {
  if (statusKind === "info") return "bg-orange-50 dark:bg-orange-950/20 border-orange-300 dark:border-orange-800/50";
  if (statusKind === "ok")   return "bg-blue-50   dark:bg-blue-950/20   border-blue-300   dark:border-blue-800/50";
  if (statusKind === "err")  return "bg-red-50    dark:bg-red-950/20    border-red-300    dark:border-red-900/50";
  return "bg-slate-50 dark:bg-[#0f2040] border-slate-200 dark:border-[#162040]";
}

function statusColor(statusKind: SemRow["statusKind"]) {
  if (statusKind === "ok")  return "text-emerald-600 dark:text-emerald-400";
  if (statusKind === "err") return "text-red-600 dark:text-red-400";
  return "text-slate-500 dark:text-slate-400";
}

export function EntryStep({
  program, mode, rows, startSem,
  firstOk, noPartial, allValid, completed,
  onSetRow, onHandleFile, onBack, onCalculate,
}: EntryStepProps) {
  return (
    <div className="card">
      <Eyebrow>Step 3 — Enter data</Eyebrow>
      <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1 transition-colors duration-200">
        {mode === "upload" ? "Upload result for each semester" : "Enter each semester"}
      </h2>
      <p className="text-slate-500 dark:text-slate-400 text-[13px] sm:text-[13.5px] mt-1.5 mb-5 leading-snug transition-colors duration-200">
        {PROGRAM[program].label}. Semester {startSem} is required; the rest are optional.
      </p>

      {/* ── Manual mode ── */}
      {mode === "manual" && (
        <>
          {/* Column headers — hidden on very small screens */}
          <div className="hidden sm:grid grid-cols-[100px_1fr_1fr] sm:grid-cols-[110px_1fr_1fr] gap-3 items-end mb-1.5">
            {["Semester", "SGPA (0–10)", "Total credits"].map((h) => (
              <div key={h} className="text-[11px] font-bold uppercase tracking-[0.06em] text-slate-400 dark:text-slate-500 pb-2 transition-colors duration-200">
                {h}
              </div>
            ))}
          </div>
          {rows.map((r, i) => (
            <div key={i} className="mb-3">
              {/* Mobile: label on top */}
              <div className="flex items-center gap-1 mb-1.5 sm:hidden">
                <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 transition-colors duration-200">
                  Semester {startSem + i}
                </span>
                {i === 0 && <span className="text-indigo-500 dark:text-indigo-400 text-sm">*</span>}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-[110px_1fr_1fr] gap-2 sm:gap-3 items-center">
                {/* Desktop: inline label */}
                <div className="hidden sm:flex text-[13px] font-semibold pb-2.5 items-center gap-1 text-slate-700 dark:text-slate-300 transition-colors duration-200">
                  Sem {startSem + i}
                  {i === 0 && <span className="text-indigo-500 dark:text-indigo-400">*</span>}
                </div>
                <input
                  type="number" step="0.01" min="0" max="10"
                  placeholder={i === 0 ? "SGPA e.g. 9.17" : "SGPA (optional)"}
                  value={r.sgpa}
                  onChange={(e) => onSetRow(i, { sgpa: e.target.value })}
                  className="form-input"
                />
                <input
                  type="number" step="1" min="1"
                  placeholder={i === 0 ? "Credits e.g. 23" : "Credits (opt.)"}
                  value={r.credits}
                  onChange={(e) => onSetRow(i, { credits: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>
          ))}
        </>
      )}

      {/* ── Upload mode ── */}
      {mode === "upload" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
          {rows.map((r, i) => (
            <div key={i} className={`border-[1.5px] rounded-[13px] p-4 sm:p-[18px] transition-colors duration-300 ${cardColor(r.statusKind)}`}>
              <div className="flex justify-between items-center text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 sm:mb-3.5 transition-colors duration-200">
                <span>
                  Semester {startSem + i}
                  {i === 0 && <span className="text-indigo-500 dark:text-indigo-400 ml-1">*</span>}
                </span>
              </div>
              <label className="flex items-center gap-3 border-[1.5px] border-dashed border-slate-300 dark:border-[#1e2f58] rounded-[10px] p-3.5 sm:p-4 bg-white dark:bg-[#0d1a36] cursor-pointer transition-all duration-200 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/10 hover:shadow-[0_0_0_3px_rgba(79,70,229,0.10)]">
                <UploadCloud size={20} className="text-indigo-500 dark:text-indigo-400 flex-shrink-0 transition-colors duration-200" />
                <span className="min-w-0">
                  <span className="block text-[13px] sm:text-[13.5px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5 truncate transition-colors duration-200">
                    {r.fileName ?? "Click to upload result"}
                  </span>
                  <span className="block text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 transition-colors duration-200">
                    PDF or image · digital PDF preferred
                  </span>
                </span>
                <input
                  type="file" accept="application/pdf,image/*" className="hidden"
                  onChange={(e) => e.target.files?.[0] && onHandleFile(i, e.target.files[0])}
                />
              </label>
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-3">
                <input type="number" step="0.01" placeholder="SGPA" value={r.sgpa}
                  onChange={(e) => onSetRow(i, { sgpa: e.target.value })} className="form-input" />
                <input type="number" step="1" placeholder="Credits" value={r.credits}
                  onChange={(e) => onSetRow(i, { credits: e.target.value })} className="form-input" />
              </div>
              {r.status && (
                <div className={`text-[12px] sm:text-[12.5px] mt-3 flex items-center gap-1.5 transition-colors duration-200 ${statusColor(r.statusKind)}`}>
                  {r.statusKind === "info" && <Loader2 size={13} className="animate-spin flex-shrink-0" />}
                  {r.statusKind === "ok"   && <CheckCircle2 size={13} className="flex-shrink-0" />}
                  {r.statusKind === "err"  && <AlertCircle size={13} className="flex-shrink-0" />}
                  <span>{r.status}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Validation banner */}
      <div className={`flex items-start gap-2.5 text-[12.5px] sm:text-[13px] px-3.5 sm:px-4 py-3 rounded-[10px] mt-4 sm:mt-[18px] font-medium leading-snug border-[1.5px] transition-colors duration-200 ${
        !firstOk || !noPartial
          ? "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/40"
          : "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40"
      }`}>
        {!firstOk ? (
          <><AlertCircle size={15} className="flex-shrink-0 mt-[2px]" />
          <span>Semester {startSem} is required — enter a valid SGPA (0–10) and credits (&gt;0).</span></>
        ) : !noPartial ? (
          <><AlertCircle size={15} className="flex-shrink-0 mt-[2px]" />
          <span>Some semesters have only one value filled — complete or clear both fields.</span></>
        ) : (
          <><CheckCircle2 size={15} className="flex-shrink-0 mt-[2px]" />
          <span>Ready — CGPA will be calculated from {completed} completed semester{completed === 1 ? "" : "s"}.</span></>
        )}
      </div>

      <div className="flex gap-2.5 mt-5 sm:mt-6 flex-wrap items-center">
        <button className="btn-ghost" onClick={onBack}>
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex-1" />
        <button className="btn-primary" disabled={!allValid} onClick={onCalculate}>
          <Calculator size={16} /> Calculate
        </button>
      </div>
    </div>
  );
}
