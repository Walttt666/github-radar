import type { TrendingCategory } from "@/types/github";

const categoryKeywords: Record<TrendingCategory, string[]> = {
  all: [],
  ai: ["AI", "machine-learning", "LLM"],
  agents: ["agent", "AI-agent"],
  robotics: ["robotics", "robot", "humanoid", "embodied-ai", "VLA"],
  drone: ["drone", "UAV", "PX4", "ArduPilot"],
  cv: ["computer-vision", "vision"],
};

export const trendingCategories = Object.keys(categoryKeywords) as TrendingCategory[];

export function getCategorySearchExpression(category: TrendingCategory): string {
  const keywords = categoryKeywords[category];
  if (keywords.length === 0) {
    return "";
  }

  return `(${keywords.join(" OR ")})`;
}

export function sanitizeSearchQuery(value: string): string {
  return value
    .trim()
    .replace(/[^\p{L}\p{N}\s._-]/gu, " ")
    .replace(/\s+/g, " ")
    .slice(0, 100);
}
