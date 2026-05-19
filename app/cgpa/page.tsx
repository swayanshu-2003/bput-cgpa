"use client";

import { useEffect, useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { computeCgpa, SemesterInput } from "@/lib/calc";
import { extractFromFile } from "@/lib/extract";
import { downloadReport } from "@/lib/report";
import { PROGRAM, emptyRow } from "@/lib/constants";
import { isValid, isFilled } from "@/lib/utils";
import { Mode, Program, Step, SemRow } from "@/types";
import { HomeStep } from "@/components/steps/HomeStep";
import { EntryStep } from "@/components/steps/EntryStep";
import { ResultStep } from "@/components/steps/ResultStep";
import { saveEntry, consumePendingEdit, newHistoryId } from "@/lib/history";

export default function CgpaPage() {
  const [step, setStep] = useState<Step>("home");
  const [program, setProgram] = useState<Program | null>(null);
  const [mode, setMode] = useState<Mode | null>(null);
  const [rows, setRows] = useState<SemRow[]>([]);
  const [downloading, setDownloading] = useState(false);

  const startSem = program ? PROGRAM[program].start : 1;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [step]);

  // Load pending edit from history page
  useEffect(() => {
    const pending = consumePendingEdit();
    if (pending?.type === "cgpa" && pending.cgpa) {
      const { program: prog, startSem: sStart, semesters } = pending.cgpa;
      setProgram(prog);
      setMode("manual");
      const count = PROGRAM[prog].count;
      const newRows: SemRow[] = Array.from({ length: count }, (_, i) => {
        const sem = semesters[i];
        if (sem && Number.isFinite(sem.sgpa) && Number.isFinite(sem.credits) && sem.credits > 0) {
          return { sgpa: String(sem.sgpa), credits: String(sem.credits) };
        }
        return emptyRow();
      });
      setRows(newRows);
      setStep("entry");
    }
  }, []);

  function start() {
    if (!mode || !program) return;
    setRows(Array.from({ length: PROGRAM[program].count }, emptyRow));
    setStep("entry");
  }

  function setRow(i: number, patch: Partial<SemRow>) {
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  }

  async function handleFile(i: number, file: File) {
    setRow(i, { fileName: file.name, status: "Processing…", statusKind: "info" });
    try {
      const res = await extractFromFile(file, (stage) =>
        setRow(i, { status: stage, statusKind: "info" })
      );
      const got: Partial<SemRow> = {};
      if (res.sgpa !== null) got.sgpa = String(res.sgpa);
      if (res.credits !== null) got.credits = String(res.credits);
      if (res.sgpa !== null && res.credits !== null) {
        setRow(i, {
          ...got,
          status: `Extracted via ${res.method === "pdf-text" ? "PDF text" : "OCR"} — please verify the values`,
          statusKind: "ok",
        });
      } else {
        const missing = [res.sgpa === null && "SGPA", res.credits === null && "credits"]
          .filter(Boolean).join(" and ");
        setRow(i, {
          ...got,
          status: `Could not extract ${missing} — please enter ${missing === "SGPA and credits" ? "them" : "it"} manually`,
          statusKind: "err",
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setRow(i, { status: `Extraction failed (${msg}) — enter values manually`, statusKind: "err" });
    }
  }

  const parsed: SemesterInput[] = useMemo(
    () => rows.map((r) => ({ sgpa: parseFloat(r.sgpa), credits: parseFloat(r.credits) })),
    [rows]
  );

  const firstOk   = rows.length > 0 && isValid(parsed[0]);
  const noPartial = rows.every((r, i) => !isFilled(r) || isValid(parsed[i]));
  const allValid  = firstOk && noPartial;
  const completed = parsed.filter(isValid).length;

  const completedSemesters: SemesterInput[] = useMemo(
    () => parsed.filter(isValid),
    [parsed]
  );

  const result = useMemo(
    () => (step === "result" ? computeCgpa(completedSemesters) : null),
    [step, completedSemesters]
  );

  function handleCalculate() {
    if (!program) return;
    const cgpaResult = computeCgpa(completedSemesters);
    saveEntry({
      id: newHistoryId(),
      type: "cgpa",
      timestamp: Date.now(),
      label: `CGPA ${cgpaResult.cgpa.toFixed(2)} — ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`,
      cgpa: {
        program,
        startSem,
        semesters: completedSemesters,
        result: cgpaResult,
      },
    });
    setStep("result");
  }

  async function onDownload(studentName: string, regdNo: string) {
    if (!result || !program) return;
    setDownloading(true);
    try {
      await downloadReport(
        { program: PROGRAM[program].label, startSem, studentName, regdNo: regdNo || undefined },
        completedSemesters,
        result
      );
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="w-full min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-20">

        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 mb-1 transition-colors duration-200">
          CGPA Calculator
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 mb-6 sm:mb-8 text-[13px] sm:text-sm leading-relaxed transition-colors duration-200">
          Compute your CGPA and percentage from semester results. Everything runs
          in your browser — your files never leave your device.
        </p>

        {step === "home" && (
          <HomeStep
            program={program}
            mode={mode}
            onSetProgram={setProgram}
            onSetMode={setMode}
            onStart={start}
          />
        )}

        {step === "entry" && (
          <EntryStep
            program={program!}
            mode={mode!}
            rows={rows}
            startSem={startSem}
            firstOk={firstOk}
            noPartial={noPartial}
            allValid={allValid}
            completed={completed}
            onSetRow={setRow}
            onHandleFile={handleFile}
            onBack={() => { setStep("home"); setRows([]); }}
            onCalculate={handleCalculate}
          />
        )}

        {step === "result" && result && (
          <ResultStep
            program={program!}
            result={result}
            parsed={parsed}
            startSem={startSem}
            completedCount={completedSemesters.length}
            downloading={downloading}
            onEditValues={() => setStep("entry")}
            onStartOver={() => { setStep("home"); setRows([]); setMode(null); setProgram(null); }}
            onDownload={onDownload}
          />
        )}

        <div className="text-slate-400 dark:text-[#334060] text-xs text-center mt-9 flex items-center justify-center gap-2 flex-wrap leading-relaxed transition-colors duration-200">
          <ShieldCheck size={14} />
          Provisional self-calculated tool · Not an official BPUT document · Verify extracted values
        </div>
      </div>
    </div>
  );
}
