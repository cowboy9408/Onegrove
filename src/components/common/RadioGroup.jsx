export default function RadioGroup({
  name,
  options,
  label,
  required = false,
  error,
  value,
  onChange,
  className = "",
  readOnly = false,
}) {
  return (
    <div className="w-full">
      {label && (
        <p className="mb-1 block pb-2 pl-1 text-sm font-medium text-gray-800 dark:text-gray-100">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </p>
      )}
      <div
        className={`flex min-h-[48px] flex-wrap items-center gap-4 rounded-md border px-3 py-2 text-sm ${
          error
            ? "border-red-500"
            : readOnly
              ? "bg-gray-100 dark:bg-gray-800"
              : "border-gray-300 dark:border-gray-600"
        } ${className}`}
      >
        {options.map((option) => (
          <label
            key={option.value}
            className={`flex items-center gap-2 ${
              readOnly ? "cursor-default text-gray-500 dark:text-gray-400" : ""
            }`}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => {
                if (!readOnly) onChange?.(e);
              }}
              required={required}
              disabled={readOnly}
              className={`accent-black dark:accent-white ${
                readOnly ? "cursor-default" : ""
              }`}
            />
            <span className="text-sm">{option.label}</span>
          </label>
        ))}
      </div>
      {error && (
        <p className="flex items-center gap-1 pt-1 pl-1 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
