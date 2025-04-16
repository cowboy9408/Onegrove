export default function RadioGroup({
  name,
  options,
  label,
  required = false,
  error,
  value,
  onChange,
}) {
  return (
    <div className="w-full pl-1">
      {label && (
        <p className="mb-1 block pb-2 text-sm font-medium text-gray-800 dark:text-gray-100">
          {label}
          {required && <span className="text-red-500">*</span>}
        </p>
      )}
      <div className="flex flex-wrap gap-4">
        {options.map((option) => (
          <label key={option.value} className="inline-flex items-center gap-2">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
              required={required}
              className="accent-black dark:accent-white"
            />
            <span className="text-sm text-gray-700 dark:text-gray-200">
              {option.label}
            </span>
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
