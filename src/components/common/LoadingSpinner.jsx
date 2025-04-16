import { useLoadingStore } from "@/store/loadingStore";

export default function LoadingSpinner() {
  const isLoading = useLoadingStore((state) => state.isLoading);

  if (!isLoading) return null;

  return (
    <div className="bg-opacity-30 fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-600 border-t-transparent dark:border-gray-300 dark:border-t-transparent" />
    </div>
  );
}
