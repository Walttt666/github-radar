import { Search } from "lucide-react";
import type { SortOption, TrendingCategory, TrendingPeriod } from "@/types/github";

const timeOptions: Array<{ value: TrendingPeriod; label: string }> = [
  { value: "day", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
];

const categoryOptions: Array<{ value: TrendingCategory; label: string }> = [
  { value: "all", label: "All" },
  { value: "ai", label: "AI" },
  { value: "agents", label: "Agents" },
  { value: "robotics", label: "Robotics" },
  { value: "drone", label: "Drone" },
  { value: "cv", label: "Computer Vision" },
];

const sortOptions: Array<{ value: SortOption; label: string }> = [
  { value: "growth", label: "Star Growth" },
  { value: "stars", label: "Total Stars" },
  { value: "percentage", label: "Growth %" },
];

interface RadarFiltersProps {
  period: TrendingPeriod;
  category: TrendingCategory;
  sort: SortOption;
  query: string;
  onPeriodChange: (period: TrendingPeriod) => void;
  onCategoryChange: (category: TrendingCategory) => void;
  onSortChange: (sort: SortOption) => void;
  onQueryChange: (query: string) => void;
}

function OptionButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 ${
        active
          ? "bg-zinc-100 text-zinc-950 shadow-sm"
          : "text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-200"
      }`}
    >
      {children}
    </button>
  );
}

export function RadarFilters({
  period,
  category,
  sort,
  query,
  onPeriodChange,
  onCategoryChange,
  onSortChange,
  onQueryChange,
}: RadarFiltersProps) {
  return (
    <section aria-label="Repository filters" className="rounded-xl border border-white/[0.08] bg-[#0d1014]">
      <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[auto_1fr_auto] lg:items-end lg:gap-7">
        <fieldset className="min-w-0">
          <legend className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-zinc-600">Time</legend>
          <div className="flex w-fit rounded-lg border border-white/[0.08] bg-black/20 p-1">
            {timeOptions.map((option) => (
              <OptionButton
                key={option.value}
                active={period === option.value}
                onClick={() => onPeriodChange(option.value)}
              >
                {option.label}
              </OptionButton>
            ))}
          </div>
        </fieldset>

        <fieldset className="min-w-0">
          <legend className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-zinc-600">Field</legend>
          <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categoryOptions.map((option) => (
              <OptionButton
                key={option.value}
                active={category === option.value}
                onClick={() => onCategoryChange(option.value)}
              >
                {option.label}
              </OptionButton>
            ))}
          </div>
        </fieldset>

        <label className="block min-w-0 lg:w-44">
          <span className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-zinc-600">Sort by</span>
          <select
            value={sort}
            onChange={(event) => onSortChange(event.target.value as SortOption)}
            className="h-9 w-full rounded-lg border border-white/[0.08] bg-black/20 px-3 text-sm font-medium text-zinc-300 outline-none transition-colors hover:border-white/15 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/15"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-zinc-950">
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="border-t border-white/[0.07] p-4 sm:px-5">
        <label className="relative block">
          <span className="sr-only">Search repositories</span>
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-600" />
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            maxLength={100}
            placeholder="Search repositories..."
            className="h-10 w-full rounded-lg border border-white/[0.08] bg-black/20 pl-10 pr-4 text-sm text-zinc-200 outline-none transition-colors placeholder:text-zinc-600 hover:border-white/15 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/15"
          />
        </label>
      </div>
    </section>
  );
}
