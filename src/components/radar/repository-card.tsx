import Image from "next/image";
import { ArrowUpRight, Star, TrendingUp } from "lucide-react";
import {
  formatCompactPercentage,
  formatPercentage,
  formatRelativeTime,
  formatStarGain,
  formatStars,
  getLanguageColor,
  periodLabels,
} from "@/lib/format";
import type { TrendingPeriod, TrendingRepository } from "@/types/github";
import { Sparkline } from "./sparkline";

interface RepositoryCardProps {
  repository: TrendingRepository;
  rank: number;
  period: TrendingPeriod;
}

export function RepositoryCard({ repository, rank, period }: RepositoryCardProps) {
  const formattedRank = `#${String(rank).padStart(2, "0")}`;
  const isTopThree = rank <= 3;
  const sparklineValues = repository.starHistory.slice(period === "month" ? -30 : -7).map((point) => point.stars);
  const displayedSparkline = sparklineValues.length > 0 ? sparklineValues : [0];
  const fullGrowthPercentage = formatPercentage(repository.growthPercent);

  return (
    <article
      className={`group relative grid gap-4 px-4 transition-colors hover:bg-white/[0.02] sm:px-5 lg:grid-cols-[52px_minmax(0,1fr)_440px] lg:items-center lg:gap-5 lg:px-6 ${
        isTopThree ? "bg-white/[0.012] py-6" : "py-5"
      }`}
    >
      <div
        className={`absolute inset-y-4 left-0 w-px transition-colors ${
          rank === 1
            ? "bg-emerald-400/70"
            : isTopThree
              ? "bg-zinc-500/40"
              : "bg-transparent group-hover:bg-emerald-400/60"
        }`}
      />

      <div className="lg:self-start lg:pt-0.5">
        <span
          aria-label={`Rank ${rank}`}
          className={`font-mono font-semibold tracking-[-0.04em] ${
            rank === 1
              ? "text-lg text-emerald-300"
              : isTopThree
                ? "text-base text-zinc-300"
                : "text-sm text-zinc-400/75"
          }`}
        >
          {formattedRank}
        </span>
      </div>

      <div className="min-w-0">
        <div className="flex items-start gap-3.5">
          <Image
            src={repository.owner.avatarUrl}
            alt={`${repository.owner.login} avatar`}
            width={40}
            height={40}
            className="size-10 shrink-0 rounded-lg border border-white/10 bg-white/[0.04] object-cover"
          />

          <div className="min-w-0 flex-1">
            <a
              href={repository.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${repository.fullName} on GitHub in a new tab`}
              className="inline-flex max-w-full items-center gap-1.5 text-base font-semibold tracking-[-0.015em] text-zinc-100 outline-none transition-colors hover:text-emerald-300 focus-visible:rounded focus-visible:ring-2 focus-visible:ring-emerald-400/70"
            >
              <span className="truncate">
                <span className="font-normal text-zinc-500">{repository.owner.login}/</span>
                {repository.name}
              </span>
              <ArrowUpRight aria-hidden="true" className="size-3.5 shrink-0 text-zinc-600 transition-colors group-hover:text-zinc-400" />
            </a>
            <p className="mt-1.5 max-w-3xl text-sm leading-5 text-zinc-400">
              {repository.description ?? "No description provided."}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-zinc-400/80">
              {repository.language && (
                <span className="inline-flex items-center gap-1.5 text-zinc-400">
                  <span className="size-2 rounded-full" style={{ backgroundColor: getLanguageColor(repository.language) }} />
                  {repository.language}
                </span>
              )}
              {repository.license && <span>{repository.license}</span>}
              <span>Updated {formatRelativeTime(repository.updatedAt)}</span>
            </div>

            {repository.topics.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {repository.topics.slice(0, 4).map((topic) => (
                  <span key={topic} className="rounded-md border border-white/[0.08] bg-white/[0.025] px-2 py-1 text-xs leading-none text-zinc-400/80">
                    {topic}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 items-end gap-x-4 gap-y-4 border-t border-white/[0.07] pt-4 sm:grid-cols-[minmax(132px,1fr)_88px_88px_116px] sm:items-center sm:gap-x-4 lg:grid-cols-[132px_76px_80px_116px] lg:gap-x-3 lg:border-0 lg:pt-0">
        <div aria-label={`${formatStarGain(repository.starsGained)} stars gained ${periodLabels[period]}`}>
          <div className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-300/80">
            {periodLabels[period]}
          </div>
          <div className="flex items-center gap-1.5 text-[22px] font-semibold leading-none tabular-nums tracking-[-0.025em] text-emerald-300">
            <TrendingUp aria-hidden="true" className="size-4.5" strokeWidth={2.2} />
            {formatStarGain(repository.starsGained)}
          </div>
        </div>

        <div aria-label={`Growth ${fullGrowthPercentage}`} title={fullGrowthPercentage}>
          <div className="mb-1.5 text-xs font-medium text-zinc-400/80">Growth</div>
          <div className="truncate text-base font-semibold tabular-nums text-zinc-100">
            {formatCompactPercentage(repository.growthPercent)}
          </div>
        </div>

        <div>
          <div className="mb-1.5 text-xs font-medium text-zinc-400/80">Total</div>
          <div className="flex items-center gap-1.5 text-sm font-medium tabular-nums text-zinc-300">
            <Star aria-hidden="true" className="size-3.5 text-zinc-500" />
            {formatStars(repository.totalStars)}
          </div>
        </div>

        <div className="justify-self-end">
          <Sparkline values={displayedSparkline} label={`${repository.name} star growth trend`} />
        </div>
      </div>
    </article>
  );
}
