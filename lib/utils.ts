import { SemRow } from "@/types";
import { SemesterInput } from "@/lib/calc";

export function isValid(p: SemesterInput): boolean {
  return (
    Number.isFinite(p.sgpa) && p.sgpa >= 0 && p.sgpa <= 10 &&
    Number.isFinite(p.credits) && p.credits > 0
  );
}

export function isFilled(r: SemRow): boolean {
  return r.sgpa.trim() !== "" || r.credits.trim() !== "";
}
