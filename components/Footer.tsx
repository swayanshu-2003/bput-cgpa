import { Github, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-[#162040] bg-white/60 dark:bg-[#060d1f]/60 backdrop-blur-sm transition-colors duration-200 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-slate-400 dark:text-slate-500">



        <div className="flex items-center gap-4">
          <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 text-[10.5px] font-semibold uppercase tracking-wide">
            Open Source
          </span>
          <a
            href="https://github.com/swayanshu-2003/bput-cgpa"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-150"
          >
            <Github size={13} /> View on GitHub
          </a>
        </div>

      </div>
    </footer>
  );
}
