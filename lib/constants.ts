import { SemRow } from "@/types";

export const PROGRAM = {
  normal: { count: 8, start: 1, label: "B.Tech (8 semesters)" },
  lateral: { count: 6, start: 3, label: "Lateral Entry (6 semesters)" },
} as const;

export const emptyRow = (): SemRow => ({ sgpa: "", credits: "" });
