import { LoadingState } from "@/components/shared/loading-state";

export default function SearchLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <LoadingState variant="skeleton-grid" />
    </div>
  );
}
