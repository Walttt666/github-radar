import { Radar, RefreshCw } from "lucide-react";

interface RadarHeaderProps {
  isRefreshing: boolean;
  onRefresh: () => void;
}

export function RadarHeader({ isRefreshing, onRefresh }: RadarHeaderProps) {
  return (
    <header className="border-b border-white/[0.08] bg-[#090b0e]/90 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-10">
        <div className="flex min-w-0 items-center gap-3.5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <Radar aria-hidden="true" className="size-5" strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-[17px] font-semibold tracking-[-0.02em] text-zinc-50 sm:text-lg">
              GitHub Star Radar
            </h1>
            <p className="mt-0.5 hidden text-sm text-zinc-500 sm:block">
              Discover fast-growing open-source projects.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3.5 text-sm font-medium text-zinc-200 transition-colors hover:border-white/20 hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 disabled:cursor-wait disabled:opacity-60"
        >
          <RefreshCw aria-hidden="true" className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          <span>{isRefreshing ? "Refreshing" : "Refresh"}</span>
        </button>
      </div>
    </header>
  );
}
