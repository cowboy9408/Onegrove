export default function Pagination({
  current = 1,
  totalPages = 1,
  onChange = () => {},
  maxVisible = 5,
}) {
  const goToPage = (page) => {
    const validPage = Math.min(Math.max(page, 1), totalPages);
    if (validPage !== current) onChange(validPage);
  };

  const startPage = Math.max(1, current - Math.floor(maxVisible / 2));
  const endPage = Math.min(totalPages, startPage + maxVisible - 1);

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="mt-6 flex items-center justify-center gap-1 text-sm">
      <button
        onClick={() => goToPage(1)}
        disabled={current === 1}
        className="rounded border px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-40 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        ≪
      </button>

      <button
        onClick={() => goToPage(current - 1)}
        disabled={current === 1}
        className="rounded border px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-40 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        &lt;
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => goToPage(page)}
          className={`rounded border px-3 py-1 ${
            page === current
              ? "bg-black font-semibold text-white dark:bg-white dark:text-black"
              : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => goToPage(current + 1)}
        disabled={current === totalPages}
        className="rounded border px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-40 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        &gt;
      </button>

      <button
        onClick={() => goToPage(totalPages)}
        disabled={current === totalPages}
        className="rounded border px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-40 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        ≫
      </button>
    </div>
  );
}
