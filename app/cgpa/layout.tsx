import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BPUT CGPA Calculator",
  description:
    "Calculate your overall BPUT CGPA and percentage from semester SGPAs and credits. Upload semester result PDFs or enter values manually. Supports B.Tech and Lateral Entry B.Tech programs. Download a PDF grade report instantly.",
  keywords: [
    "BPUT CGPA calculator",
    "BPUT overall CGPA",
    "BPUT B.Tech CGPA",
    "BPUT lateral entry CGPA",
    "BPUT percentage from CGPA",
    "BPUT semester SGPA to CGPA",
    "BPUT grade point calculator",
    "BPUT result PDF upload",
  ],
  openGraph: {
    title: "BPUT CGPA Calculator — Calculate Overall Grade Point Average",
    description:
      "Enter your semester SGPAs and credits to compute your BPUT CGPA instantly. Upload result PDFs for auto-extraction. Free, private, and fast.",
    url: "https://bput-cgpa.vercel.app/cgpa",
  },
  twitter: {
    title: "BPUT CGPA Calculator — Calculate Overall Grade Point Average",
    description:
      "Enter your semester SGPAs and credits to compute your BPUT CGPA instantly. Upload result PDFs for auto-extraction.",
  },
  alternates: {
    canonical: "https://bput-cgpa.vercel.app/cgpa",
  },
};

export default function CgpaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
