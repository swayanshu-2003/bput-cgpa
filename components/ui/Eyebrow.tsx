export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-1.5 text-[10.5px] font-bold tracking-[0.09em] uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/30 px-[11px] py-[3px] rounded-full mb-3.5 transition-colors duration-200">
      {children}
    </div>
  );
}
