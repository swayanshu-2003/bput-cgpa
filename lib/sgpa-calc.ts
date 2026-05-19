export const GRADE_POINTS: Record<string, number> = {
  O: 10, E: 9, A: 8, B: 7, C: 6, D: 5, F: 0,
};

export const VALID_GRADES = ["O", "E", "A", "B", "C", "D", "F"] as const;
export type Grade = (typeof VALID_GRADES)[number];

export interface SubjectEntry {
  id: string;
  code: string;
  name: string;
  credits: number;
  grade: string;
  source: string;
  isBacklog: boolean;
}

export interface SgpaResult {
  sgpa: number;
  percentage: number;
  totalCredits: number;
  weightedSum: number;
}

export function gradePoint(grade: string): number {
  return GRADE_POINTS[grade.toUpperCase()] ?? 0;
}

/**
 * Merge subjects across multiple marksheets.
 * If a subject appears multiple times, keep the latest passing grade.
 * If all attempts failed, keep the last one.
 * Preserve insertion order of first appearance.
 */
export function mergeSubjects(entries: SubjectEntry[]): SubjectEntry[] {
  const order: string[] = [];
  const byCode = new Map<string, SubjectEntry[]>();

  for (const e of entries) {
    const key = e.code.toUpperCase().trim();
    if (!byCode.has(key)) {
      byCode.set(key, []);
      order.push(key);
    }
    byCode.get(key)!.push(e);
  }

  return order.map((key) => {
    const rows = byCode.get(key)!;
    if (rows.length === 1) return { ...rows[0], isBacklog: false };
    // Multiple attempts: keep the highest grade; all others are treated as failed attempts.
    const best = rows.reduce((a, b) =>
      gradePoint(b.grade) > gradePoint(a.grade) ? b : a
    );
    return { ...best, isBacklog: true };
  });
}

export function computeSgpa(subjects: SubjectEntry[]): SgpaResult {
  const valid = subjects.filter((r) => r.credits > 0 && r.grade !== "");
  const totalCredits = valid.reduce((s, r) => s + r.credits, 0);
  const weightedSum = valid.reduce((s, r) => s + r.credits * gradePoint(r.grade), 0);
  const sgpa = totalCredits > 0 ? weightedSum / totalCredits : 0;
  const percentage = sgpa > 0 ? (sgpa - 0.5) * 10 : 0;
  return {
    sgpa: round(sgpa, 2),
    percentage: round(percentage, 2),
    totalCredits,
    weightedSum: round(weightedSum, 3),
  };
}

function round(n: number, dp: number): number {
  const f = Math.pow(10, dp);
  return Math.round(n * f) / f;
}
