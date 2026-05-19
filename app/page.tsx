import Link from "next/link";
import { Calculator, BarChart2, ArrowRight, ShieldCheck, Zap, FileDown } from "lucide-react";
import { DisclaimerModal } from "@/components/DisclaimerModal";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <DisclaimerModal />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 pb-20">

        {/* Hero — centred text block */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/50 rounded-full px-3 py-1 text-[11.5px] font-semibold mb-5 transition-colors duration-200">
            <ShieldCheck size={11} strokeWidth={2.5} /> All processing happens locally in your browser
          </div>
          <h1 className="text-[32px] sm:text-[44px] lg:text-[52px] font-black tracking-tight text-slate-900 dark:text-slate-100 mb-4 leading-[1.1] transition-colors duration-200">
            Calculate your<br />
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 dark:from-indigo-400 dark:via-violet-400 dark:to-purple-400 bg-clip-text text-transparent">
              BPUT Grade Results
            </span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-[15px] leading-relaxed max-w-lg mx-auto transition-colors duration-200">
            Upload semester PDFs or enter SGPA &amp; credits manually. Compute CGPA &amp; SGPA in seconds — private, instant, free.
          </p>
        </div>

        {/* Calculator cards — fill the full width */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 mb-6">

          {/* CGPA card */}
          <Link
            href="/cgpa"
            className="group relative rounded-2xl p-6 sm:p-8 border-[1.5px] border-slate-200 dark:border-[#162040] bg-white dark:bg-[#0d1a36] shadow-sm hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-[0_8px_32px_rgba(79,70,229,0.14)] transition-all duration-200 flex flex-col gap-5 overflow-hidden"
          >
            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-indigo-500 to-violet-500 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/20 dark:to-violet-950/20 transition-colors duration-200 pointer-events-none" />

            <div className="relative flex items-start gap-4">
              <div className="grid place-items-center w-12 h-12 rounded-[12px] bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40 flex-shrink-0 transition-all duration-200 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-transparent group-hover:shadow-[0_4px_14px_rgba(79,70,229,0.32)]">
                <BarChart2 size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-slate-100 mb-1 transition-colors duration-200">
                  CGPA Calculator
                </div>
                <div className="text-[13px] text-slate-500 dark:text-slate-400 leading-snug transition-colors duration-200">
                  Combine semester SGPAs and credits to compute your overall CGPA and percentage.
                </div>
              </div>
            </div>

            <ul className="text-[13px] text-slate-500 dark:text-slate-400 grid gap-2 pl-0.5 transition-colors duration-200">
              {[
                "Upload semester result PDFs or enter manually",
                "Supports B.Tech & Lateral Entry B.Tech",
                "Download a PDF report of your result",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 dark:bg-indigo-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-1.5 text-[13px] font-semibold text-indigo-600 dark:text-indigo-400 mt-auto transition-colors duration-200">
              Open CGPA Calculator
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-200" />
            </div>
          </Link>

          {/* SGPA card */}
          <Link
            href="/sgpa"
            className="group relative rounded-2xl p-6 sm:p-8 border-[1.5px] border-slate-200 dark:border-[#162040] bg-white dark:bg-[#0d1a36] shadow-sm hover:border-violet-400 dark:hover:border-violet-600 hover:shadow-[0_8px_32px_rgba(124,58,237,0.14)] transition-all duration-200 flex flex-col gap-5 overflow-hidden"
          >
            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-violet-500 to-purple-500 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 transition-colors duration-200 pointer-events-none" />

            <div className="relative flex items-start gap-4">
              <div className="grid place-items-center w-12 h-12 rounded-[12px] bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800/40 flex-shrink-0 transition-all duration-200 group-hover:bg-violet-600 group-hover:text-white group-hover:border-transparent group-hover:shadow-[0_4px_14px_rgba(124,58,237,0.32)]">
                <Calculator size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-slate-100 mb-1 transition-colors duration-200">
                  SGPA Calculator
                </div>
                <div className="text-[13px] text-slate-500 dark:text-slate-400 leading-snug transition-colors duration-200">
                  Compute SGPA from subject-level grades, including backlog results.
                </div>
              </div>
            </div>

            <ul className="text-[13px] text-slate-500 dark:text-slate-400 grid gap-2 pl-0.5 transition-colors duration-200">
              {[
                "Upload original + backlog marksheets together",
                "Auto-detects duplicates, uses highest grade",
                "Edit grades and credits manually if needed",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 dark:bg-violet-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-1.5 text-[13px] font-semibold text-violet-600 dark:text-violet-400 mt-auto transition-colors duration-200">
              Open SGPA Calculator
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-200" />
            </div>
          </Link>
        </div>

        {/* Feature pills */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: <Zap size={14} />, label: "Instant results" },
            { icon: <ShieldCheck size={14} />, label: "100% private" },
            { icon: <FileDown size={14} />, label: "PDF download" },
          ].map(({ icon, label }) => (
            <div
              key={label}
              className="flex items-center justify-center gap-2 bg-white dark:bg-[#0d1a36] border border-slate-200 dark:border-[#162040] rounded-xl py-3 px-3 transition-colors duration-200"
            >
              <span className="text-indigo-500 dark:text-indigo-400 flex-shrink-0">{icon}</span>
              <span className="text-[12px] sm:text-[12.5px] font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">{label}</span>
            </div>
          ))}
        </div>

        <p className="text-slate-400 dark:text-[#2e3f65] text-[11px] text-center mt-8 leading-relaxed transition-colors duration-200">
          Provisional self-calculated tool · Not an official BPUT document · All data stays in your browser
        </p>
      </main>
    </div>
  );
}
