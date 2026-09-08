export type TrendingPeriod = "day" | "week" | "month";

export type TrendingCategory = "all" | "ai" | "agents" | "robotics" | "drone" | "cv";

export type SortOption = "growth" | "stars" | "percentage";

export interface StarHistoryPoint {
  date: string;
  stars: number;
}

export interface TrendingRepository {
  id: number;
  name: string;
  fullName: string;
  url: string;
  owner: {
    login: string;
    avatarUrl: string;
  };
  description: string | null;
  language: string | null;
  license: string | null;
  topics: string[];
  createdAt: string;
  updatedAt: string;
  totalStars: number;
  forks: number;
  starsGained: number;
  growthPercent: number;
  starHistory: StarHistoryPoint[];
}

export interface TrendingMeta {
  generatedAt: string;
  period: TrendingPeriod;
  category: TrendingCategory;
  candidateCount: number;
  authenticated: boolean;
  approximate: true;
}

export interface TrendingResponse {
  repositories: TrendingRepository[];
  meta: TrendingMeta;
}

export interface RateLimitInfo {
  limit: number | null;
  remaining: number | null;
  resetAt: string | null;
  retryAfterSeconds?: number | null;
}

export interface TrendingErrorResponse {
  error: {
    code: string;
    message: string;
    rateLimit?: RateLimitInfo;
  };
}

export interface GitHubStarHistoryWeek {
  week: number;
  total: number;
  days: number[];
}

export interface GitHubSearchRepository {
  id: number;
  name: string;
  fullName: string;
  url: string;
  owner: {
    login: string;
    avatarUrl: string;
  };
  description: string | null;
  language: string | null;
  license: string | null;
  topics: string[];
  createdAt: string;
  updatedAt: string;
  totalStars: number;
  forks: number;
}
