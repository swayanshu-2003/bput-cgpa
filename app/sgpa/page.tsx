"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, ArrowRight, Calculator, CheckCircle2,
  AlertCircle, Loader2, UploadCloud, RotateCcw,
  ShieldCheck, Info, AlertTriangle, X,
} from "lucide-react";
import { SubjectTable } from "@/components/sgpa/SubjectTable";
import { SubjectEntry, mergeSubjects, computeSgpa, gradePoint } from "@/lib/sgpa-calc";
import { extractSubjectsFromFile } from "@/lib/sgpa-extract";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { saveEntry, consumePendingEdit, newHistoryId } from "@/lib/history";

type SgpaStep = "upload" | "review" | "result";

interface UploadedFile {
  id: string;
  file: File;
  status: string;
  statusKind: "idle" | "info" | "ok" | "err";
  subjectCount: number;
  rawText?: string;
}

function fileId() {
  return `f-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function subjId() {
  return `s-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function SgpaPage() {
  const [step, setStep] = useState<SgpaStep>("upload");

  // Upload step state
  const [uploads, setUploads] = useState<UploadedFile[]>([]);
  const [rawSubjects, setRawSubjects] = useState<SubjectEntry[]>([]);

  // Review step state — user-editable merged list
  const [subjects, setSubjects] = useState<SubjectEntry[]>([]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [step]);

  // Load pending edit from history page
  useEffect(() => {
    const pending = consumePendingEdit();
    if (pending?.type === "sgpa" && pending.sgpa) {
      setSubjects(pending.sgpa.subjects);
      setStep("review");
    }
  }, []);

  function patchUpload(id: string, patch: Partial<UploadedFile>) {
    setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  }

  const processFile = useCallback(
    async (entry: UploadedFile) => {
      patchUpload(entry.id, { status: "Processing…", statusKind: "info" });
      try {
        const result = await extractSubjectsFromFile(entry.file, (stage) =>
          patchUpload(entry.id, { status: stage, statusKind: "info" })
        );

        const newSubjects: SubjectEntry[] = result.subjects.map((s) => ({
          ...s,
          id: subjId(),
          isBacklog: false,
        }));

        setRawSubjects((prev) => [...prev, ...newSubjects]);

        if (newSubjects.length > 0) {
          patchUpload(entry.id, {
            status: `${newSubjects.length} subject${newSubjects.length === 1 ? "" : "s"} extracted via ${result.method === "pdf-text" ? "PDF text" : "OCR"} — verify before calculating`,
            statusKind: "ok",
            subjectCount: newSubjects.length,
            rawText: result.rawText,
          });
        } else {
          patchUpload(entry.id, {
            status: "No subjects found — you can add them manually in the next step",
            statusKind: "err",
            subjectCount: 0,
            rawText: result.rawText,
          });
        }
      } catch {
        patchUpload(entry.id, {
          status: "Failed to read file — add subjects manually in the next step",
          statusKind: "err",
        });
      }
    },
    []
  );

  function handleDrop(files: FileList | null) {
    if (!files) return;
    const newEntries: UploadedFile[] = [];
    for (const file of Array.from(files)) {
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      const isImg = file.type.startsWith("image/");
      if (!isPdf && !isImg) continue;
      const entry: UploadedFile = {
        id: fileId(),
        file,
        status: "Waiting…",
        statusKind: "idle",
        subjectCount: 0,
      };
      newEntries.push(entry);
    }
    setUploads((prev) => [...prev, ...newEntries]);
    for (const entry of newEntries) {
      processFile(entry);
    }
  }

  function removeUpload(id: string) {
    const upload = uploads.find((u) => u.id === id);
    setUploads((prev) => prev.filter((u) => u.id !== id));
    if (upload) {
      setRawSubjects((prev) =>
        prev.filter((s) => s.source !== upload.file.name)
      );
    }
  }

  function goToReview() {
    const merged = mergeSubjects(rawSubjects);
    setSubjects(merged);
    setStep("review");
  }

  const result = useMemo(
    () => (step === "result" ? computeSgpa(subjects) : null),
    [step, subjects]
  );

  const duplicateCount = useMemo(() => {
    const codes = rawSubjects.map((s) => s.code.toUpperCase().trim());
    const unique = new Set(codes);
    return codes.length - unique.size;
  }, [rawSubjects]);

  const hasSubjects = subjects.length > 0;

  function handleCalculateSgpa() {
    const sgpaResult = computeSgpa(subjects);
    saveEntry({
      id: newHistoryId(),
      type: "sgpa",
      timestamp: Date.now(),
      label: `SGPA ${sgpaResult.sgpa.toFixed(2)} — ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`,
      sgpa: { subjects, result: sgpaResult },
    });
    setStep("result");
  }

  function startOver() {
    setStep("upload");
    setUploads([]);
    setRawSubjects([]);
    setSubjects([]);
  }

  return (
    <div className="w-full min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-20">

        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 mb-1 transition-colors duration-200">
          SGPA Calculator
        </h1>

        <p className="text-slate-500 dark:text-slate-400 mt-1 mb-4 text-[13px] sm:text-sm leading-relaxed transition-colors duration-200">
          Upload all marksheets for a semester (original + backlog). Subjects appearing in multiple
          sheets are merged automatically — the latest passing grade is used.
        </p>

        {/* ── Beta warning ── */}
        <div className="flex items-start gap-2.5 mb-6 sm:mb-8 px-3.5 py-3 rounded-[10px] bg-orange-50 dark:bg-orange-950/20 border-[1.5px] border-orange-300 dark:border-orange-700/40 text-[12.5px] text-orange-700 dark:text-orange-300 leading-snug transition-colors duration-200">
          <AlertTriangle size={15} className="flex-shrink-0 mt-[1px] text-orange-500 dark:text-orange-400" />
          <span>
            <strong className="font-semibold">Beta — OCR extraction is experimental.</strong>{" "}
            Extracted subject codes, credits, and grades may be wrong due to PDF formatting or scan quality.
            Always review every row in Step 2 before calculating, or you may get an incorrect SGPA.
          </span>
        </div>

        {/* ── Step 1: Upload ── */}
        {step === "upload" && (
          <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] lg:grid-cols-[1fr_300px] gap-4 sm:gap-[18px] items-start">

            {/* Instructions sidebar */}
            <aside className="order-first md:order-last md:sticky md:top-6">
              <div className="bg-violet-50 dark:bg-violet-950/20 border-[1.5px] border-violet-200 dark:border-violet-800/30 rounded-2xl p-4 sm:p-5 mb-3 transition-colors duration-200">
                <div className="flex items-center gap-2 font-bold text-[13px] sm:text-[13.5px] text-violet-600 dark:text-violet-400 mb-3 transition-colors duration-200">
                  <Info size={14} /> How it works
                </div>
                <ol className="grid gap-2.5">
                  {[
                    <>Upload your <strong>original semester marksheet</strong> PDF.</>,
                    <>If you have <strong>backlog results</strong>, upload those PDFs too — all for the same semester.</>,
                    <>Subjects appearing in multiple sheets are <strong>merged automatically</strong>. The highest grade across all attempts is used.</>,
                    <>Review the subject table in the next step and <strong>edit</strong> anything that looks wrong.</>,
                    <>Click <strong>Calculate SGPA</strong> to see the result.</>,
                  ].map((item, i) => (
                    <li key={i} className="grid grid-cols-[22px_1fr] gap-2.5 text-[13px] text-slate-600 dark:text-slate-300 items-start transition-colors duration-200">
                      <span className="grid place-items-center w-5 h-5 rounded-full bg-violet-600 dark:bg-violet-500 text-white text-[10px] font-bold flex-shrink-0 mt-[2px]">
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

            {/* Main upload area */}
            <div className="order-last md:order-first flex flex-col gap-4">
              <div className="card">
                <Eyebrow>Step 1 — Upload marksheets</Eyebrow>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1 transition-colors duration-200">
                  Upload semester marksheet(s)
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-[13px] mb-4 leading-snug transition-colors duration-200">
                  Upload one or more PDFs for the same semester. Digital PDFs work best.
                </p>

                {/* Drop zone */}
                <label
                  className="flex flex-col items-center justify-center gap-3 border-[1.5px] border-dashed border-slate-300 dark:border-[#1e2f58] rounded-[12px] p-6 sm:p-8 bg-slate-50 dark:bg-[#0f2040] cursor-pointer transition-all duration-200 hover:border-violet-400 dark:hover:border-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950/10 hover:shadow-[0_0_0_3px_rgba(124,58,237,0.10)] mb-4"
                  onDrop={(e) => { e.preventDefault(); handleDrop(e.dataTransfer.files); }}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <UploadCloud size={28} className="text-violet-400 dark:text-violet-500" />
                  <div className="text-center">
                    <div className="text-[13.5px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5 transition-colors duration-200">
                      Click to upload or drag &amp; drop
                    </div>
                    <div className="text-[12px] text-slate-400 dark:text-slate-500 transition-colors duration-200">
                      PDF or image · multiple files supported · one semester at a time
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleDrop(e.target.files)}
                  />
                </label>

                {/* Uploaded files list */}
                {uploads.length > 0 && (
                  <div className="grid gap-2.5">
                    {uploads.map((u) => (
                      <div key={u.id} className="flex flex-col gap-1.5">
                        {/* File status row */}
                        <div
                          className={`flex items-start gap-3 rounded-[10px] border-[1.5px] p-3.5 transition-all duration-200 ${
                            u.statusKind === "ok"
                              ? "bg-blue-50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800/50"
                              : u.statusKind === "err"
                              ? "bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-900/50"
                              : u.statusKind === "info"
                              ? "bg-orange-50 dark:bg-orange-950/20 border-orange-300 dark:border-orange-800/50"
                              : "bg-slate-50 dark:bg-[#0f2040] border-slate-200 dark:border-[#162040]"
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 truncate mb-1 transition-colors duration-200">
                              {u.file.name}
                            </div>
                            <div className={`flex items-center gap-1.5 text-[12px] transition-colors duration-200 ${
                              u.statusKind === "ok"  ? "text-emerald-600 dark:text-emerald-400"
                              : u.statusKind === "err" ? "text-red-600 dark:text-red-400"
                              : "text-slate-500 dark:text-slate-400"
                            }`}>
                              {u.statusKind === "info" && <Loader2 size={12} className="animate-spin flex-shrink-0" />}
                              {u.statusKind === "ok"   && <CheckCircle2 size={12} className="flex-shrink-0" />}
                              {u.statusKind === "err"  && <AlertCircle size={12} className="flex-shrink-0" />}
                              {u.status}
                            </div>
                          </div>
                          <button
                            onClick={() => removeUpload(u.id)}
                            className="grid place-items-center w-7 h-7 rounded-[7px] text-slate-400 dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 transition-all duration-200 flex-shrink-0"
                            title="Remove file"
                          >
                            <X size={14} />
                          </button>
                        </div>

                        {/* Raw-text debug panel — expand to diagnose extraction failures */}
                        {u.rawText && (
                          <details className="px-1">
                            <summary className="text-[11px] text-slate-400 dark:text-slate-500 cursor-pointer select-none hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-200">
                              View raw extracted text ({u.rawText.length} chars)
                            </summary>
                            <pre className="mt-1.5 text-[10.5px] font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-[#060d1f] border border-slate-200 dark:border-[#162040] rounded-[8px] p-2.5 overflow-x-auto whitespace-pre-wrap max-h-48 overflow-y-auto leading-[1.6] transition-colors duration-200">
                              {u.rawText.slice(0, 4000)}{u.rawText.length > 4000 ? "\n…(truncated)" : ""}
                            </pre>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Duplicate warning */}
                {duplicateCount > 0 && (
                  <div className="flex items-start gap-2 mt-4 px-3.5 py-3 rounded-[10px] bg-amber-50 dark:bg-amber-950/20 border-[1.5px] border-amber-200 dark:border-amber-800/30 text-[12.5px] text-amber-700 dark:text-amber-400 transition-colors duration-200">
                    <AlertTriangle size={14} className="flex-shrink-0 mt-[1px]" />
                    <span>
                      {duplicateCount} duplicate subject{duplicateCount === 1 ? "" : "s"} detected across uploaded files.
                      They will be merged in the next step — the highest grade across all attempts is kept.
                    </span>
                  </div>
                )}

                {/* Nav */}
                <div className="flex gap-2.5 mt-5 items-center">
                  <div className="flex-1" />
                  <button
                    className="btn-ghost"
                    onClick={() => {
                      setSubjects([]);
                      setStep("review");
                    }}
                  >
                    Skip upload — add manually
                  </button>
                  <button
                    className="btn-primary"
                    style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}
                    disabled={rawSubjects.length === 0}
                    onClick={goToReview}
                  >
                    Review subjects <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Review ── */}
        {step === "review" && (
          <div className="card">
            <Eyebrow>Step 2 — Review &amp; edit</Eyebrow>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1 transition-colors duration-200">
              Verify extracted subjects
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-[13px] mt-1.5 mb-5 leading-snug transition-colors duration-200">
              Check each subject&apos;s code, credits, and grade. Edit anything that looks wrong, or add missing subjects manually.
              {subjects.some((s) => s.isBacklog) && (
                <span className="ml-1 inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <AlertTriangle size={12} /> Highlighted subjects had multiple attempts — highest grade kept.
                </span>
              )}
            </p>

            <SubjectTable subjects={subjects} onChange={setSubjects} />

            {/* Summary bar */}
            <div className={`flex items-start gap-2.5 text-[12.5px] sm:text-[13px] px-3.5 py-3 rounded-[10px] mt-4 font-medium leading-snug border-[1.5px] transition-colors duration-200 ${
              !hasSubjects
                ? "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/40"
                : "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40"
            }`}>
              {!hasSubjects ? (
                <><AlertCircle size={15} className="flex-shrink-0 mt-[2px]" />
                <span>Add at least one subject to calculate SGPA.</span></>
              ) : (
                <><CheckCircle2 size={15} className="flex-shrink-0 mt-[2px]" />
                <span>
                  {subjects.length} subject{subjects.length === 1 ? "" : "s"} ·{" "}
                  {subjects.reduce((s, r) => s + r.credits, 0)} total credits · ready to calculate.
                </span></>
              )}
            </div>

            <div className="flex gap-2.5 mt-5 flex-wrap items-center">
              <button className="btn-ghost" onClick={() => setStep("upload")}>
                <ArrowLeft size={16} /> Back
              </button>
              <div className="flex-1" />
              <button
                className="btn-primary"
                style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}
                disabled={!hasSubjects}
                onClick={handleCalculateSgpa}
              >
                <Calculator size={16} /> Calculate SGPA
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Result ── */}
        {step === "result" && result && (
          <div className="card">
            <Eyebrow>Result</Eyebrow>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1 transition-colors duration-200">
              Your SGPA result
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-[13px] mt-1.5 mb-5 leading-snug transition-colors duration-200">
              Based on {subjects.length} subject{subjects.length === 1 ? "" : "s"} ·{" "}
              {result.totalCredits} total credits.
            </p>

            {/* Metric cards */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-5">
              {[
                { value: result.sgpa.toFixed(2), label: "SGPA" },
                { value: `${result.percentage.toFixed(2)}%`, label: "Percentage" },
              ].map(({ value, label }) => (
                <div key={label} className="relative bg-slate-50 dark:bg-[#0f2040] border-[1.5px] border-slate-200 dark:border-[#162040] rounded-[13px] py-6 sm:py-8 px-4 text-center overflow-hidden transition-colors duration-200">
                  <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-violet-500 to-purple-500 rounded-t-[11px]" />
                  <div className="text-[36px] sm:text-[48px] font-black tracking-[-0.04em] leading-none bg-gradient-to-br from-violet-600 to-purple-600 dark:from-violet-400 dark:to-purple-400 bg-clip-text text-transparent">
                    {value}
                  </div>
                  <div className="text-slate-400 dark:text-slate-500 text-[10px] sm:text-[10.5px] mt-2 uppercase tracking-[0.1em] font-bold transition-colors duration-200">
                    {label}
                  </div>
                </div>
              ))}
            </div>

            {/* Subject breakdown table */}
            <div className="overflow-x-auto rounded-[10px] border-[1.5px] border-slate-200 dark:border-[#162040] mb-4 transition-colors duration-200">
              <table className="w-full border-collapse text-[12.5px] min-w-[460px]">
                <thead>
                  <tr>
                    {["Subject Code", "Credits", "Grade", "GP", "Credits × GP"].map((h) => (
                      <th key={h} className="text-left px-3 py-2.5 text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-[0.06em] bg-slate-50 dark:bg-[#0f2040] border-b border-slate-200 dark:border-[#162040] transition-colors duration-200 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((s) => (
                    <tr key={s.id} className={`hover:bg-slate-50 dark:hover:bg-[#0f2040] transition-colors duration-200 ${s.isBacklog ? "bg-amber-50/40 dark:bg-amber-950/10" : ""}`}>
                      <td className="px-3 py-2 border-b border-slate-100 dark:border-[#162040] text-slate-700 dark:text-slate-300 transition-colors duration-200">
                        <div className="flex items-center gap-1.5">
                          {s.isBacklog && <AlertTriangle size={11} className="text-amber-500 flex-shrink-0" />}
                          <span className="font-mono">{s.code}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 border-b border-slate-100 dark:border-[#162040] text-slate-700 dark:text-slate-300 transition-colors duration-200">{s.credits}</td>
                      <td className="px-3 py-2 border-b border-slate-100 dark:border-[#162040] transition-colors duration-200">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold ${
                          s.grade === "F"
                            ? "bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400"
                            : s.grade === "O"
                            ? "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
                            : "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400"
                        }`}>
                          {s.grade}
                        </span>
                      </td>
                      <td className="px-3 py-2 border-b border-slate-100 dark:border-[#162040] text-slate-600 dark:text-slate-300 font-mono transition-colors duration-200">{gradePoint(s.grade)}</td>
                      <td className="px-3 py-2 border-b border-slate-100 dark:border-[#162040] text-slate-600 dark:text-slate-300 font-mono transition-colors duration-200">{(s.credits * gradePoint(s.grade)).toFixed(1)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td className="px-3 py-2.5 font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 border-t-[1.5px] border-indigo-200 dark:border-indigo-800/30 transition-colors duration-200 text-[12.5px]">
                      Total
                    </td>
                    <td className="px-3 py-2.5 font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 border-t-[1.5px] border-indigo-200 dark:border-indigo-800/30 transition-colors duration-200 text-[12.5px]">
                      {result.totalCredits}
                    </td>
                    <td colSpan={2} className="px-3 py-2.5 bg-indigo-50 dark:bg-indigo-950/20 border-t-[1.5px] border-indigo-200 dark:border-indigo-800/30 transition-colors duration-200" />
                    <td className="px-3 py-2.5 font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 border-t-[1.5px] border-indigo-200 dark:border-indigo-800/30 transition-colors duration-200 font-mono text-[12.5px]">
                      {result.weightedSum}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Formula */}
            <div className="text-[12px] sm:text-[13px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#0f2040] border-[1.5px] border-slate-200 dark:border-[#162040] rounded-[10px] px-3.5 py-3 leading-[1.85] font-mono transition-colors duration-200 overflow-x-auto mb-5">
              SGPA = Σ(Credits × Grade Point) / Σ(Credits) = {result.weightedSum} / {result.totalCredits} ={" "}
              <strong className="text-violet-600 dark:text-violet-400 font-bold">{result.sgpa.toFixed(2)}</strong>
              <br />
              Percentage = (SGPA − 0.5) × 10 ={" "}
              <strong className="text-violet-600 dark:text-violet-400 font-bold">{result.percentage.toFixed(2)}%</strong>
              <br />
              <span className="text-[11px]">Grade mapping: O=10 · E=9 · A=8 · B=7 · C=6 · D=5 · F=0</span>
            </div>

            <div className="flex gap-2.5 flex-wrap items-center">
              <button className="btn-ghost" onClick={() => setStep("review")}>
                <ArrowLeft size={16} /> Edit subjects
              </button>
              <button className="btn-ghost" onClick={startOver}>
                <RotateCcw size={16} /> Start over
              </button>
            </div>
          </div>
        )}

        <div className="text-slate-400 dark:text-[#334060] text-xs text-center mt-9 flex items-center justify-center gap-2 flex-wrap leading-relaxed transition-colors duration-200">
          <ShieldCheck size={14} />
          Provisional self-calculated tool · Not an official BPUT document · Verify extracted values
        </div>
      </div>
    </div>
  );
}
