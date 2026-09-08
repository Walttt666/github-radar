import Image from "next/image";
import { ArrowUpRight, Star, TrendingUp } from "lucide-react";
import {
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
  const sparklineValues = repository.starHistory.slice(period === "month" ? -30 : -7).map((point) => point.stars);
  const displayedSparkline = sparklineValues.length > 0 ? sparklineValues : [0];

  return (
    <article className="group relative grid gap-4 px-4 py-5 transition-colors hover:bg-white/[0.018] sm:px-5 lg:grid-cols-[48px_minmax(0,1fr)_340px] lg:items-center lg:gap-5 lg:px-6 lg:py-5">
      <div className="absolute left-0 top-5 h-7 w-px bg-emerald-400/0 transition-colors group-hover:bg-emerald-400/70" />

      <div className="flex items-center justify-between lg:block">
        <span className="font-mono text-sm font-medium tracking-[-0.03em] text-zinc-600">{formattedRank}</span>
        <span className="rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-2 py-1 text-[11px] font-medium text-emerald-400 lg:hidden">
          {formatPercentage(repository.growthPercent)}
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
              className="inline-flex max-w-full items-center gap-1.5 text-[15px] font-semibold tracking-[-0.015em] text-zinc-100 outline-none transition-colors hover:text-emerald-300 focus-visible:rounded focus-visible:ring-2 focus-visible:ring-emerald-400/70"
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

            <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-zinc-600">
              {repository.language && (
                <span className="inline-flex items-center gap-1.5 text-zinc-400">
                  <span className="size-2 rounded-full" style={{ backgroundColor: getLanguageColor(repository.language) }} />
                  {repository.language}
                </span>
              )}
              {repository.license && <span>{repository.license}</span>}
              <span>Updated {formatRelativeTime(repository.updatedAt)}</span>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {repository.topics.slice(0, 4).map((topic) => (
                <span key={topic} className="rounded-md border border-white/[0.07] bg-white/[0.025] px-2 py-1 text-[11px] leading-none text-zinc-500">
                  {topic}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 items-end gap-3 border-t border-white/[0.06] pt-4 lg:grid-cols-[90px_126px_116px] lg:border-0 lg:pt-0">
        <div>
          <div className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.11em] text-zinc-600">Total stars</div>
          <div className="flex items-center gap-1.5 text-sm font-semibold tabular-nums text-zinc-200">
            <Star aria-hidden="true" className="size-3.5 text-zinc-500" />
            {formatStars(repository.totalStars)}
          </div>
        </div>

        <div>
          <div className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.11em] text-zinc-600">Stars gained</div>
          <div className="flex items-center gap-1.5 text-sm font-semibold tabular-nums text-emerald-400">
            <TrendingUp aria-hidden="true" className="size-3.5" />
            {formatStarGain(repository.starsGained)}
          </div>
          <div className="mt-0.5 text-[10px] text-zinc-600">{periodLabels[period]}</div>
        </div>

        <div className="hidden justify-self-end lg:block">
          <Sparkline values={displayedSparkline} label={`${repository.name} star growth trend`} />
          <div className="mt-0.5 text-right text-xs font-medium tabular-nums text-emerald-400">
            {formatPercentage(repository.growthPercent)}
          </div>
        </div>

        <div className="col-span-2 mt-1 flex items-end justify-between border-t border-white/[0.05] pt-3 lg:hidden">
          <span className="text-[10px] font-medium uppercase tracking-[0.11em] text-zinc-600">Growth trend</span>
          <Sparkline values={displayedSparkline} label={`${repository.name} star growth trend`} />
        </div>
      </div>
    </article>
  );
}
