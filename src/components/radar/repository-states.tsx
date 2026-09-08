import { AlertTriangle, RefreshCw, SearchX } from "lucide-react";

export function RepositoryListSkeleton() {
  return (
    <div role="status" aria-label="Loading repositories" className="divide-y divide-white/[0.06]">
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="grid animate-pulse gap-4 px-4 py-5 sm:px-5 lg:grid-cols-[48px_minmax(0,1fr)_340px] lg:items-center lg:px-6">
          <div className="h-4 w-8 rounded bg-white/[0.06]" />
          <div className="flex gap-3.5">
            <div className="size-10 shrink-0 rounded-lg bg-white/[0.07]" />
            <div className="w-full max-w-2xl space-y-3">
              <div className="h-4 w-44 rounded bg-white/[0.08]" />
              <div className="h-3 w-4/5 rounded bg-white/[0.05]" />
              <div className="h-3 w-52 rounded bg-white/[0.05]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            <div className="h-10 rounded bg-white/[0.05]" />
            <div className="h-10 rounded bg-white/[0.05]" />
            <div className="col-span-2 h-10 rounded bg-white/[0.05] lg:col-span-1" />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading repository radar data…</span>
    </div>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div role="alert" className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-4 flex size-11 items-center justify-center rounded-xl border border-red-400/15 bg-red-400/[0.06] text-red-400">
        <AlertTriangle aria-hidden="true" className="size-5" />
      </div>
      <h2 className="text-base font-semibold text-zinc-200">Couldn&apos;t load the radar</h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3.5 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
      >
        <RefreshCw aria-hidden="true" className="size-3.5" />
        Try again
      </button>
    </div>
  );
}

interface EmptyStateProps {
  onClear: () => void;
}

export function EmptyState({ onClear }: EmptyStateProps) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-4 flex size-11 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-zinc-500">
        <SearchX aria-hidden="true" className="size-5" />
      </div>
      <h2 className="text-base font-semibold text-zinc-200">No repositories found</h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
        Try a different search or clear the active field filter.
      </p>
      <button
        type="button"
        onClick={onClear}
        className="mt-5 text-sm font-medium text-emerald-400 outline-none hover:text-emerald-300 focus-visible:rounded focus-visible:ring-2 focus-visible:ring-emerald-400/70"
      >
        Clear filters
      </button>
    </div>
  );
}
