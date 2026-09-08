import type { TrendingPeriod, TrendingRepository } from "@/types/github";
import { RepositoryCard } from "./repository-card";

interface RepositoryListProps {
  repositories: TrendingRepository[];
  period: TrendingPeriod;
}

export function RepositoryList({ repositories, period }: RepositoryListProps) {
  return (
    <div className="divide-y divide-white/[0.07]">
      {repositories.map((repository, index) => (
        <RepositoryCard key={repository.id} repository={repository} rank={index + 1} period={period} />
      ))}
    </div>
  );
}
