export interface SemesterInput {
  sgpa: number;
  credits: number;
}

export interface CgpaResult {
  cgpa: number;
  percentage: number;
  totalCredits: number;
  weightedSum: number;
}

/**
 * CGPA  = Σ(SGPA × Credits) / Σ(Credits)
 * %     = (CGPA − 0.5) × 10   (BPUT formula provided by user)
 */
export function computeCgpa(semesters: SemesterInput[]): CgpaResult {
  const valid = semesters.filter(
    (s) => Number.isFinite(s.sgpa) && Number.isFinite(s.credits) && s.credits > 0
  );

  const totalCredits = valid.reduce((sum, s) => sum + s.credits, 0);
  const weightedSum = valid.reduce((sum, s) => sum + s.sgpa * s.credits, 0);

  const cgpa = totalCredits > 0 ? weightedSum / totalCredits : 0;
  const percentage = totalCredits > 0 ? (cgpa - 0.5) * 10 : 0;

  return {
    cgpa: round(cgpa, 2),
    percentage: round(percentage, 2),
    totalCredits,
    weightedSum: round(weightedSum, 3),
  };
}

function round(n: number, dp: number): number {
  const f = Math.pow(10, dp);
  return Math.round(n * f) / f;
}
