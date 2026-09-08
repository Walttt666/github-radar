"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, CircleDot } from "lucide-react";
import type {
  SortOption,
  TrendingCategory,
  TrendingMeta,
  TrendingPeriod,
  TrendingRepository,
  TrendingResponse,
} from "@/types/github";
import { RadarFilters } from "./radar-filters";
import { RadarHeader } from "./radar-header";
import { RepositoryList } from "./repository-list";
import { EmptyState, ErrorState, RepositoryListSkeleton } from "./repository-states";

type LoadStatus = "idle" | "loading" | "error";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isStarHistoryPoint(value: unknown): boolean {
  return isRecord(value) && typeof value.date === "string" && isFiniteNumber(value.stars);
}

function isTrendingRepository(value: unknown): value is TrendingRepository {
  return (
    isRecord(value) &&
    isFiniteNumber(value.id) &&
    typeof value.name === "string" &&
    typeof value.fullName === "string" &&
    typeof value.url === "string" &&
    isRecord(value.owner) &&
    typeof value.owner.login === "string" &&
    typeof value.owner.avatarUrl === "string" &&
    isNullableString(value.description) &&
    isNullableString(value.language) &&
    isNullableString(value.license) &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string" &&
    isFiniteNumber(value.totalStars) &&
    isFiniteNumber(value.forks) &&
    isFiniteNumber(value.starsGained) &&
    isFiniteNumber(value.growthPercent) &&
    Array.isArray(value.topics) &&
    value.topics.every((topic) => typeof topic === "string") &&
    Array.isArray(value.starHistory) &&
    value.starHistory.every(isStarHistoryPoint)
  );
}

function isTrendingResponse(value: unknown): value is TrendingResponse {
  return (
    isRecord(value) &&
    Array.isArray(value.repositories) &&
    value.repositories.every(isTrendingRepository) &&
    isRecord(value.meta) &&
    typeof value.meta.generatedAt === "string" &&
    ["day", "week", "month"].includes(String(value.meta.period)) &&
    ["all", "ai", "agents", "robotics", "drone", "cv"].includes(String(value.meta.category)) &&
    typeof value.meta.candidateCount === "number" &&
    typeof value.meta.authenticated === "boolean" &&
    value.meta.approximate === true
  );
}

function getErrorMessage(value: unknown): string {
  if (isRecord(value) && isRecord(value.error)) {
    if (value.error.code === "GITHUB_RATE_LIMITED") {
      const rateLimit = isRecord(value.error.rateLimit) ? value.error.rateLimit : null;
      const retryAfterSeconds = rateLimit?.retryAfterSeconds;
      const resetAt = rateLimit?.resetAt;
      const retryAt = isFiniteNumber(retryAfterSeconds)
        ? new Date(Date.now() + retryAfterSeconds * 1_000)
        : typeof resetAt === "string"
          ? new Date(resetAt)
          : null;
      const retryTimestamp = retryAt && Number.isFinite(retryAt.getTime())
        ? new Intl.DateTimeFormat("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }).format(retryAt)
        : null;

      return retryTimestamp
        ? `GitHub API rate limit reached. Try again after ${retryTimestamp}.`
        : "GitHub API rate limit reached. Please try again in a few minutes.";
    }
    if (typeof value.error.message === "string") {
      return value.error.message;
    }
  }
  return "GitHub data is temporarily unavailable. Please try again shortly.";
}

export function RadarDashboard() {
  const [repositories, setRepositories] = useState<TrendingRepository[]>([]);
  const [meta, setMeta] = useState<TrendingMeta | null>(null);
  const [period, setPeriod] = useState<TrendingPeriod>("week");
  const [category, setCategory] = useState<TrendingCategory>("all");
  const [sort, setSort] = useState<SortOption>("growth");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedQuery(query.trim()), 450);
    return () => window.clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadRepositories() {
      setStatus("loading");
      setErrorMessage("");
      const searchParams = new URLSearchParams({ period, category });
      if (debouncedQuery) {
        searchParams.set("q", debouncedQuery);
      }

      try {
        const response = await fetch(`/api/trending?${searchParams}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        const payload: unknown = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(getErrorMessage(payload));
        }
        if (!isTrendingResponse(payload)) {
          throw new Error("The trending service returned an invalid response.");
        }

        setRepositories(payload.repositories);
        setMeta(payload.meta);
        setStatus("idle");
      } catch (error: unknown) {
        if (controller.signal.aborted) {
          return;
        }
        setRepositories([]);
        setMeta(null);
        setStatus("error");
        setErrorMessage(error instanceof Error ? error.message : "GitHub data is temporarily unavailable.");
      }
    }

    void loadRepositories();
    return () => controller.abort();
  }, [category, debouncedQuery, period, refreshKey]);

  const visibleRepositories = useMemo(() => {
    return repositories.toSorted((first, second) => {
      if (sort === "stars") {
        return second.totalStars - first.totalStars;
      }
      if (sort === "percentage") {
        return second.growthPercent - first.growthPercent;
      }
      return second.starsGained - first.starsGained;
    });
  }, [repositories, sort]);

  function handleRefresh() {
    setRefreshKey((value) => value + 1);
  }

  function clearFilters() {
    setQuery("");
    setCategory("all");
  }

  return (
    <div className="min-h-screen bg-[#090b0e] text-zinc-100">
      <RadarHeader
        isRefreshing={status === "loading"}
        lastUpdatedAt={meta?.generatedAt ?? null}
        onRefresh={handleRefresh}
      />

      <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
        <div className="mb-6 sm:hidden">
          <p className="text-sm leading-6 text-zinc-500">Discover fast-growing open-source projects.</p>
        </div>

        <RadarFilters
          period={period}
          category={category}
          sort={sort}
          query={query}
          onPeriodChange={setPeriod}
          onCategoryChange={setCategory}
          onSortChange={setSort}
          onQueryChange={setQuery}
        />

        <section aria-labelledby="ranking-heading" className="mt-6 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0d1014]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-4 py-4 sm:px-5 lg:px-6">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-400/[0.08] text-emerald-400">
                <Activity aria-hidden="true" className="size-4" />
              </div>
              <div>
                <h2 id="ranking-heading" className="text-sm font-semibold text-zinc-200">Trending repositories</h2>
                <p className="mt-0.5 text-xs text-zinc-400/80">
                  {status === "loading"
                    ? "Scanning GitHub star history…"
                    : `${visibleRepositories.length} ${visibleRepositories.length === 1 ? "result" : "results"}${meta ? ` · ${meta.candidateCount} candidates scanned` : ""}`}
                </p>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 text-xs text-zinc-400/80">
              <CircleDot aria-hidden="true" className="size-3 text-emerald-400" />
              {status === "loading" && !meta
                ? "Connecting to GitHub…"
                : meta?.authenticated
                  ? "Authenticated GitHub data"
                  : "Public GitHub data"}
            </div>
          </div>

          <div aria-live="polite" aria-busy={status === "loading"}>
            {status === "loading" ? (
              <RepositoryListSkeleton />
            ) : status === "error" ? (
              <ErrorState message={errorMessage} onRetry={handleRefresh} />
            ) : visibleRepositories.length === 0 ? (
              <EmptyState onClear={clearFilters} />
            ) : (
              <RepositoryList repositories={visibleRepositories} period={period} />
            )}
          </div>
        </section>

        <footer className="flex flex-col gap-1.5 px-1 pb-4 pt-5 text-xs text-zinc-400/80 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-4xl leading-5">
            Rankings are calculated from a candidate pool using GitHub star history and are not an exhaustive index of every GitHub repository.
          </p>
          <p className="shrink-0">Calendar-day approximation</p>
        </footer>
      </main>
    </div>
  );
}
