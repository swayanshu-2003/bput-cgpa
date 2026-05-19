import { Trash2, Plus, AlertTriangle } from "lucide-react";
import { SubjectEntry, VALID_GRADES } from "@/lib/sgpa-calc";

interface SubjectTableProps {
  subjects: SubjectEntry[];
  onChange: (subjects: SubjectEntry[]) => void;
}

const TH = "text-left px-3 py-2.5 text-slate-400 dark:text-slate-500 font-bold text-[10px] sm:text-[11px] uppercase tracking-[0.06em] bg-slate-50 dark:bg-[#0f2040] border-b border-slate-200 dark:border-[#162040] transition-colors duration-200 whitespace-nowrap";
const TD = "px-3 py-2 border-b border-slate-100 dark:border-[#162040] transition-colors duration-200 text-[13px]";

function newId() {
  return `manual-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function isIncomplete(s: SubjectEntry) {
  return s.credits <= 0 || s.grade === "";
}

export function SubjectTable({ subjects, onChange }: SubjectTableProps) {
  function update(id: string, patch: Partial<SubjectEntry>) {
    onChange(subjects.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function remove(id: string) {
    onChange(subjects.filter((s) => s.id !== id));
  }

  function addRow() {
    onChange([
      ...subjects,
      { id: newId(), code: "", name: "", credits: 3, grade: "B", source: "manual", isBacklog: false },
    ]);
  }

  const extracted = subjects.filter((s) => s.source !== "manual");
  const manual    = subjects.filter((s) => s.source === "manual");

  return (
    <div className="space-y-3">

      {/* ── OCR-extracted subjects ── */}
      {extracted.length > 0 && (
        <div className="overflow-x-auto rounded-[10px] border-[1.5px] border-slate-200 dark:border-[#162040] transition-colors duration-200">
          <table className="w-full border-collapse text-[13px] min-w-[420px]">
            <thead>
              <tr>
                <th className={TH}>Code</th>
                <th className={TH}>Subject Name</th>
                <th className={TH}>Credits</th>
                <th className={TH}>Grade</th>
                <th className={`${TH} text-center`}></th>
              </tr>
            </thead>
            <tbody>
              {extracted.map((s) => {
                const incomplete = isIncomplete(s);
                return (
                  <tr
                    key={s.id}
                    className={`transition-colors duration-200 ${
                      incomplete
                        ? "bg-red-50/60 dark:bg-red-950/20 hover:bg-red-50 dark:hover:bg-red-950/30"
                        : s.isBacklog
                        ? "bg-amber-50/50 dark:bg-amber-950/10 hover:bg-amber-50 dark:hover:bg-amber-950/20"
                        : "hover:bg-slate-50 dark:hover:bg-[#0f2040]"
                    }`}
                  >
                    {/* Code — read-only */}
                    <td className={TD}>
                      <div className="flex items-center gap-1.5">
                        {incomplete && (
                          <AlertTriangle size={12} className="text-red-500 flex-shrink-0" />
                        )}
                        <span className="font-mono text-[11.5px] text-slate-500 dark:text-slate-400">
                          {s.code || "—"}
                        </span>
                      </div>
                    </td>

                    {/* Name — read-only */}
                    <td className={TD}>
                      <span className="text-slate-700 dark:text-slate-300 truncate max-w-[200px] block" title={s.name}>
                        {s.name || "—"}
                      </span>
                    </td>

                    {/* Credits */}
                    <td className={TD}>
                      <input
                        type="number" min={1} max={6} step={1}
                        value={s.credits || ""}
                        placeholder="—"
                        onChange={(e) => update(s.id, { credits: Number(e.target.value) })}
                        className={`form-input text-[12.5px] py-1.5 px-2 w-16 text-center ${
                          s.credits <= 0 ? "border-red-400 dark:border-red-600 focus:ring-red-400" : ""
                        }`}
                      />
                    </td>

                    {/* Grade */}
                    <td className={TD}>
                      <select
                        value={s.grade}
                        onChange={(e) => update(s.id, { grade: e.target.value })}
                        className={`form-input text-[12.5px] py-1.5 px-2 w-20 cursor-pointer ${
                          s.grade === "" ? "border-red-400 dark:border-red-600 focus:ring-red-400 text-slate-400" : ""
                        }`}
                      >
                        {s.grade === "" && (
                          <option value="" disabled>—</option>
                        )}
                        {VALID_GRADES.map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </td>

                    {/* Delete / warning */}
                    <td className={`${TD} text-center`}>
                      {incomplete ? (
                        <span className="text-[10.5px] font-semibold text-red-500 dark:text-red-400 whitespace-nowrap">
                          Fill in
                        </span>
                      ) : (
                        <button
                          onClick={() => remove(s.id)}
                          className="grid place-items-center w-7 h-7 rounded-[7px] text-slate-400 dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 dark:hover:text-red-400 transition-all duration-200 mx-auto"
                          title="Remove subject"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Manually added subjects ── */}
      {(manual.length > 0 || extracted.length === 0) && (
        <div className="overflow-x-auto rounded-[10px] border-[1.5px] border-slate-200 dark:border-[#162040] transition-colors duration-200">
          <table className="w-full border-collapse text-[13px] min-w-[200px]">
            <thead>
              <tr>
                <th className={TH}>Credits</th>
                <th className={TH}>Grade</th>
                <th className={`${TH} text-center`}></th>
              </tr>
            </thead>
            <tbody>
              {manual.length === 0 && extracted.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-3 py-6 text-center text-slate-400 dark:text-slate-500 text-[13px] italic transition-colors duration-200">
                    No subjects yet — upload a marksheet or add rows manually.
                  </td>
                </tr>
              )}
              {manual.map((s) => (
                <tr
                  key={s.id}
                  className="hover:bg-slate-50 dark:hover:bg-[#0f2040] transition-colors duration-200"
                >
                  <td className={TD}>
                    <input
                      type="number" min={1} max={6} step={1}
                      value={s.credits}
                      onChange={(e) => update(s.id, { credits: Number(e.target.value) })}
                      className="form-input text-[12.5px] py-1.5 px-2 w-16 text-center"
                    />
                  </td>
                  <td className={TD}>
                    <select
                      value={s.grade}
                      onChange={(e) => update(s.id, { grade: e.target.value })}
                      className="form-input text-[12.5px] py-1.5 px-2 w-16 cursor-pointer"
                    >
                      {VALID_GRADES.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </td>
                  <td className={`${TD} text-center`}>
                    <button
                      onClick={() => remove(s.id)}
                      className="grid place-items-center w-7 h-7 rounded-[7px] text-slate-400 dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 dark:hover:text-red-400 transition-all duration-200 mx-auto"
                      title="Remove subject"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button onClick={addRow} className="btn-ghost mt-1 text-[12.5px] py-2 px-3.5">
        <Plus size={14} /> Add subject manually
      </button>
    </div>
  );
}
