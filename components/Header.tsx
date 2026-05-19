import { Calculator, Moon, Sun } from "lucide-react";

interface HeaderProps {
  theme: "light" | "dark";
  onToggleTheme: () => void;
  title?: string;
  titleShort?: string;
}

export function Header({ theme, onToggleTheme, title, titleShort }: HeaderProps) {
  const fullTitle = title ?? "BPUT CGPA & Percentage Calculator";
  const shortTitle = titleShort ?? "BPUT CGPA Calculator";

  return (
    <header className="flex items-center gap-3 sm:gap-3.5 mb-3">
      <div className="flex items-center gap-3 sm:gap-3.5 flex-1 min-w-0">
        <div className="grid place-items-center w-10 h-10 sm:w-[46px] sm:h-[46px] rounded-[11px] sm:rounded-[13px] bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex-shrink-0 shadow-[0_4px_14px_rgba(79,70,229,0.28)] transition-shadow duration-200">
          <Calculator size={20} className="sm:hidden" />
          <Calculator size={22} className="hidden sm:block" />
        </div>
        <div className="min-w-0">
          <h1 className="text-base sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 leading-tight transition-colors duration-200">
            <span className="sm:hidden">{shortTitle}</span>
            <span className="hidden sm:inline">{fullTitle}</span>
          </h1>
        </div>
      </div>
      <button
        onClick={onToggleTheme}
        aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
        className="grid place-items-center w-9 h-9 sm:w-[38px] sm:h-[38px] rounded-[10px] bg-white dark:bg-[#0d1a36] border border-slate-300 dark:border-[#1e2f58] text-slate-500 dark:text-slate-400 flex-shrink-0 cursor-pointer shadow-sm transition-all duration-200 hover:bg-indigo-50 dark:hover:bg-[#0f2040] hover:border-indigo-200 dark:hover:border-indigo-800 hover:text-indigo-600 dark:hover:text-indigo-400"
      >
        {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
      </button>
    </header>
  );
}
