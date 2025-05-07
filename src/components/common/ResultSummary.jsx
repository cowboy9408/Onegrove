export default function ResultSummary({ total = 0 }) {
  return (
    <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
      총{" "}
      <span className="font-semibold text-gray-800 dark:text-gray-100">
        {total}
      </span>
      건
    </div>
  );
}
