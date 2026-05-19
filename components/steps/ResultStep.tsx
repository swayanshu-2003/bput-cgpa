import { useState } from "react";
import { ArrowLeft, RotateCcw, Download, Loader2, Award, GraduationCap } from "lucide-react";
import { Program } from "@/types";
import { CgpaResult, SemesterInput } from "@/lib/calc";
import { PROGRAM } from "@/lib/constants";
import { isValid } from "@/lib/utils";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { DownloadModal } from "@/components/DownloadModal";

interface ResultStepProps {
  program: Program;
  result: CgpaResult;
  parsed: SemesterInput[];
  startSem: number;
  completedCount: number;
  downloading: boolean;
  onEditValues: () => void;
  onStartOver: () => void;
  onDownload: (studentName: string, regdNo: string) => void;
}

const TD = "px-3 sm:px-4 py-2.5 text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-[#162040] transition-colors duration-200 text-[13px]";
const TD_TOTAL = "px-3 sm:px-4 py-2.5 font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/20 border-t-[1.5px] border-indigo-200 dark:border-indigo-800/30 transition-colors duration-200 text-[13px]";
const TH = "text-left px-3 sm:px-4 py-2.5 text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-[0.07em] bg-slate-50 dark:bg-[#0f2040] border-b border-slate-200 dark:border-[#162040] transition-colors duration-200 whitespace-nowrap";

function getClassification(cgpa: number) {
  if (cgpa >= 9.0) return { label: "Outstanding",    color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40" };
  if (cgpa >= 8.0) return { label: "Excellent",      color: "text-indigo-600  dark:text-indigo-400  bg-indigo-50  dark:bg-indigo-950/30  border-indigo-200  dark:border-indigo-800/40"  };
  if (cgpa >= 7.0) return { label: "First Class",    color: "text-blue-600    dark:text-blue-400    bg-blue-50    dark:bg-blue-950/30    border-blue-200    dark:border-blue-800/40"    };
  if (cgpa >= 6.0) return { label: "Second Class",   color: "text-amber-600   dark:text-amber-400   bg-amber-50   dark:bg-amber-950/30   border-amber-200   dark:border-amber-800/40"   };
  if (cgpa >= 5.0) return { label: "Pass",           color: "text-orange-600  dark:text-orange-400  bg-orange-50  dark:bg-orange-950/30  border-orange-200  dark:border-orange-800/40"  };
  return             { label: "Below Pass",          color: "text-red-600     dark:text-red-400     bg-red-50     dark:bg-red-950/30     border-red-200     dark:border-red-800/40"     };
}

export function ResultStep({
  program, result, parsed, startSem, completedCount,
  downloading, onEditValues, onStartOver, onDownload,
}: ResultStepProps) {
  const [showModal, setShowModal] = useState(false);
  const validRows = parsed.map((p, i) => ({ p, i })).filter(({ p }) => isValid(p));
  const classification = getClassification(result.cgpa);

  return (
    <div className="card">
      <Eyebrow>Result</Eyebrow>

      {/* ── Result header ─────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 transition-colors duration-200">
            Academic Summary
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-[13px] mt-0.5 leading-snug transition-colors duration-200">
            {PROGRAM[program].label} · {completedCount} completed semester{completedCount === 1 ? "" : "s"}
          </p>
        </div>
        <span className={`inline-flex items-center gap-1 border rounded-full px-2.5 py-1 text-[11px] font-bold whitespace-nowrap flex-shrink-0 transition-colors duration-200 ${classification.color}`}>
          <Award size={11} strokeWidth={2.5} />
          {classification.label}
        </span>
      </div>

      {/* ── Metric cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-5">
        {[
          { value: result.cgpa.toFixed(2),              label: "CGPA"       },
          { value: `${result.percentage.toFixed(2)}%`,  label: "Percentage" },
        ].map(({ value, label }) => (
          <div
            key={label}
            className="relative bg-slate-50 dark:bg-[#0f2040] border-[1.5px] border-slate-200 dark:border-[#162040] rounded-[13px] py-6 sm:py-8 px-4 text-center overflow-hidden transition-colors duration-200"
          >
            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-indigo-500 to-violet-500 rounded-t-[11px]" />
            <div className="text-[36px] sm:text-[46px] font-black tracking-[-0.04em] leading-none bg-gradient-to-br from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
              {value}
            </div>
            <div className="text-slate-400 dark:text-slate-500 text-[10px] mt-2 sm:mt-3 uppercase tracking-[0.1em] font-bold transition-colors duration-200">
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Action buttons ─────────────────────────────────────────────────
           All three sit in one compact row: Download | Edit | Start over   */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <button
          className="btn-primary"
          disabled={downloading}
          onClick={() => setShowModal(true)}
        >
          {downloading
            ? <Loader2 size={15} className="animate-spin" />
            : <Download size={15} />}
          Download PDF
        </button>
        <button className="btn-ghost" onClick={onEditValues}>
          <ArrowLeft size={15} /> Edit values
        </button>
        <button className="btn-ghost" onClick={onStartOver}>
          <RotateCcw size={15} /> Start over
        </button>
      </div>

      {/* ── Official-style result card ─────────────────────────────────────── */}
      <div className="rounded-[12px] border-[1.5px] border-slate-200 dark:border-[#162040] overflow-hidden mb-4 transition-colors duration-200">
        {/* Transcript header strip */}
        <div className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-indigo-600 to-violet-600">
          <GraduationCap size={16} className="text-white/90 flex-shrink-0" />
          <div>
            <div className="text-white text-[11.5px] font-bold uppercase tracking-[0.06em]">
              Biju Patnaik University of Technology
            </div>
            <div className="text-indigo-200 text-[10px] font-medium">
              Academic Performance Record · {PROGRAM[program].label}
            </div>
          </div>
        </div>

        {/* Semester breakdown table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[300px]">
            <thead>
              <tr>
                {["Semester", "SGPA", "Credits", "Weighted"].map((h) => (
                  <th key={h} className={TH}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {validRows.map(({ p, i }) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-[#0f2040] transition-colors duration-150">
                  <td className={TD}>Sem {startSem + i}</td>
                  <td className={TD}>{p.sgpa}</td>
                  <td className={TD}>{p.credits}</td>
                  <td className={TD}>{(p.sgpa * p.credits).toFixed(2)}</td>
                </tr>
              ))}
              <tr>
                <td colSpan={2} className={TD_TOTAL}>Total</td>
                <td className={TD_TOTAL}>{result.totalCredits}</td>
                <td className={TD_TOTAL}>{result.weightedSum}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Formula ───────────────────────────────────────────────────────── */}
      <div className="text-[12px] sm:text-[12.5px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#0f2040] border-[1.5px] border-slate-200 dark:border-[#162040] rounded-[10px] px-3.5 sm:px-4 py-3 leading-[1.9] font-mono transition-colors duration-200 overflow-x-auto">
        CGPA = Σ(SGPA × Credits) / Σ(Credits) = {result.weightedSum} / {result.totalCredits} ={" "}
        <strong className="text-indigo-600 dark:text-indigo-400">{result.cgpa.toFixed(2)}</strong>
        <br />
        Percentage = (CGPA − 0.5) × 10 ={" "}
        <strong className="text-indigo-600 dark:text-indigo-400">{result.percentage.toFixed(2)}%</strong>
      </div>

      {showModal && (
        <DownloadModal
          onConfirm={(name, regdNo) => { setShowModal(false); onDownload(name, regdNo); }}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
