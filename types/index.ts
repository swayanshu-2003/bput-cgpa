export type Mode = "manual" | "upload";
export type Program = "normal" | "lateral";
export type Step = "home" | "entry" | "result";

export interface SemRow {
  sgpa: string;
  credits: string;
  fileName?: string;
  status?: string;
  statusKind?: "ok" | "err" | "info";
}
