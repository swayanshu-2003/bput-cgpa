"use client";

/**
 * Sticky side-gutter ad slots — visible only on screens wide enough
 * that the content (max-w-6xl = 1152px) plus two 160px ad columns
 * plus gaps all fit (~1520px+).
 *
 * Replace the placeholder divs with real <ins class="adsbygoogle"> tags
 * once your AdSense account is approved.
 */
export function SideAds() {
  return (
    <>
      {/* Left ad */}
      <div
        className="fixed top-1/2 -translate-y-1/2 w-[160px] hidden 2xl:flex flex-col items-center"
        style={{ left: "max(8px, calc(50% - 576px - 180px))" }}
      >
        <AdSlot side="left" />
      </div>

      {/* Right ad */}
      <div
        className="fixed top-1/2 -translate-y-1/2 w-[160px] hidden 2xl:flex flex-col items-center"
        style={{ right: "max(8px, calc(50% - 576px - 180px))" }}
      >
        <AdSlot side="right" />
      </div>
    </>
  );
}

function AdSlot({ side }: { side: "left" | "right" }) {
  return (
    <div className="w-[160px] min-h-[600px] rounded-xl border border-dashed border-slate-200 dark:border-[#1e2f58] bg-slate-50 dark:bg-[#0d1a36] flex flex-col items-center justify-center gap-2 text-slate-300 dark:text-slate-600 select-none">
      {/*
        ── REPLACE THIS BLOCK WITH YOUR ADSENSE UNIT ────────────────────
        <ins
          className="adsbygoogle"
          style={{ display: "inline-block", width: "160px", height: "600px" }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
          data-ad-slot="XXXXXXXXXX"
        />
        ─────────────────────────────────────────────────────────────────
      */}
      <span className="text-[10px] font-medium uppercase tracking-widest rotate-90 opacity-40">
        Ad · {side}
      </span>
    </div>
  );
}
