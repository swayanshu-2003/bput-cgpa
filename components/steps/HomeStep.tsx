import {
  GraduationCap, ArrowUpRight, FileText, Keyboard,
  CheckCircle2, Info, ShieldCheck,
} from "lucide-react";
import { Mode, Program } from "@/types";
import { Eyebrow } from "@/components/ui/Eyebrow";

interface HomeStepProps {
  program: Program | null;
  mode: Mode | null;
  onSetProgram: (p: Program) => void;
  onSetMode: (m: Mode) => void;
  onStart: () => void;
}

const INSTRUCTIONS = [
  <>Select your program — <strong className="font-semibold text-slate-800 dark:text-slate-200">B.Tech</strong> (Sem 1–8) or <strong className="font-semibold text-slate-800 dark:text-slate-200">Lateral Entry</strong> (Sem 3–8).</>,
  <>Choose to <strong className="font-semibold text-slate-800 dark:text-slate-200">upload</strong> each semester&apos;s result (PDF or image) or <strong className="font-semibold text-slate-800 dark:text-slate-200">enter</strong> SGPA &amp; credits manually.</>,
  <>For uploads, always <strong className="font-semibold text-slate-800 dark:text-slate-200">verify</strong> the auto-extracted values before calculating.</>,
  <>Click <strong className="font-semibold text-slate-800 dark:text-slate-200">Calculate</strong>, then <strong className="font-semibold text-slate-800 dark:text-slate-200">download a PDF report</strong> of your result.</>,
];

const PROGRAMS: { key: Program; label: string; desc: string; Icon: React.ElementType }[] = [
  { key: "normal", label: "B.Tech", desc: "8 semesters · Sem 1 to 8", Icon: GraduationCap },
  { key: "lateral", label: "B.Tech Lateral Entry", desc: "6 semesters · Sem 3 to 8", Icon: ArrowUpRight },
];

const MODES: { key: Mode; label: string; desc: string; Icon: React.ElementType; badge?: string }[] = [
  { key: "upload", label: "Upload documents", desc: "PDF or image — values extracted automatically.", Icon: FileText, badge: "Beta" },
  { key: "manual", label: "Enter manually", desc: "Type SGPA and credits for each semester.", Icon: Keyboard },
];

function SelectionCard<T extends string>({
  options, selected, onSelect,
}: {
  options: { key: T; label: string; desc: string; Icon: React.ElementType; badge?: string }[];
  selected: T | null;
  onSelect: (k: T) => void;
}) {
  return (
    <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-3">
      {options.map(({ key, label, desc, Icon, badge }) => (
        <button
          key={key}
          onClick={() => onSelect(key)}
          className={`relative rounded-[13px] p-4 sm:p-[18px_20px] cursor-pointer text-left flex gap-3 sm:gap-3.5 items-start transition-all duration-200 border-[1.5px] ${selected === key
            ? "border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 shadow-[0_0_0_3px_rgba(79,70,229,0.14)]"
            : "border-slate-300 dark:border-[#1e2f58] bg-white dark:bg-[#0d1a36] hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-[0_0_0_3px_rgba(79,70,229,0.08)]"
            }`}
        >
          <span className={`grid place-items-center w-9 h-9 sm:w-10 sm:h-10 rounded-[10px] border flex-shrink-0 transition-all duration-200 ${selected === key
            ? "bg-indigo-600 dark:bg-indigo-500 text-white border-transparent"
            : "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/40"
            }`}>
            <Icon size={18} />
          </span>
          <span className="flex-1 min-w-0">
            <span className="flex items-center gap-1.5 font-bold text-sm text-slate-900 dark:text-slate-100 mb-0.5 transition-colors duration-200">
              {label}
              {badge && (
                <span className="inline-block text-[9.5px] font-bold uppercase tracking-wide px-1.5 py-[2px] rounded-md bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-300 dark:border-orange-700/50 leading-none">
                  {badge}
                </span>
              )}
            </span>
            <span className="block text-slate-500 dark:text-slate-400 text-[12px] sm:text-[12.5px] leading-snug transition-colors duration-200">
              {desc}
            </span>
          </span>
          <span className={`absolute top-3 right-3 text-indigo-500 dark:text-indigo-400 transition-all duration-200 ${selected === key ? "opacity-100" : "opacity-0"}`}>
            <CheckCircle2 size={17} />
          </span>
        </button>
      ))}
    </div>
  );
}

export function HomeStep({ program, mode, onSetProgram, onSetMode, onStart }: HomeStepProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] lg:grid-cols-[1fr_300px] gap-4 sm:gap-[18px] items-start">

      {/* Right: Instructions — first in DOM = top on mobile */}
      <aside className="order-first md:order-last md:sticky md:top-6">
        <div className="bg-indigo-50 dark:bg-indigo-950/20 border-[1.5px] border-indigo-200 dark:border-indigo-800/30 rounded-2xl p-4 sm:p-5 mb-3 transition-colors duration-200">
          <div className="flex items-center gap-2 font-bold text-[13px] sm:text-[13.5px] text-indigo-600 dark:text-indigo-400 mb-3 sm:mb-3.5 transition-colors duration-200">
            <Info size={14} /> How it works
          </div>
          <ol className="grid gap-2.5 sm:gap-3">
            {INSTRUCTIONS.map((item, i) => (
              <li key={i} className="grid grid-cols-[22px_1fr] sm:grid-cols-[24px_1fr] gap-2.5 sm:gap-3 text-[13px] sm:text-[13.5px] text-slate-600 dark:text-slate-300 items-start transition-colors duration-200">
                <span className="grid place-items-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white text-[10px] sm:text-[11px] font-bold flex-shrink-0 mt-[2px] transition-colors duration-200">
                  {i + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed px-3.5 py-3 bg-slate-50 dark:bg-[#0f2040] border border-slate-200 dark:border-[#162040] rounded-[10px] transition-colors duration-200">
          <ShieldCheck size={14} className="flex-shrink-0 mt-[1px] text-emerald-500 dark:text-emerald-400" />
          All processing happens in your browser. Your files never leave your device.
        </div>
      </aside>

      {/* Left: Selection cards */}
      <div className="order-last md:order-first flex flex-col">

        {/* Step 1 — Program */}
        <div className="card">
          <Eyebrow>Step 1 of 2</Eyebrow>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1 transition-colors duration-200">
            Choose your program
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-[13px] sm:text-[13.5px] mt-1.5 mb-4 sm:mb-5 leading-snug transition-colors duration-200">
            This sets how many semesters and their numbering.
          </p>
          <SelectionCard options={PROGRAMS} selected={program} onSelect={onSetProgram} />
        </div>

        {/* Step 2 — Mode */}
        <div className="card">
          <Eyebrow>Step 2 of 2</Eyebrow>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3 sm:mb-4 transition-colors duration-200">
            How will you provide results?
          </h2>
          <SelectionCard options={MODES} selected={mode} onSelect={onSetMode} />
          <div className="flex gap-2.5 mt-5 sm:mt-6 items-center">
            <div className="flex-1" />
            <button className="btn-primary w-full min-[480px]:w-auto" disabled={!mode || !program} onClick={onStart}>
              Continue <ArrowUpRight size={16} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
