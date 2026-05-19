import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calculation History",
  description:
    "View, rename, and manage your saved BPUT CGPA and SGPA calculations. All history is stored locally in your browser — no data is sent to any server.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "https://bput-cgpa.vercel.app/history",
  },
};

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
