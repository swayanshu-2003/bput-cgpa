import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BPUT SGPA Calculator",
  description:
    "Calculate your BPUT SGPA from subject-level grades. Upload original and backlog marksheets — duplicates are auto-detected and the highest grade is used. Edit grades and credits manually. Free and 100% private.",
  keywords: [
    "BPUT SGPA calculator",
    "BPUT subject grade calculator",
    "BPUT marksheet SGPA",
    "BPUT backlog SGPA",
    "BPUT grade point per subject",
    "BPUT semester grade point average",
    "BPUT OCR marksheet",
    "BPUT result upload SGPA",
  ],
  openGraph: {
    title: "BPUT SGPA Calculator — Compute Semester Grade Point Average",
    description:
      "Upload your BPUT marksheets to auto-extract subject grades and compute SGPA. Handles backlog results — picks the highest grade automatically.",
    url: "https://bput-cgpa.vercel.app/sgpa",
  },
  twitter: {
    title: "BPUT SGPA Calculator — Compute Semester Grade Point Average",
    description:
      "Upload your BPUT marksheets to auto-extract subject grades and compute SGPA. Handles backlog results automatically.",
  },
  alternates: {
    canonical: "https://bput-cgpa.vercel.app/sgpa",
  },
};

export default function SgpaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
