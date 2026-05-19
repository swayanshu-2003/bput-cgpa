"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calculator, History, Moon, Sun } from "lucide-react";

export function Navbar() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const pathname = usePathname();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme") as "light" | "dark" | null;
      if (stored) setTheme(stored);
    } catch { }
  }, []);

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    try { localStorage.setItem("theme", next); } catch { }
  }

  const navLinks = [
    { href: "/cgpa", label: "CGPA Calculator" },
    { href: "/sgpa", label: "SGPA Calculator" },
    { href: "/history", label: "History", icon: <History size={13} /> },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-[#162040] bg-white/90 dark:bg-[#060d1f]/90 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

        {/* Logo + nav links */}
        <div className="flex items-center gap-5 min-w-0">
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="grid place-items-center w-8 h-8 rounded-[9px] bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-[0_2px_8px_rgba(79,70,229,0.35)]">
              <Calculator size={16} />
            </div>
            <span className="font-extrabold tracking-tight text-slate-900 dark:text-slate-100 text-sm sm:text-[15px] transition-colors duration-200 hidden sm:block">
              BPUT Grade Calculator
            </span>
          </Link>

          <div className="hidden sm:flex items-center gap-0.5">
            {navLinks.map(({ href, label, icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[13px] font-medium transition-colors duration-200 whitespace-nowrap ${pathname === href
                    ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#0f2040]"
                  }`}
              >
                {icon}{label}
              </Link>
            ))}
          </div>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          className="grid place-items-center w-8 h-8 sm:w-9 sm:h-9 rounded-[9px] bg-slate-100 dark:bg-[#0d1a36] border border-slate-200 dark:border-[#1e2f58] text-slate-500 dark:text-slate-400 flex-shrink-0 cursor-pointer transition-all duration-200 hover:bg-indigo-50 dark:hover:bg-[#0f2040] hover:border-indigo-200 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400"
        >
          {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
        </button>

      </div>
    </nav>
  );
}
