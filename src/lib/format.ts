import type { TrendingPeriod } from "@/types/github";

const compactNumberFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const integerFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

const percentageFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const compactPercentageFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatStars(value: number): string {
  return compactNumberFormatter.format(value).toLowerCase();
}

export function formatStarGain(value: number): string {
  return `+${integerFormatter.format(value)}`;
}

export function formatPercentage(value: number): string {
  return `+${percentageFormatter.format(value)}%`;
}

export function formatCompactPercentage(value: number): string {
  if (Math.abs(value) < 10_000) {
    return formatPercentage(value);
  }

  return `+${compactPercentageFormatter.format(value)}%`;
}

export const periodLabels: Record<TrendingPeriod, string> = {
  day: "today",
  week: "this week",
  month: "this month",
};

const languageColors: Record<string, string> = {
  C: "#555555",
  "C#": "#178600",
  "C++": "#f34b7d",
  Go: "#00add8",
  Java: "#b07219",
  JavaScript: "#f1e05a",
  Jupyter: "#da5b0b",
  Kotlin: "#a97bff",
  Python: "#3572a5",
  Rust: "#dea584",
  Swift: "#f05138",
  TypeScript: "#3178c6",
};

export function getLanguageColor(language: string | null): string {
  return language ? (languageColors[language] ?? "#71717a") : "#52525b";
}

export function formatRelativeTime(value: string): string {
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) {
    return "recently";
  }

  const seconds = Math.round((timestamp - Date.now()) / 1_000);
  const formatter = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" });
  if (Math.abs(seconds) < 60) {
    return "just now";
  }
  const minutes = Math.round(seconds / 60);
  if (Math.abs(minutes) < 60) {
    return formatter.format(minutes, "minute");
  }
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) {
    return formatter.format(hours, "hour");
  }
  const days = Math.round(hours / 24);
  return formatter.format(days, "day");
}
