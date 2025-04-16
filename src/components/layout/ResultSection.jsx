export default function ResultSection({ children }) {
  return (
    <section
      aria-label="결과 영역"
      className="relative mb-6 rounded-md border border-gray-200 bg-white p-6 dark:border-gray-600 dark:bg-gray-700"
    >
      <span className="absolute -top-2 left-2.5 mb-1 bg-transparent px-1 text-xs text-black transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-gray-800 dark:text-white dark:peer-placeholder-shown:text-gray-500 dark:peer-focus:text-gray-100">
        결과
      </span>
      {children}
    </section>
  );
}
