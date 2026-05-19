"use client";

import Script from "next/script";

export function VisitorCounter() {
  return (
    <div className="flex items-center gap-1.5">
      <a
        href="http://www.freevisitorcounters.com"
        target="_blank"
        rel="noopener noreferrer"
        className="text-[10.5px] text-slate-400 dark:text-slate-500 hover:text-indigo-500 transition-colors duration-150"
      >
        Visitors:
      </a>
      <Script
        src="https://www.freevisitorcounters.com/auth.php?id=15fa4c4ac3397a0d2fef0d72724989ffb574c11a"
        strategy="afterInteractive"
      />
      <Script
        src="https://www.freevisitorcounters.com/en/home/counter/1555314/t/11"
        strategy="afterInteractive"
      />
    </div>
  );
}
