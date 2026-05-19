/**
 * Horizontal banner ad slot — placed above the footer on every page.
 *
 * Replace the placeholder with a real <ins class="adsbygoogle"> tag
 * once your AdSense account is approved (728×90 leaderboard or
 * responsive unit recommended).
 */
export function BottomAd() {
  return (
    <div className="w-full border-t border-slate-200 dark:border-[#162040] bg-white dark:bg-[#0d1a36] transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-center">
        <div className="w-full max-w-[728px] h-[90px] rounded-xl border border-dashed border-slate-200 dark:border-[#1e2f58] bg-slate-50 dark:bg-[#060d1f] flex items-center justify-center text-[11px] font-medium uppercase tracking-widest text-slate-300 dark:text-slate-700 select-none">
          {/*
            ── REPLACE THIS BLOCK WITH YOUR ADSENSE UNIT ──────────────────
            <ins
              className="adsbygoogle"
              style={{ display: "block", width: "728px", height: "90px" }}
              data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
              data-ad-slot="XXXXXXXXXX"
            />
            ───────────────────────────────────────────────────────────────
          */}
          Advertisement
        </div>
      </div>
    </div>
  );
}
