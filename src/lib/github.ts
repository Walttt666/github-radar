import "server-only";

import { getCategorySearchExpression, sanitizeSearchQuery } from "@/lib/categories";
import { calculateStarMetrics } from "@/lib/star-history";
import type {
  GitHubSearchRepository,
  GitHubStarHistoryWeek,
  RateLimitInfo,
  TrendingCategory,
  TrendingPeriod,
  TrendingRepository,
  TrendingResponse,
} from "@/types/github";

const GITHUB_API_BASE_URL = "https://api.github.com";
const GITHUB_API_VERSION = "2026-03-10";
const CACHE_SECONDS = 12 * 60;
const REQUEST_TIMEOUT_MILLISECONDS = 15_000;
const HISTORY_CONCURRENCY = 3;
const AUTHENTICATED_CANDIDATE_LIMIT = 30;
const UNAUTHENTICATED_CANDIDATE_LIMIT = 10;

interface GitHubApiErrorOptions {
  status: number;
  code: string;
  rateLimit: RateLimitInfo;
}

export class GitHubApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly rateLimit: RateLimitInfo;

  constructor(message: string, options: GitHubApiErrorOptions) {
    super(message);
    this.name = "GitHubApiError";
    this.status = options.status;
    this.code = options.code;
    this.rateLimit = options.rateLimit;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readRateLimit(headers: Headers): RateLimitInfo {
  const parseHeader = (name: string): number | null => {
    const value = headers.get(name);
    if (value === null) {
      return null;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };
  const reset = parseHeader("x-ratelimit-reset");

  return {
    limit: parseHeader("x-ratelimit-limit"),
    remaining: parseHeader("x-ratelimit-remaining"),
    resetAt: reset === null ? null : new Date(reset * 1_000).toISOString(),
    retryAfterSeconds: parseHeader("retry-after"),
  };
}

function getGitHubErrorMessage(payload: unknown): string {
  if (isRecord(payload) && typeof payload.message === "string") {
    return payload.message;
  }
  return "GitHub returned an unexpected response.";
}

async function githubFetch(path: string, searchParams?: URLSearchParams): Promise<unknown> {
  const url = new URL(path, GITHUB_API_BASE_URL);
  if (searchParams) {
    url.search = searchParams.toString();
  }

  const headers = new Headers({
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": GITHUB_API_VERSION,
    "User-Agent": "github-star-radar",
  });
  const token = process.env.GITHUB_TOKEN?.trim();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      headers,
      cache: "force-cache",
      next: { revalidate: CACHE_SECONDS },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MILLISECONDS),
    });
  } catch {
    throw new GitHubApiError("GitHub is temporarily unreachable.", {
      status: 503,
      code: "GITHUB_UNAVAILABLE",
      rateLimit: { limit: null, remaining: null, resetAt: null },
    });
  }

  const rateLimit = readRateLimit(response.headers);
  const payload: unknown = response.status === 204 ? [] : await response.json().catch(() => null);
  if (!response.ok) {
    const upstreamMessage = getGitHubErrorMessage(payload);
    const isRateLimit =
      response.status === 429 ||
      (response.status === 403 &&
        (rateLimit.remaining === 0 || /rate limit|abuse|temporarily blocked/i.test(upstreamMessage)));

    throw new GitHubApiError(isRateLimit ? "GitHub API rate limit reached." : upstreamMessage, {
      status: response.status,
      code: isRateLimit ? "GITHUB_RATE_LIMITED" : "GITHUB_API_ERROR",
      rateLimit,
    });
  }

  return payload;
}

function parseRepository(value: unknown): GitHubSearchRepository | null {
  if (!isRecord(value) || !isRecord(value.owner)) {
    return null;
  }

  const {
    id,
    name,
    full_name: fullName,
    html_url: url,
    description,
    language,
    created_at: createdAt,
    updated_at: updatedAt,
    stargazers_count: totalStars,
    forks_count: forks,
  } = value;
  const { login, avatar_url: avatarUrl } = value.owner;
  const license = isRecord(value.license) && typeof value.license.spdx_id === "string" ? value.license.spdx_id : null;
  const topics = Array.isArray(value.topics) ? value.topics.filter((topic): topic is string => typeof topic === "string") : [];
  if (
    typeof id !== "number" ||
    !Number.isFinite(id) ||
    typeof name !== "string" ||
    typeof fullName !== "string" ||
    typeof url !== "string" ||
    typeof login !== "string" ||
    typeof avatarUrl !== "string" ||
    typeof createdAt !== "string" ||
    typeof updatedAt !== "string" ||
    typeof totalStars !== "number" ||
    !Number.isFinite(totalStars) ||
    typeof forks !== "number" ||
    !Number.isFinite(forks)
  ) {
    return null;
  }

  return {
    id,
    name,
    fullName,
    url,
    owner: {
      login,
      avatarUrl,
    },
    description: typeof description === "string" ? description : null,
    language: typeof language === "string" ? language : null,
    license,
    topics,
    createdAt,
    updatedAt,
    totalStars,
    forks,
  };
}

function parseSearchResponse(payload: unknown): GitHubSearchRepository[] {
  if (!isRecord(payload) || !Array.isArray(payload.items)) {
    throw new GitHubApiError("GitHub returned an invalid repository search response.", {
      status: 502,
      code: "INVALID_GITHUB_RESPONSE",
      rateLimit: { limit: null, remaining: null, resetAt: null },
    });
  }
  return payload.items.map(parseRepository).filter((repository): repository is GitHubSearchRepository => repository !== null);
}

function parseStarHistory(payload: unknown): GitHubStarHistoryWeek[] {
  if (!Array.isArray(payload)) {
    throw new GitHubApiError("GitHub returned an invalid star history response.", {
      status: 502,
      code: "INVALID_GITHUB_RESPONSE",
      rateLimit: { limit: null, remaining: null, resetAt: null },
    });
  }

  return payload.flatMap((value) => {
    if (
      !isRecord(value) ||
      typeof value.week !== "number" ||
      !Number.isFinite(value.week) ||
      typeof value.total !== "number" ||
      !Number.isFinite(value.total) ||
      !Array.isArray(value.days) ||
      value.days.length !== 7 ||
      !value.days.every((day) => typeof day === "number" && Number.isFinite(day) && day >= 0)
    ) {
      return [];
    }
    return [{ week: value.week, total: value.total, days: value.days }];
  });
}

function startDateForPeriod(period: TrendingPeriod, now = new Date()): string {
  // The ranking uses inclusive UTC calendar dates: today, today plus the
  // previous six days, or today plus the previous 29 days.
  const days = { day: 0, week: 6, month: 29 } satisfies Record<TrendingPeriod, number>;
  return new Date(now.getTime() - days[period] * 86_400_000).toISOString().slice(0, 10);
}

function buildSearchQuery(
  dateQualifier: "pushed" | "created",
  startDate: string,
  category: TrendingCategory,
  query: string,
): string {
  return [
    getCategorySearchExpression(category),
    sanitizeSearchQuery(query),
    `${dateQualifier}:>=${startDate}`,
    dateQualifier === "pushed" ? "stars:>=50" : "",
    "fork:false",
  ]
    .filter(Boolean)
    .join(" ");
}

async function searchRepositories(searchQuery: string, limit: number): Promise<GitHubSearchRepository[]> {
  const payload = await githubFetch(
    "/search/repositories",
    new URLSearchParams({
      q: searchQuery,
      sort: "stars",
      order: "desc",
      per_page: String(limit),
    }),
  );
  return parseSearchResponse(payload);
}

function interleaveAndDeduplicate(
  primary: GitHubSearchRepository[],
  secondary: GitHubSearchRepository[],
  limit: number,
): GitHubSearchRepository[] {
  const result: GitHubSearchRepository[] = [];
  const seen = new Set<number>();
  const longest = Math.max(primary.length, secondary.length);

  for (let index = 0; index < longest && result.length < limit; index += 1) {
    for (const candidate of [primary[index], secondary[index]]) {
      if (candidate && !seen.has(candidate.id)) {
        seen.add(candidate.id);
        result.push(candidate);
        if (result.length === limit) {
          break;
        }
      }
    }
  }
  return result;
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let nextIndex = 0;
  let firstError: unknown;
  let hasError = false;

  async function worker() {
    while (!hasError && nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      try {
        results[currentIndex] = await mapper(items[currentIndex]);
      } catch (error: unknown) {
        if (!hasError) {
          hasError = true;
          firstError = error;
        }
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
  if (hasError) {
    throw firstError;
  }
  return results;
}

async function rankCandidate(
  repository: GitHubSearchRepository,
  period: TrendingPeriod,
): Promise<TrendingRepository> {
  const payload = await githubFetch(
    `/repos/${encodeURIComponent(repository.owner.login)}/${encodeURIComponent(repository.name)}/stargazers/history`,
    new URLSearchParams({ per_page: "5" }),
  );
  const { starsGained, starHistory } = calculateStarMetrics(parseStarHistory(payload), period);
  const previousStars = Math.max(repository.totalStars - starsGained, 1);

  return {
    ...repository,
    starsGained,
    growthPercent: Math.round((starsGained / previousStars) * 1_000) / 10,
    starHistory,
  };
}

export async function getTrendingRepositories(
  period: TrendingPeriod,
  category: TrendingCategory,
  query: string,
): Promise<TrendingResponse> {
  const authenticated = Boolean(process.env.GITHUB_TOKEN?.trim());
  const candidateLimit = authenticated ? AUTHENTICATED_CANDIDATE_LIMIT : UNAUTHENTICATED_CANDIDATE_LIMIT;
  const startDate = startDateForPeriod(period);

  // Search requests are intentionally sequential to stay friendly to GitHub's
  // stricter search rate-limit bucket.
  const active = await searchRepositories(buildSearchQuery("pushed", startDate, category, query), candidateLimit);
  const newAndGrowing = await searchRepositories(buildSearchQuery("created", startDate, category, query), candidateLimit);
  const candidates = interleaveAndDeduplicate(active, newAndGrowing, candidateLimit);
  const recoverableErrors: GitHubApiError[] = [];

  const ranked = await mapWithConcurrency(candidates, HISTORY_CONCURRENCY, async (repository) => {
    try {
      return await rankCandidate(repository, period);
    } catch (error: unknown) {
      if (error instanceof GitHubApiError && error.code === "GITHUB_RATE_LIMITED") {
        throw error;
      }
      if (error instanceof GitHubApiError) {
        recoverableErrors.push(error);
      }
      return null;
    }
  });
  const repositories = ranked
    .filter((repository): repository is TrendingRepository => repository !== null)
    .sort((first, second) => second.starsGained - first.starsGained)
    .slice(0, 20);

  if (repositories.length === 0 && candidates.length > 0 && recoverableErrors[0]) {
    throw recoverableErrors[0];
  }

  return {
    repositories,
    meta: {
      generatedAt: new Date().toISOString(),
      period,
      category,
      candidateCount: candidates.length,
      authenticated,
      approximate: true,
    },
  };
}
