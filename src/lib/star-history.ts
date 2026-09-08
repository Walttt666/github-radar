import type { GitHubStarHistoryWeek, StarHistoryPoint, TrendingPeriod } from "@/types/github";

const DAY_IN_SECONDS = 86_400;
const DAY_IN_MILLISECONDS = DAY_IN_SECONDS * 1_000;

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function daysAgoKey(now: Date, daysAgo: number): string {
  return dateKey(new Date(now.getTime() - daysAgo * DAY_IN_MILLISECONDS));
}

export function flattenStarHistory(weeks: GitHubStarHistoryWeek[], now = new Date()): StarHistoryPoint[] {
  const today = dateKey(now);
  const byDate = new Map<string, number>();

  for (const bucket of weeks) {
    bucket.days.forEach((stars, dayIndex) => {
      const date = dateKey(new Date((bucket.week + dayIndex * DAY_IN_SECONDS) * 1_000));
      if (date <= today) {
        byDate.set(date, (byDate.get(date) ?? 0) + stars);
      }
    });
  }

  return Array.from(byDate, ([date, stars]) => ({ date, stars })).sort((first, second) =>
    first.date.localeCompare(second.date),
  );
}

export function calculateStarMetrics(
  weeks: GitHubStarHistoryWeek[],
  period: TrendingPeriod,
  now = new Date(),
): {
  starsToday: number;
  starsLast7Days: number;
  starsLast30Days: number;
  starsGained: number;
  starHistory: StarHistoryPoint[];
} {
  const points = flattenStarHistory(weeks, now);
  const periodStart = {
    day: daysAgoKey(now, 0),
    week: daysAgoKey(now, 6),
    month: daysAgoKey(now, 29),
  } satisfies Record<TrendingPeriod, string>;
  const historyStart = daysAgoKey(now, 29);

  // GitHub documents that star-history week/day boundaries do not strictly
  // align with UTC. These calendar-date sums are therefore approximations,
  // not second-accurate rolling windows.
  const sumSince = (startDate: string) =>
    points.filter((point) => point.date >= startDate).reduce((total, point) => total + point.stars, 0);
  const starsToday = sumSince(periodStart.day);
  const starsLast7Days = sumSince(periodStart.week);
  const starsLast30Days = sumSince(periodStart.month);
  const gainedByPeriod = {
    day: starsToday,
    week: starsLast7Days,
    month: starsLast30Days,
  } satisfies Record<TrendingPeriod, number>;

  return {
    starsToday,
    starsLast7Days,
    starsLast30Days,
    starsGained: gainedByPeriod[period],
    starHistory: points.filter((point) => point.date >= historyStart),
  };
}
