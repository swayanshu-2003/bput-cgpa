"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  History, Trash2, Pencil, Check, X, BarChart2,
  Calculator, Clock, ArrowRight, Eraser,
} from "lucide-react";
import {
  HistoryEntry, getHistory, deleteEntry, renameEntry,
  clearHistory, setPendingEdit, formatTimestamp,
} from "@/lib/history";

export default function HistoryPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [labelDraft, setLabelDraft] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const labelInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEntries(getHistory());
  }, []);

  useEffect(() => {
    if (editingLabelId) labelInputRef.current?.focus();
  }, [editingLabelId]);

  function handleDelete(id: string) {
    deleteEntry(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  function handleClearAll() {
    clearHistory();
    setEntries([]);
    setConfirmClear(false);
  }

  function startRename(entry: HistoryEntry) {
    setEditingLabelId(entry.id);
    setLabelDraft(entry.label);
  }

  function commitRename(id: string) {
    const trimmed = labelDraft.trim();
    if (trimmed) {
      renameEntry(id, trimmed);
      setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, label: trimmed } : e)));
    }
    setEditingLabelId(null);
  }

  function handleEdit(entry: HistoryEntry) {
    setPendingEdit(entry);
    router.push(entry.type === "cgpa" ? "/cgpa" : "/sgpa");
  }

  if (entries.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="grid place-items-center w-16 h-16 rounded-2xl bg-slate-100 dark:bg-[#0f2040] text-slate-400 dark:text-slate-500">
            <History size={28} />
          </div>
          <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300">No history yet</h2>
          <p className="text-[13.5px] text-slate-400 dark:text-slate-500 max-w-sm">
            Calculations you make on the CGPA and SGPA pages are saved here automatically.
          </p>
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => router.push("/cgpa")}
              className="btn-primary text-[13px]"
            >
              CGPA Calculator <ArrowRight size={14} />
            </button>
            <button
              onClick={() => router.push("/sgpa")}
              className="btn-ghost text-[13px]"
            >
              SGPA Calculator <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-20">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            History
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            {entries.length} saved calculation{entries.length === 1 ? "" : "s"} · stored in your browser
          </p>
        </div>
        {confirmClear ? (
          <div className="flex items-center gap-2 text-[13px]">
            <span className="text-slate-500 dark:text-slate-400">Delete all history?</span>
            <button
              onClick={handleClearAll}
              className="px-3 py-1.5 rounded-[8px] bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors"
            >
              Yes, clear
            </button>
            <button
              onClick={() => setConfirmClear(false)}
              className="px-3 py-1.5 rounded-[8px] bg-slate-100 dark:bg-[#0f2040] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#162040] font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmClear(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[12.5px] font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 border border-red-200 dark:border-red-800/40 transition-colors"
          >
            <Eraser size={13} /> Clear all
          </button>
        )}
      </div>

      {/* Entries */}
      <div className="grid gap-3 sm:gap-4">
        {entries.map((entry) => {
          const isCgpa = entry.type === "cgpa";
          const resultValue = isCgpa
            ? entry.cgpa?.result.cgpa.toFixed(2)
            : entry.sgpa?.result.sgpa.toFixed(2);
          const pct = isCgpa
            ? entry.cgpa?.result.percentage.toFixed(2)
            : entry.sgpa?.result.percentage.toFixed(2);
          const detail = isCgpa
            ? `${entry.cgpa?.semesters.length} semester${(entry.cgpa?.semesters.length ?? 0) === 1 ? "" : "s"} · ${entry.cgpa?.result.totalCredits} credits`
            : `${entry.sgpa?.subjects.filter(s => s.credits > 0 && s.grade !== "").length} subjects · ${entry.sgpa?.result.totalCredits} credits`;

          return (
            <div
              key={entry.id}
              className="bg-white dark:bg-[#0d1a36] border border-slate-200 dark:border-[#162040] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 transition-colors duration-200"
            >
              {/* Type badge */}
              <div className={`grid place-items-center w-11 h-11 rounded-[11px] flex-shrink-0 border ${
                isCgpa
                  ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/40"
                  : "bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800/40"
              }`}>
                {isCgpa ? <BarChart2 size={20} /> : <Calculator size={20} />}
              </div>

              {/* Label + meta */}
              <div className="flex-1 min-w-0">
                {editingLabelId === entry.id ? (
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      ref={labelInputRef}
                      value={labelDraft}
                      onChange={(e) => setLabelDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitRename(entry.id);
                        if (e.key === "Escape") setEditingLabelId(null);
                      }}
                      className="form-input text-[13px] py-1 px-2 flex-1 min-w-0"
                    />
                    <button onClick={() => commitRename(entry.id)} className="text-emerald-500 hover:text-emerald-600 transition-colors">
                      <Check size={15} />
                    </button>
                    <button onClick={() => setEditingLabelId(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => startRename(entry)}
                    className="flex items-center gap-1.5 group text-left mb-0.5"
                    title="Click to rename"
                  >
                    <span className="text-[13.5px] font-semibold text-slate-800 dark:text-slate-100 truncate">
                      {entry.label}
                    </span>
                    <Pencil size={11} className="text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 flex-shrink-0 transition-colors" />
                  </button>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10.5px] font-bold uppercase tracking-wide px-1.5 py-[2px] rounded-md ${
                    isCgpa
                      ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400"
                      : "bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400"
                  }`}>
                    {isCgpa ? "CGPA" : "SGPA"}
                  </span>
                  <span className="text-[12px] text-slate-400 dark:text-slate-500">{detail}</span>
                  <span className="text-[11px] text-slate-300 dark:text-slate-600 flex items-center gap-1">
                    <Clock size={10} /> {formatTimestamp(entry.timestamp)}
                  </span>
                </div>
              </div>

              {/* Result */}
              <div className="text-right flex-shrink-0">
                <div className={`text-[28px] sm:text-[32px] font-black leading-none tracking-tight ${
                  isCgpa
                    ? "bg-gradient-to-br from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent"
                    : "bg-gradient-to-br from-violet-600 to-purple-600 dark:from-violet-400 dark:to-purple-400 bg-clip-text text-transparent"
                }`}>
                  {resultValue}
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  {pct}% · {isCgpa ? "CGPA" : "SGPA"}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 sm:flex-col sm:gap-1.5 flex-shrink-0">
                <button
                  onClick={() => handleEdit(entry)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[12.5px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 hover:bg-indigo-100 dark:hover:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/30 transition-colors whitespace-nowrap"
                >
                  <Pencil size={12} /> Edit & recalculate
                </button>
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="grid place-items-center w-8 h-8 rounded-[8px] text-slate-400 dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 dark:hover:text-red-400 border border-slate-200 dark:border-[#162040] transition-colors"
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
