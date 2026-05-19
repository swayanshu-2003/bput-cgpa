import { Program } from "@/types";
import { SemesterInput, CgpaResult } from "@/lib/calc";
import { SubjectEntry, SgpaResult } from "@/lib/sgpa-calc";

export interface CgpaHistoryPayload {
  program: Program;
  startSem: number;
  semesters: SemesterInput[];
  result: CgpaResult;
}

export interface SgpaHistoryPayload {
  subjects: SubjectEntry[];
  result: SgpaResult;
}

export interface HistoryEntry {
  id: string;
  type: "cgpa" | "sgpa";
  timestamp: number;
  label: string;
  cgpa?: CgpaHistoryPayload;
  sgpa?: SgpaHistoryPayload;
}

const STORAGE_KEY  = "bput-history";
const PENDING_KEY  = "bput-pending-edit";
const MAX_ENTRIES  = 100;

export function newHistoryId(): string {
  return `h-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveEntry(entry: HistoryEntry): void {
  try {
    const list = [entry, ...getHistory()].slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

export function deleteEntry(id: string): void {
  try {
    const list = getHistory().filter((e) => e.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

export function renameEntry(id: string, label: string): void {
  try {
    const list = getHistory().map((e) => (e.id === id ? { ...e, label } : e));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

export function clearHistory(): void {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}

export function setPendingEdit(entry: HistoryEntry): void {
  try { localStorage.setItem(PENDING_KEY, JSON.stringify(entry)); } catch {}
}

export function consumePendingEdit(): HistoryEntry | null {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    localStorage.removeItem(PENDING_KEY);
    return JSON.parse(raw) as HistoryEntry;
  } catch {
    return null;
  }
}

export function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}
