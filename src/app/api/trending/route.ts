import { GitHubApiError, getTrendingRepositories } from "@/lib/github";
import { trendingCategories } from "@/lib/categories";
import type { TrendingCategory, TrendingErrorResponse, TrendingPeriod } from "@/types/github";

const periods: TrendingPeriod[] = ["day", "week", "month"];

function isPeriod(value: string): value is TrendingPeriod {
  return periods.includes(value as TrendingPeriod);
}

function isCategory(value: string): value is TrendingCategory {
  return trendingCategories.includes(value as TrendingCategory);
}

function errorResponse(status: number, code: string, message: string): Response {
  const body: TrendingErrorResponse = { error: { code, message } };
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const periodValue = url.searchParams.get("period") ?? "week";
  const categoryValue = url.searchParams.get("category") ?? "all";
  const query = url.searchParams.get("q") ?? "";

  if (!isPeriod(periodValue)) {
    return errorResponse(400, "INVALID_PERIOD", "period must be one of: day, week, month.");
  }
  if (!isCategory(categoryValue)) {
    return errorResponse(400, "INVALID_CATEGORY", "category must be one of: all, ai, agents, robotics, drone, cv.");
  }
  if (query.length > 100) {
    return errorResponse(400, "QUERY_TOO_LONG", "q must be 100 characters or fewer.");
  }

  try {
    const result = await getTrendingRepositories(periodValue, categoryValue, query);
    return Response.json(result, {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=720, stale-while-revalidate=60",
      },
    });
  } catch (error: unknown) {
    if (error instanceof GitHubApiError) {
      const isRateLimit = error.code === "GITHUB_RATE_LIMITED";
      const resetText = error.rateLimit.retryAfterSeconds
        ? ` Try again in about ${Math.max(Math.ceil(error.rateLimit.retryAfterSeconds / 60), 1)} minute(s).`
        : error.rateLimit.resetAt
          ? ` Try again after ${new Date(error.rateLimit.resetAt).toLocaleString("en-US", { timeZone: "UTC", timeZoneName: "short" })}.`
          : " Please try again in a few minutes.";
      const body: TrendingErrorResponse = {
        error: {
          code: error.code,
          message: isRateLimit
            ? `GitHub's API rate limit has been reached.${resetText}`
            : "GitHub data is temporarily unavailable. Please try again shortly.",
          rateLimit: error.rateLimit,
        },
      };
      const headers = new Headers({ "Cache-Control": "no-store" });
      if (isRateLimit) {
        const seconds = error.rateLimit.retryAfterSeconds
          ?? (error.rateLimit.resetAt
              ? Math.max(Math.ceil((new Date(error.rateLimit.resetAt).getTime() - Date.now()) / 1_000), 1)
              : null);
        if (seconds !== null) {
          headers.set("Retry-After", String(seconds));
        }
      }
      return Response.json(body, { status: isRateLimit ? 429 : 502, headers });
    }

    return errorResponse(500, "INTERNAL_ERROR", "The trending service encountered an unexpected error.");
  }
}
