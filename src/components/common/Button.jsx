export default function Button({
  children,
  type = "button",
  onClick,
  className = "",
  disabled = false,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`cursor-pointer rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:bg-gray-300 dark:bg-white dark:text-black dark:hover:bg-gray-100 dark:disabled:bg-gray-600 ${className}`}
    >
      {children}
    </button>
  );
}
