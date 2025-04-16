export default function Section({ children }) {
  return (
    <section className="relative mb-6 min-h-[calc(100vh-14rem)] rounded-md border border-gray-200 bg-white p-6 dark:border-gray-600 dark:bg-gray-700">
      {children}
    </section>
  );
}
